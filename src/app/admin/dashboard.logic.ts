// 관리자 대시보드의 순수 계산 — 상태 요약·정렬, 용량/시각 포맷, 활동 병합.
//
// 리포에 React 테스트 러너가 없으므로(§6) 화면에서 분리해 눈으로 읽고 검증할 수 있게 둔다.
// 여기 있는 함수는 fetch·React 를 모르며 입력만으로 결과가 정해진다.

import type { ActivityItem, ComponentStatus, HealthComponent } from './adminStore';

/** 표에서 위로 올라와야 하는 순서(클수록 위). DOWN 이 항상 최상단이다(§5.2-3). */
const STATUS_WEIGHT: Record<ComponentStatus, number> = {
  DOWN: 3,
  DEGRADED: 2,
  UNKNOWN: 1,
  UP: 0,
};

/** 그룹 정렬 — 서비스가 인프라보다 위. */
const GROUP_WEIGHT: Record<HealthComponent['group'], number> = {
  service: 1,
  infra: 0,
};

export interface HealthSummary {
  total: number;
  up: number;
  degraded: number;
  down: number;
  unknown: number;
}

/** 알 수 없는 상태 문자열은 UNKNOWN 으로 몰아 화면이 빈칸을 그리지 않게 한다. */
export function normalizeStatus(status: unknown): ComponentStatus {
  return status === 'UP' || status === 'DEGRADED' || status === 'DOWN' ? status : 'UNKNOWN';
}

/** 상태별 개수. 요약 칩에 그대로 쓴다. */
export function summarizeHealth(components: HealthComponent[]): HealthSummary {
  const summary: HealthSummary = { total: 0, up: 0, degraded: 0, down: 0, unknown: 0 };
  for (const c of components) {
    summary.total += 1;
    switch (normalizeStatus(c.status)) {
      case 'UP':
        summary.up += 1;
        break;
      case 'DEGRADED':
        summary.degraded += 1;
        break;
      case 'DOWN':
        summary.down += 1;
        break;
      default:
        summary.unknown += 1;
    }
  }
  return summary;
}

/**
 * 표 정렬: 심각한 상태 먼저 → 서비스 먼저 → 이름순. 원본 배열은 건드리지 않는다.
 */
export function sortComponents(components: HealthComponent[]): HealthComponent[] {
  return [...components].sort((a, b) => {
    const byStatus = STATUS_WEIGHT[normalizeStatus(b.status)] - STATUS_WEIGHT[normalizeStatus(a.status)];
    if (byStatus !== 0) return byStatus;
    const byGroup = (GROUP_WEIGHT[b.group] ?? 0) - (GROUP_WEIGHT[a.group] ?? 0);
    if (byGroup !== 0) return byGroup;
    return (a.name ?? a.id ?? '').localeCompare(b.name ?? b.id ?? '', 'ko-KR');
  });
}

/** 위키·ALM 활동을 시각 내림차순으로 합쳐 상위 n건. 시각이 깨진 항목은 맨 뒤로 민다. */
export function mergeActivity(lists: ActivityItem[][], limit = 20): ActivityItem[] {
  const all = lists.flat();
  return all
    .map((item) => ({ item, at: Date.parse(item.occurredAt) }))
    .sort((a, b) => {
      const aNaN = Number.isNaN(a.at);
      const bNaN = Number.isNaN(b.at);
      if (aNaN && bNaN) return 0;
      if (aNaN) return 1;
      if (bNaN) return -1;
      return b.at - a.at;
    })
    .slice(0, limit)
    .map((entry) => entry.item);
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * 용량 표기(1024 기준). 값이 없거나 음수·NaN 이면 대시로 폴백한다 —
 * 백엔드가 필드를 아직 안 주는 동안 화면에 `NaN B` 가 뜨지 않게 한다.
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${BYTE_UNITS[unit]}`;
}

/** 개수 표기. 값이 없으면 대시(백엔드 미제공 필드 방어). */
export function formatCount(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toLocaleString('ko-KR');
}

/** 응답시간. 값이 없으면 대시. */
export function formatLatency(ms: number | null | undefined): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '—';
  return `${Math.round(ms).toLocaleString('ko-KR')} ms`;
}

/**
 * ISO → `2026. 9. 6. 오후 3:12`. 값이 없거나 깨졌으면 대시(Invalid Date 방지) —
 * tokensStore.formatDate 와 같은 폴백 규칙이다.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Date(t).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
