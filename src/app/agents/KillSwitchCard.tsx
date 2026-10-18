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
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import { useNotify } from '../../notifications';
import { getKillSwitch, setKillSwitch } from './agentsStore';

/**
 * 킬 스위치 카드(F-15) — 전역 관리자 화면(`/app/agents`) 안에서만 그린다(서버도 ROLE_ADMIN 만 허용).
 *
 * 켜면 서버가 실행 중 run 을 전부 취소하고 새 실행을 막는다(O-09, DB 영속이라 재기동해도 유지).
 * 되돌릴 수 없는 취소가 따라오므로 켤 때는 반드시 확인 대화상자를 거친다.
 */
export default function KillSwitchCard() {
  const notify = useNotify();
  const [on, setOn] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<'on' | 'off' | null>(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setOn(await getKillSwitch());
    } catch (e: unknown) {
      setOn(null);
      setLoadError(e instanceof Error ? e.message : '킬 스위치 상태를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const apply = async () => {
    if (!confirm) return;
    const next = confirm === 'on';
    setBusy(true);
    try {
      await setKillSwitch(next);
      notify.success(next ? '모든 에이전트를 정지했습니다.' : '에이전트 실행을 다시 허용했습니다.');
      setConfirm(null);
      await reload();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '킬 스위치를 바꾸지 못했습니다.');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  if (loading && on === null) {
    body = (
      <Stack sx={{ alignItems: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Stack>
    );
  } else if (loadError || on === null) {
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
        {loadError ?? '킬 스위치 상태를 확인할 수 없습니다.'}
      </Alert>
    );
  } else {
    body = (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1.5} role="status" aria-label="킬 스위치 상태" sx={{ alignItems: 'center' }}>
          {on ? (
            <Chip color="error" icon={<StopCircleRoundedIcon />} label="정지됨 — 모든 에이전트 실행 차단" />
          ) : (
            <Chip color="success" variant="outlined" icon={<CheckCircleRoundedIcon />} label="정상 실행 중" />
          )}
        </Stack>
        {on ? (
          <Button
            variant="outlined"
            startIcon={<PlayArrowRoundedIcon />}
            disabled={busy}
            onClick={() => setConfirm('off')}
          >
            정지 해제
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopCircleRoundedIcon />}
            disabled={busy}
            onClick={() => setConfirm('on')}
          >
            모든 에이전트 정지
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820 }}>
            급할 때 모든 AI 에이전트를 한 번에 멈춥니다. 켜 두는 동안 새 작업·재개·게이트 승인 실행이 모두 막히고, 서버를
            재기동해도 유지됩니다. ALM 사무실 화면에도 정지 상태가 보입니다.
          </Typography>
        </Box>
        {body}
      </Stack>

      <Dialog open={confirm !== null} onClose={() => !busy && setConfirm(null)}>
        <DialogTitle>{confirm === 'on' ? '모든 에이전트를 정지할까요?' : '에이전트 정지를 해제할까요?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm === 'on'
              ? '실행 중 run이 모두 취소됩니다. 취소된 run은 자동으로 다시 시작되지 않으며, 해제할 때까지 새 실행도 막힙니다.'
              : '해제하면 대기 중이던 작업과 새 작업이 다시 실행될 수 있습니다. 정지로 취소된 run은 되살아나지 않습니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={busy}>
            취소
          </Button>
          <Button
            variant="contained"
            color={confirm === 'on' ? 'error' : 'primary'}
            onClick={() => void apply()}
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {confirm === 'on' ? '정지' : '해제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
