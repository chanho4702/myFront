import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlatformTheme from '../app/theme/PlatformTheme';
import ColorModeMenu from '../app/components/ColorModeMenu';
import InputsSection from '../showcase/InputsSection';
import DataDisplaySection from '../showcase/DataDisplaySection';
import FeedbackSection from '../showcase/FeedbackSection';
import SurfacesSection from '../showcase/SurfacesSection';
import NavigationSection from '../showcase/NavigationSection';
import LayoutSection from '../showcase/LayoutSection';

const anchors = [
  { id: 'inputs', label: 'Inputs' },
  { id: 'data-display', label: 'Data display' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'layout', label: 'Layout' },
];

export default function ComponentsShowcase(props: { disableCustomTheme?: boolean }) {
  return (
    <PlatformTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton component={RouterLink} to="/" edge="start" sx={{ mr: 1 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Components showcase
          </Typography>
          <Button
            component={RouterLink}
            to="/components"
            startIcon={<MenuBookRoundedIcon />}
            sx={{ mr: 1 }}
          >
            레퍼런스
          </Button>
          <ColorModeMenu />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            라이브 컴포넌트 쇼케이스
          </Typography>
          <Typography color="text.secondary">
            실제로 동작하는 MUI 컴포넌트 예제 모음. 클릭/입력해보고 소스를{' '}
            <code>src/showcase</code> 에서 그대로 가져다 쓰세요.
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', mb: 4 }}
        >
          {anchors.map((a) => (
            <Chip
              key={a.id}
              label={a.label}
              component="a"
              href={`#${a.id}`}
              clickable
              variant="outlined"
            />
          ))}
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <InputsSection />
          <DataDisplaySection />
          <FeedbackSection />
          <SurfacesSection />
          <NavigationSection />
          <LayoutSection />
        </Box>
      </Container>
    </PlatformTheme>
  );
}
