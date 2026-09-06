> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issue AQL

AQL로 이슈를 검색한다

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/alm/issues/query` | [AQL로 이슈를 검색한다](#post-apialmissuesquery) |
| `GET` | `/api/alm/issues/query/fields` | [AQL 자동완성 사전을 읽는다](#get-apialmissuesqueryfields) |
| `POST` | `/api/alm/issues/query/validate` | [AQL 문법을 검사한다](#post-apialmissuesqueryvalidate) |

## POST /api/alm/issues/query

AQL로 이슈를 검색한다

빈 문자열은 전체 + 기본 정렬(updated DESC). 보관된 이슈는 `archived = true`를 쓸 때만 나온다.

### 요청 본문

`application/json` — `QueryRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `aql` | `string` |  | AQL 문자열. 비우면 전체 + 기본 정렬(updated DESC) | `project = ALM AND status != 완료 ORDER BY due ASC` |
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 | `0` |
| `size` | `integer(int32)` |  | 한 페이지 항목 수(최대 200) | `50` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `QueryResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `QueryResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `IssueResponse[]` |  | 이슈 목록 |  |
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
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 |  |
| `size` | `integer(int32)` |  | 한 페이지 항목 수 |  |
| `total` | `integer(int64)` |  | 조건을 적용한 전체 건수 |  |
| `echoedAql` | `string` |  | 서버가 실제로 실행한 AQL — 저장 필터·URL 공유의 기준 | `project = ALM AND status != 완료 ORDER BY due ASC` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/query" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "aql": "project = ALM AND status != 완료 ORDER BY due ASC",
    "page": 0,
    "size": 50
  }'
```

## GET /api/alm/issues/query/fields

AQL 자동완성 사전을 읽는다

필드·별칭·연산자와 값 후보(상태·타입·우선순위·프로젝트). 사람은 /api/org/members로 따로 받는다.

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `FieldsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `FieldsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `fields` | `FieldInfo[]` |  | 필드 표 |  |
| `fields[].name` | `string` |  | 정식 필드명 | `status` |
| `fields[].aliases` | `string[]` |  | 한국어 별칭 | `["상태"]` |
| `fields[].kind` | `string` |  | 값의 성격 | `ENUM` |
| `fields[].operators` | `string[]` |  | 쓸 수 있는 연산자 |  |
| `fields[].sortable` | `boolean` |  | ORDER BY에 쓸 수 있는가 |  |
| `fields[].emptyAllowed` | `boolean` |  | IS EMPTY가 의미 있는가 |  |
| `fields[].values` | `Candidate[]` |  | 값 후보. 사람은 /api/org/members로 따로 받는다 |  |
| `fields[].values[].id` | `string` |  | 질의에 써도 되는 id | `inprogress` |
| `fields[].values[].name` | `string` |  | 사람이 읽는 이름 | `진행 중` |
| `functions` | `FunctionInfo[]` |  | 함수 목록 |  |
| `functions[].name` | `string` |  | 함수 이름 | `currentUser` |
| `functions[].signature` | `string` |  | 쓰는 모양 | `currentUser()` |
| `functions[].fields` | `string[]` |  | 이 함수를 받는 필드 | `["assignee","reporter"]` |
| `functions[].description` | `string` |  | 설명 |  |
| `keywords` | `string[]` |  | 예약어 |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/query/fields" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/query/validate

AQL 문법을 검사한다

문법·필드·연산자만 본다. 상태·사용자 이름이 실제로 있는지는 실행할 때 확인한다.

### 요청 본문

`application/json` — `ValidateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `aql` | `string` |  | 검사할 AQL 문자열 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ValidateResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ValidateResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `ok` | `boolean` |  | 문법·필드·연산자가 모두 맞는가 |  |
| `error` | `string` |  | 틀렸을 때의 한국어 설명 |  |
| `position` | `integer(int32)` |  | 틀린 자리(0부터 세는 오프셋) |  |
| `expected` | `string[]` |  | 그 자리에 올 수 있었던 것 |  |
| `fields` | `string[]` |  | 질의가 쓴 필드의 정식명 |  |
| `ast` | `map<string, any>` |  | 파싱된 AST — 프론트 파서와 shape을 대조할 때 쓴다 |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/query/validate" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "aql": "string"
  }'
```
