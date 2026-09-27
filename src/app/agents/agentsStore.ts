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
//   GET    /api/agent/runners       → RunnerResponse[] (projectId 없이 = 전역 관리자 전체, PLATFORM 포함 — P4a)
//   POST   /api/agent/runners       → 201 {…, token}(원문 agr_ 은 이 응답에만) · projectId null = 전역 러너
//   DELETE /api/agent/runners/{id}  → 204 (멱등, PLATFORM 은 409)
//
// 오류 계약은 common-starter 의 `{"error": "한국어 메시지"}` 다. 게이트웨이·인증만 기계 코드를 준다.

import { authClient } from '../../auth';

/* ────────────────────────── 도메인 타입 ────────────────────────── */

/** agent-service `PersonaRole` — 하네스 6롤과 같다. */
// MANAGER: P3c 관리 에이전트(agent-service PersonaRole과 동기 — 보드 순찰·보고, 실무 안 함)
export const PERSONA_ROLES = ['PLANNER', 'DESIGNER', 'FRONTEND', 'BACKEND', 'OPS', 'REVIEWER', 'MANAGER'] as const;
export type PersonaRole = (typeof PERSONA_ROLES)[number];

export const PERSONA_ROLE_LABEL: Record<PersonaRole, string> = {
  PLANNER: '기획',
  DESIGNER: '디자이너',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  OPS: '운영',
  REVIEWER: '리뷰',
  MANAGER: '매니저',
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

/** 토큰 종류(P4a D-P4-3b) — HUMAN = 사람이 발급한 토큰, RUN = run 마다 시스템이 발급하고 종료 시 철회하는 임시 토큰. */
export type AgentTokenKind = 'HUMAN' | 'RUN';

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
  /** P4a 이전 서버는 필드가 없다 — HUMAN 으로 본다. */
  kind: AgentTokenKind;
  /** 무기한 사람용 토큰 — 화면이 경고를 단다. */
  noExpiry: boolean;
  /** 서버 판정 7일 안 만료. */
  expiringSoon: boolean;
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
  /**
   * 1~365. null 이면 무기한 — P4a 부터 서버는 expiresInDays 를 생략하면 90일이므로 무기한은
   * `noExpiry: true` 로 명시한다(전역 관리자만, 이 화면은 전역 관리자 전용).
   */
  expiresInDays: number | null;
}

/** 발급 응답 — 원문 `token` 은 이 응답에만 실린다. */
export interface CreatedAgentToken {
  id: string;
  label: string;
  personaSlug: string | null;
  token: string;
  /** 서버가 준 만료 시각(무기한이면 null). 구 서버처럼 필드가 없으면 undefined. */
  expiresAt?: string | null;
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
    kind: r.kind === 'RUN' ? 'RUN' : 'HUMAN',
    noExpiry: r.noExpiry === true,
    expiringSoon: r.expiringSoon === true,
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
  // P4a(D-P4-3b): 생략하면 서버 기본 90일, 무기한은 noExpiry 로만 — 둘을 함께 보내면 400.
  if (input.expiresInDays === null) payload.noExpiry = true;
  else payload.expiresInDays = input.expiresInDays;

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
    ...('expiresAt' in r ? { expiresAt: nullableText(r.expiresAt) } : {}),
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

/* ────────────────────────── 러너(P4a AGP-69) ────────────────────────── */

// 러너 = 사용자 PC(LOCAL) 또는 플랫폼 러너 컨테이너(PLATFORM)가 AI 직원 작업을 대신 실행하는 프로그램.
// 이 화면(전역 관리자)은 projectId 없이 조회해 PLATFORM 포함 전체를 보고, 전역 LOCAL 러너(projectId null)를 발급한다.
// 프로젝트 러너 발급·실행 위치 설정은 ALM 프로젝트 설정 "AI 팀" 몫이다.

export type RunnerKind = 'PLATFORM' | 'LOCAL';
export type RunnerStatus = 'ONLINE' | 'OFFLINE' | 'NEVER_CONNECTED' | 'REVOKED';

export interface Runner {
  id: string;
  kind: RunnerKind;
  name: string;
  /** null = 플랫폼 전역 */
  projectId: string | null;
  tokenPrefix: string | null;
  createdAt: string | null;
  lastHeartbeatAt: string | null;
  version: string | null;
  os: string | null;
  maxConcurrency: number | null;
  status: RunnerStatus;
  currentRunIds: string[];
}

export interface CreatedRunner {
  id: string;
  name: string;
  token: string;
}

/** 러너 jar 최신 릴리스(러너 CI 가 `runner-latest` 태그에 올린다). */
export const RUNNER_JAR_URL =
  'https://github.com/chanho4702/agent-service/releases/download/runner-latest/agent-runner.jar';
export const RUNNER_NAME_MAX = 80;

/** 러너 실행 명령(PowerShell) — 서버 주소는 지금 보고 있는 플랫폼(nginx 앞단). 토큰은 env로(명령행 인자는 다른 프로세스 목록에 보인다 — 러너도 경고한다) */
export function runnerCommand(token: string, origin: string = window.location.origin): string {
  return `$env:RUNNER_TOKEN="${token}"; java -jar agent-runner.jar --server ${origin}`;
}

const RUNNER_STATUSES: readonly RunnerStatus[] = ['ONLINE', 'OFFLINE', 'NEVER_CONNECTED', 'REVOKED'];

function toRunner(raw: unknown): Runner | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = idToString(r.id);
  if (id === null) return null;
  const lastHeartbeatAt = nullableText(r.lastHeartbeatAt);
  // 모르는 상태를 온라인으로 보이지 않게 — 철회 시각·heartbeat 로 다시 판정한다.
  const status: RunnerStatus = nullableText(r.revokedAt)
    ? 'REVOKED'
    : RUNNER_STATUSES.includes(r.status as RunnerStatus)
      ? (r.status as RunnerStatus)
      : lastHeartbeatAt
        ? 'OFFLINE'
        : 'NEVER_CONNECTED';
  return {
    id,
    kind: r.kind === 'PLATFORM' ? 'PLATFORM' : 'LOCAL',
    name: text(r.name).trim() || `러너 #${id}`,
    projectId: idToString(r.projectId),
    tokenPrefix: nullableText(r.tokenPrefix),
    createdAt: nullableText(r.createdAt),
    lastHeartbeatAt,
    version: nullableText(r.version),
    os: nullableText(r.os),
    maxConcurrency: typeof r.maxConcurrency === 'number' ? r.maxConcurrency : null,
    status,
    currentRunIds: Array.isArray(r.currentRunIds)
      ? r.currentRunIds.map(idToString).filter((v): v is string => v !== null)
      : [],
  };
}

/** 전체 러너(전역 관리자). null = 러너 기능이 없는 구 서버(404). */
export async function listRunners(): Promise<Runner[] | null> {
  const res = await authClient.apiFetch('/api/agent/runners');
  if (res.status === 404) return null;
  if (!res.ok) throw await toApiError(res, '러너 목록을 불러오지 못했습니다.');
  const body: unknown = await res.json();
  return (Array.isArray(body) ? body : []).map(toRunner).filter((v): v is Runner => v !== null);
}

/** 전역 LOCAL 러너 발급 — 응답의 token(agr_)은 호출자가 한 번만 보여주고 버린다. */
export async function createRunner(name: string): Promise<CreatedRunner> {
  const res = await authClient.apiFetch('/api/agent/runners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), projectId: null }),
  });
  if (!res.ok) throw await toApiError(res, '러너를 발급하지 못했습니다.');
  const r = ((await res.json()) ?? {}) as Record<string, unknown>;
  const token = text(r.token);
  if (!token) throw new AgentApiError(res.status, '서버가 러너 토큰 원문을 주지 않았습니다.');
  return { id: idToString(r.id) ?? '', name: text(r.name) || name.trim(), token };
}

/** 러너 철회(204, 멱등). PLATFORM 은 409 — 서버 env(AGENT_PLATFORM_RUNNER_TOKEN)로만 관리한다. */
export async function revokeRunner(id: string): Promise<void> {
  const res = await authClient.apiFetch(`/api/agent/runners/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, '러너를 철회하지 못했습니다.');
}

/* ────────────────────────── 전역 LLM 키 ────────────────────────── */

// 계약(agent-service AGP-66 P3h, 전역 ADMIN):
//   GET    /api/agent/credentials/platform → PlatformCredential
//   PUT    /api/agent/credentials/platform {provider, apiKey, validate?} → PlatformCredential
//          400(키 형식·검증 실패) · 503(마스터 키 미설정·Anthropic 불가) {"error"}
//   DELETE /api/agent/credentials/platform → 204
// 응답에는 원문 키가 없다(끝 4자 `keyHint` 뿐). 화면도 원문을 상태·로그에 남기지 않는다.

export type LlmProvider = 'ANTHROPIC';

export interface PlatformCredential {
  set: boolean;
  provider: LlmProvider | null;
  /** 키 끝 4자 — 화면이 앞에 "…" 를 붙인다. */
  keyHint: string | null;
  /** 마지막으로 저장한 멤버 id(백엔드 Long → string). */
  updatedBy: string | null;
  updatedAt: string | null; // ISO
}

export interface PlatformCredentialInput {
  apiKey: string;
  /** 저장 전에 저비용 호출로 키를 검증할지. */
  validate: boolean;
}

function toPlatformCredential(raw: unknown): PlatformCredential {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    set: r.set === true,
    provider: r.provider === 'ANTHROPIC' ? 'ANTHROPIC' : null,
    keyHint: nullableText(r.keyHint),
    updatedBy: idToString(r.updatedBy),
    updatedAt: nullableText(r.updatedAt),
  };
}

export async function getPlatformCredential(): Promise<PlatformCredential> {
  const res = await authClient.apiFetch('/api/agent/credentials/platform');
  if (!res.ok) throw await toApiError(res, '전역 LLM 키 설정을 불러오지 못했습니다.');
  return toPlatformCredential(await res.json());
}

export async function savePlatformCredential(input: PlatformCredentialInput): Promise<PlatformCredential> {
  const res = await authClient.apiFetch('/api/agent/credentials/platform', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'ANTHROPIC', apiKey: input.apiKey, validate: input.validate }),
  });
  if (!res.ok) throw await toApiError(res, '전역 LLM 키를 저장하지 못했습니다.');
  return toPlatformCredential(await res.json());
}

export async function deletePlatformCredential(): Promise<void> {
  const res = await authClient.apiFetch('/api/agent/credentials/platform', { method: 'DELETE' });
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, '전역 LLM 키를 삭제하지 못했습니다.');
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
  // 서버 판정(expiringSoon, P4a)이 오면 그것을 따르고, 구 서버는 시각으로 계산한다.
  if (token.expiringSoon || expires - now <= EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000) return 'expiring';
  return 'active';
}

/** "12초 전"·"3분 전"·"2시간 전"·날짜 — 러너 마지막 신호. 값이 없거나 깨졌으면 대시. */
export function relativeTime(iso: string | null, now: number = Date.now()): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const sec = Math.max(0, Math.floor((now - t) / 1000));
  if (sec < 60) return `${sec}초 전`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return formatDate(iso);
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
