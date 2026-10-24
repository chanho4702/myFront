import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { ApiError, type BoardErrorKind } from './boardStore';

/** 화면이 들고 다니는 실패 — 문구와 종류. */
export interface BoardLoadError {
  message: string;
  kind: BoardErrorKind;
}

/** catch 한 값 → BoardLoadError. store 가 던진 ApiError 면 종류를 살리고, 그 밖은 일반 실패다. */
export function toBoardLoadError(e: unknown, fallback: string): BoardLoadError {
  if (e instanceof ApiError) return { message: e.message, kind: e.kind };
  return { message: e instanceof Error && e.message ? e.message : fallback, kind: 'other' };
}

/**
 * 게시판 로드 실패 표시. 세 갈래를 다르게 보인다.
 * - account(승인 대기·정지 등): 다시 시도해도 풀리지 않는다 — 재시도 버튼 대신 무엇을 해야 하는지 안내.
 * - unavailable(503 일시 장애): 서버 문구 + 다시 시도.
 * - 그 밖: 서버 문구(없으면 기본 문구) + 다시 시도.
 * 어느 경우든 빈 목록으로 삼키지 않는다(관측성).
 */
export default function BoardErrorAlert({
  error,
  onRetry,
  sx,
}: {
  error: BoardLoadError;
  onRetry?: () => void;
  sx?: SxProps<Theme>;
}) {
  if (error.kind === 'account') {
    return (
      <Alert severity="warning" variant="outlined" sx={sx}>
        <AlertTitle>{error.message}</AlertTitle>
        계정이 활성화되면 게시판을 이용할 수 있습니다. 계정 상태는 관리자에게 문의하세요.
      </Alert>
    );
  }
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={sx}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            다시 시도
          </Button>
        ) : undefined
      }
    >
      {error.message}
    </Alert>
  );
}
