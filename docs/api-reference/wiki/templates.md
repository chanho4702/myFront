> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Templates

스페이스 페이지 템플릿.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/wiki/pages/{pageId}/save-as-template` | [지금 페이지를 템플릿으로 저장한다 — 이름을 비우면 페이지 제목을 쓴다](#post-apiwikipagespageidsave-as-template) |
| `GET` | `/api/wiki/spaces/{spaceId}/templates` | [스페이스의 템플릿 목록을 조회한다](#get-apiwikispacesspaceidtemplates) |
| `POST` | `/api/wiki/spaces/{spaceId}/templates` | [스페이스에 템플릿을 만든다](#post-apiwikispacesspaceidtemplates) |
| `GET` | `/api/wiki/templates/{templateId}` | [템플릿 본문을 조회한다](#get-apiwikitemplatestemplateid) |
| `PUT` | `/api/wiki/templates/{templateId}` | [템플릿을 수정한다](#put-apiwikitemplatestemplateid) |
| `DELETE` | `/api/wiki/templates/{templateId}` | [템플릿을 삭제한다](#delete-apiwikitemplatestemplateid) |

## POST /api/wiki/pages/{pageId}/save-as-template

지금 페이지를 템플릿으로 저장한다 — 이름을 비우면 페이지 제목을 쓴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `TemplateRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `name` | `string` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `TemplateResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `TemplateResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |
| `updatedAt` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/save-as-template" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string"
  }'
```

## GET /api/wiki/spaces/{spaceId}/templates

스페이스의 템플릿 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TemplateResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TemplateResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].content` | `string` |  |  |  |
| `[].description` | `string` |  |  |  |
| `[].icon` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].spaceId` | `integer(int64)` |  |  |  |
| `[].updatedAt` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/templates" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/spaces/{spaceId}/templates

스페이스에 템플릿을 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `TemplateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `name` | `string` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `TemplateResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `TemplateResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |
| `updatedAt` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces/<spaceId>/templates" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string"
  }'
```

## GET /api/wiki/templates/{templateId}

템플릿 본문을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `templateId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TemplateResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TemplateResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |
| `updatedAt` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/templates/<templateId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/templates/{templateId}

템플릿을 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `templateId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `TemplateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `name` | `string` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TemplateResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TemplateResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `icon` | `string` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |
| `updatedAt` | `string` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/templates/<templateId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string"
  }'
```

## DELETE /api/wiki/templates/{templateId}

템플릿을 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `templateId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/wiki/templates/<templateId>" \
  -H "Authorization: Bearer chanho_pat_…"
```
