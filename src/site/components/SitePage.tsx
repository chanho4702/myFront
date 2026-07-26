import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/**
 * 라우트 해시(`#cap-...` 등)로 진입/이동했을 때 해당 요소로 스크롤 + 포커스 이동한다.
 * data 라우터는 URL 해시를 스스로 처리하지 않고, 이 앱엔 `<ScrollRestoration>`도 없어서
 * `<Navigate to="/tech#cap-...">` 같은 리다이렉트가 주소만 바꾸고 스크롤은 안 하는 무음 실패가 난다.
 *
 * `querySelector`가 아니라 `getElementById`인 이유: 노트 헤딩 슬러그는 한글이고 숫자로 시작할 수도
 * 있어(`#1단계`) CSS 선택자로 넘기면 파싱 에러가 난다. `decodeURIComponent`는 한글 해시가 URL에서
 * 퍼센트 인코딩되기 때문. 포커스까지 옮기는 건 스크롤만으로는 스크린리더 사용자가 도착을 알 수
 * 없기 때문 — 같은 훅에서 함께 닫는다.
 */
function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView(); // scroll-margin-top(ANCHOR_OFFSET)을 존중한다
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, [hash]);
}

/**
 * 공개 사이트 공통 셸. 테마·헤더·푸터를 한 곳에서 감싼다.
 *
 * 스킵 링크가 여기 있는 이유: 스티키 헤더가 모든 페이지에 얹히므로, 없으면 키보드·스크린리더
 * 사용자가 페이지를 옮길 때마다 GNB 3개 + CTA + 컬러모드 드롭다운을 매번 통과해야 한다.
 * `display: none` 은 포커스를 받지 못하므로 화면 밖으로 밀어 두고 포커스 시 끌어온다.
 */
export default function SitePage({ children }: { children: React.ReactNode }) {
  useHashScroll();
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
      {/*
        tabIndex={-1} 은 선택이 아니라 필수다 — <main> 은 네이티브로 포커스를 못 받아서,
        해시로 이동해도 이게 없으면 브라우저가 포커스를 옮기지 않는다.
        페이지 높이만 한 랜드마크에 기본 아웃라인을 두르는 건 의미가 없어 죽이되,
        스킵 링크로 건너뛴 직후 "포커스가 어디 있는지" 단서가 아예 없으면 곤란하므로
        포커스 시에만 상단에 옅은 표시를 남긴다.
      */}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          outline: 'none',
          '&:focus-visible': { boxShadow: (theme) => `inset 0 3px 0 0 ${theme.palette.primary.main}` },
        }}
      >
        {children}
      </Box>
      <SiteFooter />
    </AppTheme>
  );
}
