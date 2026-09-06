// 개인 API 토큰(PAT) 데이터 레이어 — 게이트웨이 경유 auth-server 관리 API 호출.
//
// 인증: board 처럼 자체 fetch 를 두지 않고 authClient.apiFetch 를 그대로 쓴다.
// (Bearer 자동 첨부 + 401 이면 1회 refresh 후 재시도 + credentials: 'include').
// 관리 API 는 전부 세션 JWT 가 필요하다 — PAT 로 만든 JWT 는 서버가 403 으로 막는다.
//
// 계약: auth-server/docs/superpowers/specs/2026-09-05-personal-access-tokens-design.md §3.1
//   GET    /api/auth/tokens        → ApiToken[]        (본인 것만, 최신순)
//   POST   /api/auth/tokens        → 201 CreatedToken  (원문 token 은 이 응답에만)
//   DELETE /api/auth/tokens/{id}   → 204               (이미 폐기면 멱등, 남의 것이면 404)

import { authClient } from '../../auth';

/** 목록 응답 1건. 원문 토큰은 절대 내려오지 않고 뒤 4자(hint)만 온다. */
export interface ApiToken {
  id: string;
  label: string;
  hint: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  lastUsedAt: string | null; // ISO, 한 번도 안 썼으면 null
  revokedAt: string | null; // ISO, 폐기 시각
  /**
   * 이 토큰이 쓸 수 있는 스코프(예: `["wiki:read","admin"]`). 스코프 도입 이전에 만든 토큰이나
   * 구버전 서버는 이 필드를 주지 않을 수 있으므로 화면은 항상 빈 배열로 방어한다.
   */
  scopes?: string[];
}

/** 발급(POST) 응답. `token` 은 이 응답에만 실리고 다시는 볼 수 없다. */
export interface CreatedToken {
  id: string;
  label: string;
  hint: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  token: string; // 원문 chanho_pat_…
  scopes?: string[];
}

export interface CreateTokenInput {
  label: string;
  expiresInDays: number;
  /** 필수. 빈 배열이면 서버가 400 `scopes_required` 로 막는다(§1.2). */
  scopes: string[];
}

/** 토큰 원문의 고정 접두사. 목록에서 `chanho_pat_…hint` 로 식별한다. */
export const TOKEN_PREFIX = 'chanho_pat_';

/** 사용자당 활성 토큰 상한(서버와 동일한 값 — 안내 문구용). */
export const TOKEN_LIMIT = 25;

/** 만료 임박으로 볼 남은 일수. */
export const EXPIRING_SOON_DAYS = 7;

/** 상태코드 + 서버 오류 코드를 들고 다니는 에러 — 화면에서 401/403/409 를 구분한다. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 서버 오류 계약 `{"error":"..."}` → 한국어 메시지. */
const ERROR_MESSAGES: Record<string, string> = {
  label_required: '라벨을 입력해 주세요.',
  invalid_expiry: '만료 기간이 올바르지 않습니다.',
  token_limit: '토큰은 최대 25개까지 만들 수 있습니다.',
  scopes_required: '권한(스코프)을 하나 이상 선택해 주세요.',
  scopes_invalid: '알 수 없는 권한(스코프)이 포함돼 있습니다. 화면을 새로고침한 뒤 다시 시도해 주세요.',
  insufficient_scope: '이 토큰에는 필요한 스코프가 없습니다.',
  not_found: '이미 삭제되었거나 존재하지 않는 토큰입니다.',
  pat_cannot_manage_tokens: 'API 토큰으로는 토큰을 관리할 수 없습니다. 브라우저로 로그인해 주세요.',
};

/**
 * 실패 응답을 ApiError 로 바꾼다. 본문이 JSON 이 아니거나 비어 있어도(504·프록시 오류 등)
 * 던지지 않고 fallback 메시지로 떨어진다.
 */
async function toApiError(res: Response, fallback: string): Promise<ApiError> {
  let code: string | undefined;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
      code = (body as { error: string }).error;
    }
  } catch {
    // 본문 없음/비 JSON — 상태코드 기반 메시지로 충분하다.
  }
  const byCode = code ? ERROR_MESSAGES[code] : undefined;
  if (byCode) return new ApiError(res.status, byCode, code);
  if (res.status === 401) return new ApiError(401, '로그인이 필요합니다. 다시 로그인해 주세요.', code);
  if (res.status === 403) return new ApiError(403, '권한이 없습니다.', code);
  if (res.status >= 500) return new ApiError(res.status, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', code);
  return new ApiError(res.status, fallback, code);
}

/** 내 토큰 목록(최신순). */
export async function listTokens(): Promise<ApiToken[]> {
  const res = await authClient.apiFetch('/api/auth/tokens');
  if (!res.ok) throw await toApiError(res, '토큰 목록을 불러오지 못했습니다.');
  const body: unknown = await res.json();
  return Array.isArray(body) ? (body as ApiToken[]) : [];
}

/** 새 토큰 발급. 응답의 `token` 은 호출자가 한 번만 보여주고 버려야 한다. */
export async function createToken(input: CreateTokenInput): Promise<CreatedToken> {
  const res = await authClient.apiFetch('/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toApiError(res, '토큰을 만들지 못했습니다.');
  return (await res.json()) as CreatedToken;
}

/** 토큰 폐기(204). 이미 폐기된 토큰도 204 라 성공으로 처리한다. */
export async function revokeToken(id: string): Promise<void> {
  const res = await authClient.apiFetch(`/api/auth/tokens/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, '토큰을 폐기하지 못했습니다.');
}

export type TokenStatus = 'active' | 'expiring' | 'expired' | 'revoked';

/**
 * 목록 행의 표시 상태. 서버가 상태 필드를 주지 않으므로 시각으로 계산한다.
 * 파싱 불가한 만료일(백엔드 미제공/깨진 값)은 만료로 몰지 않고 활성으로 둔다 — 폐기 버튼을
 * 잘못 잠그지 않기 위해서다.
 */
export function tokenStatus(token: ApiToken, now: number = Date.now()): TokenStatus {
  if (token.revokedAt) return 'revoked';
  const expires = Date.parse(token.expiresAt);
  if (Number.isNaN(expires)) return 'active';
  if (expires <= now) return 'expired';
  if (expires - now <= EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000) return 'expiring';
  return 'active';
}

/** ISO 날짜 → `2026. 9. 5.`. 값이 없거나 깨졌으면 대시로 폴백한다(Invalid Date 방지). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleDateString('ko-KR');
}
