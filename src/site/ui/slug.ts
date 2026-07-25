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

/** 본문에서 h2/h3 만 뽑아 목차를 만든다. 코드블록 안의 `#` 은 건너뛴다. */
export function tableOfContents(markdown: string): TocEntry[] {
  const out: TocEntry[] = [];
  const seen = new Map<string, number>();
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
    const base = slugify(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ level: m[1].length as 2 | 3, text, id: n === 0 ? base : `${base}-${n}` });
  }
  return out;
}
