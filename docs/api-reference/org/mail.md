> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Mail

플랫폼 메일 — 설정 한 벌과 발송 큐. 위키·ALM·초대가 모두 이 설정으로 나간다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/settings/mail` | [메일 설정 조회 — 비밀번호는 담기지 않고 저장 여부만 나온다](#get-apiorgsettingsmail) |
| `PUT` | `/api/org/settings/mail` | [메일 설정 저장 — password는 생략=유지, ""=삭제, 값=교체](#put-apiorgsettingsmail) |
| `GET` | `/api/org/settings/mail/log` | [발송 로그 조회 — 큐이자 로그다(30일 보관)](#get-apiorgsettingsmaillog) |
| `POST` | `/api/org/settings/mail/log/{id}/retry` | [실패한 발송 다시 보내기 — FAILED를 PENDING으로 되돌린다](#post-apiorgsettingsmaillogidretry) |
| `POST` | `/api/org/settings/mail/test` | [테스트 발송 — 동기. 실패해도 200이고 error에 SMTP 문구가 그대로 담긴다](#post-apiorgsettingsmailtest) |

## GET /api/org/settings/mail

메일 설정 조회 — 비밀번호는 담기지 않고 저장 여부만 나온다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MailSettingResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MailSettingResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  | 메일 발송 사용 여부. false면 큐에 넣지 않고 곧바로 disabled로 답한다. | `true` |
| `mode` | `string enum(none, external, relay, full, dev)` |  | 설치 시 고른 인프라 모드(MAIL_MODE) — none \| external \| relay \| full \| dev. 읽기 전용 안내값이다. | `relay` |
| `host` | `string` |  | SMTP 호스트 | `mail-relay` |
| `port` | `integer(int32)` |  | SMTP 포트 | `25` |
| `username` | `string` |  | SMTP 사용자. 비면 인증 없이 보낸다(사내 릴레이). | `platform@example.com` |
| `passwordSet` | `boolean` |  | 비밀번호가 저장돼 있는가. 값 자체는 절대 내려가지 않는다. | `true` |
| `tls` | `string enum(NONE, STARTTLS, SSL)` |  | 전송 보안 | `STARTTLS` |
| `fromAddress` | `string` |  | 보내는 주소 | `no-reply@example.com` |
| `fromName` | `string` |  | 보내는 이름 | `플랫폼` |
| `updatedAt` | `string(date-time)` |  | 마지막 저장 시각 |  |
| `updatedBy` | `integer(int64)` |  | 마지막으로 저장한 멤버 id. 최초 시드(env)면 null. | `1` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/settings/mail" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/org/settings/mail

메일 설정 저장 — password는 생략=유지, ""=삭제, 값=교체

### 요청 본문

`application/json` — `MailSettingUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  | 메일 발송 사용 여부. true면 host·port·fromAddress가 필수다. | `true` |
| `host` | `string` |  | SMTP 호스트 | `mail-relay` |
| `port` | `integer(int32)` |  | SMTP 포트 | `25` |
| `username` | `string` |  | SMTP 사용자. 비우면 인증 없이 보낸다. | `platform@example.com` |
| `password` | `string` |  | SMTP 비밀번호. 생략=유지, ""=삭제, 값=교체. 저장하려면 ORG_SETTINGS_ENC_KEY가 있어야 한다. |  |
| `tls` | `string enum(NONE, STARTTLS, SSL)` |  | 전송 보안 | `STARTTLS` |
| `fromAddress` | `string` |  | 보내는 주소 | `no-reply@example.com` |
| `fromName` | `string` |  | 보내는 이름 | `플랫폼` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MailSettingResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MailSettingResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` |  | 메일 발송 사용 여부. false면 큐에 넣지 않고 곧바로 disabled로 답한다. | `true` |
| `mode` | `string enum(none, external, relay, full, dev)` |  | 설치 시 고른 인프라 모드(MAIL_MODE) — none \| external \| relay \| full \| dev. 읽기 전용 안내값이다. | `relay` |
| `host` | `string` |  | SMTP 호스트 | `mail-relay` |
| `port` | `integer(int32)` |  | SMTP 포트 | `25` |
| `username` | `string` |  | SMTP 사용자. 비면 인증 없이 보낸다(사내 릴레이). | `platform@example.com` |
| `passwordSet` | `boolean` |  | 비밀번호가 저장돼 있는가. 값 자체는 절대 내려가지 않는다. | `true` |
| `tls` | `string enum(NONE, STARTTLS, SSL)` |  | 전송 보안 | `STARTTLS` |
| `fromAddress` | `string` |  | 보내는 주소 | `no-reply@example.com` |
| `fromName` | `string` |  | 보내는 이름 | `플랫폼` |
| `updatedAt` | `string(date-time)` |  | 마지막 저장 시각 |  |
| `updatedBy` | `integer(int64)` |  | 마지막으로 저장한 멤버 id. 최초 시드(env)면 null. | `1` |

### curl

```bash
curl -X PUT "https://<your-host>/api/org/settings/mail" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "host": "mail-relay",
    "port": 25,
    "username": "platform@example.com",
    "password": "string",
    "tls": "STARTTLS",
    "fromAddress": "no-reply@example.com",
    "fromName": "플랫폼"
  }'
```

## GET /api/org/settings/mail/log

발송 로그 조회 — 큐이자 로그다(30일 보관)

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | query | `string` |  | 상태 필터 — PENDING \| SENT \| FAILED. 미지정이면 전부. |
| `page` | query | `integer(int32)` |  | 0부터 세는 페이지 번호 |
| `size` | query | `integer(int32)` |  | 페이지 크기(최대 100) |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageResponseMailLogItem` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `PageResponseMailLogItem`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `items` | `MailLogItem[]` |  | 이 페이지의 항목 |  |
| `items[].id` | `integer(int64)` |  | 로그 id | `42` |
| `items[].to` | `string` |  | 받는 주소 | `chanho@example.com` |
| `items[].subject` | `string` |  | 제목 | `[플랫폼] 김찬호님이 초대했습니다` |
| `items[].source` | `string` |  | 출처 — wiki \| alm \| org \| test | `org` |
| `items[].status` | `string enum(PENDING, SENT, FAILED)` |  | 상태 | `SENT` |
| `items[].attempts` | `integer(int32)` |  | 시도 횟수. 5회를 다 쓰면 FAILED다. | `1` |
| `items[].lastError` | `string` |  | 마지막 실패 사유(SMTP 원문). 성공이면 null. |  |
| `items[].createdAt` | `string(date-time)` |  | 큐에 들어온 시각 |  |
| `items[].sentAt` | `string(date-time)` |  | 보낸 시각. 아직이면 null. |  |
| `page` | `integer(int32)` |  | 0부터 세는 페이지 번호 | `0` |
| `size` | `integer(int32)` |  | 페이지 크기 | `20` |
| `total` | `integer(int64)` |  | 전체 항목 수 | `137` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/settings/mail/log" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/settings/mail/log/{id}/retry

실패한 발송 다시 보내기 — FAILED를 PENDING으로 되돌린다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 발송 로그 id |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `409` | 실패한 발송만 다시 보낼 수 있습니다. | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/settings/mail/log/<id>/retry" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/org/settings/mail/test

테스트 발송 — 동기. 실패해도 200이고 error에 SMTP 문구가 그대로 담긴다

### 요청 본문

`application/json` — `MailTestRequest`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `to` | `string` |  | 받는 주소. 생략하면 요청자의 이메일. | `chanho@example.com` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `MailTestResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `MailTestResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `ok` | `boolean` |  | 보냈는가 | `false` |
| `error` | `string` |  | 실패 사유(SMTP 원문). 성공이면 null. | `Couldn't connect to host, port: mail-relay, 25` |

### curl

```bash
curl -X POST "https://<your-host>/api/org/settings/mail/test" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "chanho@example.com"
  }'
```
