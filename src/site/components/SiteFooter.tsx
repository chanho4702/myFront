import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { MONO } from '../ui';
import { BRAND, BRAND_TAGLINE, GITHUB_URL, CONTACT_EMAIL, products, openSource } from '../content';
import BrandLogo from './BrandLogo';

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

const productLinks: FooterLink[] = [
  ...products.map((p) => ({ label: p.name, to: `/products/${p.slug}` })),
  { label: '제품 전체', to: '/products' },
];

const resourceLinks: FooterLink[] = [
  { label: '기술 구성', to: '/tech' },
  { label: '엔지니어링 노트', href: '/docs/' },
  { label: '문의', to: '/contact' },
];

const openSourceLinks: FooterLink[] = openSource.repos.map((r) => ({ label: r.name, href: r.url }));

/** 개발용 진입점. GNB 에서 빼고 여기로 격리한다. */
const devLinks: FooterLink[] = [
  { label: '서비스 데모', to: '/app' },
  { label: '설계 문서', to: '/designs' },
  { label: 'MUI 템플릿', to: '/templates' },
  { label: '컴포넌트 카탈로그', to: '/components' },
];

function LinkGroup({ title, items }: { title: string; items: FooterLink[] }) {
  return (
    <Box>
      <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.14em', color: 'text.secondary', mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {items.map((l) =>
          l.to ? (
            <Link key={l.label} component={RouterLink} to={l.to} underline="hover" variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              {l.label}
            </Link>
          ) : (
            // 같은 오리진의 형제 앱(/docs/ 등)은 같은 탭, 바깥 사이트만 새 탭.
            <Link
              key={l.label}
              href={l.href}
              {...(/^[a-z]+:/i.test(l.href ?? '') ? { target: '_blank', rel: 'noopener' } : {})}
              underline="hover"
              variant="body2"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              {l.label}
            </Link>
          ),
        )}
      </Stack>
    </Box>
  );
}

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <BrandLogo size={30} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, maxWidth: 280, lineHeight: 1.7 }}>
              {BRAND_TAGLINE}. 문서 위키와 이슈 트래커를 하나의 로그인 위에 올린 오픈소스 협업 플랫폼.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <LinkGroup title="PRODUCT" items={productLinks} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <LinkGroup title="RESOURCES" items={resourceLinks} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <LinkGroup title="OPEN SOURCE" items={openSourceLinks} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <LinkGroup title="DEV" items={devLinks} />
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 3 }}
          sx={{ mt: { xs: 5, md: 7 }, pt: 3, borderTop: '1px solid', borderColor: 'divider', alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} {BRAND} · 오픈소스로 공개
          </Typography>
          <Stack direction="row" spacing={2.5}>
            <Link href={`mailto:${CONTACT_EMAIL}`} underline="hover" variant="caption" sx={{ color: 'text.secondary' }}>
              {CONTACT_EMAIL}
            </Link>
            <Link href={GITHUB_URL} target="_blank" rel="noopener" underline="hover" variant="caption" sx={{ color: 'text.secondary' }}>
              GitHub
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
