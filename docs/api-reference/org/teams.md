> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Teams

팀과 팀원 — 팀은 권한(grant)의 주체가 될 수 있다. 변경은 전역 관리자 또는 그 팀 리더만 가능하다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/teams` | [팀 목록 조회 — myRole은 호출자가 그 팀 소속이 아니면 null](#get-apiorgteams) |
| `POST` | `/api/org/teams` | [팀 생성](#post-apiorgteams) |
| `PUT` | `/api/org/teams/{id}` | [팀 이름·설명 수정](#put-apiorgteamsid) |
| `DELETE` | `/api/org/teams/{id}` | [팀 삭제](#delete-apiorgteamsid) |
| `GET` | `/api/org/teams/{id}/members` | [팀원 목록 조회 — 이름과 이메일을 함께 준다](#get-apiorgteamsidmembers) |
| `PUT` | `/api/org/teams/{id}/members/{memberId}` | [팀원 추가 — 이미 소속이면 역할만 갱신된다](#put-apiorgteamsidmembersmemberid) |
| `PATCH` | `/api/org/teams/{id}/members/{memberId}` | [팀원 역할 변경 — 리더 지정·해제](#patch-apiorgteamsidmembersmemberid) |
| `DELETE` | `/api/org/teams/{id}/members/{memberId}` | [팀원 제외](#delete-apiorgteamsidmembersmemberid) |

## GET /api/org/teams

팀 목록 조회 — myRole은 호출자가 그 팀 소속이 아니면 null

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `q` | query | `string` |  | 팀 이름 부분 검색어 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TeamResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `TeamResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 팀 id | `3` |
| `[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `[].description` | `string` |  | 팀 설명 | `게이트웨이·인증·조직 서비스를 만든다` |
| `[].kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하며 가입·탈퇴·삭제할 수 없다 | `STANDARD` |
| `[].memberCount` | `integer(int64)` |  | 팀원 수 | `7` |
| `[].myRole` | `string enum(LEAD, MEMBER)` |  | 호출자의 팀 내 역할. 그 팀 소속이 아니면 null. | `LEAD` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/teams" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/teams

팀 생성

### 요청 본문

`application/json` — `TeamCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 | 팀 이름. 100자까지. | `플랫폼팀` |
| `description` | `string` |  | 팀 설명 | `게이트웨이·인증·조직 서비스를 만든다` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `TeamResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**201 본문** — `TeamResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 팀 id | `3` |
| `name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `description` | `string` |  | 팀 설명 | `게이트웨이·인증·조직 서비스를 만든다` |
| `kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하며 가입·탈퇴·삭제할 수 없다 | `STANDARD` |
| `memberCount` | `integer(int64)` |  | 팀원 수 | `7` |
| `myRole` | `string enum(LEAD, MEMBER)` |  | 호출자의 팀 내 역할. 그 팀 소속이 아니면 null. | `LEAD` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/teams" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "플랫폼팀"
  }'
```

## PUT /api/org/teams/{id}

팀 이름·설명 수정

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |

### 요청 본문

`application/json` — `TeamUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 예 | 팀 이름. 100자까지. | `플랫폼팀` |
| `description` | `string` |  | 팀 설명 | `게이트웨이·인증·조직 서비스를 만든다` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TeamResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `TeamResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 팀 id | `3` |
| `name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `description` | `string` |  | 팀 설명 | `게이트웨이·인증·조직 서비스를 만든다` |
| `kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하며 가입·탈퇴·삭제할 수 없다 | `STANDARD` |
| `memberCount` | `integer(int64)` |  | 팀원 수 | `7` |
| `myRole` | `string enum(LEAD, MEMBER)` |  | 호출자의 팀 내 역할. 그 팀 소속이 아니면 null. | `LEAD` |

### curl

```bash
curl -X PUT "https://<your-host>/api/org/teams/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "플랫폼팀"
  }'
```

## DELETE /api/org/teams/{id}

팀 삭제

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/org/teams/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/teams/{id}/members

팀원 목록 조회 — 이름과 이메일을 함께 준다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TeamMemberResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `TeamMemberResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].memberId` | `integer(int64)` |  | 멤버 id | `42` |
| `[].displayName` | `string` |  | 표시 이름 | `김찬호` |
| `[].email` | `string` |  | 이메일 — 동명이인을 가르는 단서. 없으면 null. | `chanho@example.com` |
| `[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/teams/<id>/members" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/org/teams/{id}/members/{memberId}

팀원 추가 — 이미 소속이면 역할만 갱신된다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |
| `memberId` | path | `integer(int64)` | 예 | 추가할 멤버 id |
| `role` | query | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 — LEAD \| MEMBER |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X PUT "https://<your-host>/api/org/teams/<id>/members/<memberId>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PATCH /api/org/teams/{id}/members/{memberId}

팀원 역할 변경 — 리더 지정·해제

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |
| `memberId` | path | `integer(int64)` | 예 | 대상 멤버 id |

### 요청 본문

`application/json` — `TeamMemberRoleRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `role` | `string enum(LEAD, MEMBER)` | 예 | 바꿀 역할 — LEAD(리더) \| MEMBER | `LEAD` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TeamMemberResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `TeamMemberResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `memberId` | `integer(int64)` |  | 멤버 id | `42` |
| `displayName` | `string` |  | 표시 이름 | `김찬호` |
| `email` | `string` |  | 이메일 — 동명이인을 가르는 단서. 없으면 null. | `chanho@example.com` |
| `role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |

### curl

```bash
curl -X PATCH "https://<your-host>/api/org/teams/<id>/members/<memberId>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "LEAD"
  }'
```

## DELETE /api/org/teams/{id}/members/{memberId}

팀원 제외

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 팀 id |
| `memberId` | path | `integer(int64)` | 예 | 제외할 멤버 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/org/teams/<id>/members/<memberId>" \
  -H "Authorization: Bearer chanho_pat_…"
```
