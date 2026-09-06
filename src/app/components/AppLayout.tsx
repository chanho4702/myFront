import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AppSideMenu from './AppSideMenu';
import AppNavbar from './AppNavbar';
import Search from '../../context/templates/dashboard/components/Search';
import CustomDatePicker from '../../context/templates/dashboard/components/CustomDatePicker';
import MenuButton from '../../context/templates/dashboard/components/MenuButton';
import ColorModeIconDropdown from '../../context/templates/shared-theme/ColorModeIconDropdown';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../context/templates/dashboard/theme/customizations';
import { useAuth } from '../../auth';
import { resetAdminIdentity, useAdminIdentity } from '../admin/adminStore';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

interface Crumb {
  label: string;
  to?: string;
}

// 현재 경로 기준 브레드크럼 트레일 계산. 루트 라벨은 사이드 메뉴와 같은 규칙을 따른다
// (관리자면 "관리자 대시보드", 아니면 "홈").
function useCrumbs(pathname: string, isGlobalAdmin: boolean): Crumb[] {
  const crumbs: Crumb[] = [{ label: isGlobalAdmin ? '관리자 대시보드' : '홈', to: '/app' }];
  if (pathname.startsWith('/app/board')) {
    crumbs.push({ label: '게시판', to: '/app/board' });
    if (pathname === '/app/board/new') {
      crumbs.push({ label: '글쓰기' });
    } else if (pathname.endsWith('/edit')) {
      crumbs.push({ label: '글 수정' });
    } else if (pathname !== '/app/board') {
      crumbs.push({ label: '글 보기' });
    }
  }
  if (pathname.startsWith('/app/tokens')) {
    crumbs.push({ label: 'API 토큰', to: '/app/tokens' });
  }
  return crumbs;
}

export default function AppLayout(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isGlobalAdmin } = useAdminIdentity();
  const crumbs = useCrumbs(location.pathname, isGlobalAdmin);

  const handleLogout = async () => {
    await logout();
    // 다음 로그인이 다른 계정일 수 있으므로 관리자 판정 캐시를 버린다.
    resetAdminIdentity();
    navigate('/login', { replace: true });
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <AppSideMenu onLogout={handleLogout} />
        <AppNavbar onLogout={handleLogout} />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            {/* 상단 바: 브레드크럼 + 도구 + 로그아웃 */}
            <Stack
              direction="row"
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: { sm: '100%', md: '1700px' },
                pt: 1.5,
              }}
              spacing={2}
            >
              <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
                {crumbs.map((c, i) =>
                  c.to && i < crumbs.length - 1 ? (
                    <Link
                      key={c.label}
                      component={RouterLink}
                      to={c.to}
                      underline="hover"
                      color="inherit"
                      variant="body1"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <Typography key={c.label} variant="body1" sx={{ fontWeight: 600 }}>
                      {c.label}
                    </Typography>
                  ),
                )}
              </Breadcrumbs>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Search />
                <CustomDatePicker />
                <MenuButton showBadge aria-label="Open notifications">
                  <NotificationsRoundedIcon />
                </MenuButton>
                <ColorModeIconDropdown />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </Stack>
            </Stack>

            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
