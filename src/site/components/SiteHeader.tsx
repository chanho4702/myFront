import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../context/templates/shared-theme/ColorModeIconDropdown';
import { HEADER_H } from '../ui';

const navItems = [
  { to: '/products', label: '제품' },
  { to: '/tech', label: '기술' },
  { to: '/about', label: '소개' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  const navLink = (to: string, label: string, onClick?: () => void, big?: boolean) => (
    <Link
      key={to}
      component={RouterLink}
      to={to}
      underline="none"
      onClick={onClick}
      aria-current={isActive(to) ? 'page' : undefined}
      sx={{
        fontSize: big ? '1.05rem' : '0.875rem',
        fontWeight: isActive(to) ? 700 : 500,
        color: isActive(to) ? 'text.primary' : 'text.secondary',
        '&:hover': { color: 'text.primary' },
      }}
    >
      {label}
    </Link>
  );

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
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.78),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ height: HEADER_H, alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', fontSize: '1rem' }}
            >
              chanho.dev
            </Link>

            <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((i) => navLink(i.to, i.label))}
              <ColorModeIconDropdown size="small" />
              <Button component={RouterLink} to="/contact" variant="contained" size="small" sx={{ borderRadius: '4px' }}>
                문의하기
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
            {navItems.map((i) => navLink(i.to, i.label, () => setOpen(false), true))}
            <Button component={RouterLink} to="/contact" variant="contained" onClick={() => setOpen(false)} sx={{ borderRadius: '4px' }}>
              문의하기
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
