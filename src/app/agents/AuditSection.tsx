import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { Persona } from './agentsStore';
import {
  dateInputToIso,
  formatDateTime,
  searchAudits,
  type AuditItem,
  type AuditOrigin,
  type AuditStatus,
  type Paged,
} from './agentOpsStore';

const ORIGIN_LABEL: Record<AuditOrigin, string> = {
  WORKER: '워커 run',
  EXTERNAL: '외부 MCP',
  SYSTEM: '서버 기록',
};

interface Filters {
  from: string;
  to: string;
  tool: string;
  status: '' | AuditStatus;
  origin: '' | AuditOrigin;
  personaId: string;
  runId: string;
  projectId: string;
}

const EMPTY: Filters = { from: '', to: '', tool: '', status: '', origin: '', personaId: '', runId: '', projectId: '' };

/**
 * 도구 호출 감사 이력 검색(F-17) — 기간·도구·상태·출처·페르소나·run·프로젝트로 거르고 페이지로 넘긴다(최신순).
 * 전역 관리자 화면이라 요약은 원문이 실린다. 예산 상한 변경도 `budget.*` 도구로 여기 남는다.
 */
export default function AuditSection({ personas }: { personas: Persona[] }) {
  const [draft, setDraft] = React.useState<Filters>(EMPTY);
  const [applied, setApplied] = React.useState<Filters>(EMPTY);
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [data, setData] = React.useState<Paged<AuditItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const personaName = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of personas) map.set(p.id, p.name || p.slug);
    return map;
  }, [personas]);
  /** 행위자(actorMemberId = 인증 사용자 id) → 페르소나 이름. 사람이면 id만 보인다(이름 조회 API가 이 화면에 없다). */
  const memberName = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of personas) if (p.memberId) map.set(p.memberId, p.name || p.slug);
    return map;
  }, [personas]);

  // 기간 검증은 적용 전에 한다 — 잘못된 기간은 applied 로 넘어가지 않으므로 요청·로딩 상태가 엇갈리지 않는다.
  const rangeError =
    draft.from && draft.to && draft.from > draft.to ? '시작일이 끝일보다 늦습니다.' : null;

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchAudits({
      from: dateInputToIso(applied.from),
      to: dateInputToIso(applied.to, true),
      tool: applied.tool,
      status: applied.status || undefined,
      origin: applied.origin || undefined,
      personaId: applied.personaId,
      runId: applied.runId,
      projectId: applied.projectId,
      page,
      size,
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '감사 이력을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied, page, size]);

  const numeric = (v: string) => v === '' || /^\d+$/.test(v);
  const draftInvalid = !numeric(draft.runId.trim()) || !numeric(draft.projectId.trim());

  const apply = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (rangeError || draftInvalid) return;
    setPage(0);
    setApplied({ ...draft });
  };

  /** 페르소나 행은 페르소나 이름, 페르소나 없는 서버 기록(예산·키 변경 등)은 행위자(actorMemberId). */
  const actorLabel = (a: AuditItem): string => {
    if (a.personaId) return personaName.get(a.personaId) ?? `페르소나 #${a.personaId}`;
    if (a.actorMemberId) return memberName.get(a.actorMemberId) ?? `사용자 #${a.actorMemberId}`;
    return '—';
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820 }}>
          AI 에이전트가 부른 MCP 도구와 서버 기록(예산 변경·키 저장 등)을 기간·도구·상태로 찾습니다.
        </Typography>
        <Stack
          component="form"
          onSubmit={apply}
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          useFlexGap
          sx={{ flexWrap: 'wrap', alignItems: { md: 'center' } }}
        >
          <TextField
            size="small"
            type="date"
            label="시작일"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="끝일"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            label="도구"
            placeholder="예: add_comment"
            value={draft.tool}
            onChange={(e) => setDraft({ ...draft, tool: e.target.value })}
            sx={{ width: 170 }}
          />
          <TextField
            size="small"
            select
            label="상태"
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as Filters['status'] })}
            sx={{ width: 120 }}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="OK">
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircleRoundedIcon fontSize="small" color="success" />
                <span>성공</span>
              </Stack>
            </MenuItem>
            <MenuItem value="ERROR">
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <ErrorRoundedIcon fontSize="small" color="error" />
                <span>오류</span>
              </Stack>
            </MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="출처"
            value={draft.origin}
            onChange={(e) => setDraft({ ...draft, origin: e.target.value as Filters['origin'] })}
            sx={{ width: 130 }}
          >
            <MenuItem value="">전체</MenuItem>
            {(Object.keys(ORIGIN_LABEL) as AuditOrigin[]).map((o) => (
              <MenuItem key={o} value={o}>
                {ORIGIN_LABEL[o]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="페르소나"
            value={draft.personaId}
            onChange={(e) => setDraft({ ...draft, personaId: e.target.value })}
            sx={{ width: 160 }}
          >
            <MenuItem value="">전체</MenuItem>
            {personas.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.emoji ? `${p.emoji} ` : ''}
                {p.name || p.slug}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="run id"
            value={draft.runId}
            onChange={(e) => setDraft({ ...draft, runId: e.target.value })}
            error={!numeric(draft.runId.trim())}
            sx={{ width: 110 }}
          />
          <TextField
            size="small"
            label="프로젝트 id"
            value={draft.projectId}
            onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}
            error={!numeric(draft.projectId.trim())}
            sx={{ width: 120 }}
          />
          <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />} disabled={draftInvalid || rangeError !== null}>
            검색
          </Button>
          <Button
            onClick={() => {
              setDraft(EMPTY);
              setPage(0);
              setApplied(EMPTY);
            }}
          >
            초기화
          </Button>
        </Stack>

        {rangeError && (
          <Alert severity="warning" variant="outlined">
            {rangeError}
          </Alert>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600, whiteSpace: 'nowrap' } }}>
                <TableCell width={150}>시각</TableCell>
                <TableCell width={150}>페르소나·행위자</TableCell>
                <TableCell width={170}>도구</TableCell>
                <TableCell width={100}>상태</TableCell>
                <TableCell width={110}>출처</TableCell>
                <TableCell width={80}>run</TableCell>
                <TableCell width={90}>프로젝트</TableCell>
                <TableCell>요약</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                !error &&
                data?.items.map((a) => (
                  <TableRow key={a.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{formatDateTime(a.createdAt)}</TableCell>
                    <TableCell>{actorLabel(a)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{a.tool}</TableCell>
                    <TableCell>
                      {a.status === 'ERROR' ? (
                        <Chip size="small" color="error" variant="outlined" icon={<ErrorRoundedIcon />} label="오류" />
                      ) : (
                        <Chip size="small" color="success" variant="outlined" icon={<CheckCircleRoundedIcon />} label="성공" />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{a.origin ? ORIGIN_LABEL[a.origin] : '미상'}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.runId ?? '—'}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.projectId ?? '—'}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-all' }}>{a.summary ?? '—'}</TableCell>
                  </TableRow>
                ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, border: 0 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, border: 0, color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && data && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, border: 0, color: 'text.secondary' }}>
                    조건에 맞는 감사 기록이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={size}
            onRowsPerPageChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="쪽당"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
          />
        </TableContainer>
      </Stack>
    </Paper>
  );
}
