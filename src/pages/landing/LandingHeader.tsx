import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../context/templates/shared-theme/ColorModeIconDropdown';
import { GITHUB_URL } from '../../site/content';

export const HEADER_H = 52;

interface NavItem {
  label: string;
  hash?: string; // 랜딩 내 앵커 (#products 등)
  to?: string; // 라우트
  href?: string; // 외부
  external?: boolean;
}
const navItems: NavItem[] = [
  { label: '제품', hash: '#products' },
  { label: '성과', hash: '#work' },
  // 위키/ALM은 별도 SPA — nginx 단일 오리진에서 전체 페이지 이동 (라우터 링크 아님)
  { label: '위키', href: '/wiki/' },
  { label: 'ALM', href: '/alm/' },
  { label: '설계 문서', to: '/designs' },
  { label: '프로필', to: '/profile' },
  { label: 'GitHub', href: GITHUB_URL, external: true },
];

// anchorBase: 랜딩에서는 ''(같은 페이지 앵커), 상세 페이지에서는 '/'(홈으로 이동 후 앵커).
export default function LandingHeader({ anchorBase = '' }: { anchorBase?: string }) {
  const [navOpen, setNavOpen] = useState(false);

  const navLink = (item: NavItem, onClick?: () => void, big?: boolean) => {
    const sx = {
      fontSize: big ? '1.05rem' : '0.85rem',
      fontWeight: 500,
      color: 'text.secondary',
      '&:hover': { color: 'text.primary' },
    } as const;
    if (item.to) {
      return (
        <Link key={item.label} component={RouterLink} to={item.to} underline="none" onClick={onClick} sx={sx}>
          {item.label}
        </Link>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.hash ? `${anchorBase}${item.hash}` : item.href}
        {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
        underline="none"
        onClick={onClick}
        sx={sx}
      >
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
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.72),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ height: HEADER_H, alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href={`${anchorBase}#top`} underline="none" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', fontSize: '1rem' }}>
              chanho.dev
            </Link>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((item) => navLink(item))}
              <ColorModeIconDropdown size="small" />
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <ColorModeIconDropdown size="small" />
              <IconButton onClick={() => setNavOpen(true)} aria-label="메뉴 열기" size="small">
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Drawer anchor="right" open={navOpen} onClose={() => setNavOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setNavOpen(false)} aria-label="메뉴 닫기">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack spacing={2.5} sx={{ p: 2, pt: 1 }}>
            {navItems.map((item) => navLink(item, () => setNavOpen(false), true))}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
