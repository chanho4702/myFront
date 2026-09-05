import * as React from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CreateTokenDialog from './CreateTokenDialog';
import TokenRevealDialog from './TokenRevealDialog';
import {
  ApiError,
  formatDate,
  listTokens,
  revokeToken,
  tokenStatus,
  TOKEN_PREFIX,
  type ApiToken,
  type CreatedToken,
  type TokenStatus,
} from './tokensStore';
import { useNotify } from '../../notifications';

const COLUMN_COUNT = 7;

const STATUS_CHIP: Record<TokenStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  active: { label: '활성', color: 'success' },
  expiring: { label: '곧 만료', color: 'warning' },
  expired: { label: '만료', color: 'error' },
  revoked: { label: '폐기', color: 'default' },
};

/**
 * 개인 API 토큰 관리 화면(`/app/tokens`).
 *
 * 목록·발급·폐기만 한다. 원문 토큰은 발급 응답에만 실리므로 발급 직후 1회 표시 다이얼로그에서만
 * 보여주고 상태에 남기지 않는다(닫으면 버린다).
 */
export default function TokensPage() {
  const notify = useNotify();
  const [tokens, setTokens] = React.useState<ApiToken[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [revealed, setRevealed] = React.useState<CreatedToken | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiToken | null>(null);
  const [revoking, setRevoking] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTokens(await listTokens());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '토큰 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleCreated = (created: CreatedToken) => {
    setCreateOpen(false);
    setRevealed(created);
  };

  // 1회 표시 다이얼로그를 닫은 뒤에 목록을 새로 고친다(방금 만든 토큰이 표에 들어온다).
  const handleRevealClose = () => {
    setRevealed(null);
    notify.success('토큰을 발급했습니다.');
    void reload();
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeToken(revokeTarget.id);
      setRevokeTarget(null);
      notify.success('토큰을 폐기했습니다.');
      await reload();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰을 폐기하지 못했습니다.');
      setRevokeTarget(null);
      // 404(청소 배치로 이미 사라진 행)면 표에 남은 행이 거짓이다 — 목록을 다시 받는다.
      if (e instanceof ApiError && e.status === 404) await reload();
    } finally {
      setRevoking(false);
    }
  };

  const isEmpty = !loading && !error && tokens.length === 0;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            API 토큰
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 640 }}>
            스크립트·CI 같은 외부 클라이언트가 내 권한으로 API를 호출할 때 비밀번호 대신 쓰는
            개인 토큰입니다.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>
          새 토큰
        </Button>
      </Stack>

      {isEmpty ? (
        <Paper
          variant="outlined"
          sx={{
            px: 3,
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.5,
          }}
        >
          <VpnKeyOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            아직 발급한 토큰이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            첫 토큰을 만들어 외부 스크립트에서 API를 호출해 보세요.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ mt: 1 }}
          >
            첫 토큰 만들기
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
                <TableCell>라벨</TableCell>
                <TableCell width={220}>토큰</TableCell>
                <TableCell width={130}>만든 날</TableCell>
                <TableCell width={130}>만료</TableCell>
                <TableCell width={130}>마지막 사용</TableCell>
                <TableCell width={110}>상태</TableCell>
                <TableCell width={100} align="right">
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                !error &&
                tokens.map((token) => {
                  const status = tokenStatus(token);
                  const chip = STATUS_CHIP[status];
                  const canRevoke = status === 'active' || status === 'expiring';
                  return (
                    <TableRow key={token.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{token.label}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {TOKEN_PREFIX}…{token.hint}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{formatDate(token.createdAt)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{formatDate(token.expiresAt)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{formatDate(token.lastUsedAt)}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={chip.label} color={chip.color} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          disabled={!canRevoke}
                          onClick={() => setRevokeTarget(token)}
                        >
                          폐기
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {loading && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 6, border: 0 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    align="center"
                    sx={{ py: 6, border: 0, color: 'error.main' }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateTokenDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <TokenRevealDialog token={revealed} onClose={handleRevealClose} />

      <Dialog open={Boolean(revokeTarget)} onClose={() => !revoking && setRevokeTarget(null)}>
        <DialogTitle>토큰을 폐기할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{revokeTarget?.label}» 토큰이 최대 1분 안에 차단되며 되돌릴 수 없습니다. 이 토큰을 쓰는
            스크립트는 인증에 실패합니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)} disabled={revoking}>
            취소
          </Button>
          <Button color="error" variant="contained" onClick={handleRevoke} disabled={revoking}>
            폐기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
