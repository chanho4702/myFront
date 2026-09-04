import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, HairlineCard, MONO } from '../ui';
import { products, type Product } from '../content';

function ProductCard({ product }: { product: Product }) {
  return (
    <HairlineCard to={`/products/${product.slug}`}>
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            {product.name}
          </Typography>
          {/* `liveUrl` 이 있으면 지금 바로 열어볼 수 있다는 뜻이다 — 인덱스에서 바로 보이게 한다. */}
          {product.liveUrl && <Chip label="라이브" size="small" color="primary" variant="outlined" sx={{ borderRadius: '4px' }} />}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
          {product.tagline}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ fontFamily: MONO, letterSpacing: '0.08em' }}>
            OPEN SOURCE
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Stack>
      </Stack>
    </HairlineCard>
  );
}

export default function ProductsPage() {
  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 5, md: 8 } }}>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.08 }}>
          제품
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 620, fontSize: '1.1rem', lineHeight: 1.7 }}>
          문서, 이슈, 그리고 둘이 올라가는 플랫폼. 셋이 한 계정으로 이어집니다.
        </Typography>
      </Container>

      <GridSection index="01" label="PRODUCTS" title="세 가지 제품">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {products.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      </GridSection>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
