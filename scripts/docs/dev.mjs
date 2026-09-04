// 리포 안 개발 문서(마크다운) → 공개 문서 위키 `dev` 스페이스 동기화의 순수 부분.
// 파일 I/O 는 sync-docs.mjs 가 맡고, 여기는 트리 구성·제목 유도·상대 링크 변환·동기화 판단만 둔다.
// 노트 임포터(lib.mjs)와 클라이언트·비교·매핑 병합을 공유한다.

import path from 'node:path';
import { parseFrontmatter } from '../notes/transform.mjs';
import { DocsApiError, TITLE_MAX, ensureSpace, metadataLine, mergeMapping, needsUpdate, pageHref } from './lib.mjs';
import { DEV_SPACE, PLATFORM_ROOT } from './collections.mjs';

const posix = path.posix;

export const MAX_FILE_BYTES = 400 * 1024;
export const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);

export const toPosix = (p) => String(p).replace(/\\/g, '/');

/** 폴더 페이지는 문서 보기가 아니라 자식 목록 화면으로 연다(wiki-front contentPath 와 같은 규칙). */
export const folderHref = (spaceId, pageId) => `/docs/spaces/${spaceId}/folder/${pageId}`;

/** `**`(경로 구분자 포함 전부) · `*`(한 단계) · `?` 만 지원하는 최소 glob. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          re += '(?:.*/)?';
        } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export const hasWildcard = (glob) => /[*?]/.test(glob);

/** 와일드카드 앞까지의 디렉터리 — 이 아래만 걸으면 된다(리포 전체를 훑지 않기 위해). */
export function literalPrefix(glob) {
  const segs = glob.split('/');
  const out = [];
  for (const s of segs) {
    if (hasWildcard(s)) break;
    out.push(s);
  }
  if (out.length === segs.length) out.pop(); // 전부 리터럴이면 마지막은 파일명
  return out.join('/');
}

export const matchesAny = (relpath, globs) => globs.some((g) => globToRegExp(g).test(relpath));

/** 매핑 키. 루트·폴더는 끝 슬래시로 파일과 구분한다. */
export const rootKey = (collection) => `${collection.id}/`;
export const folderKey = (collection, dir) => `${collection.id}/${dir}/`;
export const fileKey = (collection, relpath) => `${collection.id}/${relpath}`;

/** 읽는 사람이 원본 위치를 알도록 본문 첫 줄에 넣는 경로 — 플랫폼 루트 기준. */
export function originOf(collection, relpath) {
  const abs = posix.join(toPosix(collection.dir), relpath);
  const root = toPosix(PLATFORM_ROOT).replace(/\/+$/, '');
  const rel = abs.startsWith(`${root}/`) ? abs.slice(root.length + 1) : abs;
  return `${posix.basename(root)}/${rel}`;
}

const DATED = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

/** 본문 맨 앞의 H1. 앞에 다른 내용이 있으면 제목이 아니다. */
export function firstH1(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  if (m && body.slice(0, m.index).trim() === '') {
    return { title: m[1].trim(), body: body.slice(m.index + m[0].length).replace(/^\r?\n/, '') };
  }
  return { title: null, body };
}

/**
 * 페이지 제목: 덮어쓰기 > H1 > 파일명(날짜 접두어 제외). 파일명이 날짜로 시작하면
 * `(YYYY-MM-DD)` 를 뒤에 붙여 트리에서 시기가 보이게 한다. 형제 정렬은 파일명순 생성으로 맞춘다.
 */
export function deriveTitle(relpath, raw, overrides = {}) {
  if (overrides[relpath]) return clip(overrides[relpath]);
  const base = posix.basename(relpath).replace(/\.md$/i, '');
  const dated = base.match(DATED);
  const { title: h1 } = firstH1(parseFrontmatter(raw).body);
  const name = h1 || (dated ? dated[2] : base);
  return clip(dated ? `${name} (${dated[1]})` : name);
}

const clip = (t) => (t.length > TITLE_MAX ? t.slice(0, TITLE_MAX) : t);

/**
 * 컬렉션의 파일 목록 → 생성 순서대로 늘어놓은 노드 배열(루트 → 폴더 → 파일).
 * 파일은 상대경로순이라 같은 폴더 안에서는 파일명순이 된다(백엔드는 생성 순서로 형제 위치를 잡는다).
 * 루트/폴더 디렉터리의 README.md 는 그 노드의 `relpath` 가 되고 별도 페이지를 만들지 않는다.
 *
 * @param files [{ relpath, raw }] — dir 기준 상대경로(슬래시 구분)
 */
export function buildTree(collection, files) {
  const folders = Object.entries(collection.folders ?? {})
    .map(([dir, title]) => ({ dir: dir.replace(/^\/+|\/+$/g, ''), title }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
  const parentDirOf = (relpath) => {
    let best = null;
    for (const f of folders) {
      if (relpath.startsWith(`${f.dir}/`) && (!best || f.dir.length > best.dir.length)) best = f;
    }
    return best;
  };
  const parentKeyOf = (relpath) => {
    const p = parentDirOf(relpath);
    return p ? folderKey(collection, p.dir) : rootKey(collection);
  };
  const byPath = new Map(files.map((f) => [f.relpath, f]));
  const readmeOf = (dir) => (byPath.has(dir ? `${dir}/README.md` : 'README.md') ? (dir ? `${dir}/README.md` : 'README.md') : null);

  const nodes = [
    { key: rootKey(collection), kind: 'root', title: clip(collection.title), parentKey: null, relpath: readmeOf('') },
  ];
  for (const f of folders) {
    nodes.push({ key: folderKey(collection, f.dir), kind: 'folder', title: clip(f.title), parentKey: parentKeyOf(f.dir), dir: f.dir, relpath: readmeOf(f.dir) });
  }
  const consumed = new Set(nodes.map((n) => n.relpath).filter(Boolean));
  const sorted = [...files].sort((a, b) => a.relpath.localeCompare(b.relpath));
  for (const f of sorted) {
    if (consumed.has(f.relpath)) continue;
    nodes.push({
      key: fileKey(collection, f.relpath),
      kind: 'page',
      title: deriveTitle(f.relpath, f.raw, collection.titles),
      parentKey: parentKeyOf(f.relpath),
      relpath: f.relpath,
    });
  }
  return nodes;
}

/**
 * 절대경로(슬래시 구분) → 매핑 키 색인. 컬렉션을 넘나드는 링크도 절대경로에서 만나므로 여기서 풀린다.
 * 디렉터리 자체(루트·폴더)도 키를 가져 `superpowers/specs/` 같은 디렉터리 링크가 폴더 페이지로 간다.
 */
export function buildPathIndex(trees) {
  const index = new Map();
  for (const { collection, nodes } of trees) {
    const dir = toPosix(collection.dir).replace(/\/+$/, '');
    for (const n of nodes) {
      if (n.kind === 'root') index.set(dir, n.key);
      else if (n.kind === 'folder') index.set(posix.join(dir, n.dir), n.key);
      if (n.relpath) index.set(posix.join(dir, n.relpath), n.key);
    }
  }
  return index;
}

/** `../backend/x.md` 같은 상대 링크를 원본 파일 위치 기준 절대경로로. `%20` 등은 풀어서 본다. */
export function resolveRelative(fromAbs, target) {
  let t = target;
  try {
    t = decodeURIComponent(target);
  } catch {
    t = target;
  }
  return posix.normalize(posix.join(posix.dirname(fromAbs), t)).replace(/\/+$/, '');
}

/** 링크 대상에서 앵커 분리. */
export function splitAnchor(target) {
  const i = target.indexOf('#');
  return i === -1 ? { file: target, anchor: '' } : { file: target.slice(0, i), anchor: target.slice(i) };
}

/** 리포 안 파일을 가리키는 상대경로인가 — 스킴(http:, mailto:, user:)·절대경로(/…)·앵커만(#…)은 아니다. */
export function isRelativeFileLink(target) {
  if (!target || target.startsWith('#') || target.startsWith('/')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return false;
  return true;
}

// 코드 영역(펜스 · 인라인 코드) 또는 인라인 링크/이미지 하나. 코드가 먼저라 코드 안의 링크 예시는 건드리지 않는다
// (notes/transform.mjs 의 CODE_OR_WIKILINK 와 같은 구조).
const CODE_OR_LINK = new RegExp(
  [
    '^[ \\t]*(`{3,}|~{3,})[^\\n]*\\n(?:[\\s\\S]*?^[ \\t]*\\1[ \\t]*$|[\\s\\S]*)',
    '(`+)[\\s\\S]*?\\2',
    '(!?)\\[([^\\]\\n]*)\\]\\(([^)\\s]+)(?:\\s+"[^"]*")?\\)',
  ].join('|'),
  'gm',
);

/**
 * 인라인 링크 변환. resolve(file) 는 위키 URL 또는 null(대상 없음 → 글자만 남기고 평탄화).
 * 이미지는 손대지 않고 로컬 파일을 가리키는 것만 보고한다(이번 패스는 첨부를 올리지 않는다).
 */
export function transformLinks(body, resolve) {
  const flattened = [];
  const images = [];
  const out = body.replace(CODE_OR_LINK, (all, _fence, _ticks, bang, text, target) => {
    if (target === undefined) return all; // 코드 영역
    if (!isRelativeFileLink(target)) return all;
    if (bang) {
      images.push(target);
      return all;
    }
    const { file, anchor } = splitAnchor(target);
    const href = file ? resolve(file) : null;
    if (href) return `[${text}](${href}${anchor})`;
    flattened.push(target);
    return text;
  });
  return { body: out, flattened, images };
}

/** frontmatter 를 한 줄 인용문으로 — 노트와 같은 키는 같은 모양, 그 밖의 키는 `키 값` 나열. */
export function devMetadataLine(meta) {
  const known = metadataLine(meta);
  if (known) return known;
  const parts = Object.entries(meta)
    .filter(([, v]) => typeof v === 'string' || Array.isArray(v))
    .map(([k, v]) => `${k} ${Array.isArray(v) ? v.join(', ') : v}`);
  return parts.length ? `> ${parts.join(' · ')}` : '';
}

/**
 * 문서 한 편의 본문 → 위키 페이지 본문. 첫 줄은 원본 경로 인용문, frontmatter 가 있으면 그 다음 줄에.
 * 맨 앞 H1 은 제목으로 승격됐으므로 뺀다.
 */
export function renderDoc({ raw, origin, resolve }) {
  const { meta, body } = parseFrontmatter(raw);
  const { body: afterTitle } = firstH1(body);
  const head = [`> 원본: ${origin}`, devMetadataLine(meta)].filter(Boolean).join('\n');
  const { body: linked, flattened, images } = transformLinks(afterTitle, resolve);
  return { content: `${head}\n\n${linked.trimEnd()}\n`, flattened, images };
}

/** 폴더·README 없는 루트의 본문 — 자식 목록. 링크가 아직 없으면(1차) 글자만. */
export function renderIndex(children, hrefOfKey) {
  const lines = children.map((c) => {
    const href = hrefOfKey(c.key);
    return `- ${href ? `[${c.title}](${href})` : c.title}`;
  });
  return `${lines.join('\n')}\n`;
}

/** 서버 사본과 원하는 값(제목·본문·부모)이 다를 때만 true. */
export function needsDevUpdate(serverPage, desired) {
  return needsUpdate(serverPage, desired) || (serverPage.parentId ?? null) !== (desired.parentId ?? null);
}

/** 매핑에는 있는데 이번 트리에 없는 키. 페이지는 지우지 않고 경고만. */
export function staleMappingKeys(mapping, trees) {
  const live = new Set(trees.flatMap((t) => t.nodes.map((n) => n.key)));
  return Object.keys(mapping).filter((k) => !live.has(k)).sort();
}

const emptyStats = () => ({ created: 0, updated: 0, same: 0, flattened: [], images: [] });

/**
 * 멱등 동기화 본체.
 *  1차: 컬렉션마다 루트 → 폴더 → 파일 순으로 페이지를 확보한다(매핑 → GET, 없으면 제목+부모 lookup, 없으면 생성).
 *  2차: 전 컬렉션의 매핑이 갖춰진 뒤 상대 링크를 최종 URL 로 풀어 서버 사본과 다를 때만 PUT.
 *
 * @param collections [{ collection, files: [{ relpath, raw }] }]
 * @param mapping     { "<id>/<relpath>": pageId } — 입력은 바꾸지 않는다
 * @returns { spaceId, mapping, entries, summary: { [collection.id]: stats }, stale }
 *          entries 는 사이트맵용 [{ url, title, changed }] — 폴더 노드는 폴더 URL 로 나간다.
 */
export async function syncDevDocs({ collections, mapping, client, log = () => {} }) {
  const { space, created: spaceCreated } = await ensureSpace(client, DEV_SPACE);
  if (spaceCreated) log(`스페이스 생성: ${DEV_SPACE.key} (${space.id})`);

  const trees = collections.map(({ collection, files }) => ({ collection, nodes: buildTree(collection, files), files }));
  const pathIndex = buildPathIndex(trees);
  const kindOf = new Map(trees.flatMap((t) => t.nodes.map((n) => [n.key, n.kind])));
  let map = { ...mapping };
  const hrefOfKey = (key) => {
    const id = map[key];
    if (!id) return null;
    return kindOf.get(key) === 'folder' ? folderHref(space.id, id) : pageHref(space.id, id);
  };
  const resolverFor = (collection, relpath) => {
    const fromAbs = posix.join(toPosix(collection.dir), relpath ?? 'README.md');
    return (target) => {
      const key = pathIndex.get(resolveRelative(fromAbs, target));
      return key ? hrefOfKey(key) : null;
    };
  };

  const render = (tree, node, parentId) => {
    const { collection, nodes, files } = tree;
    const type = node.kind === 'folder' ? 'folder' : 'page';
    if (node.kind === 'folder' || !node.relpath) {
      const children = nodes.filter((n) => n.parentKey === node.key);
      return { title: node.title, content: renderIndex(children, hrefOfKey), parentId, type, flattened: [], images: [] };
    }
    const raw = files.find((f) => f.relpath === node.relpath).raw;
    const doc = renderDoc({ raw, origin: originOf(collection, node.relpath), resolve: resolverFor(collection, node.relpath) });
    return { title: node.title, content: doc.content, parentId, type, flattened: doc.flattened, images: doc.images };
  };

  const findExisting = async (key, title, parentId) => {
    if (map[key]) {
      try {
        return await client.getPage(map[key]);
      } catch (err) {
        if (!(err instanceof DocsApiError && err.status === 404)) throw err;
        log(`경고 — 매핑의 페이지가 서버에 없다: ${key} → ${map[key]} (제목으로 다시 찾는다)`);
      }
    }
    const hits = (await client.lookupPages(space.id, [title])) ?? [];
    for (const hit of hits.filter((p) => p.title === title)) {
      const page = await client.getPage(hit.id);
      if ((page.parentId ?? null) === parentId) return page;
    }
    return null;
  };

  const summary = {};
  const pages = new Map(); // key → 서버 사본
  for (const tree of trees) {
    const stats = emptyStats();
    summary[tree.collection.id] = stats;
    for (const node of tree.nodes) {
      const parentId = node.parentKey ? pages.get(node.parentKey).id : null;
      const draft = render(tree, node, parentId);
      let page = await findExisting(node.key, draft.title, parentId);
      if (!page) {
        page = await client.createPage({
          spaceId: space.id,
          parentId,
          title: draft.title,
          content: draft.content,
          type: draft.type,
          status: 'published',
        });
        stats.created += 1;
        log(`생성: ${node.key} → ${page.id}`);
      }
      map = mergeMapping(map, { [node.key]: page.id });
      pages.set(node.key, page);
    }
  }

  const entries = [];
  for (const tree of trees) {
    const stats = summary[tree.collection.id];
    for (const node of tree.nodes) {
      const parentId = node.parentKey ? pages.get(node.parentKey).id : null;
      const final = render(tree, node, parentId);
      final.flattened.forEach((t) => stats.flattened.push(`${node.key} → ${t}`));
      final.images.forEach((t) => stats.images.push(`${node.key}: ${t}`));
      const page = pages.get(node.key);
      const changed = needsDevUpdate(page, final);
      entries.push({ url: hrefOfKey(node.key), title: final.title, changed });
      if (!changed) {
        stats.same += 1;
        continue;
      }
      await client.updatePage(page.id, {
        title: final.title,
        content: final.content,
        parentId,
        expectedVersion: page.version,
        changeNote: 'sync-docs: 리포 개발 문서 동기화',
      });
      stats.updated += 1;
      log(`갱신: ${node.key} (v${page.version})`);
    }
  }

  return { spaceId: space.id, mapping: map, entries, summary, stale: staleMappingKeys(map, trees) };
}
