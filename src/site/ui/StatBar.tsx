import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { StatItem } from '../types';

/** 수치 전면 노출 바. 숫자는 tabular-nums 로 자리를 고정한다. */
export default function StatBar({ items }: { items: StatItem[] }) {
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
      {items.map((item) => (
        <Box key={item.label} sx={{ borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 3.5 } }}>
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
