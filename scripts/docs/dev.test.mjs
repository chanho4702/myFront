import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DocsApiError, pageHref } from './lib.mjs';
import { COLLECTIONS as COLLECTIONS_DECL } from './collections.mjs';
import {
  globToRegExp,
  literalPrefix,
  matchesAny,
  originOf,
  deriveTitle,
  firstH1,
  buildTree,
  buildPathIndex,
  resolveRelative,
  splitAnchor,
  isRelativeFileLink,
  transformLinks,
  devMetadataLine,
  renderDoc,
  renderIndex,
  needsDevUpdate,
  staleMappingKeys,
  folderHref,
  syncDevDocs,
  collectionSkipReason,
} from './dev.mjs';

test('glob: ** 는 하위 전부, * 는 한 단계, 와일드카드 없는 항목은 파일 하나', () => {
  assert.ok(matchesAny('superpowers/plans/2026-07-11-w1.md', ['**/*.md']));
  assert.ok(matchesAny('README.md', ['**/*.md']));
  assert.ok(matchesAny('docs/a/b.md', ['docs/**/*.md']));
  assert.equal(matchesAny('docs/a/b.txt', ['docs/**/*.md']), false);
  assert.equal(matchesAny('src/a/b.md', ['docs/**/*.md']), false);
  assert.ok(globToRegExp('areas/*.md').test('areas/store.md'));
  assert.equal(globToRegExp('areas/*.md').test('areas/x/store.md'), false);
  assert.equal(globToRegExp('README.md').test('README.md.bak'), false);
  assert.equal(literalPrefix('docs/**/*.md'), 'docs');
  assert.equal(literalPrefix('**/*.md'), '');
  assert.equal(literalPrefix('wiki-backend/README.md'), 'wiki-backend');
});

test('원본 경로는 플랫폼 루트 기준으로 표기한다', () => {
  assert.equal(originOf({ dir: 'C:/MSA_TEMPLATE/wiki-front/docs' }, 'backend/x.md'), 'MSA_TEMPLATE/wiki-front/docs/backend/x.md');
  assert.equal(originOf({ dir: 'C:\\MSA_TEMPLATE' }, 'README.md'), 'MSA_TEMPLATE/README.md');
});

test('제목: 덮어쓰기 > H1 > 파일명, 날짜 접두 파일은 (YYYY-MM-DD) 를 붙인다', () => {
  assert.equal(deriveTitle('roadmap/2026-07-17-platform-roadmap.md', '# 제품 로드맵\n\n본문'), '제품 로드맵 (2026-07-17)');
  assert.equal(deriveTitle('roadmap/2026-07-17-platform-roadmap.md', '본문만'), 'platform-roadmap (2026-07-17)');
  assert.equal(deriveTitle('areas/store.md', '---\nx: 1\n---\n\n# 스토어\n'), '스토어');
  assert.equal(deriveTitle('STATUS.md', '# ALM Front 현황', { 'STATUS.md': '진행 현황' }), '진행 현황');
  assert.equal(deriveTitle('BACKLOG.md', '설명\n\n# 나중에 나오는 H1'), 'BACKLOG');
  assert.equal(deriveTitle('a.md', `# ${'x'.repeat(300)}`).length, 255);
  // 인용문 머리말(생성 문서의 "자동 생성" 안내)만 앞에 있으면 H1 이 제목이고 머리말은 본문에 남는다
  assert.equal(deriveTitle('spaces.md', '> 자동 생성 — 직접 고치지 말 것\n\n# Spaces\n\n본문'), 'Spaces');
  assert.equal(firstH1('> 안내\n\n# 제목\n\n본문\n').body, '> 안내\n\n본문\n');
  assert.equal(firstH1('> 안내\n\n# 제목\n\n본문\n').title, '제목');
  assert.equal(firstH1('> 안내\n\n글\n\n# 제목').title, null);
});

test('optional 컬렉션은 디렉터리·파일이 없으면 사유와 함께 건너뛰고, 필수 컬렉션은 null', () => {
  const opt = { id: 'api-reference', dir: 'C:/x/docs/api-reference', optional: true };
  assert.match(collectionSkipReason(opt, { dirExists: false, fileCount: 0 }), /api-reference 건너뜀 — 디렉터리가 아직 없다: C:\/x\/docs\/api-reference/);
  assert.match(collectionSkipReason(opt, { dirExists: true, fileCount: 0 }), /대상 파일이 없다/);
  assert.equal(collectionSkipReason(opt, { dirExists: true, fileCount: 3 }), null);
  assert.equal(collectionSkipReason({ id: 'platform', dir: '/r' }, { dirExists: false, fileCount: 0 }), null);
});

const WIKI = {
  id: 'wiki-front',
  title: 'WIKI (wiki-front)',
  dir: 'C:/MSA_TEMPLATE/wiki-front/docs',
  include: ['**/*.md'],
  folders: { backend: '백엔드 요구·설계', 'superpowers/plans': '구현 계획', 'superpowers/specs': '설계 스펙' },
};
const WIKI_FILES = [
  { relpath: 'superpowers/specs/2026-07-11-design.md', raw: '# 설계\n\n계획: [w1](../plans/2026-07-11-w1.md#목표) · 요구: [req](../../backend/2026-07-17-req.md)\n' },
  { relpath: 'README.md', raw: '# docs/\n\n| [백엔드](backend/2026-07-17-req.md) | [스펙 폴더](superpowers/specs/) | [코드](../src/x.ts) |\n' },
  { relpath: 'backend/2026-07-17-req.md', raw: '# 요구사항\n\n루트: [README](../README.md) · 외부: [CLAUDE](../../CLAUDE.md)\n' },
  { relpath: 'superpowers/plans/2026-07-11-w1.md', raw: '# W1\n\n## 목표\n\n`[예시](../x.md)` 와\n\n```md\n[펜스 안](../y.md)\n```\n\n![그림](./img/a.png) ![원격](https://x/y.png)\n' },
  { relpath: 'superpowers/other/loose.md', raw: '# 느슨한 문서\n' },
];

test('트리: 루트 → 폴더 → 파일 순, README 는 루트 본문, 미등록 디렉터리 파일은 가장 가까운 상위로', () => {
  const nodes = buildTree(WIKI, WIKI_FILES);
  assert.deepEqual(
    nodes.map((n) => [n.key, n.kind, n.parentKey, n.title]),
    [
      ['wiki-front/', 'root', null, 'WIKI (wiki-front)'],
      ['wiki-front/backend/', 'folder', 'wiki-front/', '백엔드 요구·설계'],
      ['wiki-front/superpowers/plans/', 'folder', 'wiki-front/', '구현 계획'],
      ['wiki-front/superpowers/specs/', 'folder', 'wiki-front/', '설계 스펙'],
      ['wiki-front/backend/2026-07-17-req.md', 'page', 'wiki-front/backend/', '요구사항 (2026-07-17)'],
      ['wiki-front/superpowers/other/loose.md', 'page', 'wiki-front/', '느슨한 문서'],
      ['wiki-front/superpowers/plans/2026-07-11-w1.md', 'page', 'wiki-front/superpowers/plans/', 'W1 (2026-07-11)'],
      ['wiki-front/superpowers/specs/2026-07-11-design.md', 'page', 'wiki-front/superpowers/specs/', '설계 (2026-07-11)'],
    ],
  );
  assert.equal(nodes[0].relpath, 'README.md');
});

test('트리: 폴더 안 README 는 그 폴더의 첫 자식 "개요" 페이지, README 없는 폴더는 만들지 않음, 중첩 폴더는 상위 폴더 아래', () => {
  const c = { id: 'alm', title: 'ALM', dir: '/r', folders: { areas: '영역', 'areas/deep': '깊은' } };
  const nodes = buildTree(c, [
    { relpath: 'areas/store.md', raw: '# 스토어' },
    { relpath: 'areas/README.md', raw: '# 영역 개요' },
    { relpath: 'areas/deep/x.md', raw: '# x' },
  ]);
  assert.deepEqual(
    nodes.map((n) => [n.key, n.kind, n.parentKey, n.title]),
    [
      ['alm/', 'root', null, 'ALM'],
      ['alm/areas/', 'folder', 'alm/', '영역'],
      ['alm/areas/deep/', 'folder', 'alm/areas/', '깊은'],
      ['alm/areas/README.md', 'page', 'alm/areas/', '개요'], // 폴더 뒤·일반 페이지 앞 → 형제 중 맨 앞
      ['alm/areas/deep/x.md', 'page', 'alm/areas/deep/', 'x'],
      ['alm/areas/store.md', 'page', 'alm/areas/', '스토어'],
    ],
  );
  assert.equal(nodes.find((n) => n.key === 'alm/areas/').relpath, null); // 폴더 본문은 자식 목록
  assert.equal(nodes.find((n) => n.key === 'alm/areas/README.md').relpath, 'areas/README.md');
  assert.equal(nodes.some((n) => n.key === 'alm/areas/deep/README.md'), false); // README 없는 폴더
  assert.equal(nodes[0].relpath, null); // 루트 README 없음 → 자식 목록
});

test('폴더 README 는 "개요" 페이지로 생성·링크되고 두 번째 실행은 멱등이다', async () => {
  const { client, state } = fakeBackend();
  const alm = { id: 'alm-front', title: 'ALM', dir: 'C:/MSA_TEMPLATE/alm-front/docs', include: ['**/*.md'], folders: { areas: '영역 가이드' } };
  const files = [
    { relpath: 'areas/README.md', raw: '# 영역 개요\n\n[스토어](store.md)\n' },
    { relpath: 'areas/store.md', raw: '# 스토어\n\n[개요로](README.md) · [폴더로](./)\n' },
  ];
  const first = await syncDevDocs({ collections: [{ collection: alm, files }], mapping: {}, client });
  const m = first.mapping;
  assert.deepEqual(Object.keys(m).sort(), ['alm-front/', 'alm-front/areas/', 'alm-front/areas/README.md', 'alm-front/areas/store.md']);
  const sid = first.spaceId;
  const page = (key) => state.pages.find((p) => p.id === m[key]);
  const overview = page('alm-front/areas/README.md');
  assert.equal(overview.title, '개요');
  assert.equal(overview.type, 'page');
  assert.equal(overview.parentId, m['alm-front/areas/']);
  assert.ok(overview.id < page('alm-front/areas/store.md').id); // 형제 중 먼저 생성
  assert.equal(overview.content, `> 원본: MSA_TEMPLATE/alm-front/docs/areas/README.md\n\n[스토어](${pageHref(sid, m['alm-front/areas/store.md'])})\n`);
  // README.md 링크는 개요 페이지로, 디렉터리 링크는 폴더 화면으로
  assert.equal(
    page('alm-front/areas/store.md').content,
    `> 원본: MSA_TEMPLATE/alm-front/docs/areas/store.md\n\n[개요로](${pageHref(sid, m['alm-front/areas/README.md'])}) · [폴더로](${folderHref(sid, m['alm-front/areas/'])})\n`,
  );
  // 폴더 본문은 자식 목록이고 개요가 맨 앞
  assert.equal(page('alm-front/areas/').content, `- [개요](${pageHref(sid, m['alm-front/areas/README.md'])})\n- [스토어](${pageHref(sid, m['alm-front/areas/store.md'])})\n`);

  const logLen = state.log.length;
  const second = await syncDevDocs({ collections: [{ collection: alm, files }], mapping: first.mapping, client });
  assert.deepEqual(second.mapping, first.mapping);
  assert.equal(state.log.length, logLen);
  assert.equal(second.summary['alm-front'].same, 4);
});

test('상대 링크 해석: .. · 앵커 · 디렉터리 · URL 인코딩', () => {
  assert.equal(resolveRelative('/r/docs/superpowers/specs/a.md', '../plans/b.md'), '/r/docs/superpowers/plans/b.md');
  assert.equal(resolveRelative('/r/docs/README.md', 'superpowers/specs/'), '/r/docs/superpowers/specs');
  assert.equal(resolveRelative('/r/docs/README.md', './x%20y.md'), '/r/docs/x y.md');
  assert.deepEqual(splitAnchor('a.md#섹션'), { file: 'a.md', anchor: '#섹션' });
  assert.deepEqual(splitAnchor('a.md'), { file: 'a.md', anchor: '' });
  assert.ok(isRelativeFileLink('../a.md'));
  assert.ok(isRelativeFileLink('src/x.ts'));
  for (const t of ['https://x', 'mailto:a@b', 'user:id', 'date:2026-09-01', '/spaces/sp1/pages/pg1', '#anchor', '']) {
    assert.equal(isRelativeFileLink(t), false, t);
  }
});

test('경로 색인은 루트·폴더 디렉터리와 파일을 모두 키로 갖는다', () => {
  const index = buildPathIndex([{ collection: WIKI, nodes: buildTree(WIKI, WIKI_FILES) }]);
  assert.equal(index.get('C:/MSA_TEMPLATE/wiki-front/docs'), 'wiki-front/');
  assert.equal(index.get('C:/MSA_TEMPLATE/wiki-front/docs/README.md'), 'wiki-front/');
  assert.equal(index.get('C:/MSA_TEMPLATE/wiki-front/docs/superpowers/specs'), 'wiki-front/superpowers/specs/');
  assert.equal(index.get('C:/MSA_TEMPLATE/wiki-front/docs/backend/2026-07-17-req.md'), 'wiki-front/backend/2026-07-17-req.md');
});

test('링크 변환: 동기화 대상은 URL(+앵커), 아닌 것은 글자만, 코드 영역·절대·스킴 링크는 그대로, 로컬 이미지는 보고만', () => {
  const body = [
    '[계획](../plans/w1.md#목표) [코드](src/x.ts) [절대](/spaces/s/pages/p) [외부](https://a.b/c.md) [필드](user:id)',
    '`[예시](../x.md)` 그리고',
    '```',
    '[펜스](../y.md)',
    '```',
    '![로컬](./img/a.png) ![원격](https://x/y.png) [제목 있음](a.md "t")',
  ].join('\n');
  const resolve = (f) => ({ '../plans/w1.md': '/docs/spaces/1/pages/9', 'a.md': '/docs/spaces/1/pages/2' })[f] ?? null;
  const { body: out, flattened, images } = transformLinks(body, resolve);
  assert.equal(
    out,
    [
      '[계획](/docs/spaces/1/pages/9#목표) 코드 [절대](/spaces/s/pages/p) [외부](https://a.b/c.md) [필드](user:id)',
      '`[예시](../x.md)` 그리고',
      '```',
      '[펜스](../y.md)',
      '```',
      '![로컬](./img/a.png) ![원격](https://x/y.png) [제목 있음](/docs/spaces/1/pages/2)',
    ].join('\n'),
  );
  assert.deepEqual(flattened, ['src/x.ts']);
  assert.deepEqual(images, ['./img/a.png']);
});

test('본문 렌더: 첫 줄은 원본 경로, frontmatter 는 그 다음 줄, 맨 앞 H1 은 뺀다', () => {
  const plain = renderDoc({ raw: '# 제목\r\n\r\n본문 [a](a.md)\r\n', origin: 'MSA_TEMPLATE/x/a.md', resolve: () => null });
  assert.equal(plain.content, '> 원본: MSA_TEMPLATE/x/a.md\n\n본문 a\n');
  assert.deepEqual(plain.flattened, ['a.md']);

  const withMeta = renderDoc({ raw: '---\n작성일: 2026-07-05\n상태: 승인\n---\n\n# 제목\n\n본문\n', origin: 'o', resolve: () => null });
  assert.equal(withMeta.content, '> 원본: o\n> 작성일 2026-07-05 · 상태 승인\n\n본문\n');
  assert.equal(devMetadataLine({ owner: 'me', reviewers: ['a', 'b'] }), '> owner me · reviewers a, b');
  assert.equal(devMetadataLine({}), '');
});

test('자식 목록 본문과 갱신 판단(부모가 바뀌어도 갱신)', () => {
  const children = [{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }];
  assert.equal(renderIndex(children, (k) => (k === 'a' ? '/p/a' : null)), '- [A](/p/a)\n- B\n');
  const server = { title: 'T', content: 'c\r\n', parentId: 3 };
  assert.equal(needsDevUpdate(server, { title: 'T', content: 'c', parentId: 3 }), false);
  assert.equal(needsDevUpdate(server, { title: 'T', content: 'c', parentId: 4 }), true);
  assert.equal(needsDevUpdate({ ...server, parentId: null }, { title: 'T', content: 'c', parentId: null }), false);
  assert.deepEqual(staleMappingKeys({ 'w/': 1, 'w/gone.md': 2 }, [{ nodes: [{ key: 'w/' }] }]), ['w/gone.md']);
});

/** 인메모리 가짜 백엔드 — 스페이스·페이지(부모·타입·version)·lookup 만 흉내낸다. */
function fakeBackend() {
  const state = { spaces: [], pages: [], log: [], nextId: 1 };
  const client = {
    listSpaces: async () => state.spaces,
    createSpace: async (s) => {
      const space = { id: state.nextId++, ...s };
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
      const page = { id: state.nextId++, version: 1, ...p };
      state.pages.push(page);
      state.log.push(['createPage', p.title]);
      return { ...page };
    },
    updatePage: async (id, body) => {
      const p = state.pages.find((x) => x.id === id);
      if (p.version !== body.expectedVersion) throw new DocsApiError('PUT', `/api/wiki/pages/${id}`, 409, 'version');
      Object.assign(p, { title: body.title, content: body.content, parentId: body.parentId, version: p.version + 1 });
      state.log.push(['updatePage', body.title]);
      return { ...p };
    },
    lookupPages: async (spaceId, titles) =>
      state.pages.filter((p) => p.spaceId === spaceId && titles.includes(p.title)).map(({ id, title }) => ({ id, title })),
  };
  return { client, state };
}

const PLATFORM = { id: 'platform', title: '플랫폼 개요', dir: 'C:/MSA_TEMPLATE', include: ['README.md', 'AGENTS.md'], titles: { 'AGENTS.md': '에이전트 규약' } };
const PLATFORM_FILES = [
  { relpath: 'README.md', raw: '# MSA_TEMPLATE\n\n위키 문서: [wiki docs](wiki-front/docs/README.md) · 규약: [AGENTS](AGENTS.md) · [infra](infra/README.md)\n' },
  { relpath: 'AGENTS.md', raw: '# AGENTS\n\n포인터\n' },
];
const COLLECTIONS = [
  { collection: PLATFORM, files: PLATFORM_FILES },
  { collection: WIKI, files: WIKI_FILES },
];

test('첫 실행: dev 스페이스·루트·폴더·페이지를 만들고 2차에서 링크를 풀어 갱신한다', async () => {
  const { client, state } = fakeBackend();
  const result = await syncDevDocs({ collections: COLLECTIONS, mapping: {}, client });

  assert.equal(state.spaces[0].key, 'dev');
  assert.equal(state.spaces[0].name, '개발 문서');
  const sid = result.spaceId;
  const m = result.mapping;
  assert.deepEqual(Object.keys(m).sort(), [
    'platform/',
    'platform/AGENTS.md',
    'wiki-front/',
    'wiki-front/backend/',
    'wiki-front/backend/2026-07-17-req.md',
    'wiki-front/superpowers/other/loose.md',
    'wiki-front/superpowers/plans/',
    'wiki-front/superpowers/plans/2026-07-11-w1.md',
    'wiki-front/superpowers/specs/',
    'wiki-front/superpowers/specs/2026-07-11-design.md',
  ]);
  assert.equal(result.summary.platform.created, 2);
  assert.equal(result.summary['wiki-front'].created, 8);

  const page = (key) => state.pages.find((p) => p.id === m[key]);
  // 타입·부모
  assert.equal(page('wiki-front/backend/').type, 'folder');
  assert.equal(page('wiki-front/backend/').parentId, m['wiki-front/']);
  assert.equal(page('wiki-front/backend/2026-07-17-req.md').parentId, m['wiki-front/backend/']);
  assert.equal(page('wiki-front/superpowers/other/loose.md').parentId, m['wiki-front/']);
  assert.equal(page('platform/').parentId, null);
  assert.equal(page('platform/').status, 'published');

  // 루트 README 본문: 컬렉션을 넘나드는 링크·같은 컬렉션 링크는 URL, 대상 밖은 글자만
  assert.equal(
    page('platform/').content,
    `> 원본: MSA_TEMPLATE/README.md\n\n위키 문서: [wiki docs](${pageHref(sid, m['wiki-front/'])}) · 규약: [AGENTS](${pageHref(sid, m['platform/AGENTS.md'])}) · infra\n`,
  );
  // 디렉터리 링크는 폴더 화면으로, 코드 경로는 평탄화
  assert.equal(
    page('wiki-front/').content,
    `> 원본: MSA_TEMPLATE/wiki-front/docs/README.md\n\n| [백엔드](${pageHref(sid, m['wiki-front/backend/2026-07-17-req.md'])}) | [스펙 폴더](${folderHref(sid, m['wiki-front/superpowers/specs/'])}) | 코드 |\n`,
  );
  // .. 와 앵커
  assert.equal(
    page('wiki-front/superpowers/specs/2026-07-11-design.md').content,
    `> 원본: MSA_TEMPLATE/wiki-front/docs/superpowers/specs/2026-07-11-design.md\n\n계획: [w1](${pageHref(sid, m['wiki-front/superpowers/plans/2026-07-11-w1.md'])}#목표) · 요구: [req](${pageHref(sid, m['wiki-front/backend/2026-07-17-req.md'])})\n`,
  );
  // 폴더 본문은 자식 목록
  assert.equal(page('wiki-front/backend/').content, `- [요구사항 (2026-07-17)](${pageHref(sid, m['wiki-front/backend/2026-07-17-req.md'])})\n`);
  // 코드 영역 안 링크는 그대로, 로컬 이미지는 보고
  assert.match(page('wiki-front/superpowers/plans/2026-07-11-w1.md').content, /`\[예시\]\(\.\.\/x\.md\)`[\s\S]*\[펜스 안\]\(\.\.\/y\.md\)[\s\S]*!\[그림\]\(\.\/img\/a\.png\)/);

  const flat = [...result.summary.platform.flattened, ...result.summary['wiki-front'].flattened];
  assert.deepEqual(flat.sort(), ['platform/ → infra/README.md', 'wiki-front/ → ../src/x.ts', 'wiki-front/backend/2026-07-17-req.md → ../../CLAUDE.md']);
  assert.deepEqual(result.summary['wiki-front'].images, ['wiki-front/superpowers/plans/2026-07-11-w1.md: ./img/a.png']);
  assert.deepEqual(result.stale, []);
});

test('두 번째 실행은 아무것도 만들거나 갱신하지 않는다 (멱등)', async () => {
  const { client, state } = fakeBackend();
  const first = await syncDevDocs({ collections: COLLECTIONS, mapping: {}, client });
  const logLen = state.log.length;
  const second = await syncDevDocs({ collections: COLLECTIONS, mapping: first.mapping, client });
  assert.deepEqual(second.mapping, first.mapping);
  assert.equal(state.log.length, logLen);
  for (const s of Object.values(second.summary)) {
    assert.equal(s.created, 0);
    assert.equal(s.updated, 0);
  }
  assert.equal(second.summary['wiki-front'].same, 8);
});

test('매핑이 비어도 제목+부모로 다시 찾는다 — 같은 제목의 폴더가 다른 컬렉션에 있어도 섞이지 않는다', async () => {
  const { client, state } = fakeBackend();
  const alm = { id: 'alm-front', title: 'ALM', dir: 'C:/MSA_TEMPLATE/alm-front/docs', include: ['**/*.md'], folders: { 'superpowers/plans': '구현 계획' } };
  const cols = [...COLLECTIONS, { collection: alm, files: [{ relpath: 'superpowers/plans/2026-07-10-w1.md', raw: '# ALM W1\n' }] }];
  const first = await syncDevDocs({ collections: cols, mapping: {}, client });
  const again = await syncDevDocs({ collections: cols, mapping: {}, client });
  assert.deepEqual(again.mapping, first.mapping);
  assert.equal(state.pages.length, Object.keys(first.mapping).length);
  assert.notEqual(first.mapping['wiki-front/superpowers/plans/'], first.mapping['alm-front/superpowers/plans/']);
});

test('본문이 바뀐 문서만 expectedVersion 과 함께 PUT 하고, 사라진 문서는 stale 로만 보고한다', async () => {
  const { client, state } = fakeBackend();
  const first = await syncDevDocs({ collections: COLLECTIONS, mapping: {}, client });
  const edited = [
    COLLECTIONS[0],
    { collection: WIKI, files: WIKI_FILES.filter((f) => !f.relpath.endsWith('loose.md')).map((f) => (f.relpath === 'backend/2026-07-17-req.md' ? { ...f, raw: f.raw.replace('루트', '최상위') } : f)) },
  ];
  const result = await syncDevDocs({ collections: edited, mapping: first.mapping, client });
  const wiki = result.summary['wiki-front'];
  assert.equal(wiki.created, 0);
  assert.equal(wiki.updated, 1); // 바뀐 문서 하나뿐 — 사라진 loose.md 는 루트 README 본문에 링크되지 않았다
  const req = state.pages.find((p) => p.id === first.mapping['wiki-front/backend/2026-07-17-req.md']);
  assert.match(req.content, /최상위: /);
  assert.equal(req.version, 2);
  assert.deepEqual(result.stale, ['wiki-front/superpowers/other/loose.md']);
  assert.equal(result.mapping['wiki-front/superpowers/other/loose.md'], first.mapping['wiki-front/superpowers/other/loose.md']);
});

test('HTTP 오류는 그대로 전파된다', async () => {
  const { client } = fakeBackend();
  client.createPage = async () => {
    throw new DocsApiError('POST', '/api/wiki/pages', 403, 'forbidden');
  };
  await assert.rejects(syncDevDocs({ collections: COLLECTIONS, mapping: {}, client }), (err) => err.status === 403);
});

test('컬렉션 선언: id 유일·필수 필드·절대경로, API 가이드는 auth-server/docs/api 만 본다(설계 스펙 제외)', () => {
  const ids = COLLECTIONS_DECL.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of COLLECTIONS_DECL) {
    assert.ok(c.id && c.title && c.dir && c.include?.length, c.id);
    assert.ok(/^[A-Za-z]:\/|^\//.test(c.dir), `${c.id}: dir 은 절대경로(슬래시 구분)`);
    assert.equal(c.dir.includes('\\'), false, c.id);
  }
  const api = COLLECTIONS_DECL.find((c) => c.id === 'api-guide');
  assert.equal(api.title, 'API 가이드');
  assert.equal(api.dir, 'C:/MSA_TEMPLATE/auth-server/docs/api');
  assert.ok(matchesAny('authentication.md', api.include));
  assert.equal(literalPrefix(api.include[0]), ''); // dir 자체가 경계 — superpowers/ 는 dir 밖이라 걸을 수 없다
  assert.equal(api.folders, undefined);

  // API 레퍼런스: myFront/docs/api-reference 만(docs/superpowers 제외), 폴더 = 서비스, 생성 전에는 optional
  const ref = COLLECTIONS_DECL.find((c) => c.id === 'api-reference');
  assert.equal(ref.title, 'API 레퍼런스');
  assert.equal(ref.dir, 'C:/MSA_TEMPLATE/myFront/docs/api-reference');
  // migration 은 optional(배포 전)이라 폴더에서 빠진다
  assert.deepEqual(ref.folders, { wiki: 'WIKI API', alm: 'ALM API', org: 'Org API' });
  assert.equal(ref.optional, true);
  assert.ok(matchesAny('wiki/spaces.md', ref.include));
  assert.equal(literalPrefix(ref.include[0]), '');
  const nodes = buildTree(ref, [
    { relpath: 'wiki/README.md', raw: '> 자동 생성\n\n# WIKI API\n' },
    { relpath: 'wiki/spaces.md', raw: '> 자동 생성\n\n# Spaces\n' },
  ]);
  assert.deepEqual(
    nodes.map((n) => [n.key, n.kind, n.parentKey, n.title]),
    [
      ['api-reference/', 'root', null, 'API 레퍼런스'],
      ['api-reference/alm/', 'folder', 'api-reference/', 'ALM API'],
      ['api-reference/org/', 'folder', 'api-reference/', 'Org API'],
      ['api-reference/wiki/', 'folder', 'api-reference/', 'WIKI API'],
      ['api-reference/wiki/README.md', 'page', 'api-reference/wiki/', '개요'],
      ['api-reference/wiki/spaces.md', 'page', 'api-reference/wiki/', 'Spaces'],
    ],
  );
});
