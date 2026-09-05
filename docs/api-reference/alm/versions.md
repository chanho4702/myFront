> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Versions

릴리스 버전 관리와 배포 표시

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/projects/{projectId}/versions` | [프로젝트의 버전을 조회한다](#get-apialmprojectsprojectidversions) |
| `POST` | `/api/alm/projects/{projectId}/versions` | [버전을 만든다](#post-apialmprojectsprojectidversions) |
| `PUT` | `/api/alm/versions/{versionId}` | [버전을 수정한다 — expectedVersion이 어긋나면 409](#put-apialmversionsversionid) |
| `DELETE` | `/api/alm/versions/{versionId}` | [버전을 삭제한다](#delete-apialmversionsversionid) |
| `POST` | `/api/alm/versions/{versionId}/archive` | [버전을 보관한다](#post-apialmversionsversionidarchive) |
| `POST` | `/api/alm/versions/{versionId}/release` | [버전을 릴리스로 표시하고 미완료 이슈를 옮긴다](#post-apialmversionsversionidrelease) |

## GET /api/alm/projects/{projectId}/versions

프로젝트의 버전을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `VersionResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `VersionResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].projectId` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].description` | `string` |  |  |  |
| `[].startDate` | `string(date)` |  |  |  |
| `[].releaseDate` | `string(date)` |  |  |  |
| `[].status` | `string enum(UNRELEASED, RELEASED, ARCHIVED)` |  |  |  |
| `[].releasedAt` | `string(date-time)` |  |  |  |
| `[].version` | `integer(int32)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/versions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/versions

버전을 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `VersionCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `VersionResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `VersionResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |
| `status` | `string enum(UNRELEASED, RELEASED, ARCHIVED)` |  |  |  |
| `releasedAt` | `string(date-time)` |  |  |  |
| `version` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/versions" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string"
  }'
```

## PUT /api/alm/versions/{versionId}

버전을 수정한다 — expectedVersion이 어긋나면 409

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `versionId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `VersionUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |
| `expectedVersion` | `integer(int32)` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `VersionResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `VersionResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |
| `status` | `string enum(UNRELEASED, RELEASED, ARCHIVED)` |  |  |  |
| `releasedAt` | `string(date-time)` |  |  |  |
| `version` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/versions/<versionId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "expectedVersion": 0
  }'
```

## DELETE /api/alm/versions/{versionId}

버전을 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `versionId` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/alm/versions/<versionId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/versions/{versionId}/archive

버전을 보관한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `versionId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `VersionResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `VersionResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |
| `status` | `string enum(UNRELEASED, RELEASED, ARCHIVED)` |  |  |  |
| `releasedAt` | `string(date-time)` |  |  |  |
| `version` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/versions/<versionId>/archive" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/versions/{versionId}/release

버전을 릴리스로 표시하고 미완료 이슈를 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `versionId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `VersionReleaseRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `doneStatuses` | `string[]` |  |  |  |
| `moveUnresolvedToVersionId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `VersionResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `VersionResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `description` | `string` |  |  |  |
| `startDate` | `string(date)` |  |  |  |
| `releaseDate` | `string(date)` |  |  |  |
| `status` | `string enum(UNRELEASED, RELEASED, ARCHIVED)` |  |  |  |
| `releasedAt` | `string(date-time)` |  |  |  |
| `version` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/versions/<versionId>/release" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "doneStatuses": [
      "string"
    ],
    "moveUnresolvedToVersionId": 0
  }'
```
