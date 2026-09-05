# 요청 제한

개인 API 토큰으로 보내는 요청에는 프록시 단계의 초당 제한이 있다. 이 문서는 그 숫자와 키(무엇을 기준으로 세는지), 429 응답의 모양, 클라이언트가 지켜야 할 대응을 다룬다.

## 숫자

| 항목 | 값 |
|---|---|
| 대상 | `Authorization: Bearer chanho_pat_…`(개인 API 토큰)를 실은 요청 |
| 키 | **클라이언트 IP** 하나당 |
| 정상 속도 | 초당 20건 |
| 순간 허용(burst) | 40건까지 대기 없이 통과 |
| 초과 시 | 즉시 `429 Too Many Requests` (지연시키지 않고 끊는다) |
| 적용 경로 | `/api/**` 전부(게이트웨이 앞 nginx에서 판정) |

토큰이 없는 요청과 브라우저 세션 JWT 요청은 이 규칙의 키가 비어 있어 **여기서는 세지 않는다**. 게이트웨이에는 별도의 일반 제한이 있으며 그 값은 이 문서 범위 밖이다.

같은 IP에서 여러 자동화가 같은 시간에 돌면 합산된다. NAT 뒤의 사무실이나 CI 러너 풀처럼 여러 클라이언트가 한 IP를 공유하면 각자의 속도가 낮아도 합계가 걸릴 수 있다.

## 429 응답의 모양

- 본문은 nginx의 기본 HTML 오류 페이지다. JSON `{"error": …}`가 **아니다**.
- `Retry-After` 헤더는 **보내지 않는다**.
- 요청은 게이트웨이와 서비스에 닿지 않았으므로 처리되지 않았다. 재시도해도 중복이 생기지 않는다.

## 클라이언트 대응

1. **상태 코드로 판정한다.** 본문을 JSON으로 파싱하기 전에 `429`인지 본다.
2. **짧게 쉬고 재시도한다.** 1초 정도 기다린 뒤 다시 보내고, 반복되면 간격을 두 배씩 늘린다(지터 포함). 서너 번 넘게 계속되면 동시성이 너무 높은 것이니 병렬 수를 줄인다.
3. **평소 속도를 초당 20건 아래로 유지한다.** 대량 작업(이관·일괄 수정)은 요청 사이에 50ms 이상 간격을 두거나 동시 요청 수를 제한한다.
4. **목록은 페이지 크기를 키운다.** 이슈 검색은 `size` 상한 200, 멤버 페이지는 `size=100`처럼 크게 받아 요청 수를 줄인다([요청·응답 규약](./20-conventions.md#목록과-페이지네이션)).
5. **토큰 확인 결과는 게이트웨이가 60초 캐시한다.** 같은 토큰으로 이어 보내는 요청은 인증 서버 왕복이 없으므로, 제한은 순전히 요청 횟수 문제다.

**JavaScript** — 동시성을 제한하는 최소 골격:

```javascript
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

// 한 번에 5개씩만 — 초당 20건 아래로 유지된다
const pages = await mapLimit(pageIds, 5, (id) => api(`/api/wiki/pages/${id}`));
```

**Python** — 429면 잠깐 쉬고 다시 보내는 골격:

```python
import random
import time


def api_with_backoff(method, path, attempts=4, **kwargs):
    for attempt in range(attempts):
        try:
            return api(method, path, **kwargs)
        except RuntimeError as err:
            if not str(err).startswith("429") or attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt + random.random() * 0.25)
    raise RuntimeError("unreachable")
```

`api`는 [WIKI 예제의 공통 준비](./60-cookbook-wiki.md#공통-준비)에 있는 헬퍼다.
