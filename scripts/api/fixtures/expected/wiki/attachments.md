> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Attachments

페이지 첨부 파일

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `DELETE` | `/api/wiki/attachments/{id}` | [첨부 삭제](#delete-apiwikiattachmentsid) |
| `GET` | `/api/wiki/pages/{id}/attachments` | [페이지 첨부 목록](#get-apiwikipagesidattachments) |
| `POST` | `/api/wiki/pages/{id}/attachments` | [첨부 업로드](#post-apiwikipagesidattachments) |

## DELETE /api/wiki/attachments/{id}

첨부 삭제

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | 삭제됨 |  |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 첨부 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/attachments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{id}/attachments

페이지 첨부 목록

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AttachmentResponse[]` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 페이지 없음 | `PlatformError` |

**200 본문** — `AttachmentResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` | 예 |  | `501` |
| `[].fileName` | `string` | 예 |  | `minutes.pdf` |
| `[].contentType` | `string` |  |  | `application/pdf` |
| `[].size` | `integer(int64)` | 예 | 바이트 | `204800` |
| `[].downloadUrl` | `string` | 예 | 만료되는 서명 URL |  |
| `[].uploadedBy` | `UserSummary` |  |  |  |
| `[].uploadedBy.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `[].uploadedBy.name` | `string` | 예 |  | `홍길동` |
| `[].uploadedBy.org` | `OrgSummary` |  |  |  |
| `[].uploadedBy.org.id` | `integer(int64)` | 예 |  | `7` |
| `[].uploadedBy.org.name` | `string` | 예 |  | `플랫폼팀` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<id>/attachments" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{id}/attachments

첨부 업로드

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`multipart/form-data` — `object`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `file` | `string(binary)` | 예 | 업로드할 파일(최대 20MB) |  |
| `comment` | `string` |  | 첨부 설명 | `회의록 원본` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | 업로드됨 | `AttachmentResponse` |
| `401` | 인증 필요 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 페이지 없음 | `PlatformError` |
| `413` | 파일이 너무 큼 | `PlatformError` |

**201 본문** — `AttachmentResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` | 예 |  | `501` |
| `fileName` | `string` | 예 |  | `minutes.pdf` |
| `contentType` | `string` |  |  | `application/pdf` |
| `size` | `integer(int64)` | 예 | 바이트 | `204800` |
| `downloadUrl` | `string` | 예 | 만료되는 서명 URL |  |
| `uploadedBy` | `UserSummary` |  |  |  |
| `uploadedBy.id` | `string(uuid)` | 예 | Keycloak subject | `2f1c0a2e-7b0e-4a0b-9c1d-0d1e2f3a4b5c` |
| `uploadedBy.name` | `string` | 예 |  | `홍길동` |
| `uploadedBy.org` | `OrgSummary` |  |  |  |
| `uploadedBy.org.id` | `integer(int64)` | 예 |  | `7` |
| `uploadedBy.org.name` | `string` | 예 |  | `플랫폼팀` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<id>/attachments" \
  -H "Authorization: Bearer chanho_pat_…" \
  -F "file=@<file>" \
  -F "comment=회의록 원본"
```
