> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issue History

이슈 변경 이력과 활동 피드

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}/activity` | [이슈의 활동 피드를 조회한다](#get-apialmissuesissueidactivity) |
| `GET` | `/api/alm/projects/{projectId}/changes` | [프로젝트의 이슈 변경 이력을 조회한다](#get-apialmprojectsprojectidchanges) |

## GET /api/alm/issues/{issueId}/activity

이슈의 활동 피드를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ActivityResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ActivityResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].actorId` | `integer(int64)` |  |  |  |
| `[].type` | `string` |  |  |  |
| `[].detail` | `string` |  |  |  |
| `[].occurredAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/activity" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/projects/{projectId}/changes

프로젝트의 이슈 변경 이력을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |
| `field` | query | `string enum(STATUS, SPRINT)` |  | 바뀐 필드로 거른다(상태·담당자 등) |
| `sprintId` | query | `integer(int64)` |  | 해당 스프린트에 속한 이슈만 본다 |
| `since` | query | `string(date-time)` |  | 이 시각 이후 변경만 본다. ISO-8601 인스턴트(예: 2026-08-01T00:00:00Z) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueChangeResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueChangeResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].projectId` | `integer(int64)` |  |  |  |
| `[].sprintId` | `integer(int64)` |  |  |  |
| `[].field` | `string enum(STATUS, SPRINT)` |  |  |  |
| `[].fromValue` | `string` |  |  |  |
| `[].toValue` | `string` |  |  |  |
| `[].actorId` | `integer(int64)` |  |  |  |
| `[].changedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/changes" \
  -H "Authorization: Bearer chanho_pat_…"
```
