# 첨부 파일

WIKI 페이지와 ALM 이슈에는 파일을 붙일 수 있고, Org에는 내 아바타 업로드가 있다. 이 문서는 multipart 업로드, WIKI의 임시 업로드와 확정(confirm) 2단계, 내려받기와 인라인 표시, 그리고 코드에 명시된 크기·타입 제한을 다룬다. 엔드포인트별 응답 필드는 [WIKI Attachments](../api-reference/wiki/attachments.md), [ALM Attachments](../api-reference/alm/attachments.md), [Org Avatars](../api-reference/org/avatars.md)에 있다.

## 한눈에 보기

| 영역 | 업로드 | 목록 | 내려받기 | 인라인 | 삭제 |
|---|---|---|---|---|---|
| WIKI 페이지 | `POST /api/wiki/pages/{pageId}/attachments` | `GET /api/wiki/pages/{pageId}/attachments` | `GET /api/wiki/attachments/{id}` | `GET /api/wiki/attachments/{id}/inline` | `DELETE /api/wiki/attachments/{id}` |
| ALM 이슈 | `POST /api/alm/issues/{issueId}/attachments` | `GET /api/alm/issues/{issueId}/attachments` | `GET /api/alm/attachments/{id}` | `GET /api/alm/attachments/{id}/inline` | `DELETE /api/alm/attachments/{id}` |
| Org 아바타 | `PUT /api/org/me/avatar` | — | `GET /api/org/members/{memberId}/avatar` | (같은 경로) | `DELETE /api/org/me/avatar` |

업로드는 모두 `multipart/form-data`이고 파일 파트 이름은 **`file`**이다. `Content-Type` 헤더를 직접 쓰지 말고 HTTP 클라이언트가 boundary를 붙이게 둔다. 레퍼런스의 ALM 첨부·Org 아바타 페이지는 요청 본문을 `application/json — object`로 표기하지만(생성기가 파일 파트를 그렇게 옮긴다), 실제 요청은 WIKI와 같은 multipart다.

## WIKI 첨부 올리기

가장 단순한 경우는 한 번의 POST로 끝난다. 응답은 `AttachmentResponse`다.

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -F "file=@./배포절차.pdf" \
  "$PLATFORM_HOST/api/wiki/pages/42/attachments"
```

```json
{
  "id": 9,
  "pageId": 42,
  "filename": "배포절차.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 204800,
  "checksumSha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "version": 1
}
```

- `contentType`은 클라이언트가 보낸 값이 아니라 **서버가 파일 내용(매직 바이트)으로 판별**한다. PNG·JPEG·GIF·WebP·PDF만 식별되고, 나머지는 `application/octet-stream`이다.
- **같은 파일 이름으로 다시 올리면 새 첨부가 아니라 새 버전**이 된다(확정된 첨부에 한하며, `pending=true` 업로드는 갈아끼우지 않는다). 응답의 `version`이 2 이상이면 지난 버전이 있다는 뜻이다. 지난 버전은 `GET /api/wiki/attachments/{id}/versions`로 보고, `POST /api/wiki/attachments/{id}/versions/{version}/restore`로 되돌린다.
- `checksumSha256`으로 업로드가 온전한지 확인할 수 있다.

### 2단계 업로드 — `pending`과 `confirm`

에디터처럼 본문을 저장하기 전에 파일을 먼저 올려야 할 때 쓰는 방식이다. 본문 저장 전 사용자가 취소하면 첨부가 남지 않도록 설계돼 있다.

1. `pending=true`로 올린다. 이 첨부는 확정 전까지 정리 대상이다.

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -F "file=@./diagram.png" \
  "$PLATFORM_HOST/api/wiki/pages/42/attachments?pending=true"
# → { "id": 10, … }
```

2. 본문을 저장한다(`PUT /api/wiki/pages/42`, [낙관적 락](./40-concurrency.md) 참고).

3. 본문에 실제로 남은 첨부 ID를 확정한다. 여기 없는 임시 첨부는 정리된다. 응답은 `204`다.

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "attachmentIds": [10] }' \
  "$PLATFORM_HOST/api/wiki/pages/42/attachments/confirm"
```

스크립트에서 파일만 붙이는 경우라면 `pending` 없이 한 번에 올리고 `confirm`은 부르지 않아도 된다.

## WIKI 첨부 내려받기와 인라인

| 경로 | 동작 |
|---|---|
| `GET /api/wiki/attachments/{id}` | 내려받기. `Content-Type`은 첨부의 실제 타입이고 브라우저 인라인 실행은 막는다. |
| `GET /api/wiki/attachments/{id}/inline` | 안전한 타입(`image/png`, `image/jpeg`, `image/gif`, `image/webp`, `application/pdf`)만 인라인으로 준다. 그 밖의 타입은 인라인으로 나가지 않는다. |
| `GET /api/wiki/attachments/{id}/versions/{version}` | 특정 지난 버전을 내려받는다. |

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -o 배포절차.pdf \
  "$PLATFORM_HOST/api/wiki/attachments/9"
```

`<img src>`처럼 브라우저가 직접 여는 곳에는 `Authorization` 헤더를 실을 수 없다. 스크립트에서는 헤더를 붙여 받은 뒤 파일이나 data URL로 다룬다.

## PDF 내보내기

페이지를 PDF로 받는 것은 첨부가 아니라 내보내기 API다.

```bash
curl -s -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -o 배포절차.pdf \
  "$PLATFORM_HOST/api/wiki/pages/42/export.pdf?includeChildren=true"
```

응답은 `application/pdf`이고 `Content-Disposition`은 항상 `attachment`다. `includeChildren=true`면 하위 페이지까지 한 PDF에 이어 붙인다. 자세한 것은 [Export](../api-reference/wiki/export.md).

## ALM 이슈 첨부

WIKI와 같은 multipart 방식이고 확정 단계는 없다. 응답 `AttachmentResponse`의 필드는 WIKI와 다르다(`issueId`, `uploadedBy`, `createdAt`이 있고 버전·체크섬은 없다).

```bash
curl -s -X POST -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -F "file=@./screenshot.png" \
  "$PLATFORM_HOST/api/alm/issues/1024/attachments"
```

```json
{
  "id": 31,
  "issueId": 1024,
  "filename": "screenshot.png",
  "contentType": "image/png",
  "sizeBytes": 48211,
  "uploadedBy": 42,
  "createdAt": "2026-09-04T15:20:00Z"
}
```

내려받기는 `GET /api/alm/attachments/{id}`, 인라인은 `GET /api/alm/attachments/{id}/inline`이며 인라인은 이미지 첨부용이다. 같은 이름을 다시 올려도 버전이 되지 않고 별도 첨부가 생긴다.

## Org 아바타

내 아바타는 `PUT /api/org/me/avatar`에 `file` 파트로 올린다. 응답은 `AvatarView`(`memberId`, `avatarUrl`, `updatedAt`)다. **2MB를 넘으면 400**이다. 다른 멤버의 아바타는 `GET /api/org/members/{memberId}/avatar`로 받으며, 멤버 목록·내 프로필의 `avatarUrl`이 이 경로를 가리킨다(캐시 무효화용 `?v=` 쿼리가 붙는다).

## 크기·타입 제한

| 대상 | 제한 | 근거 |
|---|---|---|
| WIKI 첨부 | 파일 하나·요청 하나당 **20MB** (기본값, 운영자가 바꿀 수 있다) | 서비스 설정 |
| ALM 첨부 | 파일 하나·요청 하나당 **20MB** (기본값, 운영자가 바꿀 수 있다) | 서비스 설정 |
| Org 아바타 | **2MB**, 넘으면 400 | 레퍼런스 |
| WIKI 인라인 표시 | PNG·JPEG·GIF·WebP·PDF만 | 서비스 코드 |

타입 제한은 업로드가 아니라 인라인 표시에만 있다. 어떤 파일이든 올릴 수는 있지만, 이미지·PDF 외에는 내려받기로만 열린다.

## 코드 예시

**JavaScript (Node 20, fetch)** — WIKI 페이지 42에 파일을 올린다.

```javascript
import { openAsBlob } from 'node:fs';

const form = new FormData();
form.append('file', await openAsBlob('./배포절차.pdf'), '배포절차.pdf');

const res = await fetch(`${process.env.PLATFORM_HOST}/api/wiki/pages/42/attachments`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.PLATFORM_TOKEN}` },
  body: form,
});
if (!res.ok) throw new Error(`${res.status} ${(await res.json()).error}`);
const attachment = await res.json();
console.log(attachment.id, attachment.contentType, attachment.sizeBytes);
```

**Python (requests)** — ALM 이슈 1024에 파일을 올리고, WIKI 첨부 9를 내려받는다.

```python
import os

import requests

BASE = os.environ["PLATFORM_HOST"]
HEADERS = {"Authorization": f"Bearer {os.environ['PLATFORM_TOKEN']}"}

with open("screenshot.png", "rb") as f:
    res = requests.post(
        f"{BASE}/api/alm/issues/1024/attachments",
        headers=HEADERS,
        files={"file": ("screenshot.png", f)},
    )
res.raise_for_status()
print(res.json()["id"])

res = requests.get(f"{BASE}/api/wiki/attachments/9", headers=HEADERS)
res.raise_for_status()
with open("배포절차.pdf", "wb") as out:
    out.write(res.content)
```
