# myFront — MSA Web Shell

[![CI](https://github.com/chanho4702/myFront/actions/workflows/ci.yml/badge.svg)](https://github.com/chanho4702/myFront/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Keycloak](https://img.shields.io/badge/Keycloak-SSO-4D4D4D?logo=keycloak&logoColor=white)

Spring Boot MSA 템플릿의 **React/Vite 프론트엔드 베이스**다. 게이트웨이(:8000) 주소 하나만
바라보고, 로그인은 Keycloak 리다이렉트(OIDC), 로그아웃은 백채널 방식으로 auth-server에
실제 연동돼 있다. 여기에 자신의 서비스 화면을 붙여 나가면 된다. 모든 UI는
[Material UI (MUI) v9](https://mui.com/) 기반이다.

3개 프론트 SSO 체제(**myFront :5173** / wiki :5174 / alm :5175)의 하나다. 전체 토폴로지는
[infra-settings](https://github.com/chanho4702/infra-settings) 참고.

> 작업 공간은 다섯 영역으로 나뉜다.
> - **`src/app`** — 실제 내 서비스 코드 (여기에 기능을 추가)
> - **`src/auth`** — 재사용 인증 모듈 (폴더째 복사해 다른 프로젝트에서 재사용)
> - **`src/notifications`** — 재사용 토스트 알림 모듈
> - **`src/site`** — 공개 제품 소개 사이트(홈·제품·기술·문의)와 동기화된 기술 노트
> - **`src/context`** — MUI 공식 템플릿 원본 (참고/재사용용, 수정하지 않음)

---

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 빌드 | [Vite 6](https://vite.dev/) + `@vitejs/plugin-react` |
| 언어 | TypeScript 5.7 (strict) |
| UI | React 19, MUI v9 (`@mui/material` `9.1`, `@mui/icons-material` `9.1`) |
| MUI X | `@mui/x-charts` · `-data-grid` · `-date-pickers` · `-tree-view` (모두 v9) |
| 라우팅 | `react-router-dom` v7 (`createBrowserRouter`) |
| 기타 | `dayjs`, `@react-spring/web`, Emotion (`@emotion/react`·`styled`) |

**요구 사항: Node 20+ (권장 24).** UI 테스트 러너·린터·포매터는 없다. 타입체크(`tsc -b`,
`strict`·`noUnusedLocals`·`noUnusedParameters`)가 빌드를 게이트하고, 노트 변환기는 Node 내장
테스트로 검증한다.

---

## 빠른 시작

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 → http://localhost:5173 (VSCode Live Server 아님)
```

| 스크립트 | 명령 | 설명 |
| --- | --- | --- |
| `npm run dev` | `vite` | 개발 서버 (HMR). |
| `npm run build` | `tsc -b && vite build` | 타입체크가 빌드를 게이트한다 |
| `npm run preview` | `vite preview` | 프로덕션 빌드 미리보기 |
| `npm run test:scripts` | `node --test ...` | 노트 변환기·문서 임포터 단위 테스트 |
| `npm run sync:docs` | `node scripts/sync-docs.mjs` | Obsidian 기술 노트를 공개 문서 위키(`/docs/`, docs 인스턴스)에 멱등 동기화. `DOCS_API`(기본 `http://127.0.0.1:19910`)·`DOCS_IMPORT_TOKEN`·`OBSIDIAN_VAULT` 환경변수, 매핑은 `scripts/docs-pages.json`(커밋) |

> **원커맨드 기동:** 상위 `../scripts/dev-up.ps1` 이 인프라(docker compose)를 올리고 프론트
> 3개를 Windows Terminal 탭(:5173 / :5174 / :5175, `--strictPort`)으로 연다. 백엔드는
> 각 repo의 IntelliJ 공유 Run Config로 기동한다. 상세는 상위 README 참고.

> **백엔드가 필요하다.** 인증·게시판이 실제로 동작하려면 게이트웨이(:8000) 뒤로
> auth-server(:9000)·board-service(:9100)가 떠 있어야 한다. 연동 주소는 `.env` 의
> `VITE_API_BASE` 로 지정한다(개발 기본값 `http://localhost:8000`).

---

## 환경변수 / 설정

`VITE_API_BASE` 하나로 게이트웨이 오리진을 지정한다(끝 슬래시는 자동 제거). 이 값이 인증
클라이언트(`authClient`)와 게시판 스토어(`boardStore`)의 base URL로 함께 쓰인다.

| 파일 | 값 | 용도 |
| --- | --- | --- |
| `.env` | `VITE_API_BASE=http://localhost:8000` | 개발 — 로컬 게이트웨이 직접 호출 |
| `.env.production` | `VITE_API_BASE=` (빈 값) | nginx 통합배포 — 같은 오리진 상대경로로 호출 |

프로덕션에서 값을 비우면 요청이 `/api/...` 상대경로로 나가, nginx가 단일 오리진에서
게이트웨이로 프록시하는 통합배포 구조에 맞는다.

---

## 인증 흐름 (Keycloak 리다이렉트 + 백채널 로그아웃)

프론트에는 **이메일/비밀번호 폼도, 회원가입 화면도 없다.** 로그인 버튼은 브라우저를
auth-server의 OIDC 시작점으로 통째로 리다이렉트한다.

**로그인 (리다이렉트)** — `src/app/pages/LoginPage.tsx`
- 버튼 클릭 → `rememberReturnTo(from)` 으로 돌아올 경로를 일회용 쿠키(`post_login_redirect`,
  max-age 300s)에 심고 → `window.location.href = loginUrl()` 로 이탈.
- `loginUrl()` = `{base}/oauth2/authorization/keycloak`,
  `googleLoginUrl()` = 거기에 `?kc_idp_hint=google`.
- Keycloak 로그인 후 auth-server가 `post_login_redirect` 쿠키(상대경로만 검증)를 읽어
  `/app` 등으로 되돌려보낸다. **별도 OAuth 콜백 페이지는 없다** — 앱이 다시 뜰 때
  `AuthProvider`가 마운트 시점 silent refresh로 세션을 복원한다.

**세션 모델** — `src/auth/client.ts`
- Access Token(AT)은 **인스턴스 메모리에만** 둔다(모듈 전역 싱글톤 없음).
- Refresh Token(RT)은 auth-server가 심는 **HttpOnly 쿠키**라 프론트가 직접 다루지 않는다.
- 새로고침하면 `tryRefresh()`(`POST /api/auth/refresh`, `credentials: 'include'`)가 RT 쿠키로
  새 AT를 받아 세션을 복원한다. 동시 다발 refresh는 in-flight dedup으로 1요청으로 합친다
  (StrictMode 이중 실행 + RT 회전 재사용탐지 충돌 방지).
- `apiFetch` 는 AT를 Bearer로 자동 첨부하고, 401이면 refresh 1회 후 재시도한다.

**로그아웃 (백채널)** — `client.logout()`
- `POST /api/auth/logout` 을 쳐 **auth-server가 서버-서버(백채널)로 Keycloak SSO 세션을
  끊고 RT 쿠키를 삭제**한다. 프론트는 브라우저 리다이렉트 없이 메모리 AT만 비우면 된다.
- 네트워크 실패해도 로컬 AT는 정리해(best-effort) 사용자를 로그아웃 상태로 만든다.
- `AppLayout` 의 로그아웃 버튼은 `logout()` 후 `/login` 으로 navigate한다.

**컨텍스트/가드**
- `AuthContext` — `useAuth()` → `{ user, isAuthenticated, loading, logout }`. `AuthProvider` 는
  `client` 를 주입받을 수 있어(기본은 이 앱 인스턴스) 다른 백엔드에 붙일 때 baseUrl만 바꾸면 된다.
- `ProtectedRoute` — 세션 복원 중엔 `fallback`(앱은 `AuthLoadingScreen` 주입), 미로그인 시
  `/login` 으로 보내며 원래 경로를 `state.from` 으로 넘긴다.
- `GuestRoute` — 반대. 이미 로그인한 사용자가 `/login` 에 오면 `from`(없으면 `/app`)으로 돌려보낸다.

> **재사용:** `src/auth` 폴더를 다른 프로젝트로 통째로 복사하고 `VITE_API_BASE`(또는
> `authClient.ts` 의 `baseUrl`)만 맞추면 그대로 동작한다. import는 항상 배럴(`src/auth`)에서 한다.
> 백엔드 계약(사용자 스키마/설정 키)은 `src/auth/types.ts` 에 모여 있다.

---

## API 호출 구조

모든 백엔드 호출은 **게이트웨이(`VITE_API_BASE`) 하나**로만 나간다. 게이트웨이가 경로별로
뒤 서비스에 라우팅한다.

| 경로 | 라우팅 대상 | 쓰는 곳 |
| --- | --- | --- |
| `/oauth2/authorization/keycloak` | auth-server (OIDC 시작) | 로그인 리다이렉트 |
| `/api/auth/refresh` · `/api/auth/logout` | auth-server | 세션 복원 / 백채널 로그아웃 |
| `/api/me` | auth-server | 로그인 사용자 조회(`fetchMe`) |
| `/api/board/posts` (GET/POST/PUT/DELETE) | board-service | 게시판 CRUD |

게시판(`board/boardStore.ts`)은 auth 인스턴스와 **같은 메모리 AT를 공유**한다(별도 인증
인스턴스 없음). 읽기(GET)는 public이라 토큰 없이도 되고, 쓰기만 Bearer를 붙이며 401이면
1회 refresh 후 재시도한다. 응답은 Spring Data `Page` 형태(`content`/`totalPages`/`number`…).
403/404는 `ApiError(status)` 로 구분해 페이지에서 처리한다.

---

## 화면 / 라우트

라우팅은 `src/main.tsx` (`createBrowserRouter`)에 중앙집중. 트리 전체는 `NotificationProvider`
→ `AuthProvider` 로 한 번 감싼다.

### 내 서비스 (`src/app`)
| 경로 | 화면 | 접근 |
| --- | --- | --- |
| `/login` | 로그인 — Keycloak / Google 리다이렉트 버튼 | 게스트 전용(`GuestRoute`) |
| `/app` | 대시보드 — 통계 카드·차트·데이터 그리드 | 보호(`ProtectedRoute`) |
| `/app/board` | 게시판 목록 — 페이지네이션 | 보호 |
| `/app/board/new` | 글쓰기 | 보호 |
| `/app/board/:id` | 글 보기 | 보호 |
| `/app/board/:id/edit` | 글 수정 | 보호 |
| `/designs` | 설계 문서 홈 (Confluence 스타일 중첩 레이아웃 + Outlet) | 조회 공개 |
| `/designs/:id` | 설계 문서 보기 | 조회 공개 |
| `/designs/new` · `/designs/:id/edit` | 설계 문서 작성/수정 | 보호 |
| `/profile` | 자기소개/이력 목록 | 조회 공개 |
| `/profile/:id` | 자기소개/이력 보기 | 조회 공개 |
| `/profile/new` · `/profile/:id/edit` | 자기소개/이력 작성/수정 | 보호 |

> `/app` 이하는 미로그인 시 `/login` 으로 리다이렉트된다. `/designs`·`/profile` 은 조회는
> 공개, 작성/수정만 개별 라우트에서 `ProtectedRoute` 로 보호한다.

### 공개 사이트 (`src/site`, `src/pages`)
| 경로 | 화면 |
| --- | --- |
| `/` | 제품 소개 홈 — 히어로·3대 제품 블록·오픈소스·FAQ |
| `/products` · `/products/:slug` | 제품 목록·상세 |
| `/tech` | 기술 스택과 아키텍처 소개 |
| `/tech/notes` · `/tech/notes/:id` | 구 노트 URL — 공개 문서 위키 `/docs/` 로 보내는 호환 리다이렉트 |
| `/contact` | 문의(이메일·GitHub) |
| `/services/:slug` | 기존 서비스 URL을 `/tech` 로 보내는 호환 리다이렉트 |
| `/templates` | 템플릿 허브 — MUI 템플릿·쇼케이스·카탈로그 통합 진입점 |
| `/showcase` | 라이브 컴포넌트 쇼케이스 — 동작하는 MUI 예제 |
| `/components` | 컴포넌트 카탈로그 — 전체 MUI 목록 + 공식 문서 링크 |

### 참고용 원본 템플릿 (`src/context`)
MUI 공식 템플릿을 그대로 둔 레퍼런스(수정 금지): `/sign-in`, `/sign-up`, `/sign-in-side`, `/dashboard`.

> 매칭되지 않는 경로는 **404**(`NotFoundPage`, `path: '*'`), 렌더링 중 오류는
> 각 라우트의 `errorElement`(`RouteErrorPage`)로 잡는다.

### 사이드 메뉴 (SSO 형제 앱 링크)
`AppMenuContent.tsx` 의 메뉴는 대시보드·게시판(라우터 내부 navigate)과 함께 **위키(`/wiki/`)·
ALM(`/alm/`)** 을 `href` 로 건다. 이들은 라우터 밖 별도 SPA라 전체 페이지 이동이며,
nginx 단일 오리진 통합배포에서만 유효하다.

---

## 디렉터리 구조

```
src/
├─ main.tsx                  # 라우터 + AuthProvider + NotificationProvider 진입점
│
├─ auth/                     # ★ 재사용 인증 모듈 (폴더째 복사 가능)
│  ├─ client.ts              #   createAuthClient({ baseUrl }) 팩토리 (loginUrl/apiFetch/refresh/logout/…)
│  ├─ authClient.ts          #   이 앱의 기본 인스턴스 (VITE_API_BASE)
│  ├─ AuthContext.tsx        #   AuthProvider + useAuth
│  ├─ ProtectedRoute.tsx     #   미로그인 시 /login 으로 가드
│  ├─ GuestRoute.tsx         #   로그인 상태로 /login 오면 되돌리는 가드
│  ├─ returnTo.ts            #   로그인 왕복용 돌아올 경로 쿠키(rememberReturnTo)
│  ├─ types.ts               #   백엔드 계약(AppUser/AuthClient/Config)
│  └─ index.ts               #   공개 표면(배럴) — 항상 여기서 import
│
├─ notifications/            # ★ 재사용 토스트 모듈 (폴더째 복사 가능)
│  └─ NotificationProvider.tsx   # NotificationProvider + useNotify (MUI Snackbar/Alert)
│
├─ app/                      # ★ 내 서비스 (여기에 기능 추가)
│  ├─ components/            #   앱 셸: AppLayout/AppSideMenu/AppNavbar/AppMenuContent/AuthLoadingScreen
│  ├─ pages/                 #   LoginPage, DashboardHome, NotFoundPage, RouteErrorPage
│  ├─ board/                 #   게시판 CRUD (boardStore → 게이트웨이 REST + List/Detail/Form)
│  ├─ designs/               #   설계 문서 (중첩 레이아웃 + designsStore, localStorage 데모)
│  └─ profile/               #   자기소개/이력 (profileStore, localStorage 데모)
│
├─ site/                     # 공개 제품·기술·소개 사이트
│  ├─ components/            #   SiteHeader·SiteFooter·공통 페이지 셸
│  ├─ pages/                 #   Products·Tech·Contact (+ /docs/ 리다이렉트)
│  ├─ content/               #   제품·스택·랜딩 데이터
│  └─ ui/                    #   공개 사이트 전용 표시 컴포넌트
│
├─ context/templates/        # ★ MUI 공식 템플릿 원본 (참고용, 수정 금지)
│  ├─ shared-theme/          #   AppTheme, 색상모드, 테마 커스터마이즈
│  ├─ sign-in / sign-up / sign-in-side
│  └─ dashboard/             #   사이드메뉴·차트·데이터그리드 등 구성요소
│
├─ pages/                    # 랜딩 홈(Home) + landing/ + 템플릿 허브·컴포넌트 브라우저
├─ showcase/                 # /showcase 의 카테고리별 라이브 예제
└─ data/components.ts        # /components 카탈로그 데이터
```

---

## 아키텍처 메모

### `context` vs `app` — 가장 중요한 관례
- **`src/context/templates`** 는 MUI v9 공식 템플릿 원본이다. **수정하지 않고** 필요한 부분만
  `import` 해서 재사용한다(테마, 사이드메뉴 구성요소, 대시보드 위젯 등).
- **`src/app`** 이 실제 서비스 코드다. `AppLayout`/`AppSideMenu` 는 참고 대시보드의 구성요소를
  가져다 쓰되 라우팅·인증을 연결한 "내 버전"이다.

### 데이터 레이어 — 진짜 API vs 데모
- **게시판(`board/boardStore.ts`)은 실제 게이트웨이 REST**(`/api/board/posts`)에 연결돼 있다.
  응답은 Spring Data `Page` 형태, 작성자는 서버가 토큰에서 박는다(`authorName`).
- **설계 문서(`designs/designsStore.ts`)·자기소개(`profile/profileStore.ts`)는 아직
  localStorage 데모**다(`myfornt.designs.docs` / `myfornt.profile.docs`, 시드 데이터 포함).
  함수 내부를 API 호출로 교체하면 화면 수정 없이 백엔드에 붙는다.

### 알림 / 에러 처리
- `notifications/NotificationProvider.tsx` — `useNotify()` → `success`/`error`/`info`/`warning`/`show`.
  큐형 MUI Snackbar/Alert 토스트.
- `app/pages/RouteErrorPage.tsx` — 모든 라우트의 `errorElement`. 렌더링 예외를 흰 화면 대신
  오류 페이지로 잡는다.
- `app/pages/NotFoundPage.tsx` — 매칭되지 않는 경로(`*`)의 404 페이지.

### 테마
- 라이트/다크/시스템 색상 모드는 `shared-theme/AppTheme`(MUI CSS 변수) + `ColorModeIconDropdown`
  으로 동작한다. `/app` 은 `AppLayout` 에서 테마를 **한 번만** 감싸고 MUI X 커스터마이즈
  (`xThemeComponents`)를 병합하며, 나머지 페이지는 각자 `AppTheme` 로 감싼다.

---

## 새 기능(페이지) 추가하는 법

게시판을 그대로 본떠 추가하면 된다.

1. `src/app/<feature>/` 에 페이지/스토어를 만든다 (`board/` 참고).
2. `src/main.tsx` 의 `/app` 하위 `children` 에 라우트를 추가한다.
3. `src/app/components/AppMenuContent.tsx` 의 `mainItems` 에 사이드 메뉴 항목을 추가한다.
4. (선택) 브레드크럼이 필요하면 `AppLayout.tsx` 의 `useCrumbs` 에 경로 분기를 추가한다.

> 리포지토리에는 이 흐름을 자동화하는 하네스(`add-feature-screen` 스킬)가 붙어 있다.
> `CLAUDE.md` 참고.

---

## MUI v9 주의사항

`Typography` · `Stack` · `styled(Stack)` 에서 **시스템 스타일 props 가 제거**되었다.
`fontWeight`, `alignItems`, `justifyContent` 등을 직접 prop으로 넘기면 빌드 에러(TS2769/TS2322)가
난다. **`sx={{ ... }}` 안에 넣어라.**

```tsx
// ❌ <Typography fontWeight={600} />        <Stack justifyContent="center" />
// ✅ <Typography sx={{ fontWeight: 600 }} /> <Stack sx={{ justifyContent: 'center' }} />
```

- `Stack` 의 `direction`/`spacing`/`useFlexGap` 는 그대로 쓸 수 있다.
- 새 `Grid` 는 `size={{ xs: 12 }}` 를 쓴다 (`item xs` 아님).

---

## 라이선스 / 출처

`src/context/templates` 는 [MUI 공식 템플릿](https://github.com/mui/material-ui)(MIT)을 기반으로 한다.
