> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Revisions

페이지 버전 이력 조회와 복원.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/{pageId}/revisions` | [페이지의 버전 목록을 조회한다](#get-apiwikipagespageidrevisions) |
| `GET` | `/api/wiki/pages/{pageId}/revisions/{version}` | [특정 버전의 본문을 조회한다](#get-apiwikipagespageidrevisionsversion) |
| `POST` | `/api/wiki/pages/{pageId}/revisions/{version}/restore` | [과거 버전 내용으로 되돌린다 — 되돌린 것도 새 버전으로 쌓인다](#post-apiwikipagespageidrevisionsversionrestore) |

## GET /api/wiki/pages/{pageId}/revisions

페이지의 버전 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `RevisionMeta[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `RevisionMeta[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].changeNote` | `string` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].editedBy` | `integer(int64)` |  |  |  |
| `[].editedByName` | `string` |  |  |  |
| `[].version` | `integer(int32)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/revisions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/revisions/{version}

특정 버전의 본문을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |
| `version` | path | `integer(int32)` | 예 | 조회할 버전 번호(1부터) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `RevisionResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `RevisionResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` |  |  |  |
| `editedBy` | `integer(int64)` |  |  |  |
| `editedByName` | `string` |  |  |  |
| `title` | `string` |  |  |  |
| `version` | `integer(int32)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/revisions/<version>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{pageId}/revisions/{version}/restore

과거 버전 내용으로 되돌린다 — 되돌린 것도 새 버전으로 쌓인다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |
| `version` | path | `integer(int32)` | 예 | 되돌릴 버전 번호 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `archivedAt` | `string(date-time)` |  | 보관한 시각. null이면 살아 있는 문서 |  |
| `content` | `string` |  | 마크다운 본문 | `# 배포 절차` |
| `icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `id` | `integer(int64)` |  | 페이지 ID | `42` |
| `importedAuthorName` | `string` |  | 이관 원본의 작성자 이름. 우리 계정과 짝지어지지 않은 문서에만 값이 있다 | `hong.gildong` |
| `importedSourceUrl` | `string` |  | 이관 원본 문서 주소 | `https://confluence.example.com/x/AB` |
| `ownerId` | `integer(int64)` |  | 문서 소유자. 정하지 않았으면 null(작성자로 대신하지 않는다) | `7` |
| `parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `spaceId` | `integer(int64)` |  | 속한 스페이스 ID | `1` |
| `status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `title` | `string` |  | 페이지 제목 | `배포 절차` |
| `type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `verifiedAt` | `string(date-time)` |  | 검증한 시각 |  |
| `verifiedBy` | `integer(int64)` |  | 검증한 사용자 ID | `7` |
| `verifiedUntil` | `string(date-time)` |  | 검증 유효 기한. 만료 판정은 화면이 한다 |  |
| `version` | `integer(int32)` |  | 현재 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `views` | `integer(int64)` |  | 누적 조회수 | `128` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/revisions/<version>/restore" \
  -H "Authorization: Bearer chanho_pat_…"
```
