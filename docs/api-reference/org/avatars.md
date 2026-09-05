> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Avatars

아바타 이미지 — 올리고 지우는 것은 본인만, 보는 것은 로그인한 누구나.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/org/me/avatar` | [내 아바타 업로드 — multipart/form-data. 2MB를 넘으면 400](#put-apiorgmeavatar) |
| `DELETE` | `/api/org/me/avatar` | [내 아바타 삭제](#delete-apiorgmeavatar) |
| `GET` | `/api/org/members/{memberId}/avatar` | [멤버 아바타 이미지 조회 — 원본 타입 그대로 인라인, 5분 사적 캐시](#get-apiorgmembersmemberidavatar) |

## PUT /api/org/me/avatar

내 아바타 업로드 — multipart/form-data. 2MB를 넘으면 400

### 요청 본문

`application/json` — `object`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `file` | `string(binary)` | 예 |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `AvatarView` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `AvatarView`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `memberId` | `integer(int64)` |  | 멤버 id | `42` |
| `avatarUrl` | `string` |  | 아바타 이미지 경로. 프론트는 이 값의 유무를 '아바타가 있다'는 신호로도 쓴다. | `/api/org/members/42/avatar?v=1757030400000` |
| `updatedAt` | `string(date-time)` |  | 이 아바타를 올린 시각 |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/org/me/avatar" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "<file>"
  }'
```

## DELETE /api/org/me/avatar

내 아바타 삭제

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/org/me/avatar" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/org/members/{memberId}/avatar

멤버 아바타 이미지 조회 — 원본 타입 그대로 인라인, 5분 사적 캐시

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `memberId` | path | `integer(int64)` | 예 | 멤버 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/members/<memberId>/avatar" \
  -H "Authorization: Bearer chanho_pat_…"
```
