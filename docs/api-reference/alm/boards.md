> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Boards

보드 정의와 보드에 걸리는 이슈 목록

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/boards/{boardId}` | [보드 하나를 조회한다](#get-apialmboardsboardid) |
| `PUT` | `/api/alm/boards/{boardId}` | [보드의 이름·필터·컬럼 구성을 수정한다](#put-apialmboardsboardid) |
| `DELETE` | `/api/alm/boards/{boardId}` | [보드를 삭제한다](#delete-apialmboardsboardid) |
| `GET` | `/api/alm/boards/{boardId}/issues` | [보드 필터에 걸리는 이슈를 조회한다](#get-apialmboardsboardidissues) |
| `GET` | `/api/alm/projects/{projectId}/boards` | [프로젝트의 보드 목록을 조회한다](#get-apialmprojectsprojectidboards) |
| `POST` | `/api/alm/projects/{projectId}/boards` | [프로젝트에 보드를 만든다](#post-apialmprojectsprojectidboards) |

## GET /api/alm/boards/{boardId}

보드 하나를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `boardId` | path | `integer(int64)` | 예 | 보드 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `BoardResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `BoardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `type` | `string` |  |  |  |
| `filter` | `Filter` |  |  |  |
| `filter.assigneeIds` | `string[]` |  |  |  |
| `filter.types` | `string[]` |  |  |  |
| `filter.labels` | `string[]` |  |  |  |
| `columns` | `Column[]` |  |  |  |
| `columns[].status` | `string` |  |  |  |
| `columns[].name` | `string` |  |  |  |
| `columns[].wipLimit` | `integer(int32)` |  |  |  |
| `swimlane` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/boards/<boardId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/boards/{boardId}

보드의 이름·필터·컬럼 구성을 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `boardId` | path | `integer(int64)` | 예 | 보드 ID |

### 요청 본문

`application/json` — `BoardRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `type` | `string` |  |  |  |
| `filter` | `Filter` |  |  |  |
| `filter.assigneeIds` | `string[]` |  |  |  |
| `filter.types` | `string[]` |  |  |  |
| `filter.labels` | `string[]` |  |  |  |
| `columns` | `Column[]` |  |  |  |
| `columns[].status` | `string` |  |  |  |
| `columns[].name` | `string` |  |  |  |
| `columns[].wipLimit` | `integer(int32)` |  |  |  |
| `swimlane` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `BoardResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `BoardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `type` | `string` |  |  |  |
| `filter` | `Filter` |  |  |  |
| `filter.assigneeIds` | `string[]` |  |  |  |
| `filter.types` | `string[]` |  |  |  |
| `filter.labels` | `string[]` |  |  |  |
| `columns` | `Column[]` |  |  |  |
| `columns[].status` | `string` |  |  |  |
| `columns[].name` | `string` |  |  |  |
| `columns[].wipLimit` | `integer(int32)` |  |  |  |
| `swimlane` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/boards/<boardId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "type": "string",
    "filter": {
      "assigneeIds": [
        "string"
      ],
      "types": [
        "string"
      ],
      "labels": [
        "string"
      ]
    },
    "columns": [
      {
        "status": "string",
        "name": "string",
        "wipLimit": 0
      }
    ],
    "swimlane": "string",
    "isDefault": false
  }'
```

## DELETE /api/alm/boards/{boardId}

보드를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `boardId` | path | `integer(int64)` | 예 | 보드 ID |

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
curl -X DELETE "https://<your-host>/api/alm/boards/<boardId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/boards/{boardId}/issues

보드 필터에 걸리는 이슈를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `boardId` | path | `integer(int64)` | 예 | 보드 ID |

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
curl -X GET "https://<your-host>/api/alm/boards/<boardId>/issues" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/projects/{projectId}/boards

프로젝트의 보드 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `BoardResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `BoardResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].projectId` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].type` | `string` |  |  |  |
| `[].filter` | `Filter` |  |  |  |
| `[].filter.assigneeIds` | `string[]` |  |  |  |
| `[].filter.types` | `string[]` |  |  |  |
| `[].filter.labels` | `string[]` |  |  |  |
| `[].columns` | `Column[]` |  |  |  |
| `[].columns[].status` | `string` |  |  |  |
| `[].columns[].name` | `string` |  |  |  |
| `[].columns[].wipLimit` | `integer(int32)` |  |  |  |
| `[].swimlane` | `string` |  |  |  |
| `[].isDefault` | `boolean` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/boards" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/boards

프로젝트에 보드를 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 | 프로젝트 ID |

### 요청 본문

`application/json` — `BoardRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `type` | `string` |  |  |  |
| `filter` | `Filter` |  |  |  |
| `filter.assigneeIds` | `string[]` |  |  |  |
| `filter.types` | `string[]` |  |  |  |
| `filter.labels` | `string[]` |  |  |  |
| `columns` | `Column[]` |  |  |  |
| `columns[].status` | `string` |  |  |  |
| `columns[].name` | `string` |  |  |  |
| `columns[].wipLimit` | `integer(int32)` |  |  |  |
| `swimlane` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `BoardResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `BoardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `type` | `string` |  |  |  |
| `filter` | `Filter` |  |  |  |
| `filter.assigneeIds` | `string[]` |  |  |  |
| `filter.types` | `string[]` |  |  |  |
| `filter.labels` | `string[]` |  |  |  |
| `columns` | `Column[]` |  |  |  |
| `columns[].status` | `string` |  |  |  |
| `columns[].name` | `string` |  |  |  |
| `columns[].wipLimit` | `integer(int32)` |  |  |  |
| `swimlane` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/boards" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "type": "string",
    "filter": {
      "assigneeIds": [
        "string"
      ],
      "types": [
        "string"
      ],
      "labels": [
        "string"
      ]
    },
    "columns": [
      {
        "status": "string",
        "name": "string",
        "wipLimit": 0
      }
    ],
    "swimlane": "string",
    "isDefault": false
  }'
```
