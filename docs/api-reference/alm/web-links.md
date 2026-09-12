> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Web Links

이슈에 붙는 외부 링크(PR·커밋·웹) — 에이전트 git 연결

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}/web-links` | [이슈에 걸린 외부 링크(PR·커밋·웹)를 최신순으로 조회한다](#get-apialmissuesissueidweb-links) |
| `POST` | `/api/alm/issues/{issueId}/web-links` | [이슈에 외부 링크(PR·커밋·웹)를 붙인다](#post-apialmissuesissueidweb-links) |
| `DELETE` | `/api/alm/web-links/{id}` | [외부 링크를 삭제한다](#delete-apialmweb-linksid) |

## GET /api/alm/issues/{issueId}/web-links

이슈에 걸린 외부 링크(PR·커밋·웹)를 최신순으로 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WebLinkResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WebLinkResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].url` | `string` |  |  |  |
| `[].title` | `string` |  |  |  |
| `[].kind` | `string` |  |  |  |
| `[].createdBy` | `integer(int64)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/web-links" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/issues/{issueId}/web-links

이슈에 외부 링크(PR·커밋·웹)를 붙인다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 | 이슈 ID |

### 요청 본문

`application/json` — `WebLinkRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `url` | `string` |  |  |  |
| `title` | `string` |  |  |  |
| `kind` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WebLinkResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WebLinkResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `issueId` | `integer(int64)` |  |  |  |
| `url` | `string` |  |  |  |
| `title` | `string` |  |  |  |
| `kind` | `string` |  |  |  |
| `createdBy` | `integer(int64)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/issues/<issueId>/web-links" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "string",
    "title": "string",
    "kind": "string"
  }'
```

## DELETE /api/alm/web-links/{id}

외부 링크를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 외부 링크 ID |

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
curl -X DELETE "https://<your-host>/api/alm/web-links/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
