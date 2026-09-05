> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Watch

페이지·스페이스 구독 — 변경이 생기면 알림을 받는다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/{pageId}/watch` | [페이지를 구독 중인지 조회한다](#get-apiwikipagespageidwatch) |
| `POST` | `/api/wiki/pages/{pageId}/watch` | [페이지를 구독한다](#post-apiwikipagespageidwatch) |
| `DELETE` | `/api/wiki/pages/{pageId}/watch` | [페이지 구독을 해제한다](#delete-apiwikipagespageidwatch) |
| `GET` | `/api/wiki/spaces/{spaceId}/watch` | [스페이스를 구독 중인지 조회한다](#get-apiwikispacesspaceidwatch) |
| `POST` | `/api/wiki/spaces/{spaceId}/watch` | [스페이스를 구독한다 — PUT과 같은 동작(프론트 호환용)](#post-apiwikispacesspaceidwatch) |
| `PUT` | `/api/wiki/spaces/{spaceId}/watch` | [스페이스를 구독한다](#put-apiwikispacesspaceidwatch) |
| `DELETE` | `/api/wiki/spaces/{spaceId}/watch` | [스페이스 구독을 해제한다](#delete-apiwikispacesspaceidwatch) |

## GET /api/wiki/pages/{pageId}/watch

페이지를 구독 중인지 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/pages/{pageId}/watch

페이지를 구독한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/pages/{pageId}/watch

페이지 구독을 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 | 페이지 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/pages/<pageId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/watch

스페이스를 구독 중인지 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/wiki/spaces/{spaceId}/watch

스페이스를 구독한다 — PUT과 같은 동작(프론트 호환용)

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/spaces/<spaceId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/spaces/{spaceId}/watch

스페이스를 구독한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/spaces/<spaceId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/wiki/spaces/{spaceId}/watch

스페이스 구독을 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, boolean>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/wiki/spaces/<spaceId>/watch" \
  -H "Authorization: Bearer chanho_pat_…"
```
