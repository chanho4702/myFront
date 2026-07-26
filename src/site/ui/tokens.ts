/**
 * 모노스페이스 스택. 프리미티브와 페이지가 **전부 여기서 가져온다.**
 * 이 문자열을 파일마다 복제하면 페이지를 늘릴 때 하나씩 어긋나기 시작한다 —
 * 실제로 초안에서는 8개 파일에 11번 복제돼 있었다.
 */
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** 스티키 헤더 높이(px). SiteHeader 가 이 값으로 렌더한다. */
export const HEADER_H = 56;

/**
 * 해시 앵커로 이동했을 때 헤더 아래로 확보할 여백.
 * 헤더 높이에서 파생시킨다 — 60/80 처럼 손으로 적은 숫자가 흩어지면
 * 헤더 높이를 바꾸는 순간 어떤 앵커는 헤더에 가리고 어떤 앵커는 안 가린다.
 */
export const ANCHOR_OFFSET = `${HEADER_H + 24}px`;
