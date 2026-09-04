import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPACE_KEY,
  pageHref,
  findDuplicateIds,
  makeTargetResolver,
  metadataLine,
  pageTitle,
  renderNote,
  needsUpdate,
  mergeMapping,
  staleMappingIds,
  createDocsClient,
  DocsApiError,
  ensureSpace,
  syncDocs,
} from './docs/lib.mjs';

test('번호가 겹치는 파일을 찾는다 — 2026-09-04 볼트의 30번 둘', () => {
  const files = ['29 스프린트.md', '30 배포모델.md', '30 파리티.md', '31 토폴로지.md', '내 목표.md'];
  assert.deepEqual(findDuplicateIds(files), [{ id: '30', files: ['30 배포모델.md', '30 파리티.md'] }]);
  assert.deepEqual(findDuplicateIds(['00 a.md', '01 b.md']), []);
});

test('위키링크 대상은 확장자 유무와 무관하게 id 로 풀린다', () => {
  const resolve = makeTargetResolver(['05 API 게이트웨이 설계.md', '내 목표.md']);
  assert.equal(resolve('05 API 게이트웨이 설계'), '05');
  assert.equal(resolve('05 API 게이트웨이 설계.md'), '05');
  assert.equal(resolve('내 목표'), null);
});

test('frontmatter 는 본문 위 한 줄 인용문이 된다', () => {
  assert.equal(
    metadataLine({ 작성일: '2026-07-22', 상태: '정리본', tags: ['msa', 'template'] }),
    '> 작성일 2026-07-22 · 상태 정리본 · 태그 msa, template',
  );
  assert.equal(metadataLine({ 작성일: '2026-07-22' }), '> 작성일 2026-07-22');
  assert.equal(metadataLine({ tags: 'single' }), '> 태그 single');
  assert.equal(metadataLine({}), '');
});

test('페이지 제목은 "NN 제목" 으로 통일한다', () => {
  assert.equal(pageTitle('15', '15 — ALM·Wiki 백엔드 요구사항'), '15 ALM·Wiki 백엔드 요구사항');
  assert.equal(pageTitle('05', '05 API 게이트웨이 설계'), '05 API 게이트웨이 설계');
  assert.equal(pageTitle('07', '번호 없는 제목'), '07 번호 없는 제목');
  assert.equal(pageTitle('00', '00'), '00');
  assert.equal(pageTitle('01', 'x'.repeat(300)).length, 255);
});

test('노트 한 편이 메타 줄 + 위키 URL 링크 + 콜아웃 변환된 페이지 입력이 된다', () => {
  const raw = [
    '---',
    'tags: [msa, 인증]',
    '작성일: 2026-07-19',
    '상태: 완료 — 상세는 [[17 Wave B]]',
    '---',
    '',
    '# 18 — 배포 로그인 사건',
    '',
    '선행: [[17 Wave B|Wave B]] · 외부: [[내 목표]]',
    '',
    '> [!warning] 주의',
    '> 본문',
    '',
  ].join('\n');
  const hrefOf = (t) => (t === '17 Wave B' ? '/docs/spaces/s1/pages/p17' : null);
  const page = renderNote('18 배포 로그인 사건.md', raw, hrefOf);
  assert.equal(page.id, '18');
  assert.equal(page.title, '18 배포 로그인 사건');
  assert.equal(
    page.content,
    [
      '> 작성일 2026-07-19 · 상태 완료 — 상세는 [17 Wave B](/docs/spaces/s1/pages/p17) · 태그 msa, 인증',
      '',
      '선행: [Wave B](/docs/spaces/s1/pages/p17) · 외부: 내 목표',
      '',
      '> **[WARNING] 주의**',
      '>',
      '> 본문',
      '',
    ].join('\n'),
  );
  assert.deepEqual(page.broken, ['내 목표']);
});

test('제목이나 본문이 다를 때만 갱신한다 — CRLF·끝 공백 차이는 같은 것으로 본다', () => {
  const server = { title: '00 개요', content: '본문\r\n둘째\r\n' };
  assert.equal(needsUpdate(server, { title: '00 개요', content: '본문\n둘째' }), false);
  assert.equal(needsUpdate(server, { title: '00 개요 (수정)', content: '본문\n둘째' }), true);
  assert.equal(needsUpdate(server, { title: '00 개요', content: '본문\n셋째' }), true);
  assert.equal(needsUpdate({ title: '00 개요', content: null }, { title: '00 개요', content: '' }), false);
});

test('매핑 병합은 번호순 정렬이고 서버에서 확인한 값이 이긴다', () => {
  const merged = mergeMapping({ '01': 'p1', '00': 'stale' }, { '00': 'p0', '02': 'p2' });
  assert.deepEqual(Object.keys(merged), ['00', '01', '02']);
  assert.equal(merged['00'], 'p0');
});

test('볼트에서 사라진 번호는 stale 로 보고한다', () => {
  assert.deepEqual(staleMappingIds({ '00': 'a', '05': 'b', '09': 'c' }, ['00', '09']), ['05']);
});

test('클라이언트는 토큰 헤더를 붙이고 {"error"} 계약을 예외로 올린다', async () => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/api/wiki/pages/missing')) {
      return { ok: false, status: 404, text: async () => JSON.stringify({ error: '페이지를 찾을 수 없습니다' }) };
    }
    return { ok: true, status: 200, text: async () => JSON.stringify([{ id: 's1', key: SPACE_KEY }]) };
  };
  const client = createDocsClient({ baseUrl: 'http://127.0.0.1:19110/', token: 'secret', fetch });

  const spaces = await client.listSpaces();
  assert.deepEqual(spaces, [{ id: 's1', key: 'docs' }]);
  assert.equal(calls[0].url, 'http://127.0.0.1:19110/api/wiki/spaces');
  assert.equal(calls[0].init.headers['X-Docs-Import-Token'], 'secret');

  await assert.rejects(client.getPage('missing'), (err) => {
    assert.ok(err instanceof DocsApiError);
    assert.equal(err.status, 404);
    assert.match(err.message, /페이지를 찾을 수 없습니다/);
    return true;
  });

  await client.lookupPages('s1', ['00 개요 — 전체 구조', '01 인증']);
  assert.equal(
    calls.at(-1).url,
    `http://127.0.0.1:19110/api/wiki/spaces/s1/pages/lookup?title=${encodeURIComponent('00 개요 — 전체 구조')}&title=${encodeURIComponent('01 인증')}`,
  );
});

/** 인메모리 가짜 백엔드 — 계약(스페이스·페이지·lookup·version)만 흉내낸다. */
function fakeBackend({ spaces = [], pages = [] } = {}) {
  const state = { spaces: [...spaces], pages: [...pages], log: [], nextId: 1 };
  const client = {
    listSpaces: async () => state.spaces,
    createSpace: async (s) => {
      const space = { id: `s${state.nextId++}`, ...s };
      state.spaces.push(space);
      state.log.push(['createSpace', s.key]);
      return space;
    },
    getPage: async (id) => {
      const p = state.pages.find((x) => x.id === id);
      if (!p) throw new DocsApiError('GET', `/api/wiki/pages/${id}`, 404, 'not found');
      return { ...p };
    },
    createPage: async (p) => {
      const page = { id: `p${state.nextId++}`, version: 1, ...p };
      state.pages.push(page);
      state.log.push(['createPage', p.title]);
      return { ...page };
    },
    updatePage: async (id, body) => {
      const p = state.pages.find((x) => x.id === id);
      if (p.version !== body.expectedVersion) throw new DocsApiError('PUT', `/api/wiki/pages/${id}`, 409, 'version');
      Object.assign(p, { title: body.title, content: body.content, version: p.version + 1 });
      state.log.push(['updatePage', body.title]);
      return { ...p };
    },
    lookupPages: async (spaceId, titles) =>
      state.pages.filter((p) => p.spaceId === spaceId && titles.includes(p.title)).map(({ id, title }) => ({ id, title })),
  };
  return { client, state };
}

const NOTES = [
  { file: '00 개요.md', raw: '# 00 — 개요\n\n다음: [[01 인증]]\n' },
  { file: '01 인증.md', raw: '---\n작성일: 2026-07-01\n---\n\n# 01 인증\n\n상위: [[00 개요]] · [[사적 노트]]\n' },
];

test('ensureSpace 는 docs 스페이스가 없을 때만 만든다', async () => {
  const empty = fakeBackend();
  const a = await ensureSpace(empty.client);
  assert.equal(a.created, true);
  assert.equal(a.space.key, 'docs');
  assert.equal(a.space.name, 'MSA_TEMPLATE 정리');

  const has = fakeBackend({ spaces: [{ id: 's9', key: 'docs', name: 'x' }] });
  const b = await ensureSpace(has.client);
  assert.equal(b.created, false);
  assert.equal(b.space.id, 's9');
});

test('첫 실행: 스페이스·페이지를 만들고 2차에서 앞으로 가는 링크를 풀어 갱신한다', async () => {
  const { client, state } = fakeBackend();
  const result = await syncDocs({ notes: NOTES, mapping: {}, client });

  assert.deepEqual(result.mapping, { '00': 'p2', '01': 'p3' });
  assert.equal(result.summary.created, 2);
  // 00 은 만들 때 01 이 아직 없어 평탄화됐다 → 2차에서 링크가 생겨 갱신. 01 은 00 을 바로 링크했으니 동일.
  assert.equal(result.summary.updated, 1);
  assert.equal(result.summary.skipped, 1);
  assert.deepEqual(result.summary.broken, ['01 인증.md → [[사적 노트]]']);
  assert.deepEqual(result.summary.stale, []);

  const p00 = state.pages.find((p) => p.id === 'p2');
  assert.equal(p00.title, '00 개요');
  assert.equal(p00.content, `다음: [01 인증](${pageHref('s1', 'p3')})\n`);
  assert.equal(p00.version, 2);
  const p01 = state.pages.find((p) => p.id === 'p3');
  assert.equal(p01.content, `> 작성일 2026-07-01\n\n상위: [00 개요](${pageHref('s1', 'p2')}) · 사적 노트\n`);
  assert.equal(p01.status, 'published');
  assert.equal(p01.parentId, null);
});

test('두 번째 실행은 아무것도 만들거나 갱신하지 않는다 (멱등)', async () => {
  const { client, state } = fakeBackend();
  const first = await syncDocs({ notes: NOTES, mapping: {}, client });
  const logLen = state.log.length;

  const second = await syncDocs({ notes: NOTES, mapping: first.mapping, client });
  assert.deepEqual(second.mapping, first.mapping);
  assert.deepEqual(second.summary, { created: 0, updated: 0, skipped: 2, broken: ['01 인증.md → [[사적 노트]]'], stale: [] });
  assert.equal(state.log.length, logLen);
});

test('매핑이 비어도 같은 제목의 페이지가 있으면 lookup 으로 재사용한다', async () => {
  const { client, state } = fakeBackend();
  const first = await syncDocs({ notes: NOTES, mapping: {}, client });
  const result = await syncDocs({ notes: NOTES, mapping: {}, client });
  assert.deepEqual(result.mapping, first.mapping);
  assert.equal(result.summary.created, 0);
  assert.equal(state.pages.length, 2);
});

test('매핑의 페이지가 서버에서 사라졌으면 제목으로 다시 찾고, 그것도 없으면 새로 만들어 매핑을 고친다', async () => {
  const { client, state } = fakeBackend({ spaces: [{ id: 's1', key: 'docs' }] });
  const result = await syncDocs({ notes: NOTES, mapping: { '00': 'ghost', '01': 'ghost2', '77': 'gone' }, client });
  assert.equal(result.summary.created, 2);
  assert.notEqual(result.mapping['00'], 'ghost');
  assert.equal(result.mapping['77'], 'gone'); // 손대지 않고 stale 로만 보고
  assert.deepEqual(result.summary.stale, ['77']);
  assert.equal(state.pages.length, 2);
});

test('본문이 바뀐 노트만 expectedVersion 과 함께 PUT 한다', async () => {
  const { client, state } = fakeBackend();
  const first = await syncDocs({ notes: NOTES, mapping: {}, client });
  const edited = [NOTES[0], { ...NOTES[1], raw: NOTES[1].raw.replace('상위', '부모') }];
  const result = await syncDocs({ notes: edited, mapping: first.mapping, client });
  assert.equal(result.summary.updated, 1);
  assert.equal(result.summary.skipped, 1);
  const p01 = state.pages.find((p) => p.id === first.mapping['01']);
  assert.match(p01.content, /^> 작성일 2026-07-01\n\n부모: /);
  assert.equal(p01.version, 2);
});

test('번호가 겹치면 서버를 건드리기 전에 실패한다', async () => {
  const { client, state } = fakeBackend();
  const dup = [...NOTES, { file: '01 다른 인증.md', raw: '# 01 다른\n' }];
  await assert.rejects(syncDocs({ notes: dup, mapping: {}, client }), /번호가 겹치는 노트/);
  assert.equal(state.log.length, 0);
});

test('HTTP 오류는 그대로 전파된다', async () => {
  const { client } = fakeBackend();
  client.createPage = async () => {
    throw new DocsApiError('POST', '/api/wiki/pages', 403, 'forbidden');
  };
  await assert.rejects(syncDocs({ notes: NOTES, mapping: {}, client }), (err) => err.status === 403);
});
