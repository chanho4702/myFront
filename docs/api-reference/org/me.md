> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Me

내 정보 — 프로필·소속 팀·권한. 승인 대기 계정도 이 경로만은 읽을 수 있다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/me` | [내 프로필 조회 — 이름·아바타·상태·전역 역할·소속 팀](#get-apiorgme) |
| `GET` | `/api/org/me/permissions` | [내 권한(grant) 목록 조회 — 프론트 메뉴·버튼 제어용](#get-apiorgmepermissions) |

## GET /api/org/me

내 프로필 조회 — 이름·아바타·상태·전역 역할·소속 팀

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MeResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MeResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  | 내 멤버 id (= auth-server user id) | `42` |
| `displayName` | `string` |  | 표시 이름 | `김찬호` |
| `email` | `string` |  | 이메일 | `chanho@example.com` |
| `avatarUrl` | `string` |  | 아바타 이미지 경로. 없으면 null. | `/api/org/members/42/avatar?v=1757030400000` |
| `avatarUpdatedAt` | `string(date-time)` |  | 아바타를 마지막으로 바꾼 시각. 없으면 null. |  |
| `status` | `string enum(PENDING, ACTIVE, SUSPENDED, DEACTIVATED)` |  | 계정 상태. ACTIVE가 아니면 이 경로 밖은 403이다. | `ACTIVE` |
| `kind` | `string enum(HUMAN, AGENT)` |  | 멤버 종류 | `HUMAN` |
| `joinedVia` | `string enum(INVITE, APPROVAL, BOOTSTRAP, LEGACY)` |  | 합류 경로 | `INVITE` |
| `globalRoles` | `string[]` |  | GLOBAL 권한의 역할 목록. 여기에 ADMIN이 있으면 전역 관리자다. | `["ADMIN"]` |
| `teams` | `TeamMembership[]` |  | 소속 팀 목록 |  |
| `teams[].id` | `integer(int64)` |  | 팀 id | `3` |
| `teams[].name` | `string` |  | 팀 이름 | `플랫폼팀` |
| `teams[].kind` | `string enum(STANDARD, EVERYONE)` |  | 팀 종류 | `STANDARD` |
| `teams[].role` | `string enum(LEAD, MEMBER)` |  | 팀 내 역할 | `MEMBER` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/me" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/me/permissions

내 권한(grant) 목록 조회 — 프론트 메뉴·버튼 제어용

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `GrantResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `GrantResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].resourceType` | `string enum(GLOBAL, SPACE, PROJECT)` |  | 리소스 종류 | `SPACE` |
| `[].resourceId` | `string` |  | 리소스 식별자. GLOBAL이면 null이거나 빈 문자열. | `sp-1` |
| `[].role` | `string enum(VIEWER, COMMENTER, EDITOR, ADMIN)` |  | 역할. ADMIN ⊃ EDITOR ⊃ COMMENTER ⊃ VIEWER. | `EDITOR` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/me/permissions" \
  -H "Authorization: Bearer chanho_pat_…"
```
