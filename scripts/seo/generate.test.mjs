import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  absoluteUrl,
  buildDocsSitemap,
  buildLlmsTxt,
  buildRobots,
  buildSitemapIndex,
  buildSiteSitemap,
  buildUrlset,
  xmlEscape,
} from './generate.mjs';
import { AI_AGENT, AI_AGENTS, DEFINITION, DISALLOWED, PRODUCTS, PUBLIC_ROUTES, REPOS } from './site.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');
const read = (rel) => readFileSync(path.join(SRC, rel), 'utf8');

test('절대 URL 은 슬래시를 겹치지 않는다', () => {
  assert.equal(absoluteUrl('https://example.com/', '/products'), 'https://example.com/products');
  assert.equal(absoluteUrl('https://example.com', 'sitemap.xml'), 'https://example.com/sitemap.xml');
});

test('XML 특수문자는 이스케이프된다 — 안 하면 사이트맵 전체가 파싱 실패한다', () => {
  assert.equal(xmlEscape('a&b<c>"d"'), 'a&amp;b&lt;c&gt;&quot;d&quot;');
  const xml = buildUrlset('https://example.com', [{ path: '/search?q=a&b' }]);
  assert.match(xml, /<loc>https:\/\/example\.com\/search\?q=a&amp;b<\/loc>/);
  assert.doesNotMatch(xml, /&(?!amp;|lt;|gt;|quot;|apos;)/);
});

test('사이트 사이트맵은 공개 라우트를 전부 절대 URL 로 싣는다', () => {
  const xml = buildSiteSitemap('https://chanho.dev');
  for (const route of PUBLIC_ROUTES) {
    assert.ok(xml.includes(`<loc>https://chanho.dev${route === '/' ? '/' : route}</loc>`), `빠진 라우트: ${route}`);
  }
  assert.equal(xml.match(/<url>/g).length, PUBLIC_ROUTES.length);
});

test('문서 사이트맵은 매핑에서 온 경로에 lastmod 를 붙인다', () => {
  const xml = buildDocsSitemap('https://chanho.dev', [
    { url: '/docs/spaces/2/pages/11', title: '10 게이트웨이', lastmod: '2026-09-05' },
    { url: '/docs/spaces/3/folder/72', title: 'alm-front' },
  ]);
  assert.match(xml, /<loc>https:\/\/chanho\.dev\/docs\/spaces\/2\/pages\/11<\/loc>\s*<lastmod>2026-09-05<\/lastmod>/);
  assert.match(xml, /<loc>https:\/\/chanho\.dev\/docs\/spaces\/3\/folder\/72<\/loc>\s*<\/url>/);
});

test('사이트맵 인덱스는 두 사이트맵을 가리킨다', () => {
  const xml = buildSitemapIndex('https://chanho.dev', ['sitemap-site.xml', 'docs-sitemap.xml'], '2026-09-05');
  assert.match(xml, /<sitemapindex/);
  assert.ok(xml.includes('<loc>https://chanho.dev/sitemap-site.xml</loc>'));
  assert.ok(xml.includes('<loc>https://chanho.dev/docs-sitemap.xml</loc>'));
});

test('robots 는 이름을 밝힌 봇 그룹에도 Disallow 를 복사한다 — 구체적 그룹 하나만 적용되므로', () => {
  const txt = buildRobots('https://chanho.dev');
  const groups = txt.split(/\n(?=User-agent: )/).filter((g) => g.startsWith('User-agent: '));
  assert.equal(groups.length, AI_AGENTS.length + 1);
  for (const group of groups) {
    for (const p of DISALLOWED) assert.ok(group.includes(`Disallow: ${p}`), `${group.split('\n')[0]} 에 ${p} 없음`);
    assert.ok(group.includes('Allow: /'));
  }
  for (const agent of ['GPTBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
    assert.ok(txt.includes(`User-agent: ${agent}`), `${agent} 그룹 없음`);
  }
  assert.ok(txt.includes('Sitemap: https://chanho.dev/sitemap.xml'));
});

test('llms.txt 는 H1 · 정의 인용문 · 제품/AI/문서/소스 절을 갖는다', () => {
  const txt = buildLlmsTxt('https://chanho.dev');
  const lines = txt.split('\n');
  assert.equal(lines[0], '# chanho');
  assert.equal(lines[2], `> ${DEFINITION}`);
  for (const section of ['## 제품', '## AI 에이전트 (MCP)', '## 문서', '## 소스']) assert.ok(txt.includes(section), `${section} 없음`);
  assert.ok(txt.includes(AI_AGENT.summary), 'AI 에이전트 요약이 없다');
  assert.ok(txt.includes('`/api/agent/mcp`'), 'MCP 엔드포인트가 없다');
  assert.ok(txt.includes(`(https://chanho.dev${AI_AGENT.guide.path})`), 'API 가이드 링크가 없다');
  for (const s of AI_AGENT.scenarios) assert.ok(txt.includes(`- ${s}`), `활용 시나리오가 빠졌다: ${s.slice(0, 20)}…`);
  for (const p of PRODUCTS) assert.ok(txt.includes(`(https://chanho.dev/products/${p.slug})`), `${p.slug} 링크 없음`);
  assert.ok(txt.includes('(https://chanho.dev/docs/)'));
  assert.ok(txt.includes('(https://chanho.dev/docs/spaces/2)') && txt.includes('(https://chanho.dev/docs/spaces/3)'));
  assert.ok(txt.includes('https://github.com/chanho4702/WIKI'));
});

// --- 드리프트 방지: scripts/seo/site.mjs 의 사본이 src/site/content 의 원본과 같은지 --------------
// 스크립트(.mjs)는 앱(.ts)을 import 할 수 없어 문자열이 두 곳에 산다. 한쪽만 고치면
// 사이트에 보이는 문장과 llms.txt·사이트맵이 다른 말을 하게 되므로 여기서 글자 단위로 대조한다.

test('정의문은 landing.ts 의 definition 과 글자까지 같다', () => {
  const landing = read('site/content/landing.ts');
  assert.ok(landing.includes(`'${DEFINITION}'`), 'landing.ts 의 definition 과 site.mjs 의 DEFINITION 이 다르다');
});

test('제품 slug·name·tagline·repoUrl 은 products.ts 와 같다', () => {
  const products = read('site/content/products.ts');
  for (const p of PRODUCTS) {
    assert.ok(products.includes(`slug: '${p.slug}'`), `products.ts 에 slug ${p.slug} 없음`);
    assert.ok(products.includes(`name: '${p.name}'`), `products.ts 에 name ${p.name} 없음`);
    assert.ok(products.includes(`tagline: '${p.tagline}'`), `products.ts 에 tagline 불일치: ${p.slug}`);
    // repoUrl 은 공개 저장소가 있는 제품만 갖는다(비공개 리포 제품은 양쪽 모두 비어 있어야 한다).
    if (p.repoUrl) assert.ok(products.includes(`repoUrl: '${p.repoUrl}'`), `products.ts 에 repoUrl 불일치: ${p.slug}`);
  }
  // 공개 저장소 목록에는 비공개 리포가 섞이지 않는다.
  for (const r of REPOS) assert.ok(r.url.startsWith('https://github.com/'), `공개 저장소가 아니다: ${r.name}`);
  assert.ok(!REPOS.some((r) => r.name === 'agent-service'), 'agent-service 는 비공개 리포다 — 공개 저장소 목록에 넣지 않는다');
});

test('AI 에이전트 사실은 products.ts 의 ai-agent 스펙과 같다', () => {
  const products = read('site/content/products.ts');
  assert.ok(products.includes(`slug: '${AI_AGENT.slug}'`), `products.ts 에 ${AI_AGENT.slug} 제품이 없다`);
  assert.ok(products.includes(AI_AGENT.endpoint), `products.ts 에 MCP 엔드포인트(${AI_AGENT.endpoint})가 없다`);
  assert.ok(products.includes('18종'), 'products.ts 에 도구 수(18종)가 없다 — llms.txt 와 화면이 다른 수를 말하면 안 된다');
});

test('도구 수 표기(18종)는 실제 도구 목록과 같다', () => {
  assert.equal(AI_AGENT.tools.length, 18, 'agent-service 의 도구가 늘거나 줄면 화면의 "18종" 표기도 함께 고쳐야 한다');
  assert.equal(new Set(AI_AGENT.tools).size, 18, '도구 이름이 중복된다');
});

test('시나리오의 도구 흐름은 실재하는 MCP 도구 이름만 쓴다', () => {
  const products = read('site/content/products.ts');
  const blocks = [...products.matchAll(/flow:\s*\[([\s\S]*?)\]/g)].map((m) => m[1]);
  assert.ok(blocks.length > 0, 'products.ts 에 시나리오 flow 가 하나도 없다');
  const named = blocks
    .flatMap((b) => [...b.matchAll(/'([^']+)'/g)].map((m) => m[1]))
    // `~…~` 로 감싼 항목은 도구가 아니라 사람의 작업·다른 경로라고 표시한 것이다.
    .filter((s) => !(s.startsWith('~') && s.endsWith('~')))
    // 'create_page (작업 보고서)' · 'create_issue × N' 처럼 뒤에 설명이 붙는다 — 첫 토큰만 본다.
    .map((s) => s.split(' ')[0]);
  assert.ok(named.length > 0, '도구 이름이 하나도 안 잡혔다 — 파싱이 깨졌는지 확인하라');
  for (const n of named) assert.ok(AI_AGENT.tools.includes(n), `실재하지 않는 도구 이름을 시나리오에 적었다: ${n}`);
});

test('연결 안내는 실재하는 관리자 엔드포인트만 적는다', () => {
  const products = read('site/content/products.ts');
  for (const path of ['/api/agent/personas', '/api/agent/tokens', '/api/agent/mcp']) {
    assert.ok(products.includes(path), `products.ts 에 ${path} 안내가 없다`);
  }
  // 토큰 실값이 새어 나가지 않게 — 스니펫의 토큰은 늘 플레이스홀더다.
  assert.doesNotMatch(products, /agp_[A-Za-z0-9]{8,}/, '스니펫에 실제처럼 보이는 토큰이 들어 있다');
});

test('프리렌더 라우트는 main.tsx 의 공개 라우트와 같다', () => {
  const main = read('main.tsx');
  // 동적 라우트(`/products/:slug`)는 slug 를 펼쳐 싣는다 — 라우트 문자열 그대로는 없으므로 부모만 대조.
  const declared = ['/', '/products', '/products/:slug', '/tech', '/contact'];
  for (const route of declared) assert.ok(main.includes(`path: '${route}'`), `main.tsx 에 ${route} 라우트 없음`);
  const slugs = PUBLIC_ROUTES.filter((r) => r.startsWith('/products/')).map((r) => r.slice('/products/'.length));
  assert.deepEqual(slugs, PRODUCTS.map((p) => p.slug));
});

test('막는 경로는 실제로 main.tsx 에 있는 비공개/참고용 라우트다', () => {
  const main = read('main.tsx');
  for (const p of DISALLOWED) assert.ok(main.includes(`path: '${p}'`), `main.tsx 에 없는 경로를 막고 있다: ${p}`);
  for (const p of DISALLOWED) assert.ok(!PUBLIC_ROUTES.includes(p), `공개 라우트를 막고 있다: ${p}`);
});
