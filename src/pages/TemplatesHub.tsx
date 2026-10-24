import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PlatformTheme from '../app/theme/PlatformTheme';
import ColorModeMenu from '../app/components/ColorModeMenu';
import { totalComponentCount } from '../data/components';

interface HubCard {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

const cards: HubCard[] = [
  {
    to: '/sign-in',
    title: 'Sign in',
    description: '중앙 정렬 카드형 로그인 페이지. 소셜 로그인 + 비밀번호 찾기 다이얼로그 포함.',
    icon: <LoginRoundedIcon fontSize="large" />,
    tag: 'Auth',
  },
  {
    to: '/sign-up',
    title: 'Sign up',
    description: '회원가입 폼. 이름/이메일/비밀번호 유효성 검사 + 소셜 가입.',
    icon: <PersonAddAltRoundedIcon fontSize="large" />,
    tag: 'Auth',
  },
  {
    to: '/sign-in-side',
    title: 'Sign in side',
    description: '좌우 분할 레이아웃 로그인. 한쪽은 마케팅 콘텐츠, 한쪽은 로그인 카드.',
    icon: <ViewSidebarRoundedIcon fontSize="large" />,
    tag: 'Auth',
  },
  {
    to: '/dashboard',
    title: 'Dashboard',
    description: '사이드 메뉴 + 통계 카드 + 차트 + 데이터 그리드 + 트리뷰가 포함된 관리자 대시보드.',
    icon: <DashboardRoundedIcon fontSize="large" />,
    tag: 'App',
  },
  {
    to: '/showcase',
    title: 'Components showcase',
    description: '실제로 동작하는 MUI 컴포넌트 라이브 예제. 입력/클릭해보고 소스를 그대로 복사.',
    icon: <AutoAwesomeRoundedIcon fontSize="large" />,
    tag: 'Live',
  },
  {
    to: '/components',
    title: 'Components catalog',
    description: `MUI 전체 컴포넌트 ${totalComponentCount}개를 카테고리별로 정리한 레퍼런스.`,
    icon: <WidgetsRoundedIcon fontSize="large" />,
    tag: 'Reference',
  },
];

export default function TemplatesHub(props: { disableCustomTheme?: boolean }) {
  return (
    <PlatformTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }}>
        <ColorModeMenu />
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Button component={RouterLink} to="/" startIcon={<HomeRoundedIcon />} sx={{ mb: 3 }}>
          홈
        </Button>
        <Stack spacing={1.5} sx={{ mb: 6, maxWidth: 720 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            탬플릿
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            MUI 공식 템플릿과 컴포넌트 쇼케이스·카탈로그 모음. 참고용 원본은
            <code>src/context/templates</code> 에 그대로 보관돼 있습니다.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid key={card.to} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea component={RouterLink} to={card.to} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                      >
                        <Box sx={{ color: 'primary.main' }}>{card.icon}</Box>
                        <Chip label={card.tag} size="small" />
                      </Stack>
                      <Typography variant="h6" component="h2">
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PlatformTheme>
  );
}
