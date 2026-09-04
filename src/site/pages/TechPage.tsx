import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, SpecTable, HairlineCard, MONO } from '../ui';
import { platformSpec, designSystemSpec, techGroups, notes } from '../content';

export default function TechPage() {
  const latest = notes.slice(-3).reverse();

  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 5, md: 8 } }}>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.08 }}>
          기술
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 640, fontSize: '1.1rem', lineHeight: 1.7 }}>
          이 사이트가 올라가 있는 플랫폼의 실제 구성과, 그것을 만들면서 남긴 기록.
        </Typography>
      </Container>

      <GridSection index="01" label="PLATFORM" title="플랫폼 구성" caption="WIKI · ALM · 이 사이트가 공유하는 골격.">
        <SpecTable rows={platformSpec} />
      </GridSection>

      <GridSection index="02" label="DESIGN SYSTEM" title="공유 디자인 시스템" caption="세 프론트가 같은 얼굴을 갖게 하는 레이어. 값(토큰)과 그 값을 쓰는 컴포넌트를 따로 버전 관리한다.">
        <SpecTable rows={designSystemSpec} />
      </GridSection>

      <GridSection
        index="03"
        label="NOTES"
        title="엔지니어링 노트"
        caption={`플랫폼을 만들며 남긴 기록 ${notes.length}편. 인증·게이트웨이·통합배포·관측까지 시간순으로 이어진다.`}
      >
        <Stack spacing={1.5}>
          {latest.map((n) => (
            <HairlineCard key={n.id} to={`/tech/notes/${n.id}`}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }} sx={{ alignItems: { sm: 'baseline' } }}>
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.75rem',
                    color: 'primary.main',
                    fontVariantNumeric: 'tabular-nums',
                    width: { sm: 64 },
                    flexShrink: 0,
                  }}
                >
                  NO.{n.id}
                </Typography>
                <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>{n.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                  {n.date}
                </Typography>
              </Stack>
            </HairlineCard>
          ))}
        </Stack>
        <Button component={RouterLink} to="/tech/notes" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, ml: -1 }}>
          노트 전체 보기
        </Button>
      </GridSection>

      <GridSection index="04" label="STACK" title="기술 스택">
        <Grid container spacing={{ xs: 3.5, md: 4 }}>
          {techGroups.map((g) => (
            <Grid key={g.category} size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5 }}>
                {g.category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {g.items.map((item) => (
                  <Chip key={item} label={item} size="small" variant="outlined" sx={{ borderRadius: '4px' }} />
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </GridSection>
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
    </SitePage>
  );
}
