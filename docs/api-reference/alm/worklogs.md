> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Worklogs

작업 시간 기록과 프로젝트 집계

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}/worklogs` | [이슈의 작업 시간 기록을 조회한다](#get-apialmissuesissueidworklogs) |
| `POST` | `/api/alm/issues/{issueId}/worklogs` | [이슈에 작업 시간을 기록한다](#post-apialmissuesissueidworklogs) |
| `GET` | `/api/alm/projects/{projectId}/worklogs` | [프로젝트의 작업 시간 기록을 기간으로 집계한다](#get-apialmprojectsprojectidworklogs) |
| `DELETE` | `/api/alm/worklogs/{id}` | [작업 시간 기록을 삭제한다](#delete-apialmworklogsid) |

## GET /api/alm/issues/{issueId}/worklogs

이슈의 작업 시간 기록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WorklogResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WorklogResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].authorId` | `integer(int64)` |  |  |  |
| `[].hours` | `number` |  |  |  |
| `[].comment` | `string` |  |  |  |
| `[].workedOn` | `string(date)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/worklogs" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/worklogs

이슈에 작업 시간을 기록한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 요청 본문

`application/json` — `WorklogRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `hours` | `number` |  |  |  |
| `comment` | `string` |  |  |  |
| `workedOn` | `string(date)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `WorklogResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `WorklogResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `issueId` | `integer(int64)` |  |  |  |
| `authorId` | `integer(int64)` |  |  |  |
| `hours` | `number` |  |  |  |
| `comment` | `string` |  |  |  |
| `workedOn` | `string(date)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/worklogs" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "hours": 0,
    "comment": "string",
    "workedOn": "2026-01-01"
  }'
```

## GET /api/alm/projects/{projectId}/worklogs

프로젝트의 작업 시간 기록을 기간으로 집계한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |
| `since` | query | `string(date)` |  | 집계 시작일(포함). 생략하면 처음부터 |
| `until` | query | `string(date)` |  | 집계 종료일(포함). 생략하면 끝까지 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectWorklogRow[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectWorklogRow[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].issueKey` | `string` |  |  |  |
| `[].authorId` | `integer(int64)` |  |  |  |
| `[].hours` | `number` |  |  |  |
| `[].comment` | `string` |  |  |  |
| `[].workedOn` | `string(date)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/worklogs" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/alm/worklogs/{id}

작업 시간 기록을 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 작업 시간 기록 ID |

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
curl -X DELETE "https://<your-host>/api/alm/worklogs/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
