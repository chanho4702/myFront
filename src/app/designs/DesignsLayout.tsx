import * as React from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CssBaseline from '@mui/material/CssBaseline';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import PlatformTheme from '../theme/PlatformTheme';
import ColorModeMenu from '../components/ColorModeMenu';
import { useAuth } from '../../auth';
import { listDesigns, DESIGN_CATEGORIES } from './designsStore';

const DRAWER_WIDTH = 280;

export default function DesignsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [openCats, setOpenCats] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(DESIGN_CATEGORIES.map((c) => [c, true])),
  );

  // location.key 는 문서 생성/수정/삭제 후 navigate 때마다 바뀌므로, 이를 dep 으로
  // 삼아 사이드바 트리가 스토어를 다시 읽게 한다(레이아웃은 자식 전환에도 유지됨).
  const docs = React.useMemo(() => listDesigns(), [location.key]);

  // 현재 열람 중인 문서 id (하이라이트용). /designs/new, /designs 는 undefined.
  const seg = location.pathname.replace(/^\/designs\/?/, '').split('/')[0];
  const currentId = seg && seg !== 'new' ? seg : undefined;
  const isHome = location.pathname === '/designs' || location.pathname === '/designs/';

  const q = query.trim().toLowerCase();
  const filtered = q ? docs.filter((d) => d.title.toLowerCase().includes(q)) : docs;
  const groups = DESIGN_CATEGORIES.map((category) => ({
    category,
    items: filtered.filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0);

  const closeMobile = () => setMobileOpen(false);
  const toggleCat = (cat: string) => setOpenCats((s) => ({ ...s, [cat]: !s[cat] }));
  const go = (path: string) => {
    navigate(path);
    closeMobile();
  };

  const tree = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar />
      <Box sx={{ p: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="문서 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <List dense sx={{ px: 0.5 }}>
        <ListItemButton
          selected={isHome}
          onClick={() => go('/designs')}
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="스페이스 홈" />
        </ListItemButton>

        {groups.map((g) => (
          <React.Fragment key={g.category}>
            <ListItemButton onClick={() => toggleCat(g.category)} sx={{ borderRadius: 1 }}>
              <ListItemText
                primary={g.category}
                sx={{ '& .MuiListItemText-primary': { fontWeight: 600, fontSize: 13 } }}
              />
              {openCats[g.category] ? (
                <ExpandLessRoundedIcon fontSize="small" />
              ) : (
                <ExpandMoreRoundedIcon fontSize="small" />
              )}
            </ListItemButton>
            <Collapse in={openCats[g.category]} timeout="auto" unmountOnExit>
              <List dense disablePadding>
                {g.items.map((d) => (
                  <ListItemButton
                    key={d.id}
                    selected={d.id === currentId}
                    onClick={() => go(`/designs/${d.id}`)}
                    sx={{
                      pl: 4,
                      borderRadius: 1,
                      '& .MuiListItemText-primary': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <ArticleRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={d.title} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}

        {groups.length === 0 && (
          <Typography variant="body2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
            {q ? '검색 결과가 없습니다.' : '등록된 문서가 없습니다.'}
          </Typography>
        )}
      </List>
    </Box>
  );

  return (
    <PlatformTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            zIndex: (t) => t.zIndex.drawer + 1,
            backdropFilter: 'saturate(180%) blur(20px)',
            bgcolor: (t) => alpha(t.palette.background.default, 0.8),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen((o) => !o)}
              sx={{ mr: 1, display: { md: 'none' } }}
              aria-label="문서 목록 열기"
            >
              <MenuRoundedIcon />
            </IconButton>
            <Button component={RouterLink} to="/" startIcon={<HomeRoundedIcon />} color="inherit">
              홈
            </Button>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600, ml: 1 }}>
              설계 문서
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {isAuthenticated && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate('/designs/new')}
                sx={{ mr: 1 }}
              >
                새 문서
              </Button>
            )}
            <ColorModeMenu />
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {tree}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
          open
        >
          {tree}
        </Drawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </PlatformTheme>
  );
}
