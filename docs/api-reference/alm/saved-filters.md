> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Saved Filters

내 저장 필터(스마트 검색·AQL)

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/me/filters` | [내 저장 필터를 조회한다](#get-apialmmefilters) |
| `POST` | `/api/alm/me/filters` | [저장 필터를 만든다](#post-apialmmefilters) |
| `PUT` | `/api/alm/me/filters/{id}` | [저장 필터를 수정한다](#put-apialmmefiltersid) |
| `DELETE` | `/api/alm/me/filters/{id}` | [저장 필터를 삭제한다](#delete-apialmmefiltersid) |

## GET /api/alm/me/filters

내 저장 필터를 조회한다

이름 순. 남의 필터는 들어 있지 않다.

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `FilterResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `FilterResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].kind` | `string` |  |  |  |
| `[].query` | `string` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/me/filters" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/me/filters

저장 필터를 만든다

kind가 `aql`이면 문법을 검사해 틀리면 400 `{error, position, expected}`로 거절한다.

### 요청 본문

`application/json` — `FilterCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `query` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `FilterResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `409` | 같은 이름의 필터가 있습니다 | `PlatformError` |

**201 본문** — `FilterResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `query` | `string` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/me/filters" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "kind": "string",
    "query": "string"
  }'
```

## PUT /api/alm/me/filters/{id}

저장 필터를 수정한다

보낸 항목만 바뀐다. 안 보낸 항목은 그대로다.

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 저장 필터 ID |

### 요청 본문

`application/json` — `FilterUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `query` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `FilterResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 같은 이름의 필터가 있습니다 | `PlatformError` |

**200 본문** — `FilterResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `query` | `string` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/me/filters/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "kind": "string",
    "query": "string"
  }'
```

## DELETE /api/alm/me/filters/{id}

저장 필터를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 저장 필터 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/alm/me/filters/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
