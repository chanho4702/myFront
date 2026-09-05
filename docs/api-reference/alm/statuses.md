> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Statuses

상태 레지스트리와 사용량

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/settings/statuses` | [상태 목록을 조회한다](#get-apialmsettingsstatuses) |
| `POST` | `/api/alm/settings/statuses` | [상태를 만든다](#post-apialmsettingsstatuses) |
| `GET` | `/api/alm/settings/statuses/usage` | [상태별로 쓰이는 이슈 수를 조회한다](#get-apialmsettingsstatusesusage) |
| `PUT` | `/api/alm/settings/statuses/{id}` | [상태를 수정한다](#put-apialmsettingsstatusesid) |
| `DELETE` | `/api/alm/settings/statuses/{id}` | [상태를 삭제한다](#delete-apialmsettingsstatusesid) |

## GET /api/alm/settings/statuses

상태 목록을 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `StatusResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `StatusResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `string` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].categoryId` | `string` |  |  |  |
| `[].description` | `string` |  |  |  |
| `[].icon` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/statuses" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/statuses

상태를 만든다

### 요청 본문

`application/json` — `StatusRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `categoryId` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `StatusResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `StatusResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `categoryId` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/statuses" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "categoryId": "string",
    "description": "string",
    "icon": "string"
  }'
```

## GET /api/alm/settings/statuses/usage

상태별로 쓰이는 이슈 수를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, integer(int64)>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/statuses/usage" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/settings/statuses/{id}

상태를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 | 상태 ID |

### 요청 본문

`application/json` — `StatusRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `categoryId` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `StatusResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `StatusResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `categoryId` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/settings/statuses/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "categoryId": "string",
    "description": "string",
    "icon": "string"
  }'
```

## DELETE /api/alm/settings/statuses/{id}

상태를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 | 상태 ID |

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
curl -X DELETE "https://<your-host>/api/alm/settings/statuses/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
