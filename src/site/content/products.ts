import type { SpecRow } from '../types';

export interface Product {
  slug: string;
  name: string;
  /** 카드 한 줄 설명 */
  tagline: string;
  /** 상세 페이지 리드 문단 */
  summary: string;
  spec: SpecRow[];
  highlights: string[];
  /**
   * 공개 저장소. **비공개 리포인 제품은 이 값을 비운다** — 없는 링크를 걸거나
   * "오픈소스"라고 표기하지 않기 위해서다(카드 kicker·상세 CTA·JSON-LD 가 전부 이 값으로 갈린다).
   */
  repoUrl?: string;
  /** nginx 단일 오리진(/wiki/, /alm/)에서만 유효한 구동 링크 */
  liveUrl?: string;
  /** 인덱스 카드 하단 라벨. 기본은 'OPEN SOURCE' — 저장소가 비공개인 제품이 다른 말을 할 자리. */
  kicker?: string;
  /** 라이브 앱도 공개 저장소도 없는 제품의 진입점(문서·설정 화면). 전부 실재하는 경로만 적는다. */
  entryPoints?: { label: string; href: string }[];
}

/**
 * 제품은 넷이다 — 문서(WIKI)·이슈(ALM)·그 둘을 다루는 AI 에이전트(AI Agent)·
 * 셋이 올라가는 플랫폼. 디자인 시스템은 제품이 아니라 공유 레이어라 /tech 에서만 다룬다.
 */
export const products: Product[] = [
  {
    slug: 'wiki',
    name: 'WIKI',
    tagline: 'Confluence 스타일 문서·위키',
    summary:
      '스페이스 단위로 문서를 쓰고 관리하는 위키. 편집은 TipTap 리치 에디터지만 저장 포맷은 마크다운 문자열이라, 문서가 특정 에디터에 갇히지 않는다.',
    spec: [
      { label: 'Frontend', value: 'React · TipTap · react-router' },
      { label: 'UI', value: '@chanho/react + @chanho/tokens (자체 디자인 시스템)' },
      { label: 'Backend', value: 'wiki-backend (Spring Boot · PostgreSQL)' },
      { label: '저장 포맷', value: '마크다운 문자열 (serializeMarkdown 직렬화)' },
      { label: '협업', value: '인라인 댓글 · 구독 · 리비전 · 라벨 · 백링크' },
      { label: '서빙', value: 'nginx 단일 오리진 /wiki/ (Vite base + router basename 쌍)' },
      { label: '데이터 경로', value: 'wikiStore async 함수 단일 경유 — 백엔드 교체 시 화면 무수정' },
    ],
    highlights: [
      '에디터 스키마의 단일 원천을 확장 목록 파일 하나로 고정해, 화면 에디터와 헤드리스 마크다운 변환기가 같은 스키마를 공유한다. 마크다운 왕복이 깨지지 않는 근거.',
      '보기 렌더와 에디터 양쪽 모두 raw HTML 을 렌더하지 않는다 — XSS 방어를 한쪽만 걸지 않았다.',
      '권한은 조상 폐포(ancestor closure)로 미리 풀어 두고, 페이지 트리는 지연 로딩한다 — 문서가 수만 장으로 늘어도 트리와 권한 검사가 느려지지 않게 한 선택.',
    ],
    repoUrl: 'https://github.com/chanho4702/WIKI',
    liveUrl: '/wiki/',
  },
  {
    slug: 'alm',
    name: 'ALM',
    tagline: 'Jira 스타일 이슈·스프린트 관리',
    summary:
      '지라의 검증된 구조 위에 한국어 스마트 검색과 필터 URL 공유를 얹은 이슈 트래커. 지라 클론이 아니라, 지라가 잘한 것을 가져오고 다른 지점을 의도적으로 다르게 만들었다.',
    spec: [
      { label: 'Frontend', value: 'React · react-router · TipTap(설명·댓글, @멘션)' },
      { label: 'UI', value: '@chanho/react + @chanho/tokens (자체 디자인 시스템)' },
      { label: 'Backend', value: 'alm-backend (Spring Boot · PostgreSQL · MinIO 첨부)' },
      { label: '보드', value: '백로그 · 스프린트 · 칸반 · 간트 · 대시보드 · 워크로그' },
      { label: '설정', value: '워크플로 캔버스 · 상태/타입 레지스트리 · 우선순위 스킴 · 링크 타입 · 컴포넌트' },
      { label: '서빙', value: 'nginx 단일 오리진 /alm/' },
      { label: '특색', value: '한국어 스마트 검색 · 필터 URL 공유 · 저장 필터 사이드바 · 시간추적' },
    ],
    highlights: [
      '필터 상태를 URL 에 실어 공유 가능하게 만들었다 — 협업 도구에서 "내가 보는 화면"을 그대로 넘길 수 있어야 한다는 판단.',
      '이슈 계층에 깊이 제한을 두지 않는다. 에픽→스토리→서브태스크로 고정하는 대신 타입 레지스트리가 허용하는 관계면 어디까지든 내려간다.',
      '백엔드 없이 못 만드는 기능은 구현하지 않고 백로그에 남긴다. 목업으로 흉내 낸 기능이 나중에 계약과 어긋나는 것을 막는다.',
    ],
    repoUrl: 'https://github.com/chanho4702/ALM',
    liveUrl: '/alm/',
  },
  {
    slug: 'ai-agent',
    name: 'AI Agent',
    tagline: 'MCP 로 위키·ALM 을 직접 다루는 AI 팀원',
    summary:
      'Claude Code 나 Codex 같은 AI 코딩 에이전트를 플랫폼에 붙이는 통로입니다. 에이전트는 채팅 밖에서 실제로 이슈를 만들고 상태를 옮기고 위키에 작업 보고서를 씁니다. 모든 기록은 사람 계정이 아니라 그 에이전트의 페르소나 명의로 남습니다.',
    spec: [
      { label: '접속', value: 'MCP streamable-HTTP — 게이트웨이 /api/agent/mcp 단일 진입점' },
      { label: '도구', value: '18종 — 이슈 조회·생성·전이·코멘트·워크로그·PR 링크, 위키 페이지 조회·작성·이어쓰기' },
      { label: '신원', value: '페르소나 = 조직 멤버(kind=AGENT) — 사람 멤버(kind=USER)와 같은 자리에 다른 종류로 선다' },
      { label: '인증', value: '에이전트 전용 토큰(agp_ 접두사 · SHA-256 저장 · 페르소나에 바인딩)' },
      { label: '감사', value: '도구 호출마다 호출 도구 · 결과 · 페르소나가 감사 테이블에 적재' },
      { label: '사람의 자리', value: '승인 게이트에서 판단 · 작업 보고서 의무 — 보고서 없는 완료 금지' },
      { label: 'Backend', value: 'agent-service (Spring Boot · PostgreSQL)' },
      { label: '클라이언트', value: 'MCP 를 말하는 코딩 에이전트면 무엇이든 — Claude Code · Codex' },
    ],
    highlights: [
      '에이전트를 봇 계정이 아니라 조직 멤버로 세웠다. 신원은 auth-server 계정 → org-service 멤버(kind=AGENT) → 페르소나 세 계층으로 이어지고, 이슈의 담당자·코멘트 작성자·위키 수정자가 전부 그 페르소나로 찍힌다. "누가 이걸 했나"에 사람 이름이 잘못 붙지 않게 한 선택.',
      '보고서 없는 완료를 금지했다. 에이전트는 완료 전에 위키에 작업 보고서를 남기고 그 링크를 이슈에 달아야 한다 — 사람이 결과를 되짚을 수 있어야 자동화를 늘릴 수 있다는 판단.',
      '토큰을 사람 것과 분리했다. 에이전트 토큰은 별도 접두사로 발급돼 페르소나에 묶이고, 사람이 쓰는 개인 API 토큰은 제품별 읽기·쓰기 스코프로 권한을 좁힌다. 자동화가 넓은 권한을 물려받지 않게 하는 층.',
      '사람이 판단하는 지점을 남겨 뒀다 — 승인 게이트가 앞에 있고, 예산 상한과 킬 스위치는 설계에 포함돼 있다. 무인 워커 루프와 감독 UI 는 준비 중이라 아직 이 목록의 사실이 아니다.',
    ],
    kicker: 'MCP · 셀프호스팅',
    entryPoints: [
      { label: 'API 가이드', href: '/docs/spaces/3/pages/135' },
      { label: '개인 API 토큰', href: '/app/tokens' },
    ],
  },
  {
    slug: 'msa-platform-template',
    name: 'MSA Platform Template',
    tagline: 'Keycloak SSO · 게이트웨이 · 이벤트 기반 MSA 골격',
    summary:
      'WIKI 와 ALM 이 올라가 있는 플랫폼 그 자체. 새 서비스를 시작할 때마다 인증·게이트웨이·관측을 처음부터 세팅하던 반복을 없애려고 만든 골격이고, 이 소개 사이트도 그 위에서 돌아간다.',
    spec: [
      { label: '인증', value: 'Keycloak OIDC 리다이렉트(구글 포함) + auth-server 자체 RS256 JWT (BFF)' },
      { label: '로그아웃', value: '백채널(서버-서버 end_session)' },
      { label: '게이트웨이', value: 'Spring Cloud Gateway · JWT 조기차단 · rate-limit' },
      { label: '디스커버리', value: 'Eureka' },
      { label: '이벤트', value: 'Redis Streams' },
      { label: '데이터', value: 'PostgreSQL · MinIO(S3 호환 첨부) · OpenSearch(검색)' },
      { label: '관측', value: 'stdout JSON → Alloy → Loki → Grafana' },
      { label: 'CI/CD', value: 'GitHub Actions → GHCR → 셀프호스티드 러너 배포' },
      { label: '서비스', value: '백엔드 7(에이전트 기록 계층 포함) · 프론트 3 + 공유 디자인 시스템' },
    ],
    highlights: [
      '로그 수집을 앱에서 디커플했다 — 앱은 stdout 에 JSON 만 쓰고 수집기가 가져간다. 로그 백엔드를 바꿔도 앱을 안 고친다.',
      '게이트웨이가 JWT 를 앞단에서 검증해 잘못된 요청이 서비스까지 내려가지 않는다.',
      'JWT 검증·오류 계약·공용 예외를 common-starter 하나로 발행해 다섯 서비스가 같은 규약을 본다 — 서비스마다 복제한 인증 코드가 조용히 어긋나는 것을 구조로 막았다.',
      'rate-limit 키를 nginx 뒤 실제 클라이언트 IP 로 잡도록 신뢰 프록시 깊이를 고정했다 — 안 그러면 전체 트래픽이 한 IP 로 묶인다.',
    ],
    repoUrl: 'https://github.com/chanho4702/infra-settings',
  },
];

export const getProduct = (slug?: string): Product | undefined => products.find((p) => p.slug === slug);
