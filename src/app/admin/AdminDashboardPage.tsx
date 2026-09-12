import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  AdminApiError,
  fetchAlmActivity,
  fetchAlmStats,
  fetchOrgStats,
  fetchPlatformFeatures,
  fetchPlatformHealth,
  fetchTokenStats,
  fetchWikiActivity,
  fetchWikiStats,
  type ActivityItem,
  type ComponentStatus,
  type HealthComponent,
  type PlatformHealth,
  type SearchFeatures,
  type SearchMode,
} from './adminStore';
import {
  formatBytes,
  formatCount,
  formatDateTime,
  formatLatency,
  mergeActivity,
  normalizeStatus,
  sortComponents,
  summarizeHealth,
} from './dashboard.logic';

/** 헬스 자동 갱신 주기(§0 — 화면 폴링은 헬스만 60초). */
const HEALTH_POLL_MS = 60_000;

/** 최근 활동 표시 건수. */
const ACTIVITY_LIMIT = 20;

type PaletteKey = 'success' | 'warning' | 'error' | 'info';

const STATUS_META: Record<
  ComponentStatus,
  { label: string; color: PaletteKey; Icon: typeof CheckCircleRoundedIcon }
> = {
  UP: { label: '정상', color: 'success', Icon: CheckCircleRoundedIcon },
  DEGRADED: { label: '저하', color: 'warning', Icon: WarningAmberRoundedIcon },
  DOWN: { label: '중단', color: 'error', Icon: ErrorRoundedIcon },
  UNKNOWN: { label: '알 수 없음', color: 'info', Icon: HelpOutlineRoundedIcon },
};

const GROUP_LABEL: Record<HealthComponent['group'], string> = {
  service: '서비스',
  infra: '인프라',
};

/* ────────────────────────── 카드별 독립 로딩 ────────────────────────── */

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 카드 하나가 자기 API 만 책임지게 하는 훅. 한 API 가 죽어도 나머지 카드는 그대로 뜬다(§5.2-4).
 * `reloadKey` 가 바뀌면 다시 부른다(헤더의 새로고침 버튼).
 */
function useAsyncData<T>(fetcher: () => Promise<T>, reloadKey: number): AsyncState<T> {
  const [state, setState] = React.useState<AsyncState<T>>({ data: null, loading: true, error: null });
  // fetcher 는 모듈 함수라 참조가 안정적이지만, 인라인 화살표로 넘겨도 재실행되지 않도록 ref 로 고정한다.
  const fetcherRef = React.useRef(fetcher);
  fetcherRef.current = fetcher;

  React.useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setState({
          data: null,
          loading: false,
          error: e instanceof Error ? e.message : '불러오지 못했습니다.',
        });
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  return state;
}

/* ────────────────────────── 작은 조각들 ────────────────────────── */

/** 상태 셀 — 색만으로 구분하지 않도록 아이콘 + 텍스트를 함께 낸다. */
function StatusCell({ status }: { status: ComponentStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Icon fontSize="small" aria-hidden sx={{ color: `${meta.color}.main` }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: `${meta.color}.main` }}>
        {meta.label}
      </Typography>
    </Stack>
  );
}

/**
 * 모드별 설명. 이 칩이 보여 주는 것은 운영자가 `.env` 에 적은 값이 아니라 **게이트웨이가 실제로
 * 쓰고 있는 실효 모드**다 — 오타나 모르는 `SEARCH_MODE` 는 게이트웨이가 경고를 남기고 lite 로
 * 정규화해 내보낸다. 그래서 문구를 "설정된 모드"가 아니라 "지금 동작 중인 모드"로 쓴다:
 * 설정과 실제가 어긋난 설치를 관리자가 눈으로 잡는 자리가 여기뿐이라 그게 이 칩의 값어치다.
 */
const SEARCH_MODE_HINT: Record<SearchMode, string> = {
  lite:
    '지금 동작 중인 검색 모드입니다. 위키·ALM 각각의 기본 검색만 쓰고, 통합 검색과 색인 관리 화면이 ' +
    '없습니다. 다른 모드로 켠 설치인데 여기가 lite 라면 SEARCH_MODE 값이 잘못돼 게이트웨이가 되돌린 ' +
    '것입니다 — 게이트웨이 기동 로그의 경고를 확인하세요.',
  opensearch: '지금 동작 중인 검색 모드입니다. OpenSearch 로 통합 검색과 색인 관리를 씁니다.',
  external: '지금 동작 중인 검색 모드입니다. 외부 검색 엔진에 연결돼 통합 검색과 색인 관리를 씁니다.',
};

/**
 * 실효 검색 모드 칩. 상태(정상/저하)가 아니라 설치 옵션이라 색을 쓰지 않는다.
 *
 * 알려진 예외 하나: `SEARCH_SERVICE_URI` 탈출구를 쓴 설치는 모드와 무관하게 라우트가 그 주소로
 * 가는데 이 칩은 여전히 `SEARCH_MODE` 를 보여 준다. 흔한 구성이 아니라 그대로 두지만,
 * "칩은 opensearch 인데 검색이 다른 데로 간다"는 문의가 오면 그 자리다.
 */
function SearchModeChip({ search }: { search: SearchFeatures }) {
  return (
    <Tooltip title={SEARCH_MODE_HINT[search.mode]}>
      <Chip
        size="small"
        variant="outlined"
        icon={<SearchRoundedIcon />}
        label={`검색 모드: ${search.mode}`}
      />
    </Tooltip>
  );
}

/** 현황 카드 한 줄(라벨 + 값). */
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.5 }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Stack>
  );
}

/** 제목 + 로딩/에러/본문을 감싸는 현황 카드 껍데기. */
function StatCard({
  title,
  state,
  children,
}: {
  title: string;
  state: { loading: boolean; error: string | null };
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>
        {state.loading && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Stack>
        )}
        {!state.loading && state.error && (
          <Alert severity="error" variant="outlined" sx={{ mt: 0.5 }}>
            {state.error}
          </Alert>
        )}
        {!state.loading && !state.error && children}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────── 점검 도구 ────────────────────────── */

interface ToolLink {
  label: string;
  href: string;
  /** 색인 관리를 켠 설치에서만 보인다 — lite 모드에는 그 화면 자체가 없다. */
  requiresReindex?: boolean;
  /** 이 앱 안의 라우트 — 전체 페이지 이동 없이 react-router 로 간다. */
  router?: boolean;
  /** 내부망에서만 열리는 링크(nginx 뒤로 공개하지 않는다). */
  internal?: boolean;
  hint?: string;
}

/**
 * 점검 도구 바로가기(§5.2-6).
 *
 * Keycloak 관리 콘솔은 nginx 가 `/(api|oauth2|login|invite|.well-known)/` 만 게이트웨이로
 * 넘기므로 `/auth/admin/` 같은 경로가 없다 — 컨테이너가 게시하는 `:8080/admin/` 내부망 주소를 쓴다.
 * MinIO 콘솔(:9001)과 Grafana(:3000)도 같은 이유로 내부망 표기다(Grafana 는 익명 Admin).
 */
function buildToolLinks(): { product: ToolLink[]; internal: ToolLink[] } {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return {
    product: [
      { label: '플랫폼 · AI 에이전트', href: '/app/agents', router: true },
      { label: '위키 · 조직 관리', href: '/wiki/admin/org' },
      { label: '위키 · 검색 색인', href: '/wiki/admin/search', requiresReindex: true },
      { label: '위키 · 이관', href: '/wiki/admin/migrations' },
      { label: 'ALM · 조직 설정', href: '/alm/settings/org' },
    ],
    internal: [
      {
        label: 'Keycloak 관리 콘솔',
        href: `http://${host}:8080/admin/`,
        internal: true,
        hint: 'nginx 뒤로 공개하지 않는다 — 내부망에서만 열린다',
      },
      {
        label: 'MinIO 콘솔',
        href: `http://${host}:9001`,
        internal: true,
        hint: '루프백 바인딩 — 서버 로컬에서만 열린다',
      },
      {
        label: 'Grafana 로그',
        href: `http://${host}:3000`,
        internal: true,
        hint: '익명 Admin 접속이라 외부에 공개하지 않는다',
      },
    ],
  };
}

const toolLinkSx: SxProps<Theme> = (theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.5,
  py: 1,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  color: 'text.primary',
  fontSize: theme.typography.body2.fontSize,
  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
});

function ToolLinkContent({ link }: { link: ToolLink }) {
  return (
    <>
      {link.internal ? (
        <LockOutlinedIcon fontSize="small" aria-hidden />
      ) : link.router ? (
        <ArrowForwardRoundedIcon fontSize="small" aria-hidden />
      ) : (
        <OpenInNewRoundedIcon fontSize="small" aria-hidden />
      )}
      {link.label}
      {link.internal && (
        <Chip size="small" label="내부망" variant="outlined" color="warning" sx={{ ml: 0.5 }} />
      )}
    </>
  );
}

function ToolLinkButton({ link }: { link: ToolLink }) {
  // 이 앱 안의 라우트는 전체 페이지를 다시 받지 않도록 router Link 로, 그 밖(위키·ALM·운영 콘솔)은
  // 라우터 밖이라 실제 이동이다.
  const body = link.router ? (
    <Link component={RouterLink} to={link.href} underline="none" sx={toolLinkSx}>
      <ToolLinkContent link={link} />
    </Link>
  ) : (
    <Link
      href={link.href}
      target={link.internal ? '_blank' : undefined}
      rel={link.internal ? 'noreferrer' : undefined}
      underline="none"
      sx={toolLinkSx}
    >
      <ToolLinkContent link={link} />
    </Link>
  );
  return link.hint ? <Tooltip title={link.hint}>{body}</Tooltip> : body;
}

/* ────────────────────────── 페이지 ────────────────────────── */

/**
 * 전역 관리자용 `/app` 인덱스 — 플랫폼 상태 점검 + 제품 현황 + 최근 활동 + 점검 도구.
 *
 * 부하 원칙(§0): 헬스만 60초 폴링하고 통계·활동은 진입 1회 + 수동 새로고침이다. 탭이 숨겨지면
 * (`document.hidden`) 폴링을 멈추고, 다시 보이면 그 자리에서 한 번 갱신한다.
 */
export default function AdminDashboardPage() {
  const [reloadKey, setReloadKey] = React.useState(0);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // 헬스는 통계와 갱신 주기가 달라 따로 관리한다.
  const [health, setHealth] = React.useState<PlatformHealth | null>(null);
  const [healthLoading, setHealthLoading] = React.useState(true);
  const [healthError, setHealthError] = React.useState<string | null>(null);

  const loadHealth = React.useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setHealthLoading(true);
    try {
      const data = await fetchPlatformHealth();
      setHealth(data);
      setHealthError(null);
    } catch (e: unknown) {
      setHealthError(e instanceof Error ? e.message : '플랫폼 상태를 불러오지 못했습니다.');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // 진입 + 수동 새로고침
  React.useEffect(() => {
    void loadHealth(true);
  }, [loadHealth, reloadKey]);

  // 자동 갱신: 60초 간격, 탭이 숨겨져 있으면 건너뛴다. 다시 보이면 즉시 한 번 갱신.
  React.useEffect(() => {
    if (!autoRefresh) return;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      void loadHealth(false);
    };
    const timer = window.setInterval(tick, HEALTH_POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void loadHealth(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [autoRefresh, loadHealth]);

  const wiki = useAsyncData(fetchWikiStats, reloadKey);
  const alm = useAsyncData(fetchAlmStats, reloadKey);
  const org = useAsyncData(fetchOrgStats, reloadKey);
  const tokens = useAsyncData(fetchTokenStats, reloadKey);
  // 설치 옵션. 이 호출은 던지지 않고 실패를 lite 로 돌려주므로 에러 상태가 없다.
  const features = useAsyncData(fetchPlatformFeatures, reloadKey);
  const search = features.data?.search ?? null;

  // 최근 활동: 위키·ALM 중 하나가 죽어도 나머지는 보여 준다.
  const activity = useAsyncData(loadActivity, reloadKey);

  const components = health?.components ?? [];
  const summary = summarizeHealth(components);
  const rows = sortComponents(components);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* 1. 헤더 */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            플랫폼 점검
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            마지막 점검 {formatDateTime(health?.checkedAt)}
            {health?.cacheTtlSeconds ? ` · 서버 캐시 ${health.cacheTtlSeconds}초` : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                slotProps={{ input: { 'aria-label': '자동 갱신 (60초)' } }}
              />
            }
            label={<Typography variant="body2">자동 갱신 60초</Typography>}
          />
          <Tooltip title="지금 새로고침">
            <span>
              <IconButton
                aria-label="지금 새로고침"
                onClick={() => setReloadKey((k) => k + 1)}
                disabled={healthLoading}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 2. 시스템 상태 요약 칩 */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          size="small"
          color="success"
          variant="outlined"
          icon={<CheckCircleRoundedIcon />}
          label={`정상 ${summary.up}`}
        />
        <Chip
          size="small"
          color="warning"
          variant="outlined"
          icon={<WarningAmberRoundedIcon />}
          label={`저하 ${summary.degraded}`}
        />
        <Chip
          size="small"
          color="error"
          variant="outlined"
          icon={<ErrorRoundedIcon />}
          label={`중단 ${summary.down}`}
        />
        {summary.unknown > 0 && (
          <Chip
            size="small"
            color="info"
            variant="outlined"
            icon={<HelpOutlineRoundedIcon />}
            label={`알 수 없음 ${summary.unknown}`}
          />
        )}
        <Chip size="small" variant="outlined" label={`전체 ${summary.total}`} />
        {search && <SearchModeChip search={search} />}
      </Stack>

      {/* 3. 컴포넌트 표 */}
      {healthError && !healthLoading && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {healthError}
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
              <TableCell width={90}>구분</TableCell>
              <TableCell>컴포넌트</TableCell>
              <TableCell width={130}>상태</TableCell>
              <TableCell width={110} align="right">
                응답시간
              </TableCell>
              <TableCell width={120}>버전</TableCell>
              <TableCell>상세</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {healthLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!healthLoading &&
              rows.map((c) => {
                const status = normalizeStatus(c.status);
                return (
                  <TableRow
                    key={c.id}
                    hover
                    sx={(theme) => ({
                      '&:last-child td': { border: 0 },
                      ...(status === 'DOWN'
                        ? {
                            backgroundColor: theme.vars
                              ? `rgba(${theme.vars.palette.error.mainChannel} / 0.06)`
                              : undefined,
                          }
                        : null),
                    })}
                  >
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {GROUP_LABEL[c.group] ?? '기타'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {c.name || c.id}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: 'text.secondary', ml: 1 }}
                      >
                        {c.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusCell status={status} />
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                      {formatLatency(c.latencyMs)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.version || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{c.detail || '—'}</TableCell>
                  </TableRow>
                );
              })}
            {!healthLoading && !healthError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0, color: 'text.secondary' }}>
                  점검 대상이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 4. 현황 카드 3열 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="WIKI" state={wiki}>
            <StatRow label="스페이스" value={formatCount(wiki.data?.spaces)} />
            <StatRow label="페이지" value={formatCount(wiki.data?.pages)} />
            <StatRow label="초안 / 휴지통" value={`${formatCount(wiki.data?.draftPages)} / ${formatCount(wiki.data?.trashedPages)}`} />
            <StatRow label="리비전" value={formatCount(wiki.data?.revisions)} />
            <StatRow label="댓글" value={formatCount(wiki.data?.comments)} />
            <StatRow
              label="첨부"
              value={`${formatCount(wiki.data?.attachments)} · ${formatBytes(wiki.data?.attachmentBytes)}`}
            />
            <StatRow label="최근 7일 편집" value={formatCount(wiki.data?.editsLast7Days)} />
          </StatCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="ALM" state={alm}>
            <StatRow label="프로젝트" value={formatCount(alm.data?.projects)} />
            <StatRow label="이슈" value={formatCount(alm.data?.issues)} />
            <StatRow
              label="첨부"
              value={`${formatCount(alm.data?.attachments)} · ${formatBytes(alm.data?.attachmentBytes)}`}
            />
            <StatRow label="감사 로그" value={formatCount(alm.data?.auditEntries)} />
          </StatCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="조직 · 토큰"
            state={{
              loading: org.loading || tokens.loading,
              // 두 API 를 한 카드에서 쓰므로 실패한 쪽만 문구에 남긴다.
              error: [org.error, tokens.error].filter(Boolean).join(' / ') || null,
            }}
          >
            <StatRow label="활성 멤버" value={formatCount(org.data?.members?.ACTIVE)} />
            <StatRow label="승인 대기" value={formatCount(org.data?.members?.PENDING)} />
            <StatRow
              label="정지 / 비활성"
              value={`${formatCount(org.data?.members?.SUSPENDED)} / ${formatCount(org.data?.members?.DEACTIVATED)}`}
            />
            <StatRow label="에이전트" value={formatCount(org.data?.agents)} />
            <StatRow label="팀" value={formatCount(org.data?.teams)} />
            <StatRow label="대기 중 초대" value={formatCount(org.data?.pendingInvitations)} />
            <Divider sx={{ my: 1 }} />
            <StatRow label="활성 API 토큰" value={formatCount(tokens.data?.activeTokens)} />
            <StatRow label="토큰 보유 사용자" value={formatCount(tokens.data?.usersWithTokens)} />
            <StatRow label="7일 내 만료" value={formatCount(tokens.data?.expiringWithin7Days)} />
          </StatCard>
        </Grid>
      </Grid>

      {/* 5. 최근 활동 */}
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        최근 활동
      </Typography>
      <Paper variant="outlined" sx={{ mb: 4 }}>
        {activity.loading && (
          <Stack sx={{ alignItems: 'center', py: 5 }}>
            <CircularProgress size={24} />
          </Stack>
        )}
        {!activity.loading && activity.error && (
          <Alert severity="error" variant="outlined" sx={{ m: 2 }}>
            {activity.error}
          </Alert>
        )}
        {!activity.loading && !activity.error && activity.data && (
          <ActivityList result={activity.data} />
        )}
      </Paper>

      {/* 6. 점검 도구 바로가기 */}
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        점검 도구
      </Typography>
      <ToolLinks reindex={search?.reindex ?? false} />
    </Box>
  );
}

/* ────────────────────────── 최근 활동 ────────────────────────── */

/** 한 제품의 감사만 실패했을 때의 안내 한 줄. */
interface ActivityFailure {
  source: 'WIKI' | 'ALM';
  message: string;
  /** 403 은 사람이 고쳐야 하는 상태라 에러로, 404·503 같은 일시적/미배포는 경고로 낸다. */
  severity: 'error' | 'warning';
}

interface ActivityResult {
  items: ActivityItem[];
  /** 일부 소스만 실패했을 때의 안내(전부 실패면 useAsyncData 가 에러로 처리한다). */
  failures: ActivityFailure[];
}

/**
 * 위키·ALM 감사를 함께 부른다. 하나만 실패하면 나머지를 보여 주고 안내를 붙이고,
 * 둘 다 실패하면 던져서 카드 전체를 에러 상태로 만든다(빈 목록으로 삼키지 않는다).
 */
async function loadActivity(): Promise<ActivityResult> {
  const [almResult, wikiResult] = await Promise.allSettled([
    fetchAlmActivity(ACTIVITY_LIMIT),
    fetchWikiActivity(ACTIVITY_LIMIT),
  ]);

  const failures: ActivityFailure[] = [];
  const lists: ActivityItem[][] = [];

  if (almResult.status === 'fulfilled') lists.push(almResult.value);
  else failures.push(failureOf('ALM', almResult.reason, 'ALM 활동 기록을 불러오지 못했습니다.'));

  if (wikiResult.status === 'fulfilled') lists.push(wikiResult.value);
  else failures.push(failureOf('WIKI', wikiResult.reason, '위키 활동 기록을 불러오지 못했습니다.'));

  if (lists.length === 0) throw new Error(failures.map((f) => f.message).join(' / '));

  return { items: mergeActivity(lists, ACTIVITY_LIMIT), failures };
}

function failureOf(
  source: ActivityFailure['source'],
  reason: unknown,
  fallback: string,
): ActivityFailure {
  const status = reason instanceof AdminApiError ? reason.status : 0;
  return {
    source,
    message: reason instanceof Error ? reason.message : fallback,
    severity: status === 403 ? 'error' : 'warning',
  };
}

const SOURCE_LABEL: Record<ActivityFailure['source'], string> = { WIKI: '위키', ALM: 'ALM' };

/** 소스별 실패 안내. 위키 403(계정 상태)과 503(일시적)이 한 줄로 뭉치지 않게 따로 낸다. */
function ActivityFailures({ failures }: { failures: ActivityFailure[] }) {
  if (failures.length === 0) return null;
  return (
    <>
      {failures.map((f) => (
        <Alert key={f.source} severity={f.severity} variant="outlined" sx={{ m: 2 }}>
          {SOURCE_LABEL[f.source]} 활동 — {f.message}
        </Alert>
      ))}
    </>
  );
}

function ActivityList({ result }: { result: ActivityResult }) {
  if (result.items.length === 0) {
    return (
      <>
        <ActivityFailures failures={result.failures} />
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}>
          최근 활동이 없습니다.
        </Typography>
      </>
    );
  }
  return (
    <>
      <ActivityFailures failures={result.failures} />
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
            <TableCell width={80}>제품</TableCell>
            <TableCell width={200}>동작</TableCell>
            <TableCell width={180}>대상</TableCell>
            <TableCell>내용</TableCell>
            <TableCell width={170}>시각</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.items.map((item) => (
            <TableRow key={item.key} hover sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  color={item.source === 'WIKI' ? 'primary' : 'secondary'}
                  label={item.source}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{item.action || '—'}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>
                <ActivityTarget item={item} />
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{item.detail || '—'}</TableCell>
              <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {formatDateTime(item.occurredAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

/**
 * 활동 1건의 대상. 위키 페이지처럼 열어 볼 곳이 있으면 링크로, 없으면 텍스트로 낸다.
 * 위키·ALM 은 라우터 밖의 별도 SPA 라 router Link 가 아니라 실제 이동이다.
 */
function ActivityTarget({ item }: { item: ActivityItem }) {
  const text = item.target || '—';
  if (!item.href || !item.target) return <>{text}</>;
  return (
    <Link href={item.href} underline="hover" color="inherit">
      {text}
    </Link>
  );
}

/* ────────────────────────── 점검 도구 ────────────────────────── */

function ToolLinks({ reindex }: { reindex: boolean }) {
  const links = React.useMemo(buildToolLinks, []);
  // 설치 옵션에 없는 화면으로 가는 바로가기는 아예 그리지 않는다(눌러야 없는 걸 아는 링크 금지).
  const product = links.product.filter((link) => !link.requiresReindex || reindex);
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            제품 관리 화면
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {product.map((link) => (
              <ToolLinkButton key={link.href} link={link} />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            운영 콘솔 — 내부망에서만 열린다
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {links.internal.map((link) => (
              <ToolLinkButton key={link.href} link={link} />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
