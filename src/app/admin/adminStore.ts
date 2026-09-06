// 관리자 대시보드 데이터 레이어 — 게이트웨이 경유 플랫폼/제품 관리 API 호출.
//
// 인증: tokensStore 와 같이 authClient.apiFetch 를 그대로 쓴다(Bearer 자동 첨부 + 401 이면
// 1회 refresh 후 재시도 + credentials: 'include'). 여기 있는 API 는 전부 세션 JWT 전용이다 —
// `/api/platform/**` 는 PAT 로는 `admin` 스코프가 있어도 접근할 수 없다(관리 화면 전용).
//
// 계약: docs/superpowers/specs/2026-09-06-admin-dashboard-and-token-scopes-design.md §2·§4·§5.1
//   GET /api/org/me                 → MeResponse (globalRoles 에 ADMIN 이 있으면 전역 관리자)
//   GET /api/platform/health        → PlatformHealth  (20초 서버 캐시)
//   GET /api/platform/stats/tokens  → TokenStats      (60초 서버 캐시)
//   GET /api/wiki/admin/stats       → WikiStats
//   GET /api/alm/admin/stats        → AlmStats
//   GET /api/org/admin/stats        → OrgStats
//   GET /api/alm/admin/audit        → AuditPageResponse
//   GET /api/wiki/audit/space-deletions → AuditEntry[]  (위키의 유일한 전역 감사 경로)
//
// 부하 원칙(§0): 헬스만 60초 폴링하고 통계는 진입 1회 + 수동 새로고침이다. 폴링은 화면이
// 담당하며(document.hidden 이면 중단) 이 모듈은 단순 호출자로 남는다.

import * as React from 'react';
import { authClient } from '../../auth';

/* ────────────────────────── 오류 ────────────────────────── */

/** 상태코드 + 서버 오류 코드를 들고 다니는 에러 — 카드마다 403/503 을 구분해 보여 준다. */
export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

/** 게이트웨이·서비스가 주는 기계 코드 → 한국어 메시지. */
const ERROR_MESSAGES: Record<string, string> = {
  forbidden: '전역 관리자만 볼 수 있습니다.',
  org_unavailable: '권한 서비스(org)에 연결할 수 없어 관리자 여부를 확인하지 못했습니다.',
  auth_unavailable: '인증 서버에 연결할 수 없습니다.',
  invalid_token: '인증이 만료되었습니다. 다시 로그인해 주세요.',
  insufficient_scope: '이 토큰에는 필요한 스코프가 없습니다.',
};

/**
 * 실패 응답을 AdminApiError 로 바꾼다. 본문이 JSON 이 아니거나 비어 있어도(프록시 오류·타임아웃)
 * 던지지 않고 상태코드 기반 메시지로 떨어진다.
 */
async function toApiError(res: Response, fallback: string): Promise<AdminApiError> {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
      const raw = (body as { error: string }).error;
      // 게이트웨이/인증은 기계 코드를, 제품 서비스는 한국어 문장을 준다(30-errors.md).
      if (ERROR_MESSAGES[raw]) {
        code = raw;
        message = ERROR_MESSAGES[raw];
      } else {
        message = raw;
      }
    }
  } catch {
    // 본문 없음/비 JSON — 아래 상태코드 분기로 충분하다.
  }
  if (message) return new AdminApiError(res.status, message, code);
  if (res.status === 401) return new AdminApiError(401, '로그인이 필요합니다. 다시 로그인해 주세요.');
  if (res.status === 403) return new AdminApiError(403, '전역 관리자만 볼 수 있습니다.');
  if (res.status === 404) return new AdminApiError(404, '아직 제공되지 않는 API입니다.');
  if (res.status >= 500) {
    return new AdminApiError(res.status, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }
  return new AdminApiError(res.status, fallback);
}

/** GET 후 JSON 파싱. 실패는 전부 AdminApiError 로 통일한다. */
async function getJson<T>(path: string, fallback: string): Promise<T> {
  const res = await authClient.apiFetch(path);
  if (!res.ok) throw await toApiError(res, fallback);
  return (await res.json()) as T;
}

/* ────────────────────────── 관리자 판정 ────────────────────────── */

export interface OrgTeamMembership {
  id: number;
  name: string;
  kind: 'STANDARD' | 'EVERYONE';
  role: 'LEAD' | 'MEMBER';
}

/** `GET /api/org/me` 응답(docs/api-reference/org/me.md). */
export interface OrgMe {
  id: number;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  avatarUpdatedAt: string | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  kind: 'HUMAN' | 'AGENT';
  joinedVia: 'INVITE' | 'APPROVAL' | 'BOOTSTRAP' | 'LEGACY';
  globalRoles: string[];
  teams: OrgTeamMembership[];
}

/** 관리자 판정 결과. 실패해도 화면은 떠야 하므로 오류는 값으로 들고 다닌다. */
export interface AdminIdentity {
  me: OrgMe | null;
  isGlobalAdmin: boolean;
  /** 판정에 실패한 사유(있으면 비관리자로 다루되 사이드 메뉴 라벨 등은 조용히 기본값). */
  error: string | null;
}

// 세션당 1회. 라우팅·사이드 메뉴·브레드크럼이 각각 물어보므로 in-flight 를 공유한다.
let identityPromise: Promise<AdminIdentity> | null = null;

/** `GET /api/org/me`. 실패는 던지지 않고 비관리자 + error 로 돌려준다. */
export function fetchAdminIdentity(): Promise<AdminIdentity> {
  if (identityPromise) return identityPromise;
  identityPromise = (async (): Promise<AdminIdentity> => {
    try {
      const me = await getJson<OrgMe>('/api/org/me', '내 정보를 불러오지 못했습니다.');
      const roles = Array.isArray(me?.globalRoles) ? me.globalRoles : [];
      return { me, isGlobalAdmin: roles.includes('ADMIN'), error: null };
    } catch (e: unknown) {
      // 판정 실패는 비관리자로 떨어진다(§5.1). 다음 진입에서 다시 시도할 수 있게 캐시를 비운다.
      identityPromise = null;
      const message = e instanceof Error ? e.message : '내 정보를 불러오지 못했습니다.';
      return { me: null, isGlobalAdmin: false, error: message };
    }
  })();
  return identityPromise;
}

/** 로그아웃·계정 전환 시 캐시를 버린다. */
export function resetAdminIdentity(): void {
  identityPromise = null;
}

/**
 * 관리자 판정 훅. 판정 전에는 `loading` 이 true 라 화면을 섣불리 비관리자용으로 그리지 않는다.
 */
export function useAdminIdentity(): AdminIdentity & { loading: boolean } {
  const [state, setState] = React.useState<AdminIdentity | null>(null);

  React.useEffect(() => {
    let alive = true;
    void fetchAdminIdentity().then((identity) => {
      if (alive) setState(identity);
    });
    return () => {
      alive = false;
    };
  }, []);

  return {
    me: state?.me ?? null,
    isGlobalAdmin: state?.isGlobalAdmin ?? false,
    error: state?.error ?? null,
    loading: state === null,
  };
}

/* ────────────────────────── 플랫폼 헬스 ────────────────────────── */

export type ComponentStatus = 'UP' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';

export interface HealthComponent {
  id: string;
  name: string;
  group: 'service' | 'infra';
  status: ComponentStatus;
  latencyMs?: number | null;
  version?: string | null;
  detail?: string | null;
}

export interface PlatformHealth {
  checkedAt: string; // ISO
  cacheTtlSeconds: number;
  components: HealthComponent[];
}

/** `GET /api/platform/health` — 게이트웨이가 20초 캐시로 집계한 결과. */
export async function fetchPlatformHealth(): Promise<PlatformHealth> {
  const body = await getJson<PlatformHealth>('/api/platform/health', '플랫폼 상태를 불러오지 못했습니다.');
  // 백엔드가 아직 components 를 안 줄 수도 있다 — 화면이 map 에서 깨지지 않게 배열을 보장한다.
  return {
    checkedAt: body?.checkedAt ?? '',
    cacheTtlSeconds: typeof body?.cacheTtlSeconds === 'number' ? body.cacheTtlSeconds : 20,
    components: Array.isArray(body?.components) ? body.components : [],
  };
}

/* ────────────────────────── 현황 통계 ────────────────────────── */

/** `GET /api/platform/stats/tokens` (auth-server `/internal/pat/stats` 중계). */
export interface TokenStats {
  activeTokens: number;
  usersWithTokens: number;
  expiringWithin7Days: number;
}

/** `GET /api/wiki/admin/stats`. */
export interface WikiStats {
  spaces: number;
  pages: number;
  draftPages: number;
  trashedPages: number;
  revisions: number;
  attachments: number;
  attachmentBytes: number;
  editsLast7Days: number;
  comments: number;
}

/**
 * `GET /api/alm/admin/stats` — 필드는 레퍼런스(docs/api-reference/alm/admin.md, SystemStatsResponse)
 * 기준이다. 감사 로그 수의 실제 이름은 `auditEntries` 다(설계 문서의 "감사 로그" 표기와 다름).
 */
export interface AlmStats {
  projects: number;
  issues: number;
  attachments: number;
  attachmentBytes: number;
  auditEntries: number;
}

/** `GET /api/org/admin/stats`. */
export interface OrgStats {
  members: {
    ACTIVE?: number;
    PENDING?: number;
    SUSPENDED?: number;
    DEACTIVATED?: number;
  };
  agents: number;
  teams: number;
  pendingInvitations: number;
}

export function fetchTokenStats(): Promise<TokenStats> {
  return getJson<TokenStats>('/api/platform/stats/tokens', '토큰 현황을 불러오지 못했습니다.');
}

export function fetchWikiStats(): Promise<WikiStats> {
  return getJson<WikiStats>('/api/wiki/admin/stats', 'WIKI 현황을 불러오지 못했습니다.');
}

export function fetchAlmStats(): Promise<AlmStats> {
  return getJson<AlmStats>('/api/alm/admin/stats', 'ALM 현황을 불러오지 못했습니다.');
}

export function fetchOrgStats(): Promise<OrgStats> {
  return getJson<OrgStats>('/api/org/admin/stats', '조직 현황을 불러오지 못했습니다.');
}

/* ────────────────────────── 최근 활동 ────────────────────────── */

/** ALM 감사 1건(`AuditLogResponse`). */
interface AlmAuditLog {
  id: number;
  eventType: string;
  actorId: number | null;
  projectId: number | null;
  targetKey: string | null;
  summary: string | null;
  occurredAt: string; // ISO
}

interface AlmAuditPage {
  items: AlmAuditLog[];
  page: number;
  size: number;
  total: number;
}

/** 위키 감사 1건(`AuditEntry`) — createdAt 은 레퍼런스상 date-time 이 아닌 문자열이다. */
interface WikiAuditEntry {
  id: number;
  action: string;
  actorId: number | null;
  createdAt: string;
  detail: string | null;
  targetId: number | null;
  targetLabel: string | null;
  targetType: string | null;
}

/** 두 제품의 감사를 하나로 합친 표시용 항목. */
export interface ActivityItem {
  key: string;
  source: 'WIKI' | 'ALM';
  action: string;
  target: string;
  detail: string;
  occurredAt: string; // ISO 또는 빈 문자열
  actorId: number | null;
}

/**
 * ALM 감사 최근 n건. 파라미터는 레퍼런스(docs/api-reference/alm/admin.md) 기준으로 `page`·`size`.
 */
export async function fetchAlmActivity(size = 20): Promise<ActivityItem[]> {
  const body = await getJson<AlmAuditPage>(
    `/api/alm/admin/audit?page=0&size=${size}`,
    'ALM 활동 기록을 불러오지 못했습니다.',
  );
  const items = Array.isArray(body?.items) ? body.items : [];
  return items.map((it) => ({
    key: `alm-${it.id}`,
    source: 'ALM' as const,
    action: it.eventType ?? '',
    target: it.targetKey ?? (it.projectId != null ? `프로젝트 #${it.projectId}` : ''),
    detail: it.summary ?? '',
    occurredAt: it.occurredAt ?? '',
    actorId: it.actorId ?? null,
  }));
}

/**
 * 위키의 전역 감사. 현재 전역 관리자가 볼 수 있는 위키 감사 경로는 스페이스 삭제 기록뿐이라
 * (`/api/wiki/audit/space-deletions`, 페이지네이션 없음) 그것만 모은다. 스페이스별 감사
 * (`/api/wiki/spaces/{id}/audit`)는 스페이스 ADMIN 전용이라 대시보드에서 전역으로 쓸 수 없다.
 */
export async function fetchWikiActivity(): Promise<ActivityItem[]> {
  const body = await getJson<WikiAuditEntry[]>(
    '/api/wiki/audit/space-deletions',
    '위키 활동 기록을 불러오지 못했습니다.',
  );
  const items = Array.isArray(body) ? body : [];
  return items.map((it) => ({
    key: `wiki-${it.id}`,
    source: 'WIKI' as const,
    action: it.action ?? '',
    target: it.targetLabel ?? (it.targetId != null ? `#${it.targetId}` : ''),
    detail: it.detail ?? '',
    occurredAt: it.createdAt ?? '',
    actorId: it.actorId ?? null,
  }));
}
