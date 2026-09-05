> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Blog

스페이스 블로그 글 목록. 글 자체는 페이지 API로 다룬다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/spaces/{spaceId}/blog` | [스페이스의 블로그 글을 조회한다](#get-apiwikispacesspaceidblog) |

## GET /api/wiki/spaces/{spaceId}/blog

스페이스의 블로그 글을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `BlogPostView[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `BlogPostView[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].createdBy` | `integer(int64)` |  |  |  |
| `[].excerpt` | `string` |  |  |  |
| `[].icon` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].status` | `string enum(draft, published)` |  |  |  |
| `[].title` | `string` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |
| `[].updatedBy` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/blog" \
  -H "Authorization: Bearer chanho_pat_…"
```
