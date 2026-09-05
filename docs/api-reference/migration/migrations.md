> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Migrations

컨플루언스 설치형(Server/DC) 원본을 위키로 옮기는 이관 작업의 생성·실행·보고.
연결 확인과 작업 목록은 전역 관리자만, 나머지는 대상 스페이스 ADMIN만 부를 수 있다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/migration` | [이관 작업 목록을 최신순으로 조회한다](#get-apimigration) |
| `POST` | `/api/migration` | [이관 작업을 만든다](#post-apimigration) |
| `POST` | `/api/migration/confluence-dc/probe` | [컨플루언스 설치형 원본에 연결되는지 확인한다 — 토큰은 응답에 실리지 않는다](#post-apimigrationconfluence-dcprobe) |
| `GET` | `/api/migration/{jobId}` | [이관 작업의 진행 상황을 조회한다](#get-apimigrationjobid) |
| `POST` | `/api/migration/{jobId}/cancel` | [진행 중인 이관 작업을 취소한다](#post-apimigrationjobidcancel) |
| `POST` | `/api/migration/{jobId}/discover` | [원본 트리를 훑어 대기열을 채운다 — 다시 눌러도 새 항목만 늘어난다](#post-apimigrationjobiddiscover) |
| `GET` | `/api/migration/{jobId}/items` | [이관 항목을 상태·단계로 걸러 페이지 단위로 조회한다](#get-apimigrationjobiditems) |
| `POST` | `/api/migration/{jobId}/items` | [이관할 원본 문서를 대기열에 넣는다](#post-apimigrationjobiditems) |
| `POST` | `/api/migration/{jobId}/link-fixup` | [끝난 작업의 링크 정리를 다시 돌린다 — 다시 눌러도 안전하다](#post-apimigrationjobidlink-fixup) |
| `GET` | `/api/migration/{jobId}/report` | [이관 결과 보고서를 조회한다](#get-apimigrationjobidreport) |
| `POST` | `/api/migration/{jobId}/start` | [이관 작업을 시작한다](#post-apimigrationjobidstart) |

## GET /api/migration

이관 작업 목록을 최신순으로 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationJobSummary[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationJobSummary[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].discoveredCount` | `integer(int32)` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `[].provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `[].sourceSpaceKey` | `string` |  |  |  |
| `[].status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `[].targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/migration" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/migration

이관 작업을 만든다

### 요청 본문

`application/json` — `MigrationJobCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `mode` | `string enum(DRY_RUN, IMPORT)` | 예 |  |  |
| `provider` | `string enum(NOTION, CONFLUENCE_DC)` | 예 |  |  |
| `source` | `MigrationSourceRequest` |  |  |  |
| `source.baseUrl` | `string` | 예 |  |  |
| `source.spaceKey` | `string` | 예 |  |  |
| `source.token` | `string` | 예 |  |  |
| `sourceInstanceId` | `string` |  |  |  |
| `targetSpaceId` | `integer(int64)` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `MigrationJobResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `MigrationJobResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `completedAt` | `string(date-time)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `itemCount` | `integer(int64)` |  |  |  |
| `mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `sourceInstanceId` | `string` |  |  |  |
| `startedAt` | `string(date-time)` |  |  |  |
| `status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "DRY_RUN",
    "provider": "NOTION",
    "targetSpaceId": 0
  }'
```

## POST /api/migration/confluence-dc/probe

컨플루언스 설치형 원본에 연결되는지 확인한다 — 토큰은 응답에 실리지 않는다

### 요청 본문

`application/json` — `ConfluenceDcProbeRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `baseUrl` | `string` | 예 |  |  |
| `spaceKey` | `string` | 예 |  |  |
| `token` | `string` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ConfluenceDcProbeResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ConfluenceDcProbeResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `homepageId` | `string` |  |  |  |
| `pageCount` | `integer(int32)` |  |  |  |
| `spaceName` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/confluence-dc/probe" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "string",
    "spaceKey": "string",
    "token": "string"
  }'
```

## GET /api/migration/{jobId}

이관 작업의 진행 상황을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationJobDetailResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationJobDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `completedAt` | `string(date-time)` |  |  |  |
| `counts` | `MigrationJobCounts` |  |  |  |
| `counts.byStage` | `map<string, integer(int64)>` |  |  |  |
| `counts.byStatus` | `map<string, integer(int64)>` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `itemCount` | `integer(int64)` |  |  |  |
| `jobIssues` | `MigrationJobIssueResponse[]` |  |  |  |
| `jobIssues[].code` | `string` |  | 손실 코드 | `LINK_FIXUP_FAILED` |
| `jobIssues[].occurrences` | `integer(int32)` |  | 같은 실패가 반복된 횟수 | `1` |
| `jobIssues[].severity` | `string enum(INFO, WARNING, ERROR)` |  | 심각도 | `ERROR` |
| `jobIssues[].sourcePath` | `string` |  | 어디서 났는가 | `page:1042` |
| `mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `source` | `MigrationSourceSummary` |  |  |  |
| `source.baseUrl` | `string` |  |  |  |
| `source.discoveredCount` | `integer(int32)` |  |  |  |
| `source.spaceKey` | `string` |  |  |  |
| `source.spaceName` | `string` |  |  |  |
| `sourceInstanceId` | `string` |  |  |  |
| `startedAt` | `string(date-time)` |  |  |  |
| `status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/migration/<jobId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/migration/{jobId}/cancel

진행 중인 이관 작업을 취소한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationJobResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationJobResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `completedAt` | `string(date-time)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `itemCount` | `integer(int64)` |  |  |  |
| `mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `sourceInstanceId` | `string` |  |  |  |
| `startedAt` | `string(date-time)` |  |  |  |
| `status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/<jobId>/cancel" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/migration/{jobId}/discover

원본 트리를 훑어 대기열을 채운다 — 다시 눌러도 새 항목만 늘어난다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationDiscoverResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationDiscoverResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `discovered` | `integer(int32)` |  |  |  |
| `enqueued` | `integer(int32)` |  |  |  |
| `skipped` | `integer(int32)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/<jobId>/discover" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/migration/{jobId}/items

이관 항목을 상태·단계로 걸러 페이지 단위로 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |
| `status` | query | `string enum(PENDING, RUNNING, RETRY_WAIT, COMPLETED, DEAD_LETTER)` |  | 항목 상태 필터. 비우면 전부 |
| `stage` | query | `string enum(EXTRACT, NORMALIZE, MEDIA_COPY, RESOLVE, VERIFY, DONE)` |  | 이관 단계 필터. 비우면 전부 |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationItemPageResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationItemPageResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `MigrationItemResponse[]` |  |  |  |
| `items[].externalObjectId` | `string` |  |  |  |
| `items[].id` | `integer(int64)` |  |  |  |
| `items[].jobId` | `integer(int64)` |  |  |  |
| `items[].lastErrorCode` | `string` |  |  |  |
| `items[].nextAttemptAt` | `string(date-time)` |  |  |  |
| `items[].retryCount` | `integer(int32)` |  |  |  |
| `items[].sourceVersion` | `string` |  |  |  |
| `items[].stage` | `string enum(EXTRACT, NORMALIZE, MEDIA_COPY, RESOLVE, VERIFY, DONE)` |  |  |  |
| `items[].status` | `string enum(PENDING, RUNNING, RETRY_WAIT, COMPLETED, DEAD_LETTER)` |  |  |  |
| `items[].targetPageId` | `integer(int64)` |  |  |  |
| `page` | `integer(int32)` |  |  |  |
| `size` | `integer(int32)` |  |  |  |
| `total` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/migration/<jobId>/items" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/migration/{jobId}/items

이관할 원본 문서를 대기열에 넣는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `MigrationItemEnqueueRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `externalObjectId` | `string` | 예 |  |  |
| `payloadRef` | `string` | 예 |  |  |
| `siblingOrder` | `integer(int32)` |  |  |  |
| `sourceChecksum` | `string` | 예 |  |  |
| `sourceVersion` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `MigrationItemResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `MigrationItemResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `externalObjectId` | `string` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `jobId` | `integer(int64)` |  |  |  |
| `lastErrorCode` | `string` |  |  |  |
| `nextAttemptAt` | `string(date-time)` |  |  |  |
| `retryCount` | `integer(int32)` |  |  |  |
| `sourceVersion` | `string` |  |  |  |
| `stage` | `string enum(EXTRACT, NORMALIZE, MEDIA_COPY, RESOLVE, VERIFY, DONE)` |  |  |  |
| `status` | `string enum(PENDING, RUNNING, RETRY_WAIT, COMPLETED, DEAD_LETTER)` |  |  |  |
| `targetPageId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/<jobId>/items" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "externalObjectId": "string",
    "payloadRef": "string",
    "sourceChecksum": "string"
  }'
```

## POST /api/migration/{jobId}/link-fixup

끝난 작업의 링크 정리를 다시 돌린다 — 다시 눌러도 안전하다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationLinkFixupResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationLinkFixupResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `failed` | `integer(int32)` |  | 이번에도 정리하지 못한 문서 수 | `0` |
| `jobId` | `integer(int64)` |  | 잡 id | `12` |
| `touched` | `integer(int32)` |  | 본문이 실제로 바뀐 문서 수 | `3` |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/<jobId>/link-fixup" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/migration/{jobId}/report

이관 결과 보고서를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationReportResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationReportResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `deadLetters` | `MigrationDeadLetterResponse[]` |  |  |  |
| `deadLetters[].deadLetteredAt` | `string(date-time)` |  |  |  |
| `deadLetters[].externalObjectId` | `string` |  |  |  |
| `deadLetters[].itemId` | `integer(int64)` |  |  |  |
| `deadLetters[].lastErrorCode` | `string` |  |  |  |
| `deadLetters[].retryCount` | `integer(int32)` |  |  |  |
| `deadLetters[].stage` | `string enum(EXTRACT, NORMALIZE, MEDIA_COPY, RESOLVE, VERIFY, DONE)` |  |  |  |
| `issues` | `MigrationIssueSummary[]` |  |  |  |
| `issues[].code` | `string` |  |  |  |
| `issues[].distinctPaths` | `integer(int64)` |  |  |  |
| `issues[].occurrences` | `integer(int64)` |  |  |  |
| `issues[].sampleSourcePath` | `string` |  |  |  |
| `issues[].severity` | `string enum(INFO, WARNING, ERROR)` |  |  |  |
| `itemsByStage` | `map<string, integer(int64)>` |  |  |  |
| `itemsByStatus` | `map<string, integer(int64)>` |  |  |  |
| `job` | `MigrationJobResponse` |  |  |  |
| `job.completedAt` | `string(date-time)` |  |  |  |
| `job.createdAt` | `string(date-time)` |  |  |  |
| `job.id` | `integer(int64)` |  |  |  |
| `job.itemCount` | `integer(int64)` |  |  |  |
| `job.mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `job.provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `job.sourceInstanceId` | `string` |  |  |  |
| `job.startedAt` | `string(date-time)` |  |  |  |
| `job.status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `job.targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/migration/<jobId>/report" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/migration/{jobId}/start

이관 작업을 시작한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `jobId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MigrationJobResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `MigrationJobResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `completedAt` | `string(date-time)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `id` | `integer(int64)` |  |  |  |
| `itemCount` | `integer(int64)` |  |  |  |
| `mode` | `string enum(DRY_RUN, IMPORT)` |  |  |  |
| `provider` | `string enum(NOTION, CONFLUENCE_DC)` |  |  |  |
| `sourceInstanceId` | `string` |  |  |  |
| `startedAt` | `string(date-time)` |  |  |  |
| `status` | `string enum(PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)` |  |  |  |
| `targetSpaceId` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/migration/<jobId>/start" \
  -H "Authorization: Bearer chanho_pat_…"
```
