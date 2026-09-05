> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Collaboration

공동 편집 세션 접속용 1회용 티켓.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `POST` | `/api/wiki/pages/{pageId}/collaboration-ticket` | [공동 편집 WebSocket 접속에 쓸 1회용 티켓을 발급한다](#post-apiwikipagespageidcollaboration-ticket) |

## POST /api/wiki/pages/{pageId}/collaboration-ticket

공동 편집 WebSocket 접속에 쓸 1회용 티켓을 발급한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `CollaborationTicketResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `CollaborationTicketResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `expiresAt` | `string(date-time)` |  |  |  |
| `room` | `string` |  |  |  |
| `ticket` | `string` |  |  |  |
| `websocketPath` | `string` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/wiki/pages/<pageId>/collaboration-ticket" \
  -H "Authorization: Bearer chanho_pat_…"
```
