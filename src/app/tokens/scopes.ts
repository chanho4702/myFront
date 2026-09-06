// 개인 API 토큰(PAT) 스코프의 순수 계산 — 체크박스 상태 ↔ 스코프 문자열 배열.
//
// 계약: docs/superpowers/specs/2026-09-06-admin-dashboard-and-token-scopes-design.md §1.1
//   집합: wiki:read wiki:write alm:read alm:write org:read org:write admin
//   `*:write` 는 같은 제품의 read 를 포함한다 → 쓰기를 켜면 읽기가 자동으로 켜지고 잠긴다.
//   `admin` 은 각 서비스의 `/api/*/admin/**`·`/api/migration/**`·`/api/agent/**` 에 "추가로" 필요하다
//   (제품 스코프를 대신하지 않는다 — 예: 위키 관리 API 는 `wiki:read` + `admin`).
//
// React 를 모르는 순수 모듈이다. 리포에 테스트 러너가 없어(§6) 화면에서 떼어 눈으로 검증한다.

/** 제품 축. 경로 접두사와 1:1이다(`/api/wiki/**` → wiki). */
export const PRODUCTS = ['wiki', 'alm', 'org'] as const;
export type Product = (typeof PRODUCTS)[number];

/** 서버가 받는 스코프 문자열 전체. 정렬·중복 제거의 기준 순서이기도 하다. */
export const SCOPE_IDS = [
  'wiki:read',
  'wiki:write',
  'alm:read',
  'alm:write',
  'org:read',
  'org:write',
  'admin',
] as const;
export type ScopeId = (typeof SCOPE_IDS)[number];

export const PRODUCT_LABEL: Record<Product, string> = {
  wiki: 'WIKI',
  alm: 'ALM',
  org: '조직',
};

/** 칩 툴팁·다이얼로그 도움말에 쓰는 설명. */
export const SCOPE_DESCRIPTION: Record<ScopeId, string> = {
  'wiki:read': '위키 스페이스·페이지·첨부 읽기 (GET)',
  'wiki:write': '위키 페이지·첨부 생성·수정·삭제 (읽기 포함)',
  'alm:read': 'ALM 프로젝트·이슈 읽기 (GET)',
  'alm:write': 'ALM 이슈·프로젝트 생성·수정·삭제 (읽기 포함)',
  'org:read': '조직 멤버·팀·권한 읽기 (GET)',
  'org:write': '조직 멤버·팀·권한 변경 (읽기 포함)',
  admin: '관리 API(`/api/*/admin/**`·이관·에이전트) — 제품 스코프에 더해 필요',
};

/** 체크박스 상태. 화면은 이 모양만 들고 있고 변환은 전부 이 모듈이 한다. */
export interface ScopeSelection {
  wiki: { read: boolean; write: boolean };
  alm: { read: boolean; write: boolean };
  org: { read: boolean; write: boolean };
  admin: boolean;
}

/** 기본값 — 읽기 3개(§5.3). */
export function defaultSelection(): ScopeSelection {
  return {
    wiki: { read: true, write: false },
    alm: { read: true, write: false },
    org: { read: true, write: false },
    admin: false,
  };
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
  if (selection.admin) chosen.add('admin');
  return SCOPE_IDS.filter((id) => chosen.has(id));
}

/** 스코프 배열 → 선택 상태(재사용·표시용). 모르는 값은 무시한다. */
export function fromScopes(scopes: readonly string[] | null | undefined): ScopeSelection {
  const selection: ScopeSelection = {
    wiki: { read: false, write: false },
    alm: { read: false, write: false },
    org: { read: false, write: false },
    admin: false,
  };
  for (const raw of scopes ?? []) {
    if (raw === 'admin') {
      selection.admin = true;
      continue;
    }
    const [product, kind] = String(raw).split(':');
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
