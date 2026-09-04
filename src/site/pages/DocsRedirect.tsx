import { useEffect } from 'react';

/** 엔지니어링 노트가 살던 `/tech/notes` 는 공개 문서 위키 `/docs/` 로 옮겼다. 라우터 밖 SPA 라 전체 페이지 이동. */
export const DOCS_URL = '/docs/';

export default function DocsRedirect() {
  useEffect(() => {
    window.location.replace(DOCS_URL);
  }, []);
  return null;
}
