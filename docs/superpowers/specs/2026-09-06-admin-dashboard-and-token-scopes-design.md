# 관리자 대시보드 + 개인 API 토큰 스코프 설계

- 날짜: 2026-09-06
- 사용자 결정: "다 해. 메인 서비스에 부하 안 가는 선에서 종합 모니터링 페이지."
- 범위: auth-server(스코프) · gateway-server(스코프 강제 + 헬스 집계) · 7개 Spring 서비스(Actuator health 내부 노출) · wiki-backend/org-service(현황 통계) · myFront(`/app` 관리자 대시보드, 토큰 스코프 UI) · infra(문서)

## 0. 부하 원칙 (모든 롤 공통)

- 헬스 프로브는 **게이트웨이가 20초 캐시**로 한 번만 돈다. 화면을 몇 명이 보든 서비스가 받는 프로브는 20초당 1회를 넘지 않는다. 프로브 타임아웃 3초, 전부 병렬.
- 통계 엔드포인트는 **COUNT 수준의 가벼운 질의만** 쓰고 서버에서 **60초 캐시**(Caffeine)한다. 본문 스캔·조인 집계·정렬 페이지네이션 금지.
- 화면 폴링: 헬스 60초, 통계는 진입 시 1회 + 수동 새로고침. 탭이 숨겨지면(`document.hidden`) 폴링 중단.
- Actuator는 **내부 네트워크 전용**이다. 게이트웨이 라우트는 `/api/**`뿐이라 외부에서 `/actuator/**`에 닿을 수 없고, nginx도 `/api|oauth2|login|invite|.well-known/`만 넘긴다. 각 서비스의 SecurityFilterChain에서 `/actuator/health`·`/actuator/info`만 permitAll.

## 1. PAT 스코프

### 1.1 스코프 집합
`wiki:read` `wiki:write` `alm:read` `alm:write` `org:read` `org:write` `admin`. `*:write`는 같은 제품의 `read`를 포함한다. `admin`은 각 서비스의 `/api/*/admin/**`, `/api/migration/**`, `/api/agent/**`에 필요하다(제품 스코프와 별개로 추가 요구).

### 1.2 auth-server
- V5: `personal_access_tokens.scopes VARCHAR(255) NOT NULL` — 쉼표 구분 문자열. 기존 행은 전체 스코프(7개 모두)로 채운다(현재 동작 유지).
- `POST /api/auth/tokens` 요청에 `scopes: string[]` 필수. 비었으면 400 `scopes_required`, 모르는 값이면 400 `scopes_invalid`. 정규화: 중복 제거·정렬. `TokenView`/`CreatedView`에 `scopes` 포함.
- 교환 JWT(`provider=PAT`)에 `scope` 클레임(문자열 배열). 세션 JWT에는 넣지 않는다.
- `GET /internal/pat/stats`(X-Internal-Secret): `{activeTokens, usersWithTokens, expiringWithin7Days}` — 활성=미폐기·미만료. 게이트웨이 관리자 대시보드가 쓴다.
- Actuator health/info 내부 노출(§3).

### 1.3 gateway-server — `PatScopeWebFilter`
- PAT 교환 필터 바로 뒤(@Order(-100)). 교환된 JWT의 `provider=PAT`일 때만 동작. `scope` 클레임이 없으면(구버전 토큰) 통과.
- 경로→제품: `/api/wiki/**`→wiki, `/api/alm/**`→alm, `/api/org/**`→org. `/api/me`는 항상 허용. `/api/*/admin/**`, `/api/migration/**`, `/api/agent/**`는 `admin` 추가 요구. 그 외 접두사(`/api/board/**`, `/api/auth/**` 등)는 PAT에 **거부**(auth는 PatJwtGuardFilter가 이미 tokens/agents를 막지만 게이트웨이에서도 닫는다).
- 읽기 = GET/HEAD/OPTIONS, 쓰기 = 나머지. 부족하면 403 `{"error":"insufficient_scope"}` (기존 `invalid_token`·`auth_unavailable`과 같은 본문 형식).
- 게이트웨이의 교환 캐시는 JWT 문자열을 캐시하므로 스코프는 JWT 안에 있다 — 캐시 구조 변경 없음.

## 2. 헬스 집계 + 관리자 API (gateway-server)

### 2.1 관리자 판정
`/api/platform/**`는 로그인 JWT 필수(기존 early-block) + **전역 관리자**만. 판정은 org-service `GET /api/org/me`를 사용자 Authorization 그대로 전달해 `globalRoles`에 `ADMIN`이 있는지 본다. 결과는 `sub` 기준 30초 캐시. org 불능이면 503 `{"error":"org_unavailable"}`. PAT(provider=PAT)는 `admin` 스코프가 있어도 `/api/platform/**` 금지(관리 화면 전용).

### 2.2 `GET /api/platform/health`
응답:
```json
{ "checkedAt": "ISO", "cacheTtlSeconds": 20,
  "components": [ { "id": "wiki-backend", "name": "WIKI 백엔드", "group": "service|infra",
                    "status": "UP|DEGRADED|DOWN|UNKNOWN", "latencyMs": 12, "version": "1.4.0",
                    "detail": "짧은 사유(선택)" } ] }
```
프로브 대상(도커 네트워크 이름, 설정으로 덮어쓰기 가능 `platform.health.targets.*`):

| id | 프로브 |
|---|---|
| gateway-server | 자기 자신(항상 UP, 버전은 build-info) |
| auth-server | `http://auth-server:9000/actuator/health` |
| org-service | `http://org-service:9130/actuator/health` |
| wiki-backend | `http://wiki-backend:9110/actuator/health` |
| alm-backend | `http://alm-backend:9120/actuator/health` |
| agent-service | `http://agent-service:9160/actuator/health` |
| migration-service | `http://migration-service:9170/actuator/health` |
| board-service | `http://board-service:9100/actuator/health` |
| docs-backend | `http://docs-backend:9110/actuator/health` |
| collaboration-service | `http://collaboration-service:9150/health` |
| keycloak | `http://keycloak:9000/health/ready` (KC 26 관리 포트, `KC_HEALTH_ENABLED=true` 이미 켜짐) |
| postgres | 직접 프로브 없음 — Spring 서비스 health의 `components.db` 상태를 모아 판정(하나라도 DOWN이면 DEGRADED, 전부 DOWN이면 DOWN) |
| redis | 같은 방식으로 `components.redis` |
| minio | `http://minio:9000/minio/health/live` |
| opensearch | `http://opensearch:9200/_cluster/health` (green/yellow=UP, red=DEGRADED) |
| loki | `http://loki:3100/ready` |
| grafana | `http://grafana:3000/api/health` |
| eureka | `http://eureka:8761/actuator/health` (없으면 `/` 200) |

- Actuator 응답은 `show-details: always`로 받아 `components.db`/`redis`를 읽는다. 버전은 `/actuator/info`의 `build.version`(같은 캐시 주기, 실패해도 상태에는 영향 없음).
- 전체 결과 20초 캐시 + in-flight 공유(동시 요청이 프로브를 중복 시작하지 않게).

### 2.3 `GET /api/platform/stats/tokens`
auth-server `/internal/pat/stats`를 내부 시크릿으로 호출해 그대로 돌려준다. 60초 캐시.

## 3. Actuator 공통 (7개 Spring 서비스 + gateway)
- 의존성 `spring-boot-starter-actuator`. `management.endpoints.web.exposure.include: health,info`, `management.endpoint.health.show-details: always`, `management.info.build.enabled: true`(gradle `springBoot { buildInfo() }`), health group 없음.
- 보안: `/actuator/health`, `/actuator/info` permitAll. 나머지 `/actuator/**`는 노출하지 않는다(exposure에 없음).
- docs 프로필(wiki-backend DocsSecurityConfig)도 같은 두 경로만 permitAll — `anyRequest().denyAll()` 앞에 둔다.
- Redis/DB health 인디케이터는 auto-config 기본값 사용. 외부 의존(OpenSearch·MinIO·gRPC)은 health에 넣지 않는다(프로브가 부하가 되면 안 된다).

## 4. 현황 통계

### 4.1 wiki-backend `GET /api/wiki/admin/stats`
전역 관리자만(`AccessScope.all()`이 true — 기존 `/api/wiki/audit/**`와 같은 판정). 60초 캐시.
```json
{ "spaces": 12, "pages": 1834, "draftPages": 40, "trashedPages": 7, "revisions": 15220,
  "attachments": 310, "attachmentBytes": 123456789, "editsLast7Days": 96, "comments": 420 }
```
`editsLast7Days` = 최근 7일 리비전 수. 인덱스가 없어도 리비전 수십만 건까지는 밀리초 단위이므로 새 인덱스를 만들지 않는다.

### 4.2 org-service `GET /api/org/admin/stats`
전역 관리자만(`permissions.requireGlobalAdmin`). 60초 캐시.
```json
{ "members": {"ACTIVE": 31, "PENDING": 2, "SUSPENDED": 1, "DEACTIVATED": 4}, "agents": 3,
  "teams": 6, "pendingInvitations": 2 }
```

### 4.3 alm-backend
기존 `GET /api/alm/admin/stats` 그대로. 60초 Caffeine 캐시만 추가(현재 매 호출 COUNT 5개).

## 5. myFront

### 5.1 관리자 판정과 라우팅
- `src/app/admin/adminStore.ts`: `fetchOrgMe()` = `GET /api/org/me` → `isGlobalAdmin = globalRoles.includes('ADMIN')`. 세션당 1회, 실패 시 비관리자.
- `/app` 인덱스: 관리자 → `AdminDashboardPage`, 비관리자 → `MemberHomePage`(위키·ALM·API 토큰·프로필 바로가기 카드만). 사이드 메뉴 "대시보드" 라벨은 관리자에게 "관리자 대시보드".
- 기존 `DashboardHome`(MUI 샘플 MainGrid)은 제거.

### 5.2 AdminDashboardPage 구성(위→아래)
1. **헤더**: "플랫폼 점검" + 마지막 점검 시각 + 새로고침 버튼 + 자동 갱신 토글(기본 켬, 60초).
2. **시스템 상태 요약 칩**: 전체 UP n / DEGRADED n / DOWN n.
3. **컴포넌트 표**(단순 MUI `Table`): 그룹(서비스/인프라) · 이름 · 상태(색+아이콘+텍스트, 색만으로 구분 금지) · 응답시간 · 버전 · 상세. DOWN 행 상단 정렬.
4. **현황 카드 3열**: WIKI(스페이스·페이지·리비전·첨부 용량·7일 편집) / ALM(프로젝트·이슈·첨부·용량·감사 로그) / 조직·토큰(멤버 상태별·대기 초대·팀·활성 토큰·7일 내 만료). 각 카드는 자기 API 실패를 카드 안에 에러 상태로 표시(다른 카드에 영향 없음).
5. **최근 활동**: 위키 감사 + ALM 감사(`GET /api/alm/admin/audit?size=10`) 합쳐 시각 내림차순 20건. 엔드포인트 파라미터는 레퍼런스 문서(`docs/api-reference`) 기준으로 맞춘다.
6. **점검 도구 바로가기**: Keycloak 콘솔, 위키 `/wiki/admin/org`·`/wiki/admin/search`·`/wiki/admin/migrations`, ALM 설정 `/alm/settings/org`, MinIO 콘솔·Grafana(둘 다 **내부 네트워크 전용** — `http://<현재 호스트>:9001`, `:3000`, 라벨에 "내부망" 표기. nginx 뒤로 공개하지 않는다: Grafana가 익명 Admin이라 공개하면 안 된다).

### 5.3 토큰 스코프 UI
- 발급 다이얼로그: 제품별(WIKI·ALM·조직) 읽기/쓰기 체크 + "관리자 API" 체크. 기본값 읽기 3개. 쓰기 체크 시 읽기 자동 체크·비활성. 하나도 없으면 발급 버튼 비활성 + 안내.
- 목록: 스코프 칩(예: `wiki:write` `alm:read` `admin`). 툴팁에 의미.
- `tokensStore.ts`: `ApiToken.scopes: string[]`, `CreateTokenInput.scopes`, 오류 메시지 `scopes_required`/`scopes_invalid`.

### 5.4 문서
- `docs/api-guide/10-authentication.md`에 "스코프" 절: 표(스코프·허용 경로·메서드), 403 `insufficient_scope` 예시, 관리자 API는 `admin` 필요.
- `docs/api-guide/30-errors.md` 오류표에 `insufficient_scope` 추가.

## 6. 테스트·게이트
- auth-server/gateway/wiki/org/alm: gradle test 그린(서비스별 격리 복사본 또는 worktree). 게이트웨이 스코프 필터·헬스 집계는 WebTestClient + MockWebServer/가짜 클라이언트로 단위 테스트.
- myFront: `npm run build` + `npm run test:scripts`. 리포 규약상 React 테스트 러너가 없으므로 순수 로직(스코프 체크 상태 계산, 상태 정렬·요약)은 `*.logic.ts`로 분리해 읽기 쉽게 두되 빌드 게이트만 적용.
- 배포 후 실측: 관리자 계정으로 `/app` 대시보드, 비관리자로 간단 홈, 스코프 `wiki:read` 토큰으로 wiki POST → 403 `insufficient_scope`.

## 7. 커밋 규율
공유 체크아웃(wiki-backend는 다른 세션이 V38 작업 중) — **worktree**에서 작업하고 파일 지정 스테이징만. `git add -A` 금지. main 푸시는 배포 트리거이므로 게이트 통과 후에만.
