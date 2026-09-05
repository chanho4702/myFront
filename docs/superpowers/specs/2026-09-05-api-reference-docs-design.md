# API 레퍼런스 자동 문서 설계 — B단계

작성 2026-09-05. 사용자 결정: wiki·alm·org 세 서비스 먼저, 형식은 `/docs/` 위키 페이지 자동 생성(인터랙티브 UI는 후속). A단계(개인 API 토큰)는 `auth-server/docs/superpowers/specs/2026-09-05-personal-access-tokens-design.md`.

## 1. 목표 / 비목표
- 목표: 각 서비스 코드에서 OpenAPI 3 JSON을 뽑아, 리소스(태그)별 마크다운 페이지를 **생성**하고 공개 문서 위키(`/docs/`)의 "API 레퍼런스" 스페이스 트리로 동기화한다. 코드가 바뀌면 같은 명령으로 다시 생성한다(멱등).
- 비목표: Swagger UI/Scalar 화면, 요청 실행기, board·search·auth 서비스(후속), 영문판.

## 2. 서비스 쪽 (wiki-backend · alm-backend · platform-backend/org-service)
- 의존성 `org.springdoc:springdoc-openapi-starter-webmvc-api`(UI 없음). Boot 4.0.6과 맞는 springdoc 3.x 버전을 실제로 확인해 고정한다.
- 노출: `GET /v3/api-docs`(JSON). 각 서비스 `SecurityFilterChain`에서 `/v3/api-docs/**` permitAll. 게이트웨이·nginx는 `/v3`를 라우팅하지 않으므로 **클러스터 내부에서만** 보인다. wiki-backend의 `docs` 프로필 체인은 건드리지 않는다(공개 인스턴스는 스펙을 내지 않는다).
- 메타: `OpenAPI` 빈 — `info.title`(예: "WIKI API"), `info.version`(빌드 버전 또는 `0.1.0`), `info.description`(서비스 한 줄), `servers=[{url:"/"}]`, 보안 스킴 `bearerAuth`(http bearer, 설명 "개인 API 토큰 `chanho_pat_…` 또는 세션 JWT")를 전역 적용.
- 주석 규약(한국어, 한 줄): 컨트롤러마다 `@Tag(name, description)`(name은 영문 리소스명 — Spaces, Pages, Attachments…; description은 한국어), 엔드포인트마다 `@Operation(summary)`, 뜻이 안 드러나는 파라미터에 `@Parameter(description)`, DTO 핵심 필드에 `@Schema(description, example)`. 응답 코드는 코드가 실제로 내는 것만.
- 공통 오류: `OperationCustomizer`로 모든 오퍼레이션에 401·403(`{"error": string}`, common-starter 계약)을, `{id}` 경로에는 404를, 낙관적 락이 있는 PUT에는 409를 추가한다. 스키마 이름 `PlatformError`.
- 게이트: 각 리포 `gradlew test` 그린 + 부팅 후 `/v3/api-docs`가 200이고 태그 없는 오퍼레이션이 0개라는 테스트(MockMvc로 JSON을 읽어 `tags` 누락·`summary` 누락을 실패로).

## 3. 수집·생성 (myFront `scripts/api/`)
- `collect-openapi.mjs`: 서비스 목록 `{ id, title, host, port, prefix }` — wiki(`wiki-backend:9110`, `/api/wiki`), alm(`alm-backend:9120`, `/api/alm`인지 컨트롤러로 확인), org(`org-service:9130`, `/api/org`). 호스트에서 컨테이너 포트가 안 열려 있으므로 `docker run --rm --network <compose 네트워크> curlimages/curl:8.x -s http://<host>:<port>/v3/api-docs` 로 받는다(네트워크 이름은 `docker network ls`로 확인해 상수화). 결과를 `scripts/api/specs/<id>.json`에 **정렬·pretty**로 저장(커밋 — CI에는 컨테이너가 없다).
- `gen-reference.mjs`(순수 함수는 `scripts/api/lib.mjs`): 스펙 JSON → `docs/api-reference/<id>/README.md`(서비스 개요·인증·태그 목록) + `docs/api-reference/<id>/<tag-slug>.md`(태그 하나 = 페이지 하나). 페이지 구성: 태그 설명 → 엔드포인트 표(메서드·경로·요약) → 엔드포인트별 절: 경로/쿼리 파라미터 표(이름·위치·타입·필수·설명), 요청 본문(스키마 평탄화: 필드·타입·필수·설명·enum, `$ref` 2단계까지 펼치고 그 아래는 이름만), 응답(상태·설명·스키마), curl 예시(`https://<your-host>` + `-H "Authorization: Bearer chanho_pat_…"`, 본문 있으면 `@Schema example`로 만든 최소 JSON). 파일 첫 줄에 "자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것".
- 결정적 출력(정렬 고정)이라 diff가 코드 변경만 반영한다. 생성물은 커밋한다.
- 컬렉션: `collections.mjs`에 "API 레퍼런스" ← `myFront/docs/api-reference`(폴더 = 서비스, README = 폴더 본문). `docs/superpowers`는 포함하지 않는다.
- 스크립트: `npm run api:collect`, `npm run api:gen`, 기존 `npm run sync:docs`. 테스트: `scripts/api/*.test.mjs`(스키마 평탄화·slug·curl 예시·결정성) — `npm run test:scripts`에 포함.

## 4. 순서·게이트
1. 세 백엔드 springdoc ∥ 생성기(샘플 스펙으로 개발) — 병렬.
2. 백엔드 푸시·배포 후 `api:collect` → `api:gen` → `sync:docs` → `/docs/`에서 확인.
3. 리뷰: 생성 페이지가 실제 컨트롤러와 일치하는지 표본 대조(각 서비스 3개 엔드포인트), 내부 전용 엔드포인트(`/internal/**`, 액추에이터)가 문서에 새지 않는지.
