#!/usr/bin/env node
// scripts/api/specs/<id>.json → docs/api-reference/<id>/README.md + <태그 슬러그>.md 생성.
// 서비스 디렉터리를 비우고 다시 쓰므로 사라진 태그의 페이지는 남지 않는다. 생성물은 커밋한다(문서 임포터가 위키로 올린다).
//
// 사용: npm run api:gen                    # specs 에 있는 서비스 전부
//       npm run api:gen -- --only=wiki
//       node scripts/api/gen-reference.mjs --specs-dir=<디렉터리> --out-dir=<디렉터리>

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectServices, serviceById } from './services.mjs';
import { renderService } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
export const SPECS_DIR = path.join(HERE, 'specs');
export const OUT_DIR = path.join(ROOT, 'docs', 'api-reference');

const log = (m) => console.log(`[api:gen] ${m}`);

export function parseArgs(argv) {
  const opts = { only: null, specsDir: SPECS_DIR, outDir: OUT_DIR };
  for (const a of argv) {
    if (a.startsWith('--only=')) opts.only = a.slice('--only='.length);
    else if (a.startsWith('--specs-dir=')) opts.specsDir = path.resolve(a.slice('--specs-dir='.length));
    else if (a.startsWith('--out-dir=')) opts.outDir = path.resolve(a.slice('--out-dir='.length));
    else throw new Error(`모르는 옵션: ${a}`);
  }
  return opts;
}

/** specs 디렉터리의 `<id>.json` 중 서비스 목록에 있는 것. 모르는 파일은 오류(오타 방지). */
export function listSpecFiles(specsDir) {
  if (!existsSync(specsDir)) return [];
  const files = readdirSync(specsDir).filter((f) => f.endsWith('.json')).sort();
  const unknown = files.filter((f) => !serviceById(f.replace(/\.json$/, '')));
  if (unknown.length) throw new Error(`services.mjs 에 없는 스펙 파일: ${unknown.join(', ')} (${specsDir})`);
  return files.map((f) => ({ service: serviceById(f.replace(/\.json$/, '')), file: path.join(specsDir, f) }));
}

/** 서비스 디렉터리를 통째로 비우고 생성물을 쓴다. 반환은 쓴 파일 경로. */
export function writeService(outDir, service, files) {
  const dir = path.join(outDir, service.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const written = [];
  for (const name of Object.keys(files).sort()) {
    const file = path.join(dir, name);
    writeFileSync(file, files[name], 'utf8');
    written.push(file);
  }
  return written;
}

export function generate({ specsDir, outDir, only }) {
  const wanted = new Set(selectServices(only).map((s) => s.id));
  const targets = listSpecFiles(specsDir).filter((t) => wanted.has(t.service.id));
  const missing = [...wanted].filter((id) => !targets.some((t) => t.service.id === id));
  if (missing.length && only) throw new Error(`스펙 파일이 없는 서비스: ${missing.join(', ')} (먼저 npm run api:collect -- --only=${missing.join(',')})`);
  if (!targets.length) throw new Error(`생성할 스펙이 없습니다: ${specsDir} (먼저 npm run api:collect)`);
  if (missing.length) console.warn(`[api:gen] 경고 — 스펙이 아직 없는 서비스는 건너뛴다: ${missing.join(', ')}`);

  const result = [];
  for (const { service, file } of targets) {
    const spec = JSON.parse(readFileSync(file, 'utf8'));
    const files = renderService(spec, service);
    const written = writeService(outDir, service, files);
    result.push({ service, written });
    log(`${service.id}: 페이지 ${written.length}개 → ${path.relative(process.cwd(), path.join(outDir, service.id))}`);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    generate(parseArgs(process.argv.slice(2)));
  } catch (err) {
    console.error(`[api:gen] ${err.message}`);
    process.exit(1);
  }
}
