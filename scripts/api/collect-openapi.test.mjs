import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collect, dockerCurlArgs, fetchViaDocker, normalizeSpecText, parseArgs, SAMPLE_FIXTURE, SPECS_DIR } from './collect-openapi.mjs';
import { generate, listSpecFiles, parseArgs as parseGenArgs } from './gen-reference.mjs';
import { SERVICES } from './services.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COLLECTOR = path.join(HERE, 'collect-openapi.mjs');
const GENERATOR = path.join(HERE, 'gen-reference.mjs');
const WIKI = SERVICES[0];

const tmp = () => mkdtempSync(path.join(tmpdir(), 'api-collect-'));
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

test('인자: --only · --from-fixture · --out-dir, 모르는 옵션은 오류', () => {
  assert.deepEqual(parseArgs([]), { only: null, fromFixture: null, outDir: SPECS_DIR });
  assert.equal(parseArgs(['--from-fixture']).fromFixture, SAMPLE_FIXTURE);
  assert.equal(parseArgs(['--only=wiki']).only, 'wiki');
  assert.equal(path.basename(parseArgs(['--from-fixture=x/y.json']).fromFixture), 'y.json');
  assert.throws(() => parseArgs(['--nope']), /모르는 옵션/);
  assert.throws(() => parseGenArgs(['--nope']), /모르는 옵션/);
});

test('docker 명령: 컴포즈 네트워크 안에서 고정 태그 curl 이미지로 /v3/api-docs 를 받는다', () => {
  assert.deepEqual(dockerCurlArgs(WIKI), ['run', '--rm', '--network', 'platform_default', 'curlimages/curl:8.11.1', '-sf', '--max-time', '20', 'http://wiki-backend:9110/v3/api-docs']);
  const calls = [];
  const ok = (cmd, args) => {
    calls.push([cmd, args]);
    return { status: 0, stdout: '{"openapi":"3.1.0","paths":{}}', stderr: '' };
  };
  assert.equal(fetchViaDocker(WIKI, ok), '{"openapi":"3.1.0","paths":{}}');
  assert.equal(calls[0][0], 'docker');
  assert.throws(() => fetchViaDocker(WIKI, () => ({ status: 22, stdout: '', stderr: '' })), /wiki: http:\/\/wiki-backend:9110\/v3\/api-docs 응답 실패\(curl 종료 코드 22\)/);
  assert.throws(() => fetchViaDocker(WIKI, () => ({ error: new Error('ENOENT') })), /docker 실행 실패 — ENOENT/);
});

test('응답 검증: JSON 아님 · OpenAPI 아님 · 정상이면 정렬된 스펙', () => {
  assert.throws(() => normalizeSpecText(WIKI, '<html>'), /wiki: 응답이 JSON 이 아닙니다/);
  assert.throws(() => normalizeSpecText(WIKI, '{"swagger":"2.0"}'), /wiki: OpenAPI 문서가 아닙니다 — openapi 필드가 3\.x 가 아닙니다/);
  const spec = normalizeSpecText(WIKI, readFileSync(SAMPLE_FIXTURE, 'utf8'));
  assert.deepEqual(Object.keys(spec.paths), [...Object.keys(spec.paths)].sort());
});

test('collect: 실패한 서비스는 사유를 모으고 성공한 서비스의 파일은 쓴다 — optional 서비스의 실패는 경고로만', () => {
  const out = tmp();
  try {
    // alm 은 진짜 실패, migration(optional) 은 배포 전이라 연결 자체가 안 되는 상황을 흉내 낸다
    const fake = (cmd, args) => {
      const url = args.at(-1);
      if (url.includes('alm-backend')) return { status: 7, stdout: '', stderr: 'Failed to connect' };
      if (url.includes('migration-service')) return { status: 6, stdout: '', stderr: 'Could not resolve host' };
      return { status: 0, stdout: readFileSync(SAMPLE_FIXTURE, 'utf8'), stderr: '' };
    };
    const origError = console.error;
    const origWarn = console.warn;
    const warnings = [];
    console.error = () => {};
    console.warn = (m) => warnings.push(String(m));
    let result;
    try {
      result = collect({ services: SERVICES, fromFixture: null, outDir: out, run: fake });
    } finally {
      console.error = origError;
      console.warn = origWarn;
    }
    assert.equal(result.failures.length, 1, 'optional 서비스는 failures 에 세지 않는다');
    assert.match(result.failures[0], /alm: .*Failed to connect/);
    assert.equal(warnings.filter((w) => w.includes('건너뜀(optional)') && w.includes('migration')).length, 1);
    assert.deepEqual(readdirSync(out).sort(), ['org.json', 'wiki.json']);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('--from-fixture 파이프라인: 수집(정렬·pretty) → 생성(디렉터리 비우고 다시 씀) — CLI 끝에서 끝까지', () => {
  const base = tmp();
  const specs = path.join(base, 'specs');
  const docs = path.join(base, 'docs');
  try {
    const c = run(COLLECTOR, ['--from-fixture', `--out-dir=${specs}`, '--only=wiki,org']);
    assert.equal(c.status, 0, c.stderr);
    assert.deepEqual(readdirSync(specs).sort(), ['org.json', 'wiki.json']);
    const text = readFileSync(path.join(specs, 'wiki.json'), 'utf8');
    assert.ok(text.endsWith('}\n'));
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`); // pretty 2칸

    // 사라질 파일을 미리 심어 두면 생성 후에는 없어야 한다
    mkdirSync(path.join(docs, 'wiki'), { recursive: true });
    writeFileSync(path.join(docs, 'wiki', 'stale-tag.md'), 'x', 'utf8');
    const g = run(GENERATOR, [`--specs-dir=${specs}`, `--out-dir=${docs}`]);
    assert.equal(g.status, 0, g.stderr);
    assert.match(g.stderr, /스펙이 아직 없는 서비스는 건너뛴다: alm/);
    assert.deepEqual(readdirSync(path.join(docs, 'wiki')).sort(), ['README.md', 'attachments.md', 'pages.md', 'spaces.md']);
    assert.deepEqual(readdirSync(path.join(docs, 'org')).sort(), ['README.md', 'attachments.md', 'pages.md', 'spaces.md']);
    assert.match(readFileSync(path.join(docs, 'org', 'README.md'), 'utf8'), /^> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석\. 직접 고치지 말 것\n\n# Org API\n/);

    // --only 로 좁혔는데 스펙이 없으면 오류, 모르는 스펙 파일도 오류
    const bad = run(GENERATOR, [`--specs-dir=${specs}`, `--out-dir=${docs}`, '--only=alm']);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /스펙 파일이 없는 서비스: alm/);
    writeFileSync(path.join(specs, 'board.json'), '{}', 'utf8');
    assert.throws(() => listSpecFiles(specs), /services\.mjs 에 없는 스펙 파일: board\.json/);
    assert.throws(() => generate({ specsDir: path.join(base, 'none'), outDir: docs, only: null }), /생성할 스펙이 없습니다/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
