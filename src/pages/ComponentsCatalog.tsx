import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PlatformTheme from '../app/theme/PlatformTheme';
import ColorModeMenu from '../app/components/ColorModeMenu';
import { componentCategories, docUrl, totalComponentCount } from '../data/components';

export default function ComponentsCatalog(props: { disableCustomTheme?: boolean }) {
  const [query, setQuery] = React.useState('');

  const normalized = query.trim().toLowerCase();
  const filtered = componentCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          !normalized ||
          item.name.toLowerCase().includes(normalized) ||
          item.import.toLowerCase().includes(normalized),
      ),
    }))
    .filter((category) => category.items.length > 0);

  const matchCount = filtered.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <PlatformTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton component={RouterLink} to="/" edge="start" sx={{ mr: 1 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Components catalog
          </Typography>
          <Button component={RouterLink} to="/showcase" startIcon={<AutoAwesomeRoundedIcon />} sx={{ mr: 1 }}>
            라이브 데모
          </Button>
          <ColorModeMenu />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            MUI 컴포넌트 {totalComponentCount}개
          </Typography>
          <Typography color="text.secondary">
            카테고리별로 정리된 전체 컴포넌트. 카드를 클릭하면 공식 문서가 새 탭으로 열립니다.
          </Typography>
        </Stack>

        <TextField
          fullWidth
          placeholder="컴포넌트 검색 (이름 또는 import 경로)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {matchCount}개 표시 중
        </Typography>

        <Stack spacing={5}>
          {filtered.map((category) => (
            <Box key={category.id}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {category.title}
                </Typography>
                <Chip label={category.items.length} size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {category.description}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {category.items.map((item) => (
                  <Grid key={item.name} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardActionArea
                        component={Link}
                        href={docUrl(item.link)}
                        target="_blank"
                        rel="noopener"
                        sx={{ height: '100%' }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <OpenInNewRoundedIcon fontSize="small" color="action" />
                          </Stack>
                          <Typography
                            variant="caption"
                            component="code"
                            sx={{ color: 'text.secondary', wordBreak: 'break-all' }}
                          >
                            {item.import}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {filtered.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              "{query}" 와 일치하는 컴포넌트가 없습니다.
            </Typography>
          )}
        </Stack>
      </Container>
    </PlatformTheme>
  );
}
