> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Priorities

우선순위 레지스트리와 사용량

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/settings/priorities` | [우선순위 목록을 조회한다](#get-apialmsettingspriorities) |
| `POST` | `/api/alm/settings/priorities` | [우선순위를 만든다](#post-apialmsettingspriorities) |
| `GET` | `/api/alm/settings/priorities/usage` | [우선순위별로 쓰이는 이슈 수를 조회한다](#get-apialmsettingsprioritiesusage) |
| `PUT` | `/api/alm/settings/priorities/{id}` | [우선순위를 수정한다](#put-apialmsettingsprioritiesid) |
| `DELETE` | `/api/alm/settings/priorities/{id}` | [우선순위를 삭제한다](#delete-apialmsettingsprioritiesid) |
| `POST` | `/api/alm/settings/priorities/{id}/move` | [우선순위 순서를 옮긴다](#post-apialmsettingsprioritiesidmove) |

## GET /api/alm/settings/priorities

우선순위 목록을 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PriorityResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PriorityResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `string` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].icon` | `string` |  |  |  |
| `[].color` | `string` |  |  |  |
| `[].description` | `string` |  |  |  |
| `[].order` | `integer(int32)` |  |  |  |
| `[].builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/priorities" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/priorities

우선순위를 만든다

### 요청 본문

`application/json` — `PriorityRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `description` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `PriorityResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `PriorityResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/priorities" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "icon": "string",
    "color": "string",
    "description": "string"
  }'
```

## GET /api/alm/settings/priorities/usage

우선순위별로 쓰이는 이슈 수를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, integer(int64)>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/priorities/usage" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/settings/priorities/{id}

우선순위를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 요청 본문

`application/json` — `PriorityRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `description` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PriorityResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PriorityResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `color` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `builtIn` | `boolean` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/settings/priorities/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "icon": "string",
    "color": "string",
    "description": "string"
  }'
```

## DELETE /api/alm/settings/priorities/{id}

우선순위를 삭제한다

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
curl -X DELETE "https://<your-host>/api/alm/settings/priorities/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/priorities/{id}/move

우선순위 순서를 옮긴다

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
curl -X POST "https://<your-host>/api/alm/settings/priorities/<id>/move" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "delta": 0
  }'
```
