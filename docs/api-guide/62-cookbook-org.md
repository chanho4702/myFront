# 실전 예제 — Org

내 프로필과 권한을 확인하고, 멤버를 찾고, 팀을 만들어 팀원을 넣고, 위키 스페이스에 권한을 부여·변경·회수하고, 새 멤버를 초대하는 흐름을 따라간다. 예제마다 curl · JavaScript(Node 20, fetch) · Python(requests) 세 가지로 같은 요청을 적었다. 필드 이름과 응답 모양은 [Org API 레퍼런스](../api-reference/org/README.md)와 같다.

## 공통 준비

환경변수와 헬퍼는 [WIKI 예제의 공통 준비](./60-cookbook-wiki.md#공통-준비)와 같다. 아래 예제는 그 `api` 함수(JavaScript·Python)와 `$PLATFORM_HOST`·`$PLATFORM_TOKEN`(curl)을 전제로 한다.

Org에서 먼저 알아둘 것:

- 멤버 `id`는 인증 서버의 사용자 ID와 같다. WIKI·ALM의 `ownerId`·`assigneeId`·`authorId`가 모두 이 값이다.
- 계정 `status`가 `ACTIVE`가 아니면 `/api/org/me` 밖의 요청은 `403`이다.
- 권한(grant)은 `resourceType`(`GLOBAL` / `SPACE` / `PROJECT`)과 `resourceId`로 대상을 가리킨다. `resourceId`에는 위키 스페이스 또는 ALM 프로젝트의 **숫자 ID를 문자열로** 넣는다(`"1"`). `GLOBAL`이면 비운다.
- 역할은 `VIEWER` ⊂ `COMMENTER` ⊂ `EDITOR` ⊂ `ADMIN` 순으로 포함 관계다. `GLOBAL` + `ADMIN`이 전역 관리자다.
- 멤버·팀·초대 관리는 전역 관리자 권한이 필요한 경우가 많다. 권한이 없으면 `403`이다.

## 1. 내 프로필과 권한

`GET /api/org/me`는 이름·이메일·상태·전역 역할·소속 팀을, `GET /api/org/me/permissions`는 내 권한 목록을 준다. 어떤 스페이스·프로젝트에 무엇을 할 수 있는지 미리 알고 싶을 때 쓴다.

**curl**

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/org/me"
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" "$PLATFORM_HOST/api/org/me/permissions"
```

**JavaScript**

```javascript
const me = await api('/api/org/me');
console.log(me.id, me.displayName, me.status, me.globalRoles, me.teams.map((t) => t.name));

const grants = await api('/api/org/me/permissions');
const canEditSpace1 = grants.some(
  (g) => g.resourceType === 'SPACE' && g.resourceId === '1' && ['EDITOR', 'ADMIN'].includes(g.role),
);
console.log({ canEditSpace1 });
```

**Python**

```python
me = api("GET", "/api/org/me")
print(me["id"], me["displayName"], me["status"], me["globalRoles"], [t["name"] for t in me["teams"]])

grants = api("GET", "/api/org/me/permissions")
can_edit_space_1 = any(
    g["resourceType"] == "SPACE" and g["resourceId"] == "1" and g["role"] in ("EDITOR", "ADMIN")
    for g in grants
)
print(can_edit_space_1)
```

응답 예:

```json
{
  "id": 42,
  "displayName": "김찬호",
  "email": "chanho@example.com",
  "avatarUrl": "/api/org/members/42/avatar?v=1757030400000",
  "avatarUpdatedAt": "2026-09-01T09:00:00Z",
  "status": "ACTIVE",
  "kind": "HUMAN",
  "joinedVia": "INVITE",
  "globalRoles": [],
  "teams": [{ "id": 3, "name": "플랫폼팀", "kind": "STANDARD", "role": "MEMBER" }]
}
```

## 2. 멤버 찾기

`GET /api/org/members?q=…`는 이름·이메일 부분 검색으로 배열을 준다(기본 필터 `status=ACTIVE`, `kind=HUMAN`). 전체를 훑을 때는 `GET /api/org/members/page`의 `page`/`size`를 쓴다. 단건은 `GET /api/org/members/{id}`.

**curl**

```bash
# 이름·이메일로 검색
curl -s -G -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/members" --data-urlencode "q=chanho"

# 페이지 단위 (관리 화면용)
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/members/page?status=ACTIVE&kind=ALL&page=0&size=20"
```

**JavaScript**

```javascript
const hits = await api(`/api/org/members?${new URLSearchParams({ q: 'chanho' })}`);
const member = hits.find((m) => m.email === 'chanho@example.com');
console.log(member?.id, member?.displayName);

// 전체 활성 멤버 훑기
const all = [];
for (let page = 0; ; page += 1) {
  const result = await api(`/api/org/members/page?status=ACTIVE&kind=ALL&page=${page}&size=100`);
  all.push(...result.items);
  if ((result.page + 1) * result.size >= result.total) break;
}
console.log(all.length);
```

**Python**

```python
hits = api("GET", "/api/org/members", params={"q": "chanho"})
member = next((m for m in hits if m["email"] == "chanho@example.com"), None)
print(member and member["id"], member and member["displayName"])

# 전체 활성 멤버 훑기
all_members = []
page = 0
while True:
    result = api("GET", "/api/org/members/page", params={"status": "ACTIVE", "kind": "ALL", "page": page, "size": 100})
    all_members.extend(result["items"])
    if (result["page"] + 1) * result["size"] >= result["total"]:
        break
    page += 1
print(len(all_members))
```

## 3. 팀 만들고 팀원 추가하기

`POST /api/org/teams`(`name` 필수, 100자까지)로 만들고, `PUT /api/org/teams/{id}/members/{memberId}?role=MEMBER`로 팀원을 넣는다. 만든 사람이 자동으로 팀원이 되지는 않으므로 필요하면 자기 자신도 넣는다. 이미 소속이면 역할만 갱신되며 응답은 `200`이고 본문이 없다. 같은 이름의 팀이 있으면 `400`이다. 팀원 목록은 `GET /api/org/teams/{id}/members`.

**curl**

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/org/teams" \
  -d '{ "name": "플랫폼팀", "description": "게이트웨이·인증·조직 서비스를 만든다" }'
# → { "id": 3, "kind": "STANDARD", "memberCount": 0, "myRole": null, … }

curl -s -X PUT -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/teams/3/members/42?role=MEMBER"

curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/teams/3/members"
```

**JavaScript**

```javascript
const team = await api('/api/org/teams', {
  method: 'POST',
  body: { name: '플랫폼팀', description: '게이트웨이·인증·조직 서비스를 만든다' },
});

await api(`/api/org/teams/${team.id}/members/${member.id}?role=MEMBER`, { method: 'PUT' });

const teamMembers = await api(`/api/org/teams/${team.id}/members`);
for (const m of teamMembers) console.log(m.memberId, m.displayName, m.role);
```

**Python**

```python
team = api("POST", "/api/org/teams", json={"name": "플랫폼팀", "description": "게이트웨이·인증·조직 서비스를 만든다"})

api("PUT", f"/api/org/teams/{team['id']}/members/{member['id']}", params={"role": "MEMBER"})

for m in api("GET", f"/api/org/teams/{team['id']}/members"):
    print(m["memberId"], m["displayName"], m["role"])
```

역할만 바꾸려면 `PATCH /api/org/teams/{id}/members/{memberId}`에 `{ "role": "LEAD" }`, 뺄 때는 `DELETE` 같은 경로. `kind`가 `EVERYONE`인 팀은 활성 멤버 전원이 자동으로 속하며 가입·탈퇴·삭제할 수 없다.

## 4. 스페이스 권한 부여·변경·회수

위키 스페이스 1에 팀 3을 `EDITOR`로 넣는 예다. 현재 권한은 `GET /api/org/grants?resourceType=SPACE&resourceId=1`, 부여는 `POST /api/org/grants`, 역할 변경은 `PATCH /api/org/grants/{id}`, 회수는 `DELETE /api/org/grants/{id}`. 권한 행 `id`는 목록·생성 응답에 있다.

**curl**

```bash
# 현재 권한
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/grants?resourceType=SPACE&resourceId=1"

# 팀 3 에 EDITOR 부여
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/org/grants" \
  -d '{
    "subjectType": "TEAM",
    "subjectId": 3,
    "resourceType": "SPACE",
    "resourceId": "1",
    "role": "EDITOR"
  }'
# → { "id": 17, … }

# ADMIN 으로 올리기
curl -s -X PATCH -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/org/grants/17" \
  -d '{ "role": "ADMIN" }'

# 회수
curl -s -X DELETE -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/grants/17"
```

**JavaScript**

```javascript
const spaceId = 1;
const before = await api(`/api/org/grants?resourceType=SPACE&resourceId=${spaceId}`);
console.log(before.map((g) => `${g.subjectType}:${g.subjectName}=${g.role}`));

const grant = await api('/api/org/grants', {
  method: 'POST',
  body: { subjectType: 'TEAM', subjectId: team.id, resourceType: 'SPACE', resourceId: String(spaceId), role: 'EDITOR' },
});

await api(`/api/org/grants/${grant.id}`, { method: 'PATCH', body: { role: 'ADMIN' } });
await api(`/api/org/grants/${grant.id}`, { method: 'DELETE' });
```

**Python**

```python
space_id = 1
before = api("GET", "/api/org/grants", params={"resourceType": "SPACE", "resourceId": space_id})
print([f"{g['subjectType']}:{g['subjectName']}={g['role']}" for g in before])

grant = api(
    "POST",
    "/api/org/grants",
    json={
        "subjectType": "TEAM",
        "subjectId": team["id"],
        "resourceType": "SPACE",
        "resourceId": str(space_id),
        "role": "EDITOR",
    },
)

api("PATCH", f"/api/org/grants/{grant['id']}", json={"role": "ADMIN"})
api("DELETE", f"/api/org/grants/{grant['id']}")
```

ALM 프로젝트에는 `resourceType: "PROJECT"`와 프로젝트 ID를 쓴다. 사람에게 직접 주려면 `subjectType: "USER"`와 멤버 ID. 마지막 전역 관리자의 역할을 내리려 하면 `409`다([오류 처리](./30-errors.md#409-사유)). 변경 이력은 `GET /api/org/grants/audit?resourceType=SPACE&resourceId=1`.

## 5. 멤버 초대하기

`POST /api/org/invitations`에 `emails`(필수)와 수락 시 적용할 `teams`·`grants` 프리셋, `message`(500자까지)를 보낸다. 응답은 초대 배열이고, 초대 링크 `inviteUrl`은 **이 응답에서만** 볼 수 있다(목록에서는 항상 `null`). `mailSent`가 `false`면 메일이 가지 않았으니 링크를 직접 전달한다. 이미 활성이거나 정지된 계정의 이메일이 섞여 있으면 `409`다.

**curl**

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  "$PLATFORM_HOST/api/org/invitations" \
  -d '{
    "emails": ["new.member@example.com"],
    "teams": [{ "teamId": 3, "role": "MEMBER" }],
    "grants": [{ "scope": "SPACE", "resourceId": "1", "role": "EDITOR" }],
    "message": "플랫폼팀에서 함께 일하게 됐습니다."
  }'

# 대기 중인 초대
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  "$PLATFORM_HOST/api/org/invitations?status=PENDING&page=0&size=20"
```

**JavaScript**

```javascript
const invitations = await api('/api/org/invitations', {
  method: 'POST',
  body: {
    emails: ['new.member@example.com'],
    teams: [{ teamId: team.id, role: 'MEMBER' }],
    grants: [{ scope: 'SPACE', resourceId: '1', role: 'EDITOR' }],
    message: '플랫폼팀에서 함께 일하게 됐습니다.',
  },
});
for (const inv of invitations) {
  console.log(inv.email, inv.status, inv.expiresAt, inv.mailSent ? '(메일 발송)' : inv.inviteUrl);
}

const pending = await api('/api/org/invitations?status=PENDING&page=0&size=20');
console.log(pending.total, pending.items.map((i) => i.email));
```

**Python**

```python
invitations = api(
    "POST",
    "/api/org/invitations",
    json={
        "emails": ["new.member@example.com"],
        "teams": [{"teamId": team["id"], "role": "MEMBER"}],
        "grants": [{"scope": "SPACE", "resourceId": "1", "role": "EDITOR"}],
        "message": "플랫폼팀에서 함께 일하게 됐습니다.",
    },
)
for inv in invitations:
    print(inv["email"], inv["status"], inv["expiresAt"], "(메일 발송)" if inv["mailSent"] else inv["inviteUrl"])

pending = api("GET", "/api/org/invitations", params={"status": "PENDING", "page": 0, "size": 20})
print(pending["total"], [i["email"] for i in pending["items"]])
```

초대의 기본 유효기간은 7일이다. 재발송은 `POST /api/org/invitations/{id}/resend`, 철회는 `DELETE /api/org/invitations/{id}`(대기 중인 초대만).

## 더 해 볼 것

| 하고 싶은 것 | 엔드포인트 | 레퍼런스 |
|---|---|---|
| 승인 대기 계정 보기·승인 | `GET /api/org/members/pending`, `POST /api/org/members/{id}/approve` | [Members](../api-reference/org/members.md) |
| 멤버 정지·비활성 | `PATCH /api/org/members/{id}` | [Members](../api-reference/org/members.md) |
| 멤버 변경 이력 | `GET /api/org/members/{id}/events` | [Members](../api-reference/org/members.md) |
| 내 아바타 올리기 | `PUT /api/org/me/avatar` | [첨부 파일](./50-files.md#org-아바타) |
| 에이전트 멤버 등록 | `POST /api/org/members/agents` | [Members](../api-reference/org/members.md) |
