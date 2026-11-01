import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { useNotify } from '../../notifications';
import { formatUsd, type Persona } from './agentsStore';
import {
  decideGate,
  formatDateTime,
  GATE_KIND_LABEL,
  listPendingGates,
  listRuns,
  RUN_STATUS_LABEL,
  RUN_STATUSES,
  type Paged,
  type PendingGate,
  type RunItem,
  type RunStatus,
} from './agentOpsStore';

const STATUS_VIEW: Record<
  RunStatus,
  { icon: React.ReactElement; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }
> = {
  QUEUED: { icon: <ScheduleRoundedIcon />, color: 'default' },
  RUNNING: { icon: <PlayCircleRoundedIcon />, color: 'primary' },
  WAITING_APPROVAL: { icon: <HourglassTopRoundedIcon />, color: 'warning' },
  DONE: { icon: <CheckCircleRoundedIcon />, color: 'success' },
  FAILED: { icon: <ErrorRoundedIcon />, color: 'error' },
  BLOCKED: { icon: <BlockRoundedIcon />, color: 'error' },
  CANCELLED: { icon: <CancelRoundedIcon />, color: 'default' },
};

function RunStatusChip({ status }: { status: string }) {
  const view = STATUS_VIEW[status as RunStatus];
  const label = RUN_STATUS_LABEL[status as RunStatus] ?? status;
  if (!view) return <Chip size="small" variant="outlined" label={label || '—'} />;
  return <Chip size="small" variant="outlined" color={view.color} icon={view.icon} label={label} />;
}

function RunsTab({ personaName }: { personaName: Map<string, string> }) {
  const [status, setStatus] = React.useState<'' | RunStatus>('');
  const [projectDraft, setProjectDraft] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const [data, setData] = React.useState<Paged<RunItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listRuns({ status: status || undefined, projectId, page, size })
      .then((r) => !cancelled && setData(r))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'run 목록을 불러오지 못했습니다.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, projectId, page, size]);

  const projectValid = projectDraft.trim() === '' || /^\d+$/.test(projectDraft.trim());

  return (
    <Stack spacing={2}>
      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' } }}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          if (!projectValid) return;
          setPage(0);
          setProjectId(projectDraft.trim());
        }}
      >
        <TextField
          size="small"
          select
          label="상태"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | RunStatus);
            setPage(0);
          }}
          sx={{ width: 160 }}
        >
          <MenuItem value="">전체</MenuItem>
          {RUN_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', '& svg': { fontSize: 18 } }}>
                {STATUS_VIEW[s].icon}
                <span>{RUN_STATUS_LABEL[s]}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="프로젝트 id"
          value={projectDraft}
          onChange={(e) => setProjectDraft(e.target.value)}
          error={!projectValid}
          sx={{ width: 140 }}
        />
        <Button type="submit" variant="outlined" disabled={!projectValid}>
          적용
        </Button>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600, whiteSpace: 'nowrap' } }}>
              <TableCell width={80}>run</TableCell>
              <TableCell width={120}>이슈</TableCell>
              <TableCell width={130}>상태</TableCell>
              <TableCell width={110}>종류</TableCell>
              <TableCell>페르소나</TableCell>
              <TableCell width={80}>시도</TableCell>
              <TableCell width={150}>시작</TableCell>
              <TableCell width={150}>종료</TableCell>
              <TableCell width={100} align="right">
                비용
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              !error &&
              data?.items.map((r) => (
                <TableRow key={r.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{r.id}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{r.issueKey || '—'}</TableCell>
                  <TableCell>
                    <RunStatusChip status={r.status} />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.type || '—'}</TableCell>
                  <TableCell>{r.personaId ? (personaName.get(r.personaId) ?? `#${r.personaId}`) : '—'}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{r.attempt ?? '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(r.startedAt)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(r.endedAt)}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.costUsd === null ? '기록 없음' : formatUsd(r.costUsd)}
                  </TableCell>
                </TableRow>
              ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, border: 0 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, border: 0, color: 'error.main' }}>
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && data && data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, border: 0, color: 'text.secondary' }}>
                  조건에 맞는 run이 없습니다.
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
          rowsPerPageOptions={[20, 50, 100]}
          labelRowsPerPage="쪽당"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </TableContainer>
    </Stack>
  );
}

function GatesTab({ onCountChange }: { onCountChange: (n: number | null) => void }) {
  const notify = useNotify();
  const [gates, setGates] = React.useState<PendingGate[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<{ gate: PendingGate; decision: 'approve' | 'reject' } | null>(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listPendingGates();
      setGates(list);
      onCountChange(list.length);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '승인 대기 목록을 불러오지 못했습니다.');
      onCountChange(null);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const decide = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await decideGate(confirm.gate.id, confirm.decision);
      notify.success(confirm.decision === 'approve' ? '승인했습니다. 이어서 실행할 run이 만들어집니다.' : '거절했습니다.');
      setConfirm(null);
      await reload();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '결정을 저장하지 못했습니다.');
      setConfirm(null);
      await reload(); // 다른 사람이 먼저 결정했을 수 있다
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600, whiteSpace: 'nowrap' } }}>
              <TableCell width={150}>요청 시각</TableCell>
              <TableCell width={120}>이슈</TableCell>
              <TableCell width={80}>run</TableCell>
              <TableCell width={120}>종류</TableCell>
              <TableCell>요청</TableCell>
              <TableCell width={170} align="right">
                결정
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              !error &&
              gates?.map((g) => (
                <TableRow key={g.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(g.requestedAt)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{g.issueKey ?? '—'}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{g.runId}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" icon={<HourglassTopRoundedIcon />} label={GATE_KIND_LABEL[g.kind] ?? g.kind} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{g.request ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" onClick={() => setConfirm({ gate: g, decision: 'approve' })}>
                        승인
                      </Button>
                      <Button size="small" color="error" onClick={() => setConfirm({ gate: g, decision: 'reject' })}>
                        거절
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0, color: 'error.main' }}>
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && gates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0, color: 'text.secondary' }}>
                  승인을 기다리는 게이트가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={confirm !== null} onClose={() => !busy && setConfirm(null)}>
        <DialogTitle>{confirm?.decision === 'approve' ? '게이트를 승인할까요?' : '게이트를 거절할까요?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.decision === 'approve'
              ? `${confirm.gate.issueKey ?? `run ${confirm.gate.runId}`}의 요청을 승인하면 이어서 실행할 run이 만들어집니다(예산을 씁니다).`
              : `${confirm?.gate.issueKey ?? `run ${confirm?.gate.runId}`}의 요청을 거절하면 그 run이 취소로 닫힙니다.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={busy}>
            취소
          </Button>
          <Button
            variant="contained"
            color={confirm?.decision === 'approve' ? 'primary' : 'error'}
            onClick={() => void decide()}
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {confirm?.decision === 'approve' ? '승인' : '거절'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/** 전 프로젝트 run 목록과 대기 중 게이트(F-18) — 각 ALM 사무실에 들어가지 않고 플랫폼에서 보고 결정한다. */
export default function RunsGatesSection({ personas }: { personas: Persona[] }) {
  const [tab, setTab] = React.useState<'runs' | 'gates'>('runs');
  const [gateCount, setGateCount] = React.useState<number | null>(null);
  const personaName = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of personas) map.set(p.id, p.name || p.slug);
    return map;
  }, [personas]);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820, mb: 1 }}>
        모든 프로젝트의 실행(run)과 사람 승인을 기다리는 게이트입니다.
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v: 'runs' | 'gates') => setTab(v)} aria-label="run·게이트">
          <Tab value="runs" label="전 프로젝트 run" />
          <Tab value="gates" label={gateCount ? `대기 중 게이트 (${gateCount})` : '대기 중 게이트'} />
        </Tabs>
      </Box>
      {tab === 'runs' ? <RunsTab personaName={personaName} /> : <GatesTab onCountChange={setGateCount} />}
    </Paper>
  );
}
