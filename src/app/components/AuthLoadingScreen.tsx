import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PlatformTheme from '../theme/PlatformTheme';

// 세션 복원/리다이렉트 판정 중 보여주는 전체화면 로딩.
// 다른 페이지처럼 AppTheme 로 감싸 흰 화면 번쩍임(테마 없는 빈 화면)을 없앤다.
// ProtectedRoute/GuestRoute 에 fallback 으로 주입한다.
export default function AuthLoadingScreen() {
  return (
    <PlatformTheme>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100dvh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    </PlatformTheme>
  );
}
