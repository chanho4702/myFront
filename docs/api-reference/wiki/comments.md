> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Comments

페이지 댓글과 본문 구간에 붙는 인라인 스레드.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/wiki/comments/{commentId}` | [댓글 본문을 수정한다 — 작성자 본인만](#put-apiwikicommentscommentid) |
| `DELETE` | `/api/wiki/comments/{commentId}` | [댓글을 삭제한다 — 작성자 또는 스페이스 ADMIN](#delete-apiwikicommentscommentid) |
| `PUT` | `/api/wiki/comments/{commentId}/resolved` | [인라인 댓글 스레드를 해결 처리하거나 되돌린다](#put-apiwikicommentscommentidresolved) |
| `GET` | `/api/wiki/pages/{pageId}/comments` | [페이지의 댓글을 조회한다](#get-apiwikipagespageidcomments) |
| `POST` | `/api/wiki/pages/{pageId}/comments` | [페이지에 댓글을 단다 — 인용 구간을 주면 인라인 댓글이다](#post-apiwikipagespageidcomments) |

## PUT /api/wiki/comments/{commentId}

댓글 본문을 수정한다 — 작성자 본인만

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `commentId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CommentUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `body` | `string` | 예 | 고쳐 쓸 댓글 본문 | `스테이징 검증 후 진행하기로 했습니다` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CommentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CommentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `anchorOccurrence` | `integer(int32)` |  | 그 구간이 본문에서 몇 번째로 등장하는지(0부터) | `0` |
| `anchorQuote` | `string` |  | 인라인 댓글이 가리키는 본문 구간 | `롤백은 태그로 되돌린다` |
| `anchorType` | `string` |  | inline이면 본문 구간 댓글, page면 일반 댓글 | `page` |
| `authorId` | `integer(int64)` |  | 작성자 사용자 ID | `7` |
| `authorName` | `string` |  | 작성 시점에 저장해 둔 작성자 표시명 | `김찬호` |
| `body` | `string` |  | 댓글 본문 | `스테이징에서 먼저 돌려야 합니다` |
| `createdAt` | `string(date-time)` |  | 작성 시각 |  |
| `id` | `integer(int64)` |  | 댓글 ID | `5` |
| `pageId` | `integer(int64)` |  | 댓글이 달린 페이지 ID | `42` |
| `parentId` | `integer(int64)` |  | 상위 댓글 ID. 최상위면 null | `3` |
| `reactions` | `ReactionSummary[]` |  | 이 댓글에 붙은 리액션 집계 |  |
| `reactions[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `reactions[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `reactions[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |
| `resolvedAt` | `string(date-time)` |  | 해결 처리한 시각. 열려 있으면 null |  |
| `updatedAt` | `string(date-time)` |  | 본문을 고친 시각. 고친 적 없으면 null |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/comments/<commentId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "스테이징 검증 후 진행하기로 했습니다"
  }'
```

## DELETE /api/wiki/comments/{commentId}

댓글을 삭제한다 — 작성자 또는 스페이스 ADMIN

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `commentId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/comments/<commentId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/comments/{commentId}/resolved

인라인 댓글 스레드를 해결 처리하거나 되돌린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `commentId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `ResolvedRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `resolved` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CommentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CommentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `anchorOccurrence` | `integer(int32)` |  | 그 구간이 본문에서 몇 번째로 등장하는지(0부터) | `0` |
| `anchorQuote` | `string` |  | 인라인 댓글이 가리키는 본문 구간 | `롤백은 태그로 되돌린다` |
| `anchorType` | `string` |  | inline이면 본문 구간 댓글, page면 일반 댓글 | `page` |
| `authorId` | `integer(int64)` |  | 작성자 사용자 ID | `7` |
| `authorName` | `string` |  | 작성 시점에 저장해 둔 작성자 표시명 | `김찬호` |
| `body` | `string` |  | 댓글 본문 | `스테이징에서 먼저 돌려야 합니다` |
| `createdAt` | `string(date-time)` |  | 작성 시각 |  |
| `id` | `integer(int64)` |  | 댓글 ID | `5` |
| `pageId` | `integer(int64)` |  | 댓글이 달린 페이지 ID | `42` |
| `parentId` | `integer(int64)` |  | 상위 댓글 ID. 최상위면 null | `3` |
| `reactions` | `ReactionSummary[]` |  | 이 댓글에 붙은 리액션 집계 |  |
| `reactions[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `reactions[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `reactions[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |
| `resolvedAt` | `string(date-time)` |  | 해결 처리한 시각. 열려 있으면 null |  |
| `updatedAt` | `string(date-time)` |  | 본문을 고친 시각. 고친 적 없으면 null |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/comments/<commentId>/resolved" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "resolved": false
  }'
```

## GET /api/wiki/pages/{pageId}/comments

페이지의 댓글을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CommentResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CommentResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].anchorOccurrence` | `integer(int32)` |  | 그 구간이 본문에서 몇 번째로 등장하는지(0부터) | `0` |
| `[].anchorQuote` | `string` |  | 인라인 댓글이 가리키는 본문 구간 | `롤백은 태그로 되돌린다` |
| `[].anchorType` | `string` |  | inline이면 본문 구간 댓글, page면 일반 댓글 | `page` |
| `[].authorId` | `integer(int64)` |  | 작성자 사용자 ID | `7` |
| `[].authorName` | `string` |  | 작성 시점에 저장해 둔 작성자 표시명 | `김찬호` |
| `[].body` | `string` |  | 댓글 본문 | `스테이징에서 먼저 돌려야 합니다` |
| `[].createdAt` | `string(date-time)` |  | 작성 시각 |  |
| `[].id` | `integer(int64)` |  | 댓글 ID | `5` |
| `[].pageId` | `integer(int64)` |  | 댓글이 달린 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 상위 댓글 ID. 최상위면 null | `3` |
| `[].reactions` | `ReactionSummary[]` |  | 이 댓글에 붙은 리액션 집계 |  |
| `[].reactions[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].reactions[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reactions[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |
| `[].resolvedAt` | `string(date-time)` |  | 해결 처리한 시각. 열려 있으면 null |  |
| `[].updatedAt` | `string(date-time)` |  | 본문을 고친 시각. 고친 적 없으면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/comments" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{pageId}/comments

페이지에 댓글을 단다 — 인용 구간을 주면 인라인 댓글이다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CommentCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `anchorOccurrence` | `integer(int32)` |  | 그 인용 구간이 본문에서 몇 번째로 등장하는지(0부터) | `0` |
| `anchorQuote` | `string` |  | 본문에서 선택한 인용 구간. 주면 인라인 댓글이 된다 | `롤백은 태그로 되돌린다` |
| `body` | `string` | 예 | 댓글 본문 | `이 절차는 스테이징에서 먼저 돌려야 합니다` |
| `parentId` | `integer(int64)` |  | 답글을 달 상위 댓글 ID. 비우면 최상위 댓글 | `5` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `CommentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `CommentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `anchorOccurrence` | `integer(int32)` |  | 그 구간이 본문에서 몇 번째로 등장하는지(0부터) | `0` |
| `anchorQuote` | `string` |  | 인라인 댓글이 가리키는 본문 구간 | `롤백은 태그로 되돌린다` |
| `anchorType` | `string` |  | inline이면 본문 구간 댓글, page면 일반 댓글 | `page` |
| `authorId` | `integer(int64)` |  | 작성자 사용자 ID | `7` |
| `authorName` | `string` |  | 작성 시점에 저장해 둔 작성자 표시명 | `김찬호` |
| `body` | `string` |  | 댓글 본문 | `스테이징에서 먼저 돌려야 합니다` |
| `createdAt` | `string(date-time)` |  | 작성 시각 |  |
| `id` | `integer(int64)` |  | 댓글 ID | `5` |
| `pageId` | `integer(int64)` |  | 댓글이 달린 페이지 ID | `42` |
| `parentId` | `integer(int64)` |  | 상위 댓글 ID. 최상위면 null | `3` |
| `reactions` | `ReactionSummary[]` |  | 이 댓글에 붙은 리액션 집계 |  |
| `reactions[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `reactions[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `reactions[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |
| `resolvedAt` | `string(date-time)` |  | 해결 처리한 시각. 열려 있으면 null |  |
| `updatedAt` | `string(date-time)` |  | 본문을 고친 시각. 고친 적 없으면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/comments" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "이 절차는 스테이징에서 먼저 돌려야 합니다"
  }'
```
