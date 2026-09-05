> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Notifications

알림함과 알림 수신 설정.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/notifications` | [내 알림 목록을 조회한다 — 이때 메일 주소를 설정에 기억해 둔다](#get-apiwikinotifications) |
| `GET` | `/api/wiki/notifications/prefs` | [내 알림 설정을 조회한다 — 없으면 기본값으로 만든다](#get-apiwikinotificationsprefs) |
| `PUT` | `/api/wiki/notifications/prefs` | [내 알림 설정을 저장한다](#put-apiwikinotificationsprefs) |
| `POST` | `/api/wiki/notifications/read` | [알림을 읽음 처리한다 — ids를 비우면 전체](#post-apiwikinotificationsread) |

## GET /api/wiki/notifications

내 알림 목록을 조회한다 — 이때 메일 주소를 설정에 기억해 둔다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `NotificationListResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `NotificationListResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `NotificationResponse[]` |  |  |  |
| `items[].actorId` | `integer(int64)` |  |  |  |
| `items[].createdAt` | `string(date-time)` |  |  |  |
| `items[].id` | `integer(int64)` |  |  |  |
| `items[].note` | `string` |  |  |  |
| `items[].pageId` | `integer(int64)` |  |  |  |
| `items[].pageTitle` | `string` |  |  |  |
| `items[].read` | `boolean` |  |  |  |
| `items[].spaceId` | `integer(int64)` |  |  |  |
| `items[].type` | `string` |  |  |  |
| `unreadCount` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/notifications" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/notifications/prefs

내 알림 설정을 조회한다 — 없으면 기본값으로 만든다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `NotificationPrefResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `NotificationPrefResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `comment` | `boolean` |  |  |  |
| `email` | `string` |  |  |  |
| `emailConfigured` | `boolean` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |
| `emailMode` | `string` |  |  |  |
| `mentioned` | `boolean` |  |  |  |
| `pageUpdated` | `boolean` |  |  |  |
| `shared` | `boolean` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/notifications/prefs" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/notifications/prefs

내 알림 설정을 저장한다

### 요청 본문

`application/json` — `NotificationPrefUpdate` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `comment` | `boolean` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |
| `emailMode` | `string enum(IMMEDIATE, DAILY)` |  |  |  |
| `mentioned` | `boolean` |  |  |  |
| `pageUpdated` | `boolean` |  |  |  |
| `shared` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `NotificationPrefResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `NotificationPrefResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `comment` | `boolean` |  |  |  |
| `email` | `string` |  |  |  |
| `emailConfigured` | `boolean` |  |  |  |
| `emailEnabled` | `boolean` |  |  |  |
| `emailMode` | `string` |  |  |  |
| `mentioned` | `boolean` |  |  |  |
| `pageUpdated` | `boolean` |  |  |  |
| `shared` | `boolean` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/notifications/prefs" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": false,
    "emailEnabled": false,
    "emailMode": "IMMEDIATE",
    "mentioned": false,
    "pageUpdated": false,
    "shared": false
  }'
```

## POST /api/wiki/notifications/read

알림을 읽음 처리한다 — ids를 비우면 전체

### 요청 본문

`application/json` — `ReadRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `ids` | `integer(int64)[]` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/notifications/read" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      0
    ]
  }'
```
