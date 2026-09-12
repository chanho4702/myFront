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
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CreatePersonaDialog from './CreatePersonaDialog';
import IssueAgentTokenDialog from './IssueAgentTokenDialog';
// 발급 직후 1회 표시 다이얼로그는 개인 API 토큰 화면 것을 그대로 쓴다 — 같은 위험(다시 못 봄)에
// 같은 2단계 닫기·복사 동작이 필요하다.
import TokenRevealDialog from '../tokens/TokenRevealDialog';
import type { CreatedToken } from '../tokens/tokensStore';
import { useAdminIdentity } from '../admin/adminStore';
import { useNotify } from '../../notifications';
import {
  AgentApiError,
  agentTokenStatus,
  formatDate,
  listAgentTokens,
  listPersonas,
  PERSONA_ROLE_LABEL,
  revokeAgentToken,
  type AgentToken,
  type AgentTokenStatus,
  type CreatedAgentToken,
  type Persona,
  type PersonaRole,
} from './agentsStore';

const PERSONA_COLUMNS = 6;
const TOKEN_COLUMNS = 6;

const STATUS_CHIP: Record<
  AgentTokenStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  active: { label: '활성', color: 'success' },
  expiring: { label: '곧 만료', color: 'warning' },
  expired: { label: '만료', color: 'error' },
  revoked: { label: '폐기', color: 'default' },
};

function roleLabel(role: string): string {
  return PERSONA_ROLE_LABEL[role as PersonaRole] ?? role ?? '—';
}

/**
 * 발급 응답을 1회 표시 다이얼로그(개인 API 토큰 화면 것)의 입력 모양으로 옮긴다.
 *
 * agent-service 의 발급 응답에는 `hint`·`createdAt` 이 없다(원문·id·라벨·슬러그뿐). 다이얼로그가
 * 실제로 읽는 것은 `token`·`label`·`expiresAt` 뿐이라 나머지는 빈 값으로 둔다 — 빈 `expiresAt` 은
 * 만료 없음(대시)으로 표시된다.
 */
function createdTokenView(created: CreatedAgentToken, expiresAt: string): CreatedToken {
  return {
    id: created.id,
    label: created.label,
    hint: '',
    createdAt: '',
    expiresAt,
    token: created.token,
  };
}

/* ────────────────────────── 페이지 ────────────────────────── */

/**
 * AI 에이전트 관리 화면(`/app/agents`) — 전역 관리자 전용.
 *
 * agent-service 가 지금 주는 것만 다룬다: 페르소나 목록·부트스트랩, 토큰 목록·발급·폐기.
 * 페르소나 수정·비활성화·삭제 API 는 없어 화면에도 두지 않는다.
 */
export default function AgentsPage() {
  const notify = useNotify();
  const { isGlobalAdmin, loading: identityLoading, error: identityError } = useAdminIdentity();

  const [personas, setPersonas] = React.useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = React.useState(true);
  const [personasError, setPersonasError] = React.useState<string | null>(null);

  const [tokens, setTokens] = React.useState<AgentToken[]>([]);
  const [tokensLoading, setTokensLoading] = React.useState(true);
  const [tokensError, setTokensError] = React.useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [issueTarget, setIssueTarget] = React.useState<Persona | null>(null);
  const [revealed, setRevealed] = React.useState<CreatedToken | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<AgentToken | null>(null);
  const [revoking, setRevoking] = React.useState(false);

  const reloadPersonas = React.useCallback(async () => {
    setPersonasLoading(true);
    setPersonasError(null);
    try {
      setPersonas(await listPersonas());
    } catch (e: unknown) {
      setPersonas([]);
      setPersonasError(e instanceof Error ? e.message : '페르소나 목록을 불러오지 못했습니다.');
    } finally {
      setPersonasLoading(false);
    }
  }, []);

  const reloadTokens = React.useCallback(async () => {
    setTokensLoading(true);
    setTokensError(null);
    try {
      setTokens(await listAgentTokens());
    } catch (e: unknown) {
      setTokens([]);
      setTokensError(e instanceof Error ? e.message : '에이전트 토큰 목록을 불러오지 못했습니다.');
    } finally {
      setTokensLoading(false);
    }
  }, []);

  // 관리자로 판정된 뒤에만 부른다 — 비관리자에게 403 을 헛되이 만들지 않는다.
  React.useEffect(() => {
    if (!isGlobalAdmin) return;
    void reloadPersonas();
    void reloadTokens();
  }, [isGlobalAdmin, reloadPersonas, reloadTokens]);

  // 선택이 없거나 사라진 슬러그를 가리키면 첫 페르소나로 맞춘다.
  React.useEffect(() => {
    if (personas.length === 0) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => (prev && personas.some((p) => p.slug === prev) ? prev : personas[0].slug));
  }, [personas]);

  const selected = React.useMemo(
    () => personas.find((p) => p.slug === selectedSlug) ?? null,
    [personas, selectedSlug],
  );

  const tokensBySlug = React.useMemo(() => {
    const map = new Map<string, AgentToken[]>();
    for (const token of tokens) {
      if (!token.personaSlug) continue;
      const list = map.get(token.personaSlug);
      if (list) list.push(token);
      else map.set(token.personaSlug, [token]);
    }
    return map;
  }, [tokens]);

  // 페르소나가 사라졌거나 목록에 없는 토큰 — 어느 표에도 안 나오므로 숫자로라도 알린다.
  const orphanTokens = React.useMemo(
    () => tokens.filter((t) => !t.personaSlug || !personas.some((p) => p.slug === t.personaSlug)),
    [tokens, personas],
  );

  const selectedTokens = selected ? (tokensBySlug.get(selected.slug) ?? []) : [];

  const handlePersonaCreated = (result: { persona: Persona; created: boolean }) => {
    setCreateOpen(false);
    setSelectedSlug(result.persona.slug);
    notify.success(
      result.created
        ? `페르소나 «${result.persona.slug}» 를 만들었습니다.`
        : `이미 있는 슬러그라 «${result.persona.slug}» 의 표시 정보만 갱신했습니다.`,
    );
    void reloadPersonas();
  };

  const handleTokenCreated = (created: CreatedAgentToken, expiresAt: string) => {
    setIssueTarget(null);
    setRevealed(createdTokenView(created, expiresAt));
  };

  // 1회 표시 다이얼로그를 닫은 뒤에 목록을 새로 고친다(방금 만든 토큰이 표에 들어온다).
  const handleRevealClose = () => {
    setRevealed(null);
    notify.success('토큰을 발급했습니다.');
    void reloadTokens();
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeAgentToken(revokeTarget.id);
      setRevokeTarget(null);
      notify.success('토큰을 폐기했습니다.');
      await reloadTokens();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '토큰을 폐기하지 못했습니다.');
      setRevokeTarget(null);
      // 404(이미 사라진 행)면 표가 거짓이다 — 목록을 다시 받는다.
      if (e instanceof AgentApiError && e.status === 404) await reloadTokens();
    } finally {
      setRevoking(false);
    }
  };

  if (identityLoading) {
    return (
      <Stack sx={{ alignItems: 'center', width: '100%', py: 10 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!isGlobalAdmin) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          AI 에이전트
        </Typography>
        <Alert severity="warning" variant="outlined">
          전역 관리자만 볼 수 있는 화면입니다.
          {identityError ? ` (${identityError})` : ''}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            AI 에이전트
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 720 }}>
            하네스 역할별 페르소나와 그 페르소나가 MCP 도구를 부를 때 쓰는 토큰을 관리합니다.
            페르소나를 만들면 인증 서버 사용자와 조직 멤버가 함께 생깁니다.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="지금 새로고침">
            <span>
              <IconButton
                aria-label="지금 새로고침"
                disabled={personasLoading || tokensLoading}
                onClick={() => {
                  void reloadPersonas();
                  void reloadTokens();
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>
            페르소나 추가
          </Button>
        </Stack>
      </Stack>

      {/* 1. 페르소나 */}
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        페르소나
      </Typography>
      {!personasLoading && !personasError && personas.length === 0 ? (
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
            mb: 4,
          }}
        >
          <SmartToyRoundedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            아직 페르소나가 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
            역할별 페르소나를 만들면 에이전트가 그 이름으로 위키·ALM에 글을 남깁니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ mt: 1 }}
          >
            첫 페르소나 만들기
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
                <TableCell width={180}>슬러그</TableCell>
                <TableCell>이름</TableCell>
                <TableCell width={130}>역할</TableCell>
                <TableCell width={110}>상태</TableCell>
                <TableCell width={110}>멤버 id</TableCell>
                <TableCell width={200} align="right">
                  토큰
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!personasLoading &&
                !personasError &&
                personas.map((persona) => {
                  const count = tokensBySlug.get(persona.slug)?.length ?? 0;
                  const isSelected = persona.slug === selectedSlug;
                  return (
                    <TableRow
                      key={persona.id}
                      hover
                      selected={isSelected}
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace' }}>{persona.slug}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {persona.emoji ? `${persona.emoji} ` : ''}
                        {persona.name || '—'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{roleLabel(persona.role)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={persona.active ? 'success' : 'default'}
                          label={persona.active ? '활성' : '비활성'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {persona.memberId ?? '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                        >
                          <Button
                            size="small"
                            variant={isSelected ? 'contained' : 'text'}
                            onClick={() => setSelectedSlug(persona.slug)}
                          >
                            토큰 {count}개
                          </Button>
                          <Button
                            size="small"
                            disabled={!persona.active}
                            onClick={() => setIssueTarget(persona)}
                          >
                            발급
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {personasLoading && (
                <TableRow>
                  <TableCell colSpan={PERSONA_COLUMNS} align="center" sx={{ py: 6, border: 0 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!personasLoading && personasError && (
                <TableRow>
                  <TableCell
                    colSpan={PERSONA_COLUMNS}
                    align="center"
                    sx={{ py: 6, border: 0, color: 'error.main' }}
                  >
                    {personasError}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 2. 선택한 페르소나의 토큰 */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
      >
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          토큰{selected ? ` — ${selected.name || selected.slug}` : ''}
        </Typography>
        {selected && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            disabled={!selected.active}
            onClick={() => setIssueTarget(selected)}
          >
            토큰 발급
          </Button>
        )}
      </Stack>

      {orphanTokens.length > 0 && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          어느 페르소나에도 연결되지 않은 토큰이 {orphanTokens.length}개 있습니다. 페르소나가 지워졌거나
          목록에 없는 슬러그입니다.
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
              <TableCell>라벨</TableCell>
              <TableCell width={140}>만든 날</TableCell>
              <TableCell width={140}>만료</TableCell>
              <TableCell width={140}>마지막 사용</TableCell>
              <TableCell width={110}>상태</TableCell>
              <TableCell width={100} align="right">
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!tokensLoading &&
              !tokensError &&
              selectedTokens.map((token) => {
                const status = agentTokenStatus(token);
                const chip = STATUS_CHIP[status];
                const canRevoke = status !== 'revoked';
                return (
                  <TableRow key={token.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{token.label || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{formatDate(token.createdAt)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {token.expiresAt ? formatDate(token.expiresAt) : '만료 없음'}
                    </TableCell>
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
            {tokensLoading && (
              <TableRow>
                <TableCell colSpan={TOKEN_COLUMNS} align="center" sx={{ py: 6, border: 0 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!tokensLoading && tokensError && (
              <TableRow>
                <TableCell
                  colSpan={TOKEN_COLUMNS}
                  align="center"
                  sx={{ py: 6, border: 0, color: 'error.main' }}
                >
                  {tokensError}
                </TableCell>
              </TableRow>
            )}
            {!tokensLoading && !tokensError && selectedTokens.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={TOKEN_COLUMNS}
                  align="center"
                  sx={{ py: 6, border: 0, color: 'text.secondary' }}
                >
                  {selected
                    ? '이 페르소나에 발급된 토큰이 없습니다.'
                    : '페르소나를 고르면 그 토큰이 여기 나옵니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreatePersonaDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handlePersonaCreated}
      />
      <IssueAgentTokenDialog
        persona={issueTarget}
        onClose={() => setIssueTarget(null)}
        onCreated={handleTokenCreated}
      />
      <TokenRevealDialog token={revealed} onClose={handleRevealClose} />

      <Dialog open={Boolean(revokeTarget)} onClose={() => !revoking && setRevokeTarget(null)}>
        <DialogTitle>토큰을 폐기할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{revokeTarget?.label}» 토큰이 즉시 차단되며 되돌릴 수 없습니다. 이 토큰을 쓰는 에이전트는
            MCP 호출에 실패합니다.
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
