> 자동 생성 — 원본은 각 서비스의 컨트롤러 주석. 직접 고치지 말 것

# Export

페이지 PDF 내보내기.

## 엔드포인트

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| `GET` | `/api/wiki/pages/{id}/export.pdf` | [페이지를 PDF로 내보낸다](#get-apiwikipagesidexportpdf) |

## GET /api/wiki/pages/{id}/export.pdf

페이지를 PDF로 내보낸다

### 파라미터

| 이름 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | path | `integer(int64)` | 예 | 페이지 ID |
| `includeChildren` | query | `boolean` |  | 하위 페이지까지 한 PDF에 이어 붙인다 |

### 응답

| 상태 | 설명 | 스키마 |
| --- | --- | --- |
| `200` | PDF 파일. Content-Disposition은 항상 attachment다 | `string(binary)` |
| `401` | 인증 실패 — 토큰 없음·만료·무효 | `PlatformError` |
| `403` | 권한 없음 | `PlatformError` |
| `404` | 대상 없음 | `PlatformError` |
| `503` | 권한 서비스(org) 불능 | `PlatformError` |

### curl

```bash
curl -X GET "https://<your-host>/api/wiki/pages/<id>/export.pdf" \
  -H "Authorization: Bearer chanho_pat_…"
```
