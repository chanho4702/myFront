#!/usr/bin/env node
// 각 서비스의 OpenAPI JSON(`/v3/api-docs`) 수집 → scripts/api/specs/<id>.json (정렬·pretty, 커밋한다 — CI 에는 컨테이너가 없다).
// 컨테이너 포트는 호스트에 열려 있지 않으므로 컴포즈 네트워크 안에서 curl 컨테이너를 띄워 받는다.
//
// 사용: npm run api:collect                       # wiki · alm · org 전부
//       npm run api:collect -- --only=wiki,alm
//       npm run api:collect -- --from-fixture      # 도커 대신 scripts/api/fixtures/sample.json 을 읽는다(파이프라인 점검용)
//       node scripts/api/collect-openapi.mjs --from-fixture=<파일> --out-dir=<디렉터리>
// 실패한 서비스가 하나라도 있으면 종료 코드 1 — 성공한 서비스의 파일은 이미 써 둔 상태다.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPOSE_NETWORK, CURL_IMAGE, OPENAPI_PATH, selectServices } from './services.mjs';
import { sortSpec, validateSpec } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SPECS_DIR = path.join(HERE, 'specs');
export const SAMPLE_FIXTURE = path.join(HERE, 'fixtures', 'sample.json');

const log = (m) => console.log(`[api:collect] ${m}`);

export function parseArgs(argv) {
  const opts = { only: null, fromFixture: null, outDir: SPECS_DIR };
  for (const a of argv) {
    if (a.startsWith('--only=')) opts.only = a.slice('--only='.length);
    else if (a === '--from-fixture') opts.fromFixture = SAMPLE_FIXTURE;
    else if (a.startsWith('--from-fixture=')) opts.fromFixture = path.resolve(a.slice('--from-fixture='.length));
    else if (a.startsWith('--out-dir=')) opts.outDir = path.resolve(a.slice('--out-dir='.length));
    else throw new Error(`모르는 옵션: ${a}`);
  }
  return opts;
}

export const specUrl = (service) => `http://${service.host}:${service.port}${OPENAPI_PATH}`;

/** `docker run` 인자 — 테스트에서 명령 구성을 검증하기 위해 분리. */
export function dockerCurlArgs(service) {
  return ['run', '--rm', '--network', COMPOSE_NETWORK, CURL_IMAGE, '-sf', '--max-time', '20', specUrl(service)];
}

/** 컨테이너에서 스펙 본문을 받는다. 실패는 한국어 사유를 담은 Error. */
export function fetchViaDocker(service, run = spawnSync) {
  const r = run('docker', dockerCurlArgs(service), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${service.id}: docker 실행 실패 — ${r.error.message}`);
  if (r.status !== 0) {
    const detail = (r.stderr || '').trim();
    throw new Error(`${service.id}: ${specUrl(service)} 응답 실패(curl 종료 코드 ${r.status})${detail ? ` — ${detail}` : ''}. 서비스가 떠 있고 /v3/api-docs 가 permitAll 인지 확인`);
  }
  return r.stdout;
}

/** 본문 → 검증·정렬된 스펙 객체. */
export function normalizeSpecText(service, text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`${service.id}: 응답이 JSON 이 아닙니다 — ${err.message}`);
  }
  const problem = validateSpec(json);
  if (problem) throw new Error(`${service.id}: OpenAPI 문서가 아닙니다 — ${problem}`);
  return sortSpec(json);
}

export function collect({ services, fromFixture, outDir, run = spawnSync }) {
  mkdirSync(outDir, { recursive: true });
  const failures = [];
  const written = [];
  for (const service of services) {
    try {
      const text = fromFixture ? readFileSync(fromFixture, 'utf8') : fetchViaDocker(service, run);
      const spec = normalizeSpecText(service, text);
      const file = path.join(outDir, `${service.id}.json`);
      writeFileSync(file, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
      written.push(file);
      log(`${service.id}: 경로 ${Object.keys(spec.paths).length}개 → ${path.relative(process.cwd(), file)}${fromFixture ? ' (픽스처)' : ''}`);
    } catch (err) {
      if (service.optional) {
        // 배포 전 서비스는 실패가 정상이다 — 경고만 남기고 다른 서비스의 수집·종료 코드에 영향을 주지 않는다.
        console.warn(`[api:collect] 건너뜀(optional) — ${err.message}`);
        continue;
      }
      failures.push(err.message);
      console.error(`[api:collect] 실패 — ${err.message}`);
    }
  }
  return { written, failures };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const services = selectServices(opts.only);
  const { failures } = collect({ services, fromFixture: opts.fromFixture, outDir: opts.outDir });
  if (failures.length) {
    console.error(`[api:collect] ${failures.length}개 서비스 실패. 다음 단계(api:gen)는 성공한 스펙만 반영한다.`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`[api:collect] ${err.message}`);
    process.exit(1);
  }
}
