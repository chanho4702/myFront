import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';

/**
 * 그림자 없는 아웃라인 카드. hover 는 border-color 만 바꾼다 —
 * transform 이동을 쓰지 않아 레이아웃이 흔들리지 않는다.
 *
 * hover 규칙은 링크일 때만 건다. to/href 가 없으면 클릭도 포커스도 안 되는 정적 카드인데,
 * hover 에 반응하면 마우스 사용자에게 누를 수 있다는 잘못된 신호를 준다.
 *
 * href 는 새 탭을 여는 게 기본이지만, 같은 오리진의 형제 앱(`/docs/` 같은 라우터 밖 SPA)은
 * 같은 탭에서 이동한다 — 사이트 안을 돌아다니는데 탭이 늘어나면 안 된다.
 */
const isExternal = (href: string) => /^[a-z]+:/i.test(href);

export default function HairlineCard({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
}) {
  const interactive = Boolean(to || href);
  const body = <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}>{children}</CardContent>;
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: '4px', // 테마 shape.borderRadius 는 8 — 엔지니어링 그리드는 4 로 조인다
        boxShadow: 'none',
        borderColor: 'divider',
        transition: (theme) => theme.transitions.create('border-color', { duration: 150 }),
        ...(interactive && { '&:hover': { borderColor: 'primary.main' } }),
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
          {body}
        </CardActionArea>
      ) : href ? (
        <CardActionArea
          component="a"
          href={href}
          {...(isExternal(href) ? { target: '_blank', rel: 'noopener' } : {})}
          sx={{ height: '100%' }}
        >
          {body}
        </CardActionArea>
      ) : (
        body
      )}
    </Card>
  );
}
