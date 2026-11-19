import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_MODULES, getAllLessons } from '../src/data/curriculum.js';
import { GOF_PATTERNS_23, SOLID_PRINCIPLES } from '../src/data/gofPatterns23.js';

test('All 23 GoF design patterns and 5 SOLID principles are present and complete', () => {
  assert.equal(SOLID_PRINCIPLES.length, 5, 'Must include all 5 SOLID principles');
  assert.equal(GOF_PATTERNS_23.length, 23, 'Must include all 23 Gang of Four design patterns');
  const creational = GOF_PATTERNS_23.filter((p) => p.category === 'Creational').length;
  const structural = GOF_PATTERNS_23.filter((p) => p.category === 'Structural').length;
  const behavioral = GOF_PATTERNS_23.filter((p) => p.category === 'Behavioral').length;
  assert.equal(creational, 5);
  assert.equal(structural, 7);
  assert.equal(behavioral, 11);
});

test('Every curriculum module and lesson has unique IDs and valid step scenes', () => {
  const seenModIds = new Set();
  const seenLessonIds = new Set();

  assert.ok(CURRICULUM_MODULES.length >= 2, 'Expected at least 2 modules');

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
      assert.ok(Array.isArray(lesson.steps) && lesson.steps.length >= 2, `Lesson ${lesson.id} must have at least 2 steps`);

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
});
