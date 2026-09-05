import { useLocation, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string; // 없으면 비활성 placeholder
  href?: string; // 별도 SPA(위키/ALM) — 라우터 밖이라 전체 페이지 이동. nginx 단일 오리진에서만 유효
}

const mainItems: MenuItem[] = [
  { text: '대시보드', icon: <HomeRoundedIcon />, path: '/app' },
  { text: '게시판', icon: <ArticleRoundedIcon />, path: '/app/board' },
  { text: '위키', icon: <MenuBookRoundedIcon />, href: '/wiki/' },
  { text: 'ALM', icon: <AssignmentRoundedIcon />, href: '/alm/' },
  { text: 'API 토큰', icon: <KeyRoundedIcon />, path: '/app/tokens' },
];

const secondaryItems: MenuItem[] = [
  { text: '설정', icon: <SettingsRoundedIcon /> },
  { text: '정보', icon: <InfoRoundedIcon /> },
];

function isSelected(pathname: string, path: string) {
  if (path === '/app') {
    return pathname === '/app' || pathname === '/app/';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function AppMenuContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (item: MenuItem) => {
    if (item.href) {
      window.location.assign(item.href);
      return;
    }
    if (!item.path) {
      return;
    }
    navigate(item.path);
    onNavigate?.();
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={!!item.path && isSelected(location.pathname, item.path)}
              onClick={() => go(item)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton disabled={!item.path && !item.href} onClick={() => go(item)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
