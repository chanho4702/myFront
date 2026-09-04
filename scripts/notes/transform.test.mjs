import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isWhitelisted,
  noteIdOf,
  parseFrontmatter,
  extractTitle,
  transformWikiLinks,
  siteNoteHref,
  transformCallouts,
  stripNumberPrefix,
  statusLabel,
} from './transform.mjs';

test('화이트리스트는 두 자리 번호로 시작하는 파일만 통과시킨다', () => {
  assert.equal(isWhitelisted('00 개요 — 전체 구조.md'), true);
  assert.equal(isWhitelisted('19 게이트웨이 평가 + rate-limit XFF 수정 (2026-07-20).md'), true);
  assert.equal(isWhitelisted('auth-server 면접 방어 시트 — 쉬운 말 버전 (2026-07-19).md'), false);
  assert.equal(isWhitelisted('내 목표.md'), false);
  assert.equal(isWhitelisted('7 한자리.md'), false);
  assert.equal(isWhitelisted('00 확장자없음'), false);
});

test('노트 id 는 앞 두 자리다', () => {
  assert.equal(noteIdOf('07 보안 감사 + 하드닝 (2026-07-02).md'), '07');
  assert.equal(noteIdOf('내 목표.md'), null);
});

test('frontmatter 를 파싱하고 본문에서 떼어낸다', () => {
  const raw = [
    '---',
    'tags: [msa, template, 개요]',
    '작성일: 2026-06-30',
    '상태: 정리본',
    '---',
    '',
    '# 제목',
    '본문',
  ].join('\n');
  const { meta, body } = parseFrontmatter(raw);
  assert.deepEqual(meta.tags, ['msa', 'template', '개요']);
  assert.equal(meta['작성일'], '2026-06-30');
  assert.equal(meta['상태'], '정리본');
  assert.equal(body.startsWith('# 제목'), true);
});

test('CRLF 문서도 frontmatter 를 정상 파싱한다', () => {
  // 실제 볼트 22개 중 7개가 CRLF 다. \r 을 안 털면 meta 가 통째로 빈 객체가 된다.
  const raw = '---\r\ntags: [msa, 인증]\r\n작성일: 2026-07-19\r\n상태: 정리본\r\n---\r\n\r\n# 제목\r\n본문';
  const { meta, body } = parseFrontmatter(raw);
  assert.deepEqual(meta.tags, ['msa', '인증']);
  assert.equal(meta['작성일'], '2026-07-19');
  assert.equal(meta['상태'], '정리본');
  assert.equal(body.startsWith('# 제목'), true);
});

test('frontmatter 가 없으면 원문을 그대로 본문으로 돌려준다', () => {
  const { meta, body } = parseFrontmatter('# 제목\n본문');
  assert.deepEqual(meta, {});
  assert.equal(body, '# 제목\n본문');
});

test('본문 첫 H1 을 제목으로 뽑고 본문에서 제거한다', () => {
  const r = extractTitle('# 전체 구조 개요\n\n본문', '00 개요.md');
  assert.equal(r.title, '전체 구조 개요');
  assert.equal(r.body.trim(), '본문');
});

test('H1 이 없으면 파일명에서 번호와 확장자를 뺀 것이 제목이다', () => {
  const r = extractTitle('본문만 있다', '03 board-service (샘플).md');
  assert.equal(r.title, 'board-service (샘플)');
  assert.equal(r.body, '본문만 있다');
});

test('화이트리스트 안 위키링크는 내부 링크가 된다', () => {
  const resolve = (t) => (t === '05 API 게이트웨이 설계' ? '05' : null);
  const r = transformWikiLinks('앞 [[05 API 게이트웨이 설계]] 뒤', resolve);
  assert.equal(r.body, '앞 [05 API 게이트웨이 설계](/tech/notes/05) 뒤');
  assert.deepEqual(r.broken, []);
});

test('별칭과 헤딩 앵커를 처리한다', () => {
  const resolve = (t) => (t === '05 API 게이트웨이 설계' ? '05' : null);
  const r = transformWikiLinks('[[05 API 게이트웨이 설계#라우팅|게이트웨이]]', resolve);
  assert.equal(r.body, '[게이트웨이](/tech/notes/05)');
});

test('별칭 없이 앵커만 있으면 라벨에서 앵커를 뗀다', () => {
  const resolve = (t) => (t === '05 API 게이트웨이 설계' ? '05' : null);
  const r = transformWikiLinks('[[05 API 게이트웨이 설계#라우팅]]', resolve);
  assert.equal(r.body, '[05 API 게이트웨이 설계](/tech/notes/05)');
});

test('링크 목적지는 href 함수가 정한다 — 임포터는 위키 페이지 URL 을 넘긴다', () => {
  const resolve = (t) => (t === '05 API 게이트웨이 설계' ? '05' : null);
  const href = (id) => `/docs/spaces/7/pages/${id === '05' ? 'p42' : '?'}`;
  const r = transformWikiLinks('앞 [[05 API 게이트웨이 설계|게이트웨이]] 뒤 [[내 목표]]', resolve, href);
  assert.equal(r.body, '앞 [게이트웨이](/docs/spaces/7/pages/p42) 뒤 내 목표');
  assert.deepEqual(r.broken, ['내 목표']);
  // 기본 href 는 사이트 시절 경로다.
  assert.equal(siteNoteHref('05'), '/tech/notes/05');
  assert.equal(transformWikiLinks('[[05 API 게이트웨이 설계]]', resolve, siteNoteHref).body, '[05 API 게이트웨이 설계](/tech/notes/05)');
});

test('화이트리스트 밖 위키링크는 일반 텍스트로 평탄화하고 보고한다', () => {
  const r = transformWikiLinks('앞 [[내 목표]] 뒤', () => null);
  assert.equal(r.body, '앞 내 목표 뒤');
  assert.deepEqual(r.broken, ['내 목표']);
});

test('인라인 코드 스팬 안의 위키링크는 문법 예시이므로 손대지 않는다', () => {
  const resolve = () => '05';
  const r = transformWikiLinks('`[[대상]]` 이 화이트리스트 안이면', resolve);
  assert.equal(r.body, '`[[대상]]` 이 화이트리스트 안이면');
  assert.deepEqual(r.broken, []);
});

test('코드 스팬 밖의 링크는 같은 줄에 있어도 정상 변환된다', () => {
  const resolve = (t) => (t === '05 게이트웨이' ? '05' : null);
  const r = transformWikiLinks('`[[예시]]` 는 예시, [[05 게이트웨이]] 는 링크', resolve);
  assert.equal(r.body, '`[[예시]]` 는 예시, [05 게이트웨이](/tech/notes/05) 는 링크');
  assert.deepEqual(r.broken, []);
});

test('펜스 코드블록 안의 위키링크는 손대지 않는다 (``` 과 ~~~ 둘 다)', () => {
  const resolve = () => '05';
  const backtick = '```md\n[[대상]]\n```\n뒤 [[내 목표]]';
  assert.equal(
    transformWikiLinks(backtick, () => null).body,
    '```md\n[[대상]]\n```\n뒤 내 목표',
  );
  const tilde = '~~~\n[[대상]]\n~~~';
  assert.equal(transformWikiLinks(tilde, resolve).body, tilde);
});

test('미종결 펜스는 문서 끝까지 코드로 본다 — 렌더러와 같은 판단', () => {
  const body = '```\n[[대상]]\n아직 안 닫힘';
  assert.equal(transformWikiLinks(body, () => null).body, body);
});

test('콜아웃은 라벨이 굵게 붙은 인용문이 된다', () => {
  const input = ['> [!warning] 주의', '> 본문 줄', '', '다음 문단'].join('\n');
  const out = transformCallouts(input);
  assert.equal(
    out,
    ['> **[WARNING] 주의**', '>', '> 본문 줄', '', '다음 문단'].join('\n'),
  );
});

test('제목 없는 콜아웃도 라벨만 붙인다', () => {
  assert.equal(transformCallouts('> [!note]\n> 본문'), '> **[NOTE]**\n>\n> 본문');
});

test('콜아웃이 아닌 인용문은 건드리지 않는다', () => {
  assert.equal(transformCallouts('> 그냥 인용'), '> 그냥 인용');
});

test('제목 앞 번호와 구분자를 뗀다', () => {
  assert.equal(stripNumberPrefix('15 — ALM·Wiki 백엔드 요구사항', '15'), 'ALM·Wiki 백엔드 요구사항');
  assert.equal(stripNumberPrefix('05 API 게이트웨이 설계', '05'), 'API 게이트웨이 설계');
  assert.equal(stripNumberPrefix('번호 없는 제목', '07'), '번호 없는 제목');
  // 볼트 29·30·32 의 H1 은 `29. 제목` 형태다.
  assert.equal(stripNumberPrefix('29. 위키 동등성 스프린트', '29'), '위키 동등성 스프린트');
});

test('의미 있는 숫자로 시작하는 제목은 건드리지 않는다', () => {
  // 두 자리 뒤에 공백/대시가 와야 번호로 본다. `2026` 은 `20` + `26` 으로 잘리면 안 된다.
  assert.equal(stripNumberPrefix('2026 회고', '20'), '2026 회고');
  // 남의 번호는 떼지 않는다.
  assert.equal(stripNumberPrefix('15 — 어떤 제목', '07'), '15 — 어떤 제목');
  // 떼면 아무것도 안 남는 제목은 원문을 유지한다. 중복이 제목 소실보다 낫다.
  assert.equal(stripNumberPrefix('00', '00'), '00');
});

test('상태를 배지용 짧은 라벨로 줄인다', () => {
  // 실제 볼트 15번 — 237자에 위키링크와 굵게 문법이 섞여 있다.
  assert.equal(
    statusLabel('설계 확정 + Wave A 완료(07-19) + **Wave B 완료(2026-07-21)** — 상세는 [[17 Wave B]] · 다음: Wave C'),
    '설계 확정',
  );
  assert.equal(statusLabel('구현 완료 (2026-07-01, gateway-server :8000)'), '구현 완료');
  assert.equal(statusLabel('구현·수정 완료 (커밋: my e02fdc2)'), '구현·수정 완료');
  assert.equal(statusLabel('완료 · 배포·E2E 검증 완료(2026-07-20)'), '완료');
  assert.equal(statusLabel('정리본'), '정리본');
});

test('구분자로 시작하는 상태도 라벨을 잃지 않는다', () => {
  // 첫 조각이 빈 문자열이 되는 입력. 예전 구현은 상태를 통째로 삼켰다.
  assert.equal(statusLabel('(진행중) 완료'), '(진행중) 완료');
  assert.equal(statusLabel('[[17 Wave B]]'), '');
  assert.equal(statusLabel(''), '');
});
