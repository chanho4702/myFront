import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  COMMENT_PAGE_SIZE,
  createComment,
  deleteComment,
  listComments,
  updateComment,
  type Comment,
} from './boardStore';
import { useAuth } from '../../auth';
import { useAdminIdentity } from '../admin/adminStore';
import BoardErrorAlert, { toBoardLoadError, type BoardLoadError } from './BoardErrorAlert';
import { useNotify } from '../../notifications';

/** ISO → 로케일 시각. 값이 없거나 깨졌으면 빈 문자열(Invalid Date 방지). */
function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  return Number.isNaN(t) ? '' : new Date(t).toLocaleString('ko-KR');
}

/**
 * 게시글 댓글 영역(F-22). 본문과 따로 불러온다 — board-service 댓글 API 가 실패해도 본문은
 * 그대로이고 이 영역만 오류 문구를 보인다. 수정·삭제 버튼은 작성자 본인 또는 전역 관리자(org GLOBAL ADMIN)에게만
 * 보인다(서버 AccessGuard 와 같은 규칙, 서버가 최종 강제).
 */
export default function CommentsSection({ postId }: { postId: number }) {
  const notify = useNotify();
  const { user } = useAuth();
  const { isGlobalAdmin } = useAdminIdentity();

  const [comments, setComments] = React.useState<Comment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [nextPage, setNextPage] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<BoardLoadError | null>(null);

  const [draft, setDraft] = React.useState('');
  const [posting, setPosting] = React.useState(false);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editDraft, setEditDraft] = React.useState('');
  const [savingEdit, setSavingEdit] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<Comment | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listComments(postId, 0);
      setComments(Array.isArray(page.content) ? page.content : []);
      setTotal(page.totalElements ?? 0);
      setNextPage(page.number + 1 < page.totalPages ? page.number + 1 : null);
    } catch (e: unknown) {
      setError(toBoardLoadError(e, '댓글을 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const loadMore = async () => {
    if (nextPage === null) return;
    setLoadingMore(true);
    try {
      const page = await listComments(postId, nextPage);
      const more = Array.isArray(page.content) ? page.content : [];
      // 그 사이 새 댓글이 붙어 페이지 경계가 밀렸을 수 있어 id 로 중복을 거른다.
      setComments((prev) => [...prev, ...more.filter((c) => !prev.some((p) => p.id === c.id))]);
      setTotal(page.totalElements ?? 0);
      setNextPage(page.number + 1 < page.totalPages ? page.number + 1 : null);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '댓글을 더 불러오지 못했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  // 관리자 판정은 org GLOBAL ADMIN — board-service AccessGuard 와 같은 기준(Keycloak user.role 아님).
  const canManage = (c: Comment) => !!user && (user.sub === String(c.authorId) || isGlobalAdmin);

  const handlePost = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const created = await createComment(postId, content);
      setDraft('');
      // 오래된순 목록이라 끝까지 받은 상태면 맨 뒤에 붙인다. 아직 안 받은 페이지가 있으면 그 페이지에서 나온다.
      if (nextPage === null) setComments((prev) => [...prev, created]);
      setTotal((t) => t + 1);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditDraft(c.content);
  };

  const saveEdit = async (c: Comment) => {
    const content = editDraft.trim();
    if (!content || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await updateComment(c.id, content);
      setComments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingId(null);
      notify.success('댓글을 수정했습니다.');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '댓글을 수정하지 못했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteComment(deleteTarget.id);
      if (nextPage === null) {
        setComments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        // 아직 안 받은 페이지가 있으면 오프셋이 한 칸씩 당겨져 다음 "더 보기"가 댓글 하나를 건너뛴다 — 처음부터 다시 받는다.
        await load();
      }
      notify.success('댓글을 삭제했습니다.');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '댓글을 삭제하지 못했습니다.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Paper variant="outlined" component="section" aria-labelledby="comments-heading" sx={{ p: { xs: 2.5, md: 4 }, mt: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <ChatBubbleOutlineRoundedIcon fontSize="small" aria-hidden sx={{ color: 'text.secondary' }} />
        <Typography id="comments-heading" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          댓글{!loading && !error ? ` ${total.toLocaleString('ko-KR')}` : ''}
        </Typography>
      </Stack>

      {loading && (
        <Stack sx={{ alignItems: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Stack>
      )}

      {!loading && error && <BoardErrorAlert error={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <>
          {comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
              아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.
            </Typography>
          ) : (
            <Stack component="ul" divider={<Divider component="li" aria-hidden />} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {comments.map((c) => {
                const editing = editingId === c.id;
                const edited = !!c.updatedAt && c.updatedAt !== c.createdAt;
                return (
                  <Box component="li" key={c.id} sx={{ py: 1.5 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.authorName || `사용자 #${c.authorId}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDateTime(c.createdAt)}
                          {edited ? ' · 수정됨' : ''}
                        </Typography>
                      </Stack>
                      {canManage(c) && !editing && (
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => startEdit(c)}
                            aria-label={`${c.authorName}의 댓글 수정`}
                          >
                            수정
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => setDeleteTarget(c)}
                            aria-label={`${c.authorName}의 댓글 삭제`}
                          >
                            삭제
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                    {editing ? (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          multiline
                          minRows={2}
                          fullWidth
                          size="small"
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          slotProps={{ htmlInput: { 'aria-label': '댓글 수정 내용' } }}
                        />
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button size="small" onClick={() => setEditingId(null)} disabled={savingEdit}>
                            취소
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => void saveEdit(c)}
                            disabled={savingEdit || !editDraft.trim()}
                          >
                            저장
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', mt: 0.5, lineHeight: 1.7 }}>
                        {c.content}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}

          {nextPage !== null && (
            <Stack sx={{ alignItems: 'center', mt: 1 }}>
              <Button onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? '불러오는 중…' : `댓글 더 보기 (${COMMENT_PAGE_SIZE}개씩)`}
              </Button>
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          {user ? (
            <Box component="form" onSubmit={(e: React.FormEvent) => void handlePost(e)} noValidate>
              <TextField
                multiline
                minRows={2}
                fullWidth
                placeholder="댓글을 입력하세요"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={posting}
                slotProps={{ htmlInput: { 'aria-label': '댓글 입력' } }}
              />
              <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={posting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                  disabled={posting || !draft.trim()}
                >
                  댓글 등록
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              로그인하면 댓글을 쓸 수 있습니다.
            </Typography>
          )}
        </>
      )}

      <Dialog open={deleteTarget !== null} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>댓글을 삭제할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>삭제한 댓글은 복구할 수 없습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
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
