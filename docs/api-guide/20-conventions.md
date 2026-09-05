# 요청·응답 규약

세 영역(WIKI·ALM·Org)의 API가 공통으로 따르는 형식을 정리한다. 기본 URL과 헤더, ID·시각·날짜와 enum 표기, null 처리, 페이지네이션과 정렬·필터, 멱등성을 다룬다. 엔드포인트별 세부 값은 [API 레퍼런스](../api-reference/wiki/README.md)를 정본으로 삼는다.

## 기본 URL과 경로

모든 요청은 플랫폼 호스트의 게이트웨이를 지난다. 서비스별 포트나 내부 주소를 직접 부르지 않는다.

| 항목 | 값 |
|---|---|
| 기본 URL | `https://<your-host>` |
| WIKI | `/api/wiki/**` |
| ALM | `/api/alm/**` |
| Org | `/api/org/**` |
| 내 계정 | `/api/me` (인증 서버) |

경로 파라미터는 `{id}`처럼 표기하며 실제 값으로 치환한다. 예: `/api/wiki/pages/42`.

## 헤더

| 헤더 | 언제 | 값 |
|---|---|---|
| `Authorization` | 모든 요청 | `Bearer chanho_pat_…` 또는 세션 JWT ([인증](./10-authentication.md)) |
| `Content-Type` | JSON 본문이 있는 POST/PUT/PATCH | `application/json` |
| `Content-Type` | 파일 업로드 | `multipart/form-data` (HTTP 클라이언트가 boundary를 붙여 준다) |

본문은 UTF-8 JSON이다. 응답 본문도 JSON이며, 파일 내려받기·PDF 내보내기만 바이너리다. `204 No Content` 응답에는 본문이 없다.

## 식별자

| 종류 | 형식 | 예 |
|---|---|---|
| 리소스 ID(페이지·스페이스·이슈·프로젝트·멤버·팀·권한 행 등) | 숫자, `integer(int64)` | `42` |
| 이슈 키 | `<프로젝트 키>-<번호>` 문자열. 만든 뒤 바뀌지 않는다 | `ALM-42` |
| 스페이스 키 | 소문자·숫자·하이픈 문자열 | `platform-ops` |
| ALM 타입·상태·우선순위 | 설정 레지스트리의 문자열 ID | `bug`, `in-progress`, `high` |
| 권한(grant)의 `resourceId` | 대상 리소스의 숫자 ID를 **문자열**로 담는다. `GLOBAL`이면 비운다 | `"1"` |
| 개인 API 토큰 ID | UUID (인증 서버) | — |

JSON에서 숫자 ID는 숫자 타입으로 보낸다(`"spaceId": 1`). 이슈 키로 조회하려면 `GET /api/alm/issues/by-key/{key}`를 쓴다.

## 시각과 날짜

| 형식 | 스키마 타입 | 예 | 쓰이는 곳 |
|---|---|---|---|
| ISO-8601 인스턴트, UTC, `Z` 접미 | `string(date-time)` | `2026-09-01T09:00:00Z` | `createdAt`, `updatedAt`, `archivedAt`, `startedAt`, `since`(ALM 감사 로그) |
| 날짜만 | `string(date)` | `2026-09-30` | `dueDate`, `workedOn`, `plannedStart`, `plannedEnd`, `releaseDate`, `since`/`until`(프로젝트 워크로그) |

응답의 시각은 항상 UTC다. 화면에 보일 때만 로컬 시간대로 바꾼다. 날짜 필드에 시각을 붙여 보내면 400이다.

## enum 표기

영역마다 대소문자 관습이 다르다. 값을 그대로 옮겨 쓴다.

| 영역 | 표기 | 예 |
|---|---|---|
| WIKI | 소문자 | `type`: `page` / `folder` / `blog`, `status`: `draft` / `published` |
| ALM 고정 enum | 대문자 스네이크 | 스프린트 `state`: `PLANNED` / `ACTIVE` / `DONE`, `resolution`: `DONE` / `WONT_DO` / `DUPLICATE` / `CANNOT_REPRODUCE`, 버전 `status`: `UNRELEASED` / `RELEASED` / `ARCHIVED` |
| ALM 레지스트리 ID | 소문자 문자열(운영자가 정의) | 이슈 `type` / `status` / `priority`: `bug`, `in-progress`, `high` |
| Org | 대문자 스네이크 | 멤버 `status`: `PENDING` / `ACTIVE` / `SUSPENDED` / `DEACTIVATED`, `kind`: `HUMAN` / `AGENT`, 역할: `VIEWER` / `COMMENTER` / `EDITOR` / `ADMIN` |

ALM 레지스트리 ID는 고정값이 아니다. 실제 목록은 `GET /api/alm/settings/issue-types`, `GET /api/alm/settings/statuses`, `GET /api/alm/settings/priorities`로 읽는다.

## null 처리

- **응답**: 값이 없는 필드는 생략되지 않고 `null`로 온다. 예: 루트 페이지의 `parentId`, 백로그 이슈의 `sprintId`, 팀 스페이스의 `ownerId`.
- **요청에서 "생략"과 "null"은 다를 수 있다.** 레퍼런스의 필드 설명을 따른다. 알려진 예:
  - `PUT /api/alm/issues/{issueId}`의 `details`를 생략하면 기존 값을 보존한다. `assigneeId`를 `null`로 보내면 담당자를 미지정으로 바꾼다.
  - `PUT /api/alm/projects/{projectId}`에서 `leadId`를 `null`로 보내는 것만으로는 책임자가 비워지지 않는다. `clearLead: true`를 함께 보낸다.
- 필수 필드(레퍼런스의 "필수" 열이 "예")를 비우면 400이다.

## 목록과 페이지네이션

목록 API는 세 가지 모양 중 하나다. 커서 방식은 없다.

### 1. 배열 그대로

대부분의 목록은 배열을 통째로 돌려준다. 페이지 파라미터가 없다.

```http
GET /api/wiki/spaces
GET /api/alm/projects
GET /api/org/members?status=ACTIVE&kind=HUMAN
GET /api/wiki/spaces/{spaceId}/pages/children?parentId=12
```

페이지 트리는 한 번에 다 내려오지 않는다. `children`으로 한 단계씩 펼치고, 각 노드의 `childCount`로 자식 유무를 판단한다.

### 2. `page` / `size` 오프셋 페이지

`page`(0부터)와 `size`를 쿼리로 보내고, 응답은 `items` 배열과 `page` · `size` · `total`을 가진 객체다.

| 엔드포인트 | `size` 기본 | `size` 상한 |
|---|---|---|
| `GET /api/alm/issues/search` | 50 | 200 |
| `GET /api/alm/admin/audit` | 50 | 200 |
| `GET /api/org/members/page` | 20 | — |
| `GET /api/org/invitations` | 20 | — |
| `GET /api/wiki/migrations/{jobId}/items` | 서버 고정(`page`만 받는다) | — |

상한을 넘긴 `size`는 서버가 상한으로 줄여 처리한다.

```http
GET /api/org/members/page?status=ACTIVE&page=0&size=20
```

```json
{
  "items": [
    {
      "id": 42,
      "displayName": "김찬호",
      "email": "chanho@example.com",
      "status": "ACTIVE",
      "kind": "HUMAN",
      "avatarUrl": "/api/org/members/42/avatar?v=1757030400000",
      "avatarUpdatedAt": "2026-09-01T09:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 137
}
```

마지막 페이지 판정: `(page + 1) * size >= total`이면 더 없다.

```http
GET /api/alm/issues/search?projectIds=7&statuses=in-progress&sort=updated&dir=desc&page=0&size=50
```

```json
{
  "items": [
    {
      "id": 1024,
      "key": "ALM-42",
      "projectId": 7,
      "title": "로그인 후 첫 화면이 비어 있다",
      "status": "in-progress",
      "priority": "high",
      "type": "bug",
      "assigneeId": 42,
      "sprintId": 12,
      "version": 3,
      "updatedAt": "2026-09-04T15:20:00Z"
    }
  ],
  "page": 0,
  "size": 50,
  "total": 1
}
```

(예시는 주요 필드만 적었다. 실제 항목은 `IssueResponse`의 모든 필드를 담는다.)

### 3. `limit`만 있는 최근 목록

```http
GET /api/wiki/recent?limit=10
GET /api/wiki/spaces/{spaceId}/pages/recent?limit=10
```

최근 순으로 `limit`개까지 돌려주며, 다음 페이지는 없다.

## 정렬과 필터

정렬 파라미터가 있는 엔드포인트는 이슈 검색뿐이다.

| 파라미터 | 값 | 기본 |
|---|---|---|
| `sort` | `updated` · `created` · `due` · `priority` · `key` | `updated` |
| `dir` | `desc` · `asc` | `desc` |

필터는 엔드포인트마다 쿼리 파라미터로 받는다. 배열 파라미터는 같은 이름을 반복한다.

```http
GET /api/alm/issues/search?statuses=todo&statuses=in-progress&labels=regression&assignees=unassigned
```

자주 쓰는 필터:

| 엔드포인트 | 파라미터 |
|---|---|
| `GET /api/alm/issues/search` | `projectIds`, `text`, `statuses`, `priorities`, `types`, `assignees`(미지정은 `unassigned`), `labels`, `componentIds`, `sprintId`, `parentId`, `fixVersionId` |
| `GET /api/alm/admin/audit` | `type`, `actorId`, `projectId`, `since`(date-time) |
| `GET /api/org/members`, `GET /api/org/members/page` | `status`(`ACTIVE` 기본, `ALL`이면 전부), `kind`(`HUMAN` 기본, `ALL`이면 전부), `q`(이름·이메일 부분 검색) |
| `GET /api/org/invitations` | `status`, `q`(이메일), `page`, `size` |
| `GET /api/org/teams` | `q`(팀 이름) |
| `GET /api/wiki/labels` | `q`(라벨 이름 앞부분) |
| `GET /api/wiki/spaces/{spaceId}/pages/search` | `q`(제목, 필수) |

## 멱등성

| 메서드 | 규칙 |
|---|---|
| `GET` | 부작용 없음. 단, `POST /api/wiki/pages/{id}/views`처럼 조회수를 올리는 것은 POST로 분리돼 있다. |
| `PUT` | 리소스 전체를 교체한다. `PUT /api/wiki/pages/{id}`의 `content`는 본문 전체이고, `PUT /api/wiki/pages/{pageId}/labels`의 `labels`는 남길 라벨 전체다(빈 배열이면 모두 뗀다). 별표·감시(`PUT …/star`, `PUT …/watch`)는 여러 번 보내도 결과가 같다. |
| `PATCH` | Org에서만 쓴다(멤버·권한·팀원 역할). 보낸 필드만 바뀐다. |
| `POST` | 생성·동작. 같은 요청을 두 번 보내면 페이지·이슈·댓글이 두 개 생긴다. 멱등 키 헤더는 없으므로 재시도는 클라이언트가 결과를 확인한 뒤 결정한다. |
| `DELETE` | 성공 시 `204`. 이미 없는 대상은 `404`다. |

수정 계열 PUT은 [낙관적 락](./40-concurrency.md)의 `expectedVersion`을 요구한다.
