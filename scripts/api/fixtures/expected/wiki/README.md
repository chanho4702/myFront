> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# WIKI API

스페이스·페이지·첨부를 다루는 위키 서비스 API

| 항목 | 값 |
| --- | --- |
| 버전 | `0.1.0` |
| 기본 URL | `https://<your-host>` |
| 엔드포인트 | 13 |

## 인증

개인 API 토큰 `chanho_pat_…` 또는 세션 JWT. 모든 엔드포인트가 이 인증을 요구한다.

```http
Authorization: Bearer chanho_pat_…
```

## 리소스

| 리소스 | 설명 | 엔드포인트 |
| --- | --- | --- |
| [Attachments](attachments.md) | 페이지 첨부 파일 | 3 |
| [Pages](pages.md) | 페이지 조회·작성·수정 | 5 |
| [Spaces](spaces.md) | 스페이스(문서 묶음) 관리 | 5 |

## 공통 오류

공통 오류 응답(common-starter 계약). 오류 응답 본문은 `PlatformError` 하나로 통일된다.

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `error` | `string` | 예 | 사람이 읽는 오류 메시지 | `스페이스를 찾을 수 없습니다` |
