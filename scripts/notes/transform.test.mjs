import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isWhitelisted,
  noteIdOf,
  parseFrontmatter,
  extractTitle,
  transformWikiLinks,
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

test('화이트리스트 밖 위키링크는 일반 텍스트로 평탄화하고 보고한다', () => {
  const r = transformWikiLinks('앞 [[내 목표]] 뒤', () => null);
  assert.equal(r.body, '앞 내 목표 뒤');
  assert.deepEqual(r.broken, ['내 목표']);
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
  assert.equal(stripNumberPrefix('15 — ALM·Wiki 백엔드 요구사항'), 'ALM·Wiki 백엔드 요구사항');
  assert.equal(stripNumberPrefix('05 API 게이트웨이 설계'), 'API 게이트웨이 설계');
  assert.equal(stripNumberPrefix('번호 없는 제목'), '번호 없는 제목');
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
