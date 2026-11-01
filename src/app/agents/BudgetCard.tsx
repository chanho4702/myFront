import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNotify } from '../../notifications';
import { formatUsd } from './agentsStore';
import {
  fetchBudgetOverview,
  parseCapInput,
  savePlatformCap,
  saveProjectCap,
  type BudgetOverview,
} from './agentOpsStore';

/** 사용률 단계 칩 — 값은 아이콘 + 텍스트로(텍스트만 금지). */
function LevelChip({ level, alertPercent }: { level: number; alertPercent: number }) {
  if (level >= 100) return <Chip size="small" color="error" icon={<ErrorRoundedIcon />} label="상한 도달" />;
  if (level > 0)
    return <Chip size="small" color="warning" icon={<WarningAmberRoundedIcon />} label={`${alertPercent}% 임박`} />;
  return <Chip size="small" variant="outlined" color="success" icon={<CheckCircleRoundedIcon />} label="여유" />;
}

function UsageBar({ percent, level }: { percent: number | null; level: number }) {
  if (percent === null) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>—</Typography>;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 140 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, percent)}
        color={level >= 100 ? 'error' : level > 0 ? 'warning' : 'primary'}
        sx={{ flex: 1, height: 6, borderRadius: 3 }}
        aria-label={`사용률 ${percent}%`}
      />
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', width: 52, textAlign: 'right' }}>
        {percent}%
      </Typography>
    </Stack>
  );
}

type EditTarget = { kind: 'platform' } | { kind: 'project'; projectId: string; current: number | null } | { kind: 'new' };

/**
 * 예산 상한 카드(F-19) — 이번 달(UTC) 플랫폼·프로젝트별 사용액과 상한. 전역 관리자가 플랫폼 상한과 프로젝트별 상한을 바꾼다
 * (재기동 없이 다음 판정부터 적용, 변경은 감사 이력에 남는다). 사용액이 임계(기본 80%)를 넘으면 운영 수신자에게 메일이 가고
 * 여기와 관리자 대시보드에 경고가 뜬다.
 */
export default function BudgetCard() {
  const notify = useNotify();
  const [data, setData] = React.useState<BudgetOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [edit, setEdit] = React.useState<EditTarget | null>(null);
  const [capInput, setCapInput] = React.useState('');
  const [projectInput, setProjectInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchBudgetOverview());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '예산 현황을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const openEdit = (target: EditTarget) => {
    setEdit(target);
    setProjectInput('');
    if (target.kind === 'platform') setCapInput(data?.platform.capUsd != null ? String(data.platform.capUsd) : '');
    else if (target.kind === 'project') setCapInput(target.current != null ? String(target.current) : '');
    else setCapInput('');
  };

  const parsed = parseCapInput(capInput);
  const capError = capInput.trim() === '' ? null : 'error' in parsed ? parsed.error : null;
  const projectIdValid = /^\d+$/.test(projectInput.trim());
  const canSave =
    !busy && 'value' in parsed && (edit?.kind !== 'new' || projectIdValid);

  const run = async (action: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await action();
      notify.success(ok);
      setEdit(null);
      await reload();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!edit || !('value' in parsed)) return;
    const value = parsed.value;
    if (edit.kind === 'platform') void run(() => savePlatformCap(value), '플랫폼 예산 상한을 저장했습니다.');
    else {
      const projectId = edit.kind === 'project' ? edit.projectId : projectInput.trim();
      void run(() => saveProjectCap(projectId, value), `프로젝트 ${projectId} 예산 상한을 저장했습니다.`);
    }
  };

  const reset = () => {
    if (!edit) return;
    if (edit.kind === 'platform') void run(() => savePlatformCap(null), '플랫폼 예산 상한을 기본값으로 되돌렸습니다.');
    else if (edit.kind === 'project')
      void run(() => saveProjectCap(edit.projectId, null), `프로젝트 ${edit.projectId}가 플랫폼 상한을 따르게 했습니다.`);
  };

  let body: React.ReactNode;
  if (loading && !data) {
    body = (
      <Stack sx={{ alignItems: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Stack>
    );
  } else if (error || !data) {
    body = (
      <Alert
        severity="error"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={() => void reload()}>
            다시 시도
          </Button>
        }
      >
        {error ?? '예산 현황을 확인할 수 없습니다.'}
      </Alert>
    );
  } else {
    const p = data.platform;
    const warned = data.projects.filter((x) => x.alertLevel > 0);
    body = (
      <Stack spacing={2}>
        {(p.alertLevel > 0 || warned.length > 0) && (
          <Alert severity={p.alertLevel >= 100 || warned.some((x) => x.alertLevel >= 100) ? 'error' : 'warning'} variant="outlined">
            {p.alertLevel >= 100
              ? '플랫폼 월 예산 상한에 도달했습니다 — 새 run이 시작되지 않습니다.'
              : p.alertLevel > 0
                ? `플랫폼 월 예산이 ${data.alertPercent}%를 넘었습니다.`
                : null}
            {warned.length > 0 && ` 상한에 다가간 프로젝트 ${warned.length}개: ${warned.map((x) => x.projectId).join(', ')}`}
          </Alert>
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              플랫폼 전체 · {data.month} (UTC 월)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatUsd(p.monthToDateUsd)} / {formatUsd(p.capUsd)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {p.overridden ? `화면에서 설정한 값 (설치 기본 ${formatUsd(p.defaultCapUsd)})` : '설치 기본값(BUDGET_MONTHLY_USD)'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 220 }}>
              <UsageBar percent={p.usedPercent} level={p.alertLevel} />
            </Box>
            <LevelChip level={p.alertLevel} alertPercent={data.alertPercent} />
            <Button variant="outlined" size="small" onClick={() => openEdit({ kind: 'platform' })}>
              상한 변경
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            프로젝트별
          </Typography>
          <Button size="small" onClick={() => openEdit({ kind: 'new' })}>
            프로젝트 상한 추가
          </Button>
        </Stack>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600, whiteSpace: 'nowrap' } }}>
                <TableCell width={120}>프로젝트 id</TableCell>
                <TableCell>이번 달 사용</TableCell>
                <TableCell>상한</TableCell>
                <TableCell width={220}>사용률</TableCell>
                <TableCell width={130}>상태</TableCell>
                <TableCell width={100} align="right">
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.projects.map((row) => (
                <TableRow key={row.projectId} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{row.projectId}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatUsd(row.monthToDateUsd)}</TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatUsd(row.effectiveCapUsd)}
                    {row.capUsd === null && (
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                        (플랫폼 상한)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <UsageBar percent={row.usedPercent} level={row.alertLevel} />
                  </TableCell>
                  <TableCell>
                    <LevelChip level={row.alertLevel} alertPercent={data.alertPercent} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => openEdit({ kind: 'project', projectId: row.projectId, current: row.capUsd })}
                    >
                      변경
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, border: 0, color: 'text.secondary' }}>
                    이번 달 사용액이나 따로 둔 상한이 있는 프로젝트가 없습니다. 모든 프로젝트가 플랫폼 상한을 따릅니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  }

  const dialogTitle =
    edit?.kind === 'platform'
      ? '플랫폼 월 예산 상한'
      : edit?.kind === 'project'
        ? `프로젝트 ${edit.projectId} 월 예산 상한`
        : '프로젝트 월 예산 상한 추가';

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820 }}>
          AI 에이전트가 이번 달(UTC 캘린더 월)에 쓴 LLM 비용과 상한입니다. 플랫폼 전체 상한이나 프로젝트 상한에 닿으면 그 범위의
          새 run은 다음 달 또는 상한을 올릴 때까지 대기합니다. 사용액이 상한의 {data?.alertPercent ?? 80}%를 넘으면 운영 알림 메일이
          갑니다. 바꾼 값은 재기동 없이 적용되고 감사 이력에 남습니다.
        </Typography>
        {body}
      </Stack>

      <Dialog open={edit !== null} onClose={() => !busy && setEdit(null)} fullWidth maxWidth="xs">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <DialogContentText>
              {edit?.kind === 'platform'
                ? '모든 프로젝트를 합친 이번 달 상한입니다. 따로 상한을 두지 않은 프로젝트도 이 값을 상한으로 씁니다.'
                : '이 프로젝트만의 이번 달 상한입니다. 플랫폼 상한에 먼저 닿으면 그쪽이 막습니다.'}
            </DialogContentText>
            {edit?.kind === 'new' && (
              <TextField
                label="프로젝트 id"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                error={projectInput.trim() !== '' && !projectIdValid}
                helperText={projectInput.trim() !== '' && !projectIdValid ? '숫자 id를 입력하세요.' : 'ALM 프로젝트 id'}
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                autoFocus
              />
            )}
            <TextField
              label="월 상한 (USD)"
              value={capInput}
              onChange={(e) => setCapInput(e.target.value)}
              error={capError !== null}
              helperText={capError ?? '0이면 그 범위의 실행을 모두 막습니다.'}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              autoFocus={edit?.kind !== 'new'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {edit?.kind === 'platform' && data?.platform.overridden && (
            <Button onClick={reset} disabled={busy} sx={{ mr: 'auto' }}>
              기본값으로
            </Button>
          )}
          {edit?.kind === 'project' && edit.current !== null && (
            <Button onClick={reset} disabled={busy} sx={{ mr: 'auto' }}>
              플랫폼 상한 따르기
            </Button>
          )}
          <Button onClick={() => setEdit(null)} disabled={busy}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={!canSave}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
