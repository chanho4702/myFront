#!/usr/bin/env node
// 옵시디언 볼트의 "MSA_TEMPLATE 정리" 00~19 노트를 사이트 콘텐츠로 동기화한다.
// 산출물은 커밋된다 — 볼트가 없는 CI 러너에서도 빌드가 성공해야 하기 때문.
//
// 사용: node scripts/sync-notes.mjs
//       OBSIDIAN_VAULT="D:/vault" node scripts/sync-notes.mjs

import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isWhitelisted,
  noteIdOf,
  parseFrontmatter,
  extractTitle,
  transformWikiLinks,
  transformCallouts,
  stripNumberPrefix,
  statusLabel,
} from './notes/transform.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.OBSIDIAN_VAULT ?? 'C:/myBrain/내 로컬';
const SOURCE_DIR = path.join(VAULT, 'msa', 'MSA_TEMPLATE 정리');
const OUT_DIR = path.join(ROOT, 'src', 'site', 'content', 'notes');

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.warn(`[sync-notes] 볼트를 찾지 못했습니다: ${SOURCE_DIR}`);
    console.warn('[sync-notes] 기존 산출물을 유지하고 종료합니다. (CI 에서는 정상)');
    return;
  }

  const all = await readdir(SOURCE_DIR);
  const skipped = all.filter((f) => f.endsWith('.md') && !isWhitelisted(f));
  const targets = all.filter(isWhitelisted).sort();

  if (targets.length === 0) throw new Error('[sync-notes] 화이트리스트에 걸린 노트가 0개입니다.');

  // 대상 → id 사전. 위키링크 해석에 쓴다(확장자 유무 양쪽 허용).
  const idByTarget = new Map();
  for (const file of targets) {
    const id = noteIdOf(file);
    idByTarget.set(file.replace(/\.md$/, ''), id);
    idByTarget.set(file, id);
  }
  const resolve = (target) => idByTarget.get(target) ?? idByTarget.get(`${target}.md`) ?? null;

  // 생성물만 지운다 — 폴더째 지우면 안 된다(수기 파일이 섞이면 날아간다).
  await mkdir(OUT_DIR, { recursive: true });
  for (const f of await readdir(OUT_DIR)) {
    if (f.endsWith('.md') || f === 'index.generated.ts') await unlink(path.join(OUT_DIR, f));
  }

  const index = [];
  const brokenAll = [];
  const missingMeta = [];

  for (const file of targets) {
    const id = noteIdOf(file);
    const raw = await readFile(path.join(SOURCE_DIR, file), 'utf8');
    const { meta, body: afterMeta } = parseFrontmatter(raw);
    const { title, body: afterTitle } = extractTitle(afterMeta, file);
    const { body: afterLinks, broken } = transformWikiLinks(afterTitle, resolve);
    const body = transformCallouts(afterLinks);

    const tags = Array.isArray(meta.tags) ? meta.tags : meta.tags ? [String(meta.tags)] : [];
    const date = typeof meta['작성일'] === 'string' ? meta['작성일'] : '';
    const rawStatus = typeof meta['상태'] === 'string' ? meta['상태'] : '';
    const status = rawStatus ? statusLabel(rawStatus) : '';
    if (!tags.length || !date) missingMeta.push(file);
    broken.forEach((b) => brokenAll.push(`${file} → [[${b}]]`));

    await writeFile(path.join(OUT_DIR, `${id}.md`), `${body.trimEnd()}\n`, 'utf8');
    index.push({ id, title: stripNumberPrefix(title), tags, date, status });
  }

  const generated = [
    '// 생성 파일 — scripts/sync-notes.mjs 가 만든다. 직접 수정하지 말 것.',
    "import type { NoteMeta } from '../../types';",
    '',
    'export const noteIndex: NoteMeta[] = [',
    ...index.map((n) => `  ${JSON.stringify(n)},`),
    '];',
    '',
  ].join('\n');
  await writeFile(path.join(OUT_DIR, 'index.generated.ts'), generated, 'utf8');

  console.log(`[sync-notes] 노트 ${index.length}개 동기화 완료 → ${OUT_DIR}`);
  if (skipped.length) console.log(`[sync-notes] 화이트리스트 제외 ${skipped.length}개: ${skipped.join(', ')}`);
  if (missingMeta.length) console.warn(`[sync-notes] 경고 — frontmatter 누락: ${missingMeta.join(', ')}`);
  if (brokenAll.length) {
    console.warn(`[sync-notes] 경고 — 평탄화된 외부 위키링크 ${brokenAll.length}건:`);
    brokenAll.forEach((b) => console.warn(`  - ${b}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
