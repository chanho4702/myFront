import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SectionLabel from './SectionLabel';

/**
 * 좌측 고정폭 라벨 컬럼 + 우측 콘텐츠. 상단 헤어라인으로 섹션을 나눈다.
 * 모바일에서는 라벨이 콘텐츠 위로 적층된다.
 */
export default function GridSection({
  id,
  index,
  label,
  title,
  caption,
  children,
}: {
  id?: string;
  index: string;
  label: string;
  title?: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" id={id} sx={{ borderTop: '1px solid', borderColor: 'divider', scrollMarginTop: '60px' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 12 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 6 }}>
          <Box sx={{ width: { md: 180 }, flexShrink: 0, pt: { md: 0.5 } }}>
            <SectionLabel index={index} label={label} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {title && (
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: 'clamp(1.6rem, 3.2vw, 2.1rem)', mb: caption ? 1.5 : 4 }}
              >
                {title}
              </Typography>
            )}
            {caption && <Typography sx={{ color: 'text.secondary', maxWidth: 620, mb: 4 }}>{caption}</Typography>}
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
