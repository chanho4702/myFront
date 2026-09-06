> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Admin

감사 로그와 시스템 현황 — 전역 관리자 전용

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/admin/audit` | [감사 로그를 조건별로 조회한다](#get-apialmadminaudit) |
| `GET` | `/api/alm/admin/stats` | [프로젝트·이슈·첨부 총량 등 시스템 현황을 조회한다. 서버에서 60초 캐시한다](#get-apialmadminstats) |

## GET /api/alm/admin/audit

감사 로그를 조건별로 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `type` | query | `string` |  | 감사 항목 종류로 거른다 |
| `actorId` | query | `integer(int64)` |  | 행위자 사용자 ID로 거른다 |
| `projectId` | query | `integer(int64)` |  | 프로젝트 ID로 거른다 |
| `since` | query | `string(date-time)` |  | 이 시각 이후만 본다. ISO-8601 인스턴트(예: 2026-08-01T00:00:00Z) |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |
| `size` | query | `integer(int32)` |  | 한 페이지 항목 수 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AuditPageResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AuditPageResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `AuditLogResponse[]` |  |  |  |
| `items[].id` | `integer(int64)` |  |  |  |
| `items[].eventType` | `string` |  |  |  |
| `items[].actorId` | `integer(int64)` |  |  |  |
| `items[].projectId` | `integer(int64)` |  |  |  |
| `items[].targetKey` | `string` |  |  |  |
| `items[].summary` | `string` |  |  |  |
| `items[].occurredAt` | `string(date-time)` |  |  |  |
| `page` | `integer(int32)` |  |  |  |
| `size` | `integer(int32)` |  |  |  |
| `total` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/admin/audit" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/admin/stats

프로젝트·이슈·첨부 총량 등 시스템 현황을 조회한다. 서버에서 60초 캐시한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SystemStatsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SystemStatsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `projects` | `integer(int64)` |  |  |  |
| `issues` | `integer(int64)` |  |  |  |
| `attachments` | `integer(int64)` |  |  |  |
| `attachmentBytes` | `integer(int64)` |  |  |  |
| `auditEntries` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/admin/stats" \
  -H "Authorization: Bearer chanho_pat_…"
```
