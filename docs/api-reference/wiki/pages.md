> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Pages

페이지 생성·조회·수정·이동·복사·삭제.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/wiki/pages` | [페이지를 만든다](#post-apiwikipages) |
| `GET` | `/api/wiki/pages/{id}` | [페이지 본문과 메타데이터를 조회한다](#get-apiwikipagesid) |
| `PUT` | `/api/wiki/pages/{id}` | [페이지를 수정한다 — expectedVersion이 현재 버전과 다르면 409. 보관된 문서는 수정 불가](#put-apiwikipagesid) |
| `DELETE` | `/api/wiki/pages/{id}` | [페이지를 휴지통으로 보낸다](#delete-apiwikipagesid) |
| `PUT` | `/api/wiki/pages/{id}/collaboration-draft` | [공동 편집 초안을 정본으로 확정한다](#put-apiwikipagesidcollaboration-draft) |
| `POST` | `/api/wiki/pages/{id}/copy` | [페이지를 복사한다 — 옵션을 비우면 그 페이지 하나만](#post-apiwikipagesidcopy) |
| `PUT` | `/api/wiki/pages/{id}/icon` | [페이지 아이콘을 지정한다](#put-apiwikipagesidicon) |
| `POST` | `/api/wiki/pages/{id}/move` | [페이지를 다른 부모·순서·스페이스로 옮긴다](#post-apiwikipagesidmove) |
| `PUT` | `/api/wiki/pages/{id}/owner` | [페이지 소유자를 지정하거나 해제한다](#put-apiwikipagesidowner) |
| `POST` | `/api/wiki/pages/{id}/publish` | [초안 페이지를 게시한다](#post-apiwikipagesidpublish) |
| `POST` | `/api/wiki/pages/{id}/share` | [페이지를 다른 사용자에게 공유해 알림을 보낸다](#post-apiwikipagesidshare) |
| `PUT` | `/api/wiki/pages/{id}/verification` | [페이지를 검증 완료로 표시한다 — 기한을 비우면 90일](#put-apiwikipagesidverification) |
| `DELETE` | `/api/wiki/pages/{id}/verification` | [페이지 검증 표시를 해제한다](#delete-apiwikipagesidverification) |
| `POST` | `/api/wiki/pages/{id}/views` | [페이지 조회수를 올리고 최근 방문 기록에 남긴다](#post-apiwikipagesidviews) |

## POST /api/wiki/pages

페이지를 만든다

### 요청 본문

`application/json` — `PageCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` | 예 | 마크다운 본문 | `# 배포 절차 1. 태그를 만든다` |
| `parentId` | `integer(int64)` |  | 부모 페이지 ID. 비우면 스페이스 루트에 만든다 | `12` |
| `spaceId` | `integer(int64)` | 예 | 페이지가 속할 스페이스 ID | `1` |
| `status` | `string enum(draft, published)` |  | draft(초안) 또는 published(게시). 비우면 published | `published` |
| `title` | `string` | 예 | 페이지 제목 | `배포 절차` |
| `type` | `string enum(page, folder, blog)` |  | page(문서)·folder(폴더)·blog(블로그 글). 비우면 page | `page` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `409` | 보관된 문서 아래에는 새 문서를 만들 수 없습니다 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `PageResponse`

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
curl -X POST "https://<your-host>/api/wiki/pages" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 배포 절차\n\n1. 태그를 만든다",
    "spaceId": 1,
    "title": "배포 절차"
  }'
```

## GET /api/wiki/pages/{id}

페이지 본문과 메타데이터를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

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
curl -X GET "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{id}

페이지를 수정한다 — expectedVersion이 현재 버전과 다르면 409. 보관된 문서는 수정 불가

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `PageUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `changeNote` | `string` |  | 변경 요약. 비우면 이력에 요약 없이 남는다 | `롤백 절차 추가` |
| `content` | `string` | 예 | 마크다운 본문 전체 | `# 배포 절차 1. 태그를 만든다` |
| `expectedVersion` | `integer(int32)` | 예 | 수정 직전에 읽은 페이지 버전. 현재 버전과 다르면 409 | `3` |
| `parentId` | `integer(int64)` |  | 현재 부모 ID. 부모 변경은 이동 API를 쓴다 | `12` |
| `title` | `string` | 예 | 페이지 제목 | `배포 절차` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 버전 충돌 — expectedVersion 불일치 | `PlatformError` |
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
curl -X PUT "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 배포 절차\n\n1. 태그를 만든다",
    "expectedVersion": 3,
    "title": "배포 절차"
  }'
```

## DELETE /api/wiki/pages/{id}

페이지를 휴지통으로 보낸다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |
| `children` | query | `string` |  | 자식이 있을 때의 처리 — promote(끌어올림) 또는 cascade(함께 삭제). 미지정이면 자식이 있을 때 409 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 하위 페이지가 있습니다 — children으로 promote 또는 cascade를 지정하세요 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/pages/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{id}/collaboration-draft

공동 편집 초안을 정본으로 확정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `CollaborationDraftCommitRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `content` | `string` | 예 |  |  |
| `expectedGeneration` | `integer(int64)` | 예 |  |  |
| `expectedPageVersion` | `integer(int32)` | 예 |  |  |
| `title` | `string` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CollaborationDraftCommitResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 공동 초안이 없거나, 초안 버전이 그사이 바뀌었습니다 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CollaborationDraftCommitResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `generation` | `integer(int64)` |  |  |  |
| `page` | `PageResponse` |  | 페이지 한 건 — 본문과 메타데이터 |  |
| `page.archivedAt` | `string(date-time)` |  | 보관한 시각. null이면 살아 있는 문서 |  |
| `page.content` | `string` |  | 마크다운 본문 | `# 배포 절차` |
| `page.icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `page.id` | `integer(int64)` |  | 페이지 ID | `42` |
| `page.importedAuthorName` | `string` |  | 이관 원본의 작성자 이름. 우리 계정과 짝지어지지 않은 문서에만 값이 있다 | `hong.gildong` |
| `page.importedSourceUrl` | `string` |  | 이관 원본 문서 주소 | `https://confluence.example.com/x/AB` |
| `page.ownerId` | `integer(int64)` |  | 문서 소유자. 정하지 않았으면 null(작성자로 대신하지 않는다) | `7` |
| `page.parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `page.position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `page.spaceId` | `integer(int64)` |  | 속한 스페이스 ID | `1` |
| `page.status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `page.title` | `string` |  | 페이지 제목 | `배포 절차` |
| `page.type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `page.verifiedAt` | `string(date-time)` |  | 검증한 시각 |  |
| `page.verifiedBy` | `integer(int64)` |  | 검증한 사용자 ID | `7` |
| `page.verifiedUntil` | `string(date-time)` |  | 검증 유효 기한. 만료 판정은 화면이 한다 |  |
| `page.version` | `integer(int32)` |  | 현재 버전. 수정 요청의 expectedVersion에 그대로 넣는다 | `3` |
| `page.views` | `integer(int64)` |  | 누적 조회수 | `128` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<id>/collaboration-draft" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "string",
    "expectedGeneration": 0,
    "expectedPageVersion": 0,
    "title": "string"
  }'
```

## POST /api/wiki/pages/{id}/copy

페이지를 복사한다 — 옵션을 비우면 그 페이지 하나만

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `CopyRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `includeDescendants` | `boolean` |  |  |  |
| `includeRestrictions` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `PageResponse`

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
curl -X POST "https://<your-host>/api/wiki/pages/<id>/copy" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "includeDescendants": false,
    "includeRestrictions": false
  }'
```

## PUT /api/wiki/pages/{id}/icon

페이지 아이콘을 지정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `PageIconRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `icon` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
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
curl -X PUT "https://<your-host>/api/wiki/pages/<id>/icon" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "icon": "string"
  }'
```

## POST /api/wiki/pages/{id}/move

페이지를 다른 부모·순서·스페이스로 옮긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `PageMoveRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `beforeId` | `integer(int64)` |  |  |  |
| `children` | `string` |  |  |  |
| `confirmImpact` | `boolean` |  |  |  |
| `parentId` | `integer(int64)` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 새 위치의 보기 제한이 새로 적용됩니다 — 확인 후 confirmImpact=true로 다시 요청하세요 | `MoveImpactError` |
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
curl -X POST "https://<your-host>/api/wiki/pages/<id>/move" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "beforeId": 0,
    "children": "string",
    "confirmImpact": false,
    "parentId": 0,
    "spaceId": 0
  }'
```

## PUT /api/wiki/pages/{id}/owner

페이지 소유자를 지정하거나 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `PageOwnerRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `ownerId` | `integer(int64)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
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
curl -X PUT "https://<your-host>/api/wiki/pages/<id>/owner" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": 0
  }'
```

## POST /api/wiki/pages/{id}/publish

초안 페이지를 게시한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

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
curl -X POST "https://<your-host>/api/wiki/pages/<id>/publish" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{id}/share

페이지를 다른 사용자에게 공유해 알림을 보낸다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `ShareRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `note` | `string` |  |  |  |
| `userIds` | `integer(int64)[]` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ShareResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ShareResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `delivered` | `integer(int32)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<id>/share" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      0
    ]
  }'
```

## PUT /api/wiki/pages/{id}/verification

페이지를 검증 완료로 표시한다 — 기한을 비우면 90일

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `PageVerificationRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `verifiedUntil` | `string(date)` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
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
curl -X PUT "https://<your-host>/api/wiki/pages/<id>/verification" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "verifiedUntil": "2026-01-01"
  }'
```

## DELETE /api/wiki/pages/{id}/verification

페이지 검증 표시를 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

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
curl -X DELETE "https://<your-host>/api/wiki/pages/<id>/verification" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{id}/views

페이지 조회수를 올리고 최근 방문 기록에 남긴다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, integer(int64)>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<id>/views" \
  -H "Authorization: Bearer chanho_pat_…"
```
