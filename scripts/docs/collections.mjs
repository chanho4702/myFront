// 개발 문서 동기화 대상(컬렉션) 선언. 리포에 사는 마크다운이 원본이고 위키는 사본이다.
// 여기만 고치면 컬렉션이 늘고 준다 — 동기화 로직(dev.mjs)은 이 선언을 해석할 뿐이다.
//
// 컬렉션 필드
//  id       매핑 파일 키 접두어("<id>/<상대경로>"). 바꾸면 매핑이 끊겨 제목 lookup 으로 다시 찾는다.
//  title    루트 페이지 제목
//  dir      원본 디렉터리(절대경로, 슬래시 구분)
//  include  dir 기준 상대경로 glob — `**`(하위 전부) · `*`(한 단계) 지원. 와일드카드 없는 항목은 파일 하나
//  folders  { 상대 디렉터리: 폴더 페이지 제목 } — 여기 적힌 디렉터리만 폴더 페이지가 된다.
//           적히지 않은 중간 디렉터리는 건너뛰고 가장 가까운 상위 폴더(없으면 루트) 아래에 놓인다.
//  titles   { 상대경로: 제목 } — H1·파일명 대신 쓸 제목
//  루트/폴더 디렉터리의 README.md 는 별도 페이지가 아니라 그 루트/폴더의 본문이 된다(폴더는 자식 목록으로 대체).

export const PLATFORM_ROOT = 'C:/MSA_TEMPLATE';

export const DEV_SPACE = {
  key: 'dev',
  name: '개발 문서',
  description: '플랫폼 리포의 설계·계획·가이드 문서 (자동 동기화)',
};

const SUPERPOWERS = { 'superpowers/plans': '구현 계획', 'superpowers/specs': '설계 스펙' };

const BACKEND_REPOS = [
  'wiki-backend',
  'alm-backend',
  'platform-backend',
  'auth-server',
  'gateway-server',
  'eureka-server',
  'board-service',
  'collaboration-service',
];

export const COLLECTIONS = [
  {
    id: 'platform',
    title: '플랫폼 개요',
    dir: PLATFORM_ROOT,
    include: ['README.md', 'AGENTS.md'],
    titles: { 'AGENTS.md': '에이전트 규약' },
  },
  {
    id: 'wiki-front',
    title: 'WIKI (wiki-front)',
    dir: `${PLATFORM_ROOT}/wiki-front/docs`,
    include: ['**/*.md'],
    folders: { backend: '백엔드 요구·설계', roadmap: '로드맵', ...SUPERPOWERS },
  },
  {
    id: 'alm-front',
    title: 'ALM (alm-front)',
    dir: `${PLATFORM_ROOT}/alm-front/docs`,
    include: ['**/*.md'],
    folders: { areas: '영역 가이드', roadmap: '로드맵', ...SUPERPOWERS },
    titles: { 'STATUS.md': '진행 현황', 'BACKLOG.md': '백로그' },
  },
  {
    id: 'design-system',
    title: '디자인 시스템',
    dir: `${PLATFORM_ROOT}/design-system`,
    include: ['README.md', 'docs/**/*.md'],
    folders: { 'docs/superpowers/plans': '구현 계획', 'docs/superpowers/specs': '설계 스펙' },
  },
  {
    id: 'backend',
    title: '백엔드 서비스',
    dir: PLATFORM_ROOT,
    include: BACKEND_REPOS.map((r) => `${r}/README.md`),
    titles: Object.fromEntries(BACKEND_REPOS.map((r) => [`${r}/README.md`, r])),
  },
  {
    id: 'myfront',
    title: '프론트 셸 (myFront)',
    dir: `${PLATFORM_ROOT}/myFront`,
    include: ['README.md'],
  },
  {
    // 외부 클라이언트용 공개 API 가이드. dir 을 docs/api 로 좁혀 auth-server/docs/superpowers(설계 스펙)는 안 딸려온다.
    // README 가 없으므로 루트는 자식 목록으로 생성된다.
    id: 'api-guide',
    title: 'API 가이드',
    dir: `${PLATFORM_ROOT}/auth-server/docs/api`,
    include: ['**/*.md'],
  },
];
