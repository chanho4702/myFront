import { Link as RouterLink, useParams } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SitePage from '../components/SitePage';
import { GridSection, HairlineCard, SpecTable, MONO, ANCHOR_OFFSET } from '../ui';
import { getProduct, type Product, type Scenario, type SetupStep } from '../content';
import { useSeo, productJsonLd } from '../seo';
import NotFoundPage from '../../app/pages/NotFoundPage';

/** CSS 변수 모드라 팔레트 값에 alpha() 를 씌우면 스킴을 안 따라간다 — 채널 변수로 만든다. */
const ink = (a: number) => (t: Theme) => `rgba(${t.vars!.palette.text.primaryChannel} / ${a})`; // AppTheme 은 항상 cssVariables 모드
const brand = (a: number) => (t: Theme) => `rgba(${t.vars!.palette.primary.mainChannel} / ${a})`;

/**
 * 도구 흐름 한 줄. `~…~` 로 감싼 항목은 MCP 도구가 아니라 사람의 작업이나 다른 경로라는 뜻이라
 * 모노 칩이 아닌 점선 칩으로 그린다 — 읽는 사람이 "이건 도구 이름"과 "이건 설명"을 섞지 않게.
 */
function FlowChips({ flow }: { flow: string[] }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
      {flow.map((raw, i) => {
        const aside = raw.startsWith('~') && raw.endsWith('~');
        const text = aside ? raw.slice(1, -1) : raw;
        return (
          <Box key={raw} sx={{ display: 'contents' }}>
            {i > 0 && (
              <Typography aria-hidden component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1 }}>
                →
              </Typography>
            )}
            <Box
              component="span"
              sx={{
                px: 0.9,
                py: 0.4,
                borderRadius: '4px',
                border: '1px solid',
                borderStyle: aside ? 'dashed' : 'solid',
                borderColor: aside ? 'divider' : brand(0.35),
                bgcolor: aside ? 'transparent' : brand(0.08),
                color: aside ? 'text.secondary' : 'primary.main',
                fontFamily: aside ? undefined : MONO,
                fontSize: aside ? '0.75rem' : '0.72rem',
                lineHeight: 1.4,
              }}
            >
              {text}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** 시나리오 한 장 — 상황 / 도구 흐름 / 사람의 자리. 세 칸 순서를 카드마다 고정한다. */
function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <Box id={scenario.id} sx={{ height: '100%', scrollMarginTop: ANCHOR_OFFSET, '&:focus': { outline: 'none' } }}>
      <HairlineCard>
        <Stack spacing={1.75} sx={{ height: '100%' }}>
          <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
            {scenario.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75, wordBreak: 'keep-all' }}>
            {scenario.situation}
          </Typography>
          <FlowChips flow={scenario.flow} />
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', mt: 'auto', pt: 0.5 }}>
            <PersonRoundedIcon sx={{ fontSize: 17, color: 'primary.main', mt: '2px', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.7, wordBreak: 'keep-all' }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                사람의 자리 —{' '}
              </Box>
              {scenario.human}
            </Typography>
          </Stack>
          {scenario.doc && (
            <Link href={scenario.doc.href} variant="body2" sx={{ fontWeight: 600 }}>
              {scenario.doc.label} →
            </Link>
          )}
        </Stack>
      </HairlineCard>
    </Box>
  );
}

/** 연결 단계 하나 — 큰 번호 + 설명 + 그대로 복사하는 스니펫. */
function SetupCard({ step, n }: { step: SetupStep; n: number }) {
  return (
    <Stack direction="row" spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'flex-start' }}>
      <Typography
        aria-hidden
        sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '1.5rem', color: 'primary.main', lineHeight: 1.1, width: 34, flexShrink: 0 }}
      >
        {String(n).padStart(2, '0')}
      </Typography>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 1 }}>
          {step.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, wordBreak: 'keep-all' }}>
          {step.body}
        </Typography>
        {step.code && (
          // 가로 스크롤은 코드 블록 안에서만 일어난다 — 페이지 본문이 옆으로 밀리면 안 된다.
          <Box
            component="pre"
            sx={{
              mt: 2,
              mb: 0,
              p: 2,
              borderRadius: '6px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: ink(0.05),
              overflowX: 'auto',
              fontFamily: MONO,
              fontSize: '0.78rem',
              lineHeight: 1.75,
            }}
          >
            <code>{step.code}</code>
          </Box>
        )}
      </Box>
    </Stack>
  );
}

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
    // 활용법이 검색 스니펫에 와야 하는 제품만 따로 쓴다. 없으면 리드 문단 그대로.
    description: product.metaDescription ?? product.summary,
    canonicalPath: `/products/${product.slug}`,
    jsonLd: productJsonLd(product),
  });

  /*
    섹션 번호는 세어서 붙인다 — 제품마다 있는 섹션이 다른데 번호를 손으로 박으면
    시나리오가 없는 제품에서 01 다음에 04 가 오는 식으로 어긋난다.
  */
  let n = 0;
  const idx = () => String(++n).padStart(2, '0');

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

      <GridSection index={idx()} label="SPEC" title="구성">
        <SpecTable rows={product.spec} />
      </GridSection>

      {product.scenarios && product.scenarios.length > 0 && (
        <GridSection
          id="scenarios"
          index={idx()}
          label="SCENARIOS"
          title="이렇게 씁니다"
          caption="에이전트에게 무엇을 맡길 수 있는지, 그때 어떤 도구를 어떤 순서로 밟는지, 사람이 어디서 판단하는지를 한 장에 담았습니다. 파란 칩은 실제 MCP 도구 이름입니다."
        >
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {product.scenarios.map((s) => (
              <Grid key={s.id} size={{ xs: 12, md: 6 }}>
                <ScenarioCard scenario={s} />
              </Grid>
            ))}
          </Grid>
        </GridSection>
      )}

      {product.setup && product.setup.length > 0 && (
        <GridSection
          id="setup"
          index={idx()}
          label="SETUP"
          title="연결하는 법"
          caption="관리자가 한 번 발급하고, 각자 클라이언트에 등록하면 끝입니다. 토큰 값은 전부 플레이스홀더이니 그대로 복사해 쓰지 마세요."
        >
          <Stack spacing={{ xs: 4, md: 5 }}>
            {product.setup.map((step, i) => (
              <SetupCard key={step.title} step={step} n={i + 1} />
            ))}
          </Stack>
        </GridSection>
      )}

      {product.highlights.length > 0 && (
        <GridSection index={idx()} label="DECISIONS" title="설계에서 판단한 것들">
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
