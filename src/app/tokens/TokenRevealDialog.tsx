import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useNotify } from '../../notifications';
import type { CreatedToken } from './tokensStore';
import { formatDate } from './tokensStore';

interface Props {
  /** 방금 발급한 토큰. null 이면 닫힌 상태. */
  token: CreatedToken | null;
  onClose: () => void;
}

/**
 * 발급 직후 원문 토큰을 **한 번만** 보여주는 다이얼로그.
 *
 * 실수로 닫아 토큰을 잃는 것을 막으려고 두 단계로 닫는다(닫기 → "복사하셨나요?" 확인).
 * 배경 클릭/ESC 로는 닫히지 않는다.
 */
export default function TokenRevealDialog({ token, onClose }: Props) {
  const notify = useNotify();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // 다이얼로그가 새로 열릴 때마다 상태를 초기화한다.
  React.useEffect(() => {
    if (token) {
      setCopied(false);
      setConfirming(false);
    }
  }, [token]);

  const handleCopy = async () => {
    const raw = token?.token;
    if (!raw) return;
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      notify.success('토큰을 클립보드에 복사했습니다.');
    } catch {
      // 비보안 컨텍스트(http)·권한 거부 폴백: 텍스트를 선택해 주고 수동 복사를 안내한다.
      inputRef.current?.focus();
      inputRef.current?.select();
      notify.warning('자동 복사에 실패했습니다. 선택된 토큰을 직접 복사해 주세요(Ctrl+C).');
    }
  };

  const handleCloseRequest = () => {
    if (confirming) {
      onClose();
      return;
    }
    setConfirming(true);
  };

  return (
    <Dialog
      open={Boolean(token)}
      // 실수로 토큰을 잃지 않도록 배경 클릭·ESC 로는 닫지 않는다(아래 버튼 2단계만 허용).
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>토큰이 발급되었습니다</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Alert severity="warning">
            이 창을 닫으면 토큰을 다시 볼 수 없습니다. 지금 복사해 안전한 곳에 보관하세요.
          </Alert>
          <TextField
            label="토큰"
            value={token?.token ?? ''}
            inputRef={inputRef}
            fullWidth
            multiline
            onFocus={(e) => e.currentTarget.select()}
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copied ? '복사됨' : '복사'}>
                      <IconButton onClick={handleCopy} aria-label="토큰 복사" edge="end">
                        {copied ? (
                          <CheckRoundedIcon fontSize="small" color="success" />
                        ) : (
                          <ContentCopyRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
              onClick={handleCopy}
            >
              {copied ? '복사됨' : '복사'}
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            라벨 {token?.label} · 만료 {formatDate(token?.expiresAt)} · 요청 헤더에{' '}
            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
              Authorization: Bearer &lt;토큰&gt;
            </Typography>{' '}
            로 넣어 사용합니다.
          </Typography>
          {confirming && (
            <DialogContentText sx={{ color: 'warning.main' }}>
              복사하셨나요? 한 번 더 누르면 창이 닫히고 토큰을 다시 볼 수 없습니다.
            </DialogContentText>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant={confirming ? 'contained' : 'text'}
          color={confirming ? 'warning' : 'primary'}
          onClick={handleCloseRequest}
        >
          {confirming ? '네, 복사했습니다' : '닫기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
