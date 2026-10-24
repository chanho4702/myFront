import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import PlatformTheme from '../theme/PlatformTheme';
import ColorModeMenu from '../components/ColorModeMenu';

// 존재하지 않는 경로(catch-all)에서 보여주는 404 페이지.
export default function NotFoundPage(props: { disableCustomTheme?: boolean }) {
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
        <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          요청하신 페이지를 찾을 수 없습니다.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          <Button variant="contained" component={RouterLink} to="/app">
            대시보드로
          </Button>
          <Button variant="outlined" component={RouterLink} to="/">
            홈으로
          </Button>
        </Box>
      </Stack>
    </PlatformTheme>
  );
}
