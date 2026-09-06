import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useAdminIdentity } from './adminStore';

interface HomeCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  /** 라우터 안(내 SPA) 경로. */
  to?: string;
  /** 라우터 밖 SPA(위키·ALM) — nginx 단일 오리진에서만 유효한 전체 페이지 이동. */
  href?: string;
}

const CARDS: HomeCard[] = [
  {
    title: '위키',
    description: '문서 스페이스를 열고 페이지를 쓴다.',
    icon: <MenuBookRoundedIcon />,
    href: '/wiki/',
  },
  {
    title: 'ALM',
    description: '프로젝트와 이슈를 관리한다.',
    icon: <AssignmentRoundedIcon />,
    href: '/alm/',
  },
  {
    title: 'API 토큰',
    description: '스크립트·CI에서 쓸 개인 API 토큰을 발급하고 폐기한다.',
    icon: <KeyRoundedIcon />,
    to: '/app/tokens',
  },
  {
    title: '내 프로필',
    description: '표시 이름·아바타 등 내 정보를 본다.',
    icon: <PersonRoundedIcon />,
    to: '/profile',
  },
];

/**
 * 비관리자용 `/app` 인덱스 — 바로가기 카드만 둔다(§5.1).
 *
 * 플랫폼 점검·현황 API 는 전역 관리자 전용이라 여기서는 아예 부르지 않는다.
 */
export default function MemberHomePage() {
  const { me } = useAdminIdentity();
  const name = me?.displayName?.trim();

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          {name ? `${name} 님, 안녕하세요` : '안녕하세요'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          자주 쓰는 곳으로 바로 갑니다.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {CARDS.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardActionArea
                {...(card.to
                  ? { component: RouterLink, to: card.to }
                  : { component: 'a', href: card.href })}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>{card.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {card.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
