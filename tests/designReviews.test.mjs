import test from 'node:test';
import assert from 'node:assert/strict';
import { findLessonById } from '../src/data/curriculum.js';
import { DESIGN_REVIEWS, getStageProgress } from '../src/data/designReviews.js';

test('each capstone has a complete review and opens existing lessons', () => {
  assert.ok(DESIGN_REVIEWS.length >= 3);
  assert.equal(new Set(DESIGN_REVIEWS.map((item) => item.id)).size, DESIGN_REVIEWS.length);
  for (const item of DESIGN_REVIEWS) {
    assert.ok(item.brief && item.assumptions.length > 0, item.id);
    assert.deepEqual(item.stages.map((stage) => stage.id), ['requirements', 'estimates', 'design', 'failures']);
    for (const stage of item.stages) {
      assert.ok(stage.prompt && stage.answer.every(Boolean) && stage.answer.length > 0);
      assert.ok(Object.keys(stage.checks).length >= 2 && Object.values(stage.checks).every(Boolean));
    }
    for (const lesson of item.lessons) assert.ok(findLessonById(lesson.id), lesson.id);
  }
});

test('stage completion uses its own notes and all current rubric criteria', () => {
  const [first, second] = DESIGN_REVIEWS[0].stages;
  const criteria = Object.keys(first.checks);
  const record = {
    notes: { [first.id]: 'The receipt follows the commit.' },
    checks: { [first.id]: [...criteria, criteria[0], 'retired-criterion'] },
  };
  assert.deepEqual(getStageProgress(record, first), {
    note: record.notes[first.id], checked: criteria, reviewed: true,
  });
  assert.equal(getStageProgress(record, second).reviewed, false);
  assert.equal(getStageProgress({ ...record, notes: { [first.id]: ' ' } }, first).reviewed, false);
  assert.equal(getStageProgress({ ...record, checks: { [first.id]: criteria.slice(1) } }, first).reviewed, false);
});

test('older or malformed saved progress leaves a writable empty stage', () => {
  const stage = DESIGN_REVIEWS[0].stages[0];
  const empty = { note: '', checked: [], reviewed: false };
  assert.deepEqual(getStageProgress(undefined, stage), empty);
  assert.deepEqual(getStageProgress({ notes: { [stage.id]: {} }, checks: { [stage.id]: true } }, stage), empty);
});
