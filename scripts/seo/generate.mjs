// sitemap / robots / llms.txt 본문 생성기 — 순수 함수만. 파일 I/O·프로세스는 prerender.mjs 가 맡는다
// (백엔드도 크롬도 없이 단위 테스트하기 위해서다. docs/lib.mjs 와 같은 구조).

import { AI_AGENT, AI_AGENTS, BRAND, DEFINITION, DISALLOWED, DOCS, PRODUCTS, PUBLIC_ROUTES, REPOS } from './site.mjs';

/** XML 텍스트 노드 이스케이프. URL 의 `&` 하나로 사이트맵 전체가 파싱 실패한다. */
export const xmlEscape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

/** 오리진 + 경로. 오리진의 끝 슬래시와 경로의 앞 슬래시가 겹치지 않게. */
export const absoluteUrl = (origin, path) => `${String(origin).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;

/**
 * `<urlset>` 한 장. entries 는 `{ path | url, lastmod? }`.
 * 경로(`path`)는 오리진을 붙이고, 이미 절대 URL(`url`)이면 그대로 쓴다.
 */
export function buildUrlset(origin, entries) {
  const urls = entries.map((e) => {
    const loc = e.url ?? absoluteUrl(origin, e.path);
    const lastmod = e.lastmod ? `\n    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : '';
    return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/** 사이트맵 인덱스. 소개 사이트와 문서 위키는 생성 주기가 달라 파일을 나눈다. */
export function buildSitemapIndex(origin, files, lastmod) {
  const items = files.map((f) => {
    const mod = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '';
    return `  <sitemap>\n    <loc>${xmlEscape(absoluteUrl(origin, f))}</loc>${mod}\n  </sitemap>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`;
}

/** 공개 사이트 라우트 사이트맵. */
export const buildSiteSitemap = (origin, routes = PUBLIC_ROUTES, lastmod) =>
  buildUrlset(origin, routes.map((path) => ({ path, lastmod })));

/**
 * 문서 위키 사이트맵. entries 는 `scripts/docs-sitemap.json`(임포터가 쓰고 커밋하는 파일)의
 * `{ url, title, lastmod }` 목록 — url 은 `/docs/spaces/2/pages/11` 같은 사이트 내부 경로다.
 */
export const buildDocsSitemap = (origin, entries) =>
  buildUrlset(
    origin,
    entries.map((e) => ({ path: e.url, lastmod: e.lastmod })),
  );

/**
 * robots.txt. 그룹마다 Disallow 를 복사하는 이유는 site.mjs 의 AI_AGENTS 주석 참고 —
 * 이름이 적힌 봇은 `User-agent: *` 그룹을 읽지 않는다.
 */
export function buildRobots(origin, { agents = AI_AGENTS, disallowed = DISALLOWED } = {}) {
  const group = (agent) => [`User-agent: ${agent}`, 'Allow: /', ...disallowed.map((p) => `Disallow: ${p}`)].join('\n');
  return [
    '# chanho — 공개 사이트와 문서 위키(/docs/)는 전부 색인을 허용한다.',
    '# 답변 엔진(LLM) 크롤러도 이름을 밝혀 허용한다. 막는 것은 로그인이 필요한 앱 화면과 참고용 템플릿뿐.',
    '',
    group('*'),
    '',
    ...agents.flatMap((a) => [group(a), '']),
    `Sitemap: ${absoluteUrl(origin, 'sitemap.xml')}`,
    '',
  ].join('\n');
}

/**
 * llms.txt (llmstxt.org) — 답변 엔진이 사이트를 한눈에 파악하도록 H1 + 정의 인용문 + 링크 목록만 둔다.
 * 마케팅 문구를 넣지 않는 것이 규격의 요지다.
 */
export function buildLlmsTxt(origin) {
  const link = (title, path, desc) => `- [${title}](${absoluteUrl(origin, path)})${desc ? `: ${desc}` : ''}`;
  const ext = (title, url, desc) => `- [${title}](${url})${desc ? `: ${desc}` : ''}`;
  return [
    `# ${BRAND}`,
    '',
    `> ${DEFINITION}`,
    '',
    '## 제품',
    '',
    ...PRODUCTS.map((p) => link(p.name, `/products/${p.slug}`, p.tagline)),
    '',
    '## AI 에이전트 (MCP)',
    '',
    `> ${AI_AGENT.summary} 접속 지점: \`${AI_AGENT.endpoint}\` (게이트웨이 경유).`,
    '',
    ...AI_AGENT.scenarios.map((s) => `- ${s}`),
    '',
    link('AI Agent 제품 소개', `/products/${AI_AGENT.slug}`, '활용 시나리오와 연결하는 법'),
    link(AI_AGENT.guide.title, AI_AGENT.guide.path, '토큰 발급과 API 호출 방법'),
    '',
    '## 문서',
    '',
    link('공개 문서 위키', DOCS.basePath, '아래 두 스페이스를 담은 문서 사이트'),
    ...DOCS.spaces.map((s) => link(s.name, `/docs/spaces/${s.id}`, s.desc)),
    '',
    '## 소스',
    '',
    ...REPOS.map((r) => ext(r.name, r.url, r.desc)),
    '',
  ].join('\n');
}
