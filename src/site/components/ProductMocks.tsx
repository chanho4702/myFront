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

/** 에이전트 활동 한 줄 — 왼쪽에 MCP 도구 이름(모노), 오른쪽에 남은 기록. */
function ToolRow({ tool, result, state }: { tool: string; result: string; state: 'done' | 'active' | 'wait' }) {
  const dot = state === 'done' ? 'success.main' : state === 'active' ? 'primary.main' : ink(0.28);
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot, mt: '5px', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: state === 'wait' ? 'text.secondary' : 'primary.main', lineHeight: 1.5 }}>
          {tool}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.55, wordBreak: 'keep-all' }}>{result}</Typography>
      </Box>
    </Stack>
  );
}

/**
 * AI Agent — 왼쪽에 페르소나 카드와 도구 호출 타임라인, 오른쪽에 그 결과로 남은 기록
 * (ALM 이슈 · 위키 보고서)과 승인 게이트. 도구 이름은 실제 MCP 도구 이름만 쓴다.
 */
export function AgentMock() {
  return (
    <Window title="MCP · /api/agent/mcp" minHeight={300}>
      <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, minWidth: 0 }}>
        <Box sx={{ p: { xs: 1.75, md: 2.25 }, borderRight: { sm: '1px solid' }, borderColor: { sm: 'divider' }, minWidth: 0 }}>
          {/* 페르소나 카드 — 사람 아바타가 아니라 kind=AGENT 멤버라는 표시 */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.75 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                bgcolor: brand(0.16),
                border: '1px solid',
                borderColor: 'primary.main',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              {line(56, true)}
              <Typography sx={{ fontFamily: MONO, fontSize: 9, color: 'text.secondary', mt: 0.5, lineHeight: 1 }}>kind=AGENT</Typography>
            </Box>
          </Stack>
          <Stack spacing={1.4}>
            <ToolRow tool="get_project_context" result="스킴과 멤버 명단 확인" state="done" />
            <ToolRow tool="create_issue" result="PLT-47 등록 · 담당자 = 페르소나" state="done" />
            <ToolRow tool="claim_issue → log_work" result="진행 중으로 전이, 작업 시간 기록" state="done" />
            <ToolRow tool="create_page" result="위키에 작업 보고서 작성" state="active" />
            <ToolRow tool="update_issue_status" result="승인 후 완료 — 보고서 없이는 막힌다" state="wait" />
          </Stack>
        </Box>
        <Box sx={{ p: { xs: 1.75, md: 2.25 }, display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 0 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'text.secondary' }}>남은 기록</Typography>
          <IssueCard keyText="PLT-47" w="78%" priority="warning" />
          {/* 위키 보고서 카드 */}
          <Box sx={{ p: 1.25, borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
            {line('72%', true)}
            <Stack spacing={0.6} sx={{ mt: 1 }}>
              {line('100%')}
              {line('84%')}
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: 'primary.main' }} />
              <Typography sx={{ fontFamily: MONO, fontSize: 9, color: 'text.secondary', lineHeight: 1 }}>작업 보고서</Typography>
            </Stack>
          </Box>
          {/* 승인 게이트 — 사람이 판단하는 자리 */}
          <Box sx={{ mt: 'auto', p: 1.25, borderRadius: '6px', border: '1px dashed', borderColor: 'primary.main', bgcolor: brand(0.06) }}>
            <Typography sx={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', color: 'primary.main', mb: 1 }}>승인 게이트</Typography>
            <Stack direction="row" spacing={0.75}>
              <Box sx={{ height: 18, flexGrow: 1, borderRadius: 999, bgcolor: 'primary.main' }} />
              <Box sx={{ height: 18, width: 42, borderRadius: 999, border: '1px solid', borderColor: 'divider' }} />
            </Stack>
          </Box>
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
          <Node label="agent" mono />
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
