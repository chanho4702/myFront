import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SitePage from '../components/SitePage';
import { GridSection, SpecTable } from '../ui';
import { getProduct } from '../content';
import NotFoundPage from '../../app/pages/NotFoundPage';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  if (!product) return <NotFoundPage />;

  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 } }}>
        <Button component={RouterLink} to="/products" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary', mb: 3, ml: -1 }}>
          제품
        </Button>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', lineHeight: 1.1 }}>
            {product.name}
          </Typography>
          {product.badge && <Chip label={product.badge} size="small" color="primary" variant="outlined" />}
        </Stack>
        <Typography sx={{ color: 'text.secondary', maxWidth: 680, fontSize: '1.1rem', lineHeight: 1.7 }}>
          {product.summary}
        </Typography>
        {/*
          링크가 하나도 없는 사내 제품(moves-*)은 버튼 영역이 비어 여백만 남는다.
          구 상세 페이지가 이 자리에 "비공개" 표기를 렌더했었으므로 그 정보를 잃지 않는다.
        */}
        {product.liveUrl || product.repoUrl ? (
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
            {product.liveUrl && (
              <Button variant="contained" href={product.liveUrl} startIcon={<LaunchRoundedIcon />} sx={{ borderRadius: '4px' }}>
                라이브로 열기
              </Button>
            )}
            {product.repoUrl && (
              <Button
                variant={product.liveUrl ? 'outlined' : 'contained'}
                href={product.repoUrl}
                target="_blank"
                rel="noopener"
                startIcon={<GitHubIcon />}
                sx={{ borderRadius: '4px' }}
              >
                소스 보기
              </Button>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
            사내·고객사 제품 — 소스와 데모를 공개하지 않습니다.
          </Typography>
        )}
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
