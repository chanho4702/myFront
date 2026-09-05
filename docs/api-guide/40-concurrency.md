# 낙관적 락

페이지·이슈·프로젝트·스프린트·버전처럼 여러 사람이 동시에 고칠 수 있는 리소스는 낙관적 락으로 보호된다. 이 문서는 `version`을 읽어 `expectedVersion`으로 되돌려 보내는 흐름, 409가 났을 때의 처리, 그리고 WIKI 페이지와 ALM 이슈에 대한 전체 curl 시퀀스를 다룬다.

## 원리

1. `GET`으로 리소스를 읽는다. 응답에 현재 `version`(정수)이 들어 있다.
2. `PUT` 본문에 그 값을 `expectedVersion`으로 넣어 보낸다.
3. 서버는 저장된 버전과 `expectedVersion`을 비교한다. 같으면 저장하고 `version`을 올린 응답을 준다. 다르면 아무것도 바꾸지 않고 `409`를 준다.
4. `409`를 받으면 다시 `GET`해서 최신 내용을 확인하고, 내 변경을 그 위에 다시 적용한 뒤 새 `version`으로 `PUT`한다.

`expectedVersion`은 필수다. 빼면 `400`이다. 잠금을 잡거나 푸는 별도 API는 없다.

## 적용 대상

| 리소스 | 읽기 | 쓰기 | 레퍼런스 |
|---|---|---|---|
| WIKI 페이지 | `GET /api/wiki/pages/{id}` → `version` | `PUT /api/wiki/pages/{id}` | [Pages](../api-reference/wiki/pages.md) |
| ALM 이슈 | `GET /api/alm/issues/{issueId}` → `version` | `PUT /api/alm/issues/{issueId}` | [Issues](../api-reference/alm/issues.md) |
| ALM 프로젝트 | `GET /api/alm/projects/{projectId}` → `version` | `PUT /api/alm/projects/{projectId}` | [Projects](../api-reference/alm/projects.md) |
| ALM 스프린트 | `GET /api/alm/sprints/{sprintId}` → `version` | `PUT /api/alm/sprints/{sprintId}` | [Sprints](../api-reference/alm/sprints.md) |
| ALM 버전(릴리스) | `GET /api/alm/projects/{projectId}/versions` → 각 항목의 `version` | `PUT /api/alm/versions/{versionId}` | [Versions](../api-reference/alm/versions.md) |

목록 응답(`GET /api/alm/projects`, 이슈 검색의 `items` 등)에도 `version`이 있으니, 목록에서 바로 수정할 때는 그 값을 써도 된다. 다만 목록을 받은 뒤 시간이 지났다면 수정 직전에 단건 `GET`으로 다시 읽는 편이 안전하다.

## 규칙

- **`expectedVersion`은 항상 방금 읽은 값을 쓴다.** 값을 추측하거나 `+1`을 하지 않는다.
- **409는 재시도가 아니라 재조회 신호다.** 같은 본문을 다시 보내면 같은 409가 난다. 반드시 `GET` → 병합 → `PUT` 순서를 지킨다.
- **PUT은 전체 교체다.** WIKI 페이지의 `content`는 본문 전체, ALM 이슈의 `title`·`type`·`status`·`priority`는 매번 필수다. 바꾸지 않을 필드도 읽은 값을 그대로 채워 보낸다.
- **성공 응답의 `version`을 이어서 쓴다.** 연속으로 두 번 수정한다면 두 번째 `expectedVersion`은 첫 번째 응답의 `version`이다.
- 사람의 변경을 자동으로 덮어쓰지 않는다. 병합이 어려운 필드(본문 텍스트)는 충돌을 사용자에게 보여 주고 선택하게 한다.

## 전체 시퀀스 — WIKI 페이지

페이지 42의 제목만 바꾸는 경우다.

**1. 읽는다.**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/pages/42"
```

```json
{
  "id": 42,
  "spaceId": 1,
  "parentId": 12,
  "title": "배포 절차",
  "content": "# 배포 절차\n\n1. 태그를 만든다",
  "type": "page",
  "status": "published",
  "version": 3,
  "views": 128,
  "icon": null,
  "ownerId": null,
  "position": 1024,
  "archivedAt": null,
  "verifiedAt": null,
  "verifiedBy": null,
  "verifiedUntil": null,
  "importedAuthorName": null,
  "importedSourceUrl": null
}
```

**2. 읽은 `version`(3)을 `expectedVersion`으로 넣어 수정한다.** `content`는 전체를 다시 보낸다.

```bash
curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages/42" \
  -d '{
    "title": "배포 절차 (2026-09)",
    "content": "# 배포 절차\n\n1. 태그를 만든다",
    "parentId": 12,
    "expectedVersion": 3,
    "changeNote": "제목에 기준 월 추가"
  }'
```

성공하면 `200`과 함께 `version`이 4인 `PageResponse`가 온다.

**3. 그 사이 누가 먼저 고쳤다면 409다.**

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{ "error": "다른 사용자가 먼저 수정했습니다." }
```

**4. 다시 읽고, 최신 내용 위에 내 변경을 얹어 새 버전으로 다시 보낸다.**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/wiki/pages/42"
# → "version": 4, "content": "…상대가 고친 본문…"

curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/wiki/pages/42" \
  -d '{
    "title": "배포 절차 (2026-09)",
    "content": "…상대가 고친 본문을 그대로 넣는다…",
    "parentId": 12,
    "expectedVersion": 4,
    "changeNote": "제목에 기준 월 추가"
  }'
```

## 전체 시퀀스 — ALM 이슈

이슈 1024의 우선순위를 올리는 경우다. `IssueUpdateRequest`는 `title`·`type`·`status`·`priority`·`expectedVersion`이 필수이므로 읽은 값을 그대로 채운다. `details`는 생략하면 기존 값이 보존된다.

**1. 읽는다.**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/issues/1024"
```

```json
{
  "id": 1024,
  "key": "ALM-42",
  "projectId": 7,
  "title": "로그인 후 첫 화면이 비어 있다",
  "description": "재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.",
  "type": "bug",
  "status": "in-progress",
  "priority": "medium",
  "assigneeId": 42,
  "reporterId": 7,
  "parentId": null,
  "sprintId": 12,
  "dueDate": "2026-09-30",
  "estimateHours": 3.5,
  "resolution": null,
  "fixVersionId": null,
  "labels": ["regression", "frontend"],
  "componentIds": [3],
  "order": 3,
  "version": 3,
  "createdAt": "2026-09-01T09:00:00Z",
  "updatedAt": "2026-09-04T15:20:00Z",
  "archivedAt": null
}
```

**2. 우선순위만 바꿔 다시 보낸다.**

```bash
curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다",
    "description": "재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.",
    "type": "bug",
    "status": "in-progress",
    "priority": "high",
    "assigneeId": 42,
    "expectedVersion": 3
  }'
```

성공하면 `200`과 `version: 4`인 `IssueResponse`가 온다.

**3. 충돌하면 409.**

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{ "error": "다른 사용자가 먼저 수정했습니다." }
```

**4. 다시 읽고 새 `version`으로 보낸다.** 상대가 `status`를 바꿨다면 그 값을 유지한 채 내 `priority` 변경만 얹는다.

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/alm/issues/1024"
# → "version": 4, "status": "review"

curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/alm/issues/1024" \
  -d '{
    "title": "로그인 후 첫 화면이 비어 있다",
    "description": "재현: 로그인 → 대시보드 이동 시 목록이 비어 있다.",
    "type": "bug",
    "status": "review",
    "priority": "high",
    "assigneeId": 42,
    "expectedVersion": 4
  }'
```

## 코드로 쓰면

읽기 → 변경 → 쓰기를 한 함수로 묶고, 409면 한 번 더 시도하는 골격이다. 병합 함수 `apply`는 최신 리소스를 받아 내 변경을 얹은 본문을 돌려준다.

```javascript
async function updateWithRetry(getPath, putPath, apply, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const current = await call(getPath);
    const body = { ...apply(current), expectedVersion: current.version };
    try {
      return await call(putPath, { method: 'PUT', body: JSON.stringify(body) });
    } catch (err) {
      if (!String(err.message).startsWith('409') || attempt === maxAttempts) throw err;
    }
  }
  throw new Error('unreachable');
}

// 사용 예: 이슈 1024의 우선순위를 high로
await updateWithRetry(
  '/api/alm/issues/1024',
  '/api/alm/issues/1024',
  (issue) => ({
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    priority: 'high',
    assigneeId: issue.assigneeId,
  }),
);
```

```python
def update_with_retry(get_path, put_path, apply, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        current = call("GET", get_path)
        body = {**apply(current), "expectedVersion": current["version"]}
        try:
            return call("PUT", put_path, json=body)
        except RuntimeError as err:
            if not str(err).startswith("409") or attempt == max_attempts:
                raise
    raise RuntimeError("unreachable")


# 사용 예: 페이지 42의 제목만 바꾼다
update_with_retry(
    "/api/wiki/pages/42",
    "/api/wiki/pages/42",
    lambda page: {
        "title": "배포 절차 (2026-09)",
        "content": page["content"],
        "parentId": page["parentId"],
        "changeNote": "제목에 기준 월 추가",
    },
)
```

`call`은 [오류 처리](./30-errors.md#처리-골격)의 골격 함수다.
