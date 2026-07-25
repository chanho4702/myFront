import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';

/**
 * 그림자 없는 아웃라인 카드. hover 는 border-color 만 바꾼다 —
 * transform 이동을 쓰지 않아 레이아웃이 흔들리지 않는다.
 */
export default function HairlineCard({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
}) {
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
        '&:hover': { borderColor: 'primary.main' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
          {body}
        </CardActionArea>
      ) : href ? (
        <CardActionArea component="a" href={href} target="_blank" rel="noopener" sx={{ height: '100%' }}>
          {body}
        </CardActionArea>
      ) : (
        body
      )}
    </Card>
  );
}
