import * as React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { LABEL_MAX, renameToken, type ApiToken } from './tokensStore';
import { useNotify } from '../../notifications';

/**
 * 토큰 라벨(이름) 변경 다이얼로그(F-21). 토큰 값은 바뀌지 않는다.
 * `token` 이 null 이면 닫힌 상태다.
 */
export default function RenameTokenDialog({
  token,
  onClose,
  onRenamed,
}: {
  token: ApiToken | null;
  onClose: () => void;
  onRenamed: (updated: ApiToken) => void;
}) {
  const notify = useNotify();
  const [label, setLabel] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // 열 때마다 현재 라벨로 채운다.
  React.useEffect(() => {
    if (token) setLabel(token.label);
  }, [token]);

  const trimmed = label.trim();
  const error = !trimmed ? '라벨을 입력하세요.' : trimmed.length > LABEL_MAX ? `라벨은 ${LABEL_MAX}자 이하여야 합니다.` : null;
  const unchanged = !!token && trimmed === token.label;

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!token || error || unchanged || saving) return;
    setSaving(true);
    try {
      const updated = await renameToken(token.id, trimmed);
      notify.success('토큰 라벨을 바꿨습니다.');
      onRenamed(updated);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰 이름을 바꾸지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={token !== null} onClose={() => !saving && onClose()} fullWidth maxWidth="xs">
      <form onSubmit={(e) => void handleSave(e)} noValidate>
        <DialogTitle>토큰 라벨 변경</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="라벨"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            error={!!error}
            helperText={error ?? '토큰 값은 그대로라 이 토큰을 쓰는 스크립트는 영향이 없습니다.'}
            slotProps={{ htmlInput: { maxLength: LABEL_MAX } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !!error || unchanged}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
