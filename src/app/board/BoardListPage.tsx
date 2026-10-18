import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { listPosts, SEARCH_MAX, type Page, type PostSummary } from './boardStore';

const PAGE_SIZE = 10;

export default function BoardListPage() {
  const navigate = useNavigate();
  // 검색어는 주소(?q=)에 둔다 — 글을 열었다가 뒤로 와도 검색 결과가 유지된다(F-23).
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [input, setInput] = React.useState(query);
  // 페이지(0-base, 서버 기준)는 그 페이지를 고른 검색어와 함께 둔다 — 검색어가 바뀌면(새 검색·뒤로 가기)
  // 저장된 페이지가 다른 검색어 것이라 자동으로 첫 페이지가 된다.
  const [pageState, setPageState] = React.useState({ query, page: 0 });
  const page = pageState.query === query ? pageState.page : 0;
  const setPage = (next: number) => setPageState({ query, page: next });
  const [data, setData] = React.useState<Page<PostSummary> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listPosts(page, PAGE_SIZE, query)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, query]);

  // 주소의 검색어가 바뀌면(뒤로 가기 포함) 입력창을 맞춘다.
  React.useEffect(() => {
    setInput(query);
  }, [query]);

  const applySearch = (next: string) => {
    const q = next.trim();
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q);
    else params.delete('q');
    setSearchParams(params);
  };

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const pageCount = Math.max(1, data?.totalPages ?? 1);
  const isEmpty = !loading && !error && rows.length === 0;
  const searching = query !== '';

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            게시판
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {searching
              ? `«${query}» 검색 결과 ${total.toLocaleString('ko-KR')}개`
              : total > 0
                ? `총 ${total.toLocaleString('ko-KR')}개의 글`
                : '팀과 공유할 소식을 남겨보세요.'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditRoundedIcon />}
          onClick={() => navigate('/app/board/new')}
        >
          글쓰기
        </Button>
      </Stack>

      <Box
        component="form"
        role="search"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          applySearch(input);
        }}
        sx={{ display: 'flex', gap: 1, mb: 2, maxWidth: 560 }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="제목·본문 검색"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': '게시글 검색', maxLength: SEARCH_MAX },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: input ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="검색어 지우기"
                    onClick={() => {
                      setInput('');
                      applySearch('');
                    }}
                  >
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <Button type="submit" variant="outlined">
          검색
        </Button>
      </Box>

      {isEmpty && searching ? (
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
          <SearchOffRoundedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            «{query}»에 맞는 글이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            다른 검색어로 찾아보거나 검색어를 지워 전체 글을 보세요.
          </Typography>
          <Button onClick={() => applySearch('')} sx={{ mt: 1 }}>
            전체 글 보기
          </Button>
        </Paper>
      ) : isEmpty ? (
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
          <ForumOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            아직 등록된 글이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            첫 번째 글을 작성해 게시판을 시작해 보세요.
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditRoundedIcon />}
            onClick={() => navigate('/app/board/new')}
            sx={{ mt: 1 }}
          >
            첫 글 작성하기
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 600 } }}>
                <TableCell width={72} align="center">
                  번호
                </TableCell>
                <TableCell>제목</TableCell>
                <TableCell width={160}>작성자</TableCell>
                <TableCell width={140} align="right">
                  작성일
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                !error &&
                rows.map((post, index) => (
                  <TableRow
                    key={post.id}
                    hover
                    onClick={() => navigate(`/app/board/${post.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell align="center" sx={{ color: 'text.secondary' }}>
                      {total - (page * PAGE_SIZE + index)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{post.title}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{post.authorName}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, border: 0 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, border: 0, color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!isEmpty && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={(_e, value) => setPage(value - 1)}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}
