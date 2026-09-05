> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Archive

페이지 보관과 보관 해제.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/wiki/pages/{id}/archive` | [페이지를 보관 처리한다 — 트리에서 빠지고 내용은 남는다](#post-apiwikipagesidarchive) |
| `POST` | `/api/wiki/pages/{id}/unarchive` | [보관한 페이지를 원래 자리로 되돌린다](#post-apiwikipagesidunarchive) |
| `GET` | `/api/wiki/spaces/{spaceId}/archive` | [스페이스에서 보관한 페이지를 조회한다](#get-apiwikispacesspaceidarchive) |

## POST /api/wiki/pages/{id}/archive

페이지를 보관 처리한다 — 트리에서 빠지고 내용은 남는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

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
curl -X POST "https://<your-host>/api/wiki/pages/<id>/archive" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{id}/unarchive

보관한 페이지를 원래 자리로 되돌린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

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
curl -X POST "https://<your-host>/api/wiki/pages/<id>/unarchive" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/archive

스페이스에서 보관한 페이지를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TrashItem[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TrashItem[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].deletedAt` | `string(date-time)` |  |  |  |
| `[].deletedBy` | `integer(int64)` |  |  |  |
| `[].descendantCount` | `integer(int32)` |  |  |  |
| `[].icon` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].title` | `string` |  |  |  |
| `[].type` | `string enum(page, folder, blog)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/archive" \
  -H "Authorization: Bearer chanho_pat_…"
```
