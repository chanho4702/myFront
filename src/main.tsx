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
import NotesIndexPage from './site/pages/NotesIndexPage';
import NoteDetailPage from './site/pages/NoteDetailPage';
import AboutPage from './site/pages/AboutPage';
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

  // 엔지니어링 노트 인덱스·본문. /tech/notes/:id 가 /tech/notes 보다 먼저 오면 안 된다.
  { path: '/tech/notes', element: <NotesIndexPage />, errorElement: <RouteErrorPage /> },
  { path: '/tech/notes/:id', element: <NoteDetailPage />, errorElement: <RouteErrorPage /> },

  // 소개 · 연락
  { path: '/about', element: <AboutPage />, errorElement: <RouteErrorPage /> },
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
