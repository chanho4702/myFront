/**
 * 헤딩 텍스트 → 앵커 id. 한글을 살리고 공백만 하이픈으로 바꾼다.
 * NoteBody(헤딩 id 부여)와 목차(링크 생성)가 이 함수 하나를 공유해야 앵커가 맞는다.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

/**
 * 본문에서 h2/h3 만 뽑아 목차를 만든다. 코드블록 안의 `#` 은 건너뛴다.
 *
 * id 는 `slugify(text)` 뿐이다 — 등장 순서 카운터를 쓰지 않는다. 카운터를 쓰면 렌더 시점의
 * 상태에 id 가 의존하게 되고, `NoteBody` 쪽 카운터가 리렌더마다 이어져 앵커가 밀린다.
 * 실측: 노트 20편 196개 헤딩 중 슬러그 중복 0건. 훗날 중복이 생기면 목차 링크가 첫 번째
 * 헤딩으로 가는 정도의 열화만 남는다(앵커가 통째로 깨지는 것보다 낫다).
 */
export function tableOfContents(markdown: string): TocEntry[] {
  const out: TocEntry[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(##|###)\s+(.+?)\s*$/);
    if (!m) continue;
    const text = m[2].replace(/[*_`]/g, '').trim();
    out.push({ level: m[1].length as 2 | 3, text, id: slugify(text) });
  }
  return out;
}
