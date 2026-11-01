import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useNotify } from '../../notifications';
import { EMOJI_MAX, NAME_MAX, type Persona } from './agentsStore';
import { getPersonaDetail, setPersonaActive, updatePersona, type PersonaEditInput } from './agentOpsStore';

const MODEL_MAX = 60;

/**
 * 페르소나 편집(F-18) — 이름·이모지·말투·기본 모델·스킬과 활성 여부. 비활성화하면 새 run이 배정되지 않는다(진행 중 run과 토큰은
 * 그대로 — 즉시 멈추려면 킬 스위치나 run 취소). 서버 계약: 빈 칸 = 지움, 이름은 지울 수 없다.
 */
export default function EditPersonaDialog({
  persona,
  onClose,
  onSaved,
}: {
  persona: Persona | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const notify = useNotify();
  const [form, setForm] = React.useState<PersonaEditInput | null>(null);
  const [active, setActive] = React.useState(true);
  const [initialActive, setInitialActive] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!persona) return;
    let cancelled = false;
    setForm(null);
    setLoadError(null);
    getPersonaDetail(persona.id)
      .then((d) => {
        if (cancelled) return;
        setForm({
          name: d.name,
          emoji: d.emoji ?? '',
          voicePrompt: d.voicePrompt ?? '',
          defaultModel: d.defaultModel ?? '',
          skills: d.skills ?? '',
        });
        setActive(d.active);
        setInitialActive(d.active);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '페르소나 상세를 불러오지 못했습니다.');
      });
    return () => {
      cancelled = true;
    };
  }, [persona]);

  const nameError = form && form.name.trim() === '' ? '이름은 비울 수 없습니다.' : null;

  const save = async () => {
    if (!persona || !form || nameError) return;
    setBusy(true);
    try {
      try {
        await updatePersona(persona.id, { ...form, name: form.name.trim() });
      } catch (e: unknown) {
        notify.error(e instanceof Error ? e.message : '페르소나를 저장하지 못했습니다.');
        return;
      }
      if (active !== initialActive) {
        try {
          await setPersonaActive(persona.id, active);
        } catch (e: unknown) {
          // 두 요청이라 부분 성공이 생긴다 — 프로필은 저장됐다고 분명히 알리고, 목록을 다시 불러 실제 상태를 보여 준다.
          const reason = e instanceof Error ? e.message : '알 수 없는 오류';
          notify.warning(`프로필은 저장했지만 ${active ? '활성화' : '비활성화'}하지 못했습니다: ${reason}`);
          onSaved();
          try {
            const fresh = await getPersonaDetail(persona.id);
            setActive(fresh.active);
            setInitialActive(fresh.active);
          } catch {
            // 다시 읽지 못하면 토글을 서버에 보내기 전 값으로 되돌린다(목록은 위 onSaved 가 다시 불러온다).
            setActive(initialActive);
          }
          return;
        }
      }
      notify.success('페르소나를 저장했습니다.');
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const set = (key: keyof PersonaEditInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  return (
    <Dialog open={persona !== null} onClose={() => !busy && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>페르소나 편집{persona ? ` — ${persona.slug}` : ''}</DialogTitle>
      <DialogContent>
        {loadError && (
          <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
            {loadError}
          </Alert>
        )}
        {!loadError && !form && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Stack>
        )}
        {form && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControlLabel
              control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
              label={active ? '활성 — 새 run을 배정받습니다' : '비활성 — 새 run이 배정되지 않습니다'}
            />
            {!active && initialActive && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                진행 중인 run과 발급된 토큰은 그대로입니다. 즉시 멈추려면 킬 스위치나 run 취소를 쓰세요.
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                label="이름"
                value={form.name}
                onChange={set('name')}
                error={nameError !== null}
                helperText={nameError ?? ' '}
                slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="이모지"
                value={form.emoji}
                onChange={set('emoji')}
                helperText="비우면 지움"
                slotProps={{ htmlInput: { maxLength: EMOJI_MAX } }}
                sx={{ width: 120 }}
              />
            </Stack>
            <TextField
              label="기본 모델"
              value={form.defaultModel}
              onChange={set('defaultModel')}
              helperText="비우면 프로젝트·전역 기본 모델을 씁니다."
              slotProps={{ htmlInput: { maxLength: MODEL_MAX } }}
            />
            <TextField label="말투(보이스 프롬프트)" value={form.voicePrompt} onChange={set('voicePrompt')} multiline minRows={2} />
            <TextField
              label="스킬(마크다운)"
              value={form.skills}
              onChange={set('skills')}
              helperText="워커 워크스페이스의 페르소나 SKILL.md가 됩니다. 첫 줄이 요약으로 쓰입니다."
              multiline
              minRows={3}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={() => void save()}
          disabled={busy || !form || nameError !== null}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
