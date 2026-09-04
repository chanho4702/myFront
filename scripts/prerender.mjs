#!/usr/bin/env node
// 빌드 산출물(dist)을 SEO/GEO 용으로 마감한다. `npm run build` 다음에 돈다(`npm run build:site`).
//
//  1) 프리렌더 — vite preview 를 띄우고 헤드리스 크롬으로 공개 라우트를 하나씩 열어 렌더된 DOM 을
//     `dist/<route>/index.html` 로 굽는다. 이 사이트는 CSR 이라 자바스크립트를 안 돌리는 크롤러·
//     답변 엔진에게는 빈 <div id="root"> 만 보인다 — 그 격차를 메우는 단계다.
//  2) OG 이미지 — public/og-image.svg 를 같은 크롬으로 1200x630 PNG 로 굽는다(SVG 를 안 받는 플랫폼용).
//  3) sitemap.xml · docs-sitemap.xml · robots.txt · llms.txt 생성. **이 단계는 크롬 없이도 돈다.**
//
// 크롬이 없으면 1·2 만 건너뛰고 경고를 남긴 뒤 3 을 마친다 — 크롬 없는 개발자의 빌드를 깨지 않기 위해서다.
// 크롬 경로는 CHROME_BIN 으로 지정할 수 있고, 없으면 PATH 와 OS 별 표준 위치를 훑는다.
//
// 사용: npm run build:site
//       VITE_SITE_URL=https://example.com node scripts/prerender.mjs
//       CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe" node scripts/prerender.mjs

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDocsSitemap, buildLlmsTxt, buildRobots, buildSitemapIndex, buildSiteSitemap } from './seo/generate.mjs';
import { PUBLIC_ROUTES } from './seo/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const DOCS_SITEMAP_JSON = path.join(ROOT, 'scripts', 'docs-sitemap.json');
const OG_SVG = path.join(ROOT, 'public', 'og-image.svg');
const PORT = Number(process.env.PRERENDER_PORT ?? 4173);
const ORIGIN = (process.env.VITE_SITE_URL || 'http://localhost').replace(/\/+$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

const log = (m) => console.log(`[prerender] ${m}`);
const warn = (m) => console.warn(`[prerender] 경고 — ${m}`);

// --- 크롬 찾기 ---------------------------------------------------------------------------------

const WINDOWS_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null,
].filter(Boolean);

const UNIX_CANDIDATES = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

/** PATH 에 있는 이름은 실제로 실행해 봐야 알 수 있다(where/which 의 OS 차이를 피한다). */
const runs = (bin) => spawnSync(bin, ['--version'], { stdio: 'ignore', timeout: 15_000 }).status === 0;

export function findChrome(env = process.env) {
  if (env.CHROME_BIN) {
    if (existsSync(env.CHROME_BIN) || runs(env.CHROME_BIN)) return env.CHROME_BIN;
    warn(`CHROME_BIN 이 가리키는 실행 파일을 찾지 못했다: ${env.CHROME_BIN}`);
  }
  for (const p of [...WINDOWS_CANDIDATES, ...UNIX_CANDIDATES]) if (existsSync(p)) return p;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chrome']) if (runs(name)) return name;
  return null;
}

// --- vite preview ------------------------------------------------------------------------------

function startPreview() {
  const bin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  // npx 가 아니라 현재 노드로 vite 를 직접 부른다 — 셸을 끼우면 윈도우에서 종료 신호가 자식까지 안 간다.
  // --host 127.0.0.1 은 필수다 — 기본값은 localhost 바인딩이라 윈도우에서 ::1(IPv6) 로만 열려,
  // 크롬과 헬스체크가 쓰는 127.0.0.1 로는 연결이 안 된다(30초 대기 후 타임아웃).
  const child = spawn(process.execPath, [bin, 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', (d) => process.stderr.write(`[vite preview] ${d}`));
  return child;
}

/**
 * 서버가 응답할 때까지 기다린다. **자식이 먼저 죽으면 즉시 실패한다** — 포트를 남이 쓰고 있으면
 * vite 는 죽지만 그 포트는 계속 응답하므로, 이 검사가 없으면 남의 서버(옛 dist)를 상대로
 * 프리렌더를 마치고 성공했다고 보고하게 된다.
 */
async function waitForServer(child, url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`미리보기 서버가 뜨지 못하고 종료했다(코드 ${child.exitCode}) — 포트 ${PORT} 가 이미 쓰이는지 확인하라.`);
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* 아직 안 떴다 */
    }
    if (Date.now() > deadline) throw new Error(`미리보기 서버가 ${timeoutMs}ms 안에 뜨지 않았다: ${url}`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

// --- 프리렌더 ----------------------------------------------------------------------------------

/** 라우트 → 쓸 파일 경로. 루트만 dist/index.html 을 덮어쓰고, 나머지는 디렉터리 + index.html. */
export const outputPathFor = (dist, route) => (route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html'));

const pick = (html, re) => html.match(re)?.[1]?.trim() ?? '';

/** 구운 HTML 검증용 — 제목·설명·H1 이 실제로 박혔는지 본다(빈 셸을 구워 놓고 성공했다고 하지 않기 위해). */
export function inspectHtml(html) {
  return {
    title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick(html, /<meta[^>]+name="description"[^>]*content="([^"]*)"/i),
    canonical: pick(html, /<link[^>]+rel="canonical"[^>]*href="([^"]*)"/i),
    h1: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim(),
    jsonLd: /application\/ld\+json/.test(html),
  };
}

function dumpDom(chrome, url, userDataDir) {
  const res = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox', // CI 컨테이너용. 로컬에서도 무해하다
      '--disable-dev-shm-usage',
      `--user-data-dir=${userDataDir}`, // 이미 열려 있는 크롬 프로필에 붙어 아무것도 안 하고 끝나는 사고 방지
      '--virtual-time-budget=8000',
      '--dump-dom',
      url,
    ],
    { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, timeout: 120_000 },
  );
  if (res.status !== 0) throw new Error(`크롬이 ${res.status} 로 끝났다 (${url}): ${res.stderr?.toString('utf8').slice(0, 400)}`);
  const html = res.stdout.toString('utf8');
  if (!html.includes('<html')) throw new Error(`DOM 을 못 떠 왔다 (${url})`);
  // --dump-dom 은 documentElement.outerHTML 만 준다. doctype 이 없으면 브라우저가 쿼크 모드로 연다.
  return html.startsWith('<!DOCTYPE') || html.startsWith('<!doctype') ? html : `<!doctype html>\n${html}`;
}

/**
 * 프리렌더 전의 원본 셸(빈 `#root`)을 dist/shell.html 로 남긴다.
 * dist/index.html 은 곧 홈의 정적 HTML 이 되는데, nginx 의 SPA 폴백(`try_files … /index.html`)도
 * 같은 파일을 쓰므로 `/app` 같은 비프리렌더 경로에서 홈 마크업이 잠깐 스쳐 보인다.
 * 그게 거슬리면 운영에서 폴백만 `/shell.html` 로 바꾸면 된다(기본 동작은 그대로 둔다).
 */
async function keepShell() {
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8');
  // 빈 root 일 때만 남긴다 — 빌드 없이 프리렌더만 다시 돌리면 index.html 은 이미 구운 홈이라,
  // 그걸 그대로 shell.html 에 덮으면 폴백이 홈 마크업이 되어 버린다.
  if (!shell.includes('<div id="root"></div>')) return;
  await writeFile(path.join(DIST, 'shell.html'), shell, 'utf8');
  log('원본 셸 보존 → dist/shell.html (SPA 폴백용)');
}

async function prerenderRoutes(chrome, userDataDir) {
  await keepShell();
  const rows = [];
  for (const route of PUBLIC_ROUTES) {
    const html = dumpDom(chrome, `http://127.0.0.1:${PORT}${route}`, userDataDir);
    const out = outputPathFor(DIST, route);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html, 'utf8');
    const info = inspectHtml(html);
    if (!info.title) throw new Error(`${route} — <title> 이 비어 있다`);
    if (!info.description) throw new Error(`${route} — meta description 이 비어 있다`);
    if (!info.h1) throw new Error(`${route} — 본문 H1 이 비어 있다(앱이 렌더되지 않았다)`);
    rows.push({ route, ...info, bytes: Buffer.byteLength(html) });
    log(`구움 ${route} → ${path.relative(ROOT, out)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
  }
  return rows;
}

function renderOgImage(chrome, userDataDir) {
  if (!existsSync(OG_SVG)) {
    warn(`OG 원본 SVG 가 없다: ${path.relative(ROOT, OG_SVG)}`);
    return false;
  }
  const out = path.join(DIST, 'og-image.png');
  const res = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${userDataDir}`,
      '--hide-scrollbars',
      '--window-size=1200,630',
      '--default-background-color=ffffffff',
      `--screenshot=${out}`,
      pathToFileURL(OG_SVG).href,
    ],
    { encoding: 'utf8', timeout: 60_000 },
  );
  if (res.status !== 0 || !existsSync(out)) {
    warn(`OG PNG 렌더 실패 (크롬 ${res.status}) — public/og-image.png 사본을 그대로 쓴다`);
    return false;
  }
  log(`OG 이미지 → dist/og-image.png (1200x630)`);
  return true;
}

// --- sitemap / robots / llms.txt -----------------------------------------------------------------

/** 문서 위키 항목. 임포터(scripts/sync-docs.mjs)가 쓰고 커밋하는 파일이며, 없으면 문서 사이트맵을 빼놓는다. */
function readDocsEntries() {
  if (!existsSync(DOCS_SITEMAP_JSON)) return null;
  const parsed = JSON.parse(readFileSync(DOCS_SITEMAP_JSON, 'utf8'));
  const entries = Array.isArray(parsed) ? parsed : parsed.pages;
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return entries;
}

async function writeSeoFiles() {
  const write = async (name, body) => {
    await writeFile(path.join(DIST, name), body, 'utf8');
    return body;
  };

  const siteXml = await write('sitemap-site.xml', buildSiteSitemap(ORIGIN, PUBLIC_ROUTES, TODAY));
  const files = ['sitemap-site.xml'];
  let docsCount = 0;

  const docs = readDocsEntries();
  if (docs) {
    await write('docs-sitemap.xml', buildDocsSitemap(ORIGIN, docs));
    files.push('docs-sitemap.xml');
    docsCount = docs.length;
  } else {
    warn(`${path.relative(ROOT, DOCS_SITEMAP_JSON)} 이 없어 문서 사이트맵을 만들지 않았다 (npm run sync:docs 가 만든다)`);
  }

  await write('sitemap.xml', buildSitemapIndex(ORIGIN, files, TODAY));
  await write('robots.txt', buildRobots(ORIGIN));
  await write('llms.txt', buildLlmsTxt(ORIGIN));

  const siteCount = (siteXml.match(/<url>/g) ?? []).length;
  log(`사이트맵 — 인덱스 ${files.length}장 · 사이트 URL ${siteCount}개 · 문서 URL ${docsCount}개`);
  log(`robots.txt · llms.txt 생성 (오리진 ${ORIGIN})`);
  return { siteCount, docsCount };
}

// --- 진입점 -------------------------------------------------------------------------------------

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html 이 없다 — 먼저 `npm run build` 를 돌려라.');

  const chrome = findChrome();
  if (!chrome) {
    warn('크롬을 찾지 못해 프리렌더와 OG PNG 를 건너뛴다 (CHROME_BIN 으로 경로를 지정할 수 있다). sitemap/robots/llms.txt 는 그대로 만든다.');
  } else {
    log(`크롬: ${chrome}`);
    const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'chanho-prerender-'));
    const preview = startPreview();
    try {
      await waitForServer(preview, `http://127.0.0.1:${PORT}/`);
      log(`미리보기 서버 http://127.0.0.1:${PORT} — 라우트 ${PUBLIC_ROUTES.length}개 프리렌더`);
      const rows = await prerenderRoutes(chrome, userDataDir);
      renderOgImage(chrome, userDataDir);
      console.table(rows.map((r) => ({ route: r.route, title: r.title, h1: r.h1, 'json-ld': r.jsonLd })));
    } finally {
      preview.kill();
      rmSync(userDataDir, { recursive: true, force: true });
    }
  }

  await writeSeoFiles();
  log('완료');
}

// 직접 실행일 때만 돈다 — 단위 테스트가 위의 순수 함수들을 import 해도 빌드가 시작되지 않도록.
const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err instanceof Error ? `[prerender] ${err.message}` : err);
    process.exit(1);
  });
}
