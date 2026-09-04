import { useEffect } from 'react';
import { BRAND, SITE_URL } from '../content/brand';

/**
 * 라우트별 head 태그. react-helmet 같은 런타임 의존성을 더하지 않고 DOM 을 직접 만진다 —
 * 이 사이트는 라우트가 일곱 개뿐이고, 프리렌더(scripts/prerender.mjs)가 헤드리스 크롬으로
 * 실제 DOM 을 떠서 정적 HTML 로 굽기 때문에 "렌더 후 DOM 에 박혀 있기만 하면" 된다.
 *
 * 태그는 지우지 않고 **덮어쓴다**(canonical/og:url 처럼 값이 라우트마다 달라지는 것들).
 * 라우트를 옮길 때마다 remove→add 를 하면 그 사이 순간 태그가 없는 상태가 생기고,
 * index.html 에 이미 있는 정적 description 을 지웠다가 못 되돌리는 사고가 난다.
 * 예외는 JSON-LD 하나 — 페이지마다 스키마가 다르므로 언마운트 때 반드시 걷어낸다.
 */
export interface SeoInput {
  title: string;
  description: string;
  /** `/products/wiki` 처럼 슬래시로 시작하는 경로. SITE_URL 과 합쳐 절대 URL 이 된다. */
  canonicalPath: string;
  /** 기본값은 브랜드 OG 이미지. 경로면 SITE_URL 기준 절대 URL 로 바뀐다. */
  ogImage?: string;
  /** schema.org JSON-LD. 배열이면 여러 스키마를 한 스크립트에 담는다. */
  jsonLd?: object | object[];
}

const DEFAULT_OG_IMAGE = '/og-image.png';
const JSON_LD_ID = 'seo-jsonld';

/** 경로면 절대 URL 로, 이미 절대 URL 이면 그대로. */
export const absoluteUrl = (pathOrUrl: string): string =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

/** `<meta name|property="key">` 를 찾아 값만 바꾸고, 없으면 만든다. */
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSeo({ title, description, canonicalPath, ogImage, jsonLd }: SeoInput) {
  // jsonLd 는 매 렌더 새 객체 리터럴로 들어오기 쉬워서 참조를 의존성에 넣으면 매 렌더 재실행된다.
  // 직렬화한 문자열을 의존성으로 삼아 "내용이 바뀔 때만" 다시 심는다.
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = absoluteUrl(canonicalPath);
    const image = absoluteUrl(ogImage ?? DEFAULT_OG_IMAGE);

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);

    upsertMeta('property', 'og:site_name', BRAND);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:locale', 'ko_KR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
  }, [title, description, canonicalPath, ogImage]);

  useEffect(() => {
    if (!jsonLdText) return;
    // id 로 재사용한다 — StrictMode 는 효과를 두 번 돌리므로 append 만 하면 스크립트가 두 개 생긴다.
    let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = JSON_LD_ID;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = jsonLdText;
    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, [jsonLdText]);
}
