import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calculator,
  Cpu,
  Database,
  Flame,
  Gauge,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unlock,
  Zap,
} from 'lucide-react';

// Deterministic fast string hash -> [0, 360) degrees on ring
function hashAngle(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 3600) / 10;
}

const NODE_COLORS = ['#4A89DC', '#3B9C52', '#7C5CE6', '#D9822B', '#DC5B4B', '#0D9488'];

/* ==================== LAB 1: CONSISTENT HASHING RING ==================== */
function ConsistentHashingLab() {
  const [nodes, setNodes] = useState(['Node-A', 'Node-B', 'Node-C', 'Node-D']);
  const [vNodes, setVNodes] = useState(5);
  const [lastRemap, setLastRemap] = useState(null);

  const sampleKeys = useMemo(
    () => Array.from({ length: 60 }, (_, i) => `user_session_${1000 + i}`),
    []
  );

  const computeAssignment = (nodeList, vCount) => {
    const ring = [];
    nodeList.forEach((n, idx) => {
      for (let v = 0; v < vCount; v++) {
        ring.push({ node: n, angle: hashAngle(`${n}#v${v}`), color: NODE_COLORS[idx % NODE_COLORS.length] });
      }
    });
    ring.sort((a, b) => a.angle - b.angle);

    const keyOwners = {};
    const counts = Object.fromEntries(nodeList.map((n) => [n, 0]));
    sampleKeys.forEach((k) => {
      const ka = hashAngle(k);
      const target = ring.find((r) => r.angle >= ka) || ring[0];
      if (target) {
        keyOwners[k] = target.node;
        counts[target.node] = (counts[target.node] || 0) + 1;
      }
    });
    return { ring, keyOwners, counts };
  };

  const { ring, keyOwners, counts } = useMemo(
    () => computeAssignment(nodes, vNodes),
    [nodes, vNodes]
  );

  const handleAddNode = () => {
    if (nodes.length >= 6) return;
    const nextName = `Node-${String.fromCharCode(65 + nodes.length)}`;
    const nextNodes = [...nodes, nextName];
    const next = computeAssignment(nextNodes, vNodes);
    let movedConsistent = 0;
    let movedModulo = 0;
    sampleKeys.forEach((k, idx) => {
      if (next.keyOwners[k] !== keyOwners[k]) movedConsistent++;
      if ((idx % nextNodes.length) !== (idx % nodes.length)) movedModulo++;
    });
    setLastRemap({
      action: `Added ${nextName}`,
      consistentPct: Math.round((movedConsistent / sampleKeys.length) * 100),
      moduloPct: Math.round((movedModulo / sampleKeys.length) * 100),
    });
    setNodes(nextNodes);
  };

  const handleRemoveNode = () => {
    if (nodes.length <= 2) return;
    const removed = nodes[nodes.length - 1];
    const nextNodes = nodes.slice(0, -1);
    const next = computeAssignment(nextNodes, vNodes);
    let movedConsistent = 0;
    let movedModulo = 0;
    sampleKeys.forEach((k, idx) => {
      if (next.keyOwners[k] !== keyOwners[k]) movedConsistent++;
      if ((idx % nextNodes.length) !== (idx % nodes.length)) movedModulo++;
    });
    setLastRemap({
      action: `Removed ${removed}`,
      consistentPct: Math.round((movedConsistent / sampleKeys.length) * 100),
      moduloPct: Math.round((movedModulo / sampleKeys.length) * 100),
    });
    setNodes(nextNodes);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div className="lg:col-span-6 notebook-card p-4 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold uppercase text-ink-muted">Hash Ring (0°..360°)</span>
          <span className="text-[11px] font-mono text-sage-strong dark:text-[#A9E49E]">
            {ring.length} total virtual points
          </span>
        </div>
        <svg viewBox="0 0 320 320" className="w-full max-w-[320px]">
          <circle cx="160" cy="160" r="118" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.5" strokeDasharray="4 4" />
          {/* Sample key ticks */}
          {sampleKeys.slice(0, 30).map((k) => {
            const rad = ((hashAngle(k) - 90) * Math.PI) / 180;
            const x = 160 + 102 * Math.cos(rad);
            const y = 160 + 102 * Math.sin(rad);
            const ownerIdx = nodes.indexOf(keyOwners[k]);
            return (
              <circle
                key={k}
                cx={x}
                cy={y}
                r="3"
                fill={NODE_COLORS[Math.max(0, ownerIdx) % NODE_COLORS.length]}
                opacity="0.7"
              />
            );
          })}
          {/* Virtual server points */}
          {ring.map((pt, i) => {
            const rad = ((pt.angle - 90) * Math.PI) / 180;
            const x = 160 + 118 * Math.cos(rad);
            const y = 160 + 118 * Math.sin(rad);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6.5" fill={pt.color} stroke="#1F1D1A" strokeWidth="1.5" />
              </g>
            );
          })}
          <text x="160" y="155" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="Space Grotesk">
            {nodes.length} Servers
          </text>
          <text x="160" y="173" textAnchor="middle" fill="currentColor" opacity="0.65" fontSize="10" fontFamily="JetBrains Mono">
            {vNodes} vNodes each
          </text>
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="notebook-card p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleAddNode} disabled={nodes.length >= 6} className="notebook-btn-primary text-xs disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" /> Add Server Node
            </button>
            <button type="button" onClick={handleRemoveNode} disabled={nodes.length <= 2} className="notebook-btn disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" /> Remove Node
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Virtual Nodes per Server</span>
              <span className="font-bold">{vNodes} vNodes</span>
            </div>
            <input
              type="range"
              min="1"
              max="18"
              value={vNodes}
              onChange={(e) => setVNodes(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
            <p className="text-[11px] font-mono text-ink-muted dark:text-paper-ink/70">
              Slide from 1 vNode → 15+ vNodes and watch key skew flatten dramatically!
            </p>
          </div>

          {lastRemap && (
            <div className="rounded-xl border border-sage-strong/40 bg-sage/30 dark:bg-sage-dark/70 p-3 text-xs font-mono space-y-1">
              <div className="font-bold">{lastRemap.action} — Remapping Comparison (60 keys):</div>
              <div className="flex flex-wrap gap-4">
                <span className="text-sage-text dark:text-[#A9E49E] font-bold">
                  Consistent Ring: {lastRemap.consistentPct}% moved ✓
                </span>
                <span className="text-coral-strong dark:text-[#FCA5A5] font-bold">
                  Naive hash(k)%N: {lastRemap.moduloPct}% moved ✕
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase text-ink-muted">
              Key Distribution Across Servers (60 keys)
            </div>
            {nodes.map((n, idx) => {
              const cnt = counts[n] || 0;
              const pct = Math.round((cnt / sampleKeys.length) * 100);
              return (
                <div key={n} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[idx % NODE_COLORS.length] }} />
                      {n}
                    </span>
                    <span>{cnt} keys ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-paper-subtle dark:bg-ink-elevated overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: NODE_COLORS[idx % NODE_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== LAB 2: RATE LIMITER ARENA ==================== */
function RateLimiterLab() {
  const [capacity, setCapacity] = useState(6);
  const [refillRate, setRefillRate] = useState(1); // per sec
  const [tbTokens, setTbTokens] = useState(6);
  const [fixedCount, setFixedCount] = useState(0);
  const [prevFixed, setPrevFixed] = useState(4);
  const [windowProgress, setWindowProgress] = useState(0.75);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const id = setInterval(() => {
      setTbTokens((t) => Math.min(capacity, Number((t + refillRate * 0.5).toFixed(2))));
    }, 500);
    return () => clearInterval(id);
  }, [capacity, refillRate]);

  const sendRequests = (count) => {
    let curTokens = tbTokens;
    let curFixed = fixedCount;
    const entries = [];
    for (let i = 0; i < count; i++) {
      const tbAllow = curTokens >= 1;
      if (tbAllow) curTokens = Number((curTokens - 1).toFixed(2));

      const fwAllow = curFixed < capacity;
      if (fwAllow) curFixed += 1;

      const weighted = prevFixed * (1 - windowProgress) + curFixed;
      const swAllow = weighted <= capacity;

      entries.push({
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString().split(' ')[0],
        tb: tbAllow,
        fw: fwAllow,
        sw: swAllow,
      });
    }
    setTbTokens(curTokens);
    setFixedCount(curFixed);
    setLog((prev) => [...entries.reverse(), ...prev].slice(0, 12));
  };

  const resetWindow = () => {
    setPrevFixed(fixedCount);
    setFixedCount(0);
    setWindowProgress(0.15);
  };

  const swWeighted = (prevFixed * (1 - windowProgress) + fixedCount).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="notebook-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <label className="flex items-center gap-2">
            Limit/Cap: <strong>{capacity}</strong>
            <input type="range" min="3" max="12" value={capacity} onChange={(e) => { const v = Number(e.target.value); setCapacity(v); setTbTokens(v); }} />
          </label>
          <label className="flex items-center gap-2">
            Refill/s: <strong>{refillRate}</strong>
            <input type="range" min="1" max="4" value={refillRate} onChange={(e) => setRefillRate(Number(e.target.value))} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => sendRequests(1)} className="notebook-btn-primary text-xs">
            <Zap className="h-3.5 w-3.5" /> Send 1 Req
          </button>
          <button type="button" onClick={() => sendRequests(5)} className="notebook-btn text-xs">
            <Flame className="h-3.5 w-3.5 text-coral-strong" /> Fire Burst ×5
          </button>
          <button type="button" onClick={resetWindow} className="notebook-btn text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Cross Minute Boundary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="notebook-card p-4 space-y-2">
          <div className="font-display font-bold">1. Token Bucket</div>
          <div className="text-2xl font-display font-bold text-sage-strong dark:text-[#A9E49E]">
            {tbTokens.toFixed(1)} / {capacity} tokens
          </div>
          <div className="h-2.5 rounded-full bg-paper-subtle dark:bg-ink-elevated overflow-hidden">
            <div className="h-full bg-sage-strong transition-all" style={{ width: `${(tbTokens / capacity) * 100}%` }} />
          </div>
          <p className="text-[11px] font-mono text-ink-muted">Allows short bursts up to capacity, refills smoothly at {refillRate}/sec.</p>
        </div>

        <div className="notebook-card p-4 space-y-2">
          <div className="font-display font-bold">2. Fixed Window</div>
          <div className="text-2xl font-display font-bold text-sand-strong dark:text-[#F5CF87]">
            {fixedCount} / {capacity} used
          </div>
          <p className="text-[11px] font-mono text-ink-muted">
            Click &ldquo;Cross Minute Boundary&rdquo; then &ldquo;Burst ×5&rdquo; to trigger the classic <strong>2× boundary spike bug</strong>!
          </p>
        </div>

        <div className="notebook-card p-4 space-y-2">
          <div className="font-display font-bold">3. Sliding Window Counter</div>
          <div className="text-2xl font-display font-bold text-lavender-strong dark:text-[#C4B5FD]">
            {swWeighted} / {capacity} est
          </div>
          <p className="text-[11px] font-mono text-ink-muted">
            Formula: prev({prevFixed}) × {(1 - windowProgress).toFixed(2)} + cur({fixedCount}) — blocks boundary spikes in O(1) RAM!
          </p>
        </div>
      </div>

      {log.length > 0 && (
        <div className="notebook-card p-4">
          <div className="text-[11px] font-mono font-bold uppercase text-ink-muted mb-2">Live Request Verdict Timeline</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono">
            {log.map((row) => (
              <div key={row.id} className="rounded-lg border border-ink/15 dark:border-ink-border bg-paper/70 dark:bg-ink-elevated/60 px-2.5 py-1.5 flex items-center justify-between gap-2">
                <span className="opacity-65">{row.time}</span>
                <span>TB:{row.tb ? '200' : '429'}</span>
                <span>FW:{row.fw ? '200' : '429'}</span>
                <span>SW:{row.sw ? '200' : '429'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== LAB 3: CACHE LRU & STAMPEDE LAB ==================== */
function CacheLruStampedeLab() {
  const CAP = 4;
  const [lru, setLru] = useState([
    { k: 'user:42', v: 'Alice' },
    { k: 'post:99', v: 'Viral Post' },
    { k: 'item:7', v: 'Laptop' },
  ]);
  const [singleFlight, setSingleFlight] = useState(true);
  const [stampedeResult, setStampedeResult] = useState(null);
  const [events, setEvents] = useState(['Cache initialized with 3 warm entries (capacity = 4).']);

  const accessKey = (k, v) => {
    const exists = lru.find((x) => x.k === k);
    let next;
    if (exists) {
      next = [exists, ...lru.filter((x) => x.k !== k)];
      setEvents((e) => [`HIT ${k} → promoted to MRU head (0.5 ms)`, ...e].slice(0, 6));
    } else {
      const evicted = lru.length >= CAP ? lru[lru.length - 1] : null;
      next = [{ k, v }, ...lru].slice(0, CAP);
      setEvents((e) => [
        evicted
          ? `MISS ${k} → DB fetch + EVICTED LRU tail (${evicted.k})`
          : `MISS ${k} → DB fetch + inserted at MRU head`,
        ...e,
      ].slice(0, 6));
    }
    setLru(next);
  };

  const triggerStampede = () => {
    setStampedeResult({
      concurrentReqs: 50,
      dbQueries: singleFlight ? 1 : 50,
      dbCpu: singleFlight ? '14% (Healthy ✓)' : '99% (Outage! ✕)',
      mode: singleFlight ? 'Single-Flight Mutex Coalescing ON' : 'No Protection (Thundering Herd)',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7 notebook-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-display font-bold">O(1) LRU Doubly-Linked List (Cap = {CAP})</div>
          <span className="text-[11px] font-mono text-ink-muted">MRU Head ← → LRU Tail</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {lru.map((item, idx) => (
            <div
              key={item.k}
              className={`rounded-xl border p-3 text-center font-mono ${
                idx === 0
                  ? 'border-sage-strong bg-sage/35 dark:bg-sage-dark/70'
                  : idx === lru.length - 1
                  ? 'border-coral-strong/50 bg-coral/25 dark:bg-coral-dark/60'
                  : 'border-ink/20 bg-paper dark:border-ink-border dark:bg-ink-elevated'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-75">
                {idx === 0 ? 'MRU HEAD' : idx === lru.length - 1 ? 'LRU TAIL' : `SLOT #${idx + 1}`}
              </div>
              <div className="font-display font-bold text-sm mt-1">{item.k}</div>
              <div className="text-[11px] opacity-75">{item.v}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['user:42', 'Alice'],
            ['post:99', 'Viral Post'],
            ['item:7', 'Laptop'],
            ['prod:500', 'GPU Rig'],
            ['feed:12', 'Home Feed'],
          ].map(([k, v]) => (
            <button key={k} type="button" onClick={() => accessKey(k, v)} className="notebook-btn text-xs">
              GET/PUT {k}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-paper dark:bg-ink-elevated p-3 border border-ink/15 dark:border-ink-border space-y-1 text-[11.5px] font-mono">
          {events.map((ev, i) => (
            <div key={i} className={i === 0 ? 'font-bold text-ink dark:text-paper-ink' : 'opacity-65'}>
              → {ev}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 notebook-card p-4 space-y-4">
        <div className="font-display font-bold">Cache Stampede (Thundering Herd) Test</div>
        <p className="text-xs font-mono text-ink-muted dark:text-paper-ink/75">
          A celebrity key expires while 50 users request it at the exact same millisecond. Toggle Single-Flight Mutex and compare!
        </p>

        <label className="flex items-center justify-between rounded-xl border border-ink/15 dark:border-ink-border bg-paper dark:bg-ink-elevated p-3 text-xs font-mono cursor-pointer">
          <span className="font-bold">Single-Flight Coalescing Lock</span>
          <input type="checkbox" checked={singleFlight} onChange={(e) => setSingleFlight(e.target.checked)} className="h-4 w-4 accent-emerald-700" />
        </label>

        <button type="button" onClick={triggerStampede} className="notebook-btn-primary w-full">
          <Flame className="h-4 w-4" /> Expire Key &amp; Fire 50 Concurrent Reads
        </button>

        {stampedeResult && (
          <div className={`rounded-xl border p-3.5 text-xs font-mono space-y-1.5 ${
            stampedeResult.dbQueries === 1
              ? 'border-sage-strong/50 bg-sage/30 dark:bg-sage-dark/70'
              : 'border-coral-strong/50 bg-coral/35 dark:bg-coral-dark/70'
          }`}>
            <div className="font-bold">{stampedeResult.mode}</div>
            <div>Incoming Requests: <strong>{stampedeResult.concurrentReqs}</strong></div>
            <div>Queries Hitting Postgres DB: <strong>{stampedeResult.dbQueries}</strong></div>
            <div>Database CPU: <strong>{stampedeResult.dbCpu}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== LAB 4: QUORUM (W+R>N) & RAFT CONSENSUS ==================== */
function QuorumRaftLab() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(3);
  const [r, setR] = useState(3);
  const [raftAlive, setRaftAlive] = useState([true, true, true, true, true]);
  const [term, setTerm] = useState(4);

  const strongOverlap = w + r > n;
  const aliveCount = raftAlive.filter(Boolean).length;
  const raftQuorum = Math.floor(raftAlive.length / 2) + 1;
  const raftHealthy = aliveCount >= raftQuorum;

  const toggleRaftNode = (idx) => {
    setRaftAlive((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="notebook-card p-4 space-y-4">
        <div className="font-display text-lg font-bold">Dynamo Quorum Calculator (W + R &gt; N)</div>

        {[
          ['Replicas (N)', n, 3, 7, (val) => { setN(val); setW(Math.min(w, val)); setR(Math.min(r, val)); }],
          ['Write Quorum (W)', w, 1, n, setW],
          ['Read Quorum (R)', r, 1, n, setR],
        ].map(([label, val, min, max, setter]) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>{label}</span>
              <strong>{val}</strong>
            </div>
            <input type="range" min={min} max={max} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full accent-emerald-700" />
          </div>
        ))}

        <div className={`rounded-xl border p-3.5 text-xs font-mono space-y-1 ${
          strongOverlap
            ? 'border-sage-strong/50 bg-sage/30 dark:bg-sage-dark/70'
            : 'border-coral-strong/50 bg-coral/35 dark:bg-coral-dark/70'
        }`}>
          <div className="font-bold text-sm">
            W({w}) + R({r}) = {w + r} {strongOverlap ? `> N(${n}) — Strong Overlap ✓` : `≤ N(${n}) — Eventual / Stale Reads Possible!`}
          </div>
          <div>Write Failures Tolerated: <strong>{n - w} nodes</strong></div>
          <div>Read Failures Tolerated: <strong>{n - r} nodes</strong></div>
        </div>
      </div>

      <div className="notebook-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold">5-Node Raft Consensus Cluster</div>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold bg-lavender text-lavender-strong dark:bg-lavender-dark dark:text-[#C4B5FD]">
            Term #{term}
          </span>
        </div>
        <p className="text-xs font-mono text-ink-muted">Click any node to kill or revive it — Raft needs majority ({raftQuorum}/5) to elect a leader &amp; commit writes!</p>

        <div className="grid grid-cols-5 gap-2">
          {raftAlive.map((alive, idx) => {
            const isLeader = alive && raftHealthy && raftAlive.indexOf(true) === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleRaftNode(idx)}
                className={`rounded-xl border p-2.5 text-center font-mono text-xs transition-all ${
                  !alive
                    ? 'border-coral-strong/50 bg-coral/30 text-coral-strong opacity-65 dark:bg-coral-dark'
                    : isLeader
                    ? 'border-ink bg-sage text-ink font-bold shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                    : 'border-ink/20 bg-paper dark:border-ink-border dark:bg-ink-elevated'
                }`}
              >
                <div className="font-bold">N{idx + 1}</div>
                <div className="text-[10px] mt-1">{!alive ? 'DOWN' : isLeader ? 'LEADER' : 'FOLLOW'}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className={`text-xs font-mono font-bold ${raftHealthy ? 'text-sage-strong dark:text-[#A9E49E]' : 'text-coral-strong dark:text-[#FCA5A5]'}`}>
            {raftHealthy
              ? `QUORUM MET (${aliveCount}/5 ≥ ${raftQuorum}) — Accepting Writes ✓`
              : `NO QUORUM (${aliveCount}/5 < ${raftQuorum}) — CP Read-Only / Halted!`}
          </div>
          <button type="button" onClick={() => setTerm((t) => t + 1)} className="notebook-btn text-xs">
            Trigger Election
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== LAB 5: BACK-OF-THE-ENVELOPE CAPACITY CALCULATOR ==================== */
const CAPACITY_PRESETS = [
  { name: 'TinyURL', dauM: 100, readsPerUser: 100, writesPerUser: 1, payloadKB: 0.5, years: 5 },
  { name: 'Twitter / X', dauM: 300, readsPerUser: 30, writesPerUser: 2, payloadKB: 2, years: 5 },
  { name: 'WhatsApp', dauM: 500, readsPerUser: 50, writesPerUser: 40, payloadKB: 1, years: 5 },
  { name: 'YouTube Meta', dauM: 400, readsPerUser: 15, writesPerUser: 0.05, payloadKB: 50, years: 5 },
  { name: 'Uber Dispatch', dauM: 40, readsPerUser: 25, writesPerUser: 60, payloadKB: 0.4, years: 3 },
  { name: 'Stripe Payments', dauM: 50, readsPerUser: 5, writesPerUser: 2, payloadKB: 4, years: 7 },
];

function CapacityEstimatorLab() {
  const [dauM, setDauM] = useState(100);
  const [readsPerUser, setReadsPerUser] = useState(20);
  const [writesPerUser, setWritesPerUser] = useState(2);
  const [payloadKB, setPayloadKB] = useState(2);
  const [years, setYears] = useState(5);

  const readQps = Math.round((dauM * 1e6 * readsPerUser) / 86400);
  const peakReadQps = readQps * 3;
  const writeQps = Math.round((dauM * 1e6 * writesPerUser) / 86400);
  const peakWriteQps = writeQps * 3;
  const dailyGB = (dauM * 1e6 * writesPerUser * payloadKB) / (1024 * 1024);
  const totalTB = (dailyGB * 365 * years) / 1024;
  const replicatedTB = totalTB * 3;
  const egressGbps = ((peakReadQps * payloadKB * 1024 * 8) / 1e9).toFixed(2);
  const cacheGB = Math.max(8, Math.round(dailyGB * 0.2 * 5));
  const recommendedShards = Math.max(1, Math.ceil(Math.max(replicatedTB / 4, peakWriteQps / 4000)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {CAPACITY_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              setDauM(p.dauM);
              setReadsPerUser(p.readsPerUser);
              setWritesPerUser(p.writesPerUser);
              setPayloadKB(p.payloadKB);
              setYears(p.years);
            }}
            className="notebook-btn text-xs"
          >
            Preset: {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 notebook-card p-4 space-y-3 text-xs font-mono">
          <div className="font-display text-base font-bold">Traffic &amp; Payload Inputs</div>
          {[
            ['DAU (Millions)', dauM, 1, 1000, 1, setDauM],
            ['Reads / User / Day', readsPerUser, 1, 200, 1, setReadsPerUser],
            ['Writes / User / Day', writesPerUser, 0.1, 100, 0.5, setWritesPerUser],
            ['Avg Record Size (KB)', payloadKB, 0.2, 100, 0.5, setPayloadKB],
            ['Retention (Years)', years, 1, 10, 1, setYears],
          ].map(([label, val, min, max, step, setter]) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between">
                <span>{label}</span>
                <strong>{val}</strong>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full accent-emerald-700" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['Avg Read QPS', readQps.toLocaleString() + ' /s', 'DAU × reads ÷ 86,400'],
            ['Peak Read QPS (3×)', peakReadQps.toLocaleString() + ' /s', 'Size LB & Cache for peak'],
            ['Peak Write TPS (3×)', peakWriteQps.toLocaleString() + ' /s', 'Drives DB sharding'],
            [`${years}-Yr Raw Storage`, `${totalTB.toFixed(1)} TB`, `${dailyGB.toFixed(1)} GB new / day`],
            ['3× Replicated Disk', `${replicatedTB.toFixed(1)} TB`, 'Primary + 2 Replicas'],
            ['Peak Read Egress', `${egressGbps} Gbps`, Number(egressGbps) > 10 ? 'Needs CDN!' : 'Direct LB OK'],
            ['80/20 Hot Cache RAM', `~${cacheGB} GB`, 'Redis Cluster memory'],
            ['Suggested DB Shards', `${recommendedShards} Shards`, '4 TB or 4k TPS / shard'],
            ['Architecture Verdict', recommendedShards > 4 ? 'Sharded + Redis' : 'Single Primary + Replicas', 'Right-sized to math'],
          ].map(([title, val, sub]) => (
            <div key={title} className="notebook-card p-3.5">
              <div className="text-[10px] font-mono uppercase text-ink-muted">{title}</div>
              <div className="font-display text-lg font-bold text-ink dark:text-paper-ink mt-1">{val}</div>
              <div className="text-[10.5px] font-mono text-ink-muted mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== LAB 6: LLD CONCURRENCY (SEAT LOCK + ELEVATOR LOOK) ==================== */
function LldConcurrencyLab() {
  const [lockEnabled, setLockEnabled] = useState(true);
  const [seatStatus, setSeatStatus] = useState('AVAILABLE');
  const [seatOwner, setSeatOwner] = useState(null);
  const [ttl, setTtl] = useState(0);
  const [raceLog, setRaceLog] = useState([]);

  // Elevator LOOK Simulator
  const [elevators, setElevators] = useState([
    { id: 1, floor: 1, dir: 'IDLE', stops: [] },
    { id: 2, floor: 6, dir: 'IDLE', stops: [] },
    { id: 3, floor: 11, dir: 'IDLE', stops: [] },
  ]);

  useEffect(() => {
    if (ttl <= 0) return;
    const t = setTimeout(() => {
      if (ttl === 1) {
        setSeatStatus('AVAILABLE');
        setSeatOwner(null);
        setTtl(0);
        setRaceLog((l) => ['TTL expired → Seat A5 auto-released back to AVAILABLE!', ...l].slice(0, 6));
      } else {
        setTtl((s) => s - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [ttl]);

  const fireConcurrentBook = () => {
    if (!lockEnabled) {
      setSeatStatus('DOUBLE-BOOKED!');
      setSeatOwner('Alice & Bob BOTH booked Seat A5!');
      setTtl(0);
      setRaceLog((l) => ['RACE BUG! Without lock, both threads read AVAILABLE and double-booked Seat A5!', ...l].slice(0, 6));
    } else if (seatStatus === 'AVAILABLE') {
      setSeatStatus('LOCKED');
      setSeatOwner('Alice (10s TTL Hold)');
      setTtl(10);
      setRaceLog((l) => [
        'ATOMIC LOCK ✓: Alice acquired Seat A5 (TTL 10s). Bob cleanly received HTTP 409 Conflict!',
        ...l,
      ].slice(0, 6));
    } else {
      setRaceLog((l) => [`REJECTED (409): Seat A5 is currently ${seatStatus} by ${seatOwner}`, ...l].slice(0, 6));
    }
  };

  const summonElevator = (targetFloor) => {
    setElevators((prev) => {
      let bestIdx = 0;
      let bestDist = Infinity;
      prev.forEach((e, idx) => {
        const d = Math.abs(e.floor - targetFloor) + e.stops.length * 2;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      return prev.map((e, idx) => {
        if (idx !== bestIdx) return e;
        const nextStops = Array.from(new Set([...e.stops, targetFloor]));
        const nextDir = targetFloor > e.floor ? 'UP' : targetFloor < e.floor ? 'DOWN' : 'IDLE';
        return { ...e, stops: nextStops, dir: e.dir === 'IDLE' ? nextDir : e.dir };
      });
    });
  };

  const stepElevators = () => {
    setElevators((prev) =>
      prev.map((e) => {
        if (e.stops.length === 0) return { ...e, dir: 'IDLE' };
        const sortedUp = e.stops.filter((f) => f >= e.floor).sort((a, b) => a - b);
        const sortedDown = e.stops.filter((f) => f <= e.floor).sort((a, b) => b - a);
        let dir = e.dir;
        if (dir === 'UP' && sortedUp.length === 0) dir = 'DOWN';
        if (dir === 'DOWN' && sortedDown.length === 0) dir = 'UP';
        if (dir === 'IDLE') dir = sortedUp.length ? 'UP' : 'DOWN';

        const target = dir === 'UP' ? sortedUp[0] : sortedDown[0];
        if (target === undefined) return { ...e, dir: 'IDLE' };
        const nextFloor = target > e.floor ? e.floor + 1 : target < e.floor ? e.floor - 1 : e.floor;
        const remaining = e.stops.filter((f) => f !== nextFloor);
        return { ...e, floor: nextFloor, stops: remaining, dir: remaining.length ? dir : 'IDLE' };
      })
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* BookMyShow Concurrency Simulator */}
      <div className="notebook-card p-4 space-y-4">
        <div className="font-display text-lg font-bold">BookMyShow Seat A5 Concurrency Race</div>
        <label className="flex items-center justify-between rounded-xl border border-ink/15 dark:border-ink-border bg-paper dark:bg-ink-elevated p-3 text-xs font-mono cursor-pointer">
          <span className="flex items-center gap-2 font-bold">
            {lockEnabled ? <Lock className="h-4 w-4 text-sage-strong" /> : <Unlock className="h-4 w-4 text-coral-strong" />}
            Atomic SeatLockManager (TTL 10s)
          </span>
          <input type="checkbox" checked={lockEnabled} onChange={(e) => { setLockEnabled(e.target.checked); setSeatStatus('AVAILABLE'); setSeatOwner(null); setTtl(0); }} className="h-4 w-4 accent-emerald-700" />
        </label>

        <div className={`rounded-xl border p-4 text-center font-mono ${
          seatStatus === 'DOUBLE-BOOKED!'
            ? 'border-coral-strong bg-coral/40 dark:bg-coral-dark'
            : seatStatus === 'LOCKED'
            ? 'border-sand-strong bg-sand/40 dark:bg-sand-dark'
            : 'border-sage-strong bg-sage/35 dark:bg-sage-dark'
        }`}>
          <div className="text-xs uppercase font-bold">Seat A5 State</div>
          <div className="font-display text-xl font-bold mt-1">{seatStatus}</div>
          <div className="text-xs mt-1">{seatOwner || 'Free to book'} {ttl > 0 ? `(${ttl}s remaining)` : ''}</div>
        </div>

        <button type="button" onClick={fireConcurrentBook} className="notebook-btn-primary w-full">
          Fire Simultaneous Click: Alice &amp; Bob (t = 0 ms)
        </button>

        {raceLog.length > 0 && (
          <div className="rounded-xl bg-paper dark:bg-ink-elevated p-3 border border-ink/15 dark:border-ink-border text-[11px] font-mono space-y-1">
            {raceLog.map((line, i) => <div key={i}>→ {line}</div>)}
          </div>
        )}
      </div>

      {/* Elevator LOOK Dispatcher */}
      <div className="notebook-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="font-display text-lg font-bold">3-Elevator LOOK Dispatcher</div>
          <button type="button" onClick={stepElevators} className="notebook-btn-primary text-xs">
            Step Simulation Tick →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {elevators.map((car) => (
            <div key={car.id} className="rounded-xl border border-ink/20 dark:border-ink-border bg-paper dark:bg-ink-elevated p-3 text-center font-mono">
              <div className="text-[10.5px] uppercase text-ink-muted">Car #{car.id}</div>
              <div className="font-display text-2xl font-bold mt-1">Fl {car.floor}</div>
              <div className="text-[11px] font-bold text-sage-strong dark:text-[#A9E49E]">{car.dir}</div>
              <div className="text-[10px] text-ink-muted mt-1 truncate">
                Stops: {car.stops.length ? car.stops.join(', ') : 'None'}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase font-bold text-ink-muted">Summon Elevator to Floor:</div>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((fl) => (
              <button key={fl} type="button" onClick={() => summonElevator(fl)} className="notebook-btn py-1.5 text-xs">
                F{fl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const LAB_TABS = [
  { id: 'hashing', label: 'Consistent Hashing', icon: RefreshCw },
  { id: 'ratelimiter', label: 'Rate Limiter Arena', icon: Gauge },
  { id: 'cache', label: 'LRU & Stampede', icon: Database },
  { id: 'quorum', label: 'Quorum & Raft', icon: ShieldCheck },
  { id: 'capacity', label: 'Napkin Math Calc', icon: Calculator },
  { id: 'lld', label: 'LLD Locks & Elevator', icon: Cpu },
];

export default function DesignLabView({ initialLabId }) {
  const [activeLab, setActiveLab] = useState(
    LAB_TABS.some((l) => l.id === initialLabId) ? initialLabId : 'hashing'
  );

  return (
    <div className="mx-auto max-w-[1320px] px-3 sm:px-5 py-6 space-y-5">
      <div className="notebook-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-sage-strong dark:text-[#A9E49E]">
              Interactive Engineering Workbench · 6 Live Simulators
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
              System Design <span className="term-highlight">Lab</span>
            </h1>
            <p className="text-xs sm:text-[13px] font-mono text-ink-muted dark:text-paper-ink/75 mt-1 max-w-2xl">
              Stress-test distributed algorithms, capacity math, cache stampedes, Raft quorums, and LLD concurrency races live in your browser.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/30 bg-sage/50 px-3 py-1 text-xs font-mono font-bold dark:bg-sage-dark dark:text-[#C9F2BE]">
            <Activity className="h-3.5 w-3.5" /> 100% Interactive · Zero Backend
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {LAB_TABS.map((lab) => {
            const Icon = lab.icon;
            const active = activeLab === lab.id;
            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => setActiveLab(lab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-mono font-semibold transition-all ${
                  active
                    ? 'border-ink bg-sage text-ink shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                    : 'border-ink/20 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {lab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeLab === 'hashing' && <ConsistentHashingLab />}
      {activeLab === 'ratelimiter' && <RateLimiterLab />}
      {activeLab === 'cache' && <CacheLruStampedeLab />}
      {activeLab === 'quorum' && <QuorumRaftLab />}
      {activeLab === 'capacity' && <CapacityEstimatorLab />}
      {activeLab === 'lld' && <LldConcurrencyLab />}
    </div>
  );
}
