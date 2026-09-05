> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Spaces

스페이스 목록·생성·조회·수정·삭제.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/spaces` | [내가 접근할 수 있는 스페이스를 조회한다](#get-apiwikispaces) |
| `POST` | `/api/wiki/spaces` | [스페이스를 만든다 — 생성자에게 ADMIN이 자동으로 붙는다](#post-apiwikispaces) |
| `POST` | `/api/wiki/spaces/personal` | [내 개인 스페이스를 가져온다 — 없으면 만든다](#post-apiwikispacespersonal) |
| `GET` | `/api/wiki/spaces/{id}` | [스페이스를 조회한다](#get-apiwikispacesid) |
| `PUT` | `/api/wiki/spaces/{id}` | [스페이스 이름과 설명을 수정한다](#put-apiwikispacesid) |
| `DELETE` | `/api/wiki/spaces/{id}` | [스페이스를 삭제한다](#delete-apiwikispacesid) |

## GET /api/wiki/spaces

내가 접근할 수 있는 스페이스를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SpaceResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `[].id` | `integer(int64)` |  | 스페이스 ID | `1` |
| `[].key` | `string` |  | 주소에 쓰이는 스페이스 키 | `platform-ops` |
| `[].name` | `string` |  | 스페이스 이름 | `플랫폼 운영` |
| `[].ownerId` | `integer(int64)` |  | 개인 스페이스의 주인. null이면 팀 스페이스 | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/spaces

스페이스를 만든다 — 생성자에게 ADMIN이 자동으로 붙는다

### 요청 본문

`application/json` — `SpaceCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `key` | `string` | 예 | 주소에 쓰이는 스페이스 키. 소문자·숫자·하이픈만 | `platform-ops` |
| `name` | `string` | 예 | 스페이스 이름 | `플랫폼 운영` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `SpaceResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `id` | `integer(int64)` |  | 스페이스 ID | `1` |
| `key` | `string` |  | 주소에 쓰이는 스페이스 키 | `platform-ops` |
| `name` | `string` |  | 스페이스 이름 | `플랫폼 운영` |
| `ownerId` | `integer(int64)` |  | 개인 스페이스의 주인. null이면 팀 스페이스 | `7` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "platform-ops",
    "name": "플랫폼 운영"
  }'
```

## POST /api/wiki/spaces/personal

내 개인 스페이스를 가져온다 — 없으면 만든다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `id` | `integer(int64)` |  | 스페이스 ID | `1` |
| `key` | `string` |  | 주소에 쓰이는 스페이스 키 | `platform-ops` |
| `name` | `string` |  | 스페이스 이름 | `플랫폼 운영` |
| `ownerId` | `integer(int64)` |  | 개인 스페이스의 주인. null이면 팀 스페이스 | `7` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces/personal" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{id}

스페이스를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `id` | `integer(int64)` |  | 스페이스 ID | `1` |
| `key` | `string` |  | 주소에 쓰이는 스페이스 키 | `platform-ops` |
| `name` | `string` |  | 스페이스 이름 | `플랫폼 운영` |
| `ownerId` | `integer(int64)` |  | 개인 스페이스의 주인. null이면 팀 스페이스 | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/spaces/{id}

스페이스 이름과 설명을 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 스페이스 ID |

### 요청 본문

`application/json` — `SpaceUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `name` | `string` | 예 | 스페이스 이름 | `플랫폼 운영` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SpaceResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SpaceResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `description` | `string` |  | 스페이스 설명 | `배포·장애 대응 문서를 모은다` |
| `id` | `integer(int64)` |  | 스페이스 ID | `1` |
| `key` | `string` |  | 주소에 쓰이는 스페이스 키 | `platform-ops` |
| `name` | `string` |  | 스페이스 이름 | `플랫폼 운영` |
| `ownerId` | `integer(int64)` |  | 개인 스페이스의 주인. null이면 팀 스페이스 | `7` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "플랫폼 운영"
  }'
```

## DELETE /api/wiki/spaces/{id}

스페이스를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 스페이스 ID |

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
curl -X DELETE "https://<your-host>/api/wiki/spaces/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
