# 실전 예제 — WIKI

스페이스를 고르고, 페이지를 만들고, 자식 페이지를 붙이고, 수정하고, 라벨을 달고, PDF로 내보내는 흐름을 처음부터 끝까지 따라간다. 예제마다 curl · JavaScript(Node 20, fetch) · Python(requests) 세 가지로 같은 요청을 적었다. 필드 이름과 응답 모양은 [WIKI API 레퍼런스](../api-reference/wiki/README.md)와 같다.

## 공통 준비

환경변수 두 개를 둔다. 토큰 발급은 [인증](./10-authentication.md)을 본다.

```bash
export PLATFORM_HOST="https://<your-host>"
export PLATFORM_TOKEN="chanho_pat_…"
```

JavaScript와 Python 예제는 아래 작은 헬퍼를 전제로 한다. 오류 처리의 자세한 규칙은 [오류 처리](./30-errors.md)에 있다.

**JavaScript**

```javascript
const BASE = process.env.PLATFORM_HOST;
const TOKEN = process.env.PLATFORM_TOKEN;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(`${res.status} ${data?.error ?? res.statusText}`);
  return data;
}
```

**Python**

```python
import os

import requests

BASE = os.environ["PLATFORM_HOST"]
SESSION = requests.Session()
SESSION.headers["Authorization"] = f"Bearer {os.environ['PLATFORM_TOKEN']}"


def api(method, path, **kwargs):
    res = SESSION.request(method, f"{BASE}{path}", **kwargs)
    if not res.ok:
        try:
            message = res.json()["error"]
        except ValueError:
            message = res.reason
        raise RuntimeError(f"{res.status_code} {message}")
    return res.json() if res.text else None
```

## 1. 스페이스 목록에서 작업할 스페이스 고르기

`GET /api/wiki/spaces`는 토큰 주인이 볼 수 있는 스페이스만 돌려준다. 이후 요청에 쓸 `id`를 여기서 얻는다. 키로 찾고 싶으면 응답을 `key`로 거른다.

**curl**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/spaces"
```

**JavaScript**

```javascript
const spaces = await api('/api/wiki/spaces');
const space = spaces.find((s) => s.key === 'platform-ops');
if (!space) throw new Error('스페이스가 없거나 권한이 없다');
console.log(space.id, space.name);
```

**Python**

```python
spaces = api("GET", "/api/wiki/spaces")
space = next((s for s in spaces if s["key"] == "platform-ops"), None)
if space is None:
    raise SystemExit("스페이스가 없거나 권한이 없다")
print(space["id"], space["name"])
```

응답 예:

```json
[
  { "id": 1, "key": "platform-ops", "name": "플랫폼 운영", "description": "배포·장애 대응 문서를 모은다", "ownerId": null }
]
```

## 2. 페이지 만들기

`POST /api/wiki/pages`. `spaceId`·`title`·`content`(마크다운)가 필수다. `status`를 비우면 `published`, `type`을 비우면 `page`다. 응답은 `201`과 `PageResponse`이며 여기의 `id`와 `version`을 뒤에서 쓴다.

**curl**

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages" \
  -d '{
    "spaceId": 1,
    "title": "배포 절차",
    "content": "# 배포 절차\n\n1. 태그를 만든다"
  }'
```

**JavaScript**

```javascript
const page = await api('/api/wiki/pages', {
  method: 'POST',
  body: {
    spaceId: space.id,
    title: '배포 절차',
    content: '# 배포 절차\n\n1. 태그를 만든다',
  },
});
console.log(page.id, page.version); // 예: 42 1
```

**Python**

```python
page = api(
    "POST",
    "/api/wiki/pages",
    json={
        "spaceId": space["id"],
        "title": "배포 절차",
        "content": "# 배포 절차\n\n1. 태그를 만든다",
    },
)
print(page["id"], page["version"])  # 예: 42 1
```

초안으로 만들고 싶으면 `"status": "draft"`를 넣고, 나중에 `POST /api/wiki/pages/{id}/publish`로 게시한다.

## 3. 자식 페이지 만들고 트리 읽기

같은 `POST /api/wiki/pages`에 `parentId`를 주면 그 아래에 생긴다. 트리는 `GET /api/wiki/spaces/{spaceId}/pages/children?parentId=…`로 한 단계씩 읽는다. `parentId`를 비우면 스페이스 루트다.

**curl**

```bash
# 자식 페이지 생성
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages" \
  -d '{
    "spaceId": 1,
    "parentId": 42,
    "title": "롤백 절차",
    "content": "# 롤백 절차\n\n이전 태그로 되돌린다"
  }'

# 42 아래 자식 목록
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/spaces/1/pages/children?parentId=42"
```

**JavaScript**

```javascript
const child = await api('/api/wiki/pages', {
  method: 'POST',
  body: {
    spaceId: space.id,
    parentId: page.id,
    title: '롤백 절차',
    content: '# 롤백 절차\n\n이전 태그로 되돌린다',
  },
});

const children = await api(`/api/wiki/spaces/${space.id}/pages/children?parentId=${page.id}`);
for (const node of children) {
  console.log(node.id, node.title, node.type, node.childCount);
}
```

**Python**

```python
child = api(
    "POST",
    "/api/wiki/pages",
    json={
        "spaceId": space["id"],
        "parentId": page["id"],
        "title": "롤백 절차",
        "content": "# 롤백 절차\n\n이전 태그로 되돌린다",
    },
)

children = api("GET", f"/api/wiki/spaces/{space['id']}/pages/children", params={"parentId": page["id"]})
for node in children:
    print(node["id"], node["title"], node["type"], node["childCount"])
```

자식 목록의 항목은 `PageNode`라 본문이 없다. `childCount`가 0보다 크면 더 펼칠 수 있다. 조상 경로는 `GET /api/wiki/pages/{pageId}/ancestors`, 하위 전체는 `GET /api/wiki/pages/{pageId}/descendants`로 받는다.

## 4. 페이지 수정하기

`PUT /api/wiki/pages/{id}`는 `title`·`content`·`expectedVersion`이 필수다. `content`는 본문 전체를 다시 보내고, `expectedVersion`에는 방금 읽은 `version`을 넣는다. 다르면 `409`다([낙관적 락](./40-concurrency.md)).

**curl**

```bash
# 현재 버전을 읽는다
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/pages/42"
# → "version": 1

# 읽은 version 을 expectedVersion 으로 넣어 수정한다
curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages/42" \
  -d '{
    "title": "배포 절차",
    "content": "# 배포 절차\n\n1. 태그를 만든다\n2. 파이프라인이 끝나길 기다린다",
    "expectedVersion": 1,
    "changeNote": "2단계 추가"
  }'
```

**JavaScript**

```javascript
const current = await api(`/api/wiki/pages/${page.id}`);
const updated = await api(`/api/wiki/pages/${page.id}`, {
  method: 'PUT',
  body: {
    title: current.title,
    content: `${current.content}\n2. 파이프라인이 끝나길 기다린다`,
    parentId: current.parentId,
    expectedVersion: current.version,
    changeNote: '2단계 추가',
  },
});
console.log(updated.version); // current.version + 1
```

**Python**

```python
current = api("GET", f"/api/wiki/pages/{page['id']}")
updated = api(
    "PUT",
    f"/api/wiki/pages/{page['id']}",
    json={
        "title": current["title"],
        "content": current["content"] + "\n2. 파이프라인이 끝나길 기다린다",
        "parentId": current["parentId"],
        "expectedVersion": current["version"],
        "changeNote": "2단계 추가",
    },
)
print(updated["version"])
```

부모를 바꾸는 것은 PUT이 아니라 `POST /api/wiki/pages/{id}/move`다. 지난 버전은 `GET /api/wiki/pages/{pageId}/revisions`에서 본다.

## 5. 라벨 붙이기

`PUT /api/wiki/pages/{pageId}/labels`는 라벨을 **통째로 교체**한다. 기존 라벨을 유지하려면 `GET`으로 먼저 읽어 합친다. 응답은 확정된 라벨 문자열 배열이다. 라벨 후보는 `GET /api/wiki/labels?q=…`로 찾는다.

**curl**

```bash
# 현재 라벨
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/pages/42/labels"

# 통째로 교체
curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages/42/labels" \
  -d '{ "labels": ["배포", "운영"] }'
```

**JavaScript**

```javascript
const existing = await api(`/api/wiki/pages/${page.id}/labels`);
const labels = await api(`/api/wiki/pages/${page.id}/labels`, {
  method: 'PUT',
  body: { labels: [...new Set([...existing, '배포', '운영'])] },
});
console.log(labels); // ["배포", "운영"]
```

**Python**

```python
existing = api("GET", f"/api/wiki/pages/{page['id']}/labels")
labels = api(
    "PUT",
    f"/api/wiki/pages/{page['id']}/labels",
    json={"labels": sorted(set(existing) | {"배포", "운영"})},
)
print(labels)
```

라벨로 페이지를 모으려면 `GET /api/wiki/spaces/{spaceId}/labels/{name}/pages`를 쓴다.

## 6. PDF로 내보내기

`GET /api/wiki/pages/{id}/export.pdf`는 `application/pdf`를 `attachment`로 준다. `includeChildren=true`면 하위 페이지까지 한 파일에 이어 붙인다. JSON이 아니므로 헬퍼 대신 바이너리로 받는다.

**curl**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -o 배포절차.pdf \
  "$PLATFORM_HOST/api/wiki/pages/42/export.pdf?includeChildren=true"
```

**JavaScript**

```javascript
import { writeFile } from 'node:fs/promises';

const res = await fetch(`${BASE}/api/wiki/pages/${page.id}/export.pdf?includeChildren=true`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
if (!res.ok) throw new Error(`${res.status} ${(await res.json()).error}`);
await writeFile('배포절차.pdf', Buffer.from(await res.arrayBuffer()));
```

**Python**

```python
res = SESSION.get(f"{BASE}/api/wiki/pages/{page['id']}/export.pdf", params={"includeChildren": "true"})
if not res.ok:
    raise RuntimeError(f"{res.status_code} {res.json()['error']}")
with open("배포절차.pdf", "wb") as out:
    out.write(res.content)
```

## 더 해 볼 것

| 하고 싶은 것 | 엔드포인트 | 레퍼런스 |
|---|---|---|
| 댓글 달기(인용 구간을 주면 인라인 댓글) | `POST /api/wiki/pages/{pageId}/comments` | [Comments](../api-reference/wiki/comments.md) |
| 제목으로 페이지 찾기 | `GET /api/wiki/spaces/{spaceId}/pages/search?q=…` | [Page Tree](../api-reference/wiki/page-tree.md) |
| 첨부 올리기·내려받기 | `POST /api/wiki/pages/{pageId}/attachments` | [첨부 파일](./50-files.md) |
| 페이지 이동·복사 | `POST /api/wiki/pages/{id}/move`, `POST /api/wiki/pages/{id}/copy` | [Pages](../api-reference/wiki/pages.md) |
| 휴지통으로 보내기(자식이 있으면 `children=promote` 또는 `cascade`) | `DELETE /api/wiki/pages/{id}` | [Pages](../api-reference/wiki/pages.md) |
| 페이지 감시·별표 | `POST /api/wiki/pages/{pageId}/watch`, `PUT /api/wiki/pages/{pageId}/star` | [Watch](../api-reference/wiki/watch.md), [Personal](../api-reference/wiki/personal.md) |
