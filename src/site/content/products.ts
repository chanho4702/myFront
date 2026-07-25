import type { SpecRow } from '../types';

export interface Product {
  slug: string;
  name: string;
  category: 'oss' | 'company';
  /** 카드 한 줄 설명 */
  tagline: string;
  /** 상세 페이지 리드 문단 */
  summary: string;
  spec: SpecRow[];
  highlights: string[];
  repoUrl?: string;
  /** nginx 단일 오리진(/wiki/, /alm/)에서만 유효한 구동 링크 */
  liveUrl?: string;
  badge?: string;
}

export const products: Product[] = [
  {
    slug: 'wiki',
    name: 'WIKI',
    category: 'oss',
    tagline: 'Confluence 스타일 문서·위키',
    summary:
      '스페이스 단위로 문서를 쓰고 관리하는 위키. 편집은 TipTap 리치 에디터지만 저장 포맷은 마크다운 문자열이라, 문서가 특정 에디터에 갇히지 않는다.',
    spec: [
      { label: 'Frontend', value: 'React · TipTap · react-router' },
      { label: 'UI', value: '@chanho/react + @chanho/tokens (자체 디자인 시스템)' },
      { label: 'Backend', value: 'wiki-backend (Spring Boot · PostgreSQL)' },
      { label: '저장 포맷', value: '마크다운 문자열 (serializeMarkdown 직렬화)' },
      { label: '서빙', value: 'nginx 단일 오리진 /wiki/ (Vite base + router basename 쌍)' },
      { label: '데이터 경로', value: 'wikiStore async 함수 단일 경유 — 백엔드 교체 시 화면 무수정' },
    ],
    highlights: [
      '에디터 스키마의 단일 원천을 확장 목록 파일 하나로 고정해, 화면 에디터와 헤드리스 마크다운 변환기가 같은 스키마를 공유한다. 마크다운 왕복이 깨지지 않는 근거.',
      '보기 렌더와 에디터 양쪽 모두 raw HTML 을 렌더하지 않는다 — XSS 방어를 한쪽만 걸지 않았다.',
      '도메인 데이터 접근을 스토어 파일 하나로 좁혀, localStorage 목업에서 실제 백엔드로 옮길 때 바꿀 파일이 하나다.',
    ],
    repoUrl: 'https://github.com/chanho4702/WIKI',
    liveUrl: '/wiki/',
  },
  {
    slug: 'alm',
    name: 'ALM',
    category: 'oss',
    tagline: 'Jira 스타일 이슈·스프린트 관리',
    summary:
      '지라의 검증된 구조 위에 한국어 스마트 검색과 필터 URL 공유를 얹은 이슈 트래커. 지라 클론이 아니라, 지라가 잘한 것을 가져오고 다른 지점을 의도적으로 다르게 만들었다.',
    spec: [
      { label: 'Frontend', value: 'React · react-router' },
      { label: 'UI', value: '@chanho/react + @chanho/tokens (자체 디자인 시스템)' },
      { label: '서빙', value: 'nginx 단일 오리진 /alm/' },
      { label: '데이터 경로', value: 'jiraStore async 함수 단일 경유' },
      { label: '특색', value: '한국어 스마트 검색 · 필터 URL 공유 · 저장 필터 사이드바 · 시간추적' },
    ],
    highlights: [
      '필터 상태를 URL 에 실어 공유 가능하게 만들었다 — 협업 도구에서 "내가 보는 화면"을 그대로 넘길 수 있어야 한다는 판단.',
      '백엔드 없이 못 만드는 기능은 구현하지 않고 백로그에 남긴다. 목업으로 흉내 낸 기능이 나중에 계약과 어긋나는 것을 막는다.',
    ],
    repoUrl: 'https://github.com/chanho4702/ALM',
    liveUrl: '/alm/',
  },
  {
    slug: 'design-system',
    name: 'Chanho Design System',
    category: 'oss',
    tagline: '스틸 블루 토큰과 React 컴포넌트 라이브러리',
    summary:
      '세 개의 프론트가 같은 얼굴을 갖게 하는 공유 레이어. 토큰 패키지와 React 컴포넌트 패키지로 나뉘어, 색·간격 같은 값과 그 값을 쓰는 컴포넌트를 따로 버전 관리한다.',
    spec: [
      { label: '패키지', value: '@chanho/tokens (디자인 토큰) · @chanho/react (컴포넌트)' },
      { label: '브랜드', value: '스틸 블루 #1B66C9 · 쿨 그레이 램프' },
      { label: '소비처', value: 'wiki-front · alm-front (myFront 는 MUI 테마로 같은 램프를 재현)' },
      { label: '배포', value: 'artifacts/*.tgz tarball — 소비 리포가 로컬 체크아웃으로 설치' },
    ],
    highlights: [
      '토큰을 CSS 변수(--chanho-*)로 노출해, 컴포넌트를 안 쓰는 커스텀 마크업도 같은 값을 쓰게 만들었다.',
      'myFront 는 MUI 기반이라 컴포넌트를 공유하지 않지만, 브랜드 램프를 같은 hex 로 맞춰 세 프론트의 색이 어긋나지 않는다.',
    ],
    repoUrl: 'https://github.com/chanho4702/design-system',
  },
  {
    slug: 'msa-platform-template',
    name: 'MSA Platform Template',
    category: 'oss',
    tagline: 'Keycloak BFF · 게이트웨이 · 이벤트 기반 MSA 스타터',
    summary:
      '새 서비스를 시작할 때마다 인증·게이트웨이·UI 를 처음부터 세팅하던 반복을 없애려고 만든 플랫폼 골격. 이 소개 사이트도 그 위에서 돌아간다.',
    spec: [
      { label: '인증', value: 'Keycloak OIDC 리다이렉트 + auth-server 자체 RS256 JWT (BFF)' },
      { label: '게이트웨이', value: 'Spring Cloud Gateway · JWT 조기차단 · rate-limit' },
      { label: '디스커버리', value: 'Eureka' },
      { label: '이벤트', value: 'Redis Streams' },
      { label: '데이터', value: 'PostgreSQL' },
      { label: '관측', value: 'stdout JSON → Alloy → Loki → Grafana' },
      { label: 'CI/CD', value: 'GitHub Actions → GHCR → 셀프호스티드 러너 배포' },
      { label: '서비스', value: '백엔드 6 · 프론트 3 + 공유 디자인 시스템' },
    ],
    highlights: [
      '로그 수집을 앱에서 디커플했다 — 앱은 stdout 에 JSON 만 쓰고 수집기가 가져간다. 로그 백엔드를 바꿔도 앱을 안 고친다.',
      '게이트웨이가 JWT 를 앞단에서 검증해 잘못된 요청이 서비스까지 내려가지 않는다.',
      'rate-limit 키를 nginx 뒤 실제 클라이언트 IP 로 잡도록 신뢰 프록시 깊이를 고정했다 — 안 그러면 전체 트래픽이 한 IP 로 묶인다.',
    ],
    repoUrl: 'https://github.com/chanho4702/infra-settings',
  },
  {
    slug: 'moves-workforce',
    name: 'Moves Workforce',
    category: 'company',
    badge: '디무브',
    tagline: 'Jira Cloud 연동 인력·자원 관리 SaaS',
    summary:
      '엑셀과 수작업에 의존하던 리소스 관리를 여러 조직이 함께 쓰는 제품으로 만든 서버리스 SaaS. 수백 명이 사용한다.',
    spec: [
      { label: 'Platform', value: 'Atlassian Forge (Node.js 서버리스)' },
      { label: 'Frontend', value: 'React · TanStack Query' },
      { label: '연동', value: 'Jira Cloud' },
      { label: '권한', value: 'RBAC' },
      { label: '관측', value: 'Elastic Stack' },
    ],
    highlights: [
      'Excel 대량 등록을 Async Events + Queue 로 분할 처리해 서버리스 실행시간 제한을 넘겼다.',
    ],
  },
  {
    slug: 'moves-eye',
    name: 'Moves Eye',
    category: 'company',
    badge: '디무브',
    tagline: 'Elastic Stack 기반 로그 수집·관측 플랫폼',
    summary: '서비스 로그를 모아 관제하는 플랫폼.',
    spec: [{ label: 'Stack', value: 'Elasticsearch · Kibana · Logstash · Beats' }],
    highlights: [],
  },
];

export const ossProducts = products.filter((p) => p.category === 'oss');
export const companyProducts = products.filter((p) => p.category === 'company');
export const getProduct = (slug?: string): Product | undefined => products.find((p) => p.slug === slug);
