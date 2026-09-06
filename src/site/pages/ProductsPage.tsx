import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, HairlineCard, ComparisonTable, MONO } from '../ui';
import { products, comparison, type Product } from '../content';
import { useSeo } from '../seo';

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
          {/* 저장소가 비공개인 제품에 'OPEN SOURCE' 를 찍지 않는다 — kicker 가 그 자리를 대신한다. */}
          <Typography variant="caption" sx={{ fontFamily: MONO, letterSpacing: '0.08em' }}>
            {product.kicker ?? 'OPEN SOURCE'}
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Stack>
      </Stack>
    </HairlineCard>
  );
}

export default function ProductsPage() {
  useSeo({
    title: '제품 — WIKI · ALM · AI Agent · MSA 플랫폼 | chanho',
    description:
      '문서 위키(WIKI), 이슈·스프린트 트래커(ALM), MCP 로 둘을 다루는 AI 에이전트, 그리고 셋이 올라가는 MSA 플랫폼 템플릿. 도커로 셀프호스팅합니다.',
    canonicalPath: '/products',
  });
  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 5, md: 8 } }}>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.08 }}>
          제품
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 620, fontSize: '1.1rem', lineHeight: 1.7 }}>
          문서, 이슈, 그 둘을 다루는 AI 에이전트, 그리고 셋이 올라가는 플랫폼. 한 계정으로 이어집니다.
        </Typography>
      </Container>

      <GridSection index="01" label="PRODUCTS" title="네 가지 제품">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {products.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      </GridSection>
      {/* 대조표 — 답변 엔진이 "Confluence 대안" 질문에 인용할 사실을 한 표에 모아 둔다. */}
      <GridSection index="02" label="COMPARISON" title={comparison.title} caption={comparison.sub}>
        <ComparisonTable columns={comparison.columns} rows={comparison.rows} caption="비교 대상 제품의 정보는 널리 알려진 공개 사실만 적었습니다. 요금·기능은 각 제품의 공식 페이지에서 확인하세요." />
      </GridSection>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
