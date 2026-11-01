// AI 에이전트 운영 데이터 레이어 — 예산 상한(F-19)·감사 이력 검색(F-17)·전 프로젝트 run·대기 게이트·페르소나 편집(F-18).
// agentsStore 와 같은 인증·오류 계약(authClient.apiFetch + `{"error": 한국어}`)을 쓴다. 이 화면은 전역 관리자 전용이다.
//
// 계약(정본 = agent-service 컨트롤러):
//   GET    /api/agent/budget/overview            → {month, alertPercent, platform{…}, projects[…], killSwitch} (전역 관리자)
//   PUT    /api/agent/budget/platform {monthlyCapUsd}        → 204 · DELETE → 204(env 기본값으로)
//   PUT    /api/agent/budget/projects/{id} {monthlyCapUsd}   → 204 · DELETE → 204(플랫폼 상한을 따름)
//   GET    /api/agent/audits?from&to&tool&status&origin&personaId&runId&projectId&page&size
//            → {items[{id, personaId, actorMemberId, tool, status, summary, redacted, origin, runId, projectId, createdAt}],
//               page, size, total, hasNext}  (id 내림차순, size ≤ 100)
//   GET    /api/agent/runs?status&projectId&personaId&type&page&size → {items, page, size, total, hasNext}
//   GET    /api/agent/gates?pending=true          → GateSummaryResponse[]
//   POST   /api/agent/gates/{id}/approve|reject   → 204
//   GET    /api/agent/personas/{id}               → PersonaDetailResponse
//   PATCH  /api/agent/personas/{id}               → PersonaDetailResponse (null=그대로, ''=지움, name은 못 지움)
//   PATCH  /api/agent/personas/{id}/active {active} → PersonaResponse

import { authClient } from '../../auth';
import { AgentApiError, idToString, nullableText, toApiError, toNumber } from './agentsStore';

/* ────────────────────────── 예산(F-19) ────────────────────────── */

export interface PlatformBudget {
  capUsd: number | null;
  /** 화면에서 바꾼 값이면 true, env 기본값이면 false. */
  overridden: boolean;
  defaultCapUsd: number | null;
  monthToDateUsd: number | null;
  usedPercent: number | null;
  /** 0 평온 · alertPercent 임박 · 100 도달. */
  alertLevel: number;
}

export interface ProjectBudget {
  projectId: string;
  /** 프로젝트별 설정. null 이면 플랫폼 상한을 따른다. */
  capUsd: number | null;
  effectiveCapUsd: number | null;
  monthToDateUsd: number | null;
  usedPercent: number | null;
  alertLevel: number;
}

export interface BudgetOverview {
  month: string;
  alertPercent: number;
  platform: PlatformBudget;
  projects: ProjectBudget[];
  killSwitch: boolean;
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function level(value: unknown): number {
  const n = toNumber(value);
  return n === null ? 0 : n;
}

export async function fetchBudgetOverview(): Promise<BudgetOverview> {
  const res = await authClient.apiFetch('/api/agent/budget/overview');
  if (!res.ok) throw await toApiError(res, '예산 현황을 불러오지 못했습니다.');
  const b = obj(await res.json());
  const p = obj(b.platform);
  const projects = (Array.isArray(b.projects) ? b.projects : [])
    .map((raw): ProjectBudget | null => {
      const r = obj(raw);
      const projectId = idToString(r.projectId);
      if (projectId === null) return null;
      return {
        projectId,
        capUsd: toNumber(r.capUsd),
        effectiveCapUsd: toNumber(r.effectiveCapUsd),
        monthToDateUsd: toNumber(r.monthToDateUsd),
        usedPercent: toNumber(r.usedPercent),
        alertLevel: level(r.alertLevel),
      };
    })
    .filter((x): x is ProjectBudget => x !== null);
  return {
    month: typeof b.month === 'string' ? b.month : '',
    alertPercent: toNumber(b.alertPercent) ?? 80,
    platform: {
      capUsd: toNumber(p.capUsd),
      overridden: p.overridden === true,
      defaultCapUsd: toNumber(p.defaultCapUsd),
      monthToDateUsd: toNumber(p.monthToDateUsd),
      usedPercent: toNumber(p.usedPercent),
      alertLevel: level(p.alertLevel),
    },
    projects,
    killSwitch: b.killSwitch === true,
  };
}

async function sendCap(path: string, capUsd: number | null, fallback: string): Promise<void> {
  const res = await authClient.apiFetch(
    path,
    capUsd === null
      ? { method: 'DELETE' }
      : {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthlyCapUsd: capUsd }),
        },
  );
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, fallback);
}

/** 플랫폼 월 상한 저장. null 이면 화면 설정을 지워 env 기본값으로 되돌린다. */
export function savePlatformCap(capUsd: number | null): Promise<void> {
  return sendCap('/api/agent/budget/platform', capUsd, '플랫폼 예산 상한을 저장하지 못했습니다.');
}

/** 프로젝트 월 상한 저장. null 이면 지워 플랫폼 상한을 따르게 한다. */
export function saveProjectCap(projectId: string, capUsd: number | null): Promise<void> {
  return sendCap(
    `/api/agent/budget/projects/${encodeURIComponent(projectId)}`,
    capUsd,
    '프로젝트 예산 상한을 저장하지 못했습니다.',
  );
}

/** 입력 문자열 → USD. 0 이상, 센트(소수 둘째 자리)까지. 틀리면 한국어 오류 문구. */
export function parseCapInput(raw: string): { value: number } | { error: string } {
  const t = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return { error: '0 이상의 금액을 소수 둘째 자리까지 입력하세요.' };
  const value = Number(t);
  if (!Number.isFinite(value) || value > 1_000_000) return { error: '1,000,000 USD 이하로 입력하세요.' };
  return { value };
}

/* ────────────────────────── 감사 이력(F-17) ────────────────────────── */

export type AuditStatus = 'OK' | 'ERROR';
export type AuditOrigin = 'WORKER' | 'EXTERNAL' | 'SYSTEM';

export interface AuditItem {
  id: string;
  personaId: string | null;
  actorMemberId: string | null;
  tool: string;
  status: AuditStatus | string;
  summary: string | null;
  redacted: boolean;
  origin: AuditOrigin | null;
  runId: string | null;
  projectId: string | null;
  createdAt: string | null;
}

export interface AuditQuery {
  /** ISO 시각(포함). */
  from?: string;
  /** ISO 시각(미포함). */
  to?: string;
  tool?: string;
  status?: AuditStatus;
  origin?: AuditOrigin;
  personaId?: string;
  runId?: string;
  projectId?: string;
  page: number;
  size: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
}

function toPaged<T>(body: unknown, map: (raw: unknown) => T | null): Paged<T> {
  const b = obj(body);
  return {
    items: (Array.isArray(b.items) ? b.items : []).map(map).filter((x): x is T => x !== null),
    page: toNumber(b.page) ?? 0,
    size: toNumber(b.size) ?? 0,
    total: toNumber(b.total) ?? 0,
    hasNext: b.hasNext === true,
  };
}

function toAudit(raw: unknown): AuditItem | null {
  const r = obj(raw);
  const id = idToString(r.id);
  if (id === null) return null;
  const origin = r.origin === 'WORKER' || r.origin === 'EXTERNAL' || r.origin === 'SYSTEM' ? r.origin : null;
  return {
    id,
    personaId: idToString(r.personaId),
    actorMemberId: idToString(r.actorMemberId),
    tool: typeof r.tool === 'string' ? r.tool : '',
    status: typeof r.status === 'string' ? r.status : '',
    summary: nullableText(r.summary),
    redacted: r.redacted === true,
    origin,
    runId: idToString(r.runId),
    projectId: idToString(r.projectId),
    createdAt: nullableText(r.createdAt),
  };
}

export async function searchAudits(q: AuditQuery): Promise<Paged<AuditItem>> {
  const params = new URLSearchParams();
  const set = (k: string, v: string | undefined) => {
    if (v !== undefined && v.trim() !== '') params.set(k, v.trim());
  };
  set('from', q.from);
  set('to', q.to);
  set('tool', q.tool);
  set('status', q.status);
  set('origin', q.origin);
  set('personaId', q.personaId);
  set('runId', q.runId);
  set('projectId', q.projectId);
  params.set('page', String(q.page));
  params.set('size', String(q.size));
  const res = await authClient.apiFetch(`/api/agent/audits?${params.toString()}`);
  if (!res.ok) throw await toApiError(res, '감사 이력을 불러오지 못했습니다.');
  return toPaged(await res.json(), toAudit);
}

/* ────────────────────────── run·게이트(F-18) ────────────────────────── */

export type RunStatus = 'QUEUED' | 'RUNNING' | 'WAITING_APPROVAL' | 'DONE' | 'FAILED' | 'BLOCKED' | 'CANCELLED';
export const RUN_STATUSES: RunStatus[] = [
  'QUEUED',
  'RUNNING',
  'WAITING_APPROVAL',
  'DONE',
  'FAILED',
  'BLOCKED',
  'CANCELLED',
];
export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  QUEUED: '대기',
  RUNNING: '실행 중',
  WAITING_APPROVAL: '승인 대기',
  DONE: '완료',
  FAILED: '실패',
  BLOCKED: '차단',
  CANCELLED: '취소',
};

export interface RunItem {
  id: string;
  issueKey: string;
  status: RunStatus | string;
  personaId: string | null;
  type: string;
  trigger: string;
  attempt: number | null;
  model: string | null;
  startedAt: string | null;
  endedAt: string | null;
  executionSite: string | null;
  /** 원장 기록이 없으면 null — 0 으로 속이지 않는다(F-16). */
  costUsd: number | null;
}

function toRun(raw: unknown): RunItem | null {
  const r = obj(raw);
  const id = idToString(r.id);
  if (id === null) return null;
  const cost = r.cost && typeof r.cost === 'object' ? toNumber((r.cost as Record<string, unknown>).costUsd) : null;
  return {
    id,
    issueKey: typeof r.issueKey === 'string' ? r.issueKey : '',
    status: typeof r.status === 'string' ? r.status : '',
    personaId: idToString(r.personaId),
    type: typeof r.type === 'string' ? r.type : '',
    trigger: typeof r.trigger === 'string' ? r.trigger : '',
    attempt: toNumber(r.attempt),
    model: nullableText(r.model),
    startedAt: nullableText(r.startedAt),
    endedAt: nullableText(r.endedAt),
    executionSite: nullableText(r.executionSite),
    costUsd: cost,
  };
}

export interface RunQuery {
  status?: RunStatus;
  projectId?: string;
  personaId?: string;
  page: number;
  size: number;
}

export async function listRuns(q: RunQuery): Promise<Paged<RunItem>> {
  const params = new URLSearchParams();
  if (q.status) params.set('status', q.status);
  if (q.projectId?.trim()) params.set('projectId', q.projectId.trim());
  if (q.personaId?.trim()) params.set('personaId', q.personaId.trim());
  params.set('page', String(q.page));
  params.set('size', String(q.size));
  const res = await authClient.apiFetch(`/api/agent/runs?${params.toString()}`);
  if (!res.ok) throw await toApiError(res, 'run 목록을 불러오지 못했습니다.');
  return toPaged(await res.json(), toRun);
}

export interface PendingGate {
  id: string;
  runId: string;
  issueKey: string | null;
  kind: string;
  request: string | null;
  requestedAt: string | null;
}

export const GATE_KIND_LABEL: Record<string, string> = {
  MERGE: '머지',
  ESCALATION: '에스컬레이션',
  PLAN: '계획',
};

export async function listPendingGates(): Promise<PendingGate[]> {
  const res = await authClient.apiFetch('/api/agent/gates?pending=true');
  if (!res.ok) throw await toApiError(res, '승인 대기 목록을 불러오지 못했습니다.');
  const body: unknown = await res.json();
  return (Array.isArray(body) ? body : [])
    .map((raw): PendingGate | null => {
      const r = obj(raw);
      const id = idToString(r.id);
      const runId = idToString(r.runId);
      if (id === null || runId === null) return null;
      return {
        id,
        runId,
        issueKey: nullableText(r.issueKey),
        kind: typeof r.kind === 'string' ? r.kind : '',
        request: nullableText(r.request),
        requestedAt: nullableText(r.requestedAt),
      };
    })
    .filter((g): g is PendingGate => g !== null)
    .sort((a, b) => (Date.parse(a.requestedAt ?? '') || 0) - (Date.parse(b.requestedAt ?? '') || 0));
}

/** 게이트 결정(204). 승인하면 continuation run 이 생기고, 거절하면 원 run 이 취소로 닫힌다. */
export async function decideGate(id: string, decision: 'approve' | 'reject'): Promise<void> {
  const res = await authClient.apiFetch(`/api/agent/gates/${encodeURIComponent(id)}/${decision}`, { method: 'POST' });
  if (res.status === 204 || res.ok) return;
  throw await toApiError(res, decision === 'approve' ? '게이트를 승인하지 못했습니다.' : '게이트를 거절하지 못했습니다.');
}

/* ────────────────────────── 페르소나 편집(F-18) ────────────────────────── */

export interface PersonaDetail {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  active: boolean;
  projectId: string | null;
  voicePrompt: string | null;
  defaultModel: string | null;
  skills: string | null;
}

function toDetail(raw: unknown): PersonaDetail | null {
  const r = obj(raw);
  const id = idToString(r.id);
  if (id === null) return null;
  return {
    id,
    slug: typeof r.slug === 'string' ? r.slug : '',
    name: typeof r.name === 'string' ? r.name : '',
    emoji: nullableText(r.emoji),
    active: r.active !== false,
    projectId: idToString(r.projectId),
    voicePrompt: nullableText(r.voicePrompt),
    defaultModel: nullableText(r.defaultModel),
    skills: nullableText(r.skills),
  };
}

export async function getPersonaDetail(id: string): Promise<PersonaDetail> {
  const res = await authClient.apiFetch(`/api/agent/personas/${encodeURIComponent(id)}`);
  if (!res.ok) throw await toApiError(res, '페르소나 상세를 불러오지 못했습니다.');
  const detail = toDetail(await res.json());
  if (!detail) throw new AgentApiError(res.status, '서버 응답을 이해하지 못했습니다.');
  return detail;
}

/** 편집 입력 — 빈 문자열은 "지움"(name 은 지울 수 없다). 바뀐 칸만 보내도 되지만 화면은 다 보낸다. */
export interface PersonaEditInput {
  name: string;
  emoji: string;
  voicePrompt: string;
  defaultModel: string;
  skills: string;
}

export async function updatePersona(id: string, input: PersonaEditInput): Promise<PersonaDetail> {
  const res = await authClient.apiFetch(`/api/agent/personas/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await toApiError(res, '페르소나를 저장하지 못했습니다.');
  const detail = toDetail(await res.json());
  if (!detail) throw new AgentApiError(res.status, '서버 응답을 이해하지 못했습니다.');
  return detail;
}

/** 활성 토글. 비활성화하면 새 run 이 배정되지 않는다(진행 중 run·토큰은 그대로). */
export async function setPersonaActive(id: string, active: boolean): Promise<void> {
  const res = await authClient.apiFetch(`/api/agent/personas/${encodeURIComponent(id)}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  if (res.ok) return;
  throw await toApiError(res, active ? '페르소나를 활성화하지 못했습니다.' : '페르소나를 비활성화하지 못했습니다.');
}

/** `2026-11-01 14:03` (로컬). 값이 없으면 대시. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `<input type="date">` 값(로컬 자정) → ISO. 비면 undefined. `endExclusive` 면 다음 날 자정. */
export function dateInputToIso(value: string, endExclusive = false): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d + (endExclusive ? 1 : 0));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
