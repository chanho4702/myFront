import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SitePage from '../components/SitePage';
import { SpecTable } from '../ui';
import { CONTACT_EMAIL, GITHUB_URL, openSource } from '../content';

export default function ContactPage() {
  return (
    <SitePage>
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 14 } }}>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2rem, 5.5vw, 3rem)', lineHeight: 1.12 }}>
          궁금한 점이 있으신가요?
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 560, fontSize: '1.1rem', lineHeight: 1.7 }}>
          기능 제안·버그 제보는 해당 저장소의 GitHub 이슈로, 도입·협업 문의는 이메일로 보내주세요.
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 5, mb: 7 }}>
          <Button variant="contained" size="large" href={`mailto:${CONTACT_EMAIL}`} startIcon={<EmailRoundedIcon />} sx={{ borderRadius: 999 }}>
            이메일 보내기
          </Button>
          <Button variant="outlined" size="large" href={GITHUB_URL} target="_blank" rel="noopener" startIcon={<GitHubIcon />} sx={{ borderRadius: 999 }}>
            GitHub
          </Button>
        </Stack>

        <SpecTable
          rows={[
            { label: 'Email', value: CONTACT_EMAIL },
            { label: 'GitHub', value: GITHUB_URL.replace(/^https?:\/\//, '') },
            ...openSource.repos.map((r) => ({ label: r.name, value: r.url.replace(/^https?:\/\//, '') })),
          ]}
        />
      </Container>
    </SitePage>
  );
}
