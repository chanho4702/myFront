// 개인 API 토큰(PAT) 스코프의 순수 계산 — 체크박스 상태 ↔ 스코프 문자열 배열.
//
// 계약: docs/superpowers/specs/2026-09-06-admin-dashboard-and-token-scopes-design.md §1.1
//   집합: wiki:read wiki:write alm:read alm:write org:read org:write
//         board:read board:write search:read admin
//   `*:write` 는 같은 제품의 read 를 포함한다 → 쓰기를 켜면 읽기가 자동으로 켜지고 잠긴다.
//   `admin` 은 각 서비스의 `/api/*/admin/**`·`/api/migration/**`·`/api/agent/**` 에 "추가로" 필요하다
//   (제품 스코프를 대신하지 않는다 — 예: 위키 관리 API 는 `wiki:read` + `admin`).
//   검색은 읽기 전용이다 — `search:write` 는 없다. 질의 표면이 GraphQL 단일 URL(POST)뿐이라
//   게이트웨이도 메서드를 보지 않고 `search:read` 만 요구한다.
//
// React 를 모르는 순수 모듈이다. 리포에 테스트 러너가 없어(§6) 화면에서 떼어 눈으로 검증한다.

/** 읽기·쓰기가 갈리는 제품 축. 경로 접두사와 1:1이다(`/api/wiki/**` → wiki). */
export const PRODUCTS = ['wiki', 'alm', 'org', 'board'] as const;
export type Product = (typeof PRODUCTS)[number];

/** 읽기만 있는 제품 축. 쓰기 체크박스를 그리지 않는다. */
export const READ_ONLY_PRODUCTS = ['search'] as const;
export type ReadOnlyProduct = (typeof READ_ONLY_PRODUCTS)[number];

/** 서버가 받는 스코프 문자열 전체. 칩 표시 순서의 기준이기도 하다(서버는 다시 사전순 정렬한다). */
export const SCOPE_IDS = [
  'wiki:read',
  'wiki:write',
  'alm:read',
  'alm:write',
  'org:read',
  'org:write',
  'board:read',
  'board:write',
  'search:read',
  'admin',
] as const;
export type ScopeId = (typeof SCOPE_IDS)[number];

export const PRODUCT_LABEL: Record<Product | ReadOnlyProduct, string> = {
  wiki: 'WIKI',
  alm: 'ALM',
  org: '조직',
  board: '게시판',
  search: '검색',
};

/** 칩 툴팁·다이얼로그 도움말에 쓰는 설명. */
export const SCOPE_DESCRIPTION: Record<ScopeId, string> = {
  'wiki:read': '위키 스페이스·페이지·첨부 읽기 (GET)',
  'wiki:write': '위키 페이지·첨부 생성·수정·삭제 (읽기 포함)',
  'alm:read': 'ALM 프로젝트·이슈 읽기 (GET)',
  'alm:write': 'ALM 이슈·프로젝트 생성·수정·삭제 (읽기 포함)',
  'org:read': '조직 멤버·팀·권한 읽기 (GET)',
  'org:write': '조직 멤버·팀·권한 변경 (읽기 포함)',
  'board:read': '게시판 글·댓글 읽기 (GET)',
  'board:write': '게시판 글·댓글 작성·수정·삭제 (읽기 포함)',
  'search:read': '통합 검색 질의 (GraphQL POST 포함 — 검색은 쓰기 스코프가 없습니다)',
  admin: '관리 API(`/api/*/admin/**`·이관·에이전트) — 제품 스코프에 더해 필요',
};

/** 체크박스 상태. 화면은 이 모양만 들고 있고 변환은 전부 이 모듈이 한다. */
export interface ScopeSelection {
  wiki: { read: boolean; write: boolean };
  alm: { read: boolean; write: boolean };
  org: { read: boolean; write: boolean };
  board: { read: boolean; write: boolean };
  search: boolean;
  admin: boolean;
}

function emptySelection(): ScopeSelection {
  return {
    wiki: { read: false, write: false },
    alm: { read: false, write: false },
    org: { read: false, write: false },
    board: { read: false, write: false },
    search: false,
    admin: false,
  };
}

/**
 * 기본값 — 위키·ALM·조직 읽기 3개(§5.3).
 *
 * 게시판·검색을 추가하면서도 기본값은 늘리지 않는다. 기본으로 켜진 체크는 사용자가 의식하지 않고
 * 발급하는 권한이므로, 새 스코프는 명시적으로 고르게 둔다.
 */
export function defaultSelection(): ScopeSelection {
  const selection = emptySelection();
  selection.wiki.read = true;
  selection.alm.read = true;
  selection.org.read = true;
  return selection;
}

/**
 * 체크 하나를 바꾼 새 상태를 돌려준다(입력은 건드리지 않는다).
 *
 * - 쓰기를 켜면 같은 제품의 읽기가 함께 켜진다(`*:write` ⊃ read).
 * - 쓰기가 켜진 동안 읽기는 끌 수 없다 — 화면에서도 비활성이지만 여기서도 무시한다.
 */
export function toggleScope(
  selection: ScopeSelection,
  product: Product,
  kind: 'read' | 'write',
  checked: boolean,
): ScopeSelection {
  const current = selection[product];
  let next: { read: boolean; write: boolean };
  if (kind === 'write') {
    next = checked ? { read: true, write: true } : { read: current.read, write: false };
  } else {
    // 쓰기가 켜져 있으면 읽기는 항상 켜진 상태로 잠긴다.
    next = current.write ? { read: true, write: true } : { read: checked, write: false };
  }
  return { ...selection, [product]: next };
}

/** 읽기 전용 제품(검색) 체크. 쓰기 축이 없어 잠금 규칙도 없다. */
export function toggleReadOnlyScope(
  selection: ScopeSelection,
  product: ReadOnlyProduct,
  checked: boolean,
): ScopeSelection {
  return { ...selection, [product]: checked };
}

/** 관리자 API 체크. */
export function toggleAdmin(selection: ScopeSelection, checked: boolean): ScopeSelection {
  return { ...selection, admin: checked };
}

/** 읽기 체크박스를 비활성해야 하는가(= 쓰기가 켜져 있는가). */
export function isReadLocked(selection: ScopeSelection, product: Product): boolean {
  return selection[product].write;
}

/** 선택 상태 → 서버로 보낼 스코프 배열. SCOPE_IDS 순서로 정렬되고 중복이 없다. */
export function toScopes(selection: ScopeSelection): ScopeId[] {
  const chosen = new Set<ScopeId>();
  for (const product of PRODUCTS) {
    const state = selection[product];
    if (state.read || state.write) chosen.add(`${product}:read` as ScopeId);
    if (state.write) chosen.add(`${product}:write` as ScopeId);
  }
  for (const product of READ_ONLY_PRODUCTS) {
    if (selection[product]) chosen.add(`${product}:read` as ScopeId);
  }
  if (selection.admin) chosen.add('admin');
  return SCOPE_IDS.filter((id) => chosen.has(id));
}

/** 스코프 배열 → 선택 상태(재사용·표시용). 모르는 값은 무시한다. */
export function fromScopes(scopes: readonly string[] | null | undefined): ScopeSelection {
  const selection = emptySelection();
  for (const raw of scopes ?? []) {
    if (raw === 'admin') {
      selection.admin = true;
      continue;
    }
    const [product, kind] = String(raw).split(':');
    if (isReadOnlyProduct(product)) {
      // search:write 같은 값은 서버가 발급하지 않는다 — 읽기로만 받아들인다.
      if (kind === 'read') selection[product] = true;
      continue;
    }
    if (!isProduct(product)) continue;
    if (kind === 'write') {
      selection[product] = { read: true, write: true };
    } else if (kind === 'read') {
      selection[product] = { read: true, write: selection[product].write };
    }
  }
  return selection;
}

function isProduct(value: string): value is Product {
  return (PRODUCTS as readonly string[]).includes(value);
}

function isReadOnlyProduct(value: string): value is ReadOnlyProduct {
  return (READ_ONLY_PRODUCTS as readonly string[]).includes(value);
}

/** 하나도 안 고르면 발급할 수 없다(§5.3) — 서버도 400 `scopes_required` 로 막는다. */
export function hasAnyScope(selection: ScopeSelection): boolean {
  return toScopes(selection).length > 0;
}

/**
 * 목록 칩에 쓸 표시용 정리 — 서버가 준 값 중 아는 것만 SCOPE_IDS 순서로 남기고,
 * 모르는 값은 뒤에 원문 그대로 붙인다(백엔드가 스코프를 늘려도 화면이 감추지 않게).
 */
export function displayScopes(scopes: readonly string[] | null | undefined): string[] {
  const list = Array.isArray(scopes) ? scopes.map(String) : [];
  const known = SCOPE_IDS.filter((id) => list.includes(id));
  const unknown = list.filter((s) => !(SCOPE_IDS as readonly string[]).includes(s));
  return [...known, ...unknown];
}
