/** SpecTable 한 행. 값이 빈 문자열이면 렌더하지 않는다. */
export interface SpecRow {
  label: string;
  value: string;
}

/** StatBar 한 칸. */
export interface StatItem {
  value: string;
  label: string;
}

/** 엔지니어링 노트 메타. scripts/sync-notes.mjs 가 index.generated.ts 를 이 타입으로 생성한다. */
export interface NoteMeta {
  /** 볼트 파일명 앞 두 자리. URL 세그먼트이자 본문 파일명. */
  id: string;
  title: string;
  tags: string[];
  /** 볼트 frontmatter 의 작성일 (YYYY-MM-DD). 없으면 빈 문자열. */
  date: string;
  /** 볼트 frontmatter 의 상태. 없으면 빈 문자열. */
  status: string;
}
