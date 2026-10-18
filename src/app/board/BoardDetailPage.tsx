import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deletePost, getPost, type Post } from './boardStore';
import CommentsSection from './CommentsSection';
import { useAuth } from '../../auth';
import { useNotify } from '../../notifications';

export default function BoardDetailPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const [post, setPost] = React.useState<Post | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getPost(postId)
      .then((p) => {
        if (alive) setPost(p);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : '글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [postId]);

  // 본인 글이거나 ADMIN 일 때만 수정/삭제 노출(서버도 동일하게 강제함).
  const canEdit =
    !!post && !!user && (user.sub === String(post.authorId) || user.role === 'ADMIN');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(postId);
      setConfirmOpen(false);
      notify.success('글을 삭제했습니다.');
      navigate('/app/board');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '삭제에 실패했습니다.');
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900, textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          {error ?? '존재하지 않는 글입니다.'}
        </Typography>
        <Stack sx={{ alignItems: 'center' }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/app/board')}>
            목록으로
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1.5 }}>
          {post.title}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ color: 'text.secondary', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <Typography variant="body2">작성자 {post.authorName}</Typography>
          <Typography variant="body2">{new Date(post.createdAt).toLocaleString('ko-KR')}</Typography>
        </Stack>
        <Divider sx={{ my: 2.5 }} />
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', minHeight: 160, lineHeight: 1.8 }}
        >
          {post.content}
        </Typography>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mt: 2 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/app/board')}>
          목록
        </Button>
        {canEdit && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/app/board/${post.id}/edit`)}
            >
              수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteRoundedIcon />}
              onClick={() => setConfirmOpen(true)}
            >
              삭제
            </Button>
          </Stack>
        )}
      </Stack>

      {/* 댓글(F-22) — 본문과 따로 불러와 댓글 API 가 실패해도 본문은 그대로다. */}
      <CommentsSection postId={post.id} />

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>글을 삭제할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>삭제한 글은 복구할 수 없습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            취소
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
