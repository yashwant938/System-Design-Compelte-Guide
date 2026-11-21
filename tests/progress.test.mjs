import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeSyncCode, encodeSyncCode, loadProgress, saveProgress } from '../src/utils/storage.js';

test('legacy progress migrates once and new profiles start without another learner’s notes', () => {
  class MemoryStorage {
    getItem(key) { return this[key] ?? null; }
    setItem(key, value) { this[key] = value; }
  }
  globalThis.window = { localStorage: new MemoryStorage() };
  try {
    window.localStorage.setItem('sd_complete_guide_v1', JSON.stringify({ completedIds: ['cdn'], lastVisited: { itemId: 'cdn' } }));
    const a = loadProgress('alex');
    assert.deepEqual(a.completedIds, ['cdn']);
    assert.equal(a.lastVisited, null);
    a.designReviews = { cases: { inspections: { notes: { design: '先写入' } } } };
    a.lastVisited = { tab: 'learn', itemId: 'logical-clocks', step: 2 };
    saveProgress(a, 'alex');
    assert.deepEqual(loadProgress('alex'), a);
    assert.deepEqual(loadProgress('blair').designReviews, {});
    assert.deepEqual(loadProgress('blair').completedIds, []);
    const sync = decodeSyncCode(encodeSyncCode({ name: 'Alex' }, a));
    assert.deepEqual(sync.progress.designReviews, a.designReviews);
    assert.deepEqual(sync.progress.lastVisited, a.lastVisited);
  } finally {
    delete globalThis.window;
  }
});
