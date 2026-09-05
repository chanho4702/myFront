> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# WIKI API

스페이스와 계층형 페이지, 버전 이력, 첨부, 댓글을 다루는 위키 정본 서비스.
모든 경로는 `/api/wiki` 아래에 있고, 인가는 org-service의 스페이스 권한으로 판정한다.
오류 응답은 플랫폼 공통 계약인 `{"error": "메시지"}` 한 가지다.

| 항목 | 값 |
| --- | --- |
| 버전 | `0.0.1-SNAPSHOT` |
| 기본 URL | `https://<your-host>` |
| 엔드포인트 | 95 |

## 인증

개인 API 토큰 `chanho_pat_…` 또는 세션 JWT. 모든 엔드포인트가 이 인증을 요구한다.

```http
Authorization: Bearer chanho_pat_…
```

## 리소스

| 리소스 | 설명 | 엔드포인트 |
| --- | --- | --- |
| [Archive](archive.md) | 페이지 보관과 보관 해제. | 3 |
| [Attachments](attachments.md) | 페이지 첨부 파일의 업로드·목록·내려받기와 버전 관리. | 9 |
| [Audit](audit.md) | 스페이스 감사 로그 조회. | 2 |
| [Blog](blog.md) | 스페이스 블로그 글 목록. 글 자체는 페이지 API로 다룬다. | 1 |
| [Collaboration](collaboration.md) | 공동 편집 세션 접속용 1회용 티켓. | 1 |
| [Comments](comments.md) | 페이지 댓글과 본문 구간에 붙는 인라인 스레드. | 5 |
| [Export](export.md) | 페이지 PDF 내보내기. | 1 |
| [Labels](labels.md) | 페이지 라벨과 백링크. | 6 |
| [Notifications](notifications.md) | 알림함과 알림 수신 설정. | 4 |
| [Page Restrictions](page-restrictions.md) | 페이지 단위 열람·편집 제한. | 2 |
| [Page Tree](page-tree.md) | 스페이스 페이지 트리의 지연 조회와 경로 탐색. | 8 |
| [Pages](pages.md) | 페이지 생성·조회·수정·이동·복사·삭제. | 14 |
| [Personal](personal.md) | 개인 별표와 최근 방문 문서. | 6 |
| [Reactions](reactions.md) | 페이지와 댓글에 붙는 이모지 리액션. | 5 |
| [Revisions](revisions.md) | 페이지 버전 이력 조회와 복원. | 3 |
| [Spaces](spaces.md) | 스페이스 목록·생성·조회·수정·삭제. | 6 |
| [Tasks](tasks.md) | 본문 체크박스에서 뽑아낸 액션 아이템. | 2 |
| [Templates](templates.md) | 스페이스 페이지 템플릿. | 6 |
| [Trash](trash.md) | 삭제한 페이지의 휴지통 조회·복원·영구 삭제. | 4 |
| [Watch](watch.md) | 페이지·스페이스 구독 — 변경이 생기면 알림을 받는다. | 7 |

## 공통 오류

플랫폼 공통 오류 응답. 메시지는 한국어이며 사용자에게 그대로 보인다. 오류 응답 본문은 `PlatformError` 하나로 통일된다.

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `error` | `string` | 예 | 사용자에게 보일 오류 메시지 | `다른 사용자가 먼저 수정했습니다.` |
