// API 레퍼런스 수집 대상 서비스 선언. 컨테이너 포트는 호스트에 열려 있지 않으므로
// 컴포즈 네트워크 안에서 curl 컨테이너를 띄워 `/v3/api-docs` 를 받는다(collect-openapi.mjs).
//
//  id     스펙 파일명(scripts/api/specs/<id>.json)·문서 디렉터리(docs/api-reference/<id>/)·컬렉션 폴더 키
//  title  문서 제목(README H1·위키 폴더 제목). 서비스의 OpenAPI info.title 과 같게 유지한다
//  host   컴포즈 서비스 이름(컨테이너 DNS)
//  port   컨테이너 안에서 듣는 포트(호스트 포트가 아니다)

/** 컴포즈 프로젝트 `platform` 의 기본 네트워크 — `docker network ls` 로 확인(2026-09-05). */
export const COMPOSE_NETWORK = 'platform_default';

/** 스펙을 받아오는 curl 이미지. 태그를 고정해 실행마다 같은 도구를 쓴다. */
export const CURL_IMAGE = 'curlimages/curl:8.11.1';

export const OPENAPI_PATH = '/v3/api-docs';

export const SERVICES = [
  { id: 'wiki', title: 'WIKI API', host: 'wiki-backend', port: 9110 },
  { id: 'alm', title: 'ALM API', host: 'alm-backend', port: 9120 },
  { id: 'org', title: 'Org API', host: 'org-service', port: 9130 },
];

export const serviceById = (id) => SERVICES.find((s) => s.id === id) ?? null;

/** `--only=wiki,alm` 처럼 쉼표 목록을 서비스 배열로. 모르는 id 는 즉시 오류. */
export function selectServices(only) {
  if (!only) return SERVICES;
  const ids = only.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = ids.filter((id) => !serviceById(id));
  if (unknown.length) throw new Error(`모르는 서비스 id: ${unknown.join(', ')} (가능: ${SERVICES.map((s) => s.id).join(', ')})`);
  return ids.map(serviceById);
}
