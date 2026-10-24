import { Link as RouterLink, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PlatformTheme from '../theme/PlatformTheme';
import ColorModeMenu from '../components/ColorModeMenu';

// react-router 의 errorElement. 렌더링 중 던져진 예외나 라우트 로더 에러를
// 흰 화면 대신 친절한 페이지로 잡아준다.
export default function RouteErrorPage(props: { disableCustomTheme?: boolean }) {
  const error = useRouteError();

  let title = '문제가 발생했습니다';
  let detail = '예상치 못한 오류로 페이지를 표시할 수 없습니다.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    detail =
      error.status === 404
        ? '요청하신 페이지를 찾을 수 없습니다.'
        : (typeof error.data === 'string' && error.data) || detail;
  } else if (error instanceof Error) {
    detail = error.message || detail;
  }

  return (
    <PlatformTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeMenu size="medium" sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Stack
        sx={{
          height: '100dvh',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 3,
          gap: 2,
        }}
      >
        <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 64 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480 }}>
          {detail}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Button variant="outlined" component={RouterLink} to="/app">
            대시보드로
          </Button>
        </Box>
      </Stack>
    </PlatformTheme>
  );
}
