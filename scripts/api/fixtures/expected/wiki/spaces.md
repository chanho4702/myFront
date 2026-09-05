> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Spaces

스페이스(문서 묶음) 관리

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/spaces` | [스페이스 목록](#get-apiwikispaces) |
| `POST` | `/api/wiki/spaces` | [스페이스 생성](#post-apiwikispaces) |
| `GET` | `/api/wiki/spaces/{id}` | [스페이스 조회](#get-apiwikispacesid) |
| `PUT` | `/api/wiki/spaces/{id}` | [스페이스 수정](#put-apiwikispacesid) |
| `DELETE` | `/api/wiki/spaces/{id}` | [스페이스 삭제](#delete-apiwikispacesid) |

## GET /api/wiki/spaces

스페이스 목록

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `q` | query | `string` |  | 이름·키 부분 일치 검색어 |
| `page` | query | `integer(int32)` |  |  |
| `size` | query | `integer(int32)` |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse[]` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `SpaceResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` | 예 |  | `42` |
| `[].key` | `string` | 예 | URL 에 쓰는 짧은 키 | `TEAM` |
| `[].name` | `string` | 예 |  | `팀 위키` |
| `[].description` | `string (nullable)` |  |  |  |
| `[].owner` | `UserSummary` |  |  |  |
| `[].owner.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `[].owner.name` | `string` | 예 |  | `홍길동` |
| `[].owner.org` | `OrgSummary` |  |  |  |
| `[].owner.org.id` | `integer(int64)` | 예 |  | `7` |
| `[].owner.org.name` | `string` | 예 |  | `플랫폼팀` |
| `[].version` | `integer(int64)` | 예 |  | `3` |
| `[].createdAt` | `string(date-time)` | 예 |  | `2026-09-05T09:00:00Z` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/spaces

스페이스 생성

### 요청 본문

`application/json` — `CreateSpaceRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `key` | `string` | 예 | 대문자·숫자 2~10자 | `TEAM` |
| `name` | `string` | 예 | 스페이스 이름 | `팀 위키` |
| `description` | `string` |  | 한 줄 설명 | `팀 운영 문서` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | 생성됨 | `SpaceResponse` |
| `400` | 입력 오류 | `PlatformError` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**201 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` | 예 |  | `42` |
| `key` | `string` | 예 | URL 에 쓰는 짧은 키 | `TEAM` |
| `name` | `string` | 예 |  | `팀 위키` |
| `description` | `string (nullable)` |  |  |  |
| `owner` | `UserSummary` |  |  |  |
| `owner.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `owner.name` | `string` | 예 |  | `홍길동` |
| `owner.org` | `OrgSummary` |  |  |  |
| `owner.org.id` | `integer(int64)` | 예 |  | `7` |
| `owner.org.name` | `string` | 예 |  | `플랫폼팀` |
| `version` | `integer(int64)` | 예 |  | `3` |
| `createdAt` | `string(date-time)` | 예 |  | `2026-09-05T09:00:00Z` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "TEAM",
    "name": "팀 위키"
  }'
```

## GET /api/wiki/spaces/{id}

스페이스 조회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 스페이스 없음 | `PlatformError` |

**200 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` | 예 |  | `42` |
| `key` | `string` | 예 | URL 에 쓰는 짧은 키 | `TEAM` |
| `name` | `string` | 예 |  | `팀 위키` |
| `description` | `string (nullable)` |  |  |  |
| `owner` | `UserSummary` |  |  |  |
| `owner.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `owner.name` | `string` | 예 |  | `홍길동` |
| `owner.org` | `OrgSummary` |  |  |  |
| `owner.org.id` | `integer(int64)` | 예 |  | `7` |
| `owner.org.name` | `string` | 예 |  | `플랫폼팀` |
| `version` | `integer(int64)` | 예 |  | `3` |
| `createdAt` | `string(date-time)` | 예 |  | `2026-09-05T09:00:00Z` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/spaces/{id}

스페이스 수정

낙관적 락 — `version` 이 현재 값과 다르면 409.

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `UpdateSpaceRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 | 스페이스 이름 | `팀 위키` |
| `description` | `string (nullable)` |  | 한 줄 설명 |  |
| `version` | `integer(int64)` | 예 | 현재 버전(낙관적 락) | `3` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 스페이스 없음 | `PlatformError` |
| `409` | 버전 충돌 | `PlatformError` |

**200 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` | 예 |  | `42` |
| `key` | `string` | 예 | URL 에 쓰는 짧은 키 | `TEAM` |
| `name` | `string` | 예 |  | `팀 위키` |
| `description` | `string (nullable)` |  |  |  |
| `owner` | `UserSummary` |  |  |  |
| `owner.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `owner.name` | `string` | 예 |  | `홍길동` |
| `owner.org` | `OrgSummary` |  |  |  |
| `owner.org.id` | `integer(int64)` | 예 |  | `7` |
| `owner.org.name` | `string` | 예 |  | `플랫폼팀` |
| `version` | `integer(int64)` | 예 |  | `3` |
| `createdAt` | `string(date-time)` | 예 |  | `2026-09-05T09:00:00Z` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "팀 위키",
    "version": 3
  }'
```

## DELETE /api/wiki/spaces/{id}

스페이스 삭제

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
| `404` | 스페이스 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
