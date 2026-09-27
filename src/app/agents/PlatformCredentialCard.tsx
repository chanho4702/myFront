import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNotify } from '../../notifications';
import type { OrgMe } from '../admin/adminStore';
import {
  deletePlatformCredential,
  getPlatformCredential,
  savePlatformCredential,
  type PlatformCredential,
} from './agentsStore';

/** ISO → `2026. 9. 27. 오후 6:47`. 값이 없거나 깨졌으면 대시. */
function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
}

/** myFront 에는 멤버 목록 조회가 없어 본인만 이름으로, 나머지는 id 로 보인다. */
function updaterLabel(updatedBy: string | null, me: OrgMe | null): string {
  if (!updatedBy) return '—';
  if (me && String(me.id) === updatedBy) return me.displayName || `멤버 #${updatedBy}`;
  return `멤버 #${updatedBy}`;
}

/**
 * 전역 LLM 키 카드(AGP-66 P3h) — 프로젝트 키가 없는 모든 프로젝트가 쓰는 Anthropic 키.
 *
 * 원문 키는 입력 필드 상태에만 잠깐 있고, 저장 시도가 끝나면 성공·실패와 무관하게 즉시 비운다.
 */
export default function PlatformCredentialCard({ me }: { me: OrgMe | null }) {
  const notify = useNotify();
  const [credential, setCredential] = React.useState<PlatformCredential | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [apiKey, setApiKey] = React.useState('');
  const [validate, setValidate] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [confirmReplace, setConfirmReplace] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setCredential(await getPlatformCredential());
    } catch (e: unknown) {
      setCredential(null);
      setLoadError(e instanceof Error ? e.message : '전역 LLM 키 설정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const isSet = credential?.set === true;

  const save = async () => {
    const value = apiKey.trim();
    if (!value || saving) return;
    setConfirmReplace(false);
    setSaving(true);
    try {
      setCredential(await savePlatformCredential({ apiKey: value, validate }));
      notify.success(isSet ? '전역 LLM 키를 교체했습니다.' : '전역 LLM 키를 저장했습니다.');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '전역 LLM 키를 저장하지 못했습니다.');
    } finally {
      setApiKey('');
      setSaving(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey.trim() || saving) return;
    // 교체는 프로젝트 키가 없는 프로젝트 전부에 즉시 번진다 — 한 번 더 묻는다.
    if (isSet) setConfirmReplace(true);
    else void save();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePlatformCredential();
      setConfirmDelete(false);
      notify.success('전역 LLM 키를 삭제했습니다.');
    } catch (e: unknown) {
      setConfirmDelete(false);
      notify.error(e instanceof Error ? e.message : '전역 LLM 키를 삭제하지 못했습니다.');
    } finally {
      setDeleting(false);
      await reload();
    }
  };

  let status: React.ReactNode;
  if (loading) {
    status = (
      <Stack sx={{ alignItems: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Stack>
    );
  } else if (loadError) {
    status = (
      <Alert
        severity="error"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={() => void reload()}>
            다시 시도
          </Button>
        }
      >
        {loadError}
      </Alert>
    );
  } else if (isSet && credential) {
    status = (
      <Stack direction="row" spacing={1.5} role="status" aria-label="전역 LLM 키 상태" sx={{ alignItems: 'center' }}>
        <KeyRoundedIcon color="success" />
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600 }}>
            설정됨
          </Box>
          {credential.keyHint ? (
            <Box component="span" sx={{ fontFamily: 'monospace', ml: 1 }}>
              …{credential.keyHint}
            </Box>
          ) : null}
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {' · '}
            {updaterLabel(credential.updatedBy, me)} · {formatDateTime(credential.updatedAt)}
          </Box>
        </Typography>
      </Stack>
    );
  } else {
    status = (
      <Stack direction="row" spacing={1.5} role="status" aria-label="전역 LLM 키 상태" sx={{ alignItems: 'center' }}>
        <WarningAmberRoundedIcon color="warning" />
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600 }}>
            미설정
          </Box>
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {' — 프로젝트 키가 없는 모든 프로젝트는 AI 대화가 꺼지고 워커는 서버 기본 인증을 사용합니다.'}
          </Box>
        </Typography>
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Stack spacing={2}>
        {status}

        {!loading && !loadError && (
          <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
              <TextField
                size="small"
                type="password"
                label={isSet ? '새 Anthropic API 키' : 'Anthropic API 키'}
                placeholder="sk-ant-…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={saving}
                autoComplete="off"
                sx={{ flex: 1, minWidth: 240 }}
                slotProps={{ htmlInput: { spellCheck: false, 'data-1p-ignore': true } }}
              />
              <FormControlLabel
                control={
                  <Checkbox checked={validate} onChange={(e) => setValidate(e.target.checked)} disabled={saving} />
                }
                label="저장 시 검증"
              />
              <Stack direction="row" spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <KeyRoundedIcon />}
                  disabled={!apiKey.trim() || saving}
                >
                  {isSet ? '교체' : '저장'}
                </Button>
                {isSet && (
                  <Button color="error" variant="outlined" onClick={() => setConfirmDelete(true)} disabled={saving}>
                    삭제
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        )}

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          프로젝트별 키는 각 프로젝트 설정 → AI 팀에서 지정합니다. 우선순위: 프로젝트 키 → 전역 키 → 서버
          기본 인증. 키 원문은 저장 뒤 다시 보여 주지 않습니다.
        </Typography>
      </Stack>

      <Dialog open={confirmReplace} onClose={() => !saving && setConfirmReplace(false)}>
        <DialogTitle>전역 LLM 키를 교체할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            프로젝트 키가 없는 프로젝트 전부에 영향을 줍니다. 저장 즉시 그 프로젝트들의 AI 대화와 워커가 새 키를
            씁니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmReplace(false);
              setApiKey('');
            }}
            disabled={saving}
          >
            취소
          </Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving}>
            교체
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)}>
        <DialogTitle>전역 LLM 키를 삭제할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            프로젝트 키가 없는 프로젝트 전부에 영향을 줍니다. 그 프로젝트들은 AI 대화가 꺼지고 워커는 서버 기본
            인증으로 돌아갑니다. 저장된 키는 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={deleting}>
            취소
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()} disabled={deleting}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
