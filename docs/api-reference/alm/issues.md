> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issues

이슈 생성·수정·이동·순서 변경·가져오기

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}` | [이슈 하나를 조회한다](#get-apialmissuesissueid) |
| `PUT` | `/api/alm/issues/{issueId}` | [이슈를 수정한다 — expectedVersion이 어긋나면 409](#put-apialmissuesissueid) |
| `DELETE` | `/api/alm/issues/{issueId}` | [이슈를 삭제한다](#delete-apialmissuesissueid) |
| `POST` | `/api/alm/issues/{issueId}/move` | [이슈를 다른 보드 컬럼(상태)으로 옮긴다](#post-apialmissuesissueidmove) |
| `POST` | `/api/alm/issues/{issueId}/rank` | [백로그·스프린트 안에서 이슈 순서를 바꾼다](#post-apialmissuesissueidrank) |
| `GET` | `/api/alm/projects/{projectId}/issues` | [프로젝트의 이슈 목록을 조회한다](#get-apialmprojectsprojectidissues) |
| `POST` | `/api/alm/projects/{projectId}/issues` | [프로젝트에 이슈를 만든다](#post-apialmprojectsprojectidissues) |
| `POST` | `/api/alm/projects/{projectId}/issues/import` | [이슈를 일괄로 가져온다 — 항목별 성공·실패를 함께 돌려준다](#post-apialmprojectsprojectidissuesimport) |

## GET /api/alm/issues/{issueId}

이슈 하나를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) |  |
| `type` | `string` |  | 이슈 타입 ID | `bug` |
| `status` | `string` |  | 상태 ID | `in-progress` |
| `priority` | `string` |  | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/issues/{issueId}

이슈를 수정한다 — expectedVersion이 어긋나면 409

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `IssueUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 예 | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) | `재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.` |
| `type` | `string` | 예 | 이슈 타입 ID | `bug` |
| `status` | `string` | 예 | 상태 ID | `in-progress` |
| `priority` | `string` | 예 | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. null이면 미지정으로 바꾼다 | `42` |
| `details` | `IssueDetailsRequest` |  | 상위 이슈·스프린트·마감일·라벨 등 세부 항목. 생략하면 기존 값을 보존한다 |  |
| `details.parentId` | `integer(int64)` |  |  |  |
| `details.sprintId` | `integer(int64)` |  |  |  |
| `details.dueDate` | `string(date)` |  |  |  |
| `details.estimateHours` | `number` |  |  |  |
| `details.resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  |  |  |
| `details.fixVersionId` | `integer(int64)` |  |  |  |
| `details.labels` | `string[]` |  |  |  |
| `details.componentIds` | `integer(int64)[]` |  |  |  |
| `expectedVersion` | `integer(int32)` | 예 | 수정 직전에 읽은 이슈 버전. 서버 값과 다르면 409 | `3` |
| `mentionedUserIds` | `integer(int64)[]` |  | 설명에서 새로 멘션한 사용자 ID. 알림 대상이다 | `[7,42]` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) |  |
| `type` | `string` |  | 이슈 타입 ID | `bug` |
| `status` | `string` |  | 상태 ID | `in-progress` |
| `priority` | `string` |  | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/issues/<issueId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다",
    "type": "bug",
    "status": "in-progress",
    "priority": "high",
    "expectedVersion": 3
  }'
```

## DELETE /api/alm/issues/{issueId}

이슈를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/issues/<issueId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/move

이슈를 다른 보드 컬럼(상태)으로 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `IssueMoveRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `status` | `string` | 예 |  |  |
| `beforeId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) |  |
| `type` | `string` |  | 이슈 타입 ID | `bug` |
| `status` | `string` |  | 상태 ID | `in-progress` |
| `priority` | `string` |  | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/move" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "string"
  }'
```

## POST /api/alm/issues/{issueId}/rank

백로그·스프린트 안에서 이슈 순서를 바꾼다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `IssueRankRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `sprintId` | `integer(int64)` |  |  |  |
| `beforeId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) |  |
| `type` | `string` |  | 이슈 타입 ID | `bug` |
| `status` | `string` |  | 상태 ID | `in-progress` |
| `priority` | `string` |  | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/rank" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "sprintId": 0,
    "beforeId": 0
  }'
```

## GET /api/alm/projects/{projectId}/issues

프로젝트의 이슈 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `[].key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `[].projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `[].title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `[].description` | `string` |  | 이슈 설명(마크다운) |  |
| `[].type` | `string` |  | 이슈 타입 ID | `bug` |
| `[].status` | `string` |  | 상태 ID | `in-progress` |
| `[].priority` | `string` |  | 우선순위 ID | `high` |
| `[].assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `[].reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `[].parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `[].sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `[].dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `[].estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `[].resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `[].fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `[].labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `[].componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `[].order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `[].version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `[].createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `[].updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `[].archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/issues" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/issues

프로젝트에 이슈를 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `IssueCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 예 | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) | `재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.` |
| `type` | `string` |  | 이슈 타입 ID. 비우면 프로젝트 기본 타입 | `task` |
| `status` | `string` |  | 초기 상태 ID. 비우면 워크플로의 첫 상태 | `todo` |
| `priority` | `string` |  | 우선순위 ID. 비우면 프로젝트 기본 우선순위 | `medium` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 비우면 미지정 | `42` |
| `details` | `IssueDetailsRequest` |  | 상위 이슈·스프린트·마감일·라벨 등 세부 항목 |  |
| `details.parentId` | `integer(int64)` |  |  |  |
| `details.sprintId` | `integer(int64)` |  |  |  |
| `details.dueDate` | `string(date)` |  |  |  |
| `details.estimateHours` | `number` |  |  |  |
| `details.resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  |  |  |
| `details.fixVersionId` | `integer(int64)` |  |  |  |
| `details.labels` | `string[]` |  |  |  |
| `details.componentIds` | `integer(int64)[]` |  |  |  |
| `mentionedUserIds` | `integer(int64)[]` |  | 설명에서 멘션한 사용자 ID. 알림 대상이다 | `[7,42]` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `IssueResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `IssueResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `description` | `string` |  | 이슈 설명(마크다운) |  |
| `type` | `string` |  | 이슈 타입 ID | `bug` |
| `status` | `string` |  | 상태 ID | `in-progress` |
| `priority` | `string` |  | 우선순위 ID | `high` |
| `assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/issues" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다"
  }'
```

## POST /api/alm/projects/{projectId}/issues/import

이슈를 일괄로 가져온다 — 항목별 성공·실패를 함께 돌려준다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `IssueImportRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `Item[]` | 예 |  |  |
| `items[].key` | `string` |  |  |  |
| `items[].title` | `string` |  |  |  |
| `items[].description` | `string` |  |  |  |
| `items[].type` | `string` |  |  |  |
| `items[].status` | `string` |  |  |  |
| `items[].priority` | `string` |  |  |  |
| `items[].assigneeId` | `integer(int64)` |  |  |  |
| `items[].details` | `IssueDetailsRequest` |  |  |  |
| `items[].details.parentId` | `integer(int64)` |  |  |  |
| `items[].details.sprintId` | `integer(int64)` |  |  |  |
| `items[].details.dueDate` | `string(date)` |  |  |  |
| `items[].details.estimateHours` | `number` |  |  |  |
| `items[].details.resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  |  |  |
| `items[].details.fixVersionId` | `integer(int64)` |  |  |  |
| `items[].details.labels` | `string[]` |  |  |  |
| `items[].details.componentIds` | `integer(int64)[]` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssueImportResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssueImportResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `created` | `integer(int32)` |  |  |  |
| `failed` | `Failure[]` |  |  |  |
| `failed[].row` | `integer(int32)` |  |  |  |
| `failed[].title` | `string` |  |  |  |
| `failed[].reason` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/issues/import" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "key": "string",
        "title": "string",
        "description": "string",
        "type": "string",
        "status": "string",
        "priority": "string",
        "assigneeId": 0,
        "details": {}
      }
    ]
  }'
```
