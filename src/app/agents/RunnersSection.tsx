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
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import { useNotify } from '../../notifications';
import {
  createRunner,
  listRunners,
  relativeTime,
  revokeRunner,
  RUNNER_JAR_URL,
  RUNNER_NAME_MAX,
  runnerCommand,
  type CreatedRunner,
  type Runner,
  type RunnerStatus,
} from './agentsStore';

const COLUMNS = 6;

/** 상태 칩 — 아이콘 + 텍스트(색만으로 온라인을 말하지 않는다). */
const STATUS_CHIP: Record<
  RunnerStatus,
  { label: string; color: 'success' | 'warning' | 'default'; icon: React.ReactElement }
> = {
  ONLINE: { label: '온라인', color: 'success', icon: <WifiRoundedIcon /> },
  OFFLINE: { label: '오프라인', color: 'warning', icon: <WifiOffRoundedIcon /> },
  NEVER_CONNECTED: { label: '연결 전', color: 'default', icon: <RadioButtonUncheckedRoundedIcon /> },
  REVOKED: { label: '철회됨', color: 'default', icon: <BlockRoundedIcon /> },
};

/** 러너 범위 — 값은 아이콘 + 텍스트 */
function scopeChip(runner: Runner): { label: string; icon: React.ReactElement } {
  if (runner.kind === 'PLATFORM') return { label: '플랫폼(서버)', icon: <DnsRoundedIcon /> };
  return runner.projectId === null
    ? { label: '전역', icon: <PublicRoundedIcon /> }
    : { label: `프로젝트 #${runner.projectId}`, icon: <FolderRoundedIcon /> };
}

function envText(runner: Runner): string {
  const parts = [
    runner.version ? `v${runner.version}` : null,
    runner.os,
    runner.maxConcurrency ? `동시 ${runner.maxConcurrency}` : null,
  ].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(' · ') : '—';
}

/**
 * 러너(P4a AGP-69) — 전역 관리자 화면. PLATFORM 포함 전체 러너 목록 + 전역 LOCAL 러너 발급·철회.
 * 프로젝트 러너 발급과 프로젝트 실행 위치는 ALM 프로젝트 설정 "AI 팀"에서 한다.
 */
export default function RunnersSection() {
  const notify = useNotify();
  const [runners, setRunners] = React.useState<Runner[] | null>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [issueOpen, setIssueOpen] = React.useState(false);
  const [revealed, setRevealed] = React.useState<CreatedRunner | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<Runner | null>(null);
  const [revoking, setRevoking] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRunners(await listRunners());
    } catch (e: unknown) {
      setRunners([]);
      setError(e instanceof Error ? e.message : '러너 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeRunner(revokeTarget.id);
      notify.success('러너를 철회했습니다.');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '러너를 철회하지 못했습니다.');
    } finally {
      setRevokeTarget(null);
      setRevoking(false);
      void reload();
    }
  };

  const unsupported = !loading && !error && runners === null;
  const list = runners ?? [];
  const platformOffline = list.some((r) => r.kind === 'PLATFORM' && r.status !== 'ONLINE' && r.status !== 'REVOKED');

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          러너
        </Typography>
        {!unsupported && (
          <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setIssueOpen(true)}>
            전역 러너 발급
          </Button>
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, maxWidth: 820 }}>
        AI 직원의 작업을 실제로 실행하는 프로그램입니다. 플랫폼 러너는 서버 실행(등록된 LLM 키 과금)을, 내 PC 러너는 그
        PC의 Claude 구독으로 실행합니다. 전역 러너는 모든 프로젝트의 &lsquo;내 PC 러너&rsquo; 작업을 집어 갑니다.
      </Typography>
      {platformOffline && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          플랫폼 러너가 연결돼 있지 않습니다. 서버 실행 작업은 러너가 연결될 때까지 &lsquo;러너 대기&rsquo;로 남습니다.
        </Alert>
      )}

      {unsupported ? (
        <Alert severity="info" variant="outlined" sx={{ mb: 4 }}>
          이 서버의 agent-service는 러너를 지원하지 않습니다(P4a 이전). 모든 작업이 서버 프로세스에서 실행됩니다.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small" aria-label="러너">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
                <TableCell>이름</TableCell>
                <TableCell width={130}>상태</TableCell>
                <TableCell width={130}>마지막 신호</TableCell>
                <TableCell width={220}>환경</TableCell>
                <TableCell width={140}>현재 실행</TableCell>
                <TableCell width={100} align="right">
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                !error &&
                list.map((runner) => {
                  const chip = STATUS_CHIP[runner.status];
                  const canRevoke = runner.kind === 'LOCAL' && runner.status !== 'REVOKED';
                  return (
                    <TableRow key={runner.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {runner.name}
                          </Typography>
                          <Chip size="small" variant="outlined" icon={scopeChip(runner).icon} label={scopeChip(runner).label} />
                        </Stack>
                        {runner.tokenPrefix && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                            {runner.tokenPrefix}…
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" color={chip.color} icon={chip.icon} label={chip.label} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{relativeTime(runner.lastHeartbeatAt)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{envText(runner)}</TableCell>
                      <TableCell>
                        {runner.currentRunIds.length === 0 ? (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            —
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                            {runner.currentRunIds.map((id) =>
                              // 실행 상세는 ALM 사무실에 있다 — 프로젝트를 아는 러너만 링크한다.
                              runner.projectId ? (
                                <Link
                                  key={id}
                                  href={`/alm/projects/${runner.projectId}/ai-office/runs/${id}`}
                                  aria-label={`실행 #${id} 상세`}
                                >
                                  #{id}
                                </Link>
                              ) : (
                                <Typography key={id} variant="body2">
                                  #{id}
                                </Typography>
                              ),
                            )}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {runner.kind === 'PLATFORM' ? (
                          <Tooltip title="플랫폼 러너는 서버 설정(AGENT_PLATFORM_RUNNER_TOKEN)으로만 관리합니다">
                            <span>
                              <Button size="small" disabled>
                                철회
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            disabled={!canRevoke}
                            aria-label={`러너 ${runner.name} 철회`}
                            onClick={() => setRevokeTarget(runner)}
                          >
                            철회
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {loading && (
                <TableRow>
                  <TableCell colSpan={COLUMNS} align="center" sx={{ py: 6, border: 0 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={COLUMNS} align="center" sx={{ py: 6, border: 0, color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS} align="center" sx={{ py: 6, border: 0, color: 'text.secondary' }}>
                    아직 러너가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <IssueRunnerDialog
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        onCreated={(created) => {
          setIssueOpen(false);
          setRevealed(created);
          void reload();
        }}
      />
      <RunnerRevealDialog runner={revealed} onClose={() => setRevealed(null)} />

      <Dialog open={Boolean(revokeTarget)} onClose={() => !revoking && setRevokeTarget(null)}>
        <DialogTitle>러너를 철회할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{revokeTarget?.name}» 러너의 토큰이 바로 거부됩니다. 돌던 실행은 다음 생존 확인에서 차단되고, 이 러너에 묶인 대기
            실행은 &lsquo;러너 대기&rsquo;로 남습니다(직접 취소). 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)} disabled={revoking}>
            취소
          </Button>
          <Button color="error" variant="contained" onClick={handleRevoke} disabled={revoking}>
            철회
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function IssueRunnerDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (created: CreatedRunner) => void;
}) {
  const notify = useNotify();
  const [name, setName] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName('');
      setTouched(false);
      setSubmitting(false);
    }
  }, [open]);

  const nameError = touched && !name.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      onCreated(await createRunner(name));
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '러너를 발급하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>전역 러너 발급</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Alert severity="info" variant="outlined">
              전역 러너는 모든 프로젝트의 &lsquo;내 PC 러너&rsquo; 작업을 집어 갑니다. 한 프로젝트만 맡길 러너는 ALM 프로젝트
              설정 &lsquo;AI 팀&rsquo;에서 발급하세요.
            </Alert>
            <TextField
              label="러너 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={submitting}
              error={nameError}
              helperText={nameError ? '이름을 입력해 주세요.' : '어느 PC인지 알아볼 수 있는 이름'}
              slotProps={{ htmlInput: { maxLength: RUNNER_NAME_MAX } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            발급
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/** 발급 직후 1회 표시 — 토큰 + 바로 실행할 명령 + jar 링크 + 필요 조건. 배경 클릭·ESC 로는 닫지 않는다. */
function RunnerRevealDialog({ runner, onClose }: { runner: CreatedRunner | null; onClose: () => void }) {
  const notify = useNotify();
  const command = runner ? runnerCommand(runner.token) : '';

  const copy = async (value: string, what: string) => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
      notify.success(`${what}을(를) 클립보드에 복사했습니다.`);
    } catch {
      notify.warning('자동 복사에 실패했습니다. 칸을 선택해 직접 복사해 주세요(Ctrl+C).');
    }
  };

  return (
    <Dialog open={Boolean(runner)} onClose={() => {}} maxWidth="sm" fullWidth>
      <DialogTitle>러너 토큰이 발급되었습니다</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Alert severity="warning">이 창을 닫으면 토큰을 다시 볼 수 없습니다. 지금 복사해 안전한 곳에 보관하세요.</Alert>
          <TextField
            label="러너 토큰"
            value={runner?.token ?? ''}
            fullWidth
            onFocus={(e) => e.currentTarget.select()}
            slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.875rem' } } }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => void copy(runner?.token ?? '', '토큰')}
            >
              토큰 복사
            </Button>
          </Stack>
          <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700 }}>
            실행 방법
          </Typography>
          <Link href={RUNNER_JAR_URL} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <DownloadRoundedIcon fontSize="small" /> agent-runner.jar 내려받기
          </Link>
          <Box
            component="pre"
            aria-label="실행 명령"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {command}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<ContentCopyRoundedIcon />} onClick={() => void copy(command, '실행 명령')}>
              명령 복사
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            필요한 것: Java 24 이상 · Claude Code 설치·로그인(<code>claude</code> 명령이 PATH에 있어야 함). 러너는 그 PC의
            Claude 구독(또는 그 PC의 API 키)으로 일하고, PC가 꺼지면 작업은 &lsquo;러너 대기&rsquo;로 기다립니다.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          복사했습니다
        </Button>
      </DialogActions>
    </Dialog>
  );
}
