import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, GuestRoute } from './auth';
import { NotificationProvider } from './notifications';
import LoginPage from './app/pages/LoginPage';
import NotFoundPage from './app/pages/NotFoundPage';
import RouteErrorPage from './app/pages/RouteErrorPage';
import AppLayout from './app/components/AppLayout';
import AuthLoadingScreen from './app/components/AuthLoadingScreen';
import DashboardHome from './app/pages/DashboardHome';
import BoardListPage from './app/board/BoardListPage';
import BoardDetailPage from './app/board/BoardDetailPage';
import BoardFormPage from './app/board/BoardFormPage';
import TokensPage from './app/tokens/TokensPage';
import DesignsLayout from './app/designs/DesignsLayout';
import DesignsHome from './app/designs/DesignsHome';
import DesignsDetailPage from './app/designs/DesignsDetailPage';
import DesignsFormPage from './app/designs/DesignsFormPage';
import ProfileListPage from './app/profile/ProfileListPage';
import ProfileDetailPage from './app/profile/ProfileDetailPage';
import ProfileFormPage from './app/profile/ProfileFormPage';
import Home from './pages/Home';
import ProductsPage from './site/pages/ProductsPage';
import ProductDetailPage from './site/pages/ProductDetailPage';
import TechPage from './site/pages/TechPage';
import ServiceRedirect from './site/pages/ServiceRedirect';
import DocsRedirect from './site/pages/DocsRedirect';
import ContactPage from './site/pages/ContactPage';
import TemplatesHub from './pages/TemplatesHub';
import ComponentsCatalog from './pages/ComponentsCatalog';
import ComponentsShowcase from './pages/ComponentsShowcase';
// --- 참고 자료(reference): MUI 공식 템플릿 그대로. src/context/templates ---
import SignIn from './context/templates/sign-in/SignIn';
import SignUp from './context/templates/sign-up/SignUp';
import SignInSide from './context/templates/sign-in-side/SignInSide';
import Dashboard from './context/templates/dashboard/Dashboard';

const router = createBrowserRouter([
  // 내 서비스 (로그인/회원가입 -> 대시보드)
  { path: '/', element: <Home />, errorElement: <RouteErrorPage /> },

  // 제품 인덱스·상세. 조회 공개. (/services/:slug 는 Task 8에서 리다이렉트로 재도입)
  { path: '/products', element: <ProductsPage />, errorElement: <RouteErrorPage /> },
  { path: '/products/:slug', element: <ProductDetailPage />, errorElement: <RouteErrorPage /> },

  // 기술 페이지. 구 랜딩의 /services/:slug 링크는 /tech 의 역량 앵커로 리다이렉트한다.
  { path: '/tech', element: <TechPage />, errorElement: <RouteErrorPage /> },
  { path: '/services/:slug', element: <ServiceRedirect /> },

  // 엔지니어링 노트는 공개 문서 위키(/docs/, 라우터 밖 SPA)로 옮겼다. 구 링크가 살아 있도록 둘 다 유지.
  { path: '/tech/notes', element: <DocsRedirect /> },
  { path: '/tech/notes/:id', element: <DocsRedirect /> },

  // 소개 · 연락
  { path: '/contact', element: <ContactPage />, errorElement: <RouteErrorPage /> },

  {
    path: '/login',
    element: (
      <GuestRoute fallback={<AuthLoadingScreen />}>
        <LoginPage />
      </GuestRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute fallback={<AuthLoadingScreen />}>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'board', element: <BoardListPage /> },
      { path: 'board/new', element: <BoardFormPage /> },
      { path: 'board/:id', element: <BoardDetailPage /> },
      { path: 'board/:id/edit', element: <BoardFormPage /> },
      { path: 'tokens', element: <TokensPage /> },
    ],
  },

  // 나의 설계 문서 — Confluence 스타일 중첩 라우트 (레이아웃 + Outlet)
  // 조회(홈/상세) 공개, 작성/수정은 ProtectedRoute
  {
    path: '/designs',
    element: <DesignsLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DesignsHome /> },
      {
        path: 'new',
        element: (
          <ProtectedRoute fallback={<AuthLoadingScreen />}>
            <DesignsFormPage />
          </ProtectedRoute>
        ),
      },
      { path: ':id', element: <DesignsDetailPage /> },
      {
        path: ':id/edit',
        element: (
          <ProtectedRoute fallback={<AuthLoadingScreen />}>
            <DesignsFormPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 자기소개 및 이력 — 조회 공개, 작성/수정은 인증 필요
  { path: '/profile', element: <ProfileListPage />, errorElement: <RouteErrorPage /> },
  {
    path: '/profile/new',
    element: (
      <ProtectedRoute fallback={<AuthLoadingScreen />}>
        <ProfileFormPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  { path: '/profile/:id', element: <ProfileDetailPage />, errorElement: <RouteErrorPage /> },
  {
    path: '/profile/:id/edit',
    element: (
      <ProtectedRoute fallback={<AuthLoadingScreen />}>
        <ProfileFormPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
  },

  // 탬플릿 허브 (기존 MUI 템플릿·쇼케이스·카탈로그 통합 진입점)
  { path: '/templates', element: <TemplatesHub />, errorElement: <RouteErrorPage /> },

  // 컴포넌트 레퍼런스 / 라이브 쇼케이스
  { path: '/components', element: <ComponentsCatalog /> },
  { path: '/showcase', element: <ComponentsShowcase /> },

  // 참고용 원본 템플릿 (reference)
  { path: '/sign-in', element: <SignIn /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in-side', element: <SignInSide /> },
  { path: '/dashboard', element: <Dashboard /> },

  // 매칭되지 않는 모든 경로 → 404
  { path: '*', element: <NotFoundPage /> },
]);

/*
 * 프리렌더(scripts/prerender.mjs)가 구운 정적 HTML 위에서 뜨기 때문에 `#root` 는 비어 있지 않다.
 *
 * hydrateRoot 가 아니라 **createRoot + 수동 비우기**를 쓴다. 프리렌더 결과물은 SSR 마크업이 아니라
 * "브라우저에서 한 번 돌린 뒤 떠낸 DOM" 이라, Emotion 이 런타임에 만든 클래스 이름·MUI 색상 모드
 * 초기화 같은 것들이 하이드레이션 시점의 마크업과 결정적으로 일치한다는 보장이 없다. 어긋나면
 * React 는 조용히 트리를 버리거나(경고 폭탄) 화면이 이중으로 남는다. 컨테이너를 먼저 비우면
 * 항상 깨끗한 첫 렌더 한 번으로 끝난다 — 크롤러는 구운 HTML 을, 사람은 정상 SPA 를 본다.
 * (createRoot 도 첫 커밋에서 컨테이너를 비우지만, 명시적으로 비워 순서를 고정한다.)
 */
const rootEl = document.getElementById('root')!;
rootEl.replaceChildren();

createRoot(rootEl).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
