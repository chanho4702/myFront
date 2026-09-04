import { Link as RouterLink } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import SitePage from '../site/components/SitePage';
import { WorkspaceMock, WikiMock, AlmMock, PlatformMock } from '../site/components/ProductMocks';
import { HairlineCard, MONO } from '../site/ui';
import { hero, pain, features, composition, openSource, faq, finalCta, definition, GITHUB_URL, START_URL, getProduct, type Feature } from '../site/content';
import { useSeo, softwareApplicationJsonLd, faqPageJsonLd } from '../site/seo';

const PILL = { borderRadius: 999, px: 3 } as const;

/** CSS 변수 모드라 팔레트 값에 alpha() 를 씌우면 스킴을 안 따라간다 — 채널 변수로 만든다. */
const brand = (a: number) => (t: Theme) => `rgba(${t.vars!.palette.primary.mainChannel} / ${a})`; // AppTheme 은 항상 cssVariables 모드

/** 섹션 공통 헤더 — 가운데 정렬, 큰 제목 + 한 줄 부제. affine.pro 의 섹션 리듬. */
function SectionHead({ eyebrow, title, sub, align = 'center' }: { eyebrow?: string; title: string; sub?: string; align?: 'center' | 'left' }) {
  return (
    <Box sx={{ textAlign: align, mx: align === 'center' ? 'auto' : 0, maxWidth: 760, mb: { xs: 5, md: 7 } }}>
      {eyebrow && (
        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', letterSpacing: '0.16em', color: 'primary.main', fontWeight: 700, mb: 1.5 }}>
          {eyebrow}
        </Typography>
      )}
      <Typography component="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, fontSize: 'clamp(1.8rem, 4.2vw, 2.8rem)', wordBreak: 'keep-all' }}>
        {title}
      </Typography>
      {sub && (
        <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', lineHeight: 1.7 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

const mocks: Record<Feature['slug'], () => React.JSX.Element> = {
  wiki: WikiMock,
  alm: AlmMock,
  'msa-platform-template': PlatformMock,
};

/** 기능 블록 — 텍스트와 화면을 좌우 교차 배치. 홀수 블록은 화면이 오른쪽. */
function FeatureBlock({ feature, flip }: { feature: Feature; flip: boolean }) {
  const Mock = mocks[feature.slug];
  const product = getProduct(feature.slug);
  return (
    <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center', py: { xs: 6, md: 10 } }}>
      <Grid size={{ xs: 12, md: 5 }} sx={{ order: { md: flip ? 2 : 1 }, minWidth: 0 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', letterSpacing: '0.16em', color: 'primary.main', fontWeight: 700, mb: 1.5 }}>
          {feature.eyebrow} · {product?.name}
        </Typography>
        <Typography component="h3" sx={{ fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.18, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', wordBreak: 'keep-all' }}>
          {feature.title}
        </Typography>
        <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.75, fontSize: '1.05rem' }}>{feature.body}</Typography>
        <Stack component="ul" spacing={1} sx={{ mt: 3, pl: 0, listStyle: 'none', m: 0 }}>
          {feature.bullets.map((b) => (
            <Stack key={b} component="li" direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <CheckRoundedIcon sx={{ fontSize: 18, color: 'primary.main', mt: '3px' }} />
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {b}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
          {feature.liveUrl && (
            <Button href={feature.liveUrl} variant="contained" endIcon={<LaunchRoundedIcon />} sx={PILL}>
              {product?.name} 열기
            </Button>
          )}
          <Button component={RouterLink} to={`/products/${feature.slug}`} variant={feature.liveUrl ? 'text' : 'outlined'} endIcon={<ArrowForwardRoundedIcon />} sx={PILL}>
            자세히 보기
          </Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }} sx={{ order: { md: flip ? 1 : 2 }, minWidth: 0 }}>
        <Mock />
      </Grid>
    </Grid>
  );
}

export default function Home() {
  useSeo({
    title: 'chanho — 문서·이슈·협업을 한 곳에서 | 오픈소스 Confluence·Jira 대안',
    description: definition,
    canonicalPath: '/',
    // 홈은 "제품이 무엇인가"와 "자주 묻는 질문" 둘 다를 답한다 — 답변 엔진이 두 스키마를 각각 쓴다.
    jsonLd: [softwareApplicationJsonLd(), faqPageJsonLd(faq)],
  });
  return (
    <SitePage>
      {/* Hero — 중앙 정렬, 큰 헤드라인, 단일 주 CTA */}
      <Box
        component="section"
        sx={{
          background: (t) => `radial-gradient(ellipse 70% 50% at 50% -10%, ${brand(0.14)(t)}, transparent)`,
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 9, md: 14 }, pb: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.06, fontSize: 'clamp(2.2rem, 7.6vw, 5.4rem)', mx: 'auto', maxWidth: 980, wordBreak: 'keep-all' }}
          >
            {hero.headline[0]}
            <Box component="br" sx={{ display: { xs: 'none', sm: 'inline' } }} />
            {hero.headline[1]}
          </Typography>
          <Typography
            sx={{ mt: 3.5, mx: 'auto', maxWidth: 640, color: 'text.secondary', fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', lineHeight: 1.65, whiteSpace: 'pre-line' }}
          >
            {hero.sub}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1.5, mt: 5 }}>
            <Button href={START_URL} variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ ...PILL, px: 4 }}>
              {hero.cta}
            </Button>
            <Button href={GITHUB_URL} target="_blank" rel="noopener" variant="outlined" size="large" startIcon={<GitHubIcon />} sx={PILL}>
              {hero.secondary}
            </Button>
          </Stack>
        </Container>

        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          <WorkspaceMock />
        </Container>

        {/* 구성 스트립 — 숫자는 전부 products.ts 스펙과 같은 사실 */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
          <Stack
            direction="row"
            sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: { xs: 3, md: 6 }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: 3 }}
          >
            {composition.map((c) => (
              <Stack key={c.label} direction="row" spacing={1.25} sx={{ alignItems: 'baseline' }}>
                <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '1.4rem', color: 'primary.main', lineHeight: 1 }}>{c.value}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {c.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 문제 제기 */}
      <Box component="section" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
          <SectionHead title={pain.title} sub={pain.sub} />
          <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1.25 }}>
            {pain.chips.map((c) => (
              <Chip key={c} label={c} sx={{ borderRadius: 999, px: 1, height: 36, fontSize: '0.95rem', fontWeight: 500 }} />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 3대 기능 블록 — 쓰기 / 추적 / 실행 */}
      <Box component="section" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 14 }, pb: { xs: 4, md: 6 } }}>
          <SectionHead
            eyebrow="ONE PLATFORM"
            title="쓰고, 추적하고, 실행하기 — 하나의 플랫폼에서"
            sub="문서 위키와 이슈 트래커가 같은 로그인, 같은 게이트웨이 위에서 돌아갑니다. 셋 중 무엇부터 시작해도 나머지가 이미 연결돼 있습니다."
          />
          {features.map((f, i) => (
            <FeatureBlock key={f.slug} feature={f} flip={i % 2 === 1} />
          ))}
        </Container>
      </Box>

      {/* 오픈소스 */}
      <Box component="section" sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: brand(0.04) }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
          <SectionHead eyebrow="OPEN SOURCE" title={openSource.title} sub={openSource.sub} />
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {openSource.repos.map((r) => (
              <Grid key={r.name} size={{ xs: 12, sm: 6, md: 3 }}>
                <HairlineCard href={r.url}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <GitHubIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {r.desc}
                  </Typography>
                </HairlineCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box component="section" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 14 } }}>
          <SectionHead eyebrow="FAQ" title="자주 묻는 질문" />
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {faq.map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                elevation={0}
                square
                sx={{ bgcolor: 'transparent', borderBottom: '1px solid', borderColor: 'divider', '&::before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, py: 1, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 마지막 CTA */}
      <Box
        component="section"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          background: (t) => `radial-gradient(ellipse 60% 70% at 50% 110%, ${brand(0.16)(t)}, transparent)`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
          <Typography component="h2" sx={{ fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', wordBreak: 'keep-all' }}>
            {finalCta.title}
          </Typography>
          <Typography sx={{ mt: 2.5, mx: 'auto', maxWidth: 560, color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.7 }}>
            {finalCta.sub}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1.5, mt: 5 }}>
            <Button href="/wiki/" variant="contained" size="large" endIcon={<LaunchRoundedIcon />} sx={PILL}>
              WIKI 열기
            </Button>
            <Button href="/alm/" variant="contained" size="large" endIcon={<LaunchRoundedIcon />} sx={PILL}>
              ALM 열기
            </Button>
            <Button href={GITHUB_URL} target="_blank" rel="noopener" variant="outlined" size="large" startIcon={<GitHubIcon />} sx={PILL}>
              GitHub
            </Button>
          </Stack>
        </Container>
      </Box>
    </SitePage>
  );
}
