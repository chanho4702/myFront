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
 * 코드 영역(펜스 블록 · 인라인 코드 스팬) 또는 위키링크 하나를 잡는 교대 패턴.
 * 코드가 먼저 오므로 코드 안의 [[...]] 는 위키링크 가지에 도달하지 못한다.
 *
 * 펜스는 ``` 과 ~~~ 를 모두 받고, 같은 문자 3개 이상으로 닫힌다. 닫는 펜스가 없으면
 * (두 번째 가지) 문서 끝까지 코드로 본다 — 미종결 펜스에서 이후 본문이 코드로 취급되는 건
 * 마크다운 렌더러의 동작과 같으므로, 변환도 같은 판단을 해야 결과가 어긋나지 않는다.
 */
const CODE_OR_WIKILINK = new RegExp(
  [
    '^[ \\t]*(`{3,}|~{3,})[^\\n]*\\n(?:[\\s\\S]*?^[ \\t]*\\1[ \\t]*$|[\\s\\S]*)',
    '(`+)[\\s\\S]*?\\2',
    '(\\[\\[[^\\]]+\\]\\])',
  ].join('|'),
  'gm',
);

/**
 * [[대상]] / [[대상|별칭]] / [[대상#앵커]] 처리.
 * resolve 가 노트 id 를 주면 내부 링크, null 이면 텍스트로 평탄화한다(끊긴 링크 0).
 *
 * 코드 영역 안의 [[...]] 는 링크가 아니라 **문법 예시**이므로 손대지 않는다. 평탄화하면
 * `[[대상]]` 을 설명하는 문장이 `대상` 이 되어 예시가 자기 의미를 잃는다(이 파이프라인을
 * 설명하는 노트에서 실제로 그렇게 깨졌다). 평탄화 보고(broken)에서도 빠진다.
 */
export function transformWikiLinks(body, resolve) {
  const broken = [];
  const out = body.replace(CODE_OR_WIKILINK, (all, _fence, _ticks, wikilink) => {
    if (!wikilink) return all; // 코드 영역 — 그대로 통과
    const inner = wikilink.slice(2, -2);
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

/**
 * H1 앞에 붙은 노트 번호와 구분자를 뗀다. 화면이 NO.15 를 따로 렌더하므로 중복을 막는다.
 *
 * 두 겹으로 잠근다 — 둘 중 하나만 어긋나도 원문을 그대로 돌려준다.
 *  1) 앞 두 자리 **뒤에 공백이나 대시가 와야** 한다. `2026 회고` 가 `26 회고` 로 잘리는 것을 막는다.
 *  2) 그 두 자리가 **이 노트의 id 와 같아야** 한다. 남의 번호를 떼지 않는다.
 * 떼고 나서 남는 게 없으면(제목이 `00` 뿐) 원문을 유지한다 — 제목을 통째로 잃느니 중복이 낫다.
 */
export function stripNumberPrefix(title, id) {
  const m = title.match(/^(\d\d)(?=[\s—–-])\s*(?:[—–-]\s*)?([\s\S]*)$/);
  if (!m || m[1] !== id) return title.trim();
  return m[2].trim() || title.trim();
}

/**
 * frontmatter 의 `상태` 를 배지용 짧은 라벨로 줄인다.
 * 첫 구분자(괄호 · 가운뎃점 · 대시 · 플러스) 앞까지만 취하고 마크다운/위키링크 문법을 턴다.
 * 원문(커밋 SHA·잔여 작업 메모)은 사이트에 싣지 않는다 — 배지 자리에 들어갈 정보가 아니다.
 *
 * 구분자로 **시작하는** 값(`(진행중) 완료`)은 첫 조각이 빈 문자열이 되어 상태가 통째로
 * 사라진다. 그 경우 원문 전체를 정리해 쓴다 — 비어 있는 배지보다 긴 배지가 낫다.
 */
export function statusLabel(status) {
  const clean = (s) => s.replace(/\[\[.*?\]\]/g, '').replace(/\*\*/g, '').trim();
  const first = clean(status.split(/\s*\(|\s·\s|\s[—–-]\s|\s\+\s/)[0]);
  return (first || clean(status)).slice(0, 24);
}
