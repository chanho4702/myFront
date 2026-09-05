> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issue Archive

이슈 보관과 보관함 복원

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/alm/issues/{issueId}/archive` | [이슈를 보관함으로 옮긴다](#post-apialmissuesissueidarchive) |
| `POST` | `/api/alm/issues/{issueId}/restore` | [보관된 이슈를 되돌린다](#post-apialmissuesissueidrestore) |
| `GET` | `/api/alm/projects/{projectId}/issues/archived` | [프로젝트 보관함의 이슈를 조회한다](#get-apialmprojectsprojectidissuesarchived) |

## POST /api/alm/issues/{issueId}/archive

이슈를 보관함으로 옮긴다

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
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/archive" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/restore

보관된 이슈를 되돌린다

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
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/restore" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/projects/{projectId}/issues/archived

프로젝트 보관함의 이슈를 조회한다

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
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/issues/archived" \
  -H "Authorization: Bearer chanho_pat_…"
```
