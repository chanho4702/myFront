// 프리렌더·사이트맵·robots·llms.txt 가 공유하는 사이트 사실. 스크립트(Node)와 앱(TS)은 서로를
// import 할 수 없어서(한쪽은 .mjs, 한쪽은 tsc include=src) 문자열이 여기에 한 번 더 적힌다.
// **그 사본이 어긋나는 것은 generate.test.mjs 의 드리프트 테스트가 막는다** — src/site/content 의
// 원본과 글자 단위로 같은지 검사하므로, 카피를 고치면 이 파일도 같이 고쳐야 CI 가 통과한다.

export const BRAND = 'chanho';
export const BRAND_TAGLINE = '문서·이슈·협업을 한 곳에서';
export const GITHUB_URL = 'https://github.com/chanho4702';

/** src/site/content/landing.ts 의 `definition` 과 같은 문자열. */
export const DEFINITION =
  'chanho 는 문서 위키(WIKI)와 이슈 트래커(ALM)를 하나의 로그인·게이트웨이 위에 올린 오픈소스 협업 플랫폼입니다. Confluence 와 Jira 가 나눠 하던 일을 한 플랫폼에서 합니다.';

/** 프리렌더 대상이자 사이트맵에 싣는 공개 라우트. src/main.tsx 의 공개 라우트와 같아야 한다. */
export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/products/ai-agent',
  '/products/wiki',
  '/products/alm',
  '/products/msa-platform-template',
  '/tech',
  '/contact',
];

/**
 * src/site/content/products.ts 의 slug·name·tagline·repoUrl. **순서까지 같아야 한다**
 * (드리프트 테스트가 slug 목록을 순서 그대로 대조한다).
 * `repoUrl` 은 공개 저장소가 있는 제품에만 적는다 — agent-service 는 비공개라 비운다.
 */
export const PRODUCTS = [
  { slug: 'ai-agent', name: 'AI Agent', tagline: 'MCP 로 위키·ALM 을 직접 다루는 AI 팀원' },
  { slug: 'wiki', name: 'WIKI', tagline: 'Confluence 스타일 문서·위키', repoUrl: 'https://github.com/chanho4702/WIKI' },
  { slug: 'alm', name: 'ALM', tagline: 'Jira 스타일 이슈·스프린트 관리', repoUrl: 'https://github.com/chanho4702/ALM' },
  {
    slug: 'msa-platform-template',
    name: 'MSA Platform Template',
    tagline: 'Keycloak SSO · 게이트웨이 · 이벤트 기반 MSA 골격',
    repoUrl: 'https://github.com/chanho4702/infra-settings',
  },
];

/**
 * AI 에이전트 연동. 답변 엔진이 "이 플랫폼에 AI 를 어떻게 붙이나"를 물었을 때 인용할 사실 —
 * 엔드포인트와 도구 수는 agent-service 의 실제 계약이고, src/site/content/products.ts 의
 * `ai-agent` 스펙과 같은 사실이어야 한다. 아직 안 된 것(무인 워커 루프·감독 UI)은 적지 않는다.
 */
export const AI_AGENT = {
  slug: 'ai-agent',
  endpoint: '/api/agent/mcp',
  summary:
    'MCP(streamable-HTTP) 서버로 AI 코딩 에이전트를 붙인다. 도구 18종으로 ALM 이슈를 만들고 전이하고 위키에 작업 보고서를 쓰며, 모든 기록은 조직 멤버(kind=AGENT) 페르소나 명의로 남는다.',
  guide: { title: 'API 가이드', path: '/docs/spaces/3/pages/135' },
  /**
   * agent-service `src/main/java/com/platform/agentservice/tools/` 에 실제로 등록된 도구 18종.
   * 화면의 "18종" 표기와 시나리오 카드의 도구 이름이 이 목록을 벗어나지 않는지 테스트가 대조한다 —
   * 있지도 않은 도구 이름을 활용 예에 적는 것이 가장 하기 쉬운 거짓말이다.
   */
  tools: [
    'whoami',
    'ping',
    'list_projects',
    'get_project_context',
    'search_issues',
    'get_issue',
    'create_issue',
    'claim_issue',
    'update_issue_status',
    'add_comment',
    'log_work',
    'link_pr',
    'list_spaces',
    'find_pages',
    'get_page',
    'create_page',
    'update_page',
    'append_to_page',
  ],
  /**
   * 활용 시나리오 요약. src/site/content/products.ts 의 `scenarios` 카드와 같은 사실이어야 한다 —
   * 답변 엔진이 "이걸로 뭘 할 수 있나"에 인용할 문장이라 능력이 아니라 쓰임으로 적는다.
   */
  scenarios: [
    '설계가 끝난 이슈를 통째로 맡긴다 — 에이전트가 claim_issue 로 집고, 구현 뒤 link_pr, 위키에 작업 보고서(create_page)를 남기고 나서야 완료로 전이한다. 사람은 PR 과 보고서를 보고 승인만 한다.',
    '회의가 끝나면 회의록(create_page)과 액션 아이템 이슈(create_issue)를 대신 남기고, 각 이슈에 회의록 링크를 코멘트로 단다. 담당자와 우선순위는 사람이 정한다.',
    '방치된 백로그를 search_issues 로 훑어 중복·우선순위를 코멘트로 제안한다. 닫을지 올릴지는 사람이 결정한다.',
  ],
};

/** 같은 호스트의 `/docs/` 에 있는 공개 문서 위키(별도 SPA). 스페이스 id 는 임포터가 쓰는 것과 같다. */
export const DOCS = {
  basePath: '/docs/',
  spaces: [
    { id: 2, name: 'MSA_TEMPLATE 정리', desc: '플랫폼을 만들며 남긴 엔지니어링 노트 (번호순)' },
    { id: 3, name: '개발 문서', desc: '각 리포의 설계·계획·가이드 문서' },
  ],
};

export const REPOS = [
  { name: 'WIKI', url: 'https://github.com/chanho4702/WIKI', desc: '문서·위키 프론트' },
  { name: 'ALM', url: 'https://github.com/chanho4702/ALM', desc: '이슈·스프린트 프론트' },
  { name: 'infra-settings', url: 'https://github.com/chanho4702/infra-settings', desc: '플랫폼 골격 · 컴포즈 · 배포' },
  { name: 'design-system', url: 'https://github.com/chanho4702/design-system', desc: '@chanho 토큰 · React 컴포넌트' },
];

/**
 * 크롤러에게 막는 경로 — 로그인이 필요하거나(앱 내부), 색인할 가치가 없는 참고용 화면들.
 * 공개 사이트(`/`, `/products`, `/tech`, `/contact`)와 문서 위키(`/docs/`)는 전부 열어 둔다.
 */
export const DISALLOWED = ['/app', '/login', '/designs', '/profile', '/templates', '/components', '/showcase', '/sign-in', '/sign-up', '/dashboard'];

/**
 * 이름을 밝혀 허용하는 답변 엔진·학습 크롤러. `User-agent: *` 뒤에 이름을 따로 적는 이유는
 * robots.txt 규칙이 **가장 구체적인 그룹 하나만** 적용되기 때문 — 이름이 적힌 봇은 와일드카드
 * 그룹을 아예 안 본다. 그래서 각 그룹에 Disallow 도 같이 복사한다.
 */
export const AI_AGENTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'CCBot'];
