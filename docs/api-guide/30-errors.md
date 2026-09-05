# 오류 처리

모든 오류는 한 가지 JSON 모양으로 온다. 이 문서는 그 공통 계약, 여섯 개의 기본 상태 코드와 각각에 대한 클라이언트의 대응, 엔드포인트별 409 사유, 그리고 요청 제한에서 오는 429를 다룬다. 엔드포인트마다 어떤 코드가 나올 수 있는지는 [API 레퍼런스](../api-reference/wiki/README.md)의 "응답" 표에 있다.

## 공통 오류 계약

성공이 아닌 응답의 본문은 `PlatformError` 하나다.

```json
{ "error": "다른 사용자가 먼저 수정했습니다." }
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `error` | `string` (필수) | 사용자에게 보여 줄 수 있는 메시지 |

- WIKI·ALM·Org 서비스의 `error`는 한국어 문장이다. 문장을 파싱해 분기하지 말고 **HTTP 상태 코드로 분기**한다.
- 인증 서버와 게이트웨이의 토큰 오류는 같은 모양이지만 `error`에 기계 코드가 들어간다(`invalid_token`, `auth_unavailable` 등). 목록은 [인증](./10-authentication.md#오류-응답)에 있다.
- 오류 응답의 `Content-Type`은 `application/json`이다. 429만 예외다(아래 참고).

## 상태 코드별 대응

| 코드 | 뜻 | 클라이언트가 할 일 |
|---|---|---|
| `400` | 요청 검증 실패. 필수 필드 누락, 형식 오류(날짜에 시각을 붙임, 스페이스 키에 대문자), 범위 초과 | 재시도하지 않는다. 요청을 고친다. |
| `401` | 인증 실패. 토큰 없음·만료·무효 | 세션 JWT면 갱신 후 한 번 재시도. 개인 API 토큰이면 값·만료·폐기 여부를 확인하고 필요하면 재발급한다. 같은 요청을 반복해도 풀리지 않는다. |
| `403` | 권한 없음. 토큰 주인이 그 스페이스·프로젝트에 권한이 없거나, 계정이 `ACTIVE`가 아니거나, 토큰으로 토큰 관리 API를 불렀다 | 재시도하지 않는다. 권한(grant)을 받거나 다른 계정을 쓴다. |
| `404` | 대상 없음. ID가 틀렸거나, 내가 볼 수 없는 리소스라 존재를 알려 주지 않는다 | 재시도하지 않는다. ID를 다시 확인한다. |
| `409` | 상태 충돌. 낙관적 락 버전 불일치 또는 비즈니스 규칙 위반 | **맹목적으로 재시도하지 않는다.** 아래 표의 사유에 맞게 다시 읽고 판단한다. |
| `503` | 의존 서비스 불능. 권한 서비스(org)나 인증 서버에 닿지 못했다 | 지수 백오프(예: 1초 → 2초 → 4초, 지터 포함)로 몇 번 재시도한다. 반복되면 운영자에게 알린다. |

`503`은 요청이 처리되지 않았다는 뜻이므로 재시도해도 중복이 생기지 않는다. 그 밖의 5xx는 처리 여부를 알 수 없으니 POST는 결과를 조회한 뒤 재시도한다.

## 409 사유

409는 엔드포인트마다 이유가 정해져 있다. 각 페이지의 "응답" 표에 설명이 적혀 있다.

| 엔드포인트 | 사유 | 다음 행동 |
|---|---|---|
| `PUT /api/wiki/pages/{id}` | `expectedVersion` 불일치 ([Pages](../api-reference/wiki/pages.md)) | 다시 GET해서 새 `version`으로 병합 후 PUT |
| `PUT /api/alm/issues/{issueId}` | `expectedVersion` 불일치 ([Issues](../api-reference/alm/issues.md)) | 위와 같다 |
| `PUT /api/alm/projects/{projectId}` | `expectedVersion` 불일치 ([Projects](../api-reference/alm/projects.md)) | 위와 같다 |
| `PUT /api/alm/sprints/{sprintId}` | `expectedVersion` 불일치 ([Sprints](../api-reference/alm/sprints.md)) | 위와 같다 |
| `PUT /api/alm/versions/{versionId}` | `expectedVersion` 불일치 ([Versions](../api-reference/alm/versions.md)) | 위와 같다 |
| `PATCH /api/org/grants/{id}` | 마지막 전역 관리자는 내릴 수 없다 ([Grants](../api-reference/org/grants.md)) | 다른 관리자를 먼저 세운다 |
| `PATCH /api/org/members/{id}` | 허용되지 않는 상태 전이(자기 계정 비활성화, 마지막 전역 관리자 정지 등) ([Members](../api-reference/org/members.md)) | 규칙을 확인한다 |
| `POST /api/org/members/{id}/approve` | 승인 대기 중인 계정이 아니다 | 멤버 상태를 다시 읽는다 |
| `POST /api/org/invitations` | 이미 활성이거나 정지된 계정의 이메일 ([Invitations](../api-reference/org/invitations.md)) | 그 이메일은 빼고 다시 보낸다 |
| `DELETE /api/org/invitations/{id}` | 대기 중인 초대만 철회할 수 있다 | 초대 상태를 다시 읽는다 |
| `POST /api/org/invitations/{id}/resend` | 이미 수락된 초대 | 할 일 없음 |
| `DELETE /api/wiki/pages/{id}` | 자식이 있는데 `children` 파라미터를 주지 않았다(파라미터 설명 참고) | `children=promote` 또는 `children=cascade`를 붙인다 |
| `POST /api/auth/tokens` | 활성 토큰 25개 초과(`token_limit`) | 안 쓰는 토큰을 폐기한다 |

낙관적 락의 전체 흐름은 [낙관적 락](./40-concurrency.md)에 있다.

## 429 — 요청 제한

개인 API 토큰(`chanho_pat_…`)을 실은 요청이 클라이언트 IP당 초당 20건(순간 40건)을 넘으면 프록시(nginx)가 게이트웨이에 닿기 전에 `429`로 끊는다.

- 본문은 JSON이 아니라 nginx의 기본 HTML 오류 페이지다. `{"error": …}`를 기대하고 파싱하면 실패하니 상태 코드를 먼저 본다.
- `Retry-After` 헤더는 **없다**. 클라이언트가 스스로 간격을 둔다(1초 정도 쉬고 재시도, 반복되면 동시성을 줄인다).
- 세부와 대응 코드는 [요청 제한](./70-rate-limits.md)에 있다.

## 오류 본문 예시

400 — 필수 필드 누락:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{ "error": "요청 값이 올바르지 않습니다" }
```

401 — 토큰 무효(게이트웨이):

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{ "error": "invalid_token" }
```

403 — 권한 없음:

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{ "error": "권한이 없습니다" }
```

404 — 대상 없음:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{ "error": "이슈를 찾을 수 없습니다" }
```

409 — 버전 충돌:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{ "error": "다른 사용자가 먼저 수정했습니다." }
```

503 — 권한 서비스 불능:

```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{ "error": "권한 서비스에 연결할 수 없습니다" }
```

메시지 문구는 서비스와 상황에 따라 달라진다. 위 예시 문구를 코드에서 비교하지 않는다.

## 처리 골격

상태 코드로 분기하는 최소 골격이다. 재시도는 503과 429에만 건다.

```javascript
async function call(path, init = {}, attempt = 0) {
  const res = await fetch(`${process.env.PLATFORM_HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PLATFORM_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (res.ok) return res.status === 204 ? null : res.json();

  if ((res.status === 503 || res.status === 429) && attempt < 3) {
    const wait = 1000 * 2 ** attempt + Math.random() * 250;
    await new Promise((r) => setTimeout(r, wait));
    return call(path, init, attempt + 1);
  }

  let message = res.statusText;
  if ((res.headers.get('content-type') ?? '').includes('application/json')) {
    message = (await res.json()).error;
  }
  throw new Error(`${res.status} ${message}`);
}
```

```python
import os
import random
import time

import requests

BASE = os.environ["PLATFORM_HOST"]
HEADERS = {"Authorization": f"Bearer {os.environ['PLATFORM_TOKEN']}"}


def call(method, path, attempt=0, **kwargs):
    res = requests.request(method, f"{BASE}{path}", headers=HEADERS, **kwargs)
    if res.ok:
        return None if res.status_code == 204 else res.json()

    if res.status_code in (503, 429) and attempt < 3:
        time.sleep(2 ** attempt + random.random() * 0.25)
        return call(method, path, attempt + 1, **kwargs)

    message = res.reason
    if "application/json" in res.headers.get("content-type", ""):
        message = res.json()["error"]
    raise RuntimeError(f"{res.status_code} {message}")
```
