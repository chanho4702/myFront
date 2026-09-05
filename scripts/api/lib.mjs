// OpenAPI 스펙 → API 레퍼런스 마크다운의 순수 부분. 파일 I/O 는 collect-openapi.mjs · gen-reference.mjs 가 맡는다.
// 출력은 결정적이다 — 태그는 이름순, 경로는 문자열순, 메서드는 GET/POST/PUT/PATCH/DELETE 순 — 그래서
// 생성물의 diff 가 코드(컨트롤러 주석) 변경만 반영한다.

export const NOTICE = '자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것';
export const BASE_URL = 'https://<your-host>';
export const TOKEN_PLACEHOLDER = 'chanho_pat_…';
export const METHOD_ORDER = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
/** `$ref` 를 펼치는 깊이. 그 아래는 스키마 이름만 적는다(설계 스펙 §3). */
export const DEFAULT_DEPTH = 2;
/** 태그 없는 오퍼레이션이 섞여 들어왔을 때 묶는 이름(springdoc 게이트가 막지만 생성기는 죽지 않는다). */
export const UNTAGGED = 'default';

/** 로케일 무관 문자열 비교 — 어느 머신에서 돌려도 같은 순서. */
export const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const methodRank = (m) => {
  const i = METHOD_ORDER.indexOf(String(m).toLowerCase());
  return i === -1 ? METHOD_ORDER.length : i;
};
export const compareMethods = (a, b) => methodRank(a) - methodRank(b) || byCodePoint(a, b);
export const isMethod = (key) => METHOD_ORDER.includes(String(key).toLowerCase());

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const sortedObject = (obj, cmp = byCodePoint) => Object.fromEntries(Object.keys(obj).sort(cmp).map((k) => [k, obj[k]]));

/**
 * 스펙 정렬 — 수집 시점에 한 번 적용해 저장한다. 최상위 키는 읽기 순서(openapi·info·servers·security·tags·paths·components)로,
 * tags 는 이름순, paths 는 경로순 + 메서드순, components 의 각 맵은 이름순. 스키마 안의 필드 순서는 선언 순서를 지킨다.
 */
export function sortSpec(spec) {
  const out = {};
  for (const k of ['openapi', 'info', 'servers', 'security']) if (spec[k] !== undefined) out[k] = spec[k];
  if (Array.isArray(spec.tags)) out.tags = [...spec.tags].sort((a, b) => byCodePoint(a.name ?? '', b.name ?? ''));
  if (isPlainObject(spec.paths)) {
    out.paths = sortedObject(Object.fromEntries(Object.entries(spec.paths).map(([p, item]) => [p, sortPathItem(item)])));
  }
  if (isPlainObject(spec.components)) {
    out.components = sortedObject(Object.fromEntries(Object.entries(spec.components).map(([k, v]) => [k, isPlainObject(v) ? sortedObject(v) : v])));
  }
  for (const k of Object.keys(spec).sort(byCodePoint)) if (!(k in out)) out[k] = spec[k];
  return out;
}

function sortPathItem(item) {
  if (!isPlainObject(item)) return item;
  const keys = Object.keys(item);
  const others = keys.filter((k) => !isMethod(k)).sort(byCodePoint);
  const methods = keys.filter(isMethod).sort(compareMethods);
  return Object.fromEntries([...others, ...methods].map((k) => [k, item[k]]));
}

/** `#/components/schemas/X` 같은 로컬 포인터를 스펙에서 찾는다. 없으면 null. */
export function resolveRef(ref, spec) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  let node = spec;
  for (const seg of ref.slice(2).split('/')) {
    const key = seg.replace(/~1/g, '/').replace(/~0/g, '~');
    if (!isPlainObject(node) && !Array.isArray(node)) return null;
    node = node[key];
    if (node === undefined) return null;
  }
  return node;
}

export const refName = (ref) => String(ref).split('/').pop();

/** `$ref` 와 단일 `allOf` 를 따라가 실제 스키마로. 순환은 seen 으로 끊는다. */
function deref(schema, spec, seen = new Set()) {
  if (!isPlainObject(schema)) return null;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return null;
    const target = resolveRef(schema.$ref, spec);
    return target ? deref(target, spec, new Set([...seen, schema.$ref])) : null;
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length) {
    const parts = schema.allOf.map((s) => deref(s, spec, seen)).filter(Boolean);
    const merged = { ...schema, properties: {}, required: [] };
    delete merged.allOf;
    for (const p of parts) {
      Object.assign(merged.properties, p.properties ?? {});
      merged.required.push(...(p.required ?? []));
      if (!merged.description && p.description) merged.description = p.description;
      if (!merged.type && p.type) merged.type = p.type;
    }
    Object.assign(merged.properties, schema.properties ?? {});
    merged.required.push(...(schema.required ?? []));
    return merged;
  }
  return schema;
}

/** OpenAPI 3.1 은 `type: ["string","null"]` 로 nullable 을 적는다. 3.0 의 `nullable: true` 도 같이 본다. */
function baseType(schema) {
  let t = schema.type;
  let nullable = schema.nullable === true;
  if (Array.isArray(t)) {
    nullable = nullable || t.includes('null');
    t = t.find((x) => x !== 'null') ?? 'null';
  }
  if (!t && schema.properties) t = 'object';
  if (!t && schema.items) t = 'array';
  return { t, nullable };
}

const isObjectLike = (schema, spec) => {
  const s = deref(schema, spec);
  return !!s && (baseType(s).t === 'object' || !!s.properties) && !s.additionalProperties;
};

/**
 * 표에 적는 타입 한 조각. `$ref` 는 이름, 배열은 `X[]`, enum 은 `string enum(A, B)`, format 은 `integer(int64)`,
 * map 은 `map<string, X>`, nullable 은 ` (nullable)` 접미.
 */
export function typeLabel(schema, spec) {
  if (!isPlainObject(schema)) return 'any';
  if (schema.$ref) return refName(schema.$ref);
  if (Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 1) return typeLabel(schema.allOf[0], spec);
    return schema.allOf.map((s) => typeLabel(s, spec)).join(' & ');
  }
  for (const key of ['oneOf', 'anyOf']) {
    if (Array.isArray(schema[key]) && schema[key].length) return schema[key].map((s) => typeLabel(s, spec)).join(' or ');
  }
  const { t, nullable } = baseType(schema);
  let label;
  if (t === 'array') label = `${typeLabel(schema.items, spec)}[]`;
  else if (Array.isArray(schema.enum) && schema.enum.length) label = `${t ?? 'string'} enum(${schema.enum.map(String).join(', ')})`;
  else if (t === 'object' && isPlainObject(schema.additionalProperties)) label = `map<string, ${typeLabel(schema.additionalProperties, spec)}>`;
  else if (t === 'object' || t === undefined) label = t ?? 'any';
  else label = schema.format ? `${t}(${schema.format})` : t;
  return nullable ? `${label} (nullable)` : label;
}

const exampleText = (schema) => {
  const v = schema.example !== undefined ? schema.example : Array.isArray(schema.examples) && schema.examples.length ? schema.examples[0] : schema.default;
  if (v === undefined) return '';
  return typeof v === 'string' ? v : JSON.stringify(v);
};

/**
 * 스키마 → 표 행 [{ name, type, required, description, example }]. 중첩 객체는 `parent.child`, 배열 원소는 `items[].child`.
 * `$ref` 는 depth 단계까지 펼치고 그 아래는 타입 칸에 이름만 남긴다. 루트가 배열이면 `[]` 접두어로 원소를 펼친다.
 *
 * @param components spec.components (또는 { schemas } 만 있는 객체)
 */
export function flattenSchema(schema, components, depth = DEFAULT_DEPTH) {
  const spec = { components: components ?? {} };
  const rows = [];
  const walk = (node, prefix, depthLeft, seen) => {
    const s = deref(node, spec);
    if (!s) return;
    if (baseType(s).t === 'array' && !s.properties) {
      walk(s.items, prefix ? `${prefix}[]` : '[]', depthLeft, seen);
      return;
    }
    const required = new Set(s.required ?? []);
    for (const [name, prop] of Object.entries(s.properties ?? {})) {
      const full = prefix ? `${prefix}.${name}` : name;
      const resolved = deref(prop, spec) ?? {};
      rows.push({
        name: full,
        type: typeLabel(prop, spec),
        required: required.has(name),
        description: prop.description ?? resolved.description ?? '',
        example: exampleText(prop) || exampleText(resolved),
      });
      const { t } = baseType(resolved);
      const child = t === 'array' ? resolved.items : prop;
      if (!isObjectLike(child, spec)) continue;
      const ref = child?.$ref ?? (t === 'array' ? resolved.items?.$ref : undefined);
      if (ref) {
        if (depthLeft <= 0 || seen.has(ref)) continue;
        walk(child, t === 'array' ? `${full}[]` : full, depthLeft - 1, new Set([...seen, ref]));
      } else {
        walk(child, t === 'array' ? `${full}[]` : full, depthLeft, seen);
      }
    }
  };
  const rootRef = schema?.$ref;
  walk(schema, '', depth, rootRef ? new Set([rootRef]) : new Set());
  return rows;
}

/** 태그 이름 → 파일명. 영문·숫자·한글 등 글자만 남기고 나머지는 `-`. */
export function slugify(tag) {
  return String(tag)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

/** 제목 → 같은 문서 안 앵커(GitHub 방식: 소문자, 글자·숫자·공백·하이픈만, 공백은 하이픈). */
export function headingAnchor(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * 스키마에서 최소 예시 값. example > default > enum 첫 값 > 타입별 자리표시자.
 * 객체는 required 필드만(없으면 전부), `$ref` 는 depth 단계까지 내려간다.
 */
export function exampleValue(schema, spec, depth = DEFAULT_DEPTH, seen = new Set()) {
  const s = deref(schema, spec);
  if (!s) return null;
  if (s.example !== undefined) return s.example;
  if (Array.isArray(s.examples) && s.examples.length) return s.examples[0];
  if (s.default !== undefined) return s.default;
  if (Array.isArray(s.enum) && s.enum.length) return s.enum[0];
  const { t } = baseType(s);
  if (t === 'array') return depth > 0 ? [exampleValue(s.items, spec, depth - 1, seen)] : [];
  if (t === 'object' || s.properties) {
    if (isPlainObject(s.additionalProperties) && !s.properties) return { key: exampleValue(s.additionalProperties, spec, depth - 1, seen) };
    const props = s.properties ?? {};
    const req = s.required ?? [];
    const keys = req.length ? Object.keys(props).filter((k) => req.includes(k)) : Object.keys(props);
    const out = {};
    for (const k of keys) {
      const ref = props[k]?.$ref ?? props[k]?.items?.$ref;
      if (ref && (depth <= 0 || seen.has(ref))) {
        out[k] = props[k]?.$ref ? {} : [];
        continue;
      }
      out[k] = exampleValue(props[k], spec, ref ? depth - 1 : depth, ref ? new Set([...seen, ref]) : seen);
    }
    return out;
  }
  if (t === 'integer' || t === 'number') return 0;
  if (t === 'boolean') return false;
  if (t === 'string') {
    switch (s.format) {
      case 'date-time':
        return '2026-01-01T00:00:00Z';
      case 'date':
        return '2026-01-01';
      case 'uuid':
        return '00000000-0000-0000-0000-000000000000';
      case 'binary':
        return '<file>';
      default:
        return 'string';
    }
  }
  return null;
}

/** 경로·오퍼레이션 파라미터 병합(같은 name+in 은 오퍼레이션 쪽이 이긴다), `$ref` 파라미터는 풀어서. */
export function mergedParameters(pathItem, op, spec) {
  const resolve = (p) => (p?.$ref ? resolveRef(p.$ref, spec) : p);
  const list = [...(pathItem?.parameters ?? []), ...(op?.parameters ?? [])].map(resolve).filter(Boolean);
  const byKey = new Map();
  for (const p of list) byKey.set(`${p.in}:${p.name}`, p);
  const order = { path: 0, query: 1, header: 2, cookie: 3 };
  return [...byKey.values()].sort((a, b) => (order[a.in] ?? 9) - (order[b.in] ?? 9));
}

const paramExample = (p) => {
  const v = p.example !== undefined ? p.example : p.schema?.example !== undefined ? p.schema.example : p.schema?.default;
  return v === undefined ? null : String(v);
};

const shellSingleQuote = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

/** requestBody 에서 (미디어타입, 스키마) 하나 — application/json 우선, 없으면 첫 항목. */
export function pickContent(content) {
  if (!isPlainObject(content)) return null;
  const keys = Object.keys(content);
  if (!keys.length) return null;
  const mediaType = keys.includes('application/json') ? 'application/json' : keys.sort(byCodePoint)[0];
  return { mediaType, schema: content[mediaType]?.schema ?? null };
}

/**
 * curl 예시. 기본 URL 은 `https://<your-host>`, 개인 API 토큰 헤더, 본문이 있으면 Content-Type 과 스키마 예시로 만든 최소 JSON.
 * 경로 변수는 예시가 있으면 그 값, 없으면 `<name>`; 필수 쿼리는 `?name=<name>` 으로 붙인다. multipart 는 `-F` 로.
 *
 * @param op       오퍼레이션 객체
 * @param path     `/api/wiki/spaces/{id}` 같은 경로 템플릿
 * @param service  { id, title, baseUrl? } — baseUrl 이 있으면 그것을 쓴다
 * @param ctx      { spec, pathItem } — `$ref` 해석과 경로 공통 파라미터용(생략 가능)
 */
export function curlExample(op, path, service = {}, ctx = {}) {
  const spec = ctx.spec ?? { components: {} };
  const params = mergedParameters(ctx.pathItem, op, spec);
  let url = path.replace(/\{([^}]+)\}/g, (all, name) => {
    const p = params.find((x) => x.in === 'path' && x.name === name);
    return (p && paramExample(p)) ?? `<${name}>`;
  });
  const query = params.filter((p) => p.in === 'query' && p.required).map((p) => `${p.name}=${paramExample(p) ?? `<${p.name}>`}`);
  if (query.length) url += `?${query.join('&')}`;
  const method = String(ctx.method ?? op.method ?? 'get').toUpperCase();
  const lines = [`curl -X ${method} "${service.baseUrl ?? BASE_URL}${url}"`, `  -H "Authorization: Bearer ${TOKEN_PLACEHOLDER}"`];
  for (const p of params.filter((x) => x.in === 'header' && x.required)) lines.push(`  -H "${p.name}: ${paramExample(p) ?? `<${p.name}>`}"`);

  const body = pickContent(op.requestBody?.content);
  if (body?.mediaType === 'multipart/form-data') {
    const s = deref(body.schema, spec) ?? {};
    for (const [name, prop] of Object.entries(s.properties ?? {})) {
      const resolved = deref(prop, spec) ?? {};
      const value = resolved.format === 'binary' ? `@<${name}>` : String(exampleValue(prop, spec) ?? '');
      lines.push(`  -F "${name}=${value}"`);
    }
  } else if (body) {
    lines.push(`  -H "Content-Type: ${body.mediaType}"`);
    const value = exampleValue(body.schema, spec);
    lines.push(`  -d ${shellSingleQuote(JSON.stringify(value ?? {}, null, 2).replace(/\n/g, '\n  '))}`);
  }
  return `${lines.join(' \\\n')}\n`;
}

/** 표 칸 안전화 — 파이프와 줄바꿈은 표를 깨뜨린다. */
export const cell = (v) => String(v ?? '').replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();
const code = (v) => (v === '' || v === undefined || v === null ? '' : `\`${cell(v)}\``);

function table(headers, rows) {
  const line = (cells) => `| ${cells.join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map(line)].join('\n');
}

/** 스펙의 모든 오퍼레이션 — 경로순 → 메서드순. 태그 없는 것은 UNTAGGED 로. */
export function listOperations(spec) {
  const out = [];
  for (const path of Object.keys(spec.paths ?? {}).sort(byCodePoint)) {
    const pathItem = spec.paths[path];
    if (!isPlainObject(pathItem)) continue;
    for (const method of Object.keys(pathItem).filter(isMethod).sort(compareMethods)) {
      const op = pathItem[method];
      if (!isPlainObject(op)) continue;
      const tags = Array.isArray(op.tags) && op.tags.length ? op.tags : [UNTAGGED];
      out.push({ method: method.toUpperCase(), path, op, pathItem, tags });
    }
  }
  return out;
}

/** 태그 목록 — 선언된 태그 + 오퍼레이션에만 있는 태그, 이름순. 각 항목에 오퍼레이션 수. */
export function listTags(spec) {
  const ops = listOperations(spec);
  const declared = new Map((spec.tags ?? []).map((t) => [t.name, t.description ?? '']));
  const names = new Set([...declared.keys(), ...ops.flatMap((o) => o.tags)]);
  return [...names]
    .sort(byCodePoint)
    .map((name) => ({ name, description: declared.get(name) ?? '', count: ops.filter((o) => o.tags.includes(name)).length }))
    .filter((t) => t.count > 0);
}

const opHeading = (o) => `${o.method} ${o.path}`;

function renderParameters(params) {
  if (!params.length) return '';
  const rows = params.map((p) => [code(p.name), p.in, code(typeLabel(p.schema, null)), p.required ? '예' : '', cell(p.description)]);
  return `### 파라미터\n\n${table(['이름', '위치', '타입', '필수', '설명'], rows)}\n`;
}

function schemaTable(schema, spec) {
  const rows = flattenSchema(schema, spec.components).map((r) => [code(r.name), code(r.type), r.required ? '예' : '', cell(r.description), code(r.example)]);
  return rows.length ? table(['필드', '타입', '필수', '설명', '예시'], rows) : '';
}

function renderRequestBody(op, spec) {
  const body = pickContent(op.requestBody?.content);
  if (!body) return '';
  const lines = ['### 요청 본문', ''];
  const label = body.schema ? code(typeLabel(body.schema, spec)) : '';
  lines.push(`${code(body.mediaType)}${label ? ` — ${label}` : ''}${op.requestBody?.required ? ' (필수)' : ''}`);
  const t = body.schema ? schemaTable(body.schema, spec) : '';
  if (t) lines.push('', t);
  return `${lines.join('\n')}\n`;
}

function renderResponses(op, spec) {
  const responses = op.responses ?? {};
  const rows = Object.keys(responses)
    .sort(byCodePoint)
    .map((status) => {
      const r = responses[status]?.$ref ? resolveRef(responses[status].$ref, spec) : responses[status];
      const content = pickContent(r?.content);
      return [code(status), cell(r?.description), content?.schema ? code(typeLabel(content.schema, spec)) : ''];
    });
  if (!rows.length) return '';
  return `### 응답\n\n${table(['상태', '설명', '스키마'], rows)}\n`;
}

function renderOperation(o, spec, service) {
  const parts = [`## ${opHeading(o)}`, ''];
  const summary = [o.op.summary, o.op.description].filter(Boolean).join('\n\n');
  if (summary) parts.push(summary, '');
  if (o.op.deprecated) parts.push('> **사용 중단(deprecated)**', '');
  const sections = [
    renderParameters(mergedParameters(o.pathItem, o.op, spec)),
    renderRequestBody(o.op, spec),
    renderResponses(o.op, spec),
    `### curl\n\n\`\`\`bash\n${curlExample(o.op, o.path, service, { spec, pathItem: o.pathItem, method: o.method })}\`\`\`\n`,
  ].filter(Boolean);
  return `${parts.join('\n')}\n${sections.join('\n')}`;
}

/**
 * 태그 한 개 = 페이지 한 개. 첫 줄은 자동 생성 안내, H1 은 태그 이름, 태그 설명, 엔드포인트 표, 엔드포인트별 절.
 * @param tag  태그 이름(문자열) 또는 { name, description }
 */
export function renderTagPage(spec, tag, service = {}) {
  const name = typeof tag === 'string' ? tag : tag.name;
  const info = listTags(spec).find((t) => t.name === name);
  const description = (typeof tag === 'object' && tag.description) || info?.description || '';
  const ops = listOperations(spec).filter((o) => o.tags.includes(name));
  const head = [`> ${NOTICE}`, '', `# ${name}`, ''];
  if (description) head.push(description, '');
  const index = table(
    ['메서드', '경로', '요약'],
    ops.map((o) => [code(o.method), code(o.path), `[${cell(o.op.summary || o.op.operationId || '-')}](#${headingAnchor(opHeading(o))})`]),
  );
  const body = ops.map((o) => renderOperation(o, spec, service)).join('\n');
  return `${head.join('\n')}\n## 엔드포인트\n\n${index}\n\n${body}`;
}

/** 서비스 README — 개요·인증·리소스(태그) 목록·공통 오류. 태그 링크는 같은 디렉터리의 `<slug>.md`. */
export function renderServiceReadme(spec, service) {
  const info = spec.info ?? {};
  const tags = listTags(spec);
  const ops = listOperations(spec);
  const lines = [`> ${NOTICE}`, '', `# ${service.title ?? info.title ?? service.id}`, ''];
  if (info.description) lines.push(info.description, '');
  lines.push(
    table(
      ['항목', '값'],
      [
        ['버전', code(info.version ?? '-')],
        ['기본 URL', code(service.baseUrl ?? BASE_URL)],
        ['엔드포인트', String(ops.length)],
      ],
    ),
    '',
  );

  const schemes = spec.components?.securitySchemes ?? {};
  const bearer = Object.entries(schemes).find(([, s]) => s?.type === 'http' && String(s.scheme).toLowerCase() === 'bearer');
  lines.push('## 인증', '');
  if (bearer) {
    const [schemeName, scheme] = bearer;
    const global = (spec.security ?? []).some((s) => Object.hasOwn(s ?? {}, schemeName));
    lines.push(`${scheme.description ? `${scheme.description}. ` : ''}${global ? '모든 엔드포인트가 이 인증을 요구한다.' : '인증이 필요한 엔드포인트는 각 절에 표시한다.'}`, '');
  } else {
    lines.push('스펙에 보안 스킴이 없다. 게이트웨이 뒤에서는 세션 JWT 또는 개인 API 토큰을 붙인다.', '');
  }
  lines.push('```http', `Authorization: Bearer ${TOKEN_PLACEHOLDER}`, '```', '');

  lines.push('## 리소스', '');
  if (tags.length) {
    lines.push(table(['리소스', '설명', '엔드포인트'], tags.map((t) => [`[${cell(t.name)}](${slugify(t.name)}.md)`, cell(t.description), String(t.count)])), '');
  } else {
    lines.push('오퍼레이션이 없다.', '');
  }

  const error = spec.components?.schemas?.PlatformError;
  if (error) {
    lines.push('## 공통 오류', '');
    lines.push(`${error.description ? `${error.description}. ` : ''}오류 응답 본문은 \`PlatformError\` 하나로 통일된다.`, '');
    const t = schemaTable({ $ref: '#/components/schemas/PlatformError' }, spec);
    if (t) lines.push(t, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * 서비스 하나의 생성물 — { 'README.md': …, '<slug>.md': … }. 슬러그가 겹치는 태그가 있으면 오류.
 */
export function renderService(spec, service) {
  const files = { 'README.md': renderServiceReadme(spec, service) };
  const seen = new Map();
  for (const t of listTags(spec)) {
    const slug = slugify(t.name);
    if (seen.has(slug)) throw new Error(`${service.id}: 태그 "${seen.get(slug)}" 와 "${t.name}" 의 파일명이 겹칩니다(${slug}.md)`);
    seen.set(slug, t.name);
    files[`${slug}.md`] = renderTagPage(spec, t, service);
  }
  return files;
}

/** 수집한 JSON 이 쓸 만한 OpenAPI 문서인지. 아니면 한국어 사유를 돌려준다(null 이면 정상). */
export function validateSpec(json) {
  if (!isPlainObject(json)) return 'JSON 객체가 아닙니다';
  if (typeof json.openapi !== 'string' || !json.openapi.startsWith('3.')) return `openapi 필드가 3.x 가 아닙니다: ${json.openapi ?? '(없음)'}`;
  if (!isPlainObject(json.paths)) return 'paths 가 없습니다';
  return null;
}
