import type { SpecRow } from '../types';

export interface TechGroup {
  category: string;
  items: string[];
}

export const techGroups: TechGroup[] = [
  {
    category: 'Backend',
    items: [
      'Spring Boot',
      'Spring Data JPA',
      'Spring Batch',
      'Spring Security',
      'WebFlux',
      'Spring Cloud',
      'Node.js (Forge)',
      'Kafka',
      'Redis',
      'Quartz',
    ],
  },
  {
    category: 'Data · Search',
    items: ['Elasticsearch', 'Kibana', 'Logstash', 'Beats / Fluentd', 'Grafana', 'MySQL', 'MSSQL'],
  },
  {
    category: 'DevOps · Infra',
    items: ['Docker', 'Kubernetes', 'Jenkins', 'ArgoCD', 'Spinnaker', 'Nexus', 'SonarQube', 'Keycloak'],
  },
  { category: 'Frontend', items: ['React', 'Vue.js', 'TypeScript', 'MUI', 'TanStack Query'] },
  { category: 'AI', items: ['Spring AI', 'Ollama', 'Claude Code 워크플로'] },
];

/** /tech 상단 — 이 플랫폼이 실제로 어떻게 구성돼 있는지. products.ts 의 MSA 템플릿 스펙과 같은 사실. */
export const platformSpec: SpecRow[] = [
  { label: '인증', value: 'Keycloak OIDC 리다이렉트 + auth-server 자체 RS256 JWT (BFF)' },
  { label: '게이트웨이', value: 'Spring Cloud Gateway · JWT 조기차단 · rate-limit' },
  { label: '디스커버리', value: 'Eureka' },
  { label: '이벤트', value: 'Redis Streams' },
  { label: '데이터', value: 'PostgreSQL' },
  { label: '관측', value: 'stdout JSON → Alloy → Loki → Grafana' },
  { label: 'CI/CD', value: 'GitHub Actions → GHCR → 셀프호스티드 러너 배포 (auth·gateway·eureka·board 적용)' },
  { label: '프론트', value: 'React 19 · 공유 디자인 시스템 · nginx 단일 오리진' },
];
