import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { GridSection, SpecTable, HairlineCard } from '../ui';
import { platformSpec, designSystemSpec, techGroups } from '../content';
import { DOCS_URL } from './DocsRedirect';

export default function TechPage() {
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

      {/* 노트 본문은 공개 문서 위키(/docs/)에 산다 — 이 사이트가 만든 WIKI 제품 위에 올린 것이 곧 데모다. */}
      <GridSection index="03" label="NOTES" title="엔지니어링 노트" caption="플랫폼을 만들며 남긴 기록. 인증·게이트웨이·통합배포·관측까지 시간순으로 이어진다.">
        <HairlineCard href={DOCS_URL}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 600 }}>엔지니어링 노트 — 위키 문서 사이트에서 읽기</Typography>
            <ArrowForwardRoundedIcon fontSize="small" sx={{ color: 'primary.main', flexShrink: 0 }} />
          </Stack>
        </HairlineCard>
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
