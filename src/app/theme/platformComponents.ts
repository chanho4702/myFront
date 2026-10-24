import type { Components, CSSObject, Theme } from '@mui/material/styles';
import { chipClasses } from '@mui/material/Chip';
import { dataDisplayCustomizations } from '../../context/templates/shared-theme/customizations/dataDisplay';
import { brand, gray, green } from '../../context/templates/shared-theme/themePrimitives';

/**
 * MUI 원본 템플릿(context/templates, 수정 금지) 위에 얹는 이 앱의 컴포넌트 보정.
 *
 * 원본 Chip 은 라이트에서 기본(회색) 라벨이 gray[500] on gray[100] = 3.8:1,
 * 성공(초록) 라벨이 green[500] on green[50] = 4.4:1 이라 WCAG AA(4.5:1)에 못 미친다.
 * 다크의 primary 라벨(brand[400] on 어두운 배경)도 4.2:1 이라 한 단계 밝힌다.
 * 원본 스타일을 그대로 두고 라벨·아이콘 색만 한 단계씩 조정한다.
 *
 * `themeComponents` 는 키 단위로 덮어쓰기라 MuiChip 을 통째로 바꾸면 원본 테두리·배경이 사라진다 —
 * 그래서 원본 root 스타일을 먼저 계산하고 variants 끝에 보정 규칙을 덧붙인다(뒤 규칙이 이긴다).
 */
type RootStyle = CSSObject & { variants?: unknown[] };
type RootFn = (props: { theme: Theme }) => RootStyle;

const baseChip = dataDisplayCustomizations.MuiChip ?? {};
const baseChipRoot = baseChip.styleOverrides?.root as unknown as RootFn | undefined;

const labelColor = (light: string, dark: string, theme: Theme): CSSObject => ({
  [`& .${chipClasses.label}`]: { color: light },
  [`& .${chipClasses.icon}`]: { color: light },
  ...theme.applyStyles('dark', {
    [`& .${chipClasses.label}`]: { color: dark },
    [`& .${chipClasses.icon}`]: { color: dark },
  }),
});

export const platformComponents: Components<Theme> = {
  MuiChip: {
    ...baseChip,
    styleOverrides: {
      ...baseChip.styleOverrides,
      root: (props) => {
        const theme = props.theme as Theme;
        const base: RootStyle = baseChipRoot ? baseChipRoot({ theme }) : {};
        return {
          ...base,
          variants: [
            ...(base.variants ?? []),
            { props: { color: 'default' }, style: labelColor(gray[600], gray[300], theme) },
            { props: { color: 'success' }, style: labelColor(green[600], green[300], theme) },
            { props: { color: 'primary', variant: 'outlined' }, style: labelColor(brand[500], brand[300], theme) },
          ],
        } as CSSObject;
      },
    },
  },
};
