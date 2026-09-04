/**
 * 브랜드 단일 원천. 헤더·푸터·`<title>`·문의 페이지가 전부 여기서 읽는다 —
 * 이름을 바꿀 일이 생기면 이 파일 하나만 고친다.
 */
export const BRAND = 'chanho';
/** 한 줄 포지셔닝. 헤더 로고 옆 툴팁·푸터·메타 설명에 쓴다. */
export const BRAND_TAGLINE = '문서·이슈·협업을 한 곳에서';

/**
 * 사이트의 정규 오리진. `<link rel="canonical">`·Open Graph·JSON-LD 의 절대 URL 이 전부 여기서 나온다.
 * 빌드 시점 값(`VITE_SITE_URL`)이라 배포 환경마다 다르게 박힌다 — 로컬/미설정이면 `http://localhost`.
 * 끝 슬래시는 제거한다(`${SITE_URL}${path}` 로 이어 붙이므로 남아 있으면 `//` 가 된다).
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'http://localhost').replace(/\/+$/, '');

export const GITHUB_URL = 'https://github.com/chanho4702';
export const CONTACT_EMAIL = 'chanho470@naver.com';

/** "시작하기" CTA 목적지. nginx 단일 오리진(/wiki/)에서만 유효한 라이브 앱. */
export const START_URL = '/wiki/';
