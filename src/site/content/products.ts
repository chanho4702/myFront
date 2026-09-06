import type { SpecRow } from '../types';

/**
 * "이렇게 씁니다" 한 장. 상황 → 도구 흐름 → 사람이 개입하는 지점의 세 칸으로 고정한다 —
 * 자동화 소개가 능력 자랑으로 흐르지 않게 하려면 마지막 칸이 항상 있어야 한다.
 *
 * `flow` 에는 **실재하는 MCP 도구 이름만** 적는다(agent-service `tools/` 의 18종).
 * 도구가 아닌 단계(사람의 구현 작업 등)는 `~` 로 감싸 도구와 구분한다.
 */
export interface Scenario {
  /** 해시 앵커. 홈 기능 블록이 `/products/<slug>#<id>` 로 이 카드를 직접 가리킨다. */
  id: string;
  title: string;
  /** 상황 한 줄 */
  situation: string;
  flow: string[];
  /** 사람이 판단하는 지점 */
  human: string;
  /** 더 읽을 문서(선택). 실재하는 경로만. */
  doc?: { label: string; href: string };
}

/** "연결하는 법" 한 단계. `code` 는 그대로 복사해 쓰는 스니펫이고 토큰은 늘 플레이스홀더다. */
export interface SetupStep {
  title: string;
  body: string;
  code?: string;
}

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
  /** 상세 페이지 메타 설명. 비우면 `summary` 를 쓴다 — 활용법이 검색 스니펫에 와야 할 때만 채운다. */
  metaDescription?: string;
  /** "이렇게 씁니다" 활용 시나리오. */
  scenarios?: Scenario[];
  /** "연결하는 법" 단계. */
  setup?: SetupStep[];
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
    metaDescription:
      'AI 코딩 에이전트를 MCP 로 위키·ALM 에 붙여 이슈를 맡기고, 회의록과 액션 아이템을 남기고, 백로그를 정리하고, 문서를 최신화합니다. 도구 18종 · 페르소나 명의 기록 · 승인 게이트. 연결은 세 단계면 됩니다.',
    scenarios: [
      {
        id: 'issue-handoff',
        title: '이슈 하나를 통째로 맡긴다',
        situation: '설계까지 끝난 이슈가 있고, 구현부터 기록까지 한 번에 넘기고 싶다.',
        flow: [
          'claim_issue',
          'get_page (설계 문서)',
          '~구현~',
          'link_pr',
          'create_page (작업 보고서)',
          'add_comment (보고서 링크)',
          'update_issue_status',
        ],
        human: 'PR 과 작업 보고서를 보고 완료를 승인한다. 보고서를 남기지 않으면 완료로 넘어가지 못한다.',
      },
      {
        id: 'meeting-notes',
        title: '회의가 끝나면 기록은 에이전트가',
        situation: '논의는 끝났는데 회의록도 액션 아이템도 아무 데도 안 남는다.',
        flow: ['create_page (회의록)', 'create_issue × N (액션 아이템)', 'add_comment (각 이슈에 회의록 링크)'],
        human: '담당자와 우선순위는 사람이 정한다. 에이전트는 빠진 항목이 없게 받아 적는 쪽이다.',
      },
      {
        id: 'backlog-triage',
        title: '백로그 트리아지',
        situation: '오래 방치된 이슈와 담당자 없는 이슈가 쌓여 어디부터 볼지 모르겠다.',
        flow: ['search_issues (오래된 · 미배정)', 'get_issue', 'add_comment (중복 · 우선순위 제안)'],
        human: '에이전트는 코멘트로 제안만 한다. 닫을지 올릴지 합칠지는 사람이 결정한다.',
      },
      {
        id: 'doc-refresh',
        title: '문서 최신화 초안',
        situation: '코드는 바뀌었는데 설계 문서는 몇 달 전 그대로다.',
        flow: ['find_pages', 'get_page', 'append_to_page (변경 요약 초안)'],
        human: '원문은 건드리지 않고 뒤에 덧붙인다. 본문을 교체하는 update_page 는 사람이 확인한 뒤에.',
      },
      {
        id: 'work-log',
        title: '진행 기록이 저절로 쌓인다',
        situation: '회고 때 "이번 스프린트에 무슨 일이 있었나"를 되짚을 근거가 없다.',
        flow: ['claim_issue', 'add_comment (진행 메모)', 'log_work (시간)', '~대시보드 · 워크로그에서 집계~'],
        human: '따로 적을 것이 없다. 사람은 쌓인 기록을 읽고 판단만 한다.',
      },
      {
        id: 'status-qa',
        title: '"이 기능 지금 어디까지 됐어?"',
        situation: '상태를 묻는 질문마다 사람이 보드와 위키를 번갈아 뒤진다.',
        flow: ['list_projects', 'search_issues', 'get_issue', 'find_pages', 'get_page'],
        human: '읽기만 하는 페르소나를 따로 둘 수 있다 — 권한은 페르소나 단위로 스페이스·프로젝트에 준다.',
      },
      {
        id: 'ci-automation',
        title: 'CI 에서 거는 개인 자동화',
        situation: '배포가 끝나면 이슈를 옮기고 릴리스 노트를 남기는 일을 사람이 매번 한다.',
        flow: ['~MCP 가 아니라 개인 API 토큰(chanho_pat_)으로 REST 호출~', '~ALM 이슈 상태 전이~', '~위키 릴리스 노트 생성~'],
        human: '토큰에 alm:write · wiki:write 처럼 필요한 스코프만 담아, 자동화가 건드릴 수 있는 범위를 미리 좁힌다.',
        doc: { label: '실전 예제 — ALM', href: '/docs/spaces/3/pages/203' },
      },
    ],
    setup: [
      {
        title: '페르소나와 전용 토큰을 발급한다',
        body: '관리자가 페르소나를 하나 만든다. 이 호출 한 번이 auth-server 계정과 조직 멤버(kind=AGENT), 그리고 스페이스·프로젝트 권한까지 함께 세운다. 이어서 전용 토큰을 발급한다 — 토큰 값은 이때 한 번만 보인다. 전용 관리 화면은 아직 없고 관리자 API 로 발급한다.',
        code: `# 관리자 액세스 토큰으로 한 번만
curl -X POST https://<호스트>/api/agent/personas \\
  -H "Authorization: Bearer <관리자-액세스-토큰>" \\
  -H "Content-Type: application/json" \\
  -d '{"slug":"jiho","role":"BACKEND","name":"지호",
       "grants":[{"resourceType":"PROJECT","resourceId":"<프로젝트-id>","role":"EDITOR"}]}'

curl -X POST https://<호스트>/api/agent/tokens \\
  -H "Authorization: Bearer <관리자-액세스-토큰>" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"my-claude-code","personaSlug":"jiho"}'`,
      },
      {
        title: 'MCP 클라이언트에 등록한다',
        body: 'Claude Code·Codex 같은 MCP 클라이언트에 게이트웨이 주소를 streamable-HTTP 로 등록하고, 발급받은 토큰을 헤더에 태운다. 진입점은 게이트웨이 하나뿐이라 서비스 주소를 따로 알 필요가 없다.',
        code: `claude mcp add --transport http agent-platform \\
  https://<호스트>/api/agent/mcp \\
  --header "Authorization: Bearer agp_<발급받은-토큰>"`,
      },
      {
        title: '이슈를 페르소나에게 맡긴다',
        body: 'ping 으로 연결을, whoami 로 어떤 페르소나로 붙었는지 확인한 다음 이슈를 넘긴다. 그 뒤로는 서버가 내려주는 규약대로 움직인다 — 작업 전 get_project_context 로 스킴과 멤버를 확인하고, 이슈를 집을 때 claim_issue, 진행은 add_comment 와 log_work, 완료 전에는 위키 작업 보고서. 남는 기록의 작성자는 전부 페르소나이고, 도구 호출은 하나도 빠짐없이 감사 테이블에 적재된다.',
      },
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
