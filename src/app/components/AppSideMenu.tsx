import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import BrandLogo from '../../site/components/BrandLogo';
import { BRAND } from '../../site/content';
import AppOptionsMenu from './AppOptionsMenu';
import AppMenuContent from './AppMenuContent';
import { useAuth } from '../../auth';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function AppSideMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const email = user?.email ?? '';
  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/*
        원본 템플릿의 "Sitemark-web" 회사 선택(가짜 데이터)·"Plan about to expire" 할인 카드는 이 제품과 무관한
        견본이라 뺐다. 대신 공개 사이트와 같은 로고를 두어 포털에서도 브랜드가 하나로 보이고 소개 홈으로 돌아갈 수 있다.
      */}
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 64, mt: 'var(--template-frame-height, 0px)', px: 2.5 }}>
        <Link component={RouterLink} to="/" aria-label={`${BRAND} 홈으로`} sx={{ display: 'flex', '&::before': { display: 'none' } }}>
          <BrandLogo />
        </Link>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AppMenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar sizes="small" sx={{ width: 36, height: 36, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
          {initial}
        </Avatar>
        <Box sx={{ mr: 'auto', minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            내 계정
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email}
          </Typography>
        </Box>
        <AppOptionsMenu onLogout={onLogout} />
      </Stack>
    </Drawer>
  );
}
