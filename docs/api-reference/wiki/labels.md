> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Labels

페이지 라벨과 백링크.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/labels` | [접근 가능한 스페이스 전체에서 라벨 후보를 찾는다](#get-apiwikilabels) |
| `GET` | `/api/wiki/pages/{pageId}/backlinks` | [이 페이지를 본문에서 링크한 문서를 조회한다](#get-apiwikipagespageidbacklinks) |
| `GET` | `/api/wiki/pages/{pageId}/labels` | [페이지에 붙은 라벨을 조회한다](#get-apiwikipagespageidlabels) |
| `PUT` | `/api/wiki/pages/{pageId}/labels` | [페이지의 라벨을 통째로 교체한다](#put-apiwikipagespageidlabels) |
| `GET` | `/api/wiki/spaces/{spaceId}/labels` | [스페이스에서 쓰인 라벨을 사용 횟수와 함께 조회한다](#get-apiwikispacesspaceidlabels) |
| `GET` | `/api/wiki/spaces/{spaceId}/labels/{name}/pages` | [그 라벨이 붙은 페이지를 조회한다](#get-apiwikispacesspaceidlabelsnamepages) |

## GET /api/wiki/labels

접근 가능한 스페이스 전체에서 라벨 후보를 찾는다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `q` | query | `string` |  | 라벨 이름 앞부분. 비우면 많이 쓰인 순으로 돌려준다 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `LabelCountResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `LabelCountResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 라벨이 붙은 페이지 수 | `12` |
| `[].name` | `string` |  | 라벨 이름 | `배포` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/labels" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/backlinks

이 페이지를 본문에서 링크한 문서를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageTreeItem[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageTreeItem[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].icon` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].parentId` | `integer(int64)` |  |  |  |
| `[].position` | `integer(int64)` |  |  |  |
| `[].status` | `string enum(draft, published)` |  |  |  |
| `[].title` | `string` |  |  |  |
| `[].type` | `string enum(page, folder, blog)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |
| `[].updatedBy` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/backlinks" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/pages/{pageId}/labels

페이지에 붙은 라벨을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `string[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<pageId>/labels" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/wiki/pages/{pageId}/labels

페이지의 라벨을 통째로 교체한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `pageId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `LabelsRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `labels` | `string[]` | 예 | 이 페이지에 남길 라벨 전체. 빈 배열이면 라벨을 모두 뗀다 | `["배포","운영"]` |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `string[]` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X PUT "https://<your-host>/api/wiki/pages/<pageId>/labels" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "labels": [
      "배포",
      "운영"
    ]
  }'
```

## GET /api/wiki/spaces/{spaceId}/labels

스페이스에서 쓰인 라벨을 사용 횟수와 함께 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `LabelCountResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `LabelCountResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].count` | `integer(int64)` |  | 그 라벨이 붙은 페이지 수 | `12` |
| `[].name` | `string` |  | 라벨 이름 | `배포` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/labels" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/wiki/spaces/{spaceId}/labels/{name}/pages

그 라벨이 붙은 페이지를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `spaceId` | path | `integer(int64)` | 예 |  |
| `name` | path | `string` | 예 | 라벨 이름 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `PageTreeItem[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `PageTreeItem[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].icon` | `string` |  |  |  |
| `[].id` | `integer(int64)` |  |  |  |
| `[].parentId` | `integer(int64)` |  |  |  |
| `[].position` | `integer(int64)` |  |  |  |
| `[].status` | `string enum(draft, published)` |  |  |  |
| `[].title` | `string` |  |  |  |
| `[].type` | `string enum(page, folder, blog)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |
| `[].updatedBy` | `integer(int64)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/spaces/<spaceId>/labels/<name>/pages" \
  -H "Authorization: Bearer chanho_pat_…"
```
