> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Admin

플랫폼 관리자 전용 위키 현황. 전역 관리자만 읽을 수 있다.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/admin/stats` | [위키 전체 현황 통계를 조회한다 — 전역 관리자만](#get-apiwikiadminstats) |

## GET /api/wiki/admin/stats

위키 전체 현황 통계를 조회한다 — 전역 관리자만

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `WikiAdminStats` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `WikiAdminStats`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `attachmentBytes` | `integer(int64)` |  | 확정된 첨부의 총 바이트 | `123456789` |
| `attachments` | `integer(int64)` |  | 확정된 첨부 수. 저장만 되고 본문에 붙지 않은 임시 업로드는 세지 않는다 | `310` |
| `comments` | `integer(int64)` |  | 댓글 수. 인라인 댓글과 답글을 모두 포함한다 | `420` |
| `draftPages` | `integer(int64)` |  | 초안 상태 문서 수. 휴지통 제외 | `40` |
| `editsLast7Days` | `integer(int64)` |  | 최근 7일 편집 수. 리비전 한 건이 편집 한 번이다 | `96` |
| `pages` | `integer(int64)` |  | 문서 수. 휴지통은 빼고, 폴더·블로그 글은 포함한다 | `1834` |
| `revisions` | `integer(int64)` |  | 누적 리비전 수 | `15220` |
| `spaces` | `integer(int64)` |  | 스페이스 수 | `12` |
| `trashedPages` | `integer(int64)` |  | 휴지통에 있는 문서 수 | `7` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/admin/stats" \
  -H "Authorization: Bearer chanho_pat_…"
```
