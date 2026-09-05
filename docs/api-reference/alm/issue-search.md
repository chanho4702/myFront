> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issue Search

조건 검색과 이슈 키 단건 조회

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/by-key/{key}` | [이슈 키로 이슈를 조회한다](#get-apialmissuesby-keykey) |
| `GET` | `/api/alm/issues/search` | [이슈를 조건으로 검색한다](#get-apialmissuessearch) |

## GET /api/alm/issues/by-key/{key}

이슈 키로 이슈를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `key` | path | `string` | 예 | 이슈 키(예: ALM-42) |

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
curl -X GET "https://<your-host>/api/alm/issues/by-key/<key>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/issues/search

이슈를 조건으로 검색한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectIds` | query | `integer(int64)[]` |  | 검색 대상 프로젝트. 비우면 접근 가능한 프로젝트 전체 |
| `text` | query | `string` |  | 제목·설명에서 찾을 문구 |
| `statuses` | query | `string[]` |  | 상태 ID 목록 |
| `priorities` | query | `string[]` |  | 우선순위 ID 목록 |
| `types` | query | `string[]` |  | 이슈 타입 ID 목록 |
| `assignees` | query | `string[]` |  | 담당자 사용자 ID 목록. 미지정 이슈는 `unassigned` |
| `labels` | query | `string[]` |  | 라벨 목록 |
| `componentIds` | query | `integer(int64)[]` |  | 컴포넌트 ID 목록 |
| `sprintId` | query | `integer(int64)` |  | 이 스프린트의 이슈만 |
| `parentId` | query | `integer(int64)` |  | 이 이슈의 하위 이슈만 |
| `fixVersionId` | query | `integer(int64)` |  | 이 릴리스 버전으로 잡힌 이슈만 |
| `sort` | query | `string` |  | 정렬 기준 — updated(기본)·created·due·priority·key |
| `dir` | query | `string` |  | 정렬 방향 — desc(기본)·asc |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |
| `size` | query | `integer(int32)` |  | 한 페이지 항목 수 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `IssuePageResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `IssuePageResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `IssueResponse[]` |  |  |  |
| `items[].id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `items[].key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `items[].projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `items[].title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `items[].description` | `string` |  | 이슈 설명(마크다운) |  |
| `items[].type` | `string` |  | 이슈 타입 ID | `bug` |
| `items[].status` | `string` |  | 상태 ID | `in-progress` |
| `items[].priority` | `string` |  | 우선순위 ID | `high` |
| `items[].assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `items[].reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `items[].parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `items[].sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `items[].dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `items[].estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `items[].resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `items[].fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `items[].labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `items[].componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `items[].order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `items[].version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `items[].createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `items[].updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `items[].archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `page` | `integer(int32)` |  |  |  |
| `size` | `integer(int32)` |  |  |  |
| `total` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/search" \
  -H "Authorization: Bearer chanho_pat_…"
```
