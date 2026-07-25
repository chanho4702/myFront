import type { StatItem } from '../types';

export const GITHUB_URL = 'https://github.com/chanho4702';
export const CONTACT_EMAIL = 'chanho470@naver.com';
export const PORTFOLIO_URL = 'https://oxidized-tile-0f2.notion.site/9bd7653948f34869ac67163d4bf40a89';

export interface CareerEntry {
  year: string;
  text: string;
}

export const career: CareerEntry[] = [
  { year: '2025.12 ~ 재직중', text: '디무브 — 서버리스 SaaS RMS 플랫폼 설계·구현' },
  { year: '2022.05 ~ 2025.12', text: '마크애니 — 보안 솔루션 구축·운영, 레거시 SPA 전면 전환' },
];

/** 홈 히어로 아래 신뢰 바. 전부 케이스스터디·역량 근거에서 나온 수치다. */
export const stats: StatItem[] = [
  { value: '2', label: '장관상 수상 (A-RMS)' },
  { value: '30', label: '보안 솔루션 구축 사이트' },
  { value: '3,000', label: '업무 이력 자동 이관 건수' },
  { value: '6', label: '플랫폼 백엔드 서비스' },
];

export interface CaseStudy {
  eyebrow: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  tags: string[];
  images?: { src: string; alt: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    eyebrow: 'A-RMS · 장관상 2회 수상작',
    title: '기억에 의존하던 업무 이력을 데이터 기반 의사결정으로',
    problem:
      '프로젝트 이력이 담당자의 기억과 흩어진 문서에 남아, 진행률·인력·성과를 한눈에 볼 수 없었습니다.',
    solution:
      '사내 업무 이력 3,000건을 Jira로 자동 이관하고, ALM/Jira 데이터를 Elasticsearch로 수집·적재해 시계열 인덱스와 집계 쿼리로 분석 체계를 세웠습니다.',
    result:
      '진행률·인력 활용률·ROI를 실시간 대시보드로 시각화. 두 개의 장관상을 수상하고, 데이터 기반 의사결정 체계로 사내에 정착시켰습니다.',
    tags: ['Elasticsearch', 'Kibana', 'Spring', 'ALM 데이터 분석'],
    images: [
      { src: '/arms-architecture.png', alt: 'A-RMS 시스템 아키텍처 다이어그램' },
      { src: '/arms-award.png', alt: 'A-RMS 수상 발표 공고 — SW기술 대상 · 공개SW 개발자대회 대상' },
    ],
  },
  {
    eyebrow: 'RMS SaaS · 디무브',
    title: '수작업 인력 관리를 수백 명이 쓰는 SaaS로',
    problem: '엑셀과 수작업에 의존하던 리소스 관리 업무를, 여러 조직이 함께 쓰는 제품으로 만들어야 했습니다.',
    solution:
      'Atlassian Forge(Node.js) + React로 서버리스 SaaS를 설계하고, Excel 대량 등록을 Async Events + Queue로 분할 처리해 서버리스 실행시간 제한을 극복했습니다.',
    result: 'Jira Cloud와 연동되는 RBAC 기반 플랫폼으로 수백 명이 사용합니다. Elastic Stack으로 로그를 관제합니다.',
    tags: ['Atlassian Forge', 'React', 'TanStack Query', 'Elastic Stack'],
  },
  {
    eyebrow: 'MSA 플랫폼 템플릿',
    title: '서비스를 만드는 게 아니라, 빠르게 만들 수 있는 환경을',
    problem: '새 서비스를 시작할 때마다 인증·게이트웨이·UI를 처음부터 세팅하는 반복이 있었습니다.',
    solution: 'Keycloak BFF 인증과 API 게이트웨이, 자체 디자인 시스템을 하나의 스타터로 묶었습니다.',
    result:
      '퇴근 후·주말 2주 만에 재사용 가능한 MSA 플랫폼 골격을 완성했습니다. 이 소개 페이지도 그 위에서 만들었습니다.',
    tags: ['Keycloak', 'Spring Cloud Gateway', '디자인 시스템', 'MSA'],
    images: [{ src: '/msa-architecture.jpg', alt: 'MSA 스타터 템플릿 아키텍처 다이어그램' }],
  },
];
