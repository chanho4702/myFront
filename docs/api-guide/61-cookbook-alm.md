# 실전 예제 — ALM

프로젝트를 고르고, 이슈를 만들고, 댓글과 작업 시간을 남기고, 상태를 옮기고 스프린트에 넣고, 조건으로 검색하는 흐름을 따라간다. 예제마다 curl · JavaScript(Node 20, fetch) · Python(requests) 세 가지로 같은 요청을 적었다. 필드 이름과 응답 모양은 [ALM API 레퍼런스](../api-reference/alm/README.md)와 같다.

## 공통 준비

환경변수와 헬퍼는 [WIKI 예제의 공통 준비](./60-cookbook-wiki.md#공통-준비)와 같다. 아래 예제는 그 `api` 함수(JavaScript·Python)와 `$PLATFORM_HOST`·`$PLATFORM_TOKEN`(curl)을 전제로 한다.

ALM에서 먼저 알아둘 것:

- 이슈의 `type`·`status`·`priority`는 **설정 레지스트리의 문자열 ID**다(`bug`, `in-progress`, `high` 같은 값). 고정값이 아니므로 처음 붙일 때 레지스트리를 한 번 읽어 둔다.
- 이슈는 숫자 `id`와 사람이 읽는 `key`(`ALM-42`)를 함께 가진다. 경로에는 `id`를 쓰고, 키로 찾을 때만 `GET /api/alm/issues/by-key/{key}`를 쓴다.

## 1. 프로젝트 조회

`GET /api/alm/projects`는 토큰 주인이 접근할 수 있는 프로젝트 배열이다. `key`로 골라 `id`를 얻는다. 단건은 `GET /api/alm/projects/{projectId}`.

**curl**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/projects"
```

**JavaScript**

```javascript
const projects = await api('/api/alm/projects');
const project = projects.find((p) => p.key === 'ALM');
if (!project) throw new Error('프로젝트가 없거나 권한이 없다');
console.log(project.id, project.name, project.leadId);
```

**Python**

```python
projects = api("GET", "/api/alm/projects")
project = next((p for p in projects if p["key"] == "ALM"), None)
if project is None:
    raise SystemExit("프로젝트가 없거나 권한이 없다")
print(project["id"], project["name"], project["leadId"])
```

응답 예(주요 필드):

```json
[
  {
    "id": 7,
    "key": "ALM",
    "name": "ALM 플랫폼",
    "leadId": 7,
    "defaultAssignee": "PROJECT_LEAD",
    "version": 2,
    "createdAt": "2026-08-01T09:00:00Z",
    "updatedAt": "2026-09-04T15:20:00Z",
    "archivedAt": null,
    "deletedAt": null
  }
]
```

## 2. 이슈 만들기

먼저 레지스트리에서 쓸 ID를 확인하고, `POST /api/alm/projects/{projectId}/issues`로 만든다. `title`만 필수다. `type`·`status`·`priority`를 비우면 프로젝트 기본값·워크플로 첫 상태·기본 우선순위가 들어간다. 세부 항목(마감일·라벨·상위 이슈 등)은 `details` 안에 넣는다.

**curl**

```bash
# 레지스트리 확인 (id 를 쓴다)
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/alm/settings/issue-types"
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/alm/settings/statuses"
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/alm/settings/priorities"

# 이슈 생성
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/projects/7/issues" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다",
    "description": "재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.",
    "type": "bug",
    "priority": "high",
    "assigneeId": 42,
    "details": {
      "dueDate": "2026-09-30",
      "labels": ["regression", "frontend"]
    }
  }'
```

**JavaScript**

```javascript
const [types, statuses, priorities] = await Promise.all([
  api('/api/alm/settings/issue-types'),
  api('/api/alm/settings/statuses'),
  api('/api/alm/settings/priorities'),
]);
console.log(types.map((t) => t.id), statuses.map((s) => s.id), priorities.map((p) => p.id));

const issue = await api(`/api/alm/projects/${project.id}/issues`, {
  method: 'POST',
  body: {
    title: '로그인 후 첫 화면이 비어 있다',
    description: '재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.',
    type: 'bug',
    priority: 'high',
    assigneeId: 42,
    details: { dueDate: '2026-09-30', labels: ['regression', 'frontend'] },
  },
});
console.log(issue.id, issue.key, issue.status, issue.version); // 예: 1024 ALM-42 todo 1
```

**Python**

```python
types = api("GET", "/api/alm/settings/issue-types")
statuses = api("GET", "/api/alm/settings/statuses")
priorities = api("GET", "/api/alm/settings/priorities")
print([t["id"] for t in types], [s["id"] for s in statuses], [p["id"] for p in priorities])

issue = api(
    "POST",
    f"/api/alm/projects/{project['id']}/issues",
    json={
        "title": "로그인 후 첫 화면이 비어 있다",
        "description": "재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.",
        "type": "bug",
        "priority": "high",
        "assigneeId": 42,
        "details": {"dueDate": "2026-09-30", "labels": ["regression", "frontend"]},
    },
)
print(issue["id"], issue["key"], issue["status"], issue["version"])
```

`assigneeId`는 Org 멤버 `id`다. 모르면 [Org 예제](./62-cookbook-org.md#2-멤버-찾기)로 찾는다.

## 3. 댓글 달기

`POST /api/alm/issues/{issueId}/comments`. 본문은 `body`, 멘션한 사용자는 `mentionedUserIds`에 넣으면 알림이 간다. 응답은 `201`과 `CommentResponse`.

**curl**

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024/comments" \
  -d '{ "body": "스테이징에서 재현 확인했습니다.", "mentionedUserIds": [7] }'
```

**JavaScript**

```javascript
const comment = await api(`/api/alm/issues/${issue.id}/comments`, {
  method: 'POST',
  body: { body: '스테이징에서 재현 확인했습니다.', mentionedUserIds: [7] },
});
console.log(comment.id, comment.authorId, comment.createdAt);
```

**Python**

```python
comment = api(
    "POST",
    f"/api/alm/issues/{issue['id']}/comments",
    json={"body": "스테이징에서 재현 확인했습니다.", "mentionedUserIds": [7]},
)
print(comment["id"], comment["authorId"], comment["createdAt"])
```

댓글 목록은 `GET /api/alm/issues/{issueId}/comments`, 수정·삭제는 `PUT`/`DELETE /api/alm/comments/{id}`.

## 4. 작업 시간 기록

`POST /api/alm/issues/{issueId}/worklogs`에 `hours`(숫자, 시간 단위)·`comment`·`workedOn`(`YYYY-MM-DD`)을 보낸다. 프로젝트 단위 집계는 `GET /api/alm/projects/{projectId}/worklogs?since=…&until=…`(둘 다 날짜, 포함).

**curl**

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024/worklogs" \
  -d '{ "hours": 1.5, "comment": "원인 분석", "workedOn": "2026-09-04" }'

# 프로젝트 7 의 9월 작업 시간
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/projects/7/worklogs?since=2026-09-01&until=2026-09-30"
```

**JavaScript**

```javascript
const worklog = await api(`/api/alm/issues/${issue.id}/worklogs`, {
  method: 'POST',
  body: { hours: 1.5, comment: '원인 분석', workedOn: '2026-09-04' },
});
console.log(worklog.id, worklog.hours);

const rows = await api(`/api/alm/projects/${project.id}/worklogs?since=2026-09-01&until=2026-09-30`);
const total = rows.reduce((sum, r) => sum + r.hours, 0);
console.log(`9월 합계 ${total}h`);
```

**Python**

```python
worklog = api(
    "POST",
    f"/api/alm/issues/{issue['id']}/worklogs",
    json={"hours": 1.5, "comment": "원인 분석", "workedOn": "2026-09-04"},
)
print(worklog["id"], worklog["hours"])

rows = api(
    "GET",
    f"/api/alm/projects/{project['id']}/worklogs",
    params={"since": "2026-09-01", "until": "2026-09-30"},
)
print("9월 합계", sum(r["hours"] for r in rows), "h")
```

## 5. 상태 전환과 스프린트 배정

상태만 바꿀 때는 `POST /api/alm/issues/{issueId}/move`가 가장 간단하다. `status`(상태 ID)가 필수이고 `expectedVersion`이 없다. 스프린트 배정은 `PUT /api/alm/issues/{issueId}`의 `details.sprintId`로 하며, 이때는 `expectedVersion`과 필수 필드(`title`·`type`·`status`·`priority`)를 함께 보낸다([낙관적 락](./40-concurrency.md)).

스프린트가 없으면 `POST /api/alm/projects/{projectId}/sprints`로 만들고(`name`을 비우면 `Sprint N`으로 자동 명명), `POST /api/alm/sprints/{sprintId}/start`로 시작한다.

**curl**

```bash
# 상태를 in-progress 로
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024/move" \
  -d '{ "status": "in-progress" }'

# 스프린트 만들기
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/projects/7/sprints" \
  -d '{ "name": "Sprint 3" }'
# → { "id": 12, "state": "PLANNED", … }

# 이슈를 다시 읽어 version 을 얻고, sprintId 를 넣어 수정
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/alm/issues/1024"
curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다",
    "type": "bug",
    "status": "in-progress",
    "priority": "high",
    "assigneeId": 42,
    "details": { "sprintId": 12 },
    "expectedVersion": 2
  }'

# 스프린트 시작
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/sprints/12/start"
```

**JavaScript**

```javascript
await api(`/api/alm/issues/${issue.id}/move`, { method: 'POST', body: { status: 'in-progress' } });

const sprint = await api(`/api/alm/projects/${project.id}/sprints`, {
  method: 'POST',
  body: { name: 'Sprint 3' },
});

const current = await api(`/api/alm/issues/${issue.id}`);
await api(`/api/alm/issues/${issue.id}`, {
  method: 'PUT',
  body: {
    title: current.title,
    description: current.description,
    type: current.type,
    status: current.status,
    priority: current.priority,
    assigneeId: current.assigneeId,
    details: { sprintId: sprint.id },
    expectedVersion: current.version,
  },
});

const started = await api(`/api/alm/sprints/${sprint.id}/start`, { method: 'POST' });
console.log(started.state, started.startedAt); // ACTIVE 2026-…
```

**Python**

```python
api("POST", f"/api/alm/issues/{issue['id']}/move", json={"status": "in-progress"})

sprint = api("POST", f"/api/alm/projects/{project['id']}/sprints", json={"name": "Sprint 3"})

current = api("GET", f"/api/alm/issues/{issue['id']}")
api(
    "PUT",
    f"/api/alm/issues/{issue['id']}",
    json={
        "title": current["title"],
        "description": current["description"],
        "type": current["type"],
        "status": current["status"],
        "priority": current["priority"],
        "assigneeId": current["assigneeId"],
        "details": {"sprintId": sprint["id"]},
        "expectedVersion": current["version"],
    },
)

started = api("POST", f"/api/alm/sprints/{sprint['id']}/start")
print(started["state"], started["startedAt"])
```

`details`를 보내면 그 안의 필드가 함께 적용된다. 라벨·마감일을 유지하려면 읽은 값을 `details`에 같이 넣는다(`details: { sprintId, labels: current.labels, dueDate: current.dueDate }`). 스프린트 완료는 `POST /api/alm/sprints/{sprintId}/complete`에 `doneStatuses`와 `moveUnfinishedToSprintId`를 준다.

## 6. 이슈 검색

`GET /api/alm/issues/search`는 조건 필터 + 정렬 + `page`/`size` 페이지네이션이다. 응답은 `items`·`page`·`size`·`total`. 배열 파라미터는 같은 이름을 반복한다. `size` 기본 50, 상한 200.

**curl**

```bash
curl -s -G -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/issues/search" \
  --data-urlencode "projectIds=7" \
  --data-urlencode "statuses=todo" \
  --data-urlencode "statuses=in-progress" \
  --data-urlencode "labels=regression" \
  --data-urlencode "sort=updated" \
  --data-urlencode "dir=desc" \
  --data-urlencode "page=0" \
  --data-urlencode "size=50"
```

**JavaScript**

```javascript
async function* searchAll(params) {
  for (let page = 0; ; page += 1) {
    const qs = new URLSearchParams(params);
    qs.set('page', String(page));
    qs.set('size', '100');
    const result = await api(`/api/alm/issues/search?${qs}`);
    yield* result.items;
    if ((result.page + 1) * result.size >= result.total) return;
  }
}

const params = new URLSearchParams();
params.append('projectIds', String(project.id));
params.append('statuses', 'todo');
params.append('statuses', 'in-progress');
params.append('labels', 'regression');
params.set('sort', 'updated');
params.set('dir', 'desc');

for await (const hit of searchAll(params)) {
  console.log(hit.key, hit.status, hit.assigneeId, hit.updatedAt);
}
```

**Python**

```python
def search_all(params):
    page = 0
    while True:
        result = api("GET", "/api/alm/issues/search", params={**params, "page": page, "size": 100})
        yield from result["items"]
        if (result["page"] + 1) * result["size"] >= result["total"]:
            return
        page += 1


params = {
    "projectIds": [project["id"]],
    "statuses": ["todo", "in-progress"],
    "labels": ["regression"],
    "sort": "updated",
    "dir": "desc",
}
for hit in search_all(params):
    print(hit["key"], hit["status"], hit["assigneeId"], hit["updatedAt"])
```

`requests`는 리스트 값을 같은 이름의 반복 파라미터로 보낸다. 담당자 미지정 이슈는 `assignees=unassigned`로 찾는다. 텍스트 검색은 `text=`.

## 더 해 볼 것

| 하고 싶은 것 | 엔드포인트 | 레퍼런스 |
|---|---|---|
| 키로 이슈 찾기 | `GET /api/alm/issues/by-key/{key}` | [Issue Search](../api-reference/alm/issue-search.md) |
| 이슈 변경 이력 | `GET /api/alm/issues/{issueId}/activity` | [Issue History](../api-reference/alm/issue-history.md) |
| 이슈 연결(블록·중복 등) | `POST /api/alm/issues/{issueId}/links` | [Issue Links](../api-reference/alm/issue-links.md) |
| 첨부 올리기 | `POST /api/alm/issues/{issueId}/attachments` | [첨부 파일](./50-files.md) |
| 보드의 이슈 | `GET /api/alm/boards/{boardId}/issues` | [Boards](../api-reference/alm/boards.md) |
| 릴리스 버전 | `POST /api/alm/projects/{projectId}/versions`, `POST /api/alm/versions/{versionId}/release` | [Versions](../api-reference/alm/versions.md) |
| 이슈 감시 | `PUT /api/alm/issues/{issueId}/watchers/me` | [Notifications](../api-reference/alm/notifications.md) |
| 이슈 보관·복원 | `POST /api/alm/issues/{issueId}/archive`, `POST /api/alm/issues/{issueId}/restore` | [Issue Archive](../api-reference/alm/issue-archive.md) |
