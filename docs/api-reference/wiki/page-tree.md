> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Page Tree

스페이스 페이지 트리의 지연 조회와 경로 탐색.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/paths` | [여러 페이지의 조상 경로를 한 번에 조회한다](#get-apiwikipagespaths) |
| `GET` | `/api/wiki/pages/{pageId}/ancestors` | [페이지의 조상을 루트부터 조회한다](#get-apiwikipagespageidancestors) |
| `GET` | `/api/wiki/pages/{pageId}/descendants` | [페이지의 하위 노드를 전부 조회한다](#get-apiwikipagespageiddescendants) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages/by-ids` | [ID 목록으로 페이지 노드를 한 번에 조회한다](#get-apiwikispacesspaceidpagesby-ids) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages/children` | [부모 아래의 자식 페이지를 조회한다 — parentId를 비우면 루트](#get-apiwikispacesspaceidpageschildren) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages/lookup` | [제목으로 페이지를 찾는다 — 위키 링크 해석용](#get-apiwikispacesspaceidpageslookup) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages/recent` | [최근 수정된 페이지를 조회한다](#get-apiwikispacesspaceidpagesrecent) |
| `GET` | `/api/wiki/spaces/{spaceId}/pages/search` | [스페이스 안에서 제목으로 페이지를 검색한다](#get-apiwikispacesspaceidpagessearch) |

## GET /api/wiki/pages/paths

여러 페이지의 조상 경로를 한 번에 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | query | `integer(int64)[]` | 예 | 경로를 구할 페이지 ID. 한 번에 최대 100건 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PagePath[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PagePath[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].titles` | `string[]` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/paths?id=<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/ancestors

페이지의 조상을 루트부터 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/ancestors" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/descendants

페이지의 하위 노드를 전부 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/descendants" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages/by-ids

ID 목록으로 페이지 노드를 한 번에 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |
| `id` | query | `integer(int64)[]` | 예 | 조회할 페이지 ID. 여러 번 줄 수 있다 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages/by-ids?id=<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages/children

부모 아래의 자식 페이지를 조회한다 — parentId를 비우면 루트

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |
| `parentId` | query | `integer(int64)` |  | 부모 페이지 ID. 비우면 스페이스 루트 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages/children" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages/lookup

제목으로 페이지를 찾는다 — 위키 링크 해석용

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |
| `title` | query | `string[]` | 예 | 찾을 페이지 제목. 여러 번 줄 수 있다 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages/lookup?title=<title>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages/recent

최근 수정된 페이지를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |
| `limit` | query | `integer(int32)` |  | 최대 건수 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages/recent" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/pages/search

스페이스 안에서 제목으로 페이지를 검색한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |
| `q` | query | `string` | 예 | 제목에서 찾을 말 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageNode[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageNode[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].childCount` | `integer(int64)` |  | 자식 수. 0이면 펼침 화살표를 그리지 않는다 | `3` |
| `[].icon` | `string` |  | 페이지 아이콘 이모지 | `📘` |
| `[].id` | `integer(int64)` |  | 페이지 ID | `42` |
| `[].parentId` | `integer(int64)` |  | 부모 페이지 ID. 루트면 null | `12` |
| `[].position` | `integer(int64)` |  | 같은 부모 안에서의 정렬 위치 | `1024` |
| `[].status` | `string enum(draft, published)` |  | draft 또는 published | `published` |
| `[].title` | `string` |  | 페이지 제목 | `배포 절차` |
| `[].type` | `string enum(page, folder, blog)` |  | page·folder·blog | `page` |
| `[].updatedAt` | `string(date-time)` |  | 마지막으로 고친 시각 |  |
| `[].updatedBy` | `integer(int64)` |  | 마지막으로 고친 사용자 ID | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/pages/search?q=<q>" \
  -H "Authorization: Bearer chanho_pat_…"
```
