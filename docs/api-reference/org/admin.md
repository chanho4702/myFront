> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Admin

관리자 대시보드가 읽는 조직 현황 — 전역 관리자 전용

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/org/admin/stats` | [조직 현황 통계 조회 — 사람 멤버의 상태별 수·에이전트·팀·대기 중 초대. 서버에서 60초 캐시한다](#get-apiorgadminstats) |

## GET /api/org/admin/stats

조직 현황 통계 조회 — 사람 멤버의 상태별 수·에이전트·팀·대기 중 초대. 서버에서 60초 캐시한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `OrgStatsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `OrgStatsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `members` | `map<string, integer(int64)>` |  | 사람 멤버의 상태별 수. 키는 ACTIVE·PENDING·SUSPENDED·DEACTIVATED 넷이며 0도 포함한다 | `{"ACTIVE":31,"PENDING":2,"SUSPENDED":1,"DEACTIVATED":4}` |
| `agents` | `integer(int64)` |  | 에이전트 페르소나 멤버 수(로그인 없는 AI 계정) | `3` |
| `teams` | `integer(int64)` |  | 팀 수 — "전체 구성원" 팀을 포함한다 | `6` |
| `pendingInvitations` | `integer(int64)` |  | 아직 수락되지 않은 초대 수(PENDING) | `2` |

### curl

```bash
curl -X GET "https://<your-host>/api/org/admin/stats" \
  -H "Authorization: Bearer chanho_pat_…"
```
