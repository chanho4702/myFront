# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 하네스: 기능 화면 빌드

**목표:** board 패턴을 본떠 새 기능 화면(store + 페이지 + 라우트/메뉴/브레드크럼 배선)을 생성-검증 에이전트 팀으로 추가한다.

**트리거:** 새 기능/화면/페이지 추가, CRUD 화면, "게시판처럼 ~" 같은 요청(및 그 후속 수정·재실행) 시 `add-feature-screen` 스킬을 사용하라. 단순 질문(파일 위치, 사용법)은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-20 | 초기 구성 (feature-builder + integration-qa 팀, feature-scaffold·mui-v9-usage·integration-check·add-feature-screen 스킬) | 전체 | - |

## Commands

```bash
npm run dev           # Vite dev server with HMR → http://localhost:5173 (NOT VSCode Live Server)
npm run build         # tsc -b (typecheck) && vite build — typecheck is part of build, so it gates builds
npm run preview       # serve the production build locally
npm run test:scripts  # node --test — scripts/ 아래 생성기(노트·문서·SEO·API 레퍼런스) 단위 테스트
```

There is no UI test runner (vitest 등), linter, or formatter configured — 도입하려면 사용자와 먼저 합의한다.
Type errors are the primary build gate (`tsc -b` with `strict`, `noUnusedLocals`, `noUnusedParameters`);
`npm run test:scripts` covers only the Node scripts. Requires Node 20+ (24 recommended).

`.env` 의 `VITE_API_BASE` 기본값은 dev 오프셋 게이트웨이 `http://localhost:18000` 이다(도커 게이트웨이는
호스트 포트를 발행하지 않는다 — 브라우저는 nginx :80 경유). `.env.production` 은 빈 값(같은 오리진 상대경로).

## Architecture

This is a React 19 + MUI v9 + Vite frontend template — a "web shell" meant to be forked and extended.
Routing is centralized in `src/main.tsx` (`createBrowserRouter`); the whole tree is wrapped once in
`AuthProvider`.

### The `context` vs `app` split — the most important convention

- **`src/context/templates/`** holds the unmodified MUI v9 official templates (shared-theme, sign-in,
  sign-up, sign-in-side, dashboard). **Do not edit these.** Import and reuse pieces from here (theme,
  side-menu components, dashboard widgets) instead of duplicating them.
- **`src/app/`** is the real service code. Components like `AppLayout`/`AppSideMenu` are "my version" —
  they pull components out of `context/templates/dashboard` but wire in this app's routing and auth.
- `src/pages/` (Home hub, ComponentsCatalog, ComponentsShowcase) and `src/showcase/` are a component
  browser, separate from both.

### Reusable `src/auth/` module (Keycloak OIDC 리다이렉트 + 백채널 로그아웃)

Self-contained auth module wired to auth-server (게이트웨이 경유). **Copy the whole `src/auth/`
folder into another project and only `VITE_API_BASE` (or `authClient.ts`'s `baseUrl`) needs to change.**
Always import from the barrel `src/auth` — never reach into internal files.

로그인은 **Keycloak 리다이렉트(OIDC) + 구글**로 확정이다(루트 CLAUDE.md 확정 설계 결정). 이메일/비밀번호 폼·
회원가입 화면·ROPC 를 다시 만들지 않는다.

- `client.ts` — `createAuthClient({ baseUrl })` factory. Each instance owns its own in-memory access
  token + in-flight refresh dedup (no module-level singletons), so multiple backends can coexist.
  Methods: `loginUrl`/`googleLoginUrl`(`{base}/oauth2/authorization/keycloak`, 구글은 `?kc_idp_hint=google`)/
  `apiFetch` (Bearer auto-attach + one 401→refresh retry)/`tryRefresh`/`fetchMe`/`logout`.
  AT lives in memory; RT is auth-server's HttpOnly cookie.
- `logout()` — `POST /api/auth/logout` 로 auth-server 가 **백채널(서버-서버)** 로 Keycloak 세션을 끊는다.
  프론트채널 `id_token_hint` 리다이렉트로 되돌리지 않는다.
- `authClient.ts` — this app's default instance (`baseUrl: VITE_API_BASE`).
- `AuthContext.tsx` — `AuthProvider` (accepts an optional `client` prop, defaults to `authClient`) +
  `useAuth()` → `{ user, isAuthenticated, loading, logout }`. Silent session restore on load via `tryRefresh`.
- `returnTo.ts` — `rememberReturnTo(path)` 가 돌아올 경로를 일회용 쿠키에 심는다(auth-server 가 로그인 후 읽음).
- `ProtectedRoute.tsx` / `GuestRoute.tsx` — guards (auth-only / guest-only). Both take a `fallback`
  prop for the restore state; the app passes the themed `AuthLoadingScreen` (no white flash).
- The only auth page is `src/app/pages/LoginPage.tsx` (`/login`) — "로그인"·"Google 로그인" 버튼이 브라우저를
  Keycloak 으로 통째로 보낸다. There is **no** OAuth callback page — auth-server redirects straight back
  (보통 `/app`) and `AuthProvider`'s mount-time silent refresh restores the session. The MUI `/sign-in`
  `/sign-up` routes are untouched **reference** templates, not real auth.

### Reusable `src/notifications/` module (toasts)

`NotificationProvider` (wraps the app in `main.tsx`) + `useNotify()` → `{ success, error, info, warning, show }`,
a queued MUI Snackbar/Alert. Copy the folder to reuse. Route-level errors render via `RouteErrorPage`
(`errorElement` on every route) and unknown paths hit `NotFoundPage` (`path: '*'`).

### Data layer (`src/app/<feature>/<feature>Store.ts`)

화면은 fetch 를 직접 부르지 않고 각 기능의 store 모듈만 거친다. 전부 게이트웨이 REST 다.

- `board/boardStore.ts` — board-service: 글 목록(`q` 검색 포함)·CRUD + 댓글 CRUD.
- `tokens/tokensStore.ts` — auth-server 개인 API 토큰(`/api/auth/tokens`): 목록·발급·라벨 변경·폐기(단건/전부).
- `admin/adminStore.ts` — 관리자 대시보드(헬스·제품 통계·감사), `agents/agentsStore.ts` — agent-service
  (페르소나·에이전트 토큰·러너·킬 스위치·예산/run/게이트 지표).
- `designs/`·`profile/` 은 localStorage 데모 store 다.

### Theme

Light/dark/system color modes come from `context/templates/shared-theme/AppTheme` (MUI CSS variables)
+ `ColorModeIconDropdown`. `/app` wraps the theme **once** in `AppLayout`; standalone pages each wrap
themselves in `AppTheme`. `AppLayout` also merges the MUI X customizations (charts/data-grid/
date-pickers/tree-view) into the theme via `xThemeComponents`.

## Adding a feature page

Mirror the board feature:

1. Create `src/app/<feature>/` with its pages + store (copy `board/`).
2. Add routes under the `/app` children array in `src/main.tsx`.
3. Add a side-menu entry to `mainItems` in `src/app/components/AppMenuContent.tsx`.
4. (Optional) Add a path branch to `useCrumbs` in `src/app/components/AppLayout.tsx` for breadcrumbs.

## MUI v9 gotcha

System style props were **removed** from `Typography`, `Stack`, and `styled(Stack)`. Passing
`fontWeight`, `alignItems`, `justifyContent`, etc. as direct props is a build error (TS2769/TS2322) —
put them inside `sx={{ ... }}`.

```tsx
// ❌ <Typography fontWeight={600} />        <Stack justifyContent="center" />
// ✅ <Typography sx={{ fontWeight: 600 }} /> <Stack sx={{ justifyContent: 'center' }} />
```

`Stack`'s `direction`/`spacing`/`useFlexGap` still work as direct props. The new `Grid` uses
`size={{ xs: 12 }}`, not `item xs`.
