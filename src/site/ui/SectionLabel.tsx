import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** `SEC.02 / PRODUCTS` 모노 라벨. 엔지니어링 그리드의 기본 표식. */
export default function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
      <Typography
        component="span"
        sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
      >
        SEC.{index}
      </Typography>
      <Typography
        component="span"
        sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'text.secondary', letterSpacing: '0.14em' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
