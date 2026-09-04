import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BRAND } from '../content';

/**
 * 브랜드 마크. 이름 첫 자음 ㅊ 을 기하학적으로 풀었다 —
 * 위의 점(짧은 획) · 가로획 · 위로 솟는 두 획. 쌓아 올리고 솟아오르는 형태라
 * "문서를 쌓는다 / 플랫폼 위에 올린다"는 제품 이야기와 겹친다.
 *
 * 색은 전부 테마 팔레트다(배경 primary.main · 획 contrastText). 다크모드에서 자동으로 따라간다.
 * `public/favicon.svg` 는 이 마크의 정적 복제본 — 모양을 바꾸면 둘 다 고친다.
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden
      sx={{ display: 'block', flexShrink: 0, color: 'primary.main' }}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <Box component="g" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" sx={{ stroke: (t) => t.vars!.palette.primary.contrastText }}>
        <path d="M13 8h6" />
        <path d="M9 13.5h14" />
        <path d="M16 15.5 9.5 25.5M16 15.5l6.5 10" />
      </Box>
    </Box>
  );
}

/** 마크 + 워드마크. 헤더·푸터가 같은 컴포넌트를 쓴다(로고가 화면마다 달라지지 않게). */
export default function BrandLogo({ size = 28, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <BrandMark size={size} />
      {wordmark && (
        <Typography
          component="span"
          sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'text.primary', fontSize: `${size * 0.68}px`, lineHeight: 1 }}
        >
          {BRAND}
        </Typography>
      )}
    </Stack>
  );
}
