#!/usr/bin/env node
// 옵시디언 볼트의 "MSA_TEMPLATE 정리" NN 노트를 공개 문서 위키(docs 인스턴스)에 동기화한다.
// 멱등 — 여러 번 돌려도 같은 페이지를 갱신하며, 내용이 같으면 손대지 않는다.
// CI 에서는 돌지 않는다(볼트도 토큰도 없다). 매핑 파일 scripts/docs-pages.json 은 커밋한다.
//
// 사용: npm run sync:docs
//       DOCS_API=http://127.0.0.1:19910 DOCS_IMPORT_TOKEN=... node scripts/sync-docs.mjs
//       OBSIDIAN_VAULT="D:/vault" node scripts/sync-docs.mjs

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWhitelisted } from './notes/transform.mjs';
import { createDocsClient, syncDocs } from './docs/lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.OBSIDIAN_VAULT ?? 'C:/myBrain/내 로컬';
const SOURCE_DIR = path.join(VAULT, 'msa', 'MSA_TEMPLATE 정리');
const MAPPING_FILE = path.join(ROOT, 'scripts', 'docs-pages.json');
const DOCS_API = process.env.DOCS_API ?? 'http://127.0.0.1:19910';
const TOKEN = process.env.DOCS_IMPORT_TOKEN ?? '';

async function main() {
  if (!existsSync(SOURCE_DIR)) throw new Error(`[sync-docs] 볼트를 찾지 못했습니다: ${SOURCE_DIR}`);
  if (!TOKEN) console.warn('[sync-docs] 경고 — DOCS_IMPORT_TOKEN 이 비어 있다. 서버가 403 을 돌려줄 수 있다.');

  const all = await readdir(SOURCE_DIR);
  const excluded = all.filter((f) => f.endsWith('.md') && !isWhitelisted(f));
  const targets = all.filter(isWhitelisted).sort();
  if (targets.length === 0) throw new Error('[sync-docs] 화이트리스트에 걸린 노트가 0개입니다.');

  const notes = [];
  for (const file of targets) notes.push({ file, raw: await readFile(path.join(SOURCE_DIR, file), 'utf8') });

  const mapping = existsSync(MAPPING_FILE) ? JSON.parse(await readFile(MAPPING_FILE, 'utf8')) : {};

  const client = createDocsClient({ baseUrl: DOCS_API, token: TOKEN, fetch: globalThis.fetch });
  const result = await syncDocs({ notes, mapping, client, log: (m) => console.log(`[sync-docs] ${m}`) });

  // 매핑은 성공했을 때만 쓴다. 중간에 실패하면 다음 실행이 제목 lookup 으로 다시 찾는다.
  await writeFile(MAPPING_FILE, `${JSON.stringify(result.mapping, null, 2)}\n`, 'utf8');

  const { created, updated, skipped, broken, stale } = result.summary;
  console.log(`[sync-docs] 완료 — 스페이스 ${result.spaceId} · 생성 ${created} · 갱신 ${updated} · 동일 ${skipped} (노트 ${notes.length}편)`);
  if (excluded.length) console.log(`[sync-docs] 화이트리스트 제외 ${excluded.length}개: ${excluded.join(', ')}`);
  if (stale.length) console.warn(`[sync-docs] 경고 — 볼트에서 사라진 번호가 매핑에 남아 있다(페이지는 지우지 않음): ${stale.join(', ')}`);
  if (broken.length) {
    console.warn(`[sync-docs] 경고 — 평탄화된 외부 위키링크 ${broken.length}건:`);
    broken.forEach((b) => console.warn(`  - ${b}`));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? `[sync-docs] ${err.message}` : err);
  process.exit(1);
});
