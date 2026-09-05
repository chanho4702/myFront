> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Personalization

개인 설정·프로젝트 바로 가기·공지 배너

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/alm/admin/banner` | [상단 공지 배너를 저장한다 — 전역 관리자 전용](#put-apialmadminbanner) |
| `GET` | `/api/alm/banner` | [상단 공지 배너를 조회한다](#get-apialmbanner) |
| `GET` | `/api/alm/me/preferences` | [내 개인 설정을 조회한다](#get-apialmmepreferences) |
| `PUT` | `/api/alm/me/preferences` | [내 개인 설정을 저장한다](#put-apialmmepreferences) |
| `GET` | `/api/alm/projects/{projectId}/shortcuts` | [프로젝트 바로 가기를 조회한다](#get-apialmprojectsprojectidshortcuts) |
| `POST` | `/api/alm/projects/{projectId}/shortcuts` | [프로젝트에 바로 가기를 만든다](#post-apialmprojectsprojectidshortcuts) |
| `PUT` | `/api/alm/shortcuts/{id}` | [바로 가기를 수정한다](#put-apialmshortcutsid) |
| `DELETE` | `/api/alm/shortcuts/{id}` | [바로 가기를 삭제한다](#delete-apialmshortcutsid) |

## PUT /api/alm/admin/banner

상단 공지 배너를 저장한다 — 전역 관리자 전용

### 요청 본문

`application/json` — `Banner` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  |  |  |
| `level` | `string` |  |  |  |
| `message` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `Banner` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `Banner`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  |  |  |
| `level` | `string` |  |  |  |
| `message` | `string` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/admin/banner" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "level": "string",
    "message": "string"
  }'
```

## GET /api/alm/banner

상단 공지 배너를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `Banner` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `Banner`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  |  |  |
| `level` | `string` |  |  |  |
| `message` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/banner" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/me/preferences

내 개인 설정을 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PreferenceView` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PreferenceView`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `notifications` | `NotificationPrefs` |  |  |  |
| `notifications.assigned` | `boolean` |  |  |  |
| `notifications.statusChanged` | `boolean` |  |  |  |
| `notifications.commented` | `boolean` |  |  |  |
| `notifications.mentioned` | `boolean` |  |  |  |
| `autoWatch` | `AutoWatch` |  |  |  |
| `autoWatch.created` | `boolean` |  |  |  |
| `autoWatch.commented` | `boolean` |  |  |  |
| `autoWatch.edited` | `boolean` |  |  |  |
| `startPage` | `string` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |
| `mailConfigured` | `boolean` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/me/preferences" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/me/preferences

내 개인 설정을 저장한다

### 요청 본문

`application/json` — `PreferenceUpdate` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `notifications` | `NotificationPrefs` |  |  |  |
| `notifications.assigned` | `boolean` |  |  |  |
| `notifications.statusChanged` | `boolean` |  |  |  |
| `notifications.commented` | `boolean` |  |  |  |
| `notifications.mentioned` | `boolean` |  |  |  |
| `autoWatch` | `AutoWatch` |  |  |  |
| `autoWatch.created` | `boolean` |  |  |  |
| `autoWatch.commented` | `boolean` |  |  |  |
| `autoWatch.edited` | `boolean` |  |  |  |
| `startPage` | `string` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PreferenceView` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PreferenceView`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `notifications` | `NotificationPrefs` |  |  |  |
| `notifications.assigned` | `boolean` |  |  |  |
| `notifications.statusChanged` | `boolean` |  |  |  |
| `notifications.commented` | `boolean` |  |  |  |
| `notifications.mentioned` | `boolean` |  |  |  |
| `autoWatch` | `AutoWatch` |  |  |  |
| `autoWatch.created` | `boolean` |  |  |  |
| `autoWatch.commented` | `boolean` |  |  |  |
| `autoWatch.edited` | `boolean` |  |  |  |
| `startPage` | `string` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |
| `mailConfigured` | `boolean` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/me/preferences" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "notifications": {
      "assigned": false,
      "statusChanged": false,
      "commented": false,
      "mentioned": false
    },
    "autoWatch": {
      "created": false,
      "commented": false,
      "edited": false
    },
    "startPage": "string",
    "emailEnabled": false
  }'
```

## GET /api/alm/projects/{projectId}/shortcuts

프로젝트 바로 가기를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ShortcutResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ShortcutResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].projectId` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].url` | `string` |  |  |  |
| `[].order` | `integer(int32)` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/shortcuts" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/projects/{projectId}/shortcuts

프로젝트에 바로 가기를 만든다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `ShortcutRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `url` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `ShortcutResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `ShortcutResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `url` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/projects/<projectId>/shortcuts" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "url": "string"
  }'
```

## PUT /api/alm/shortcuts/{id}

바로 가기를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `ShortcutRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `url` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ShortcutResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ShortcutResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `projectId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `url` | `string` |  |  |  |
| `order` | `integer(int32)` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/shortcuts/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "url": "string"
  }'
```

## DELETE /api/alm/shortcuts/{id}

바로 가기를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/alm/shortcuts/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
