> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Issue Links

이슈 사이의 연결(차단·복제 등)

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}/links` | [이슈에 걸린 연결을 조회한다](#get-apialmissuesissueidlinks) |
| `POST` | `/api/alm/issues/{issueId}/links` | [이슈를 다른 이슈와 연결한다](#post-apialmissuesissueidlinks) |
| `DELETE` | `/api/alm/links/{id}` | [이슈 연결을 끊는다](#delete-apialmlinksid) |

## GET /api/alm/issues/{issueId}/links

이슈에 걸린 연결을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `LinkView[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `LinkView[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].link` | `LinkResponse` |  |  |  |
| `[].link.id` | `integer(int64)` |  |  |  |
| `[].link.sourceId` | `integer(int64)` |  |  |  |
| `[].link.targetId` | `integer(int64)` |  |  |  |
| `[].link.type` | `string` |  |  |  |
| `[].other` | `IssueResponse` |  | 이슈 한 건 |  |
| `[].other.id` | `integer(int64)` |  | 이슈 ID | `1024` |
| `[].other.key` | `string` |  | 사람이 읽는 이슈 키. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| `[].other.projectId` | `integer(int64)` |  | 이슈가 속한 프로젝트 ID | `7` |
| `[].other.title` | `string` |  | 이슈 제목 | `로그인 후 첫 화면이 비어 있다` |
| `[].other.description` | `string` |  | 이슈 설명(마크다운) |  |
| `[].other.type` | `string` |  | 이슈 타입 ID | `bug` |
| `[].other.status` | `string` |  | 상태 ID | `in-progress` |
| `[].other.priority` | `string` |  | 우선순위 ID | `high` |
| `[].other.assigneeId` | `integer(int64)` |  | 담당자 사용자 ID. 미지정이면 null | `42` |
| `[].other.reporterId` | `integer(int64)` |  | 보고자 사용자 ID | `7` |
| `[].other.parentId` | `integer(int64)` |  | 상위 이슈 ID | `1000` |
| `[].other.sprintId` | `integer(int64)` |  | 속한 스프린트 ID. 백로그면 null | `12` |
| `[].other.dueDate` | `string(date)` |  | 마감일 | `2026-09-30` |
| `[].other.estimateHours` | `number` |  | 예상 소요 시간(시간 단위) | `3.5` |
| `[].other.resolution` | `string enum(DONE, WONT_DO, DUPLICATE, CANNOT_REPRODUCE)` |  | 완료 사유. 완료되지 않았으면 null |  |
| `[].other.fixVersionId` | `integer(int64)` |  | 수정 버전 ID | `5` |
| `[].other.labels` | `string[]` |  | 라벨 | `["regression","frontend"]` |
| `[].other.componentIds` | `integer(int64)[]` |  | 지정된 컴포넌트 ID | `[3]` |
| `[].other.order` | `integer(int64)` |  | 보드·백로그 안에서의 정렬 순서 | `3` |
| `[].other.version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `[].other.createdAt` | `string(date-time)` |  | 생성 시각 | `2026-09-01T09:00:00Z` |
| `[].other.updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `[].other.archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `[].direction` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/links" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/links

이슈를 다른 이슈와 연결한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 요청 본문

`application/json` — `LinkRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `targetId` | `integer(int64)` |  |  |  |
| `type` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `LinkResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `LinkResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `sourceId` | `integer(int64)` |  |  |  |
| `targetId` | `integer(int64)` |  |  |  |
| `type` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/links" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "targetId": 0,
    "type": "string"
  }'
```

## DELETE /api/alm/links/{id}

이슈 연결을 끊는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 이슈 연결 ID |

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
curl -X DELETE "https://<your-host>/api/alm/links/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
