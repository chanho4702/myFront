> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Notifications

알림함과 이슈 관심 등록

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/issues/{issueId}/watchers` | [이슈의 관심 등록자를 조회한다](#get-apialmissuesissueidwatchers) |
| `PUT` | `/api/alm/issues/{issueId}/watchers/me` | [이슈를 관심 등록한다](#put-apialmissuesissueidwatchersme) |
| `DELETE` | `/api/alm/issues/{issueId}/watchers/me` | [이슈 관심 등록을 해제한다](#delete-apialmissuesissueidwatchersme) |
| `GET` | `/api/alm/notifications` | [내 알림을 최신순으로 조회한다](#get-apialmnotifications) |
| `POST` | `/api/alm/notifications/read-all` | [내 알림을 모두 읽음 처리한다](#post-apialmnotificationsread-all) |
| `POST` | `/api/alm/notifications/{id}/read` | [알림 하나를 읽음 처리한다](#post-apialmnotificationsidread) |

## GET /api/alm/issues/{issueId}/watchers

이슈의 관심 등록자를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WatchersResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WatchersResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `watching` | `boolean` |  |  |  |
| `watchers` | `Watcher[]` |  |  |  |
| `watchers[].userId` | `integer(int64)` |  |  |  |
| `watchers[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/issues/<issueId>/watchers" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/issues/{issueId}/watchers/me

이슈를 관심 등록한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WatchersResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WatchersResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `watching` | `boolean` |  |  |  |
| `watchers` | `Watcher[]` |  |  |  |
| `watchers[].userId` | `integer(int64)` |  |  |  |
| `watchers[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/issues/<issueId>/watchers/me" \
  -H "Authorization: Bearer chanho_pat_…"
```

## DELETE /api/alm/issues/{issueId}/watchers/me

이슈 관심 등록을 해제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `issueId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WatchersResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WatchersResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `watching` | `boolean` |  |  |  |
| `watchers` | `Watcher[]` |  |  |  |
| `watchers[].userId` | `integer(int64)` |  |  |  |
| `watchers[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X DELETE "https://<your-host>/api/alm/issues/<issueId>/watchers/me" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/notifications

내 알림을 최신순으로 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `NotificationResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `NotificationResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].issueId` | `integer(int64)` |  |  |  |
| `[].issueKey` | `string` |  |  |  |
| `[].actorId` | `integer(int64)` |  |  |  |
| `[].type` | `string enum(ASSIGNED, STATUS_CHANGED, COMMENTED, MENTIONED)` |  |  |  |
| `[].detail` | `string` |  |  |  |
| `[].read` | `boolean` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/notifications" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/notifications/read-all

내 알림을 모두 읽음 처리한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/notifications/read-all" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/notifications/{id}/read

알림 하나를 읽음 처리한다

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

### curl

```bash
curl -X POST "https://<your-host>/api/alm/notifications/<id>/read" \
  -H "Authorization: Bearer chanho_pat_…"
```
