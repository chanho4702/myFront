import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PlatformTheme from '../theme/PlatformTheme';
import ColorModeMenu from './ColorModeMenu';

// /app 밖의 공개 페이지 공용 셸. AppLayout이 없는 standalone 화면이므로 여기서
// 테마(PlatformTheme)를 한 번 감싸고, 홈 복귀 링크 + 색상모드 토글을 상단에 둔다.
export default function PublicPageShell({
  children,
  maxWidth = 'lg',
}: {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}) {
  return (
    <PlatformTheme>
      <CssBaseline enableColorScheme />
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
        >
          <Button component={RouterLink} to="/" startIcon={<HomeRoundedIcon />}>
            홈
          </Button>
          <ColorModeMenu />
        </Stack>
        {children}
      </Container>
    </PlatformTheme>
  );
}
