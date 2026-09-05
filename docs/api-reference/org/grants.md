> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Grants

권한(grant) 원장 — 누가 어느 리소스에서 무엇을 할 수 있는지. 조회·변경 모두 그 리소스의 ADMIN만 가능하다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/grants` | [리소스의 권한 목록 조회](#get-apiorggrants) |
| `POST` | `/api/org/grants` | [권한 부여](#post-apiorggrants) |
| `GET` | `/api/org/grants/audit` | [리소스의 권한 변경 이력 조회](#get-apiorggrantsaudit) |
| `PATCH` | `/api/org/grants/{id}` | [권한 역할 변경 — 마지막 전역 관리자의 강등은 409](#patch-apiorggrantsid) |
| `DELETE` | `/api/org/grants/{id}` | [권한 회수](#delete-apiorggrantsid) |

## GET /api/org/grants

리소스의 권한 목록 조회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `resourceType` | query | `string enum(GLOBAL, SPACE, PROJECT)` | 예 | 리소스 종류 — GLOBAL \| SPACE \| PROJECT 등 |
| `resourceId` | query | `string` |  | 리소스 식별자. GLOBAL이면 비워 둔다. |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `GrantDetailResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `GrantDetailResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 권한 행 id. 역할 변경·회수의 대상이다. | `17` |
| `[].subjectType` | `string enum(USER, TEAM)` |  | 권한 주체 종류 — USER(사람) \| TEAM(팀) | `USER` |
| `[].subjectId` | `integer(int64)` |  | 권한 주체 id — 멤버 id 또는 팀 id | `42` |
| `[].subjectName` | `string` |  | 화면에 보이는 주체 이름. 주체가 지워졌으면 id 문자열로 대신한다. | `김찬호` |
| `[].resourceType` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 리소스 종류 | `SPACE` |
| `[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null이거나 빈 문자열. | `sp-1` |
| `[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할. ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. | `EDITOR` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/grants?resourceType=<resourceType>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/grants

권한 부여

### 요청 본문

`application/json` — `GrantCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `subjectType` | `string enum(USER, TEAM)` | 예 | 권한 주체 종류 — USER(사람) \| TEAM(팀) | `USER` |
| `subjectId` | `integer(int64)` | 예 | 권한 주체 id — 멤버 id 또는 팀 id | `42` |
| `resourceType` | `string enum(GLOBAL, SPACE, PROJECT)` | 예 | 리소스 종류 | `SPACE` |
| `resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null이나 빈 문자열로 둔다. | `sp-1` |
| `role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` | 예 | 역할. ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. | `EDITOR` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `GrantDetailResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**201 본문** — `GrantDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 권한 행 id. 역할 변경·회수의 대상이다. | `17` |
| `subjectType` | `string enum(USER, TEAM)` |  | 권한 주체 종류 — USER(사람) \| TEAM(팀) | `USER` |
| `subjectId` | `integer(int64)` |  | 권한 주체 id — 멤버 id 또는 팀 id | `42` |
| `subjectName` | `string` |  | 화면에 보이는 주체 이름. 주체가 지워졌으면 id 문자열로 대신한다. | `김찬호` |
| `resourceType` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 리소스 종류 | `SPACE` |
| `resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null이거나 빈 문자열. | `sp-1` |
| `role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할. ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. | `EDITOR` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/grants" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectType": "USER",
    "subjectId": 42,
    "resourceType": "SPACE",
    "role": "EDITOR"
  }'
```

## GET /api/org/grants/audit

리소스의 권한 변경 이력 조회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `resourceType` | query | `string enum(GLOBAL, SPACE, PROJECT)` | 예 | 리소스 종류 — GLOBAL \| SPACE \| PROJECT 등 |
| `resourceId` | query | `string` |  | 리소스 식별자. GLOBAL이면 비워 둔다. |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `GrantAuditResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `GrantAuditResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `string` |  | 기록 id. 숫자를 문자열로 낸다. | `108` |
| `[].action` | `string` |  | 무슨 일이 있었나 — GRANT_GRANTED \| GRANT_CHANGED \| GRANT_REVOKED | `GRANT_GRANTED` |
| `[].targetType` | `string` |  | 권한 주체 종류 — USER \| TEAM | `USER` |
| `[].targetId` | `string` |  | 권한 주체 id. 숫자를 문자열로 낸다. | `42` |
| `[].targetLabel` | `string` |  | 기록 당시의 주체 이름 | `김찬호` |
| `[].detail` | `string` |  | 역할 이름 | `EDITOR` |
| `[].actorId` | `string` |  | 이 일을 한 사람의 멤버 id. 숫자를 문자열로 낸다. | `1` |
| `[].createdAt` | `string` |  | 발생 시각(ISO-8601 문자열) | `2026-09-05T02:11:43Z` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/grants/audit?resourceType=<resourceType>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PATCH /api/org/grants/{id}

권한 역할 변경 — 마지막 전역 관리자의 강등은 409

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 권한 행 id |

### 요청 본문

`application/json` — `GrantRoleRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` | 예 | 바꿀 역할. 마지막 전역 ADMIN을 내리려 하면 409. | `ADMIN` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `GrantDetailResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 마지막 전역 관리자는 내릴 수 없습니다. | `PlatformError` |

**200 본문** — `GrantDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 권한 행 id. 역할 변경·회수의 대상이다. | `17` |
| `subjectType` | `string enum(USER, TEAM)` |  | 권한 주체 종류 — USER(사람) \| TEAM(팀) | `USER` |
| `subjectId` | `integer(int64)` |  | 권한 주체 id — 멤버 id 또는 팀 id | `42` |
| `subjectName` | `string` |  | 화면에 보이는 주체 이름. 주체가 지워졌으면 id 문자열로 대신한다. | `김찬호` |
| `resourceType` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 리소스 종류 | `SPACE` |
| `resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null이거나 빈 문자열. | `sp-1` |
| `role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할. ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. | `EDITOR` |

### curl

```bash
curl -X PATCH "https://<your-host>/api/org/grants/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

## DELETE /api/org/grants/{id}

권한 회수

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 권한 행 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/org/grants/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
