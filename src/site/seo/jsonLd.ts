import { BRAND, GITHUB_URL, SITE_URL } from '../content/brand';
import { definition, faq } from '../content/landing';
import type { Product } from '../content/products';

/**
 * schema.org JSON-LD 생성기. **전부 순수 함수다** — DOM 도 훅도 만지지 않는다.
 * 심는 것은 `useSeo({ jsonLd })` 의 몫이고, 여기서는 "무엇을 심을지"만 만든다.
 *
 * 적는 사실은 화면에 이미 보이는 것뿐이다. 구조화 데이터에만 있고 페이지에는 없는 주장은
 * 검색엔진 가이드라인 위반이고, 답변 엔진이 인용했을 때 사이트와 말이 달라진다.
 */

const abs = (path: string) => `${SITE_URL}${path}`;

/** 자기호스팅 무료 오픈소스라는 사실을 offers price 0 으로 표현한다(가격표가 아니라 "무료"의 표준 표기). */
export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND,
    description: definition,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Self-hosted (Docker)',
    url: abs('/'),
    sameAs: [GITHUB_URL],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/** 홈 FAQ 아코디언과 같은 내용. 화면에 없는 문답을 만들지 않기 위해 content 의 faq 를 그대로 받는다. */
export function faqPageJsonLd(items: typeof faq = faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/**
 * 제품 상세. 소스가 공개된 제품이라 SoftwareSourceCode 로 저장소를 밝히고,
 * 동시에 "설치해서 쓰는 애플리케이션"이기도 하므로 SoftwareApplication 을 함께 낸다.
 */
export function productJsonLd(product: Product) {
  const url = abs(`/products/${product.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: product.name,
      description: product.summary,
      url,
      codeRepository: product.repoUrl,
      programmingLanguage: ['TypeScript', 'Java'],
      isPartOf: { '@type': 'SoftwareApplication', name: BRAND, url: abs('/') },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: product.name,
      description: product.tagline,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Self-hosted (Docker)',
      url,
      sameAs: [product.repoUrl],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];
}
