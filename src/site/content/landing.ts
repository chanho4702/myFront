/**
 * 홈(/) 랜딩 카피. 구조는 affine.pro 를 따른다 —
 * 히어로 → 제품 화면 → 문제 제기 → 3대 기능 블록 → 오픈소스 → FAQ → 마지막 CTA.
 * 여기 적힌 사실은 전부 products.ts / stack.ts 와 같은 사실이어야 한다(수치 날조 금지).
 */

/**
 * chanho 가 무엇인지 한 문단으로 못 박은 정의문. **이 문자열이 정의의 유일한 원본이다.**
 * 히어로 부제 · 홈 메타 설명 · FAQ 첫 답변 · llms.txt 가 전부 이걸 그대로 쓴다 —
 * 답변 엔진(LLM 검색)이 인용할 문장은 사이트 안에서 한 가지 표현이어야 하고,
 * 사람이 읽는 화면과 크롤러가 읽는 메타가 다른 말을 하면 안 되기 때문이다.
 * 문구를 고치면 `scripts/seo/site.mjs` 의 사본도 같이 고쳐야 한다(드리프트 테스트가 잡는다).
 */
export const definition =
  'chanho 는 문서 위키(WIKI)와 이슈 트래커(ALM)를 하나의 로그인·게이트웨이 위에 올린 오픈소스 협업 플랫폼입니다. Confluence 와 Jira 가 나눠 하던 일을 한 플랫폼에서 합니다.';

export const hero = {
  /** 줄바꿈 위치를 카피가 정한다 — 화면 폭에 따라 임의로 끊기면 리듬이 깨진다. */
  headline: ['쓰고, 추적하고,', '협업하기를 한 곳에서.'],
  sub: definition,
  cta: '시작하기',
  secondary: 'GitHub 에서 보기',
};

export const pain = {
  title: '도구를 오가는 번거로움과 작별하세요',
  sub: '문서는 여기, 이슈는 저기, 로그인은 또 따로. 흩어져 있던 것들을 한 플랫폼 위에 올렸습니다.',
  chips: ['문서 & 위키', '이슈 & 스프린트', '칸반 보드', '첨부 & 검색', '단일 로그인'],
};

export interface Feature {
  slug: 'wiki' | 'alm' | 'msa-platform-template';
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  /** 라이브 앱 링크. 플랫폼은 화면이 없으니 상세로 보낸다. */
  liveUrl?: string;
}

export const features: Feature[] = [
  {
    slug: 'wiki',
    eyebrow: 'WRITE',
    title: '문서를 쓰고, 트리로 정리하고, 함께 다듬으세요',
    body: '스페이스 안에서 페이지를 트리로 쌓습니다. 리치 에디터로 쓰되 마크다운으로 저장하니, 문서가 도구에 갇히지 않습니다.',
    bullets: ['TipTap 리치 에디터 · 마크다운 저장', '스페이스 · 페이지 트리 · 라벨 · 백링크', '인라인 댓글 · 구독 · 리비전 이력', '첨부 · 내보내기 · 휴지통'],
    liveUrl: '/wiki/',
  },
  {
    slug: 'alm',
    eyebrow: 'TRACK',
    title: '이슈를 추적하고, 스프린트를 계획하고, 보드로 흐름을 보세요',
    body: '백로그에서 스프린트로, 칸반에서 간트로. 지라가 잘한 구조는 가져오고, 한국어 검색과 URL 로 공유되는 필터는 다르게 만들었습니다.',
    bullets: ['백로그 · 스프린트 · 칸반 보드', '워크플로 캔버스 · 상태 · 우선순위 스킴', '간트 · 대시보드 · 워크로그', '한국어 스마트 검색 · 필터 URL 공유'],
    liveUrl: '/alm/',
  },
  {
    slug: 'msa-platform-template',
    eyebrow: 'RUN',
    title: '한 번의 로그인, 하나의 게이트웨이 위에서 전부 돌아갑니다',
    body: 'Keycloak 으로 한 번 로그인하면 위키와 이슈 트래커가 같은 세션을 씁니다. 게이트웨이가 앞단에서 토큰을 검증하고, 로그는 앱 밖에서 모읍니다.',
    bullets: ['Keycloak SSO · 구글 로그인 · 백채널 로그아웃', 'Spring Cloud Gateway · JWT 조기 차단 · rate-limit', 'Redis Streams 이벤트 · PostgreSQL · MinIO', 'stdout JSON → Loki → Grafana 관측 · GitHub Actions 배포'],
  },
];

/** 플랫폼 구성 요약. 히어로 아래 "어떻게 구성돼 있나" 한 줄 스트립. */
export const composition = [
  { value: '3', label: '프론트 앱' },
  { value: '6', label: '백엔드 서비스' },
  { value: '1', label: '로그인 (Keycloak SSO)' },
  { value: '1', label: '데이터베이스 (PostgreSQL)' },
];

export const openSource = {
  title: '전부 공개 저장소에 있습니다',
  sub: '프론트·백엔드·인프라 구성까지 GitHub 에 올려 두었습니다. 그대로 클론해 셀프호스팅할 수 있습니다.',
  repos: [
    { name: 'WIKI', desc: '문서·위키 프론트', url: 'https://github.com/chanho4702/WIKI' },
    { name: 'ALM', desc: '이슈·스프린트 프론트', url: 'https://github.com/chanho4702/ALM' },
    { name: 'infra-settings', desc: '플랫폼 골격 · 컴포즈 · 배포', url: 'https://github.com/chanho4702/infra-settings' },
    { name: 'design-system', desc: '@chanho 토큰 · React 컴포넌트', url: 'https://github.com/chanho4702/design-system' },
  ],
};

export const faq = [
  {
    q: 'chanho 는 무엇인가요?',
    a: definition,
  },
  {
    q: 'WIKI 와 ALM 은 따로 써도 되나요?',
    a: '두 앱은 각각 독립된 프론트와 백엔드로 나뉘어 있고, 같은 Keycloak 계정과 게이트웨이를 공유합니다. 한 계정으로 둘 다 쓰는 것이 기본이지만, 서비스 단위로 떼어 배포할 수 있게 경계를 잡아 두었습니다.',
  },
  {
    q: '데이터는 어디에 저장되나요?',
    a: '모든 서비스의 데이터는 PostgreSQL 에, 첨부 파일은 S3 호환 스토리지(MinIO)에 저장됩니다. 셀프호스팅이 기본이라 데이터가 외부로 나가지 않습니다.',
  },
  {
    q: '직접 설치할 수 있나요?',
    a: '네. infra-settings 저장소의 도커 컴포즈로 인증·게이트웨이·서비스·관측 스택을 한 번에 띄웁니다. 소스는 전부 GitHub 에 공개돼 있습니다.',
  },
];

export const finalCta = {
  title: '지금 바로 써 보세요',
  sub: 'WIKI 를 열어 첫 문서를 만들고, ALM 에서 첫 이슈를 등록하세요. 로그인은 한 번이면 됩니다.',
};
