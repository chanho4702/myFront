import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import SitePage from '../components/SitePage';
import { SpecTable } from '../ui';
import { CONTACT_EMAIL, GITHUB_URL, PORTFOLIO_URL } from '../content';

export default function ContactPage() {
  return (
    <SitePage>
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 14 } }}>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2rem, 5.5vw, 3rem)', lineHeight: 1.12 }}>
          함께 일할 사람을 찾고 계신가요?
        </Typography>
        <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 560, fontSize: '1.1rem', lineHeight: 1.7 }}>
          플랫폼을 설계하고, 데이터로 굴러가게 만들고, 팀이 더 빠르게 만들 환경까지 함께 세울 사람입니다.
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mt: 5, mb: 7 }}>
          <Button variant="contained" size="large" href={`mailto:${CONTACT_EMAIL}`} startIcon={<EmailRoundedIcon />} sx={{ borderRadius: '4px' }}>
            이메일 보내기
          </Button>
          <Button variant="outlined" size="large" href={PORTFOLIO_URL} target="_blank" rel="noopener" startIcon={<LaunchRoundedIcon />} sx={{ borderRadius: '4px' }}>
            포트폴리오
          </Button>
          <Button variant="outlined" size="large" href={GITHUB_URL} target="_blank" rel="noopener" startIcon={<GitHubIcon />} sx={{ borderRadius: '4px' }}>
            GitHub
          </Button>
        </Stack>

        <SpecTable
          rows={[
            { label: 'Email', value: CONTACT_EMAIL },
            { label: 'GitHub', value: 'github.com/chanho4702' },
            { label: '현재', value: '디무브 재직 중 — 서버리스 SaaS RMS 플랫폼 설계·구현' },
          ]}
        />
      </Container>
    </SitePage>
  );
}
