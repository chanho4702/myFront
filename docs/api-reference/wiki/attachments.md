> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Attachments

페이지 첨부 파일의 업로드·목록·내려받기와 버전 관리.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/attachments/{id}` | [첨부를 내려받는다 — 브라우저 인라인 실행은 막는다](#get-apiwikiattachmentsid) |
| `DELETE` | `/api/wiki/attachments/{id}` | [첨부를 삭제한다](#delete-apiwikiattachmentsid) |
| `GET` | `/api/wiki/attachments/{id}/inline` | [안전한 타입의 첨부만 인라인으로 표시한다](#get-apiwikiattachmentsidinline) |
| `GET` | `/api/wiki/attachments/{id}/versions` | [첨부의 지난 버전 목록을 최신순으로 조회한다](#get-apiwikiattachmentsidversions) |
| `GET` | `/api/wiki/attachments/{id}/versions/{version}` | [첨부의 지난 버전을 내려받는다](#get-apiwikiattachmentsidversionsversion) |
| `POST` | `/api/wiki/attachments/{id}/versions/{version}/restore` | [지난 버전을 현재 첨부로 되돌린다 — 되돌린 것도 새 버전으로 쌓인다](#post-apiwikiattachmentsidversionsversionrestore) |
| `GET` | `/api/wiki/pages/{pageId}/attachments` | [페이지의 첨부 목록을 조회한다](#get-apiwikipagespageidattachments) |
| `POST` | `/api/wiki/pages/{pageId}/attachments` | [페이지에 첨부 파일을 올린다](#post-apiwikipagespageidattachments) |
| `POST` | `/api/wiki/pages/{pageId}/attachments/confirm` | [에디터가 먼저 올린 임시 첨부를 본문 저장 뒤 확정한다](#post-apiwikipagespageidattachmentsconfirm) |

## GET /api/wiki/attachments/{id}

첨부를 내려받는다 — 브라우저 인라인 실행은 막는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | 첨부 파일 내용. Content-Type은 첨부의 실제 타입이다 | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/attachments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/attachments/{id}

첨부를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |

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
curl -X DELETE "https://<your-host>/api/wiki/attachments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/attachments/{id}/inline

안전한 타입의 첨부만 인라인으로 표시한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | 첨부 파일 내용. 안전한 타입만 인라인으로 나간다 | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `415` | 허용되지 않는 미디어 타입 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/attachments/<id>/inline" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/attachments/{id}/versions

첨부의 지난 버전 목록을 최신순으로 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AttachmentVersionResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AttachmentVersionResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].contentType` | `string` |  | 그때의 MIME 타입 | `application/pdf` |
| `[].createdAt` | `string` |  | 그 버전이 만들어진 시각(ISO-8601) | `2026-09-01T02:30:00Z` |
| `[].sizeBytes` | `integer(int64)` |  | 그때의 파일 크기(바이트) | `198400` |
| `[].uploadedBy` | `integer(int64)` |  | 그 버전을 올린 사용자 ID | `7` |
| `[].version` | `integer(int32)` |  | 버전 번호(1부터) | `1` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/attachments/<id>/versions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/attachments/{id}/versions/{version}

첨부의 지난 버전을 내려받는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |
| `version` | path | `integer(int32)` | 예 | 내려받을 지난 버전 번호(1부터) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | 그 버전의 파일 내용 | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/attachments/<id>/versions/<version>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/attachments/{id}/versions/{version}/restore

지난 버전을 현재 첨부로 되돌린다 — 되돌린 것도 새 버전으로 쌓인다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 첨부 ID |
| `version` | path | `integer(int32)` | 예 | 현재로 되돌릴 지난 버전 번호 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AttachmentResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AttachmentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `checksumSha256` | `string` |  | 내용의 SHA-256 체크섬(hex) | `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08` |
| `contentType` | `string` |  | MIME 타입 | `application/pdf` |
| `filename` | `string` |  | 원본 파일 이름 | `배포절차.pdf` |
| `id` | `integer(int64)` |  | 첨부 ID | `9` |
| `pageId` | `integer(int64)` |  | 붙어 있는 페이지 ID | `42` |
| `sizeBytes` | `integer(int64)` |  | 파일 크기(바이트) | `204800` |
| `version` | `integer(int32)` |  | 현재 버전(1부터). 2 이상이면 지난 버전이 있다 | `2` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/attachments/<id>/versions/<version>/restore" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/attachments

페이지의 첨부 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AttachmentResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AttachmentResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].checksumSha256` | `string` |  | 내용의 SHA-256 체크섬(hex) | `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08` |
| `[].contentType` | `string` |  | MIME 타입 | `application/pdf` |
| `[].filename` | `string` |  | 원본 파일 이름 | `배포절차.pdf` |
| `[].id` | `integer(int64)` |  | 첨부 ID | `9` |
| `[].pageId` | `integer(int64)` |  | 붙어 있는 페이지 ID | `42` |
| `[].sizeBytes` | `integer(int64)` |  | 파일 크기(바이트) | `204800` |
| `[].version` | `integer(int32)` |  | 현재 버전(1부터). 2 이상이면 지난 버전이 있다 | `2` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/attachments" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{pageId}/attachments

페이지에 첨부 파일을 올린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |
| `pending` | query | `boolean` |  | 본문 저장 전 에디터가 먼저 올리는 임시 첨부. confirm 전까지 정리 대상이다 |

### 요청 본문

`multipart/form-data` — `object`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `file` | `string(binary)` | 예 | 올릴 파일(multipart/form-data) |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `AttachmentResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `AttachmentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `checksumSha256` | `string` |  | 내용의 SHA-256 체크섬(hex) | `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08` |
| `contentType` | `string` |  | MIME 타입 | `application/pdf` |
| `filename` | `string` |  | 원본 파일 이름 | `배포절차.pdf` |
| `id` | `integer(int64)` |  | 첨부 ID | `9` |
| `pageId` | `integer(int64)` |  | 붙어 있는 페이지 ID | `42` |
| `sizeBytes` | `integer(int64)` |  | 파일 크기(바이트) | `204800` |
| `version` | `integer(int32)` |  | 현재 버전(1부터). 2 이상이면 지난 버전이 있다 | `2` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/attachments" \
  -H "Authorization: Bearer chanho_pat_…" \
  -F "file=@<file>"
```

## POST /api/wiki/pages/{pageId}/attachments/confirm

에디터가 먼저 올린 임시 첨부를 본문 저장 뒤 확정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `ConfirmAttachmentsRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `attachmentIds` | `integer(int64)[]` |  | 저장한 본문에 실제로 남은 첨부 ID 목록. 여기 없는 임시 첨부는 정리된다 | `[9,10]` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/attachments/confirm" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "attachmentIds": [
      9,
      10
    ]
  }'
```
