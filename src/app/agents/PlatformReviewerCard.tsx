import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNotify } from '../../notifications';
import {
  clearPlatformReviewSetting,
  getPlatformReviewSetting,
  isPlatformReviewerCandidate,
  savePlatformReviewSetting,
  type Persona,
  type PlatformReviewSetting,
  type ReviewerSource,
} from './agentsStore';

/** Select 빈 문자열 대신 쓰는 "고르지 않음" 값. */
const NO_PICK = 'none';

/** 리뷰어 출처 — 아이콘 + 텍스트(색만으로 구분하지 않는다). */
const SOURCE_CHIP: Record<
  ReviewerSource,
  { label: string; icon: React.ReactElement; color: 'info' | 'default' | 'warning' }
> = {
  PLATFORM: { label: '전역 지정', icon: <PublicRoundedIcon />, color: 'info' },
  ENV: { label: '서버 설정', icon: <DnsRoundedIcon />, color: 'default' },
  AUTO: { label: '자동 선택', icon: <AutoAwesomeRoundedIcon />, color: 'default' },
  NONE: { label: '없음', icon: <WarningAmberRoundedIcon />, color: 'warning' },
};

/**
 * 전역 리뷰어 카드(P4b AGP-59) — 프로젝트가 따로 지정하지 않으면 쓰는 리뷰어. 공용 활성 REVIEWER 만 고를 수 있다.
 * 프로젝트 지정은 ALM 프로젝트 설정 "AI 팀"에서 한다. 구 서버(404)면 "지원 안 함" 안내만.
 */
export default function PlatformReviewerCard({ personas, personasVersion }: { personas: Persona[]; personasVersion: number }) {
  const notify = useNotify();
  const [view, setView] = React.useState<PlatformReviewSetting | null>(null);
  const [unsupported, setUnsupported] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [pick, setPick] = React.useState(NO_PICK);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const next = await getPlatformReviewSetting();
      setUnsupported(next === null);
      setView(next);
      setPick(next?.setting?.personaId ?? NO_PICK);
    } catch (e: unknown) {
      setView(null);
      setLoadError(e instanceof Error ? e.message : '전역 리뷰어 설정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 페르소나가 바뀌면(추가 등) 자동 선택 결과가 바뀔 수 있어 다시 받는다.
  React.useEffect(() => {
    void reload();
  }, [reload, personasVersion]);

  const candidates = personas.filter(isPlatformReviewerCandidate);
  const saved = view?.setting?.personaId ?? NO_PICK;

  const save = async () => {
    if (busy || pick === NO_PICK || pick === saved) return;
    setBusy(true);
    try {
      const next = await savePlatformReviewSetting(pick);
      setView(next);
      setPick(next.setting?.personaId ?? NO_PICK);
      notify.success('전역 리뷰어를 지정했습니다. 이미 시작된 리뷰는 바뀌지 않습니다.');
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '전역 리뷰어를 지정하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clearPlatformReviewSetting();
      notify.success('전역 리뷰어 지정을 해제했습니다. 서버 설정이나 자동 선택을 따릅니다.');
      await reload();
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : '전역 리뷰어 지정을 해제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  if (loading && !view) {
    body = (
      <Stack sx={{ alignItems: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Stack>
    );
  } else if (loadError) {
    body = (
      <Alert
        severity="error"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={() => void reload()}>
            다시 시도
          </Button>
        }
      >
        {loadError}
      </Alert>
    );
  } else if (unsupported || !view) {
    body = (
      <Alert severity="info" variant="outlined">
        이 서버는 리뷰어를 지정할 수 없습니다. agent-service 가 리뷰어 지정(P4b)을 지원하면 여기서 고를 수 있습니다.
      </Alert>
    );
  } else {
    const { setting, effective } = view;
    const none = effective.source === 'NONE';
    const chip = SOURCE_CHIP[effective.source];
    const settingName = setting ? (setting.name ?? `삭제된 페르소나 (id=${setting.personaId})`) : null;
    const reviewer = effective.personaId ? personas.find((p) => p.id === effective.personaId) : undefined;
    body = (
      <Stack spacing={2}>
        {none && (
          <Alert severity="warning" variant="outlined">
            리뷰어가 없어 AI 작업이 완료(done)되지 않습니다 — REVIEWER 페르소나를 만들거나 지정하세요.
            {setting ? ` (지정한 ${settingName} 을(를) 지금은 쓸 수 없습니다 — 다시 지정하세요.)` : ''}
          </Alert>
        )}
        <Stack direction="row" spacing={1.5} role="status" aria-label="적용 중인 전역 리뷰어" sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {none ? <PersonOffRoundedIcon color="warning" /> : <RateReviewRoundedIcon color="info" />}
          <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
            {none ? '리뷰어 없음' : `${reviewer?.emoji ? `${reviewer.emoji} ` : ''}${effective.name ?? `페르소나 #${effective.personaId}`}`}
          </Typography>
          {!none && effective.slug && (
            <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              @{effective.slug}
            </Typography>
          )}
          <Chip size="small" variant="outlined" color={chip.color} icon={chip.icon} label={chip.label} />
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {setting ? `전역 지정: ${settingName}` : '전역 지정 없음 — 서버 설정(REVIEW_PERSONA)·자동 선택 순서로 따릅니다.'}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            select
            size="small"
            label="전역 리뷰어"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            disabled={busy || candidates.length === 0}
            helperText={
              candidates.length === 0
                ? '지정할 수 있는 공용 REVIEWER 페르소나가 없습니다.'
                : '공용(프로젝트 소속이 아닌) 활성 REVIEWER 페르소나만 고를 수 있습니다.'
            }
            sx={{ minWidth: 280 }}
            slotProps={{
              select: {
                // 고른 값도 아이콘 + 이름(두 줄 목록 항목을 그대로 넣지 않는다)
                renderValue: (value) => {
                  const p = candidates.find((c) => c.id === value);
                  if (!p) return '리뷰어 선택';
                  return (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <RateReviewRoundedIcon fontSize="small" />
                      <span>{`${p.emoji ? `${p.emoji} ` : ''}${p.name || p.slug}`}</span>
                    </Stack>
                  );
                },
              },
            }}
          >
            <MenuItem value={NO_PICK}>
              <ListItemText primary="리뷰어 선택" />
            </MenuItem>
            {candidates.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <RateReviewRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={`${p.emoji ? `${p.emoji} ` : ''}${p.name || p.slug}`} secondary={`@${p.slug}`} />
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
              disabled={busy || pick === NO_PICK || pick === saved}
              onClick={() => void save()}
            >
              저장
            </Button>
            {setting && (
              <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} disabled={busy} onClick={() => void clear()}>
                지정 해제(자동/상위 설정 따름)
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820 }}>
            AI 작업은 끝나도 바로 완료(done)되지 않습니다. 작업한 페르소나가 아닌 다른 AI 리뷰어가 검증해 통과시켜야
            완료됩니다. 여기서 정한 리뷰어는 프로젝트가 따로 지정하지 않은 모든 프로젝트에 쓰입니다(프로젝트 지정은 ALM
            프로젝트 설정 → AI 팀).
          </Typography>
        </Box>
        {body}
      </Stack>
    </Paper>
  );
}
