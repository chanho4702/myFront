import { Navigate } from 'react-router-dom';

/** 구 랜딩의 /services/:slug 링크를 살려둔다 — 역량 앵커는 사라졌으니 /tech 로 보낸다. */
export default function ServiceRedirect() {
  return <Navigate to="/tech" replace />;
}
