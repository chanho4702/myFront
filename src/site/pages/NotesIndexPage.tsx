import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SitePage from '../components/SitePage';
import { HairlineCard, MONO } from '../ui';
import { notes, allNoteTags } from '../content';

export default function NotesIndexPage() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => allNoteTags(), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => (tag ? n.tags.includes(tag) : true))
      .filter((n) => (q ? n.title.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)) : true))
      .slice()
      .reverse();
  }, [query, tag]);

  return (
    <SitePage>
      <Container maxWidth="md" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <Button component={RouterLink} to="/tech" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary', mb: 3, ml: -1 }}>
          기술
        </Button>
        <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(2rem, 5.5vw, 3rem)', lineHeight: 1.1 }}>
          엔지니어링 노트
        </Typography>
        <Typography sx={{ mt: 2, color: 'text.secondary', maxWidth: 620, lineHeight: 1.7 }}>
          플랫폼을 만들며 남긴 기록 {notes.length}편. 인증부터 관측까지 시간순으로 이어진다.
        </Typography>

        <Stack spacing={2} sx={{ mt: 5, mb: 4 }}>
          <TextField
            label="노트 검색"
            placeholder="제목·태그"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ maxWidth: 360 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label="전체"
              size="small"
              variant={tag === null ? 'filled' : 'outlined'}
              color={tag === null ? 'primary' : 'default'}
              onClick={() => setTag(null)}
              sx={{ borderRadius: '4px' }}
            />
            {tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                variant={tag === t ? 'filled' : 'outlined'}
                color={tag === t ? 'primary' : 'default'}
                onClick={() => setTag(tag === t ? null : t)}
                sx={{ borderRadius: '4px' }}
              />
            ))}
          </Box>
        </Stack>

        {visible.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', py: 6, textAlign: 'center' }}>
            조건에 맞는 노트가 없습니다. 검색어나 태그를 바꿔 보세요.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {visible.map((n) => (
              <HairlineCard key={n.id} to={`/tech/notes/${n.id}`}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline' }}>
                  <Typography
                    sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'primary.main', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                  >
                    NO.{n.id}
                  </Typography>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.5 }}>{n.title}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {n.date}
                      </Typography>
                      {n.tags.slice(0, 4).map((t) => (
                        <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderRadius: '4px', height: 20, fontSize: '0.7rem' }} />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </HairlineCard>
            ))}
          </Stack>
        )}
      </Container>
    </SitePage>
  );
}
