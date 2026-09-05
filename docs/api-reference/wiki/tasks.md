> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Tasks

본문 체크박스에서 뽑아낸 액션 아이템.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `PUT` | `/api/wiki/pages/{pageId}/tasks/{lineNo}` | [본문의 체크박스를 체크하거나 해제한다 — 본문 편집이라 리비전이 남는다](#put-apiwikipagespageidtaskslineno) |
| `GET` | `/api/wiki/tasks/mine` | [나에게 할당된 액션 아이템을 조회한다](#get-apiwikitasksmine) |

## PUT /api/wiki/pages/{pageId}/tasks/{lineNo}

본문의 체크박스를 체크하거나 해제한다 — 본문 편집이라 리비전이 남는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |
| `lineNo` | path | `integer(int32)` | 예 | 본문에서 그 체크박스가 있는 줄 번호 |

### 요청 본문

`application/json` — `DoneRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `done` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TaskView` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TaskView`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `assigneeId` | `integer(int64)` |  |  |  |
| `done` | `boolean` |  |  |  |
| `dueDate` | `string` |  |  |  |
| `lineNo` | `integer(int32)` |  |  |  |
| `pageId` | `integer(int64)` |  |  |  |
| `pageTitle` | `string` |  |  |  |
| `spaceId` | `integer(int64)` |  |  |  |
| `spaceName` | `string` |  |  |  |
| `text` | `string` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<pageId>/tasks/<lineNo>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "done": false
  }'
```

## GET /api/wiki/tasks/mine

나에게 할당된 액션 아이템을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `done` | query | `boolean` |  | true면 이미 완료한 항목을 돌려준다 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `TaskView[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `TaskView[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].assigneeId` | `integer(int64)` |  |  |  |
| `[].done` | `boolean` |  |  |  |
| `[].dueDate` | `string` |  |  |  |
| `[].lineNo` | `integer(int32)` |  |  |  |
| `[].pageId` | `integer(int64)` |  |  |  |
| `[].pageTitle` | `string` |  |  |  |
| `[].spaceId` | `integer(int64)` |  |  |  |
| `[].spaceName` | `string` |  |  |  |
| `[].text` | `string` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/tasks/mine" \
  -H "Authorization: Bearer chanho_pat_…"
```
