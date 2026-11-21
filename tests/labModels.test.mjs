import test from 'node:test';
import assert from 'node:assert/strict';
import { admitBurst, advanceLimiter, estimateCapacity, initialLimiter, queueRecovery, slidingEstimate } from '../src/utils/labModels.js';

test('sliding counter counts its own admissions and stays closed on a boundary burst', () => {
  const first = admitBurst(initialLimiter, 8, 6);
  assert.equal(first.sliding, 6);
  assert.equal(first.log.filter((request) => request.sw).length, 6);
  const boundary = advanceLimiter(first, 5, 6, 1);
  const second = admitBurst(boundary, 6, 6);
  assert.equal(second.fixed, 6);
  assert.equal(second.sliding, 0);
  assert.equal(second.tokens, 0);
  assert.equal(slidingEstimate(second), 6);
  const halfway = admitBurst(advanceLimiter(second, 30, 6, 1), 4, 6);
  assert.equal(halfway.sliding, 3);
  assert.equal(halfway.log[0].sw, false);
  assert.equal(slidingEstimate(advanceLimiter(halfway, 120, 6, 1)), 0);
});

test('queue drains only at spare downstream-limited service capacity', () => {
  const settings = { arrivals: 200, outageSeconds: 60, workers: 6, perWorker: 50, downstreamLimit: 400 };
  const model = queueRecovery(settings);
  assert.equal(model.backlog, 12000);
  assert.equal(model.recoverySeconds, 120);
  assert.equal(model.backlogAfter(300), 0);
  const capped = queueRecovery({ ...settings, workers: 20, downstreamLimit: 200 });
  assert.equal(capped.recoverySeconds, Infinity);
  assert.equal(capped.backlogAfter(60), 12000);
  assert.equal(queueRecovery({ ...settings, downstreamLimit: 100 }).backlogAfter(60), 18000);
  assert.equal(queueRecovery({ ...settings, outageSeconds: 0 }).recoverySeconds, 0);
});

test('capacity uses decimal storage units and sizes logical shards from a single copy', () => {
  const model = estimateCapacity({ dauM: 1, writesPerUser: 1, readsPerUser: 1, years: 1, payloadKB: 10 });
  assert.equal(model.dailyGB, 10);
  assert.equal(model.totalTB, 3.65);
  assert.ok(Math.abs(model.replicatedTB - 10.95) < 1e-10);
  assert.equal(model.shards, 1);
  assert.equal(model.cacheGB, 10);
  assert.ok(Math.abs(model.egressGbps - 1 / 360) < 1e-12);
});
