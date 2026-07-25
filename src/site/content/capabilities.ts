export interface Capability {
  slug: string;
  title: string;
  lead: string;
  evidence: string;
}

export const capabilities: Capability[] = [
  {
    slug: 'platform-architecture',
    title: '플랫폼 아키텍처',
    lead: '서비스가 설 토대를 설계합니다.',
    evidence: '서버리스 SaaS(Atlassian Forge)와 Spring Cloud 기반 MSA를 직접 설계·구현.',
  },
  {
    slug: 'data-engineering',
    title: '데이터 엔지니어링 · 관측',
    lead: '결정을 데이터 위에 세웁니다.',
    evidence: 'Elasticsearch 수집·적재, Beats/Logstash 로그 파이프라인, Kibana·Grafana 대시보드.',
  },
  {
    slug: 'operations-reliability',
    title: '운영 · 안정성',
    lead: '멈추지 않게 운영합니다.',
    evidence: 'SLA 기반 장애 대응, 보안 솔루션 30개 사이트 구축·운영.',
  },
  {
    slug: 'ai-dev-env',
    title: 'AI 개발 환경',
    lead: '팀이 더 빠르게 만들게 합니다.',
    evidence: 'Claude Code 에이전트·스킬·MCP 직접 구성, 문서 기반 AI 협업 프로세스.',
  },
];

export const getCapability = (slug?: string): Capability | undefined =>
  capabilities.find((c) => c.slug === slug);
