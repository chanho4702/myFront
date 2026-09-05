> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Project Settings

프로젝트에 적용되는 설정 스킴과 개별 재정의

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/projects/{projectId}/settings` | [프로젝트에 실제로 적용된 설정을 조회한다](#get-apialmprojectsprojectidsettings) |
| `PUT` | `/api/alm/projects/{projectId}/settings/custom` | [프로젝트 설정 재정의를 켜고 끈다](#put-apialmprojectsprojectidsettingscustom) |
| `PUT` | `/api/alm/projects/{projectId}/settings/custom-body` | [프로젝트 설정 재정의 내용을 저장한다](#put-apialmprojectsprojectidsettingscustom-body) |
| `PUT` | `/api/alm/projects/{projectId}/settings/scheme` | [프로젝트에 설정 스킴을 지정한다](#put-apialmprojectsprojectidsettingsscheme) |

## GET /api/alm/projects/{projectId}/settings

프로젝트에 실제로 적용된 설정을 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ResolvedSettingsResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ResolvedSettingsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
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
| `source` | `string` |  |  |  |
| `scheme` | `SchemeResponse` |  |  |  |
| `scheme.id` | `string` |  |  |  |
| `scheme.name` | `string` |  |  |  |
| `scheme.isDefault` | `boolean` |  |  |  |
| `scheme.body` | `SettingsBody` |  |  |  |
| `scheme.body.statuses` | `WorkflowStatus[]` |  |  |  |
| `scheme.body.transitions` | `Transition[]` |  |  |  |
| `scheme.body.layout` | `map<string, Point>` |  |  |  |
| `scheme.body.enabledTypes` | `string[]` |  |  |  |
| `scheme.body.enabledPriorities` | `string[]` |  |  |  |
| `scheme.body.defaultPriority` | `string` |  |  |  |
| `scheme.body.fields` | `FieldConfig[]` |  |  |  |
| `scheme.body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/projects/<projectId>/settings" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/projects/{projectId}/settings/custom

프로젝트 설정 재정의를 켜고 끈다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `CustomRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `custom` | `boolean` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ResolvedSettingsResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ResolvedSettingsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
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
| `source` | `string` |  |  |  |
| `scheme` | `SchemeResponse` |  |  |  |
| `scheme.id` | `string` |  |  |  |
| `scheme.name` | `string` |  |  |  |
| `scheme.isDefault` | `boolean` |  |  |  |
| `scheme.body` | `SettingsBody` |  |  |  |
| `scheme.body.statuses` | `WorkflowStatus[]` |  |  |  |
| `scheme.body.transitions` | `Transition[]` |  |  |  |
| `scheme.body.layout` | `map<string, Point>` |  |  |  |
| `scheme.body.enabledTypes` | `string[]` |  |  |  |
| `scheme.body.enabledPriorities` | `string[]` |  |  |  |
| `scheme.body.defaultPriority` | `string` |  |  |  |
| `scheme.body.fields` | `FieldConfig[]` |  |  |  |
| `scheme.body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/projects/<projectId>/settings/custom" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "custom": false
  }'
```

## PUT /api/alm/projects/{projectId}/settings/custom-body

프로젝트 설정 재정의 내용을 저장한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `SettingsBody` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `statuses` | `WorkflowStatus[]` |  |  |  |
| `statuses[].id` | `string` |  |  |  |
| `statuses[].name` | `string` |  |  |  |
| `statuses[].category` | `string` |  |  |  |
| `statuses[].order` | `integer(int32)` |  |  |  |
| `statuses[].kind` | `string` |  |  |  |
| `statuses[].color` | `string` |  |  |  |
| `statuses[].icon` | `string` |  |  |  |
| `transitions` | `Transition[]` |  |  |  |
| `transitions[].id` | `string` |  |  |  |
| `transitions[].name` | `string` |  |  |  |
| `transitions[].from` | `string[]` |  |  |  |
| `transitions[].to` | `string` |  |  |  |
| `layout` | `map<string, Point>` |  |  |  |
| `enabledTypes` | `string[]` |  |  |  |
| `enabledPriorities` | `string[]` |  |  |  |
| `defaultPriority` | `string` |  |  |  |
| `fields` | `FieldConfig[]` |  |  |  |
| `fields[].id` | `string` |  |  |  |
| `fields[].visible` | `boolean` |  |  |  |
| `fields[].required` | `boolean` |  |  |  |
| `fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ResolvedSettingsResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ResolvedSettingsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
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
| `source` | `string` |  |  |  |
| `scheme` | `SchemeResponse` |  |  |  |
| `scheme.id` | `string` |  |  |  |
| `scheme.name` | `string` |  |  |  |
| `scheme.isDefault` | `boolean` |  |  |  |
| `scheme.body` | `SettingsBody` |  |  |  |
| `scheme.body.statuses` | `WorkflowStatus[]` |  |  |  |
| `scheme.body.transitions` | `Transition[]` |  |  |  |
| `scheme.body.layout` | `map<string, Point>` |  |  |  |
| `scheme.body.enabledTypes` | `string[]` |  |  |  |
| `scheme.body.enabledPriorities` | `string[]` |  |  |  |
| `scheme.body.defaultPriority` | `string` |  |  |  |
| `scheme.body.fields` | `FieldConfig[]` |  |  |  |
| `scheme.body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/projects/<projectId>/settings/custom-body" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "statuses": [
      {
        "id": "string",
        "name": "string",
        "category": "string",
        "order": 0,
        "kind": "string",
        "color": "string",
        "icon": "string"
      }
    ],
    "transitions": [
      {
        "id": "string",
        "name": "string",
        "from": [],
        "to": "string"
      }
    ],
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
    "fields": [
      {
        "id": "string",
        "visible": false,
        "required": false
      }
    ],
    "fieldsByType": {
      "key": [
        {
          "id": "string",
          "visible": false,
          "required": false
        }
      ]
    }
  }'
```

## PUT /api/alm/projects/{projectId}/settings/scheme

프로젝트에 설정 스킴을 지정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `projectId` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `AssignRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `schemeId` | `string` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `ResolvedSettingsResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

**200 본문** — `ResolvedSettingsResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
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
| `source` | `string` |  |  |  |
| `scheme` | `SchemeResponse` |  |  |  |
| `scheme.id` | `string` |  |  |  |
| `scheme.name` | `string` |  |  |  |
| `scheme.isDefault` | `boolean` |  |  |  |
| `scheme.body` | `SettingsBody` |  |  |  |
| `scheme.body.statuses` | `WorkflowStatus[]` |  |  |  |
| `scheme.body.transitions` | `Transition[]` |  |  |  |
| `scheme.body.layout` | `map<string, Point>` |  |  |  |
| `scheme.body.enabledTypes` | `string[]` |  |  |  |
| `scheme.body.enabledPriorities` | `string[]` |  |  |  |
| `scheme.body.defaultPriority` | `string` |  |  |  |
| `scheme.body.fields` | `FieldConfig[]` |  |  |  |
| `scheme.body.fieldsByType` | `map<string, FieldConfig[]>` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/projects/<projectId>/settings/scheme" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": "string"
  }'
```
