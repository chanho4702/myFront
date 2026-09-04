import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import ColorModeIconDropdown from '../../context/templates/shared-theme/ColorModeIconDropdown';
import { HEADER_H } from '../ui';
import { BRAND, BRAND_TAGLINE, GITHUB_URL, START_URL, hero } from '../content';
import BrandLogo from './BrandLogo';

/** `to` 는 라우터 내부, `href` 는 라우터 밖 형제 앱(/docs/ 같은 별도 SPA)으로의 전체 페이지 이동. */
type NavItem = { label: string; to: string; href?: never } | { label: string; href: string; to?: never };

const navItems: NavItem[] = [
  { to: '/products', label: '제품' },
  { to: '/tech', label: '기술' },
  { href: '/docs/', label: '노트' },
  { to: '/contact', label: '문의' },
];
const routed = navItems.filter((i): i is Extract<NavItem, { to: string }> => Boolean(i.to));

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  // 접두 관계의 메뉴가 있으면(예: /tech 와 /tech/…) 더 구체적인 쪽만 활성으로 칠한다.
  const isActive = (to: string) => {
    if (pathname === to) return true;
    if (!pathname.startsWith(`${to}/`)) return false;
    return !routed.some((i) => i.to !== to && i.to.startsWith(`${to}/`) && (pathname === i.to || pathname.startsWith(`${i.to}/`)));
  };

  const navLink = (item: NavItem, onClick?: () => void, big?: boolean) => {
    const active = item.to ? isActive(item.to) : false;
    const sx = {
      fontSize: big ? '1.05rem' : '0.875rem',
      fontWeight: active ? 700 : 500,
      color: active ? 'text.primary' : 'text.secondary',
      '&:hover': { color: 'text.primary' },
    } as const;
    return item.to ? (
      <Link key={item.label} component={RouterLink} to={item.to} underline="none" onClick={onClick} aria-current={active ? 'page' : undefined} sx={sx}>
        {item.label}
      </Link>
    ) : (
      <Link key={item.label} href={item.href} underline="none" onClick={onClick} sx={sx}>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          // CSS 변수 테마라 팔레트 값에 alpha() 를 씌우면 라이트 값에 고정된다 — 채널 변수로 현재 스킴을 따라간다.
          bgcolor: (t) => `rgba(${t.vars!.palette.background.defaultChannel} / 0.78)`,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ height: HEADER_H, alignItems: 'center', justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/" underline="none" aria-label={`${BRAND} 홈 — ${BRAND_TAGLINE}`} sx={{ display: 'flex' }}>
              <BrandLogo />
            </Link>

            <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((i) => navLink(i))}
              <IconButton component="a" href={GITHUB_URL} target="_blank" rel="noopener" aria-label="GitHub" size="small">
                <GitHubIcon fontSize="small" />
              </IconButton>
              <ColorModeIconDropdown size="small" />
              <Button href={START_URL} variant="contained" size="small" sx={{ borderRadius: 999, px: 2.25 }}>
                {hero.cta}
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <ColorModeIconDropdown size="small" />
              <IconButton onClick={() => setOpen(true)} aria-label="메뉴 열기" size="small">
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 264, p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setOpen(false)} aria-label="메뉴 닫기">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack spacing={2.5} sx={{ p: 2, pt: 1 }}>
            {navItems.map((i) => navLink(i, () => setOpen(false), true))}
            <Link href={GITHUB_URL} target="_blank" rel="noopener" underline="none" sx={{ fontSize: '1.05rem', fontWeight: 500, color: 'text.secondary' }}>
              GitHub
            </Link>
            <Button href={START_URL} variant="contained" onClick={() => setOpen(false)} sx={{ borderRadius: 999 }}>
              {hero.cta}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
