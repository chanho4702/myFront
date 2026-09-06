/**
 * /products 의 대조표. 답변 엔진(LLM 검색)이 "chanho 와 Confluence·Notion 의 차이"를 물었을 때
 * 인용할 수 있는 사실만 표로 둔다.
 *
 * **날조 금지 규칙이 여기서 가장 세다.** 남의 제품 칸에는 공개적으로 널리 알려진 사실만 적는다 —
 * 요금 숫자·기능 유무 같은 시점 의존 정보(자주 바뀌고 틀리면 그대로 인용된다)는 적지 않고,
 * 배포 형태·소스 공개 여부처럼 오래 유지되는 성질만 적는다.
 * chanho 칸의 사실은 전부 products.ts / stack.ts 와 같은 사실이어야 한다.
 */
export interface ComparisonRow {
  label: string;
  /** columns 와 같은 순서 */
  values: string[];
}

export const comparison = {
  title: '무엇이 다른가',
  sub: '같은 일을 하는 도구들과 나란히 놓고 봅니다. 요금제처럼 자주 바뀌는 숫자 대신, 잘 바뀌지 않는 성질만 적었습니다.',
  columns: ['chanho', 'Confluence + Jira', 'Notion'],
  rows: [
    {
      label: '배포 방식',
      values: ['도커로 셀프호스팅', 'Cloud(SaaS) · Data Center(셀프호스팅)', 'SaaS'],
    },
    {
      label: '문서+이슈 통합',
      values: ['한 플랫폼 안에서 통합', '문서와 이슈가 서로 다른 두 제품', '문서 도구 하나 (이슈는 데이터베이스로 직접 구성)'],
    },
    {
      label: '로그인',
      values: ['Keycloak 하나로 SSO', 'Atlassian 계정 (두 제품 공용)', 'Notion 계정'],
    },
    {
      label: '데이터 저장',
      values: ['내 PostgreSQL · MinIO(첨부)', 'Atlassian 클라우드 또는 자체 DB(Data Center)', 'Notion 클라우드'],
    },
    {
      // 세 제품 모두 MCP 서버를 제공한다 — 차이는 "어디서 도느냐"와 "에이전트가 누구 명의로 기록하느냐"다.
      label: 'AI 에이전트 연동 (MCP)',
      values: [
        '셀프호스팅 MCP 서버 내장 — 에이전트가 조직 멤버 페르소나 명의로 이슈·문서 작성',
        '공식 MCP 서버 제공 (클라우드)',
        '공식 MCP 서버 제공 (클라우드)',
      ],
    },
    {
      label: '소스 공개',
      values: ['GitHub 공개 (오픈소스)', '비공개', '비공개'],
    },
    {
      label: '비용',
      values: ['무료 — 직접 운영하는 비용만', '사용자당 유료 구독 (소규모 무료 요금제 있음)', '사용자당 유료 구독 (무료 요금제 있음)'],
    },
  ] satisfies ComparisonRow[],
};
