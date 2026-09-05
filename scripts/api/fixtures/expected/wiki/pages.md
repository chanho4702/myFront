> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Pages

페이지 조회·작성·수정

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/{id}` | [페이지 조회](#get-apiwikipagesid) |
| `PUT` | `/api/wiki/pages/{id}` | [페이지 수정](#put-apiwikipagesid) |
| `DELETE` | `/api/wiki/pages/{id}` | [페이지 삭제(휴지통으로)](#delete-apiwikipagesid) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages` | [스페이스의 페이지 목록](#get-apiwikispacesspaceidpages) |
| `POST` | `/api/wiki/spaces/{spaceId}/pages` | [페이지 생성](#post-apiwikispacesspaceidpages) |

## GET /api/wiki/pages/{id}

페이지 조회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 페이지 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{id}

페이지 수정

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `UpdatePageRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 예 |  | `온보딩 가이드` |
| `content` | `string` |  | 마크다운 본문 |  |
| `status` | `string enum(DRAFT, PUBLISHED, ARCHIVED)` |  |  | `DRAFT` |
| `version` | `integer(int64)` | 예 | 현재 버전(낙관적 락) | `7` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 페이지 없음 | `PlatformError` |
| `409` | 버전 충돌 | `PlatformError` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "온보딩 가이드",
    "version": 7
  }'
```

## DELETE /api/wiki/pages/{id}

페이지 삭제(휴지통으로)

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | 삭제됨 |  |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 페이지 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages

스페이스의 페이지 목록

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |
| `status` | query | `string enum(DRAFT, PUBLISHED, ARCHIVED)` |  | 상태 필터(없으면 전부) |
| `X-Request-Id` | header | `string` |  | 추적용 요청 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageSummary[]` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 스페이스 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/spaces/{spaceId}/pages

페이지 생성

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CreatePageRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 예 | 제목(1~200자) | `온보딩 가이드` |
| `content` | `string` |  | 마크다운 본문 | `# 환영합니다` |
| `parentId` | `integer(int64) (nullable)` |  | 상위 페이지 id(없으면 루트) |  |
| `labels` | `string[]` |  |  | `["guide"]` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | 생성됨 | `PageResponse` |
| `400` | 입력 오류 | `PlatformError` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 스페이스 없음 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces/<spaceId>/pages" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "온보딩 가이드"
  }'
```
