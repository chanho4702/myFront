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

/**
 * 상표 고지. 비교·설명에 다른 회사 제품명을 쓰는 화면(푸터·비교표)과 llms.txt 가 같은 문장을 쓴다 —
 * scripts/seo/site.mjs 의 TRADEMARK_NOTICE 와 글자까지 같아야 한다(테스트가 대조).
 * 다른 제품명은 "~ 대안 / ~와 비교" 같은 서술적 사용만 한다 — 우리 제품 이름·태그라인처럼 쓰지 않는다.
 */
export const TRADEMARK_NOTICE = 'Atlassian, Confluence, Jira 는 Atlassian Pty Ltd 의, Notion 은 Notion Labs, Inc. 의, MinIO 는 MinIO, Inc. 의 상표입니다. chanho 는 이들 회사와 제휴·후원 관계가 없으며, 다른 회사의 제품명은 비교·설명 목적으로만 씁니다.';
