> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Page Restrictions

페이지 단위 열람·편집 제한.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/{id}/restrictions` | [페이지에 걸린 열람·편집 제한을 조회한다](#get-apiwikipagesidrestrictions) |
| `PUT` | `/api/wiki/pages/{id}/restrictions` | [페이지 제한을 통째로 교체한다 — 빈 배열이면 그 타입은 제한 없음](#put-apiwikipagesidrestrictions) |

## GET /api/wiki/pages/{id}/restrictions

페이지에 걸린 열람·편집 제한을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageRestrictionsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageRestrictionsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `edit` | `RestrictionPrincipal[]` |  |  |  |
| `edit[].id` | `integer(int64)` |  |  |  |
| `edit[].type` | `string` |  |  |  |
| `inherited` | `InheritedRestriction[]` |  |  |  |
| `inherited[].pageId` | `integer(int64)` |  |  |  |
| `inherited[].pageTitle` | `string` |  |  |  |
| `inherited[].principals` | `RestrictionPrincipal[]` |  |  |  |
| `inherited[].principals[].id` | `integer(int64)` |  |  |  |
| `inherited[].principals[].type` | `string` |  |  |  |
| `view` | `RestrictionPrincipal[]` |  |  |  |
| `view[].id` | `integer(int64)` |  |  |  |
| `view[].type` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<id>/restrictions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{id}/restrictions

페이지 제한을 통째로 교체한다 — 빈 배열이면 그 타입은 제한 없음

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |

### 요청 본문

`application/json` — `ReplaceRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `edit` | `RestrictionPrincipal[]` |  |  |  |
| `edit[].id` | `integer(int64)` |  |  |  |
| `edit[].type` | `string` |  |  |  |
| `view` | `RestrictionPrincipal[]` |  |  |  |
| `view[].id` | `integer(int64)` |  |  |  |
| `view[].type` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageRestrictionsResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageRestrictionsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `edit` | `RestrictionPrincipal[]` |  |  |  |
| `edit[].id` | `integer(int64)` |  |  |  |
| `edit[].type` | `string` |  |  |  |
| `inherited` | `InheritedRestriction[]` |  |  |  |
| `inherited[].pageId` | `integer(int64)` |  |  |  |
| `inherited[].pageTitle` | `string` |  |  |  |
| `inherited[].principals` | `RestrictionPrincipal[]` |  |  |  |
| `inherited[].principals[].id` | `integer(int64)` |  |  |  |
| `inherited[].principals[].type` | `string` |  |  |  |
| `view` | `RestrictionPrincipal[]` |  |  |  |
| `view[].id` | `integer(int64)` |  |  |  |
| `view[].type` | `string` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<id>/restrictions" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "edit": [
      {
        "id": 0,
        "type": "string"
      }
    ],
    "view": [
      {
        "id": 0,
        "type": "string"
      }
    ]
  }'
```
