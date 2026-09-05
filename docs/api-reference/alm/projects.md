> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Projects

프로젝트 생성·수정·보관·휴지통

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/projects` | [접근 가능한 프로젝트를 조회한다](#get-apialmprojects) |
| `POST` | `/api/alm/projects` | [프로젝트를 만든다 — 키는 만든 뒤 바꿀 수 없다](#post-apialmprojects) |
| `GET` | `/api/alm/projects/trash` | [휴지통의 프로젝트를 조회한다](#get-apialmprojectstrash) |
| `GET` | `/api/alm/projects/{projectId}` | [프로젝트 하나를 조회한다](#get-apialmprojectsprojectid) |
| `PUT` | `/api/alm/projects/{projectId}` | [프로젝트를 수정한다 — expectedVersion이 어긋나면 409](#put-apialmprojectsprojectid) |
| `DELETE` | `/api/alm/projects/{projectId}` | [프로젝트를 휴지통으로 옮긴다](#delete-apialmprojectsprojectid) |
| `POST` | `/api/alm/projects/{projectId}/archive` | [프로젝트를 보관한다](#post-apialmprojectsprojectidarchive) |
| `DELETE` | `/api/alm/projects/{projectId}/permanent` | [휴지통의 프로젝트를 영구 삭제한다](#delete-apialmprojectsprojectidpermanent) |
| `POST` | `/api/alm/projects/{projectId}/restore` | [휴지통의 프로젝트를 되돌린다](#post-apialmprojectsprojectidrestore) |
| `POST` | `/api/alm/projects/{projectId}/unarchive` | [프로젝트 보관을 해제한다](#post-apialmprojectsprojectidunarchive) |

## GET /api/alm/projects

접근 가능한 프로젝트를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `[].key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `[].name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `[].description` | `string` |  | 프로젝트 설명 |  |
| `[].category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `[].leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `[].defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `[].icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `[].color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `[].url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `[].version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `[].createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `[].updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `[].archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `[].deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `[].purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects

프로젝트를 만든다 — 키는 만든 뒤 바꿀 수 없다

### 요청 본문

`application/json` — `ProjectCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `key` | `string` | 예 | 프로젝트 키. 이슈 키의 앞머리가 되며 만든 뒤 바꿀 수 없다 | `ALM` |
| `name` | `string` | 예 | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 | `이슈·스프린트를 관리하는 내부 프로젝트` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `ProjectResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ALM",
    "name": "ALM 플랫폼"
  }'
```

## GET /api/alm/projects/trash

휴지통의 프로젝트를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `[].key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `[].name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `[].description` | `string` |  | 프로젝트 설명 |  |
| `[].category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `[].leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `[].defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `[].icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `[].color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `[].url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `[].version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `[].createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `[].updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `[].archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `[].deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `[].purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/trash" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/projects/{projectId}

프로젝트 하나를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/projects/{projectId}

프로젝트를 수정한다 — expectedVersion이 어긋나면 409

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `ProjectUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `clearLead` | `boolean` |  | true면 책임자를 비운다. leadId를 null로 보내는 것만으로는 비워지지 않는다 | `false` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `expectedVersion` | `integer(int32)` | 예 | 수정 직전에 읽은 프로젝트 버전. 서버 값과 다르면 409 | `2` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/projects/<projectId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ALM 플랫폼",
    "expectedVersion": 2
  }'
```

## DELETE /api/alm/projects/{projectId}

프로젝트를 휴지통으로 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/projects/<projectId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/archive

프로젝트를 보관한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/archive" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/alm/projects/{projectId}/permanent

휴지통의 프로젝트를 영구 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/projects/<projectId>/permanent" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/restore

휴지통의 프로젝트를 되돌린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/restore" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/unarchive

프로젝트 보관을 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ProjectResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ProjectResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 프로젝트 ID | `7` |
| `key` | `string` |  | 프로젝트 키. 만든 뒤 바뀌지 않는다 | `ALM` |
| `name` | `string` |  | 프로젝트 이름 | `ALM 플랫폼` |
| `description` | `string` |  | 프로젝트 설명 |  |
| `category` | `string` |  | 프로젝트 범주 | `플랫폼` |
| `leadId` | `integer(int64)` |  | 프로젝트 책임자 사용자 ID | `7` |
| `defaultAssignee` | `string` |  | 새 이슈의 기본 담당자 규칙 | `PROJECT_LEAD` |
| `icon` | `string` |  | 프로젝트 아이콘 이름 | `rocket` |
| `color` | `string` |  | 프로젝트 색 이름 | `blue` |
| `url` | `string` |  | 관련 문서·사이트 URL | `https://example.com/alm` |
| `version` | `integer(int32)` |  | 낙관적 락 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `2` |
| `createdAt` | `string(date-time)` |  | 생성 시각 | `2026-08-01T09:00:00Z` |
| `updatedAt` | `string(date-time)` |  | 마지막 수정 시각 | `2026-09-04T15:20:00Z` |
| `archivedAt` | `string(date-time)` |  | 보관 시각. 보관 상태가 아니면 null |  |
| `deletedAt` | `string(date-time)` |  | 휴지통에 들어간 시각. 휴지통이 아니면 null |  |
| `purgeAt` | `string(date-time)` |  | 영구 삭제 예정 시각(보존 기간이 끝나는 때). 휴지통이 아니면 null |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/unarchive" \
  -H "Authorization: Bearer chanho_pat_…"
```
