> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# ALM API

프로젝트·이슈·스프린트·보드를 다루는 ALM 서비스의 REST API. 모든 경로는 `/api/alm` 아래에 있고, 권한은 org-service가 프로젝트 단위로 판정한다. 오류 응답은 `{"error": "메시지"}` 한 가지 형태다.

| 항목 | 값 |
| --- | --- |
| 버전 | `0.1.0` |
| 기본 URL | `https://<your-host>` |
| 엔드포인트 | 122 |

## 인증

개인 API 토큰 chanho_pat_… 또는 세션 JWT. 모든 엔드포인트가 이 인증을 요구한다.

```http
Authorization: Bearer chanho_pat_…
```

## 리소스

| 리소스 | 설명 | 엔드포인트 |
| --- | --- | --- |
| [Admin](admin.md) | 감사 로그와 시스템 현황 — 전역 관리자 전용 | 2 |
| [Attachments](attachments.md) | 이슈 첨부 업로드·다운로드·삭제 | 5 |
| [Boards](boards.md) | 보드 정의와 보드에 걸리는 이슈 목록 | 6 |
| [Comments](comments.md) | 이슈 댓글과 멘션 | 4 |
| [Components](components.md) | 프로젝트 컴포넌트와 기본 담당자 | 4 |
| [Dashboards](dashboards.md) | 대시보드와 가젯 배치 | 5 |
| [Issue Archive](issue-archive.md) | 이슈 보관과 보관함 복원 | 3 |
| [Issue History](issue-history.md) | 이슈 변경 이력과 활동 피드 | 2 |
| [Issue Links](issue-links.md) | 이슈 사이의 연결(차단·복제 등) | 3 |
| [Issue Search](issue-search.md) | 조건 검색과 이슈 키 단건 조회 | 2 |
| [Issue Types](issue-types.md) | 이슈 타입 레지스트리와 사용량 | 6 |
| [Issues](issues.md) | 이슈 생성·수정·이동·순서 변경·가져오기 | 8 |
| [Link Types](link-types.md) | 이슈 연결 타입 레지스트리와 사용량 | 6 |
| [Notifications](notifications.md) | 알림함과 이슈 관심 등록 | 6 |
| [Personalization](personalization.md) | 개인 설정·프로젝트 바로 가기·공지 배너 | 8 |
| [Priorities](priorities.md) | 우선순위 레지스트리와 사용량 | 6 |
| [Project Settings](project-settings.md) | 프로젝트에 적용되는 설정 스킴과 개별 재정의 | 4 |
| [Projects](projects.md) | 프로젝트 생성·수정·보관·휴지통 | 10 |
| [Settings Schemes](settings-schemes.md) | 설정 스킴 정의와 기본 스킴 지정 | 6 |
| [Sprints](sprints.md) | 스프린트 계획·시작·완료 | 6 |
| [Status Categories](status-categories.md) | 상태 카테고리 레지스트리 | 5 |
| [Statuses](statuses.md) | 상태 레지스트리와 사용량 | 5 |
| [Versions](versions.md) | 릴리스 버전 관리와 배포 표시 | 6 |
| [Worklogs](worklogs.md) | 작업 시간 기록과 프로젝트 집계 | 4 |

## 공통 오류

오류 응답. 메시지는 한국어이며 화면에 그대로 노출된다.. 오류 응답 본문은 `PlatformError` 하나로 통일된다.

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `error` | `string` | 예 | 사용자에게 보여줄 오류 메시지 | `이슈를 찾을 수 없습니다` |
