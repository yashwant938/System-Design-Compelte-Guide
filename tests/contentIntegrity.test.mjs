import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_MODULES, getAllLessons } from '../src/data/curriculum.js';
import { GOF_PATTERNS_23, SOLID_PRINCIPLES } from '../src/data/gofPatterns23.js';
import {
  COMPANY_RUBRICS,
  DECISION_MATRICES,
  LATENCY_LADDER,
  QUIZ_BANK,
  ROADMAP_60_DAYS,
} from '../src/data/practiceAndCheatsheets.js';

test('Complete 12-module HLD + LLD curriculum has unique IDs and valid step scenes', () => {
  const seenModIds = new Set();
  const seenLessonIds = new Set();

  assert.ok(CURRICULUM_MODULES.length >= 13, 'Expected at least 13 HLD + In-The-Wild + LLD modules');

  for (const mod of CURRICULUM_MODULES) {
    assert.ok(mod.id && !seenModIds.has(mod.id), `Duplicate or missing module id: ${mod.id}`);
    seenModIds.add(mod.id);
    assert.ok(['hld', 'lld'].includes(mod.track), `Invalid track on ${mod.id}: ${mod.track}`);
    assert.ok(mod.lessons.length > 0, `Module ${mod.id} has no lessons`);

    for (const lesson of mod.lessons) {
      assert.ok(lesson.id && !seenLessonIds.has(lesson.id), `Duplicate or missing lesson id: ${lesson.id}`);
      seenLessonIds.add(lesson.id);
      assert.ok(lesson.title && lesson.subtitle, `Lesson ${lesson.id} missing title/subtitle`);
      assert.ok(Array.isArray(lesson.objectives) && lesson.objectives.length >= 2, `Lesson ${lesson.id} missing objectives`);
      assert.ok(Array.isArray(lesson.steps) && lesson.steps.length >= 2, `Lesson ${lesson.id} must have >= 2 steps`);

      for (const [sIdx, step] of lesson.steps.entries()) {
        assert.ok(step.title, `Lesson ${lesson.id} step ${sIdx + 1} missing title`);
        assert.ok(Array.isArray(step.body) && step.body.length >= 1, `Lesson ${lesson.id} step ${sIdx + 1} missing body`);
        assert.ok(step.scene && Array.isArray(step.scene.nodes) && step.scene.nodes.length >= 1, `Lesson ${lesson.id} step ${sIdx + 1} missing scene nodes`);

        const nodeIds = new Set(step.scene.nodes.map((n) => n.id));
        for (const edge of step.scene.edges || []) {
          assert.ok(nodeIds.has(edge.from), `Lesson ${lesson.id} step ${sIdx + 1} edge.from missing node: ${edge.from}`);
          assert.ok(nodeIds.has(edge.to), `Lesson ${lesson.id} step ${sIdx + 1} edge.to missing node: ${edge.to}`);
        }
      }
    }
  }

  const all = getAllLessons();
  assert.equal(all.length, seenLessonIds.size);
  assert.ok(all.length >= 73, `Expected >= 73 lessons, got ${all.length}`);
});

test('All 23 GoF design patterns and 5 SOLID principles are complete', () => {
  assert.equal(SOLID_PRINCIPLES.length, 5);
  assert.equal(GOF_PATTERNS_23.length, 23);
  assert.equal(GOF_PATTERNS_23.filter((p) => p.category === 'Creational').length, 5);
  assert.equal(GOF_PATTERNS_23.filter((p) => p.category === 'Structural').length, 7);
  assert.equal(GOF_PATTERNS_23.filter((p) => p.category === 'Behavioral').length, 11);
});

test('50-question quiz bank, 4 company rubrics, 60-day roadmap & cheatsheets are valid', () => {
  assert.equal(QUIZ_BANK.length, 50, 'Expected 50 curated interview questions');
  const seenQ = new Set();
  for (const q of QUIZ_BANK) {
    assert.ok(q.id && !seenQ.has(q.id), `Duplicate quiz id: ${q.id}`);
    seenQ.add(q.id);
    assert.equal(q.options.length, 4, `Quiz ${q.id} must have 4 options`);
    assert.ok(q.answer >= 0 && q.answer < 4, `Quiz ${q.id} answer out of bounds`);
    assert.ok(q.explanation && q.explanation.length > 20, `Quiz ${q.id} missing explanation`);
  }
  assert.equal(COMPANY_RUBRICS.length, 4);
  assert.equal(ROADMAP_60_DAYS.length, 16);
  assert.ok(LATENCY_LADDER.length >= 10);
  assert.ok(DECISION_MATRICES.length >= 3);
});
