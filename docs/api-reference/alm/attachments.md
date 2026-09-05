> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Attachments

이슈 첨부 업로드·다운로드·삭제

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/attachments/{id}` | [첨부 파일을 내려받는다](#get-apialmattachmentsid) |
| `DELETE` | `/api/alm/attachments/{id}` | [첨부를 삭제한다](#delete-apialmattachmentsid) |
| `GET` | `/api/alm/attachments/{id}/inline` | [이미지 첨부를 인라인으로 조회한다](#get-apialmattachmentsidinline) |
| `GET` | `/api/alm/issues/{issueId}/attachments` | [이슈의 첨부 목록을 조회한다](#get-apialmissuesissueidattachments) |
| `POST` | `/api/alm/issues/{issueId}/attachments` | [이슈에 파일을 첨부한다](#post-apialmissuesissueidattachments) |

## GET /api/alm/attachments/{id}

첨부 파일을 내려받는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/attachments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/alm/attachments/{id}

첨부를 삭제한다

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
curl -X DELETE "https://<your-host>/api/alm/attachments/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/attachments/{id}/inline

이미지 첨부를 인라인으로 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/attachments/<id>/inline" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/issues/{issueId}/attachments

이슈의 첨부 목록을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

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
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].filename` | `string` |  |  |  |
| `[].contentType` | `string` |  |  |  |
| `[].sizeBytes` | `integer(int64)` |  |  |  |
| `[].uploadedBy` | `integer(int64)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/attachments" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/attachments

이슈에 파일을 첨부한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `object`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `file` | `string(binary)` | 예 |  |  |

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
| `id` | `integer(int64)` |  |  |  |
| `issueId` | `integer(int64)` |  |  |  |
| `filename` | `string` |  |  |  |
| `contentType` | `string` |  |  |  |
| `sizeBytes` | `integer(int64)` |  |  |  |
| `uploadedBy` | `integer(int64)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/attachments" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "<file>"
  }'
```
