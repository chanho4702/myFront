# API 가이드

플랫폼의 WIKI·ALM·Org API를 처음 붙이는 개발자를 위한 안내서다. 토큰 발급부터 요청·응답 규약, 오류 처리, 낙관적 락, 첨부 파일, 실전 예제까지 한 번에 읽을 수 있게 묶었다. 엔드포인트 하나하나의 파라미터와 스키마는 자동 생성되는 [API 레퍼런스](../api-reference/wiki/README.md)에 있고, 이 가이드는 그 레퍼런스를 "어떻게 쓰는가"를 다룬다.

## API가 다루는 것

| 영역 | 경로 접두어 | 내용 | 레퍼런스 |
|---|---|---|---|
| WIKI | `/api/wiki/**` | 스페이스, 계층형 페이지, 리비전, 첨부, 댓글, 라벨, PDF 내보내기 | [WIKI API](../api-reference/wiki/README.md) |
| ALM | `/api/alm/**` | 프로젝트, 이슈, 댓글, 워크로그, 스프린트, 보드, 버전, 설정 레지스트리 | [ALM API](../api-reference/alm/README.md) |
| Org | `/api/org/**` | 내 프로필, 멤버, 팀, 권한(grant), 초대, 아바타 | [Org API](../api-reference/org/README.md) |

세 영역 모두 같은 호스트의 게이트웨이를 지나며, 같은 토큰과 같은 오류 계약을 쓴다. 인증 자체(`/api/me`, 토큰 관리)는 인증 서버가 담당하며 [인증](./10-authentication.md) 문서에서 다룬다.

## 문서 구성

- **가이드**(이 폴더): 처음 붙일 때 순서대로 읽는 설명서. 규약·오류·락·파일 같은 공통 주제와 영역별 실전 예제.
- **레퍼런스**(`API 레퍼런스`): 서비스 코드의 OpenAPI에서 자동 생성한 엔드포인트별 표. 파라미터·요청/응답 필드·상태 코드의 정본이다. 가이드와 레퍼런스가 다르면 레퍼런스가 맞다.

| 순서 | 문서 | 내용 |
|---|---|---|
| 1 | [인증](./10-authentication.md) | 개인 API 토큰 발급·사용·폐기, 토큰 오류 |
| 2 | [요청·응답 규약](./20-conventions.md) | 기본 URL, JSON, ID·시간 형식, enum 표기, null, 페이지네이션, 정렬·필터, 멱등성 |
| 3 | [오류 처리](./30-errors.md) | 공통 오류 계약, 상태 코드별 대응, 409 사유, 429 |
| 4 | [낙관적 락](./40-concurrency.md) | `version` → `expectedVersion` → 409 → 재조회 흐름 |
| 5 | [첨부 파일](./50-files.md) | 업로드(multipart), 확정, 내려받기, 인라인, 크기 제한 |
| 6 | [실전 예제 — WIKI](./60-cookbook-wiki.md) | 스페이스 → 페이지 → 자식 → 수정 → 라벨 → PDF |
| 7 | [실전 예제 — ALM](./61-cookbook-alm.md) | 프로젝트 → 이슈 → 댓글 → 워크로그 → 상태·스프린트 → 검색 |
| 8 | [실전 예제 — Org](./62-cookbook-org.md) | 내 정보 → 멤버 → 팀 → 권한 → 초대 |
| 9 | [요청 제한](./70-rate-limits.md) | 토큰 요청의 초당 제한과 429 대응 |
| 10 | [레퍼런스 읽는 법](./80-reading-the-reference.md) | 생성된 레퍼런스 페이지의 표 읽는 법, 재생성 절차 |

## 5분 빠른 시작

아래 예시의 `https://<your-host>`는 플랫폼이 배포된 호스트로 바꾼다.

**1. 토큰을 만든다.** 로그인한 뒤 앱 셸의 `/app/tokens`에서 새 토큰을 발급한다. 토큰 전문(`chanho_pat_…`)은 발급 직후 한 번만 보이므로 바로 환경변수에 넣는다.

```bash
export PLATFORM_HOST="https://<your-host>"
export PLATFORM_TOKEN="chanho_pat_…"
```

**2. 내 계정을 확인한다.** 토큰이 살아 있고 올바르게 실렸는지 가장 빨리 확인하는 방법이다.

```bash
curl -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/me"
```

**3. 내가 볼 수 있는 위키 스페이스를 나열한다.** 응답은 `SpaceResponse` 배열이다.

```bash
curl -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/spaces"
```

```json
[
  {
    "id": 1,
    "key": "platform-ops",
    "name": "플랫폼 운영",
    "description": "배포·장애 대응 문서를 모은다",
    "ownerId": null
  }
]
```

여기까지 되면 나머지는 경로만 바꾸면 된다. 다음으로 [요청·응답 규약](./20-conventions.md)을 읽고, 필요한 영역의 [실전 예제](./60-cookbook-wiki.md)로 넘어간다.

## 한눈에 보는 규칙

| 항목 | 값 |
|---|---|
| 기본 URL | `https://<your-host>` |
| 인증 헤더 | `Authorization: Bearer chanho_pat_…` (개인 API 토큰) 또는 세션 JWT |
| 본문 형식 | JSON(UTF-8), 파일 업로드만 `multipart/form-data` |
| 오류 본문 | `{"error": "<메시지>"}` |
| ID | 숫자(int64). 인증 토큰 ID만 UUID |
| 시각 | ISO-8601 UTC, 예 `2026-09-01T09:00:00Z`. 날짜는 `YYYY-MM-DD` |
| 수정 충돌 | PUT 본문의 `expectedVersion`이 다르면 409 |
| 토큰 요청 제한 | 클라이언트 IP당 초당 20건(순간 40건), 초과 시 429 |
