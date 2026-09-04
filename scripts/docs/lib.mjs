// 옵시디언 노트 → 공개 문서 위키(docs 인스턴스) 임포터의 순수 부분.
// 파일 I/O · 환경변수 · 프로세스 종료는 sync-docs.mjs(얇은 CLI)가 맡고, 여기는
// fetch 를 주입받는 클라이언트와 판단 함수만 둔다 — 백엔드 없이 단위 테스트하기 위해서다.

import {
  noteIdOf,
  parseFrontmatter,
  extractTitle,
  transformWikiLinks,
  transformCallouts,
  stripNumberPrefix,
} from '../notes/transform.mjs';

export const SPACE_KEY = 'docs';
export const SPACE_NAME = 'MSA_TEMPLATE 정리';
/** 백엔드 title 컬럼 한계. 넘기면 400 이 아니라 여기서 먼저 잘라 실패를 막는다. */
export const TITLE_MAX = 255;

/** 위키 프론트(docs 모드)의 페이지 URL. 위키링크의 새 목적지다. */
export const pageHref = (spaceId, pageId) => `/docs/spaces/${spaceId}/pages/${pageId}`;

/** 같은 번호를 가진 파일들. 비어 있지 않으면 임포터는 멈춰야 한다(볼트에서 번호를 바로잡을 일). */
export function findDuplicateIds(files) {
  const byId = new Map();
  for (const file of files) {
    const id = noteIdOf(file);
    if (id) byId.set(id, [...(byId.get(id) ?? []), file]);
  }
  return [...byId.entries()].filter(([, list]) => list.length > 1).map(([id, list]) => ({ id, files: list }));
}

/**
 * 위키링크 대상(파일명, 확장자 유무 양쪽) → 노트 id.
 * 볼트 파일 목록에서 한 번 만들어 두고 resolver 로 쓴다.
 */
export function makeTargetResolver(files) {
  const idByTarget = new Map();
  for (const file of files) {
    const id = noteIdOf(file);
    if (!id) continue;
    idByTarget.set(file.replace(/\.md$/, ''), id);
    idByTarget.set(file, id);
  }
  return (target) => idByTarget.get(target) ?? idByTarget.get(`${target}.md`) ?? null;
}

/**
 * frontmatter 를 본문 맨 위 한 줄 인용문으로 옮긴다. 위키에 커스텀 필드가 없어서다.
 * 값이 하나도 없으면 빈 문자열 — 빈 인용문을 남기지 않는다.
 * 상태 원문은 그대로 둔다(위키링크는 이후 단계에서 변환되므로 링크가 살아남는다).
 */
export function metadataLine(meta) {
  const parts = [];
  if (typeof meta['작성일'] === 'string' && meta['작성일']) parts.push(`작성일 ${meta['작성일']}`);
  if (typeof meta['상태'] === 'string' && meta['상태']) parts.push(`상태 ${meta['상태']}`);
  const tags = Array.isArray(meta.tags) ? meta.tags : meta.tags ? [String(meta.tags)] : [];
  if (tags.length) parts.push(`태그 ${tags.join(', ')}`);
  return parts.length ? `> ${parts.join(' · ')}` : '';
}

/**
 * 페이지 제목: "NN 제목". 번호를 남겨야 위키 트리에서 순서가 저절로 맞는다.
 * H1 이 "15 — 제목" 이든 "15 제목" 이든 stripNumberPrefix 로 한 번 벗긴 뒤 다시 붙여 형태를 통일한다.
 */
export function pageTitle(id, rawTitle) {
  const bare = stripNumberPrefix(rawTitle, id);
  const title = bare === id ? id : `${id} ${bare}`;
  return title.length > TITLE_MAX ? title.slice(0, TITLE_MAX) : title;
}

/**
 * 노트 한 편을 위키 페이지 입력으로 변환한다.
 * resolveHref(target) 는 위키링크 대상 → URL 또는 null(평탄화). 1차 패스는 아직 없는 페이지를
 * null 로 받고, 2차 패스는 전부 URL 로 받는다 — 같은 함수를 두 번 부르는 이유다.
 */
export function renderNote(file, raw, resolveHref) {
  const id = noteIdOf(file);
  const { meta, body: afterMeta } = parseFrontmatter(raw);
  const { title, body: afterTitle } = extractTitle(afterMeta, file);
  const head = metadataLine(meta);
  const withMeta = head ? `${head}\n\n${afterTitle}` : afterTitle;
  // transformWikiLinks 의 resolve 는 id 를, href 는 id → URL 을 기대한다. 여기서는 URL 을 곧장
  // 얻을 수 있으므로 id 자리에 URL 을 흘려보내고 href 는 항등으로 둔다.
  const { body: afterLinks, broken } = transformWikiLinks(withMeta, resolveHref, (href) => href);
  const content = `${transformCallouts(afterLinks).trimEnd()}\n`;
  return { id, title: pageTitle(id, title), content, broken };
}

/** 비교 전 정규화 — 서버가 CRLF 를 LF 로 바꾸거나 끝 공백을 정리해도 "같다" 로 봐야 한다. */
const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').trimEnd();

/** 서버 사본과 원하는 값이 다를 때만 true. PUT 을 아끼고 리비전을 불필요하게 늘리지 않는다. */
export function needsUpdate(serverPage, desired) {
  return norm(serverPage.title) !== norm(desired.title) || norm(serverPage.content) !== norm(desired.content);
}

/**
 * 매핑 병합. 새 항목을 더하고 키(노트 번호)순으로 정렬해 커밋 diff 가 안정되게 한다.
 * 같은 번호가 양쪽에 있으면 additions 가 이긴다 — 서버에서 방금 확인한 값이 권위다
 * (매핑의 페이지가 지워져 제목으로 다시 찾은 경우 옛 id 를 버려야 한다).
 */
export function mergeMapping(existing, additions) {
  const merged = { ...existing, ...additions };
  return Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]));
}

/** 매핑에는 있는데 볼트에서 사라진 번호. 페이지를 지우지는 않고 경고만 낸다. */
export function staleMappingIds(mapping, ids) {
  const live = new Set(ids);
  return Object.keys(mapping).filter((k) => !live.has(k)).sort();
}

export class DocsApiError extends Error {
  constructor(method, path, status, message) {
    super(`${method} ${path} → ${status}${message ? `: ${message}` : ''}`);
    this.name = 'DocsApiError';
    this.status = status;
  }
}

/**
 * docs 인스턴스 API 클라이언트. fetch 를 주입받는다(테스트는 가짜, CLI 는 globalThis.fetch).
 * 오류 본문은 `{"error": "..."}` 계약이므로 그 메시지를 예외에 싣는다.
 */
export function createDocsClient({ baseUrl, token, fetch }) {
  const base = baseUrl.replace(/\/+$/, '');
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['X-Docs-Import-Token'] = token;

  async function call(method, path, body) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    if (!res.ok) throw new DocsApiError(method, path, res.status, json?.error ?? text.slice(0, 200));
    return json;
  }

  const q = encodeURIComponent;
  return {
    listSpaces: () => call('GET', '/api/wiki/spaces'),
    createSpace: (space) => call('POST', '/api/wiki/spaces', space),
    getPage: (id) => call('GET', `/api/wiki/pages/${q(id)}`),
    createPage: (page) => call('POST', '/api/wiki/pages', page),
    updatePage: (id, page) => call('PUT', `/api/wiki/pages/${q(id)}`, page),
    lookupPages: (spaceId, titles) =>
      call('GET', `/api/wiki/spaces/${q(spaceId)}/pages/lookup?${titles.map((t) => `title=${q(t)}`).join('&')}`),
  };
}

export const NOTES_SPACE = {
  key: SPACE_KEY,
  name: SPACE_NAME,
  description: '옵시디언 보관함의 MSA_TEMPLATE 정리 노트를 그대로 옮긴 공개 문서.',
};

/** key 로 스페이스를 찾고 없으면 만든다. 기본은 노트 스페이스(`docs`), 개발 문서는 `dev` 를 넘긴다. */
export async function ensureSpace(client, spec = NOTES_SPACE) {
  const spaces = await client.listSpaces();
  const found = (spaces ?? []).find((s) => s.key === spec.key);
  if (found) return { space: found, created: false };
  const space = await client.createSpace({ key: spec.key, name: spec.name, description: spec.description });
  return { space, created: true };
}

/**
 * 멱등 동기화 본체.
 *  1차: 노트마다 페이지를 확보한다 — 매핑 → 서버 GET, 매핑이 없으면 제목 lookup, 그래도 없으면 생성.
 *  2차: 전 매핑이 갖춰진 뒤 위키링크를 최종 URL 로 풀어 서버 사본과 다를 때만 PUT.
 *
 * @param notes   [{ file, raw }] — 번호순으로 정렬돼 있다고 가정
 * @param mapping { "00": pageId, ... } — 입력은 바꾸지 않는다
 * @returns { spaceId, mapping, entries, summary: { created, updated, skipped, broken: [], stale: [] } }
 *          entries 는 사이트맵용 [{ url, title, changed }] — changed 는 이번 실행에서 실제로 바뀐 페이지.
 */
export async function syncDocs({ notes, mapping, client, log = () => {} }) {
  const files = notes.map((n) => n.file);
  const dupes = findDuplicateIds(files);
  if (dupes.length) {
    const lines = dupes.map((d) => `  ${d.id}: ${d.files.join(' | ')}`).join('\n');
    throw new Error(`번호가 겹치는 노트가 있습니다 — 볼트에서 번호를 바로잡은 뒤 다시 실행하세요.\n${lines}`);
  }

  const { space, created: spaceCreated } = await ensureSpace(client);
  if (spaceCreated) log(`스페이스 생성: ${SPACE_KEY} (${space.id})`);

  const resolveId = makeTargetResolver(files);
  let map = { ...mapping };
  const hrefOf = (target) => {
    const id = resolveId(target);
    const pageId = id ? map[id] : undefined;
    return pageId ? pageHref(space.id, pageId) : null;
  };

  // 1차 — 페이지 확보. 서버 사본(version 포함)을 붙들어 2차에서 GET 을 반복하지 않는다.
  const pages = new Map(); // id → PageResponse
  let created = 0;
  for (const { file, raw } of notes) {
    const draft = renderNote(file, raw, hrefOf);
    let page = null;
    if (map[draft.id]) {
      try {
        page = await client.getPage(map[draft.id]);
      } catch (err) {
        if (!(err instanceof DocsApiError && err.status === 404)) throw err;
        log(`경고 — 매핑의 페이지가 서버에 없다: ${draft.id} → ${map[draft.id]} (제목으로 다시 찾는다)`);
      }
    }
    if (!page) {
      const hits = (await client.lookupPages(space.id, [draft.title])) ?? [];
      const hit = hits.find((p) => p.title === draft.title);
      if (hit) page = await client.getPage(hit.id);
    }
    if (!page) {
      page = await client.createPage({
        spaceId: space.id,
        parentId: null,
        title: draft.title,
        content: draft.content,
        type: 'page',
        status: 'published',
      });
      created += 1;
      log(`생성: ${draft.title} → ${page.id}`);
    }
    map = mergeMapping(map, { [draft.id]: page.id });
    pages.set(draft.id, page);
  }

  // 2차 — 매핑이 완성됐으니 링크를 최종 URL 로 풀고, 달라진 페이지만 갱신.
  let updated = 0;
  let skipped = 0;
  const broken = [];
  const entries = [];
  for (const { file, raw } of notes) {
    const final = renderNote(file, raw, hrefOf);
    final.broken.forEach((b) => broken.push(`${file} → [[${b}]]`));
    const page = pages.get(final.id);
    const changed = needsUpdate(page, final);
    entries.push({ url: pageHref(space.id, page.id), title: final.title, changed });
    if (!changed) {
      skipped += 1;
      continue;
    }
    await client.updatePage(page.id, {
      title: final.title,
      content: final.content,
      parentId: page.parentId ?? null,
      expectedVersion: page.version,
      changeNote: 'sync-docs: 옵시디언 노트 동기화',
    });
    updated += 1;
    log(`갱신: ${final.title} (v${page.version})`);
  }

  const stale = staleMappingIds(map, notes.map((n) => noteIdOf(n.file)));
  return {
    spaceId: space.id,
    mapping: map,
    entries,
    summary: { created, updated, skipped, broken, stale },
  };
}
