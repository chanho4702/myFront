// node --test — Node 24 의 타입 제거(type stripping)로 .ts 를 바로 불러온다(boardErrors.ts 는 import 없는 순수 모듈).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNT_STATUS_MESSAGES, classifyBoardError, describeBoardError, serverMessage } from './boardErrors.ts';

test('계정 상태 게이트 403 은 서버 문구 그대로 + account 로 분류', () => {
  const r = describeBoardError(403, { error: 'forbidden', message: '승인 대기 중인 계정입니다' }, '목록을 불러오지 못했습니다.');
  assert.deepEqual(r, { kind: 'account', message: '승인 대기 중인 계정입니다' });
});

test('서버의 계정 상태 문구 네 가지가 모두 account', () => {
  for (const m of ACCOUNT_STATUS_MESSAGES) assert.equal(classifyBoardError(403, m), 'account');
});

test('일반 권한 거부 403 은 forbidden — 서버 문구 우선, 없으면 상태별 문구', () => {
  assert.deepEqual(describeBoardError(403, { error: 'forbidden', message: '본인 글만 수정할 수 있습니다.' }, 'x', { 403: '수정 권한이 없습니다.' }), {
    kind: 'forbidden',
    message: '본인 글만 수정할 수 있습니다.',
  });
  assert.deepEqual(describeBoardError(403, null, 'x', { 403: '수정 권한이 없습니다.' }), { kind: 'forbidden', message: '수정 권한이 없습니다.' });
});

test('503 은 unavailable + 다시 시도 안내(빈 목록·권한 없음으로 위장하지 않음)', () => {
  const r = describeBoardError(503, { error: 'service_unavailable', message: '권한 서비스에 연결할 수 없습니다' }, '목록을 불러오지 못했습니다.');
  assert.equal(r.kind, 'unavailable');
  assert.equal(r.message, '권한 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  // 본문이 없거나 JSON 이 아니어도(프록시 503) 같은 분류
  assert.equal(describeBoardError(503, undefined, 'x').kind, 'unavailable');
  assert.match(describeBoardError(503, undefined, 'x').message, /잠시 후 다시 시도/);
});

test('기계 코드만 있는 error 는 문구로 쓰지 않는다, 한국어 error 는 쓴다', () => {
  assert.equal(serverMessage({ error: 'service_unavailable' }), null);
  assert.equal(serverMessage({ error: '검색어가 너무 깁니다' }), '검색어가 너무 깁니다');
  assert.equal(serverMessage('not json'), null);
});

test('본문 없는 실패는 fallback, 404·401 분류', () => {
  assert.deepEqual(describeBoardError(500, null, '목록을 불러오지 못했습니다.'), { kind: 'other', message: '목록을 불러오지 못했습니다.' });
  assert.equal(describeBoardError(404, null, 'x').kind, 'notFound');
  assert.equal(describeBoardError(401, null, 'x', { 401: '로그인이 필요합니다.' }).message, '로그인이 필요합니다.');
});
