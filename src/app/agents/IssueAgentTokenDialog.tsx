import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  AGENT_TOKEN_PREFIX,
  createAgentToken,
  TOKEN_LABEL_MAX,
  type CreatedAgentToken,
  type Persona,
} from './agentsStore';
import { useNotify } from '../../notifications';

/** `없음` 은 서버에 expiresInDays 를 아예 보내지 않는다(만료 없는 토큰). */
const NEVER = 'never';
const EXPIRY_OPTIONS = [30, 90, 180, 365];
const DEFAULT_EXPIRY = '90';

interface Props {
  /** 발급 대상 페르소나. null 이면 닫힌 상태. */
  persona: Persona | null;
  onClose: () => void;
  /** 발급 성공 시 원문 토큰 + 화면이 고른 만료일을 넘긴다. */
  onCreated: (created: CreatedAgentToken, expiresAt: string) => void;
}

/**
 * 에이전트 토큰 발급 폼(`POST /api/agent/tokens`). 대상 페르소나는 호출자가 정하고
 * 여기서는 라벨·만료만 받는다 — 서버가 슬러그로 페르소나를 찾는다.
 */
export default function IssueAgentTokenDialog({ persona, onClose, onCreated }: Props) {
  const notify = useNotify();
  const [label, setLabel] = React.useState('');
  const [expiry, setExpiry] = React.useState<string>(DEFAULT_EXPIRY);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // 열릴 때마다 폼을 초기화한다.
  React.useEffect(() => {
    if (persona) {
      setLabel('');
      setExpiry(DEFAULT_EXPIRY);
      setTouched(false);
      setSubmitting(false);
    }
  }, [persona]);

  const labelError = touched && !label.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!persona || !label.trim()) return;
    const expiresInDays = expiry === NEVER ? null : Number(expiry);
    setSubmitting(true);
    try {
      const created = await createAgentToken({
        label: label.trim(),
        personaSlug: persona.slug,
        expiresInDays,
      });
      // 서버 응답에는 만료 시각이 없다(PatCreatedResponse 는 token·id·label·personaSlug 뿐).
      // 서버는 요청을 받은 순간 `now + days` 로 계산하므로 여기서 같은 식으로 만들어 1회 표시
      // 다이얼로그에만 쓴다 — 표에 남는 값은 발급 뒤 다시 받아 온 목록이 정본이다.
      const expiresAt =
        expiresInDays === null
          ? ''
          : new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
      onCreated(created, expiresAt);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰을 발급하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(persona)} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>에이전트 토큰 발급</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Alert severity="info" variant="outlined">
              «{persona?.name || persona?.slug}» 페르소나의 이름으로 MCP 도구를 부를 때 쓰는
              토큰입니다. 발급 직후 한 번만 보여 주고 다시 볼 수 없습니다.
            </Alert>
            <TextField
              label="라벨"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={submitting}
              error={labelError}
              helperText={labelError ? '라벨을 입력해 주세요.' : '이 토큰을 어디에 쓰는지 알아볼 이름'}
              slotProps={{ htmlInput: { maxLength: TOKEN_LABEL_MAX } }}
            />
            <TextField
              select
              label="만료"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              fullWidth
              disabled={submitting}
              helperText="만료된 토큰은 자동으로 더 이상 인증되지 않습니다."
            >
              {EXPIRY_OPTIONS.map((days) => (
                <MenuItem key={days} value={String(days)}>
                  {days}일
                </MenuItem>
              ))}
              <MenuItem value={NEVER}>만료 없음</MenuItem>
            </TextField>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              대상 페르소나 {persona?.slug} · 토큰은 {AGENT_TOKEN_PREFIX} 로 시작합니다 · 만료 없음을
              고르면 폐기할 때까지 유효합니다.
            </Typography>
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
