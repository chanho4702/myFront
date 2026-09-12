import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useNotify } from '../../notifications';
import {
  createPersona,
  EMOJI_MAX,
  NAME_MAX,
  PERSONA_ROLE_LABEL,
  PERSONA_ROLES,
  SLUG_MAX,
  slugError,
  type PersonaCreateResult,
  type PersonaGrantInput,
  type PersonaRole,
} from './agentsStore';

/** org-service `ResourceKind`. */
const RESOURCE_TYPES: PersonaGrantInput['resourceType'][] = ['GLOBAL', 'SPACE', 'PROJECT'];
const RESOURCE_TYPE_LABEL: Record<PersonaGrantInput['resourceType'], string> = {
  GLOBAL: '전역',
  SPACE: '위키 스페이스',
  PROJECT: 'ALM 프로젝트',
};

/** org-service `GrantRole` — ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. */
const GRANT_ROLES: PersonaGrantInput['role'][] = ['VIEWER', 'COMMENTER', 'EDITOR', 'ADMIN'];
const GRANT_ROLE_LABEL: Record<PersonaGrantInput['role'], string> = {
  VIEWER: '읽기',
  COMMENTER: '댓글',
  EDITOR: '편집',
  ADMIN: '관리',
};

/** 화면에서만 쓰는 행 키 — 입력 중 행을 지워도 다른 행이 리마운트되지 않게 한다. */
interface GrantRow extends PersonaGrantInput {
  key: string;
}

let grantRowSeq = 0;
function newGrantRow(): GrantRow {
  grantRowSeq += 1;
  return { key: `grant-${grantRowSeq}`, resourceType: 'SPACE', resourceId: '', role: 'EDITOR' };
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** 생성(201) / 기존 슬러그 갱신(200) 결과를 호출자에게 넘긴다. */
  onCreated: (result: PersonaCreateResult) => void;
}

/**
 * 페르소나 부트스트랩 다이얼로그(`POST /api/agent/personas`).
 *
 * 서버가 하는 일은 ① auth-server 사용자 등록 ② org 멤버 등록 ③ grant 부여 ④ 로컬 저장이다.
 * 이미 있는 슬러그로 다시 보내면 ①~③ 을 건너뛰고 표시 필드만 갱신한다(멱등).
 */
export default function CreatePersonaDialog({ open, onClose, onCreated }: Props) {
  const notify = useNotify();
  const [slug, setSlug] = React.useState('');
  const [role, setRole] = React.useState<PersonaRole>('BACKEND');
  const [name, setName] = React.useState('');
  const [emoji, setEmoji] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [voicePrompt, setVoicePrompt] = React.useState('');
  const [grants, setGrants] = React.useState<GrantRow[]>([]);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // 열릴 때마다 폼을 초기화한다(직전 입력이 남지 않도록).
  React.useEffect(() => {
    if (open) {
      setSlug('');
      setRole('BACKEND');
      setName('');
      setEmoji('');
      setEmail('');
      setVoicePrompt('');
      setGrants([]);
      setTouched(false);
      setSubmitting(false);
    }
  }, [open]);

  const slugMessage = slugError(slug);
  const nameMessage = !name.trim() ? '이름을 입력해 주세요.' : null;
  const grantMessage = grants.some((g) => !g.resourceId.trim())
    ? '권한 행의 리소스 식별자를 채우거나 행을 지워 주세요.'
    : null;
  const invalid = Boolean(slugMessage || nameMessage || grantMessage);

  const updateGrant = (key: string, patch: Partial<PersonaGrantInput>) => {
    setGrants((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (invalid) return;
    setSubmitting(true);
    try {
      const result = await createPersona({
        slug: slug.trim(),
        role,
        name: name.trim(),
        emoji: emoji.trim() || undefined,
        voicePrompt: voicePrompt.trim() || undefined,
        email: email.trim() || undefined,
        grants: grants.map(({ resourceType, resourceId, role: grantRole }) => ({
          resourceType,
          resourceId: resourceId.trim(),
          role: grantRole,
        })),
      });
      onCreated(result);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '페르소나를 만들지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>페르소나 추가</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Alert severity="info" variant="outlined">
              페르소나를 만들면 인증 서버에 전용 사용자가 생기고 조직 멤버로 등록됩니다. 이미 있는
              슬러그로 다시 보내면 이름·이모지·보이스 프롬프트만 갱신되고 권한은 다시 부여되지
              않습니다.
            </Alert>

            <TextField
              label="슬러그"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={submitting}
              error={touched && Boolean(slugMessage)}
              helperText={
                (touched && slugMessage) ||
                `소문자·숫자·하이픈 2~${SLUG_MAX}자. 만든 뒤에는 바꿀 수 없습니다.`
              }
              slotProps={{ htmlInput: { maxLength: SLUG_MAX } }}
            />

            <TextField
              select
              label="역할"
              value={role}
              onChange={(e) => setRole(e.target.value as PersonaRole)}
              fullWidth
              disabled={submitting}
              helperText="하네스 6롤 중 하나. 만든 뒤에는 바꿀 수 없습니다."
            >
              {PERSONA_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {PERSONA_ROLE_LABEL[r]} ({r})
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                disabled={submitting}
                error={touched && Boolean(nameMessage)}
                helperText={(touched && nameMessage) || `표시 이름 (${NAME_MAX}자 이하)`}
                slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
              />
              <TextField
                label="이모지"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                disabled={submitting}
                sx={{ width: { sm: 140 } }}
                helperText="선택"
                slotProps={{ htmlInput: { maxLength: EMOJI_MAX } }}
              />
            </Stack>

            <TextField
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              disabled={submitting}
              helperText="선택. 비우면 agents+{슬러그}@platform.local 로 만들어집니다."
            />

            <TextField
              label="보이스 프롬프트"
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={submitting}
              helperText="선택. 이 페르소나가 어떤 말투·관점으로 일하는지."
            />

            <Divider />

            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
              >
                <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700 }}>
                  권한 (선택)
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  disabled={submitting}
                  onClick={() => setGrants((rows) => [...rows, newGrantRow()])}
                >
                  권한 추가
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                만들 때 한 번만 부여됩니다. 식별자는 위키 스페이스 id·ALM 프로젝트 키처럼 대상 하나를
                가리키는 값이고, 서버가 빈 값을 막으므로 비워 둘 수 없습니다.
              </Typography>
              {grants.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  부여할 권한이 없습니다. 나중에 조직 관리 화면에서 줄 수도 있습니다.
                </Typography>
              )}
              <Stack spacing={1.5}>
                {grants.map((row) => (
                  <Stack key={row.key} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      select
                      label="리소스"
                      size="small"
                      value={row.resourceType}
                      disabled={submitting}
                      onChange={(e) =>
                        updateGrant(row.key, {
                          resourceType: e.target.value as PersonaGrantInput['resourceType'],
                        })
                      }
                      sx={{ width: 150 }}
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {RESOURCE_TYPE_LABEL[t]}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="식별자"
                      size="small"
                      value={row.resourceId}
                      disabled={submitting}
                      onChange={(e) => updateGrant(row.key, { resourceId: e.target.value })}
                      error={touched && !row.resourceId.trim()}
                      fullWidth
                    />
                    <TextField
                      select
                      label="역할"
                      size="small"
                      value={row.role}
                      disabled={submitting}
                      onChange={(e) =>
                        updateGrant(row.key, { role: e.target.value as PersonaGrantInput['role'] })
                      }
                      sx={{ width: 120 }}
                    >
                      {GRANT_ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {GRANT_ROLE_LABEL[r]}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Tooltip title="이 권한 행 지우기">
                      <IconButton
                        aria-label={`권한 행 지우기 (${RESOURCE_TYPE_LABEL[row.resourceType]})`}
                        disabled={submitting}
                        onClick={() => setGrants((rows) => rows.filter((r) => r.key !== row.key))}
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
              {touched && grantMessage && (
                <Alert severity="error" variant="outlined" sx={{ mt: 1.5 }}>
                  {grantMessage}
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
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            만들기
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
