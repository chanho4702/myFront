import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SpecRow } from '../types';

/** key/value 스펙 테이블. 값이 빈 행은 렌더하지 않는다(미확인 사실 금지 규칙). */
export default function SpecTable({ rows }: { rows: SpecRow[] }) {
  const visible = rows.filter((r) => r.value.trim() !== '');
  if (visible.length === 0) return null;
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      {visible.map((row) => (
        <Stack
          key={row.label}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.5, sm: 3 }}
          sx={{ py: 1.75, borderBottom: '1px solid', borderColor: 'divider', alignItems: { sm: 'baseline' } }}
        >
          <Typography
            sx={{
              width: { sm: 148 },
              flexShrink: 0,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'text.secondary',
              textTransform: 'uppercase',
            }}
          >
            {row.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            {row.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}
