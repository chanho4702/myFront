> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Sprints

스프린트 계획·시작·완료

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/projects/{projectId}/sprints` | [프로젝트의 스프린트를 조회한다](#get-apialmprojectsprojectidsprints) |
| `POST` | `/api/alm/projects/{projectId}/sprints` | [스프린트를 만든다 — 이름을 비우면 서버가 자동으로 붙인다](#post-apialmprojectsprojectidsprints) |
| `GET` | `/api/alm/sprints/{sprintId}` | [스프린트 하나를 조회한다](#get-apialmsprintssprintid) |
| `PUT` | `/api/alm/sprints/{sprintId}` | [스프린트 계획을 수정한다 — expectedVersion이 어긋나면 409](#put-apialmsprintssprintid) |
| `POST` | `/api/alm/sprints/{sprintId}/complete` | [스프린트를 완료하고 미완료 이슈를 옮긴다](#post-apialmsprintssprintidcomplete) |
| `POST` | `/api/alm/sprints/{sprintId}/start` | [스프린트를 시작한다](#post-apialmsprintssprintidstart) |

## GET /api/alm/projects/{projectId}/sprints

프로젝트의 스프린트를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SprintResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SprintResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `[].projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `[].name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `[].state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `[].goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `[].plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `[].plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `[].startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `[].completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `[].version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `[].createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `[].updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/sprints" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/sprints

스프린트를 만든다 — 이름을 비우면 서버가 자동으로 붙인다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 요청 본문

`application/json` — `SprintCreateRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  | 스프린트 이름. 비우면 프로젝트 안에서 `Sprint N`으로 자동 명명한다 | `Sprint 3` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `SprintResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `SprintResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/sprints" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 3"
  }'
```

## GET /api/alm/sprints/{sprintId}

스프린트 하나를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sprintId` | path | `integer(int64)` | 예 | 스프린트 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SprintResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SprintResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/sprints/<sprintId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/sprints/{sprintId}

스프린트 계획을 수정한다 — expectedVersion이 어긋나면 409

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sprintId` | path | `integer(int64)` | 예 | 스프린트 ID |

### 요청 본문

`application/json` — `SprintUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 | 스프린트 이름 | `Sprint 3` |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일. 시작일보다 앞설 수 없다 | `2026-09-20` |
| `expectedVersion` | `integer(int32)` | 예 | 수정 직전에 읽은 스프린트 버전. 서버 값과 다르면 409 | `1` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SprintResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SprintResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/sprints/<sprintId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 3",
    "expectedVersion": 1
  }'
```

## POST /api/alm/sprints/{sprintId}/complete

스프린트를 완료하고 미완료 이슈를 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sprintId` | path | `integer(int64)` | 예 | 스프린트 ID |

### 요청 본문

`application/json` — `SprintCompleteRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `doneStatuses` | `string[]` |  |  |  |
| `moveUnfinishedToSprintId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SprintResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 진행 중인 스프린트만 완료할 수 있습니다 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SprintResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/sprints/<sprintId>/complete" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "doneStatuses": [
      "string"
    ],
    "moveUnfinishedToSprintId": 0
  }'
```

## POST /api/alm/sprints/{sprintId}/start

스프린트를 시작한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `sprintId` | path | `integer(int64)` | 예 | 스프린트 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SprintResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 계획 상태의 스프린트만 시작할 수 있습니다 / 이미 진행 중인 스프린트가 있습니다 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SprintResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 스프린트 ID | `12` |
| `projectId` | `integer(int64)` |  | 스프린트가 속한 프로젝트 ID | `7` |
| `name` | `string` |  | 스프린트 이름 | `Sprint 3` |
| `state` | `string enum(PLANNED, ACTIVE, DONE)` |  | 스프린트 상태 |  |
| `goal` | `string` |  | 스프린트 목표 | `결제 흐름 안정화` |
| `plannedStart` | `string(date)` |  | 예정 시작일 | `2026-09-07` |
| `plannedEnd` | `string(date)` |  | 예정 종료일 | `2026-09-20` |
| `startedAt` | `string(date-time)` |  | 실제 시작 시각. 시작 전이면 null |  |
| `completedAt` | `string(date-time)` |  | 완료 시각. 완료 전이면 null |  |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `1` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/sprints/<sprintId>/start" \
  -H "Authorization: Bearer chanho_pat_…"
```
