import { type Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MONO } from '../ui';

/**
 * 제품 화면 일러스트. 스크린샷 대신 테마 토큰만으로 그린다 —
 * 다크모드에서 그대로 따라가고, 실제 데이터(사용자명·문서 제목)가 노출되지 않으며,
 * 화면이 바뀔 때마다 캡처를 갱신하지 않아도 된다.
 * 전부 장식(aria-hidden)이다. 설명은 옆 텍스트 블록이 담당한다.
 */

/**
 * 팔레트 채널(`r g b`)로 반투명 색을 만든다. 이 테마는 CSS 변수 모드라 팔레트 값에 alpha() 를
 * 씌우면 스킴을 따라가지 않는다 — `*Channel` 변수는 라이트/다크 어느 쪽이든 현재 스킴 값이다.
 */
const pal = (t: Theme) => t.vars!.palette; // AppTheme 은 항상 cssVariables 모드 — vars 가 없는 테마는 이 사이트에 없다
const ink = (a: number) => (t: Theme) => `rgba(${pal(t).text.primaryChannel} / ${a})`;
const brand = (a: number) => (t: Theme) => `rgba(${pal(t).primary.mainChannel} / ${a})`;

const line = (w: string | number, strong?: boolean) => (
  <Box
    sx={{
      height: strong ? 10 : 7,
      width: w,
      borderRadius: 999,
      bgcolor: ink(strong ? 0.3 : 0.14),
    }}
  />
);

/** 브라우저 창 프레임. 상단 바 + 본문. */
function Window({ title, children, minHeight }: { title: string; children: React.ReactNode; minHeight?: number | string | Record<string, number> }) {
  return (
    <Box
      aria-hidden
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: (t) => `0 24px 60px -30px rgba(${pal(t).common.onBackgroundChannel} / 0.3)`,
        minHeight,
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.5, height: 34, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={0.6}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: ink(0.18) }} />
          ))}
        </Stack>
        <Box
          sx={{
            flexGrow: 1,
            mx: 2,
            height: 18,
            borderRadius: 999,
            bgcolor: ink(0.09),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontFamily: MONO, fontSize: 10, color: 'text.secondary', lineHeight: 1 }}>{title}</Typography>
        </Box>
      </Stack>
      <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

function TreeRow({ depth, w, active }: { depth: number; w: number; active?: boolean }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        pl: 1 + depth * 1.25,
        pr: 1,
        py: 0.55,
        borderRadius: '4px',
        bgcolor: active ? brand(0.12) : 'transparent',
      }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: active ? 'primary.main' : ink(0.22) }} />
      {line(w, active)}
    </Stack>
  );
}

/** WIKI — 좌측 페이지 트리 + 우측 문서, 인라인 댓글 하나. */
export function WikiMock() {
  return (
    <Window title="/wiki/spaces/platform/pages/…" minHeight={300}>
      <Box sx={{ width: 132, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', p: 1, display: { xs: 'none', sm: 'block' } }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary', px: 1, pb: 0.75 }}>SPACE</Typography>
        <TreeRow depth={0} w={64} />
        <TreeRow depth={1} w={52} />
        <TreeRow depth={1} w={70} active />
        <TreeRow depth={2} w={44} />
        <TreeRow depth={2} w={58} />
        <TreeRow depth={0} w={48} />
        <TreeRow depth={1} w={60} />
      </Box>
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, position: 'relative' }}>
        <Box sx={{ height: 16, width: '55%', borderRadius: 1, bgcolor: ink(0.34), mb: 2 }} />
        <Stack spacing={1}>
          {line('92%')}
          {line('78%')}
          {line('86%')}
        </Stack>
        <Box sx={{ mt: 2, mb: 2, pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.main' }}>
          <Stack spacing={1}>
            {line('70%')}
            {line('50%')}
          </Stack>
        </Box>
        <Stack spacing={1}>
          {line('88%')}
          <Box sx={{ position: 'relative', display: 'inline-block', width: '64%' }}>
            <Box sx={{ height: 7, borderRadius: 999, bgcolor: (t) => `rgba(${pal(t).warning.mainChannel} / 0.5)` }} />
          </Box>
          {line('40%')}
        </Stack>
        {/* 인라인 댓글 카드 */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 16 },
            bottom: { xs: 8, md: 20 },
            width: 150,
            p: 1.25,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            boxShadow: 1,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.75 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'primary.main' }} />
            {line(48, true)}
          </Stack>
          <Stack spacing={0.6}>
            {line('100%')}
            {line('72%')}
          </Stack>
        </Box>
      </Box>
    </Window>
  );
}

function IssueCard({ keyText, w, priority }: { keyText: string; w: string; priority: 'error' | 'warning' | 'success' }) {
  return (
    <Box sx={{ p: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
      {line(w, true)}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 9, color: 'text.secondary', lineHeight: 1 }}>{keyText}</Typography>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${priority}.main` }} />
      </Stack>
    </Box>
  );
}

/** ALM — 칸반 보드 3열 + 상단 스프린트 바. */
export function AlmMock() {
  const columns: { name: string; cards: { k: string; w: string; p: 'error' | 'warning' | 'success' }[] }[] = [
    { name: 'TO DO', cards: [{ k: 'PLT-41', w: '80%', p: 'warning' }, { k: 'PLT-42', w: '60%', p: 'success' }, { k: 'PLT-45', w: '72%', p: 'success' }] },
    { name: 'IN PROGRESS', cards: [{ k: 'PLT-38', w: '88%', p: 'error' }, { k: 'PLT-40', w: '55%', p: 'warning' }] },
    { name: 'DONE', cards: [{ k: 'PLT-31', w: '66%', p: 'success' }, { k: 'PLT-35', w: '78%', p: 'success' }, { k: 'PLT-36', w: '50%', p: 'warning' }] },
  ];
  return (
    <Window title="/alm/projects/PLT/board" minHeight={300}>
      <Box sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ height: 12, width: 110, borderRadius: 1, bgcolor: ink(0.34) }} />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ height: 6, width: 90, borderRadius: 999, bgcolor: ink(0.12), overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: '62%', bgcolor: 'primary.main' }} />
          </Box>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.25, flexGrow: 1 }}>
          {columns.map((c) => (
            <Box key={c.name} sx={{ p: 1, borderRadius: '8px', bgcolor: ink(0.08) }}>
              <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary', mb: 1, px: 0.5 }}>
                {c.name} · {c.cards.length}
              </Typography>
              <Stack spacing={1}>
                {c.cards.map((card) => (
                  <IssueCard key={card.k} keyText={card.k} w={card.w} priority={card.p} />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
    </Window>
  );
}

function Node({ label, accent, mono }: { label: string; accent?: boolean; mono?: boolean }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: '6px',
        border: '1px solid',
        borderColor: accent ? 'primary.main' : 'divider',
        bgcolor: accent ? brand(0.1) : 'background.default',
        textAlign: 'center',
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontFamily: mono ? MONO : undefined, fontSize: 11, fontWeight: accent ? 700 : 500, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  );
}

const Arrow = () => (
  <Box sx={{ flexGrow: 1, minWidth: 12, height: 1, borderTop: '1px dashed', borderColor: ink(0.34) }} />
);

/** 플랫폼 — 요청 경로 다이어그램: 브라우저 → nginx → 게이트웨이 → 서비스 → 데이터. */
export function PlatformMock() {
  return (
    <Window title="request → nginx → gateway → service" minHeight={300}>
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Node label="브라우저" />
          <Arrow />
          <Node label="nginx" mono />
          <Arrow />
          <Node label="Gateway · JWT" accent />
          <Arrow />
          <Node label="Eureka" mono />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Node label="Keycloak" accent />
          <Node label="auth" mono />
          <Node label="wiki" mono />
          <Node label="alm" mono />
          <Node label="org" mono />
          <Node label="board" mono />
          <Node label="search" mono />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Node label="PostgreSQL" />
          <Node label="Redis Streams" />
          <Node label="MinIO" />
          <Node label="OpenSearch" />
          <Node label="Loki · Grafana" />
        </Stack>
      </Box>
    </Window>
  );
}

/** 히어로용 — 위키 문서와 이슈 목록이 한 창에 나란히. "한 곳에서"를 그림으로. */
export function WorkspaceMock() {
  return (
    <Window title="chanho · 한 번 로그인, 문서와 이슈를 한 창에서" minHeight={{ xs: 260, md: 420 }}>
      <Box sx={{ width: 150, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', p: 1.25, display: { xs: 'none', md: 'block' } }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1, pb: 1.5 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: 'primary.main' }} />
          {line(56, true)}
        </Stack>
        <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary', px: 1, pb: 0.5 }}>WIKI</Typography>
        <TreeRow depth={0} w={70} active />
        <TreeRow depth={1} w={54} />
        <TreeRow depth={1} w={62} />
        <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary', px: 1, pt: 1.5, pb: 0.5 }}>ALM</Typography>
        <TreeRow depth={0} w={64} />
        <TreeRow depth={1} w={48} />
        <TreeRow depth={1} w={58} />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.3fr 1fr' }, minWidth: 0 }}>
        <Box sx={{ p: { xs: 2, md: 3 }, borderRight: { sm: '1px solid' }, borderColor: { sm: 'divider' } }}>
          <Box sx={{ height: 18, width: '60%', borderRadius: 1, bgcolor: ink(0.34), mb: 2.5 }} />
          <Stack spacing={1.1}>
            {line('94%')}
            {line('82%')}
            {line('88%')}
            {line('60%')}
          </Stack>
          <Box sx={{ mt: 2.5, p: 1.5, borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: brand(0.06) }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'primary.main' }} />
              <Typography sx={{ fontFamily: MONO, fontSize: 10, color: 'primary.main', lineHeight: 1 }}>PLT-38</Typography>
              {line(90)}
            </Stack>
          </Box>
          <Stack spacing={1.1} sx={{ mt: 2.5 }}>
            {line('76%')}
            {line('90%')}
          </Stack>
        </Box>
        <Box sx={{ p: { xs: 2, md: 2.5 }, display: { xs: 'none', sm: 'block' } }}>
          <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary', mb: 1.25 }}>SPRINT 12 · 이번 주</Typography>
          <Stack spacing={1}>
            <IssueCard keyText="PLT-38" w="82%" priority="error" />
            <IssueCard keyText="PLT-40" w="58%" priority="warning" />
            <IssueCard keyText="PLT-41" w="70%" priority="success" />
            <IssueCard keyText="PLT-42" w="64%" priority="success" />
          </Stack>
        </Box>
      </Box>
    </Window>
  );
}
