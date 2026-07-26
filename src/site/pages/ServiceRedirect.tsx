import { Navigate, useParams } from 'react-router-dom';
import { getCapability } from '../content';

/** 구 랜딩의 /services/:slug 링크를 살려둔다 — /tech 의 해당 역량 앵커로 보낸다. */
export default function ServiceRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const target = getCapability(slug) ? `/tech#cap-${slug}` : '/tech';
  return <Navigate to={target} replace />;
}
