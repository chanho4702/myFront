import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  NOTICE,
  sortSpec,
  resolveRef,
  typeLabel,
  flattenSchema,
  slugify,
  headingAnchor,
  exampleValue,
  curlExample,
  listOperations,
  listTags,
  renderTagPage,
  renderServiceReadme,
  renderService,
  validateSpec,
  compareMethods,
} from './lib.mjs';
import { SERVICES, selectServices, COMPOSE_NETWORK } from './services.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = JSON.parse(readFileSync(path.join(HERE, 'fixtures', 'sample.json'), 'utf8'));
const EXPECTED_DIR = path.join(HERE, 'fixtures', 'expected', 'wiki');
const WIKI = SERVICES.find((s) => s.id === 'wiki');

test('서비스 선언: 네 서비스(migration 은 optional)·컴포즈 네트워크·--only 선택', () => {
  assert.deepEqual(
    SERVICES.map((s) => [s.id, s.title, s.host, s.port]),
    [
      ['wiki', 'WIKI API', 'wiki-backend', 9110],
      ['alm', 'ALM API', 'alm-backend', 9120],
      ['org', 'Org API', 'org-service', 9130],
      ['migration', 'Migration API', 'migration-service', 9170],
    ],
  );
  assert.deepEqual(SERVICES.filter((s) => s.optional).map((s) => s.id), ['migration']);
  assert.equal(COMPOSE_NETWORK, 'platform_default');
  assert.deepEqual(selectServices('org,wiki').map((s) => s.id), ['org', 'wiki']);
  assert.equal(selectServices(null).length, 4);
  assert.throws(() => selectServices('board'), /모르는 서비스 id: board/);
});

test('스펙 정렬: 최상위 읽기 순서, 경로 문자열순, 메서드 GET/POST/PUT/PATCH/DELETE 순, 컴포넌트 이름순', () => {
  const sorted = sortSpec(SAMPLE);
  assert.deepEqual(Object.keys(sorted), ['openapi', 'info', 'servers', 'security', 'tags', 'paths', 'components']);
  assert.deepEqual(sorted.tags.map((t) => t.name), ['Attachments', 'Pages', 'Spaces']);
  const paths = Object.keys(sorted.paths);
  assert.deepEqual(paths, [...paths].sort());
  assert.deepEqual(Object.keys(sorted.paths['/api/wiki/spaces']), ['get', 'post']);
  assert.deepEqual(Object.keys(sorted.paths['/api/wiki/spaces/{id}']), ['get', 'put', 'delete']);
  const schemas = Object.keys(sorted.components.schemas);
  assert.deepEqual(schemas, [...schemas].sort());
  assert.deepEqual(['delete', 'patch', 'get', 'options', 'put', 'post'].sort(compareMethods), ['get', 'post', 'put', 'patch', 'delete', 'options']);
  // 스키마 안 필드 순서(선언 순서)는 손대지 않는다
  assert.deepEqual(Object.keys(sorted.components.schemas.CreateSpaceRequest.properties), ['key', 'name', 'description']);
  // 원본은 바뀌지 않는다
  assert.equal(SAMPLE.tags[0].name, 'Spaces');
});

test('$ref 해석과 타입 표기', () => {
  assert.equal(resolveRef('#/components/schemas/PlatformError', SAMPLE).required[0], 'error');
  assert.equal(resolveRef('#/components/schemas/Nope', SAMPLE), null);
  assert.equal(resolveRef('https://x/y#/a', SAMPLE), null);
  assert.equal(typeLabel({ $ref: '#/components/schemas/UserSummary' }), 'UserSummary');
  assert.equal(typeLabel({ type: 'integer', format: 'int64' }), 'integer(int64)');
  assert.equal(typeLabel({ type: 'array', items: { $ref: '#/components/schemas/PageSummary' } }), 'PageSummary[]');
  assert.equal(typeLabel({ type: 'string', enum: ['A', 'B'] }), 'string enum(A, B)');
  assert.equal(typeLabel({ type: ['string', 'null'] }), 'string (nullable)');
  assert.equal(typeLabel({ type: 'string', nullable: true, format: 'uuid' }), 'string(uuid) (nullable)');
  assert.equal(typeLabel({ type: 'object', additionalProperties: { type: 'string' } }), 'map<string, string>');
  assert.equal(typeLabel({ oneOf: [{ type: 'string' }, { type: 'integer' }] }), 'string or integer');
  assert.equal(typeLabel({}), 'any');
  assert.equal(typeLabel(undefined), 'any');
});

test('스키마 평탄화: $ref 2단계까지 펼치고 그 아래는 이름만, 배열·enum·nullable·map 표기', () => {
  const rows = flattenSchema({ $ref: '#/components/schemas/PageResponse' }, SAMPLE.components);
  const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.deepEqual(
    rows.map((r) => r.name),
    [
      'id',
      'title',
      'content',
      'status',
      'labels',
      'author',
      'author.id',
      'author.name',
      'author.org',
      'author.org.id',
      'author.org.name',
      'space',
      'space.id',
      'space.key',
      'space.owner',
      'space.owner.id',
      'space.owner.name',
      'space.owner.org',
      'properties',
      'version',
      'updatedAt',
    ],
  );
  assert.equal(byName['space.owner.org'].type, 'OrgSummary'); // 3단계 — 이름만
  assert.equal(byName.status.type, 'string enum(DRAFT, PUBLISHED, ARCHIVED)');
  assert.equal(byName.status.required, true);
  assert.equal(byName.labels.type, 'string[]');
  assert.equal(byName.labels.example, '["guide","onboarding"]');
  assert.equal(byName.properties.type, 'map<string, string>');
  assert.equal(byName['author.id'].description, 'Keycloak subject');
  assert.equal(byName['author.id'].required, true);
  assert.equal(byName.author.required, false);
  assert.equal(byName.updatedAt.type, 'string(date-time)');

  // depth=1 이면 author.org 는 이름만
  const shallow = flattenSchema({ $ref: '#/components/schemas/PageResponse' }, SAMPLE.components, 1).map((r) => r.name);
  assert.ok(shallow.includes('author.org'));
  assert.equal(shallow.includes('author.org.id'), false);

  // 배열 원소 객체는 `name[].field`, 루트 배열은 `[]`
  const list = flattenSchema({ type: 'array', items: { $ref: '#/components/schemas/PlatformError' } }, SAMPLE.components);
  assert.deepEqual(list.map((r) => r.name), ['[].error']);
  const nested = flattenSchema(
    { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/OrgSummary' } } } },
    SAMPLE.components,
  ).map((r) => [r.name, r.type]);
  assert.deepEqual(nested, [
    ['items', 'OrgSummary[]'],
    ['items[].id', 'integer(int64)'],
    ['items[].name', 'string'],
  ]);

  // nullable(3.1 배열 type)
  const create = flattenSchema({ $ref: '#/components/schemas/CreatePageRequest' }, SAMPLE.components);
  assert.equal(create.find((r) => r.name === 'parentId').type, 'integer(int64) (nullable)');

  // 자기 참조는 무한히 펼치지 않는다
  const cyclic = { schemas: { Node: { type: 'object', properties: { child: { $ref: '#/components/schemas/Node' } } } } };
  assert.deepEqual(flattenSchema({ $ref: '#/components/schemas/Node' }, cyclic).map((r) => r.name), ['child']);
  assert.deepEqual(flattenSchema(undefined, SAMPLE.components), []);
});

test('slug 와 앵커', () => {
  assert.equal(slugify('Spaces'), 'spaces');
  assert.equal(slugify('Space Members'), 'space-members');
  assert.equal(slugify('  Issue/Links (v2) '), 'issue-links-v2');
  assert.equal(slugify('한글 태그'), '한글-태그');
  assert.equal(slugify('!!!'), 'untitled');
  assert.equal(headingAnchor('GET /api/wiki/spaces/{id}'), 'get-apiwikispacesid');
});

test('예시 값: example > default > enum 첫 값 > 자리표시자, 객체는 required 만', () => {
  assert.deepEqual(exampleValue({ $ref: '#/components/schemas/CreateSpaceRequest' }, SAMPLE), { key: 'TEAM', name: '팀 위키' });
  assert.deepEqual(exampleValue({ $ref: '#/components/schemas/UpdatePageRequest' }, SAMPLE), { title: '온보딩 가이드', version: 7 });
  assert.equal(exampleValue({ type: 'string', enum: ['A', 'B'] }, SAMPLE), 'A');
  assert.equal(exampleValue({ type: 'string', format: 'date-time' }, SAMPLE), '2026-01-01T00:00:00Z');
  assert.deepEqual(exampleValue({ type: 'object', properties: { a: { type: 'integer' }, b: { type: 'boolean' } } }, SAMPLE), { a: 0, b: false });
  assert.deepEqual(exampleValue({ type: 'array', items: { type: 'string' } }, SAMPLE), ['string']);
  // required 에 $ref 가 있으면 depth 만큼 내려간다
  assert.deepEqual(exampleValue({ $ref: '#/components/schemas/SpaceSummary' }, SAMPLE), { id: 42, key: 'TEAM' });
  const deep = { schemas: { A: { type: 'object', required: ['b'], properties: { b: { $ref: '#/components/schemas/B' } } }, B: { type: 'object', required: ['c'], properties: { c: { $ref: '#/components/schemas/C' } } }, C: { type: 'object', required: ['d'], properties: { d: { $ref: '#/components/schemas/D' } } }, D: { type: 'object', required: ['x'], properties: { x: { type: 'integer' } } } } };
  assert.deepEqual(exampleValue({ $ref: '#/components/schemas/A' }, { components: deep }), { b: { c: { d: {} } } });
});

test('curl 예시: 본문 없음 / JSON 본문 / multipart / 경로·쿼리·헤더 파라미터', () => {
  const getOp = SAMPLE.paths['/api/wiki/spaces/{id}'].get;
  assert.equal(
    curlExample(getOp, '/api/wiki/spaces/{id}', WIKI, { spec: SAMPLE, method: 'get' }),
    ['curl -X GET "https://<your-host>/api/wiki/spaces/<id>" \\', '  -H "Authorization: Bearer chanho_pat_…"', ''].join('\n'),
  );
  const postOp = SAMPLE.paths['/api/wiki/spaces'].post;
  assert.equal(
    curlExample(postOp, '/api/wiki/spaces', WIKI, { spec: SAMPLE, method: 'post' }),
    [
      'curl -X POST "https://<your-host>/api/wiki/spaces" \\',
      '  -H "Authorization: Bearer chanho_pat_…" \\',
      '  -H "Content-Type: application/json" \\',
      "  -d '{",
      '    "key": "TEAM",',
      '    "name": "팀 위키"',
      "  }'",
      '',
    ].join('\n'),
  );
  // ctx 없이(스펙 없이) 불러도 죽지 않는다 — $ref 를 못 풀면 빈 본문
  assert.match(curlExample(postOp, '/api/wiki/spaces'), /-d '\{\}'\n$/);
  const upload = SAMPLE.paths['/api/wiki/pages/{id}/attachments'].post;
  const multipart = curlExample(upload, '/api/wiki/pages/{id}/attachments', WIKI, { spec: SAMPLE, method: 'post' });
  assert.match(multipart, /-F "file=@<file>" \\\n  -F "comment=회의록 원본"\n$/);
  assert.equal(multipart.includes('Content-Type'), false);
  // 필수 쿼리·헤더, 예시가 있는 경로 변수, 작은따옴표 이스케이프
  const op = {
    parameters: [
      { name: 'id', in: 'path', required: true, example: 7, schema: { type: 'integer' } },
      { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
      { name: 'page', in: 'query', required: false, schema: { type: 'integer' } },
      { name: 'X-Org', in: 'header', required: true, schema: { type: 'string', example: 'acme' } },
    ],
    requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { note: { type: 'string', example: "it's" } } } } } },
  };
  assert.equal(
    curlExample(op, '/x/{id}', { baseUrl: 'https://api.example' }, { method: 'patch' }),
    [
      'curl -X PATCH "https://api.example/x/7?q=<q>" \\',
      '  -H "Authorization: Bearer chanho_pat_…" \\',
      '  -H "X-Org: acme" \\',
      '  -H "Content-Type: application/json" \\',
      "  -d '{",
      `    "note": "it'\\''s"`,
      "  }'",
      '',
    ].join('\n'),
  );
});

test('오퍼레이션·태그 목록은 정렬돼 있고 태그 없는 오퍼레이션은 default 로 묶인다', () => {
  const ops = listOperations(SAMPLE);
  assert.equal(ops.length, 13);
  assert.deepEqual(ops.slice(0, 4).map((o) => `${o.method} ${o.path}`), [
    'DELETE /api/wiki/attachments/{id}',
    'GET /api/wiki/pages/{id}',
    'PUT /api/wiki/pages/{id}',
    'DELETE /api/wiki/pages/{id}',
  ]);
  assert.deepEqual(listTags(SAMPLE).map((t) => [t.name, t.count]), [
    ['Attachments', 3],
    ['Pages', 5],
    ['Spaces', 5],
  ]);
  const loose = { openapi: '3.1.0', paths: { '/x': { get: { summary: 'x' } } } };
  assert.deepEqual(listTags(loose), [{ name: 'default', description: '', count: 1 }]);
  assert.match(renderTagPage(loose, 'default'), /# default\n/);
  // 선언만 되고 쓰이지 않는 태그는 목록에서 빠진다
  assert.deepEqual(listTags({ openapi: '3.1.0', tags: [{ name: 'Unused' }], paths: {} }), []);
});

test('태그 페이지: 첫 줄 안내, H1, 설명, 엔드포인트 표, 엔드포인트별 절', () => {
  const md = renderTagPage(SAMPLE, 'Spaces', WIKI);
  const lines = md.split('\n');
  assert.equal(lines[0], `> ${NOTICE}`);
  assert.equal(lines[2], '# Spaces');
  assert.equal(lines[4], '스페이스(문서 묶음) 관리');
  assert.equal(lines[6], '## 엔드포인트');
  assert.match(md, /\| `GET` \| `\/api\/wiki\/spaces` \| \[스페이스 목록\]\(#get-apiwikispaces\) \|/);
  const headings = lines.filter((l) => l.startsWith('## ')).slice(1);
  assert.deepEqual(headings, [
    '## GET /api/wiki/spaces',
    '## POST /api/wiki/spaces',
    '## GET /api/wiki/spaces/{id}',
    '## PUT /api/wiki/spaces/{id}',
    '## DELETE /api/wiki/spaces/{id}',
  ]);
  assert.match(md, /### 파라미터\n\n\| 이름 \| 위치 \| 타입 \| 필수 \| 설명 \|/);
  assert.match(md, /### 요청 본문\n\n`application\/json` — `CreateSpaceRequest` \(필수\)/);
  assert.match(md, /### 응답\n\n\| 상태 \| 설명 \| 스키마 \|\n\| --- \| --- \| --- \|\n\| `200` \| OK \| `SpaceResponse\[\]` \|/);
  assert.match(md, /\| `409` \| 버전 충돌 \| `PlatformError` \|/);
  // 2xx 응답 본문은 필드 표로 펼친다 — 배열 응답은 `[]` 접두, 중첩 $ref 는 2단계
  assert.match(md, /\*\*200 본문\*\* — `SpaceResponse\[\]`\n\n\| 필드 \| 타입 \| 필수 \| 설명 \| 예시 \|\n\| --- \| --- \| --- \| --- \| --- \|\n\| `\[\]\.id` \| `integer\(int64\)` \| 예 \|  \| `42` \|/);
  assert.match(md, /\| `\[\]\.owner\.org\.id` \| `integer\(int64\)` \| 예 \|/);
  assert.match(md, /\*\*201 본문\*\* — `SpaceResponse`\n\n\| 필드 /);
  // 오류 응답(PlatformError)은 표 없이 이름만, 204 는 본문 없음
  assert.equal((md.match(/\*\*(401|403|404|409|400) 본문\*\*/g) ?? []).length, 0);
  assert.equal(md.includes('**204 본문**'), false);
  assert.equal((md.match(/\*\*2\d\d 본문\*\*/g) ?? []).length, 4); // GET 목록·POST·GET 단건·PUT (DELETE 는 204)
  assert.match(md, /낙관적 락 — `version` 이 현재 값과 다르면 409\./);
  assert.match(md, /### curl\n\n```bash\ncurl -X GET/);
  assert.ok(md.endsWith('```\n'));
  // 태그 객체로 불러도 같다
  assert.equal(renderTagPage(SAMPLE, { name: 'Spaces', description: '스페이스(문서 묶음) 관리' }, WIKI), md);
});

test('서비스 README: 개요 표, 인증, 리소스 링크(<slug>.md), 공통 오류', () => {
  const md = renderServiceReadme(SAMPLE, WIKI);
  assert.equal(md.split('\n')[0], `> ${NOTICE}`);
  assert.match(md, /\n# WIKI API\n/);
  assert.match(md, /\| 버전 \| `0\.1\.0` \|\n\| 기본 URL \| `https:\/\/<your-host>` \|\n\| 엔드포인트 \| 13 \|/);
  assert.match(md, /## 인증\n\n개인 API 토큰 `chanho_pat_…` 또는 세션 JWT\. 모든 엔드포인트가 이 인증을 요구한다\.\n\n```http\nAuthorization: Bearer chanho_pat_…\n```/);
  assert.match(md, /\| \[Attachments\]\(attachments\.md\) \| 페이지 첨부 파일 \| 3 \|\n\| \[Pages\]\(pages\.md\) \| 페이지 조회·작성·수정 \| 5 \|\n\| \[Spaces\]\(spaces\.md\) \| 스페이스\(문서 묶음\) 관리 \| 5 \|/);
  assert.match(md, /## 공통 오류\n\n[^\n]*`PlatformError`[^\n]*\n\n\| 필드 \| 타입 \| 필수 \| 설명 \| 예시 \|\n\| --- \| --- \| --- \| --- \| --- \|\n\| `error` \| `string` \| 예 \|/);
  // 보안 스킴·PlatformError 가 없는 스펙
  const bare = renderServiceReadme({ openapi: '3.1.0', info: { title: 'X' }, paths: {} }, { id: 'x', title: 'X API' });
  assert.match(bare, /스펙에 보안 스킴이 없다/);
  assert.equal(bare.includes('## 공통 오류'), false);
  assert.match(bare, /## 리소스\n\n오퍼레이션이 없다\./);
});

test('결정성: 같은 입력 두 번, 키 순서를 섞은 입력도 같은 문자열', () => {
  const a = renderService(SAMPLE, WIKI);
  const b = renderService(JSON.parse(JSON.stringify(SAMPLE)), WIKI);
  assert.deepEqual(a, b);
  const shuffled = JSON.parse(JSON.stringify(SAMPLE));
  shuffled.paths = Object.fromEntries(Object.entries(shuffled.paths).reverse());
  shuffled.tags = [...shuffled.tags].reverse();
  for (const item of Object.values(shuffled.paths)) {
    const entries = Object.entries(item).reverse();
    for (const k of Object.keys(item)) delete item[k];
    Object.assign(item, Object.fromEntries(entries));
  }
  assert.deepEqual(renderService(shuffled, WIKI), a);
  assert.deepEqual(renderService(sortSpec(SAMPLE), WIKI), a);
});

test('골든 파일: fixtures/expected/wiki 와 한 글자도 다르지 않다', () => {
  const files = renderService(SAMPLE, WIKI);
  const expected = readdirSync(EXPECTED_DIR).filter((f) => f.endsWith('.md')).sort();
  assert.deepEqual(Object.keys(files).sort(), expected);
  for (const name of expected) {
    assert.equal(files[name], readFileSync(path.join(EXPECTED_DIR, name), 'utf8').replace(/\r\n/g, '\n'), name);
  }
});

test('슬러그가 겹치는 태그는 오류, 스펙 검증은 한국어 사유', () => {
  const dup = { openapi: '3.1.0', paths: { '/a': { get: { tags: ['Space Members'] } }, '/b': { get: { tags: ['space-members'] } } } };
  assert.throws(() => renderService(dup, WIKI), /파일명이 겹칩니다\(space-members\.md\)/);
  assert.equal(validateSpec(SAMPLE), null);
  assert.match(validateSpec([]), /JSON 객체가 아닙니다/);
  assert.match(validateSpec({ swagger: '2.0', paths: {} }), /openapi 필드가 3\.x 가 아닙니다/);
  assert.match(validateSpec({ openapi: '3.1.0' }), /paths 가 없습니다/);
});
