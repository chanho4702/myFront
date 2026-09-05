> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Invitations

초대 — 이메일로 사람을 조직에 들인다. 팀·권한 프리셋을 함께 담아 두면 수락 시점에 적용된다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/invitations` | [초대 목록 조회 — 목록의 inviteUrl은 항상 null이다](#get-apiorginvitations) |
| `POST` | `/api/org/invitations` | [초대 생성 — 이메일 여러 개를 한 번에. inviteUrl은 이 응답에서만 볼 수 있다](#post-apiorginvitations) |
| `DELETE` | `/api/org/invitations/{id}` | [초대 철회 — 대기 중인 초대만 철회할 수 있다](#delete-apiorginvitationsid) |
| `GET` | `/api/org/invitations/{id}/events` | [초대 이력 조회 — 발송·재발송·수락·철회](#get-apiorginvitationsidevents) |
| `POST` | `/api/org/invitations/{id}/resend` | [초대 재발송 — 새 토큰·새 만료로 링크를 다시 만든다](#post-apiorginvitationsidresend) |

## GET /api/org/invitations

초대 목록 조회 — 목록의 inviteUrl은 항상 null이다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | query | `string` |  | 상태 필터 — PENDING \| ACCEPTED \| REVOKED \| EXPIRED. 미지정이면 전부. |
| `q` | query | `string` |  | 이메일 부분 검색어 |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |
| `size` | query | `integer(int32)` |  | 페이지 크기 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponseInvitationResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PageResponseInvitationResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `InvitationResponse[]` |  | 이 페이지의 항목 |  |
| `items[].id` | `integer(int64)` |  | 초대 id | `7` |
| `items[].email` | `string` |  | 초대받은 이메일 | `chanho@example.com` |
| `items[].status` | `string enum(PENDING, ACCEPTED, EXPIRED, REVOKED)` |  | 초대 상태. PENDING만 살아 있는 초대다. | `PENDING` |
| `items[].invitedBy` | `integer(int64)` |  | 초대한 사람의 멤버 id | `1` |
| `items[].invitedByName` | `string` |  | 초대한 사람의 표시 이름 | `김찬호` |
| `items[].message` | `string` |  | 초대 메일에 실은 메시지 | `플랫폼팀에서 함께 일하게 됐습니다.` |
| `items[].expiresAt` | `string(date-time)` |  | 만료 시각. 기본 유효기간은 7일이다. |  |
| `items[].createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `items[].acceptedMemberId` | `integer(int64)` |  | 수락한 멤버 id. 아직 수락 전이면 null. | `42` |
| `items[].acceptedAt` | `string(date-time)` |  | 수락 시각. 아직 수락 전이면 null. |  |
| `items[].acceptedVia` | `string enum(TOKEN, EMAIL_MATCH)` |  | 수락 경로 — TOKEN(초대 링크 경유) \| EMAIL_MATCH(이메일 일치). 수락 전이면 null. | `TOKEN` |
| `items[].teams` | `TeamPresetView[]` |  | 수락 시 적용될 팀 프리셋 |  |
| `items[].teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `items[].teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `items[].teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `items[].grants` | `GrantPresetView[]` |  | 수락 시 적용될 권한 프리셋 |  |
| `items[].grants[].scope` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 권한 범위 | `SPACE` |
| `items[].grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `items[].grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |
| `items[].inviteUrl` | `string` |  | 초대 링크. 생성·재발송 응답에만 담기고 목록에서는 항상 null이다(토큰 원문을 저장하지 않는다). | `https://platform.example.com/invite/AbCd…` |
| `items[].mailSent` | `boolean` |  | 메일을 실제로 보냈는지. false면 화면이 링크 복사를 안내한다. | `true` |
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 | `0` |
| `size` | `integer(int32)` |  | 페이지 크기 | `20` |
| `total` | `integer(int64)` |  | 전체 항목 수 | `137` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/invitations" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/invitations

초대 생성 — 이메일 여러 개를 한 번에. inviteUrl은 이 응답에서만 볼 수 있다

### 요청 본문

`application/json` — `InvitationCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `emails` | `string[]` | 예 | 초대할 이메일 목록. 이미 활성이거나 정지된 계정의 이메일이면 409. | `["chanho@example.com"]` |
| `teams` | `TeamPreset[]` |  | 수락 시 넣을 팀 프리셋 |  |
| `teams[].teamId` | `integer(int64)` | 예 | 팀 id | `3` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할. 비우면 MEMBER. | `MEMBER` |
| `grants` | `GrantPreset[]` |  | 수락 시 줄 권한 프리셋 |  |
| `grants[].scope` | `string enum(GLOBAL, SPACE, PROJECT)` | 예 | 권한 범위 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 비워 둔다. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` | 예 | 역할 | `EDITOR` |
| `message` | `string` |  | 초대 메일에 함께 실을 메시지. 500자까지. | `플랫폼팀에서 함께 일하게 됐습니다.` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `InvitationResponse[]` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `409` | 이미 활성이거나 정지된 계정의 이메일입니다. | `PlatformError` |

**201 본문** — `InvitationResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  | 초대 id | `7` |
| `[].email` | `string` |  | 초대받은 이메일 | `chanho@example.com` |
| `[].status` | `string enum(PENDING, ACCEPTED, EXPIRED, REVOKED)` |  | 초대 상태. PENDING만 살아 있는 초대다. | `PENDING` |
| `[].invitedBy` | `integer(int64)` |  | 초대한 사람의 멤버 id | `1` |
| `[].invitedByName` | `string` |  | 초대한 사람의 표시 이름 | `김찬호` |
| `[].message` | `string` |  | 초대 메일에 실은 메시지 | `플랫폼팀에서 함께 일하게 됐습니다.` |
| `[].expiresAt` | `string(date-time)` |  | 만료 시각. 기본 유효기간은 7일이다. |  |
| `[].createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `[].acceptedMemberId` | `integer(int64)` |  | 수락한 멤버 id. 아직 수락 전이면 null. | `42` |
| `[].acceptedAt` | `string(date-time)` |  | 수락 시각. 아직 수락 전이면 null. |  |
| `[].acceptedVia` | `string enum(TOKEN, EMAIL_MATCH)` |  | 수락 경로 — TOKEN(초대 링크 경유) \| EMAIL_MATCH(이메일 일치). 수락 전이면 null. | `TOKEN` |
| `[].teams` | `TeamPresetView[]` |  | 수락 시 적용될 팀 프리셋 |  |
| `[].teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `[].teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `[].teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `[].grants` | `GrantPresetView[]` |  | 수락 시 적용될 권한 프리셋 |  |
| `[].grants[].scope` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 권한 범위 | `SPACE` |
| `[].grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `[].grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |
| `[].inviteUrl` | `string` |  | 초대 링크. 생성·재발송 응답에만 담기고 목록에서는 항상 null이다(토큰 원문을 저장하지 않는다). | `https://platform.example.com/invite/AbCd…` |
| `[].mailSent` | `boolean` |  | 메일을 실제로 보냈는지. false면 화면이 링크 복사를 안내한다. | `true` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/invitations" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      "chanho@example.com"
    ]
  }'
```

## DELETE /api/org/invitations/{id}

초대 철회 — 대기 중인 초대만 철회할 수 있다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 초대 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 대기 중인 초대만 철회할 수 있습니다. | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/org/invitations/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/invitations/{id}/events

초대 이력 조회 — 발송·재발송·수락·철회

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 초대 id |

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
curl -X GET "https://<your-host>/api/org/invitations/<id>/events" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/invitations/{id}/resend

초대 재발송 — 새 토큰·새 만료로 링크를 다시 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 초대 id |
| `mail` | query | `boolean` |  | false면 메일을 보내지 않고 링크만 응답에 담는다(링크 복사용) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `InvitationResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 이미 수락된 초대입니다. | `PlatformError` |

**200 본문** — `InvitationResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 초대 id | `7` |
| `email` | `string` |  | 초대받은 이메일 | `chanho@example.com` |
| `status` | `string enum(PENDING, ACCEPTED, EXPIRED, REVOKED)` |  | 초대 상태. PENDING만 살아 있는 초대다. | `PENDING` |
| `invitedBy` | `integer(int64)` |  | 초대한 사람의 멤버 id | `1` |
| `invitedByName` | `string` |  | 초대한 사람의 표시 이름 | `김찬호` |
| `message` | `string` |  | 초대 메일에 실은 메시지 | `플랫폼팀에서 함께 일하게 됐습니다.` |
| `expiresAt` | `string(date-time)` |  | 만료 시각. 기본 유효기간은 7일이다. |  |
| `createdAt` | `string(date-time)` |  | 생성 시각 |  |
| `acceptedMemberId` | `integer(int64)` |  | 수락한 멤버 id. 아직 수락 전이면 null. | `42` |
| `acceptedAt` | `string(date-time)` |  | 수락 시각. 아직 수락 전이면 null. |  |
| `acceptedVia` | `string enum(TOKEN, EMAIL_MATCH)` |  | 수락 경로 — TOKEN(초대 링크 경유) \| EMAIL_MATCH(이메일 일치). 수락 전이면 null. | `TOKEN` |
| `teams` | `TeamPresetView[]` |  | 수락 시 적용될 팀 프리셋 |  |
| `teams[].teamId` | `integer(int64)` |  | 팀 id | `3` |
| `teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |
| `grants` | `GrantPresetView[]` |  | 수락 시 적용될 권한 프리셋 |  |
| `grants[].scope` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 권한 범위 | `SPACE` |
| `grants[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null. | `sp-1` |
| `grants[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할 | `EDITOR` |
| `inviteUrl` | `string` |  | 초대 링크. 생성·재발송 응답에만 담기고 목록에서는 항상 null이다(토큰 원문을 저장하지 않는다). | `https://platform.example.com/invite/AbCd…` |
| `mailSent` | `boolean` |  | 메일을 실제로 보냈는지. false면 화면이 링크 복사를 안내한다. | `true` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/invitations/<id>/resend" \
  -H "Authorization: Bearer chanho_pat_…"
```
