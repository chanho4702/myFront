import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SitePage from '../components/SitePage';
import { GridSection, StatBar, MONO } from '../ui';
import { career, caseStudies, stats } from '../content';

/**
 * 다이어그램 프레임. 컬럼 폭을 그대로 채우고 `aspectRatio` 로 원본 비율만큼 공간을 미리
 * 잡는다 — 고정 높이로 비율을 맞추던 이전 방식은 세로가 긴 이미지를 컬럼 폭의 13~20%로
 * 짓눌러 조밀한 라벨을 읽을 수 없게 만들었다(리뷰 지적). `bgcolor: 'background.paper'`
 * 는 다크모드에서 밝은 순백 여백이 남는 것을 막는다 — 수상 이미지처럼 자체 배경이 있는
 * 이미지도 프레임과 튀지 않는다. 조밀한 다이어그램은 컬럼 폭으로도 부족하므로 원본 크기
 * 보기 링크를 함께 둔다.
 */
function DiagramFrame({ src, alt, w, h }: { src: string; alt: string; w: number; h: number }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <CardMedia
        component="img"
        image={src}
        alt={alt}
        loading="lazy"
        sx={{ width: '100%', height: 'auto', aspectRatio: `${w} / ${h}`, display: 'block' }}
      />
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1.5, py: 1 }}>
        <Link href={src} target="_blank" rel="noopener" variant="caption" sx={{ color: 'text.secondary' }}>
          원본 크기로 보기
        </Link>
      </Box>
    </Box>
  );
}

export default function AboutPage() {
  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 5, md: 8 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3.5 }}>
          <Avatar alt="김찬호 프로필 사진" src="/profile.png" sx={{ width: 44, height: 44 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            김찬호 · 플랫폼 백엔드 엔지니어
          </Typography>
        </Stack>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.08 }}>
          소개
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 640, fontSize: '1.1rem', lineHeight: 1.7 }}>
          플랫폼을 설계하고, 데이터로 굴러가게 만들고, 팀이 더 빠르게 만들 환경까지 함께 세웁니다.
        </Typography>
      </Container>

      <GridSection index="01" label="RECORD" title="숫자로 본 기록">
        <StatBar items={stats} />
      </GridSection>

      <GridSection index="02" label="CAREER" title="커리어">
        <Box>
          {career.map((h, i) => (
            <Stack
              key={h.year}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.5, sm: 3 }}
              sx={{ py: 2.5, borderTop: i === 0 ? '1px solid' : 0, borderBottom: '1px solid', borderColor: 'divider', alignItems: { sm: 'baseline' } }}
            >
              <Typography sx={{ minWidth: 172, fontWeight: 700, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
                {h.year}
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>{h.text}</Typography>
            </Stack>
          ))}
        </Box>
      </GridSection>

      <GridSection index="03" label="CASE STUDIES" title="문제를 어떻게 시스템으로 바꿨는가" caption="문제 → 해결 → 성과.">
        <Stack spacing={{ xs: 6, md: 9 }}>
          {caseStudies.map((c) => (
            <Box key={c.title}>
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.18em', display: 'block' }}
              >
                {c.eyebrow}
              </Typography>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mt: 1.5, mb: 3, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                {c.title}
              </Typography>
              <Grid container spacing={{ xs: 3, md: 5 }}>
                <Grid size={{ xs: 12, md: c.images ? 7 : 12 }}>
                  <Stack spacing={2}>
                    {([['문제', c.problem], ['해결', c.solution], ['성과', c.result]] as const).map(([label, text]) => (
                      <Stack key={label} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: MONO,
                            fontWeight: 700,
                            color: label === '성과' ? 'primary.main' : 'text.secondary',
                            minWidth: 40,
                            pt: 0.4,
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.8,
                            color: label === '성과' ? 'text.primary' : 'text.secondary',
                            fontWeight: label === '성과' ? 500 : 400,
                          }}
                        >
                          {text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 3 }}>
                    {c.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" sx={{ borderRadius: '4px' }} />
                    ))}
                  </Box>
                </Grid>
                {c.images && (
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={2}>
                      {c.images.map((img) => (
                        <DiagramFrame key={img.src} src={img.src} alt={img.alt} w={img.w} h={img.h} />
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
        </Stack>
      </GridSection>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
