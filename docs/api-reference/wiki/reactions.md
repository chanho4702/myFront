> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Reactions

페이지와 댓글에 붙는 이모지 리액션.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/wiki/comments/{commentId}/reactions/{emoji}` | [댓글에 이모지 리액션을 단다](#put-apiwikicommentscommentidreactionsemoji) |
| `DELETE` | `/api/wiki/comments/{commentId}/reactions/{emoji}` | [댓글에 단 내 리액션을 뗀다](#delete-apiwikicommentscommentidreactionsemoji) |
| `GET` | `/api/wiki/pages/{pageId}/reactions` | [페이지의 리액션 집계를 조회한다](#get-apiwikipagespageidreactions) |
| `PUT` | `/api/wiki/pages/{pageId}/reactions/{emoji}` | [페이지에 이모지 리액션을 단다](#put-apiwikipagespageidreactionsemoji) |
| `DELETE` | `/api/wiki/pages/{pageId}/reactions/{emoji}` | [페이지에 단 내 리액션을 뗀다](#delete-apiwikipagespageidreactionsemoji) |

## PUT /api/wiki/comments/{commentId}/reactions/{emoji}

댓글에 이모지 리액션을 단다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `commentId` | path | `integer(int64)` | 예 | 댓글 ID |
| `emoji` | path | `string` | 예 | 리액션 이모지 문자 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ReactionSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ReactionSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/comments/<commentId>/reactions/<emoji>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/comments/{commentId}/reactions/{emoji}

댓글에 단 내 리액션을 뗀다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `commentId` | path | `integer(int64)` | 예 | 댓글 ID |
| `emoji` | path | `string` | 예 | 리액션 이모지 문자 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ReactionSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ReactionSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/comments/<commentId>/reactions/<emoji>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/reactions

페이지의 리액션 집계를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ReactionSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ReactionSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/reactions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{pageId}/reactions/{emoji}

페이지에 이모지 리액션을 단다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |
| `emoji` | path | `string` | 예 | 리액션 이모지 문자 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ReactionSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ReactionSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<pageId>/reactions/<emoji>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/pages/{pageId}/reactions/{emoji}

페이지에 단 내 리액션을 뗀다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |
| `emoji` | path | `string` | 예 | 리액션 이모지 문자 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ReactionSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ReactionSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 이모지를 누른 사람 수 | `3` |
| `[].emoji` | `string` |  | 이모지 문자 | `❤️` |
| `[].reacted` | `boolean` |  | 내가 눌렀는지 | `true` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/pages/<pageId>/reactions/<emoji>" \
  -H "Authorization: Bearer chanho_pat_…"
```
