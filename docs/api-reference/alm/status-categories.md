> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Status Categories

상태 카테고리 레지스트리

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/settings/categories` | [상태 카테고리를 조회한다](#get-apialmsettingscategories) |
| `POST` | `/api/alm/settings/categories` | [상태 카테고리를 만든다](#post-apialmsettingscategories) |
| `PUT` | `/api/alm/settings/categories/{id}` | [상태 카테고리를 수정한다](#put-apialmsettingscategoriesid) |
| `DELETE` | `/api/alm/settings/categories/{id}` | [상태 카테고리를 삭제한다](#delete-apialmsettingscategoriesid) |
| `POST` | `/api/alm/settings/categories/{id}/move` | [상태 카테고리 순서를 옮긴다](#post-apialmsettingscategoriesidmove) |

## GET /api/alm/settings/categories

상태 카테고리를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CategoryResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `CategoryResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `string` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].kind` | `string` |  |  |  |
| `[].color` | `string` |  |  |  |
| `[].order` | `integer(int32)` |  |  |  |
| `[].builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/categories" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/categories

상태 카테고리를 만든다

### 요청 본문

`application/json` — `CategoryRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `color` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `CategoryResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `CategoryResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/categories" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "kind": "string",
    "color": "string"
  }'
```

## PUT /api/alm/settings/categories/{id}

상태 카테고리를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 요청 본문

`application/json` — `CategoryRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `color` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CategoryResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CategoryResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/settings/categories/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "kind": "string",
    "color": "string"
  }'
```

## DELETE /api/alm/settings/categories/{id}

상태 카테고리를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/settings/categories/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/categories/{id}/move

상태 카테고리 순서를 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 요청 본문

`application/json` — `MoveRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `delta` | `integer(int32)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/categories/<id>/move" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "delta": 0
  }'
```
