import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/** 공개 사이트 공통 셸. 테마·헤더·푸터를 한 곳에서 감싼다. */
export default function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SiteHeader />
      <Box component="main">{children}</Box>
      <SiteFooter />
    </AppTheme>
  );
}
