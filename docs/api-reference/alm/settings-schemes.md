> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Settings Schemes

설정 스킴 정의와 기본 스킴 지정

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/settings/schemes` | [설정 스킴 목록을 조회한다](#get-apialmsettingsschemes) |
| `POST` | `/api/alm/settings/schemes` | [설정 스킴을 만든다](#post-apialmsettingsschemes) |
| `PUT` | `/api/alm/settings/schemes/{id}` | [설정 스킴의 이름과 내용을 수정한다](#put-apialmsettingsschemesid) |
| `DELETE` | `/api/alm/settings/schemes/{id}` | [설정 스킴을 삭제한다](#delete-apialmsettingsschemesid) |
| `POST` | `/api/alm/settings/schemes/{id}/default` | [기본 설정 스킴을 지정한다](#post-apialmsettingsschemesiddefault) |
| `GET` | `/api/alm/settings/schemes/{id}/projects/count` | [이 스킴을 쓰는 프로젝트 수를 조회한다](#get-apialmsettingsschemesidprojectscount) |

## GET /api/alm/settings/schemes

설정 스킴 목록을 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SchemeResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `SchemeResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `string` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].isDefault` | `boolean` |  |  |  |
| `[].body` | `SettingsBody` |  |  |  |
| `[].body.statuses` | `WorkflowStatus[]` |  |  |  |
| `[].body.statuses[].id` | `string` |  |  |  |
| `[].body.statuses[].name` | `string` |  |  |  |
| `[].body.statuses[].category` | `string` |  |  |  |
| `[].body.statuses[].order` | `integer(int32)` |  |  |  |
| `[].body.statuses[].kind` | `string` |  |  |  |
| `[].body.statuses[].color` | `string` |  |  |  |
| `[].body.statuses[].icon` | `string` |  |  |  |
| `[].body.transitions` | `Transition[]` |  |  |  |
| `[].body.transitions[].id` | `string` |  |  |  |
| `[].body.transitions[].name` | `string` |  |  |  |
| `[].body.transitions[].from` | `string[]` |  |  |  |
| `[].body.transitions[].to` | `string` |  |  |  |
| `[].body.layout` | `map<string, Point>` |  |  |  |
| `[].body.enabledTypes` | `string[]` |  |  |  |
| `[].body.enabledPriorities` | `string[]` |  |  |  |
| `[].body.defaultPriority` | `string` |  |  |  |
| `[].body.fields` | `FieldConfig[]` |  |  |  |
| `[].body.fields[].id` | `string` |  |  |  |
| `[].body.fields[].visible` | `boolean` |  |  |  |
| `[].body.fields[].required` | `boolean` |  |  |  |
| `[].body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/schemes" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/schemes

설정 스킴을 만든다

### 요청 본문

`application/json` — `SchemeCreateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `SchemeResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**201 본문** — `SchemeResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |
| `body` | `SettingsBody` |  |  |  |
| `body.statuses` | `WorkflowStatus[]` |  |  |  |
| `body.statuses[].id` | `string` |  |  |  |
| `body.statuses[].name` | `string` |  |  |  |
| `body.statuses[].category` | `string` |  |  |  |
| `body.statuses[].order` | `integer(int32)` |  |  |  |
| `body.statuses[].kind` | `string` |  |  |  |
| `body.statuses[].color` | `string` |  |  |  |
| `body.statuses[].icon` | `string` |  |  |  |
| `body.transitions` | `Transition[]` |  |  |  |
| `body.transitions[].id` | `string` |  |  |  |
| `body.transitions[].name` | `string` |  |  |  |
| `body.transitions[].from` | `string[]` |  |  |  |
| `body.transitions[].to` | `string` |  |  |  |
| `body.layout` | `map<string, Point>` |  |  |  |
| `body.enabledTypes` | `string[]` |  |  |  |
| `body.enabledPriorities` | `string[]` |  |  |  |
| `body.defaultPriority` | `string` |  |  |  |
| `body.fields` | `FieldConfig[]` |  |  |  |
| `body.fields[].id` | `string` |  |  |  |
| `body.fields[].visible` | `boolean` |  |  |  |
| `body.fields[].required` | `boolean` |  |  |  |
| `body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/schemes" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string"
  }'
```

## PUT /api/alm/settings/schemes/{id}

설정 스킴의 이름과 내용을 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 요청 본문

`application/json` — `SchemeUpdateRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `body` | `SettingsBody` |  |  |  |
| `body.statuses` | `WorkflowStatus[]` |  |  |  |
| `body.statuses[].id` | `string` |  |  |  |
| `body.statuses[].name` | `string` |  |  |  |
| `body.statuses[].category` | `string` |  |  |  |
| `body.statuses[].order` | `integer(int32)` |  |  |  |
| `body.statuses[].kind` | `string` |  |  |  |
| `body.statuses[].color` | `string` |  |  |  |
| `body.statuses[].icon` | `string` |  |  |  |
| `body.transitions` | `Transition[]` |  |  |  |
| `body.transitions[].id` | `string` |  |  |  |
| `body.transitions[].name` | `string` |  |  |  |
| `body.transitions[].from` | `string[]` |  |  |  |
| `body.transitions[].to` | `string` |  |  |  |
| `body.layout` | `map<string, Point>` |  |  |  |
| `body.enabledTypes` | `string[]` |  |  |  |
| `body.enabledPriorities` | `string[]` |  |  |  |
| `body.defaultPriority` | `string` |  |  |  |
| `body.fields` | `FieldConfig[]` |  |  |  |
| `body.fields[].id` | `string` |  |  |  |
| `body.fields[].visible` | `boolean` |  |  |  |
| `body.fields[].required` | `boolean` |  |  |  |
| `body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `SchemeResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `SchemeResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` |  |  |  |
| `name` | `string` |  |  |  |
| `isDefault` | `boolean` |  |  |  |
| `body` | `SettingsBody` |  |  |  |
| `body.statuses` | `WorkflowStatus[]` |  |  |  |
| `body.statuses[].id` | `string` |  |  |  |
| `body.statuses[].name` | `string` |  |  |  |
| `body.statuses[].category` | `string` |  |  |  |
| `body.statuses[].order` | `integer(int32)` |  |  |  |
| `body.statuses[].kind` | `string` |  |  |  |
| `body.statuses[].color` | `string` |  |  |  |
| `body.statuses[].icon` | `string` |  |  |  |
| `body.transitions` | `Transition[]` |  |  |  |
| `body.transitions[].id` | `string` |  |  |  |
| `body.transitions[].name` | `string` |  |  |  |
| `body.transitions[].from` | `string[]` |  |  |  |
| `body.transitions[].to` | `string` |  |  |  |
| `body.layout` | `map<string, Point>` |  |  |  |
| `body.enabledTypes` | `string[]` |  |  |  |
| `body.enabledPriorities` | `string[]` |  |  |  |
| `body.defaultPriority` | `string` |  |  |  |
| `body.fields` | `FieldConfig[]` |  |  |  |
| `body.fields[].id` | `string` |  |  |  |
| `body.fields[].visible` | `boolean` |  |  |  |
| `body.fields[].required` | `boolean` |  |  |  |
| `body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/settings/schemes/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "body": {
      "statuses": [],
      "transitions": [],
      "layout": {
        "key": {
          "x": 0,
          "y": 0
        }
      },
      "enabledTypes": [
        "string"
      ],
      "enabledPriorities": [
        "string"
      ],
      "defaultPriority": "string",
      "fields": [],
      "fieldsByType": {
        "key": []
      }
    }
  }'
```

## DELETE /api/alm/settings/schemes/{id}

설정 스킴을 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/alm/settings/schemes/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/settings/schemes/{id}/default

기본 설정 스킴을 지정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/settings/schemes/<id>/default" \
  -H "Authorization: Bearer chanho_pat_…"
```

## GET /api/alm/settings/schemes/{id}/projects/count

이 스킴을 쓰는 프로젝트 수를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `string` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `map<string, integer(int64)>` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/settings/schemes/<id>/projects/count" \
  -H "Authorization: Bearer chanho_pat_…"
```
