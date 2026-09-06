import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, SpecTable } from '../ui';
import { getProduct, type Product } from '../content';
import { useSeo, productJsonLd } from '../seo';
import NotFoundPage from '../../app/pages/NotFoundPage';

/**
 * 라우트 진입점. SEO 훅은 제품이 있을 때만 도는 안쪽 컴포넌트에 둔다 —
 * 훅은 조기 반환보다 먼저 불러야 하는데, 없는 제품(404)에 canonical 과 JSON-LD 를 심으면
 * 존재하지 않는 URL 을 색인해 달라고 크롤러에 말하는 셈이 되기 때문이다.
 */
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  if (!product) return <NotFoundPage />;
  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  useSeo({
    title: `${product.name} — ${product.tagline} | chanho`,
    description: product.summary,
    canonicalPath: `/products/${product.slug}`,
    jsonLd: productJsonLd(product),
  });

  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 } }}>
        <Button component={RouterLink} to="/products" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary', mb: 3, ml: -1 }}>
          제품
        </Button>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', lineHeight: 1.1, mb: 2 }}>
          {product.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 680, fontSize: '1.1rem', lineHeight: 1.7 }}>
          {product.summary}
        </Typography>
        {/*
          CTA 순서는 "지금 열 수 있는 것" → "읽을 것" → "소스". 저장소가 비공개인 제품은
          소스 버튼을 아예 그리지 않는다 — 없는 링크를 만들지 않기 위해서다.
        */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
          {product.liveUrl && (
            <Button variant="contained" href={product.liveUrl} startIcon={<LaunchRoundedIcon />} sx={{ borderRadius: 999 }}>
              라이브로 열기
            </Button>
          )}
          {product.entryPoints?.map((e, i) => (
            <Button
              key={e.href}
              variant={!product.liveUrl && i === 0 ? 'contained' : 'outlined'}
              href={e.href}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ borderRadius: 999 }}
            >
              {e.label}
            </Button>
          ))}
          {product.repoUrl && (
            <Button
              variant={product.liveUrl || product.entryPoints?.length ? 'outlined' : 'contained'}
              href={product.repoUrl}
              target="_blank"
              rel="noopener"
              startIcon={<GitHubIcon />}
              sx={{ borderRadius: 999 }}
            >
              소스 보기
            </Button>
          )}
        </Stack>
      </Container>

      <GridSection index="01" label="SPEC" title="구성">
        <SpecTable rows={product.spec} />
      </GridSection>

      {product.highlights.length > 0 && (
        <GridSection index="02" label="DECISIONS" title="설계에서 판단한 것들">
          <Stack spacing={2.5}>
            {product.highlights.map((h) => (
              <Stack key={h} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: 'primary.main', flexShrink: 0, mt: 0.5 }} />
                <Typography variant="body2" sx={{ lineHeight: 1.85, color: 'text.primary' }}>
                  {h}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </GridSection>
      )}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
