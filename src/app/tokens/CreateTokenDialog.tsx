import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNotify } from '../../notifications';
import { createToken, type CreatedToken } from './tokensStore';
import {
  defaultSelection,
  hasAnyScope,
  isReadLocked,
  PRODUCT_LABEL,
  PRODUCTS,
  SCOPE_DESCRIPTION,
  toggleAdmin,
  toggleScope,
  toScopes,
  type ScopeId,
  type ScopeSelection,
} from './scopes';

const LABEL_MAX = 100;
const DEFAULT_EXPIRY_DAYS = 90;
const EXPIRY_OPTIONS = [30, 90, 180, 365];

interface Props {
  open: boolean;
  onClose: () => void;
  /** 발급 성공 시 원문 토큰을 넘긴다 — 호출자가 1회 표시 다이얼로그를 연다. */
  onCreated: (token: CreatedToken) => void;
}

/** 새 개인 API 토큰 발급 폼(라벨 + 만료 기간 + 스코프). */
export default function CreateTokenDialog({ open, onClose, onCreated }: Props) {
  const notify = useNotify();
  const [label, setLabel] = React.useState('');
  const [expiresInDays, setExpiresInDays] = React.useState(DEFAULT_EXPIRY_DAYS);
  const [selection, setSelection] = React.useState<ScopeSelection>(defaultSelection);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // 열릴 때마다 폼을 초기화한다(직전 입력이 남지 않도록).
  React.useEffect(() => {
    if (open) {
      setLabel('');
      setExpiresInDays(DEFAULT_EXPIRY_DAYS);
      setSelection(defaultSelection());
      setTouched(false);
      setSubmitting(false);
    }
  }, [open]);

  const labelError = touched && !label.trim();
  const scopes = toScopes(selection);
  const scopeChosen = hasAnyScope(selection);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!label.trim() || !scopeChosen) return;
    setSubmitting(true);
    try {
      const created = await createToken({ label: label.trim(), expiresInDays, scopes });
      onCreated(created);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰을 만들지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
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

            <Divider />

            <Box>
              <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700 }}>
                권한(스코프)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                토큰이 부를 수 있는 API를 제품별로 고릅니다. 쓰기를 켜면 같은 제품의 읽기가 함께
                켜집니다. 스코프는 내 권한을 넘지 못합니다 — 내가 못 하는 일은 토큰도 못 합니다.
              </Typography>

              <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                {PRODUCTS.map((product) => {
                  const state = selection[product];
                  const readLocked = isReadLocked(selection, product);
                  return (
                    <Stack
                      key={product}
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 64 }}>
                        {PRODUCT_LABEL[product]}
                      </Typography>
                      <Tooltip title={SCOPE_DESCRIPTION[`${product}:read` as ScopeId]}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={state.read}
                              disabled={submitting || readLocked}
                              onChange={(e) =>
                                setSelection((prev) => toggleScope(prev, product, 'read', e.target.checked))
                              }
                              slotProps={{ input: { 'aria-label': `${PRODUCT_LABEL[product]} 읽기` } }}
                            />
                          }
                          label={<Typography variant="body2">읽기</Typography>}
                        />
                      </Tooltip>
                      <Tooltip title={SCOPE_DESCRIPTION[`${product}:write` as ScopeId]}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={state.write}
                              disabled={submitting}
                              onChange={(e) =>
                                setSelection((prev) => toggleScope(prev, product, 'write', e.target.checked))
                              }
                              slotProps={{ input: { 'aria-label': `${PRODUCT_LABEL[product]} 쓰기` } }}
                            />
                          }
                          label={<Typography variant="body2">쓰기</Typography>}
                        />
                      </Tooltip>
                    </Stack>
                  );
                })}

                <Tooltip title={SCOPE_DESCRIPTION.admin}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selection.admin}
                        disabled={submitting}
                        onChange={(e) => setSelection((prev) => toggleAdmin(prev, e.target.checked))}
                        slotProps={{ input: { 'aria-label': '관리자 API' } }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        관리자 API{' '}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                          (전역 관리자만 실제로 통과합니다)
                        </Typography>
                      </Typography>
                    }
                  />
                </Tooltip>
              </Stack>

              {scopeChosen ? (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                  {scopes.map((scope) => (
                    <Chip key={scope} size="small" variant="outlined" label={scope} />
                  ))}
                </Stack>
              ) : (
                <Alert severity="warning" variant="outlined" sx={{ mt: 1.5 }}>
                  권한을 하나 이상 선택해야 토큰을 만들 수 있습니다.
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !scopeChosen}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            만들기
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
