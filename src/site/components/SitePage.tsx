import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/**
 * 공개 사이트 공통 셸. 테마·헤더·푸터를 한 곳에서 감싼다.
 *
 * 스킵 링크가 여기 있는 이유: 스티키 헤더가 모든 페이지에 얹히므로, 없으면 키보드·스크린리더
 * 사용자가 페이지를 옮길 때마다 GNB 3개 + CTA + 컬러모드 드롭다운을 매번 통과해야 한다.
 * `display: none` 은 포커스를 받지 못하므로 화면 밖으로 밀어 두고 포커스 시 끌어온다.
 */
export default function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Link
        href="#main-content"
        sx={{
          position: 'fixed',
          left: 8,
          top: -80,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          px: 2,
          py: 1,
          borderRadius: '4px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          textDecoration: 'none',
          '&:focus-visible': { top: 8 },
        }}
      >
        본문으로 건너뛰기
      </Link>
      <SiteHeader />
      <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
        {children}
      </Box>
      <SiteFooter />
    </AppTheme>
  );
}
