import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { StatItem } from '../types';

/**
 * 수치 전면 노출 바. 숫자는 tabular-nums 로 자리를 고정한다.
 *
 * 테두리는 컨테이너가 top·left, 각 칸이 right·bottom 을 맡아 내부 seam 을 한 요소만 그린다
 * (이중선 방지). xs 는 2열 고정이므로 항목이 홀수면 마지막 행에 한 칸만 남아 우측·하단
 * 모서리가 뚫린다 — 마지막 칸을 2열로 늘려 행을 채운다. md 는 항목 수만큼 열을 만들어
 * 항상 정확히 나누어떨어진다.
 */
export default function StatBar({ items }: { items: StatItem[] }) {
  const oddOnMobile = items.length % 2 === 1;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${items.length}, 1fr)` },
        borderTop: '1px solid',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      {items.map((item, i) => (
        <Box
          key={item.label}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 2, md: 3 },
            py: { xs: 2.5, md: 3.5 },
            gridColumn: { xs: oddOnMobile && i === items.length - 1 ? 'span 2' : 'auto', md: 'auto' },
          }}
        >
          <Typography
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', lineHeight: 1.1 }}
          >
            {item.value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
