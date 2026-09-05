#!/usr/bin/env node
// 공개 문서 위키(docs 인스턴스) 동기화 — 두 갈래를 차례로 돈다.
//  notes: 옵시디언 볼트의 "MSA_TEMPLATE 정리" NN 노트 → 스페이스 `docs` (매핑 scripts/docs-pages.json)
//  dev:   플랫폼 리포 안 개발 문서(마크다운) → 스페이스 `dev`  (매핑 scripts/dev-docs-pages.json, 대상은 docs/collections.mjs)
// 멱등 — 여러 번 돌려도 같은 페이지를 갱신하며, 내용이 같으면 손대지 않는다. 리포/볼트가 원본이다.
// CI 에서는 돌지 않는다(볼트도 토큰도 없다). 매핑 파일은 커밋한다.
//
// 사용: npm run sync:docs                       # notes → dev
//       npm run sync:docs -- --only=notes|dev
//       DOCS_API=http://127.0.0.1:19910 DOCS_IMPORT_TOKEN=... node scripts/sync-docs.mjs
//       토큰은 env 가 없으면 DOCS_TOKEN_FILE(기본 C:/MSA_TEMPLATE/infra/keycloak/.env)의 DOCS_IMPORT_TOKEN= 줄에서 읽는다.
//       OBSIDIAN_VAULT="D:/vault" node scripts/sync-docs.mjs

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWhitelisted } from './notes/transform.mjs';
import { createDocsClient, syncDocs } from './docs/lib.mjs';
import { MAX_FILE_BYTES, SKIP_DIRS, collectionSkipReason, globToRegExp, hasWildcard, literalPrefix, syncDevDocs, toPosix } from './docs/dev.mjs';
import { COLLECTIONS, PLATFORM_ROOT } from './docs/collections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.OBSIDIAN_VAULT ?? 'C:/myBrain/내 로컬';
const SOURCE_DIR = path.join(VAULT, 'msa', 'MSA_TEMPLATE 정리');
const NOTES_MAPPING_FILE = path.join(ROOT, 'scripts', 'docs-pages.json');
const DEV_MAPPING_FILE = path.join(ROOT, 'scripts', 'dev-docs-pages.json');
/** 문서 위키 사이트맵의 원천. 빌드(scripts/prerender.mjs)가 읽어 docs-sitemap.xml 을 만든다 — 커밋한다. */
const SITEMAP_FILE = path.join(ROOT, 'scripts', 'docs-sitemap.json');
const DOCS_API = process.env.DOCS_API ?? 'http://127.0.0.1:19910';
const TOKEN_FILE = process.env.DOCS_TOKEN_FILE ?? `${PLATFORM_ROOT}/infra/keycloak/.env`;

const log = (m) => console.log(`[sync-docs] ${m}`);

function parseArgs(argv) {
  const only = argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  if (only && !['notes', 'dev'].includes(only)) throw new Error(`--only 는 notes 또는 dev 여야 합니다: ${only}`);
  return { notes: !only || only === 'notes', dev: !only || only === 'dev' };
}

/** 토큰은 env → 파일 순. 값은 절대 출력하지 않는다. */
async function readToken() {
  if (process.env.DOCS_IMPORT_TOKEN) return process.env.DOCS_IMPORT_TOKEN;
  if (!existsSync(TOKEN_FILE)) return '';
  const line = (await readFile(TOKEN_FILE, 'utf8')).split(/\r?\n/).find((l) => l.startsWith('DOCS_IMPORT_TOKEN='));
  return line ? line.slice('DOCS_IMPORT_TOKEN='.length).trim().replace(/^["']|["']$/g, '') : '';
}

const readJson = async (file) => (existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : {});
const writeJson = (file, obj) => writeFile(file, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');

/**
 * 사이트맵 원천 갱신. 이번에 돈 스페이스의 항목만 갈아 끼우고 나머지는 그대로 둔다 —
 * `--only=notes` 로 한쪽만 돌렸을 때 다른 스페이스의 URL 이 사라지면 안 되기 때문이다.
 * lastmod 는 이번 실행에서 실제로 바뀐 페이지만 오늘로 올리고, 안 바뀐 페이지는 이전 값을 지킨다
 * (매번 전부 오늘로 찍으면 크롤러에게 거짓말을 하는 셈이 된다).
 */
async function writeSitemapEntries(spaceId, entries) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await readJson(SITEMAP_FILE);
  const before = Array.isArray(existing) ? existing : [];
  const prev = new Map(before.map((e) => [e.url, e]));
  const prefix = `/docs/spaces/${spaceId}/`;
  const merged = [
    ...before.filter((e) => !String(e.url).startsWith(prefix)),
    ...entries.map((e) => ({ url: e.url, title: e.title, lastmod: e.changed ? today : (prev.get(e.url)?.lastmod ?? today) })),
  ].sort((a, b) => a.url.localeCompare(b.url));
  await writeJson(SITEMAP_FILE, merged);
  log(`사이트맵 원천 갱신 — 스페이스 ${spaceId} ${entries.length}건 (전체 ${merged.length}건) → ${path.relative(ROOT, SITEMAP_FILE)}`);
}

async function runNotes(client) {
  if (!existsSync(SOURCE_DIR)) throw new Error(`볼트를 찾지 못했습니다: ${SOURCE_DIR}`);
  const all = await readdir(SOURCE_DIR);
  const excluded = all.filter((f) => f.endsWith('.md') && !isWhitelisted(f));
  const targets = all.filter(isWhitelisted).sort();
  if (targets.length === 0) throw new Error('화이트리스트에 걸린 노트가 0개입니다.');

  const notes = [];
  for (const file of targets) notes.push({ file, raw: await readFile(path.join(SOURCE_DIR, file), 'utf8') });

  const result = await syncDocs({ notes, mapping: await readJson(NOTES_MAPPING_FILE), client, log });
  // 매핑은 성공했을 때만 쓴다. 중간에 실패하면 다음 실행이 제목 lookup 으로 다시 찾는다.
  await writeJson(NOTES_MAPPING_FILE, result.mapping);
  await writeSitemapEntries(result.spaceId, result.entries);

  const { created, updated, skipped, broken, stale } = result.summary;
  log(`notes 완료 — 스페이스 ${result.spaceId} · 생성 ${created} · 갱신 ${updated} · 동일 ${skipped} (노트 ${notes.length}편)`);
  if (excluded.length) log(`화이트리스트 제외 ${excluded.length}개: ${excluded.join(', ')}`);
  if (stale.length) console.warn(`[sync-docs] 경고 — 볼트에서 사라진 번호가 매핑에 남아 있다(페이지는 지우지 않음): ${stale.join(', ')}`);
  if (broken.length) {
    console.warn(`[sync-docs] 경고 — 평탄화된 외부 위키링크 ${broken.length}건:`);
    broken.forEach((b) => console.warn(`  - ${b}`));
  }
}

/** include 를 만족하는 마크다운을 모은다. 와일드카드가 없는 항목은 파일 하나로 바로 읽는다. */
async function collectFiles(collection, skipped) {
  const dir = toPosix(collection.dir);
  const found = new Map(); // relpath → raw
  const take = async (relpath) => {
    if (found.has(relpath)) return;
    const abs = path.join(dir, relpath);
    const s = await stat(abs).catch(() => null);
    if (!s?.isFile()) return;
    if (s.size > MAX_FILE_BYTES) {
      skipped.push(`${collection.id}/${relpath} (${Math.round(s.size / 1024)} KB)`);
      return;
    }
    found.set(relpath, await readFile(abs, 'utf8'));
  };
  const walk = async (rel, patterns) => {
    const entries = await readdir(path.join(dir, rel), { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const relpath = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) await walk(relpath, patterns);
      } else if (patterns.some((p) => p.test(relpath))) await take(relpath);
    }
  };
  for (const g of collection.include) {
    if (!hasWildcard(g)) await take(g);
  }
  const globs = collection.include.filter(hasWildcard);
  for (const prefix of new Set(globs.map(literalPrefix))) {
    const patterns = globs.filter((g) => literalPrefix(g) === prefix).map(globToRegExp);
    await walk(prefix, patterns);
  }
  return [...found.entries()].map(([relpath, raw]) => ({ relpath, raw }));
}

async function runDev(client) {
  const skipped = [];
  const collections = [];
  for (const collection of COLLECTIONS) {
    const dirExists = existsSync(collection.dir);
    const files = dirExists ? await collectFiles(collection, skipped) : [];
    const skip = collectionSkipReason(collection, { dirExists, fileCount: files.length });
    if (skip) {
      console.warn(`[sync-docs] 경고 — ${skip}`);
      continue;
    }
    if (files.length === 0) throw new Error(`컬렉션 ${collection.id} 에 대상 파일이 없습니다: ${collection.dir}`);
    collections.push({ collection, files });
  }

  const result = await syncDevDocs({ collections, mapping: await readJson(DEV_MAPPING_FILE), client, log });
  await writeJson(DEV_MAPPING_FILE, result.mapping);
  await writeSitemapEntries(result.spaceId, result.entries);

  log(`dev 완료 — 스페이스 ${result.spaceId}`);
  for (const [id, s] of Object.entries(result.summary)) {
    log(`  ${id}: 생성 ${s.created} · 갱신 ${s.updated} · 동일 ${s.same} · 평탄화 링크 ${s.flattened.length} · 로컬 이미지 ${s.images.length}`);
  }
  if (skipped.length) log(`크기 초과로 건너뜀 ${skipped.length}개: ${skipped.join(', ')}`);
  if (result.stale.length) console.warn(`[sync-docs] 경고 — 리포에서 사라진 문서가 매핑에 남아 있다(페이지는 지우지 않음): ${result.stale.join(', ')}`);
  const flattened = Object.values(result.summary).flatMap((s) => s.flattened);
  if (flattened.length) {
    console.warn(`[sync-docs] 평탄화된 링크 ${flattened.length}건(동기화 대상 밖):`);
    flattened.forEach((f) => console.warn(`  - ${f}`));
  }
  const images = Object.values(result.summary).flatMap((s) => s.images);
  if (images.length) {
    console.warn(`[sync-docs] 로컬 이미지 참조 ${images.length}건(첨부는 올리지 않음 — 원문 그대로):`);
    images.forEach((i) => console.warn(`  - ${i}`));
  }
}

async function main() {
  const which = parseArgs(process.argv.slice(2));
  const token = await readToken();
  if (!token) console.warn('[sync-docs] 경고 — DOCS_IMPORT_TOKEN 이 비어 있다. 서버가 403 을 돌려줄 수 있다.');
  const client = createDocsClient({ baseUrl: DOCS_API, token, fetch: globalThis.fetch });
  if (which.notes) await runNotes(client);
  if (which.dev) await runDev(client);
}

main().catch((err) => {
  console.error(err instanceof Error ? `[sync-docs] ${err.message}` : err);
  process.exit(1);
});
