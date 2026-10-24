import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import PlatformTheme from '../theme/PlatformTheme';
import ColorModeMenu from '../components/ColorModeMenu';
import BrandLogo from '../../site/components/BrandLogo';
import { BRAND } from '../../site/content';
import { GoogleIcon } from '../../context/templates/sign-in/components/CustomIcons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { loginUrl, googleLoginUrl, rememberReturnTo } from '../../auth';

// Keycloak 기반 로그인. 버튼을 누르면 auth-server(:9000)의 OIDC 시작점으로 리다이렉트되고,
// Keycloak 화면에서 계정/구글 로그인 후 백엔드가 /app 으로 되돌려보낸다.

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: '100dvh',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function LoginPage(props: { disableCustomTheme?: boolean }) {
  const location = useLocation();
  // ProtectedRoute 가 넘긴 원래 목적지. 직접 /login 에 온 경우는 /app.
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  return (
    <PlatformTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeMenu size="medium" sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <LoginContainer direction="column" sx={{ justifyContent: 'space-between' }}>
        <Card variant="outlined">
          {/* 원본 템플릿의 Sitemark 로고 대신 이 제품의 로고 — 누르면 소개 홈으로 돌아간다(로그인 화면의 유일한 탈출구). */}
          <Link component={RouterLink} to="/" aria-label={`${BRAND} 홈으로`} sx={{ display: 'flex', '&::before': { display: 'none' } }}>
            <BrandLogo />
          </Link>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            로그인
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            계속하려면 로그인하세요. Keycloak 계정 또는 Google 계정을 사용할 수 있습니다.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                rememberReturnTo(from);
                window.location.href = loginUrl();
              }}
            >
              로그인
            </Button>
            <Divider>또는</Divider>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                rememberReturnTo(from);
                window.location.href = googleLoginUrl();
              }}
              startIcon={<GoogleIcon />}
            >
              Google 계정으로 로그인
            </Button>
          </Box>
        </Card>
      </LoginContainer>
    </PlatformTheme>
  );
}
