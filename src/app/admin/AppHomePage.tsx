import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import AdminDashboardPage from './AdminDashboardPage';
import MemberHomePage from './MemberHomePage';
import { useAdminIdentity } from './adminStore';

/**
 * `/app` 인덱스 분기(§5.1) — 전역 관리자면 플랫폼 점검 대시보드, 아니면 바로가기 홈.
 *
 * 판정(`GET /api/org/me`)이 끝나기 전에는 어느 쪽도 그리지 않는다. 먼저 비관리자 홈을 띄웠다가
 * 대시보드로 바꾸면 관리자에게 화면이 두 번 바뀌고, 그 사이 관리 API 를 헛되이 부르게 된다.
 */
export default function AppHomePage() {
  const { isGlobalAdmin, loading } = useAdminIdentity();

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', width: '100%', py: 10 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }
  return isGlobalAdmin ? <AdminDashboardPage /> : <MemberHomePage />;
}
