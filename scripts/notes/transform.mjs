// 옵시디언 볼트 마크다운 → 사이트용 마크다운. 순수 함수만 둔다(I/O 는 sync-notes.mjs).

const NUMBERED = /^(\d\d)\s.+\.md$/;

/** 파일명이 "NN 제목.md" 형태인가. 개인 노트를 구조적으로 배제하는 유일한 관문. */
export function isWhitelisted(filename) {
  return NUMBERED.test(filename);
}

/** 파일명 앞 두 자리 번호. 화이트리스트 밖이면 null. */
export function noteIdOf(filename) {
  const m = filename.match(NUMBERED);
  return m ? m[1] : null;
}

/** YAML frontmatter 의 평평한 key: value 와 [a, b] 배열만 다룬다(yaml 의존성 없음). */
export function parseFrontmatter(raw) {
  // CRLF 정규화는 필수다. JS 정규식에서 \r 은 줄종결자라 `$` 가 그 앞에서 멈추고,
  // `^([^:]+):\s*(.*)$` 가 CR 로 끝나는 줄에서 통째로 null 을 반환해 meta 가 조용히 비어버린다.
  // 실제 볼트 22개 중 7개가 CRLF 다. 이후 단계는 모두 이 함수 출력을 받으므로 여기서 턴다.
  const normalized = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---')) return { meta: {}, body: normalized };
  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: normalized };

  const head = normalized.slice(3, end);
  // 닫는 --- 뒤의 남은 줄바꿈과 빈 줄을 전부 턴다. 한 줄만 지우면 본문이 \n 으로 시작한다.
  const body = normalized.slice(end + 4).replace(/^[^\n]*\r?\n/, '').replace(/^\s*\r?\n/, '');
  const meta = {};
  for (const line of head.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (value) {
      meta[key] = value;
    }
  }
  return { meta, body };
}

/** 본문 첫 H1 을 제목으로 승격하고 본문에서 뺀다. 페이지 헤딩과 중복 h1 을 만들지 않기 위함. */
export function extractTitle(body, filename) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  if (m && body.slice(0, m.index).trim() === '') {
    return { title: m[1].trim(), body: body.slice(m.index + m[0].length).replace(/^\r?\n/, '') };
  }
  return { title: filename.replace(/^\d\d\s/, '').replace(/\.md$/, ''), body };
}

/**
 * [[대상]] / [[대상|별칭]] / [[대상#앵커]] 처리.
 * resolve 가 노트 id 를 주면 내부 링크, null 이면 텍스트로 평탄화한다(끊긴 링크 0).
 */
export function transformWikiLinks(body, resolve) {
  const broken = [];
  const out = body.replace(/\[\[([^\]]+)\]\]/g, (_all, inner) => {
    const [linkPart, alias] = inner.split('|').map((s) => s.trim());
    const target = linkPart.split('#')[0].trim();
    // 별칭이 없으면 앵커를 뗀 target 을 라벨로 쓴다. linkPart 를 쓰면 `#섹션` 이 링크 글자에 남는다.
    const label = alias || target;
    const id = resolve(target);
    if (id) return `[${label}](/tech/notes/${id})`;
    broken.push(target);
    return label;
  });
  return { body: out, broken };
}

/**
 * 옵시디언 콜아웃 -> 라벨이 굵게 붙은 표준 인용문.
 * MUI Alert 매핑은 의도적으로 하지 않는다 — 커스텀 AST 없이 안전하게 렌더되고,
 * 타입이 색이 아니라 글자로 남아 색 단독 정보전달 문제도 없다.
 */
export function transformCallouts(body) {
  return body.replace(
    // 제목 부분은 [ \t]* 로 받는다 — \s* 는 \n 을 삼켜 다음 줄까지 라벨 안으로 끌어온다.
    /^>[ \t]*\[!(\w+)\][ \t]*(.*)$/gm,
    (_all, type, title) => {
      const label = title.trim()
        ? `**[${type.toUpperCase()}] ${title.trim()}**`
        : `**[${type.toUpperCase()}]**`;
      return `> ${label}\n>`;
    },
  );
}

/** H1 앞에 붙은 번호와 구분자를 뗀다. 화면이 NO.15 를 따로 렌더하므로 중복을 막는다. */
export function stripNumberPrefix(title) {
  return title.replace(/^\d\d\s*(?:[—–-]\s*)?/, '').trim();
}

/**
 * frontmatter 의 `상태` 를 배지용 짧은 라벨로 줄인다.
 * 첫 구분자(괄호 · 가운뎃점 · 대시 · 플러스) 앞까지만 취하고 마크다운/위키링크 문법을 턴다.
 * 원문(커밋 SHA·잔여 작업 메모)은 사이트에 싣지 않는다 — 배지 자리에 들어갈 정보가 아니다.
 */
export function statusLabel(status) {
  return status
    .split(/\s*\(|\s·\s|\s[—–-]\s|\s\+\s/)[0]
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/\*\*/g, '')
    .trim()
    .slice(0, 24);
}
