import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../site/components/SitePage';
import { GridSection, StatBar, HairlineCard, MONO } from '../site/ui';
import { stats, ossProducts, capabilities, notes } from '../site/content';

export default function Home() {
  const latest = notes.slice(-3).reverse();

  return (
    <SitePage>
      {/* Hero — 가치 제안 */}
      <Box
        component="section"
        sx={{
          background: (theme) =>
            `radial-gradient(ellipse 90% 55% at 12% -10%, ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'dark' ? 0.18 : 0.07,
            )}, transparent)`,
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 9, md: 16 }, pb: { xs: 7, md: 12 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 4 }}>
            <Avatar alt="김찬호 프로필 사진" src="/profile.png" sx={{ width: 40, height: 40 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              김찬호 · 플랫폼 백엔드 엔지니어
            </Typography>
          </Stack>

          <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, fontSize: 'clamp(2.8rem, 8.5vw, 5.5rem)' }}>
            수작업을{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              시스템
            </Box>
            으로
            <br />
            바꿉니다
          </Typography>
          <Typography sx={{ mt: 4, maxWidth: 600, color: 'text.secondary', fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)', lineHeight: 1.6 }}>
            플랫폼 설계부터 운영까지 — 데이터 기반 의사결정 체계를 만드는 엔지니어링.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 5 }}>
            <Button component={RouterLink} to="/products" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: '4px' }}>
              제품 보기
            </Button>
            <Button component={RouterLink} to="/contact" variant="outlined" size="large" sx={{ borderRadius: '4px' }}>
              문의하기
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 신뢰 바 */}
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 4 } }}>
        <StatBar items={stats} />
      </Container>

      <GridSection index="01" label="PRODUCTS" title="만든 것들" caption="직접 설계하고 공개한 제품들.">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {ossProducts.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 3 }}>
              <HairlineCard to={`/products/${p.slug}`}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 1 }}>
                  {p.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {p.tagline}
                </Typography>
              </HairlineCard>
            </Grid>
          ))}
        </Grid>
        <Button component={RouterLink} to="/products" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, ml: -1 }}>
          제품 전체 보기
        </Button>
      </GridSection>

      <GridSection index="02" label="CAPABILITIES" title="무엇을 해드리는가">
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {capabilities.map((c) => (
            <Grid key={c.slug} size={{ xs: 12, sm: 6 }}>
              <HairlineCard to={`/tech#cap-${c.slug}`}>
                <Typography variant="caption" sx={{ fontFamily: MONO, letterSpacing: '0.1em', color: 'text.secondary' }}>
                  {c.title}
                </Typography>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mt: 0.5, mb: 1.5 }}>
                  {c.lead}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
                  {c.evidence}
                </Typography>
              </HairlineCard>
            </Grid>
          ))}
        </Grid>
      </GridSection>

      <GridSection index="03" label="NOTES" title="엔지니어링 노트" caption={`플랫폼을 만들며 남긴 기록 ${notes.length}편.`}>
        <Stack spacing={1.5}>
          {latest.map((n) => (
            <HairlineCard key={n.id} to={`/tech/notes/${n.id}`}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }} sx={{ alignItems: { sm: 'baseline' } }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'primary.main', fontVariantNumeric: 'tabular-nums', width: { sm: 64 }, flexShrink: 0 }}>
                  NO.{n.id}
                </Typography>
                <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>{n.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                  {n.date}
                </Typography>
              </Stack>
            </HairlineCard>
          ))}
        </Stack>
        <Button component={RouterLink} to="/tech/notes" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, ml: -1 }}>
          노트 전체 보기
        </Button>
      </GridSection>

      <GridSection index="04" label="CONTACT" title="함께 일할 사람을 찾고 계신가요?" caption="플랫폼을 설계하고, 데이터로 굴러가게 만들고, 팀이 더 빠르게 만들 환경까지 함께 세울 사람입니다.">
        <Button component={RouterLink} to="/contact" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: '4px' }}>
          연락처 보기
        </Button>
      </GridSection>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
