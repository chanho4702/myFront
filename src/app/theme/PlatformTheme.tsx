import * as React from 'react';
import type { ThemeOptions } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import AppTheme from '../../context/templates/shared-theme/AppTheme';
import { platformComponents } from './platformComponents';

/**
 * 한국어 줄바꿈 규칙. 기본값(`word-break: normal`)은 한글을 음절마다 끊어서
 * "이어집 / 니다", 좁은 표 칸에서는 "구 / 분" 처럼 글자 단위로 무너진다.
 * `keep-all` 은 어절 단위로만 끊고, `overflow-wrap: break-word` 는 칸보다 긴 토큰(URL·영문 식별자)만
 * 넘칠 때 끊는다 — `anywhere` 와 달리 최소 폭 계산을 바꾸지 않아 표 열이 글자 폭으로 찌그러지지 않는다.
 * 다이얼로그·메뉴는 body 바로 아래 포털로 뜨므로 body 에 걸어야 함께 적용된다.
 */
const textFlow = <GlobalStyles styles={{ body: { wordBreak: 'keep-all', overflowWrap: 'break-word' } }} />;

/**
 * 이 앱의 테마 진입점 — 원본 `AppTheme`(context/templates, 수정 금지)에 앱 공통 보정(대비·줄바꿈)을 얹는다.
 * 공개 사이트·포털·로그인·오류 화면이 모두 이걸로 감싸야 화면마다 칩 대비나 줄바꿈이 달라지지 않는다.
 */
export default function PlatformTheme({
  children,
  themeComponents,
  disableCustomTheme,
}: {
  children: React.ReactNode;
  themeComponents?: ThemeOptions['components'];
  disableCustomTheme?: boolean;
}) {
  const components = React.useMemo(() => ({ ...platformComponents, ...themeComponents }), [themeComponents]);
  return (
    <AppTheme disableCustomTheme={disableCustomTheme} themeComponents={components}>
      {textFlow}
      {children}
    </AppTheme>
  );
}
