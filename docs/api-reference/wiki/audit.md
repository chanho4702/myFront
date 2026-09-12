> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Audit

감사 로그 조회 — 스페이스 스코프와 전역 피드.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/audit` | [전역 감사 피드를 조회한다 — 전역 관리자만](#get-apiwikiaudit) |
| `GET` | `/api/wiki/audit/space-deletions` | [스페이스 삭제 기록을 조회한다 — 전역 관리자만](#get-apiwikiauditspace-deletions) |
| `GET` | `/api/wiki/spaces/{spaceId}/audit` | [스페이스의 감사 로그를 조회한다 — 스페이스 ADMIN만](#get-apiwikispacesspaceidaudit) |

## GET /api/wiki/audit

전역 감사 피드를 조회한다 — 전역 관리자만

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호. 음수면 0으로 본다 |
| `size` | query | `integer(int32)` |  | 페이지 크기. 기본 20, 상한 100 — 넘겨도 거절하지 않고 100으로 자른다 |
| `type` | query | `string` |  | eventType 필터(선택). 모르는 값이면 400 |
| `since` | query | `string(date-time)` |  | 이 시각 이후만(선택, ISO-8601 — 예: 2026-09-01T00:00:00Z) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AuditFeedPage` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `AuditFeedPage`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `AuditFeedItem[]` |  | 이 페이지의 기록. 최신이 먼저 |  |
| `items[].actorId` | `integer(int64)` |  | 조작한 사용자 ID | `7` |
| `items[].eventType` | `string` |  | 조작 종류. PAGE_TRASHED(페이지 휴지통 이동), PAGE_RESTORED(페이지 복원), PAGE_PURGED(페이지 완전 삭제), PAGE_ARCHIVED(페이지 보관), PAGE_UNARCHIVED(페이지 보관 해제), PAGE_RESTRICTIONS_CHANGED(페이지 제한 변경), PAGE_OWNER_CHANGED(페이지 소유자 변경), PAGE_VERIFIED(페이지 검증), PAGE_UNVERIFIED(페이지 검증 해제), ATTACHMENT_DELETED(첨부 삭제), SPACE_UPDATED(스페이스 정보 변경), SPACE_DELETED(스페이스 삭제), TEMPLATE_CREATED(템플릿 생성), TEMPLATE_UPDATED(템플릿 수정), TEMPLATE_DELETED(템플릿 삭제), IMPORTED(외부 위키에서 이관) 중 하나. 본문 수정은 리비전이 남기므로 감사 로그에 없다. | `PAGE_TRASHED` |
| `items[].id` | `integer(int64)` |  | 감사 기록 ID | `123` |
| `items[].occurredAt` | `string` |  | 발생 시각(ISO-8601 UTC) | `2026-09-12T01:02:03Z` |
| `items[].pageId` | `integer(int64)` |  | 대상 페이지 ID. 페이지 대상 기록이 아니면 null | `55` |
| `items[].spaceId` | `integer(int64)` |  | 대상 스페이스 ID | `3` |
| `items[].spaceKey` | `string` |  | 대상 스페이스 key. 이미 지워진 스페이스면 null | `DOCS` |
| `items[].summary` | `string` |  | 한 줄 요약 — 조작 라벨에 상세가 있으면 덧붙인다 | `페이지 휴지통 이동` |
| `items[].targetTitle` | `string` |  | 대상의 그때 이름(페이지 제목·첨부 파일명·스페이스 이름 등) | `설계 문서` |
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 | `0` |
| `size` | `integer(int32)` |  | 실제 적용된 페이지 크기(상한 100) | `20` |
| `total` | `integer(int64)` |  | 필터를 적용한 전체 건수 | `1234` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/audit" \
  -H "Authorization: Bearer chanho_pat_…"
```

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
| `spaceId` | path | `integer(int64)` | 예 | 스페이스 ID |

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
