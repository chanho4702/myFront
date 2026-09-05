> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Dashboards

대시보드와 가젯 배치

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/alm/dashboards` | [내 대시보드와 공유된 대시보드를 조회한다](#get-apialmdashboards) |
| `POST` | `/api/alm/dashboards` | [대시보드를 만든다](#post-apialmdashboards) |
| `GET` | `/api/alm/dashboards/{id}` | [대시보드 하나를 조회한다](#get-apialmdashboardsid) |
| `PUT` | `/api/alm/dashboards/{id}` | [대시보드 이름·공유 여부·가젯 배치를 수정한다](#put-apialmdashboardsid) |
| `DELETE` | `/api/alm/dashboards/{id}` | [대시보드를 삭제한다](#delete-apialmdashboardsid) |

## GET /api/alm/dashboards

내 대시보드와 공유된 대시보드를 조회한다

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `DashboardResponse[]` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**200 본문** — `DashboardResponse[]`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `[].id` | `integer(int64)` |  |  |  |
| `[].ownerId` | `integer(int64)` |  |  |  |
| `[].name` | `string` |  |  |  |
| `[].shared` | `boolean` |  |  |  |
| `[].gadgets` | `map<string, any>[]` |  |  |  |
| `[].createdAt` | `string(date-time)` |  |  |  |
| `[].updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/dashboards" \
  -H "Authorization: Bearer chanho_pat_…"
```

## POST /api/alm/dashboards

대시보드를 만든다

### 요청 본문

`application/json` — `DashboardRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `shared` | `boolean` |  |  |  |
| `gadgets` | `map<string, any>[]` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `201` | Created | `DashboardResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |

**201 본문** — `DashboardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `ownerId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `shared` | `boolean` |  |  |  |
| `gadgets` | `map<string, any>[]` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X POST "https://<your-host>/api/alm/dashboards" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "shared": false,
    "gadgets": [
      {
        "key": null
      }
    ]
  }'
```

## GET /api/alm/dashboards/{id}

대시보드 하나를 조회한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `DashboardResponse` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `DashboardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `ownerId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `shared` | `boolean` |  |  |  |
| `gadgets` | `map<string, any>[]` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X GET "https://<your-host>/api/alm/dashboards/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```

## PUT /api/alm/dashboards/{id}

대시보드 이름·공유 여부·가젯 배치를 수정한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 요청 본문

`application/json` — `DashboardRequest` (필수)

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  |  |
| `shared` | `boolean` |  |  |  |
| `gadgets` | `map<string, any>[]` |  |  |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | OK | `DashboardResponse` |
| `400` | 요청 검증 실패 | `PlatformError` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

**200 본문** — `DashboardResponse`

| 필드 | 타입 | 필수 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `integer(int64)` |  |  |  |
| `ownerId` | `integer(int64)` |  |  |  |
| `name` | `string` |  |  |  |
| `shared` | `boolean` |  |  |  |
| `gadgets` | `map<string, any>[]` |  |  |  |
| `createdAt` | `string(date-time)` |  |  |  |
| `updatedAt` | `string(date-time)` |  |  |  |

### curl

```bash
curl -X PUT "https://<your-host>/api/alm/dashboards/<id>" \
  -H "Authorization: Bearer chanho_pat_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "shared": false,
    "gadgets": [
      {
        "key": null
      }
    ]
  }'
```

## DELETE /api/alm/dashboards/{id}

대시보드를 삭제한다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 |  |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `204` | No Content |  |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |

### curl

```bash
curl -X DELETE "https://<your-host>/api/alm/dashboards/<id>" \
  -H "Authorization: Bearer chanho_pat_…"
```
