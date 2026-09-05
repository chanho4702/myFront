> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Audit

스페이스 감사 로그 조회.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/audit/space-deletions` | [스페이스 삭제 기록을 조회한다 — 전역 관리자만](#get-apiwikiauditspace-deletions) |
| `GET` | `/api/wiki/spaces/{spaceId}/audit` | [스페이스의 감사 로그를 조회한다 — 스페이스 ADMIN만](#get-apiwikispacesspaceidaudit) |

## GET /api/wiki/audit/space-deletions

스페이스 삭제 기록을 조회한다 — 전역 관리자만

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AuditEntry[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AuditEntry[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].action` | `string` |  |  |  |
| `[].actorId` | `integer(int64)` |  |  |  |
| `[].createdAt` | `string` |  |  |  |
| `[].detail` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].targetId` | `integer(int64)` |  |  |  |
| `[].targetLabel` | `string` |  |  |  |
| `[].targetType` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/audit/space-deletions" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/audit

스페이스의 감사 로그를 조회한다 — 스페이스 ADMIN만

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AuditEntry[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AuditEntry[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].action` | `string` |  |  |  |
| `[].actorId` | `integer(int64)` |  |  |  |
| `[].createdAt` | `string` |  |  |  |
| `[].detail` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].targetId` | `integer(int64)` |  |  |  |
| `[].targetLabel` | `string` |  |  |  |
| `[].targetType` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/audit" \
  -H "Authorization: Bearer chanho_pat_…"
```
