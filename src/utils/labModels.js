export function hashKey(key) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

export const initialLimiter = {
  second: 55, tokens: 6, fixed: 0, sliding: 0, previousSliding: 0, requests: 0, log: [],
};

export function advanceLimiter(state, seconds, capacity, refillRate) {
  const second = state.second + seconds;
  const windows = Math.floor(second / 60) - Math.floor(state.second / 60);
  return {
    ...state, second,
    tokens: Math.min(capacity, state.tokens + seconds * refillRate),
    fixed: windows ? 0 : state.fixed,
    sliding: windows ? 0 : state.sliding,
    previousSliding: windows === 0 ? state.previousSliding : windows === 1 ? state.sliding : 0,
  };
}

export function slidingEstimate(state) {
  return state.previousSliding * (60 - state.second % 60) / 60 + state.sliding;
}

export function admitBurst(state, count, capacity) {
  const next = { ...state };
  const entries = [];
  for (let i = 0; i < count; i++) {
    const tb = next.tokens >= 1;
    const fw = next.fixed < capacity;
    const sw = slidingEstimate(next) + 1 <= capacity;
    if (tb) next.tokens--;
    if (fw) next.fixed++;
    if (sw) next.sliding++;
    next.requests++;
    entries.push({ id: next.requests, time: `t=${next.second}s`, tb, fw, sw });
  }
  return { ...next, log: [...entries.reverse(), ...state.log].slice(0, 12) };
}

export function queueRecovery({ arrivals, outageSeconds, workers, perWorker, downstreamLimit }) {
  const serviceRate = Math.min(workers * perWorker, downstreamLimit);
  const backlog = arrivals * outageSeconds;
  const spare = serviceRate - arrivals;
  return {
    serviceRate, backlog, spare,
    recoverySeconds: backlog === 0 ? 0 : spare > 0 ? backlog / spare : Infinity,
    backlogAfter: (seconds) => Math.max(0, backlog - spare * seconds),
  };
}

// Decimal kB/GB/TB, an average read response the size of one write,
// three copies per logical shard, and a uniform key distribution.
export function estimateCapacity({ dauM, readsPerUser, writesPerUser, payloadKB, years }) {
  const users = dauM * 1e6;
  const readQps = users * readsPerUser / 86400;
  const peakReadQps = readQps * 3;
  const peakWriteQps = users * writesPerUser / 86400 * 3;
  const dailyGB = users * writesPerUser * payloadKB / 1e6;
  const totalTB = dailyGB * 365 * years / 1000;
  return {
    readQps, peakReadQps, peakWriteQps, dailyGB, totalTB,
    replicatedTB: totalTB * 3,
    egressGbps: peakReadQps * payloadKB * 1000 * 8 / 1e9,
    cacheGB: dailyGB * 5 * 0.2,
    shards: Math.max(1, Math.ceil(Math.max(totalTB / 4, peakWriteQps / 4000))),
  };
}
