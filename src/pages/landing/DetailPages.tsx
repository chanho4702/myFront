import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import NotFoundPage from '../../app/pages/NotFoundPage';
import LandingHeader from './LandingHeader';
import { getCapability as getService, getProduct } from '../../site/content';

// What I do / 제품 상세 공통 셸. 본문은 준비 중 플레이스홀더 + 항목별 액션.
function DetailShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <LandingHeader anchorBase="/" />
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.18em', display: 'block' }}>
          {eyebrow}
        </Typography>
        <Typography
          component="h1"
          sx={{ fontWeight: 800, mt: 1.5, letterSpacing: '-0.03em', lineHeight: 1.08, fontSize: 'clamp(2.2rem, 6vw, 3.5rem)' }}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: 620 }}>
          {sub}
        </Typography>

        <Divider sx={{ my: { xs: 4, md: 5 } }} />

        {children}

        <Divider sx={{ my: { xs: 4, md: 5 } }} />
        <Button component={RouterLink} to="/" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary' }}>
          홈으로
        </Button>
      </Container>
    </AppTheme>
  );
}

// 준비 중 플레이스홀더 — 상세 본문은 아직 없음(정직한 표기).
function ComingSoon() {
  return (
    <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
      상세 내용은 준비 중입니다.
    </Typography>
  );
}

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = getService(slug);
  if (!service) return <NotFoundPage />;
  return (
    <DetailShell eyebrow="WHAT I DO" title={service.title} sub={service.lead}>
      <Typography sx={{ color: 'text.primary', lineHeight: 1.8, mb: 3 }}>{service.evidence}</Typography>
      <ComingSoon />
    </DetailShell>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  if (!product) return <NotFoundPage />;
  const eyebrow = product.badge ? '디무브' : 'OPEN SOURCE';
  return (
    <DetailShell eyebrow={eyebrow} title={product.name} sub={product.tagline}>
      <ComingSoon />
      <Box sx={{ mt: 4 }}>
        {product.repoUrl ? (
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            {product.liveUrl && (
              <Button variant="contained" href={product.liveUrl} startIcon={<LaunchRoundedIcon />}>
                라이브로 열기
              </Button>
            )}
            <Button
              variant={product.liveUrl ? 'outlined' : 'contained'}
              href={product.repoUrl}
              target="_blank"
              rel="noopener"
              startIcon={<GitHubIcon />}
            >
              소스 보기
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={product.badge} size="small" color="primary" variant="outlined" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              디무브 사내·고객사 제품 · 비공개
            </Typography>
          </Stack>
        )}
      </Box>
    </DetailShell>
  );
}
