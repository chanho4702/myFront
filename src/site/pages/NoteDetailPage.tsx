import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SitePage from '../components/SitePage';
import { NoteBody, tableOfContents, MONO } from '../ui';
import { notes, getNote, getNoteBody } from '../content';
import NotFoundPage from '../../app/pages/NotFoundPage';

/** 데스크톱 전용 목차. 모바일에서는 숨긴다(본문 위 긴 링크 목록이 더 방해된다). */
function Toc({ markdown }: { markdown: string }) {
  const entries = tableOfContents(markdown);
  if (entries.length < 3) return null; // 항목이 적으면 목차가 소음이다
  return (
    <Box
      component="nav"
      aria-label="이 노트의 목차"
      sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 88, width: 220, flexShrink: 0 }}
    >
      <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.14em', color: 'text.secondary', mb: 1.5 }}>
        CONTENTS
      </Typography>
      <Stack spacing={0.75}>
        {entries.map((e) => (
          <Link
            key={e.id}
            href={`#${e.id}`}
            underline="hover"
            variant="body2"
            sx={{ color: 'text.secondary', pl: e.level === 3 ? 1.5 : 0, lineHeight: 1.5, '&:hover': { color: 'primary.main' } }}
          >
            {e.text}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const note = getNote(id);
  const body = id ? getNoteBody(id) : undefined;
  if (!note || body === undefined) return <NotFoundPage />;

  const at = notes.findIndex((n) => n.id === note.id);
  const prev = at > 0 ? notes[at - 1] : undefined;
  const next = at < notes.length - 1 ? notes[at + 1] : undefined;

  return (
    <SitePage>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 12 }, maxWidth: { lg: 1120 } }}>
        <Stack direction="row" spacing={6} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: 720 }}>
        <Button component={RouterLink} to="/tech/notes" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary', mb: 3, ml: -1 }}>
          노트 목록
        </Button>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'primary.main', letterSpacing: '0.1em' }}>
          NO.{note.id}
        </Typography>
        <Typography component="h1" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: '-0.025em', lineHeight: 1.2, fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)' }}>
          {note.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
            {note.date}
          </Typography>
          {note.status && <Chip label={note.status} size="small" variant="outlined" sx={{ borderRadius: '4px' }} />}
          {note.tags.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderRadius: '4px' }} />
          ))}
        </Stack>

        <Divider sx={{ my: { xs: 4, md: 5 } }} />

        <NoteBody markdown={body} />

        <Divider sx={{ my: { xs: 5, md: 7 } }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Box>
            {prev && (
              <Button component={RouterLink} to={`/tech/notes/${prev.id}`} startIcon={<ArrowBackRoundedIcon />} sx={{ textAlign: 'left' }}>
                NO.{prev.id} {prev.title}
              </Button>
            )}
          </Box>
          <Box>
            {next && (
              <Button component={RouterLink} to={`/tech/notes/${next.id}`} endIcon={<ArrowForwardRoundedIcon />} sx={{ textAlign: 'right' }}>
                NO.{next.id} {next.title}
              </Button>
            )}
          </Box>
        </Stack>
        </Box>

        <Toc markdown={body} />
        </Stack>
      </Container>
    </SitePage>
  );
}
