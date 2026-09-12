// AI 에이전트(페르소나 · 에이전트 토큰) 데이터 레이어 — 게이트웨이 경유 agent-service 관리 API.
//
// 인증: tokensStore·adminStore 와 같이 authClient.apiFetch 를 그대로 쓴다(Bearer 자동 첨부 +
// 401 이면 1회 refresh 후 재시도 + credentials: 'include'). 여기 있는 API 는 세션 JWT 전용이다 —
// 게이트웨이가 `/api/agent/**` 를 PAT `admin` 스코프로만 열어 두지만(PatScopeRules), 관리 화면은
// 브라우저 세션으로만 들어온다.
//
// 계약(정본 = agent-service 컨트롤러. `docs/api-reference/agent/` 는 아직 없다):
//   GET    /api/agent/personas      → PersonaResponse[]   (인증만 있으면 조회 가능)
//   POST   /api/agent/personas      → 201 신규 / 200 기존 슬러그 갱신, PersonaResponse (ROLE_ADMIN)
//   GET    /api/agent/tokens        → PatSummaryResponse[] (해시·원문 없음, 전체 목록)
//   POST   /api/agent/tokens        → 201 PatCreatedResponse (원문 token 은 이 응답에만, ROLE_ADMIN)
//   DELETE /api/agent/tokens/{id}   → 204 (멱등, ROLE_ADMIN)
//
// 오류 계약은 common-starter 의 `{"error": "한국어 메시지"}` 다. 게이트웨이·인증만 기계 코드를 준다.

import { authClient } from '../../auth';

/* ────────────────────────── 도메인 타입 ────────────────────────── */

/** agent-service `PersonaRole` — 하네스 6롤과 같다. */
export const PERSONA_ROLES = ['PLANNER', 'DESIGNER', 'FRONTEND', 'BACKEND', 'OPS', 'REVIEWER'] as const;
export type PersonaRole = (typeof PERSONA_ROLES)[number];

export const PERSONA_ROLE_LABEL: Record<PersonaRole, string> = {
  PLANNER: '기획',
  DESIGNER: '디자이너',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  OPS: '운영',
  REVIEWER: '리뷰',
};

/**
 * `PersonaResponse` 를 화면용으로 옮긴 것. id·memberId 는 백엔드가 Long 이지만 프론트에서는
 * 항상 string 으로 들고 다닌다(경계 매퍼에서만 변환).
 */
export interface Persona {
  id: string;
  /** auth-server 가 만든 페르소나 사용자 id. 아직 없으면 null. */
  memberId: string | null;
  slug: string;
  /** 서버가 새 역할을 추가해도 화면이 깨지지 않게 문자열도 허용한다. */
  role: PersonaRole | string;
  name: string;
  emoji: string | null;
  active: boolean;
}

/** `PatSummaryResponse` — 토큰 해시·원문은 절대 담기지 않는다. */
export interface AgentToken {
  id: string;
  label: string;
  /** 페르소나가 사라진 토큰은 null 로 온다(서버가 slug 를 못 찾는 경우). */
  personaSlug: string | null;
  createdAt: string | null; // ISO
  expiresAt: string | null; // ISO, null 이면 만료 없음
  lastUsedAt: string | null; // ISO
  revoked: boolean;
}

export interface PersonaGrantInput {
  resourceType: 'GLOBAL' | 'SPACE' | 'PROJECT';
  /** agent-service 가 @NotBlank 로 막아 GLOBAL 이라도 비워 둘 수 없다. */
  resourceId: string;
  role: 'VIEWER' | 'COMMENTER' | 'EDITOR' | 'ADMIN';
}

export interface PersonaCreateInput {
  slug: string;
  role: PersonaRole;
  name: string;
  emoji?: string;
  voicePrompt?: string;
  /** 비우면 서버가 `agents+{slug}@platform.local` 로 만든다. */
  email?: string;
  grants?: PersonaGrantInput[];
}

/** 201(신규 부트스트랩) 과 200(기존 슬러그 표시 필드만 갱신) 을 구분해 안내 문구를 바꾼다. */
export interface PersonaCreateResult {
  persona: Persona;
  created: boolean;
}

export interface AgentTokenCreateInput {
  label: string;
  personaSlug: string;
  /** null 이면 만료 없음(서버가 expiresAt 을 비워 둔다). */
  expiresInDays: number | null;
}

/** 발급 응답 — 원문 `token` 은 이 응답에만 실린다. */
export interface CreatedAgentToken {
  id: string;
  label: string;
  personaSlug: string | null;
  token: string;
}

/* ────────────────────────── 서버와 맞춘 상한값 ────────────────────────── */

/** 에이전트 토큰 원문의 고정 접두사(PatService.TOKEN_PREFIX). */
export const AGENT_TOKEN_PREFIX = 'agp_';

/** `PersonaCreateRequest` 의 @Pattern·@Size 와 같은 값 — 서버가 400 을 내기 전에 폼에서 막는다. */
export const SLUG_PATTERN = /^[a-z0-9-]{2,40}$/;
export const SLUG_MAX = 40;
export const NAME_MAX = 80;
export const EMOJI_MAX = 16;
/** `PatCreateRequest.label` 의 @Size. */
export const TOKEN_LABEL_MAX = 120;

/** 만료 임박으로 볼 남은 일수(개인 토큰 화면과 같은 기준). */
export const EXPIRING_SOON_DAYS = 7;

/* ────────────────────────── 오류 ────────────────────────── */

/** 상태코드 + 서버 오류 코드를 들고 다니는 에러 — 화면에서 403/404/409 를 구분한다. */
export class AgentApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AgentApiError';
  }
}

/** 게이트웨이·인증이 주는 기계 코드 → 한국어. 제품 서비스는 이미 한국어 문장을 준다. */
const ERROR_MESSAGES: Record<string, string> = {
  forbidden: '전역 관리자만 에이전트를 관리할 수 있습니다.',
  invalid_token: '인증이 만료되었습니다. 다시 로그인해 주세요.',
  insufficient_scope: '이 토큰에는 필요한 스코프가 없습니다.',
  org_unavailable: '권한 서비스(org)에 연결할 수 없습니다.',
  auth_unavailable: '인증 서버에 연결할 수 없습니다.',
};

/**
 * 실패 응답을 AgentApiError 로 바꾼다. 본문이 JSON 이 아니거나 비어 있어도(프록시 오류·타임아웃)
 * 던지지 않고 상태코드 기반 메시지로 떨어진다.
 */
async function toApiError(res: Response, fallback: string): Promise<AgentApiError> {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
      const raw = (body as { error: string }).error;
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
  if (message) return new AgentApiError(res.status, message, code);
  if (res.status === 401) return new AgentApiError(401, '로그인이 필요합니다. 다시 로그인해 주세요.');
  if (res.status === 403) return new AgentApiError(403, '전역 관리자만 에이전트를 관리할 수 있습니다.');
  if (res.status === 404) {
    return new AgentApiError(404, '에이전트 서비스가 아직 배포되지 않았거나 대상이 없습니다.');
  }
  if (res.status >= 500) {
    return new AgentApiError(res.status, '에이전트 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }
  return new AgentApiError(res.status, fallback);
}

/* ────────────────────────── 경계 매퍼 ────────────────────────── */

/** 백엔드 Long → 화면용 string. null/undefined 는 그대로 null 로 남긴다. */
function idToString(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim() !== '') return value;
  return null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

function toPersona(raw: unknown): Persona | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = idToString(r.id);
  if (id === null) return null; // id 없는 행은 표에 키가 없어 그릴 수 없다.
  return {
    id,
    memberId: idToString(r.memberId),
    slug: text(r.slug),
    role: text(r.role),
    name: text(r.name),
    emoji: nullableText(r.emoji),
    active: r.active !== false, // 서버가 필드를 빼면 활성으로 본다(비활성 표시가 거짓이 되지 않게).
  };
}

function toAgentToken(raw: unknown): AgentToken | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = idToString(r.id);
  if (id === null) return null;
  return {
    id,
    label: text(r.label),
    personaSlug: nullableText(r.personaSlug),
    createdAt: nullableText(r.createdAt),
    expiresAt: nullableText(r.expiresAt),
    lastUsedAt: nullableText(r.lastUsedAt),
    revoked: r.revoked === true,
  };
}

/* ────────────────────────── 호출 ────────────────────────── */

/** 페르소나 목록. 서버가 정렬을 보장하지 않아 슬러그순으로 세운다. */
export async function listPersonas(): Promise<Persona[]> {
  const res = await authClient.apiFetch('/api/agent/personas');
  if (!res.ok) throw await toApiError(res, '페르소나 목록을 불러오지 못했습니다.');
  const body: unknown = await res.json();
  const items = Array.isArray(body) ? body : [];
  return items
    .map(toPersona)
    .filter((p): p is Persona => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
}

/**
 * 페르소나 부트스트랩. 이미 있는 슬러그면 서버가 200 과 함께 표시 필드(이름·이모지·보이스
 * 프롬프트)만 갱신한다 — 이때 grants 는 다시 부여되지 않는다(멱등, PersonaService.bootstrap).
 */
export async function createPersona(input: PersonaCreateInput): Promise<PersonaCreateResult> {
  const payload: Record<string, unknown> = {
    slug: input.slug,
    role: input.role,
    name: input.name,
  };
  if (input.emoji) payload.emoji = input.emoji;
  if (input.voicePrompt) payload.voicePrompt = input.voicePrompt;
  if (input.email) payload.email = input.email;
  if (input.grants && input.grants.length > 0) payload.grants = input.grants;

  const res = await authClient.apiFetch('/api/agent/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toApiError(res, '페르소나를 만들지 못했습니다.');
  const persona = toPersona(await res.json());
  if (!persona) throw new AgentApiError(res.status, '서버 응답을 이해하지 못했습니다.');
  return { persona, created: res.status === 201 };
}

/** 전체 에이전트 토큰 목록(발급 최신순). 화면이 페르소나별로 나눠 쓴다. */
export async function listAgentTokens(): Promise<AgentToken[]> {
  const res = await authClient.apiFetch('/api/agent/tokens');
  if (!res.ok) throw await toApiError(res, '에이전트 토큰 목록을 불러오지 못했습니다.');
  const body: unknown = await res.json();
  const items = Array.isArray(body) ? body : [];
  return items
    .map(toAgentToken)
    .filter((t): t is AgentToken => t !== null)
    .sort((a, b) => (Date.parse(b.createdAt ?? '') || 0) - (Date.parse(a.createdAt ?? '') || 0));
}

/** 토큰 발급. 응답의 `token` 은 호출자가 한 번만 보여주고 버려야 한다. */
export async function createAgentToken(input: AgentTokenCreateInput): Promise<CreatedAgentToken> {
  const payload: Record<string, unknown> = {
    label: input.label,
    personaSlug: input.personaSlug,
  };
  // 서버는 @Positive Integer 라 null 을 "만료 없음"으로 읽는다 — 0 이나 빈 문자열을 보내면 400.
  if (input.expiresInDays !== null) payload.expiresInDays = input.expiresInDays;

  const res = await authClient.apiFetch('/api/agent/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toApiError(res, '토큰을 발급하지 못했습니다.');
  const raw: unknown = await res.json();
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const token = text(r.token);
  if (!token) throw new AgentApiError(res.status, '서버가 토큰 원문을 주지 않았습니다.');
  return {
    id: idToString(r.id) ?? '',
    label: text(r.label),
    personaSlug: nullableText(r.personaSlug),
    token,
  };
}

/** 토큰 폐기(204). 서버가 멱등이라 이미 폐기된 토큰도 성공으로 돌아온다. */
export async function revokeAgentToken(id: string): Promise<void> {
  const res = await authClient.apiFetch(`/api/agent/tokens/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, '토큰을 폐기하지 못했습니다.');
}

/* ────────────────────────── 표시용 계산 ────────────────────────── */

export type AgentTokenStatus = 'active' | 'expiring' | 'expired' | 'revoked';

/**
 * 목록 행의 표시 상태. 서버는 `revoked` 만 주므로 만료는 시각으로 계산한다.
 * `expiresAt` 이 없으면(만료 없음) 활성이고, 깨진 값도 만료로 몰지 않는다 —
 * 폐기 버튼을 잘못 잠그지 않기 위해서다(개인 토큰 화면과 같은 규칙).
 */
export function agentTokenStatus(token: AgentToken, now: number = Date.now()): AgentTokenStatus {
  if (token.revoked) return 'revoked';
  if (!token.expiresAt) return 'active';
  const expires = Date.parse(token.expiresAt);
  if (Number.isNaN(expires)) return 'active';
  if (expires <= now) return 'expired';
  if (expires - now <= EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000) return 'expiring';
  return 'active';
}

/** ISO → `2026. 9. 12.`. 값이 없거나 깨졌으면 대시(Invalid Date 방지). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleDateString('ko-KR');
}

/** 슬러그 입력 검증 — 서버 @Pattern 과 같은 규칙. */
export function slugError(slug: string): string | null {
  if (!slug.trim()) return '슬러그를 입력해 주세요.';
  if (!SLUG_PATTERN.test(slug)) return '슬러그는 소문자·숫자·하이픈 2~40자여야 합니다.';
  return null;
}
