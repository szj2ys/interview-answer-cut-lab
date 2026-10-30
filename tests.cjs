'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./core.js');

test('editing measurements keep source and cut separate', () => {
  const value = {...C.blank(), source: 'I checked 12 requests with 2 volunteers.', cut: 'I checked 12 requests.'};
  const before = JSON.stringify(value);
  const stats = C.analyze(value);
  assert.equal(stats.sourceWords, 7);
  assert.equal(stats.cutWords, 4);
  assert.equal(stats.budgetWords, 130);
  assert.equal(stats.estimatedSeconds, 2);
  assert.deepEqual(stats.newNumbers, []);
  assert.equal(JSON.stringify(value), before);
});
test('new numeric strings retain signs, percentages and exact representations', () => {
  const value = {...C.blank(), source: 'We recorded 12 requests and -2 changes.', cut: 'I reduced requests by 40%, from 12 to 7. I estimated +2 changes. 40% is unverified.'};
  assert.deepEqual(C.analyze(value).newNumbers, ['40%', '7', '+2']);
  assert.deepEqual(C.numbers('12 12 12.0 1,200'), ['12', '12.0', '1,200']);
});
test('word count accepts accents and apostrophes without counting punctuation as words', () => {
  assert.equal(C.words('Résumé — I’m checking a follow-up.'), 5);
  assert.equal(C.words('   \n — !'), 0);
});
test('moving a selection preserves the rest of the edit and existing follow-ups', () => {
  assert.deepEqual(C.moveSelection('Keep this. Park this.', 'Earlier note.', 11, 21),
    {cut: 'Keep this. ', followups: 'Earlier note.\n\nPark this.'});
  assert.throws(() => C.moveSelection('words', '', 0, 0));
  assert.throws(() => C.moveSelection('words', '', -1, 3));
  assert.throws(() => C.moveSelection('  ', '', 0, 2));
});
test('practice files round-trip all content and checklist values', () => {
  const value = {...C.blank(), question: 'Why?', source: '<img src=x onerror=alert(1)>', cut: 'Exact words.\nSecond line.', fictional: true};
  value.checks.limits = true;
  assert.deepEqual(C.validate(JSON.parse(JSON.stringify(value))), value);
  const copy = C.validate(value);
  copy.checks.limits = false;
  assert.equal(value.checks.limits, true);
});
test('invalid files cannot become accepted draft state', () => {
  for (const value of [null, [], {}, {...C.blank(), schema: 2}, {...C.blank(), source: 4},
    {...C.blank(), pace: 0}, {...C.blank(), seconds: 31}, {...C.blank(), extra: true},
    {...C.blank(), checks: {}}, {...C.blank(), cut: 'x'.repeat(20001)}]) {
    assert.throws(() => C.validate(value));
  }
});
test('Markdown preserves literal user text, even when it contains code fences', () => {
  const tick = String.fromCharCode(96);
  const value = {...C.blank(), source: tick.repeat(3) + '\n<img src=x>\n' + tick.repeat(3), fictional: true};
  const output = C.markdown(value);
  assert.ok(output.includes(tick.repeat(4) + 'text\n' + value.source + '\n' + tick.repeat(4)));
  assert.ok(output.includes('FICTIONAL PRACTICE EXAMPLE'));
  assert.ok(output.includes('not truth, units, meaning or spelled-out numbers'));
});
test('fresh drafts do not share checklist state', () => {
  const first = C.blank();
  first.checks.ownership = true;
  assert.equal(C.blank().checks.ownership, false);
});

