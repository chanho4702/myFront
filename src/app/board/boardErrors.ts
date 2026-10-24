// board-service 오류 응답 → 화면용 분류·문구. 순수 함수만 둔다(import 없음) — node --test 로 바로 검증한다.
//
// 서버 계약(board-service ApiExceptionHandler · AccountStatusInterceptor):
//   403 {"error":"forbidden", "message": "..."}            권한 없음 또는 계정 상태 게이트
//   503 {"error":"service_unavailable", "message": "..."}  org(권한 서비스) 불능 — 일시 장애
//   404 {"error":"not_found", "message": "..."}
//   400 {"error":"validation_failed", "message": "..."}
// 계정 상태 게이트의 403 은 error 코드가 일반 권한 거부와 같아(forbidden) 문구로만 구분된다.
// 아래 목록은 서버 상수와 한 글자도 다르지 않아야 한다(위키·ALM 게이트와도 같은 문구).

/** 화면이 다르게 그려야 하는 실패 종류. */
export type BoardErrorKind = 'account' | 'unavailable' | 'unauthorized' | 'forbidden' | 'notFound' | 'other';

/** AccountStatusInterceptor 의 PENDING/SUSPENDED/DEACTIVATED/UNKNOWN 문구. */
export const ACCOUNT_STATUS_MESSAGES: readonly string[] = [
  '승인 대기 중인 계정입니다',
  '정지된 계정입니다',
  '비활성된 계정입니다',
  '계정 상태를 확인하지 못해 거부했습니다 — 잠시 후 다시 시도하세요',
];

const HANGUL = /[가-힣]/;

/**
 * 응답 본문에서 사람이 읽을 문구를 꺼낸다. `message` 가 정본이고, 구버전·다른 핸들러처럼 `error` 에
 * 한국어 문장을 담아 주는 경우(`{"error": "메시지"}` 공용 계약)도 받는다. 기계 코드(`forbidden` 등)는 버린다.
 */
export function serverMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const { message, error } = body as { message?: unknown; error?: unknown };
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (typeof error === 'string' && HANGUL.test(error)) return error.trim();
  return null;
}

export function classifyBoardError(status: number, message: string | null): BoardErrorKind {
  if (status === 503) return 'unavailable';
  if (status === 401) return 'unauthorized';
  if (status === 403) return message !== null && ACCOUNT_STATUS_MESSAGES.includes(message) ? 'account' : 'forbidden';
  if (status === 404) return 'notFound';
  return 'other';
}

/**
 * 상태코드 + 본문 → { kind, message }. 서버 문구가 있으면 그것을, 없으면 호출자가 준 상태별 문구,
 * 그것도 없으면 `fallback` 을 쓴다. 503 은 서버 문구 뒤에 "잠시 후 다시 시도" 안내를 붙인다 —
 * 일시 장애를 권한 없음처럼 읽히지 않게 하려는 것이다.
 */
export function describeBoardError(
  status: number,
  body: unknown,
  fallback: string,
  byStatus: Partial<Record<number, string>> = {},
): { kind: BoardErrorKind; message: string } {
  const fromServer = serverMessage(body);
  const kind = classifyBoardError(status, fromServer);
  let message = fromServer ?? byStatus[status] ?? fallback;
  if (kind === 'unavailable') {
    const base = fromServer ?? '게시판 서버가 일시적으로 응답하지 않습니다';
    message = `${base.replace(/[.\s]+$/, '')}. 잠시 후 다시 시도해 주세요.`;
  }
  return { kind, message };
}
