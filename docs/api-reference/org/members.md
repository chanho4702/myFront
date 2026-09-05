> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Members

조직 멤버 — 로그인한 사람은 첫 요청에 자동으로 미러링되고, 이 API는 그 원장을 조회·승인·상태 전이한다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/members` | [멤버 목록 조회 — 배열. 기본 필터는 status=ACTIVE, kind=HUMAN](#get-apiorgmembers) |
| `POST` | `/api/org/members/agents` | [에이전트 페르소나를 멤버로 등록 — 전역 관리자 전용](#post-apiorgmembersagents) |
| `GET` | `/api/org/members/page` | [멤버 목록 페이지 조회 — 관리 화면용. 필터 규칙은 목록과 같다](#get-apiorgmemberspage) |
| `GET` | `/api/org/members/pending` | [승인 대기 멤버 목록 조회](#get-apiorgmemberspending) |
| `GET` | `/api/org/members/{id}` | [멤버 상세 조회 — grants는 전역 관리자와 본인에게만 채워진다](#get-apiorgmembersid) |
| `PATCH` | `/api/org/members/{id}` | [멤버 상태 전이 — 표시 이름은 여기서 바꿀 수 없다](#patch-apiorgmembersid) |
| `POST` | `/api/org/members/{id}/approve` | [승인 대기 멤버 승인 — 팀·권한 부여는 선택](#post-apiorgmembersidapprove) |
| `GET` | `/api/org/members/{id}/events` | [멤버의 초대·상태 이력 조회](#get-apiorgmembersidevents) |

## GET /api/org/members

멤버 목록 조회 — 배열. 기본 필터는 status=ACTIVE, kind=HUMAN

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | query | `string` |  | 상태 필터 — ACTIVE \| PENDING \| SUSPENDED \| DEACTIVATED, 또는 ALL(필터 없음). 미지정이면 ACTIVE. |
| `kind` | query | `string` |  | 종류 필터 — HUMAN \| AGENT, 또는 ALL(필터 없음). 미지정이면 HUMAN. |
| `q` | query | `string` |  | 이름·이메일 부분 검색어 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MemberResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `[].displayName` | `string` |  | 표시 이름. 원천은 Keycloak 프로필이다. | `김찬호` |
| `[].email` | `string` |  | 이메일 | `chanho@example.com` |
| `[].status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `[].kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 — 사람인지 에이전트 페르소나인지 | `HUMAN` |
| `[].avatarUrl` | `string` |  | 아바타 이미지 경로. 아바타를 올리지 않았으면 null. | `/api/org/members/42/avatar?v=1757030400000` |
| `[].avatarUpdatedAt` | `string(date-time)` |  | 아바타를 마지막으로 바꾼 시각. 없으면 null. |  |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/members/agents

에이전트 페르소나를 멤버로 등록 — 전역 관리자 전용

### 요청 본문

`application/json` — `AgentRegisterRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` | 예 | 에이전트 멤버 id. 사람 멤버와 같은 id 공간을 쓴다. | `9001` |
| `displayName` | `string` | 예 | 표시 이름 | `리뷰 봇` |
| `email` | `string` |  | 이메일. 에이전트는 없어도 된다. | `review-bot@example.com` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MemberResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `displayName` | `string` |  | 표시 이름. 원천은 Keycloak 프로필이다. | `김찬호` |
| `email` | `string` |  | 이메일 | `chanho@example.com` |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 — 사람인지 에이전트 페르소나인지 | `HUMAN` |
| `avatarUrl` | `string` |  | 아바타 이미지 경로. 아바타를 올리지 않았으면 null. | `/api/org/members/42/avatar?v=1757030400000` |
| `avatarUpdatedAt` | `string(date-time)` |  | 아바타를 마지막으로 바꾼 시각. 없으면 null. |  |

### curl

```bash
curl -X POST "https://<your-host>/api/org/members/agents" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9001,
    "displayName": "리뷰 봇"
  }'
```

## GET /api/org/members/page

멤버 목록 페이지 조회 — 관리 화면용. 필터 규칙은 목록과 같다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | query | `string` |  | 상태 필터 — ACTIVE \| PENDING \| SUSPENDED \| DEACTIVATED, 또는 ALL. 미지정이면 ACTIVE. |
| `kind` | query | `string` |  | 종류 필터 — HUMAN \| AGENT, 또는 ALL. 미지정이면 HUMAN. |
| `q` | query | `string` |  | 이름·이메일 부분 검색어 |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |
| `size` | query | `integer(int32)` |  | 페이지 크기 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponseMemberResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PageResponseMemberResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `MemberResponse[]` |  | 이 페이지의 항목 |  |
| `items[].id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `items[].displayName` | `string` |  | 표시 이름. 원천은 Keycloak 프로필이다. | `김찬호` |
| `items[].email` | `string` |  | 이메일 | `chanho@example.com` |
| `items[].status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `items[].kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 — 사람인지 에이전트 페르소나인지 | `HUMAN` |
| `items[].avatarUrl` | `string` |  | 아바타 이미지 경로. 아바타를 올리지 않았으면 null. | `/api/org/members/42/avatar?v=1757030400000` |
| `items[].avatarUpdatedAt` | `string(date-time)` |  | 아바타를 마지막으로 바꾼 시각. 없으면 null. |  |
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 | `0` |
| `size` | `integer(int32)` |  | 페이지 크기 | `20` |
| `total` | `integer(int64)` |  | 전체 항목 수 | `137` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members/page" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/members/pending

승인 대기 멤버 목록 조회

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MemberResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `[].displayName` | `string` |  | 표시 이름. 원천은 Keycloak 프로필이다. | `김찬호` |
| `[].email` | `string` |  | 이메일 | `chanho@example.com` |
| `[].status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `[].kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 — 사람인지 에이전트 페르소나인지 | `HUMAN` |
| `[].avatarUrl` | `string` |  | 아바타 이미지 경로. 아바타를 올리지 않았으면 null. | `/api/org/members/42/avatar?v=1757030400000` |
| `[].avatarUpdatedAt` | `string(date-time)` |  | 아바타를 마지막으로 바꾼 시각. 없으면 null. |  |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members/pending" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/members/{id}

멤버 상세 조회 — grants는 전역 관리자와 본인에게만 채워진다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 멤버 id (= auth-server user id) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberDetailResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `MemberDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `displayName` | `string` |  | 표시 이름 | `김찬호` |
| `email` | `string` |  | 이메일 | `chanho@example.com` |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 | `HUMAN` |
| `joinedVia` | `string enum(INVITE, APPROVAL, BOOTSTRAP, LEGACY)` |  | 합류 경로 — INVITE(초대 링크) \| APPROVAL(관리자 승인) \| BOOTSTRAP(최초 관리자 시드) \| LEGACY(초대 제도 이전 계정) | `INVITE` |
| `approvedBy` | `integer(int64)` |  | 승인한 관리자의 멤버 id. 승인 절차를 거치지 않았으면 null. | `1` |
| `approvedAt` | `string(date-time)` |  | 승인 시각 |  |
| `suspendedAt` | `string(date-time)` |  | 정지 시각. 정지된 적 없으면 null. |  |
| `deactivatedAt` | `string(date-time)` |  | 비활성 시각. 비활성된 적 없으면 null. |  |
| `createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `updatedAt` | `string(date-time)` |  | 마지막 변경 시각 |  |
| `teams` | `TeamMembershipView[]` |  | 소속 팀 목록 |  |
| `teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `teams[].kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하는 팀이다 | `STANDARD` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `grants` | `GrantView[]` |  | 권한 목록. 전역 관리자와 본인에게만 채워지고, 나머지에게는 null. |  |
| `grants[].id` | `integer(int64)` |  | 권한 행 id | `17` |
| `grants[].resourceType` | `string` |  | 리소스 종류 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PATCH /api/org/members/{id}

멤버 상태 전이 — 표시 이름은 여기서 바꿀 수 없다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 멤버 id |

### 요청 본문

`application/json` — `MemberPatchRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` | 예 | 전이할 상태. PENDING으로 되돌리거나 자기 계정을 비활성화하면 409. | `SUSPENDED` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberDetailResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 허용되지 않는 상태 전이입니다 — 자기 계정 비활성화, 마지막 전역 관리자 정지 등. | `PlatformError` |

**200 본문** — `MemberDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `displayName` | `string` |  | 표시 이름 | `김찬호` |
| `email` | `string` |  | 이메일 | `chanho@example.com` |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 | `HUMAN` |
| `joinedVia` | `string enum(INVITE, APPROVAL, BOOTSTRAP, LEGACY)` |  | 합류 경로 — INVITE(초대 링크) \| APPROVAL(관리자 승인) \| BOOTSTRAP(최초 관리자 시드) \| LEGACY(초대 제도 이전 계정) | `INVITE` |
| `approvedBy` | `integer(int64)` |  | 승인한 관리자의 멤버 id. 승인 절차를 거치지 않았으면 null. | `1` |
| `approvedAt` | `string(date-time)` |  | 승인 시각 |  |
| `suspendedAt` | `string(date-time)` |  | 정지 시각. 정지된 적 없으면 null. |  |
| `deactivatedAt` | `string(date-time)` |  | 비활성 시각. 비활성된 적 없으면 null. |  |
| `createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `updatedAt` | `string(date-time)` |  | 마지막 변경 시각 |  |
| `teams` | `TeamMembershipView[]` |  | 소속 팀 목록 |  |
| `teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `teams[].kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하는 팀이다 | `STANDARD` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `grants` | `GrantView[]` |  | 권한 목록. 전역 관리자와 본인에게만 채워지고, 나머지에게는 null. |  |
| `grants[].id` | `integer(int64)` |  | 권한 행 id | `17` |
| `grants[].resourceType` | `string` |  | 리소스 종류 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |

### curl

```bash
curl -X PATCH "https://<your-host>/api/org/members/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED"
  }'
```

## POST /api/org/members/{id}/approve

승인 대기 멤버 승인 — 팀·권한 부여는 선택

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 멤버 id |

### 요청 본문

`application/json` — `MemberApproveRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `teams` | `TeamAssignment[]` |  | 승인과 함께 넣을 팀 목록 |  |
| `teams[].teamId` | `integer(int64)` | 예 | 팀 id | `3` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할. 비우면 MEMBER. | `MEMBER` |
| `grants` | `GrantAssignment[]` |  | 승인과 함께 줄 권한 목록 |  |
| `grants[].scope` | `string enum(GLOBAL, SPACE, PROJECT)` | 예 | 권한 범위 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 비워 둔다. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` | 예 | 역할 | `EDITOR` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberDetailResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 승인 대기 중인 계정이 아닙니다. | `PlatformError` |

**200 본문** — `MemberDetailResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 멤버 id (= auth-server user id) | `42` |
| `displayName` | `string` |  | 표시 이름 | `김찬호` |
| `email` | `string` |  | 이메일 | `chanho@example.com` |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태 | `ACTIVE` |
| `kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 | `HUMAN` |
| `joinedVia` | `string enum(INVITE, APPROVAL, BOOTSTRAP, LEGACY)` |  | 합류 경로 — INVITE(초대 링크) \| APPROVAL(관리자 승인) \| BOOTSTRAP(최초 관리자 시드) \| LEGACY(초대 제도 이전 계정) | `INVITE` |
| `approvedBy` | `integer(int64)` |  | 승인한 관리자의 멤버 id. 승인 절차를 거치지 않았으면 null. | `1` |
| `approvedAt` | `string(date-time)` |  | 승인 시각 |  |
| `suspendedAt` | `string(date-time)` |  | 정지 시각. 정지된 적 없으면 null. |  |
| `deactivatedAt` | `string(date-time)` |  | 비활성 시각. 비활성된 적 없으면 null. |  |
| `createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `updatedAt` | `string(date-time)` |  | 마지막 변경 시각 |  |
| `teams` | `TeamMembershipView[]` |  | 소속 팀 목록 |  |
| `teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `teams[].kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 — EVERYONE은 활성 사람 멤버 전원이 자동으로 속하는 팀이다 | `STANDARD` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `grants` | `GrantView[]` |  | 권한 목록. 전역 관리자와 본인에게만 채워지고, 나머지에게는 null. |  |
| `grants[].id` | `integer(int64)` |  | 권한 행 id | `17` |
| `grants[].resourceType` | `string` |  | 리소스 종류 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/members/<id>/approve" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      {
        "teamId": 3
      }
    ],
    "grants": [
      {
        "scope": "SPACE",
        "role": "EDITOR"
      }
    ]
  }'
```

## GET /api/org/members/{id}/events

멤버의 초대·상태 이력 조회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 멤버 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MemberEventResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `MemberEventResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 이력 id | `108` |
| `[].memberId` | `integer(int64)` |  | 대상 멤버 id. 아직 멤버가 아닌 초대 단계면 null. | `42` |
| `[].invitationId` | `integer(int64)` |  | 관련 초대 id. 초대와 무관한 이력이면 null. | `7` |
| `[].type` | `string` |  | 이력 종류 — INVITED · INVITE_RESENT · INVITE_REVOKED · INVITE_EXPIRED · JOINED · APPROVED · SUSPENDED · REACTIVATED · DEACTIVATED · TEAM_ADDED · TEAM_REMOVED · KEYCLOAK_DISABLED_FAILED | `APPROVED` |
| `[].actorId` | `integer(int64)` |  | 이 일을 한 사람의 멤버 id. 시스템이 한 일이면 null. | `1` |
| `[].detail` | `string` |  | 부가 설명. 종류마다 담기는 값이 다르다. | `team=3` |
| `[].createdAt` | `string(date-time)` |  | 발생 시각 |  |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members/<id>/events" \
  -H "Authorization: Bearer chanho_pat_…"
```
