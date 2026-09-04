import type { SpecRow } from '../types';

export interface TechGroup {
  category: string;
  items: string[];
}

/** 이 플랫폼이 실제로 쓰는 스택만 싣는다 — 컨테이너 목록·products.ts 스펙과 같은 사실. */
export const techGroups: TechGroup[] = [
  {
    category: 'Backend',
    items: ['Spring Boot', 'Spring Cloud Gateway', 'Spring Security', 'Spring Data JPA', 'gRPC', 'Flyway', 'Eureka'],
  },
  {
    category: 'Data · Search',
    items: ['PostgreSQL', 'Redis Streams', 'OpenSearch', 'MinIO (S3 호환)'],
  },
  {
    category: 'Infra · Ops',
    items: ['Docker Compose', 'nginx', 'Keycloak', 'GitHub Actions', 'GHCR', 'Alloy · Loki · Grafana'],
  },
  { category: 'Frontend', items: ['React 19', 'TypeScript', 'Vite', 'TipTap', 'MUI', '@chanho 디자인 시스템'] },
  { category: 'AI', items: ['Claude Code 워크플로', 'Codex 교차 리뷰'] },
];

/** /tech 상단 — 이 플랫폼이 실제로 어떻게 구성돼 있는지. products.ts 의 MSA 템플릿 스펙과 같은 사실. */
export const platformSpec: SpecRow[] = [
  { label: '인증', value: 'Keycloak OIDC 리다이렉트 + auth-server 자체 RS256 JWT (BFF)' },
  { label: '게이트웨이', value: 'Spring Cloud Gateway · JWT 조기차단 · rate-limit' },
  { label: '디스커버리', value: 'Eureka' },
  { label: '이벤트', value: 'Redis Streams' },
  { label: '데이터', value: 'PostgreSQL · MinIO · OpenSearch' },
  { label: '관측', value: 'stdout JSON → Alloy → Loki → Grafana' },
  { label: 'CI/CD', value: 'GitHub Actions → GHCR → 셀프호스티드 러너 배포' },
  { label: '프론트', value: 'React 19 · 공유 디자인 시스템(@chanho) · nginx 단일 오리진' },
];

/** 공유 디자인 시스템 — 제품이 아니라 세 프론트가 같은 얼굴을 갖게 하는 레이어라 /tech 에서만 다룬다. */
export const designSystemSpec: SpecRow[] = [
  { label: '패키지', value: '@chanho/tokens (디자인 토큰) · @chanho/react (컴포넌트)' },
  { label: '팔레트', value: '스틸 블루 브랜드 램프 · 쿨 그레이 뉴트럴 스케일' },
  { label: '소비처', value: 'wiki-front · alm-front · 이 사이트(MUI 테마에 같은 램프 매핑)' },
  { label: '배포', value: 'GitHub Packages 버전 발행 — 소비 리포가 각자의 시점에 팔레트 변경을 받아들인다' },
  { label: '저장소', value: 'github.com/chanho4702/design-system' },
];
