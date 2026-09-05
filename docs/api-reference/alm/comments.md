> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Comments

이슈 댓글과 멘션

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/alm/comments/{id}` | [댓글 본문과 멘션을 수정한다](#put-apialmcommentsid) |
| `DELETE` | `/api/alm/comments/{id}` | [댓글을 삭제한다](#delete-apialmcommentsid) |
| `GET` | `/api/alm/issues/{issueId}/comments` | [이슈의 댓글을 조회한다](#get-apialmissuesissueidcomments) |
| `POST` | `/api/alm/issues/{issueId}/comments` | [이슈에 댓글을 단다](#post-apialmissuesissueidcomments) |

## PUT /api/alm/comments/{id}

댓글 본문과 멘션을 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CommentRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `body` | `string` |  |  |  |
| `mentionedUserIds` | `integer(int64)[]` |  |  |  |

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
| `id` | `integer(int64)` |  |  |  |
| `issueId` | `integer(int64)` |  |  |  |
| `authorId` | `integer(int64)` |  |  |  |
| `body` | `string` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/comments/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "string",
    "mentionedUserIds": [
      0
    ]
  }'
```

## DELETE /api/alm/comments/{id}

댓글을 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/comments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/issues/{issueId}/comments

이슈의 댓글을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

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
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].authorId` | `integer(int64)` |  |  |  |
| `[].body` | `string` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/comments" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/comments

이슈에 댓글을 단다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CommentRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `body` | `string` |  |  |  |
| `mentionedUserIds` | `integer(int64)[]` |  |  |  |

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
| `id` | `integer(int64)` |  |  |  |
| `issueId` | `integer(int64)` |  |  |  |
| `authorId` | `integer(int64)` |  |  |  |
| `body` | `string` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/comments" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "string",
    "mentionedUserIds": [
      0
    ]
  }'
```
