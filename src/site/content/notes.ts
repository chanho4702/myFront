import { noteIndex } from './notes/index.generated';
import type { NoteMeta } from '../types';

export type { NoteMeta };

/** 본문은 빌드타임에 raw 문자열로 번들된다. 20개 · 228KB 규모라 eager 로 충분하다. */
const bodies = import.meta.glob('./notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const notes: NoteMeta[] = [...noteIndex].sort((a, b) => a.id.localeCompare(b.id));

export const getNote = (id?: string): NoteMeta | undefined =>
  id ? notes.find((n) => n.id === id) : undefined;

export const getNoteBody = (id: string): string | undefined => bodies[`./notes/${id}.md`];

/** 인덱스 필터용 태그 목록. 사용 빈도 내림차순, 동률이면 가나다순. */
export function allNoteTags(): string[] {
  const count = new Map<string, number>();
  for (const n of notes) for (const t of n.tags) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .map(([tag]) => tag);
}
