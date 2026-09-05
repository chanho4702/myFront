> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Trash

삭제한 페이지의 휴지통 조회·복원·영구 삭제.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `DELETE` | `/api/wiki/pages/{id}/purge` | [휴지통의 페이지를 영구 삭제한다](#delete-apiwikipagesidpurge) |
| `POST` | `/api/wiki/pages/{id}/restore` | [휴지통의 페이지를 되살린다](#post-apiwikipagesidrestore) |
| `GET` | `/api/wiki/spaces/{spaceId}/trash` | [스페이스 휴지통의 페이지를 조회한다](#get-apiwikispacesspaceidtrash) |
| `DELETE` | `/api/wiki/spaces/{spaceId}/trash` | [휴지통을 비운다 — 영구 삭제한 건수를 돌려준다](#delete-apiwikispacesspaceidtrash) |

## DELETE /api/wiki/pages/{id}/purge

휴지통의 페이지를 영구 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

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
curl -X DELETE "https://<your-host>/api/wiki/pages/<id>/purge" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{id}/restore

휴지통의 페이지를 되살린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageRestoreResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageRestoreResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
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
| `reparentedToRoot` | `boolean` |  |  |  |
| `restoredCount` | `integer(int32)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<id>/restore" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/trash

스페이스 휴지통의 페이지를 조회한다

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
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/trash" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/spaces/{spaceId}/trash

휴지통을 비운다 — 영구 삭제한 건수를 돌려준다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, integer(int32)>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/spaces/<spaceId>/trash" \
  -H "Authorization: Bearer chanho_pat_…"
```
