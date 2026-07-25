import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { MONO } from '../ui';
import { GITHUB_URL, CONTACT_EMAIL } from '../content';

const siteLinks = [
  { to: '/products', label: '제품' },
  { to: '/tech', label: '기술' },
  { to: '/tech/notes', label: '엔지니어링 노트' },
  { to: '/about', label: '소개' },
  { to: '/contact', label: '연락' },
];

/** 개발용 진입점. GNB 에서 빼고 여기로 격리한다. */
const devLinks = [
  { to: '/app', label: '서비스 데모' },
  { to: '/designs', label: '설계 문서' },
  { to: '/profile', label: '프로필' },
  { to: '/templates', label: 'MUI 템플릿' },
  { to: '/components', label: '컴포넌트 카탈로그' },
  { to: '/showcase', label: '컴포넌트 쇼케이스' },
];

function LinkGroup({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <Box>
      <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.14em', color: 'text.secondary', mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {items.map((l) => (
          <Link
            key={l.to}
            component={RouterLink}
            to={l.to}
            underline="hover"
            variant="body2"
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            {l.label}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 4, sm: 8 }}>
          <LinkGroup title="SITE" items={siteLinks} />
          <LinkGroup title="DEV" items={devLinks} />
          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.14em', color: 'text.secondary', mb: 1.5 }}>
              CONTACT
            </Typography>
            <Stack spacing={1}>
              <Link href={`mailto:${CONTACT_EMAIL}`} underline="hover" variant="body2" sx={{ color: 'text.secondary' }}>
                {CONTACT_EMAIL}
              </Link>
              <Link href={GITHUB_URL} target="_blank" rel="noopener" underline="hover" variant="body2" sx={{ color: 'text.secondary' }}>
                GitHub
              </Link>
            </Stack>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: { xs: 4, md: 6 } }}>
          © {new Date().getFullYear()} 김찬호 · Built with React · MUI
        </Typography>
      </Container>
    </Box>
  );
}
