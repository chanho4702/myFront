import * as React from 'react';
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
import { useNotify } from '../../notifications';
import { createToken, type CreatedToken } from './tokensStore';

const LABEL_MAX = 100;
const DEFAULT_EXPIRY_DAYS = 90;
const EXPIRY_OPTIONS = [30, 90, 180, 365];

interface Props {
  open: boolean;
  onClose: () => void;
  /** 발급 성공 시 원문 토큰을 넘긴다 — 호출자가 1회 표시 다이얼로그를 연다. */
  onCreated: (token: CreatedToken) => void;
}

/** 새 개인 API 토큰 발급 폼(라벨 + 만료 기간). */
export default function CreateTokenDialog({ open, onClose, onCreated }: Props) {
  const notify = useNotify();
  const [label, setLabel] = React.useState('');
  const [expiresInDays, setExpiresInDays] = React.useState(DEFAULT_EXPIRY_DAYS);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // 열릴 때마다 폼을 초기화한다(직전 입력이 남지 않도록).
  React.useEffect(() => {
    if (open) {
      setLabel('');
      setExpiresInDays(DEFAULT_EXPIRY_DAYS);
      setTouched(false);
      setSubmitting(false);
    }
  }, [open]);

  const labelError = touched && !label.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!label.trim()) return;
    setSubmitting(true);
    try {
      const created = await createToken({ label: label.trim(), expiresInDays });
      onCreated(created);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰을 만들지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>새 API 토큰</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="라벨"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              error={labelError}
              helperText={labelError ? '라벨을 입력하세요.' : '이 토큰을 어디에 쓰는지 알아볼 이름'}
              slotProps={{ htmlInput: { maxLength: LABEL_MAX } }}
              fullWidth
              required
              autoFocus
              disabled={submitting}
            />
            <TextField
              label="만료"
              value={String(expiresInDays)}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              select
              fullWidth
              disabled={submitting}
              helperText="만료된 토큰은 자동으로 더 이상 인증되지 않습니다."
            >
              {EXPIRY_OPTIONS.map((days) => (
                <MenuItem key={days} value={String(days)}>
                  {days}일
                </MenuItem>
              ))}
            </TextField>
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
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            만들기
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
