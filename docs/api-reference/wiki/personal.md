> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Personal

개인 별표와 최근 방문 문서.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/wiki/pages/{pageId}/star` | [페이지에 별표를 단다](#put-apiwikipagespageidstar) |
| `DELETE` | `/api/wiki/pages/{pageId}/star` | [페이지 별표를 뗀다](#delete-apiwikipagespageidstar) |
| `GET` | `/api/wiki/recent` | [내가 최근에 본 페이지를 조회한다](#get-apiwikirecent) |
| `PUT` | `/api/wiki/spaces/{spaceId}/star` | [스페이스에 별표를 단다](#put-apiwikispacesspaceidstar) |
| `DELETE` | `/api/wiki/spaces/{spaceId}/star` | [스페이스 별표를 뗀다](#delete-apiwikispacesspaceidstar) |
| `GET` | `/api/wiki/stars` | [내가 별표한 페이지와 스페이스를 조회한다](#get-apiwikistars) |

## PUT /api/wiki/pages/{pageId}/star

페이지에 별표를 단다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

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
curl -X PUT "https://<your-host>/api/wiki/pages/<pageId>/star" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/pages/{pageId}/star

페이지 별표를 뗀다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/wiki/pages/<pageId>/star" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/recent

내가 최근에 본 페이지를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `limit` | query | `integer(int32)` |  | 최대 건수 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `StarredPage[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `StarredPage[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].page` | `PageTreeItem` |  |  |  |
| `[].page.icon` | `string` |  |  |  |
| `[].page.id` | `integer(int64)` |  |  |  |
| `[].page.parentId` | `integer(int64)` |  |  |  |
| `[].page.position` | `integer(int64)` |  |  |  |
| `[].page.status` | `string enum(draft, published)` |  |  |  |
| `[].page.title` | `string` |  |  |  |
| `[].page.type` | `string enum(page, folder, blog)` |  |  |  |
| `[].page.updatedAt` | `string(date-time)` |  |  |  |
| `[].page.updatedBy` | `integer(int64)` |  |  |  |
| `[].spaceId` | `string` |  |  |  |
| `[].spaceName` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/recent" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/spaces/{spaceId}/star

스페이스에 별표를 단다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

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
curl -X PUT "https://<your-host>/api/wiki/spaces/<spaceId>/star" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/spaces/{spaceId}/star

스페이스 별표를 뗀다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/wiki/spaces/<spaceId>/star" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/stars

내가 별표한 페이지와 스페이스를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `StarsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `StarsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `pages` | `StarredPage[]` |  |  |  |
| `pages[].page` | `PageTreeItem` |  |  |  |
| `pages[].page.icon` | `string` |  |  |  |
| `pages[].page.id` | `integer(int64)` |  |  |  |
| `pages[].page.parentId` | `integer(int64)` |  |  |  |
| `pages[].page.position` | `integer(int64)` |  |  |  |
| `pages[].page.status` | `string enum(draft, published)` |  |  |  |
| `pages[].page.title` | `string` |  |  |  |
| `pages[].page.type` | `string enum(page, folder, blog)` |  |  |  |
| `pages[].page.updatedAt` | `string(date-time)` |  |  |  |
| `pages[].page.updatedBy` | `integer(int64)` |  |  |  |
| `pages[].spaceId` | `string` |  |  |  |
| `pages[].spaceName` | `string` |  |  |  |
| `spaceIds` | `string[]` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/stars" \
  -H "Authorization: Bearer chanho_pat_…"
```
