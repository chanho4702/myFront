> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Components

프로젝트 컴포넌트와 기본 담당자

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/alm/components/{id}` | [컴포넌트를 수정한다](#put-apialmcomponentsid) |
| `DELETE` | `/api/alm/components/{id}` | [컴포넌트를 삭제한다](#delete-apialmcomponentsid) |
| `GET` | `/api/alm/projects/{projectId}/components` | [프로젝트의 컴포넌트 목록을 조회한다](#get-apialmprojectsprojectidcomponents) |
| `POST` | `/api/alm/projects/{projectId}/components` | [프로젝트에 컴포넌트를 만든다](#post-apialmprojectsprojectidcomponents) |

## PUT /api/alm/components/{id}

컴포넌트를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 컴포넌트 ID |

### 요청 본문

`application/json` — `ComponentRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `leadId` | `integer(int64)` |  |  |  |
| `clearLead` | `boolean` |  |  |  |
| `defaultAssignee` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ComponentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ComponentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `leadId` | `integer(int64)` |  |  |  |
| `defaultAssignee` | `string` |  |  |  |
| `issueCount` | `integer(int64)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/components/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "description": "string",
    "leadId": 0,
    "clearLead": false,
    "defaultAssignee": "string"
  }'
```

## DELETE /api/alm/components/{id}

컴포넌트를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 컴포넌트 ID |

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
curl -X DELETE "https://<your-host>/api/alm/components/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/projects/{projectId}/components

프로젝트의 컴포넌트 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ComponentResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ComponentResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].projectId` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].description` | `string` |  |  |  |
| `[].leadId` | `integer(int64)` |  |  |  |
| `[].defaultAssignee` | `string` |  |  |  |
| `[].issueCount` | `integer(int64)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/components" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/components

프로젝트에 컴포넌트를 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 요청 본문

`application/json` — `ComponentRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `leadId` | `integer(int64)` |  |  |  |
| `clearLead` | `boolean` |  |  |  |
| `defaultAssignee` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `ComponentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `ComponentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `leadId` | `integer(int64)` |  |  |  |
| `defaultAssignee` | `string` |  |  |  |
| `issueCount` | `integer(int64)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/components" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "description": "string",
    "leadId": 0,
    "clearLead": false,
    "defaultAssignee": "string"
  }'
```
