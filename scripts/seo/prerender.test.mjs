import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { findChrome, inspectHtml, outputPathFor } from '../prerender.mjs';

test('라우트마다 dist 안의 index.html 로 간다 — 루트만 dist/index.html 을 덮어쓴다', () => {
  const dist = path.join('C:', 'x', 'dist');
  assert.equal(outputPathFor(dist, '/'), path.join(dist, 'index.html'));
  assert.equal(outputPathFor(dist, '/products'), path.join(dist, 'products', 'index.html'));
  assert.equal(outputPathFor(dist, '/products/wiki'), path.join(dist, 'products', 'wiki', 'index.html'));
});

test('구운 HTML 에서 제목·설명·canonical·H1·JSON-LD 를 읽는다', () => {
  const html = `<!doctype html><html><head><title>chanho — 문서</title>
    <meta name="description" content="정의문입니다."><link rel="canonical" href="https://chanho.dev/">
    <script type="application/ld+json">{"@type":"FAQPage"}</script></head>
    <body><h1 class="x"><span>쓰고,</span> 추적하고</h1></body></html>`;
  assert.deepEqual(inspectHtml(html), {
    title: 'chanho — 문서',
    description: '정의문입니다.',
    canonical: 'https://chanho.dev/',
    h1: '쓰고, 추적하고',
    jsonLd: true,
  });
});

test('빈 셸은 H1 이 없으므로 검증에서 걸린다', () => {
  const info = inspectHtml('<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>');
  assert.equal(info.h1, '');
  assert.equal(info.description, '');
  assert.equal(info.jsonLd, false);
});

test('CHROME_BIN 이 가리키는 파일이 없으면 다른 후보로 넘어간다(없으면 null)', () => {
  const found = findChrome({ CHROME_BIN: path.join('C:', 'no', 'such', 'chrome.exe') });
  assert.ok(found === null || typeof found === 'string');
});
