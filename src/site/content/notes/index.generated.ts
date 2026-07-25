// 생성 파일 — scripts/sync-notes.mjs 가 만든다. 직접 수정하지 말 것.
import type { NoteMeta } from '../../types';

export const noteIndex: NoteMeta[] = [
  {"id":"00","title":"MSA_TEMPLATE — 전체 구조 개요","tags":["msa","template","개요","인증","sso"],"date":"2026-06-30","status":"정리본"},
  {"id":"01","title":"1단계 — 인증 플랫폼 (Keycloak BFF + 자체 JWT)","tags":["msa","template","인증","keycloak","jwt","oidc"],"date":"2026-06-30","status":"구현 완료"},
  {"id":"02","title":"2단계 — keycloakify 로그인 테마 (platform-react)","tags":["msa","template","keycloak","keycloakify","테마","프론트"],"date":"2026-06-30","status":"구현 완료"},
  {"id":"03","title":"3단계 — board-service (샘플 백엔드 + SSO 증명)","tags":["msa","template","board-service","sso","jwt","jwks","tdd"],"date":"2026-06-30","status":"구현 완료"},
  {"id":"04","title":"4단계 — 프론트 연동 (myFront → board-service)","tags":["msa","template","프론트","react","board","cors"],"date":"2026-06-30","status":"구현 완료"},
  {"id":"05","title":"API 게이트웨이 설계 (설계 원안 · 2026-07-01 구현 완료)","tags":["msa","template","gateway","spring-cloud-gateway","설계","구현완료"],"date":"2026-06-30","status":"구현 완료"},
  {"id":"06","title":"6단계 — 저장소 구조 + 운영 원칙","tags":["msa","template","repo","git","운영","문서정책"],"date":"2026-06-30","status":"정리 완료"},
  {"id":"07","title":"7단계 — 전체 보안 감사 + 하드닝","tags":["msa","template","security","hardening","jwt","keycloak","gateway"],"date":"2026-07-02","status":"코드 완료"},
  {"id":"08","title":"8단계 — 게이트웨이 트래픽 제어 + JWT 조기차단","tags":["msa","template","gateway","ratelimit","resilience","jwt","security"],"date":"2026-07-03","status":"코드 완료"},
  {"id":"09","title":"9단계 — 유레카 서비스 디스커버리 (lb:// 전환)","tags":["msa","template","eureka","service-discovery","loadbalancer","gateway"],"date":"2026-07-05","status":"완료"},
  {"id":"10","title":"게이트웨이 동작 흐름 코드 워크스루","tags":["msa","template","gateway","webflux","security","resilience","코드분석"],"date":"2026-07-05","status":"학습 노트"},
  {"id":"11","title":"nginx 통합배포 + 3앱 SSO (2026-07-14)","tags":["msa","template","nginx","sso","keycloak","oidc","returnTo","react","구현기록"],"date":"2026-07-14","status":"구현 완료"},
  {"id":"12","title":"크로스앱 내비게이션 + redirect_uri 사건 + 운영 전환 로드맵 (2026-07-15)","tags":["msa","template","nginx","sso","keycloak","oidc","spring-cloud-gateway","trusted-proxies","운영전환","구현기록"],"date":"2026-07-15","status":"구현·수정 완료"},
  {"id":"13","title":"백엔드 컨테이너화 + compose 통합 — CI/CD Wave 1 (2026-07-15)","tags":["msa","template","docker","compose","ghcr","cicd","keycloak","issuer","구현기록"],"date":"2026-07-17","status":"Wave 1 완료"},
  {"id":"14","title":"전체 구현 심화 해설 — 배경지식으로 읽는 현재 아키텍처 (2026-07-17)","tags":["msa","template","심화해설","oauth2","oidc","jwt","jwks","bff","gateway","eureka","nginx","sso","docker","배경지식"],"date":"2026-07-17","status":"정리본"},
  {"id":"15","title":"ALM·Wiki 백엔드 요구사항 + 서비스 분할 설계 (2026-07-19)","tags":["msa","template","alm","wiki","요구사항","서비스분할","grpc","graphql","kafka","elasticsearch","설계논의"],"date":"2026-07-19","status":"설계 확정"},
  {"id":"16","title":"Wave A: platform-backend·common-proto·org-service 구현기록 (2026-07-19)","tags":["msa","template","alm-wiki","grpc","proto","rbac","github-packages","sdd","구현기록"],"date":"2026-07-19","status":"Wave A 완료"},
  {"id":"17","title":"Wave B: wiki-backend 구현기록 — 과정과 원리 해설 (2026-07-21)","tags":["msa","template","wiki","redis-streams","grpc","낙관적잠금","리비전","구현기록","해설"],"date":"2026-07-21","status":"Wave B 완료"},
  {"id":"18","title":"배포 로그인·로그아웃 사건 — KC iss-호스트 대조와 split-horizon의 한계 (2026-07-19)","tags":["msa","template","keycloak","oidc","split-horizon","userinfo","backchannel-logout","kc-hostname","구현기록","사건기록"],"date":"2026-07-19","status":"해결 완료"},
  {"id":"19","title":"게이트웨이 평가 + rate-limit XFF 수정 + Loki 로그 관측 스택 (2026-07-20)","tags":["msa","template","gateway","ratelimit","x-forwarded-for","logging","observability","loki","alloy","grafana","구현기록"],"date":"2026-07-20","status":"완료"},
];
