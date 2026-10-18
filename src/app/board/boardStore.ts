// 게시판 데이터 레이어 — 게이트웨이(VITE_API_BASE) 경유 board REST 호출.
//
// 인증: board API 호출은 별도 인증 인스턴스를 만들지 않고, 기존 authClient 가
// 메모리에 들고 있는 access token 을 공유한다. 읽기(GET)는 public 이라 토큰 없이도 되고,
// 쓰기(POST/PUT/DELETE)만 Bearer 를 붙이며 401 이면 1회 refresh 후 재시도한다.
// 게이트웨이가 /api/board/** 를 board-service 로 라우팅하며 쿠키를 안 쓴다(Bearer 전용).

import { authClient } from '../../auth';

const BASE = (import.meta.env.VITE_API_BASE as string).replace(/\/+$/, '');

/** board-service 응답/요청 계약. id 는 숫자, 작성자는 토큰에서 서버가 박는다(authorName). */
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** 목록용 요약 DTO(PostSummaryResponse). */
export interface PostSummary {
  id: number;
  title: string;
  authorName: string;
  createdAt: string; // ISO
}

export interface PostInput {
  title: string;
  content: string;
}

/** Spring Data Page 응답(필요한 필드만). */
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 현재 페이지(0-base)
  size: number;
}

/** 상태코드를 들고 다니는 에러 — 페이지에서 404/403 을 구분해 처리한다. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function boardFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = () => {
    const headers = new Headers(init.headers);
    const at = authClient.getAccessToken();
    if (at) headers.set('Authorization', `Bearer ${at}`);
    return fetch(`${BASE}${path}`, { ...init, headers });
  };
  let res = await doFetch();
  if (res.status === 401 && (await authClient.tryRefresh())) {
    res = await doFetch();
  }
  return res;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/** 검색어 최대 길이(board-service PostService.MAX_QUERY_LENGTH 와 같다 — 넘으면 서버 400). */
export const SEARCH_MAX = 100;

/**
 * 최신순(createdAt DESC, 서버 기본 정렬) 페이지 조회. page 는 0-base.
 * `q` 가 있으면 제목·본문 부분 일치(대소문자 무시, `%`·`_` 는 글자 그대로)로 거른다(F-23).
 */
export async function listPosts(page: number, size = 10, q = ''): Promise<Page<PostSummary>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const query = q.trim();
  if (query) params.set('q', query);
  const res = await boardFetch(`/api/board/posts?${params.toString()}`);
  if (!res.ok) throw new ApiError(res.status, '목록을 불러오지 못했습니다.');
  return (await res.json()) as Page<PostSummary>;
}

export async function getPost(id: number): Promise<Post> {
  const res = await boardFetch(`/api/board/posts/${id}`);
  if (res.status === 404) throw new ApiError(404, '존재하지 않는 글입니다.');
  if (!res.ok) throw new ApiError(res.status, '글을 불러오지 못했습니다.');
  return (await res.json()) as Post;
}

export async function createPost(input: PostInput): Promise<Post> {
  const res = await boardFetch('/api/board/posts', jsonInit('POST', input));
  if (res.status === 401) throw new ApiError(401, '로그인이 필요합니다.');
  if (!res.ok) throw new ApiError(res.status, '등록에 실패했습니다.');
  return (await res.json()) as Post;
}

export async function updatePost(id: number, input: PostInput): Promise<Post> {
  const res = await boardFetch(`/api/board/posts/${id}`, jsonInit('PUT', input));
  if (res.status === 403) throw new ApiError(403, '수정 권한이 없습니다.');
  if (res.status === 404) throw new ApiError(404, '존재하지 않는 글입니다.');
  if (!res.ok) throw new ApiError(res.status, '수정에 실패했습니다.');
  return (await res.json()) as Post;
}

export async function deletePost(id: number): Promise<void> {
  const res = await boardFetch(`/api/board/posts/${id}`, { method: 'DELETE' });
  if (res.status === 403) throw new ApiError(403, '삭제 권한이 없습니다.');
  if (res.status !== 204 && !res.ok) throw new ApiError(res.status, '삭제에 실패했습니다.');
}

/* ────────────────────────── 댓글(F-22) ────────────────────────── */
// 계약(board-service CommentController):
//   GET    /api/board/posts/{postId}/comments  → Page<Comment> (공개, 오래된순, 기본 size 50)
//   POST   /api/board/posts/{postId}/comments  → 201 Comment   (Bearer)
//   PUT    /api/board/comments/{id}            → Comment       (작성자 본인 또는 ADMIN)
//   DELETE /api/board/comments/{id}            → 204           (작성자 본인 또는 ADMIN)

/** CommentResponse. */
export interface Comment {
  id: number;
  postId: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** 한 번에 받는 댓글 수 — 서버 기본(50)보다 넉넉히 받아 "더 보기"를 드물게 한다. */
export const COMMENT_PAGE_SIZE = 100;

export async function listComments(postId: number, page = 0, size = COMMENT_PAGE_SIZE): Promise<Page<Comment>> {
  const res = await boardFetch(`/api/board/posts/${postId}/comments?page=${page}&size=${size}`);
  if (!res.ok) throw new ApiError(res.status, '댓글을 불러오지 못했습니다.');
  return (await res.json()) as Page<Comment>;
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const res = await boardFetch(`/api/board/posts/${postId}/comments`, jsonInit('POST', { content }));
  if (res.status === 401) throw new ApiError(401, '로그인이 필요합니다.');
  if (res.status === 404) throw new ApiError(404, '글이 삭제되어 댓글을 달 수 없습니다.');
  if (!res.ok) throw new ApiError(res.status, '댓글을 등록하지 못했습니다.');
  return (await res.json()) as Comment;
}

export async function updateComment(id: number, content: string): Promise<Comment> {
  const res = await boardFetch(`/api/board/comments/${id}`, jsonInit('PUT', { content }));
  if (res.status === 403) throw new ApiError(403, '수정 권한이 없습니다.');
  if (res.status === 404) throw new ApiError(404, '이미 삭제된 댓글입니다.');
  if (!res.ok) throw new ApiError(res.status, '댓글을 수정하지 못했습니다.');
  return (await res.json()) as Comment;
}

export async function deleteComment(id: number): Promise<void> {
  const res = await boardFetch(`/api/board/comments/${id}`, { method: 'DELETE' });
  if (res.status === 403) throw new ApiError(403, '삭제 권한이 없습니다.');
  if (res.status === 404) return; // 이미 지워졌으면 목표 상태와 같다.
  if (res.status !== 204 && !res.ok) throw new ApiError(res.status, '댓글을 삭제하지 못했습니다.');
}
