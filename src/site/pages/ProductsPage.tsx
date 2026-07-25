import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, HairlineCard, MONO } from '../ui';
import { ossProducts, companyProducts, type Product } from '../content';

function ProductCard({ product }: { product: Product }) {
  return (
    <HairlineCard to={`/products/${product.slug}`}>
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            {product.name}
          </Typography>
          {/*
            `liveUrl` 이 있으면 지금 바로 열어볼 수 있다는 뜻이다. 이 신호가 인덱스에 없으면
            방문자는 상세로 들어가 봐야 구동 여부를 알 수 있다 — 구 랜딩에 있던 표기를 유지한다.
          */}
          {product.liveUrl && <Chip label="라이브" size="small" color="primary" variant="outlined" sx={{ borderRadius: '4px' }} />}
          {product.badge && <Chip label={product.badge} size="small" color="primary" variant="outlined" sx={{ borderRadius: '4px' }} />}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
          {product.tagline}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: MONO, letterSpacing: '0.08em' }}
          >
            {product.repoUrl ? 'OPEN SOURCE' : '사내·고객사 제품 · 비공개'}
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
          직접 만들어 공개한 오픈소스와, 재직 중 만든 사내 제품.
        </Typography>
      </Container>

      <GridSection index="01" label="OPEN SOURCE" title="공개한 제품">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {ossProducts.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      </GridSection>

      <GridSection index="02" label="COMPANY" title="재직 중 개발">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {companyProducts.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6 }}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      </GridSection>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
