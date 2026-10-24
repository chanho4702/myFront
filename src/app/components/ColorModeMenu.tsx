import * as React from 'react';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';

type Mode = 'system' | 'light' | 'dark';

const OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'system', label: '시스템 설정' },
  { mode: 'light', label: '라이트' },
  { mode: 'dark', label: '다크' },
];

/**
 * 색상 모드 선택 — 원본 `ColorModeIconDropdown`(context/templates, 수정 금지)의 "내 버전".
 *
 * 원본과 다른 점: (1) 아이콘 전용 버튼에 접근 이름이 없어 스크린리더가 "버튼"만 읽던 것을 `aria-label` 로 채움,
 * (2) 메뉴 id 가 `account-menu` 로 하드코딩돼 계정 메뉴와 id 가 겹치던 것을 useId 로 분리,
 * (3) 영문(System/Light/Dark) 대신 한국어 + 현재 값 체크 표시(선택을 색으로만 구분하지 않음).
 */
export default function ColorModeMenu({ size = 'small', sx }: { size?: 'small' | 'medium'; sx?: SxProps<Theme> }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuId = React.useId();
  const open = Boolean(anchorEl);

  if (!mode) {
    // 모드가 정해지기 전(첫 렌더) 자리만 잡아 헤더가 흔들리지 않게 한다.
    return (
      <Box
        sx={[
          (theme) => ({
            display: 'inline-flex',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: (theme.vars || theme).shape.borderRadius,
            border: '1px solid',
            borderColor: (theme.vars || theme).palette.divider,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  }
  const resolved = (systemMode || mode) as 'light' | 'dark';
  const current = OPTIONS.find((o) => o.mode === mode)?.label ?? '';

  return (
    <>
      <IconButton
        size={size}
        disableRipple
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={`색상 모드: ${current}`}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? 'true' : undefined}
        sx={sx}
      >
        {resolved === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { variant: 'outlined', elevation: 0, sx: { my: '4px', minWidth: 148 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {OPTIONS.map((o) => (
          <MenuItem
            key={o.mode}
            selected={mode === o.mode}
            onClick={() => {
              setMode(o.mode);
              setAnchorEl(null);
            }}
          >
            <ListItemText>{o.label}</ListItemText>
            <ListItemIcon sx={{ minWidth: 0, ml: 2, visibility: mode === o.mode ? 'visible' : 'hidden' }}>
              <CheckRoundedIcon fontSize="small" />
            </ListItemIcon>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
