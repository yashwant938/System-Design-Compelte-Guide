// Module 13: "In The Wild" — Real-World Production Engineering Deep Dives (Hello Interview & Big Tech Engineering Blogs)

export const MODULE_13_IN_THE_WILD = {
  id: 'mod-13-in-the-wild',
  number: '13',
  title: 'In The Wild (Big Tech)',
  track: 'hld',
  lessons: [
    {
      id: 'wild-shopify-inventory',
      title: 'Shopify: Inventory Reservations (Redis → MySQL 8)',
      subtitle: 'How Shopify handles $5.1M/min Black Friday flash sales without overselling by moving from Redis to MySQL 8 `SKIP LOCKED`.',
      duration: '14 min',
      level: 'Advanced',
      companies: ['Shopify', 'Amazon', 'Stripe', 'Microsoft'],
      tags: ['shopify', 'skip locked', 'mysql', 'redis', 'contention', 'flash sale', 'inventory', 'proxysql', 'in the wild'],
      objectives: [
        'Understand the Checkout Seam: why Overselling hurts customers and Underselling loses merchant revenue',
        'Diagnose why splitting state across Redis (reservations) + MySQL (ledger) causes irreversible drift',
        'Eliminate hot-row lock contention by modeling One Row Per Reservable Unit + `SELECT ... FOR UPDATE SKIP LOCKED`',
        'Scale past operational ProxySQL connection-pool limits with bounded unit pools and SQL comment tracing',
      ],
      steps: [
        {
          shortLabel: 'Checkout Seam',
          stage: 'SETUP',
          title: '$5.1M/min Black Friday: The Checkout Seam Dilemma',
          body: [
            'During a sneaker drop or Black Friday peak (**$5.1M+ sales/minute**), 50,000 buyers race for the last **100 units** of a product. When Alice clicks **"Complete Purchase"**, payment processing with Stripe/banks takes **2–5 seconds**.',
            'Shopify must hold her unit during that window: fail to hold and you **oversell** (two buyers charged for 1 item → canceled orders & angry merchants); hold carelessly and abandoned carts **undersell** (showing "Sold Out" while units sit unbought)!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Inventory reservation is a textbook **High-Contention Distributed State** problem: every millisecond of lock wait during a flash sale multiplies across tens of thousands of simultaneous checkouts.',
          },
          scene: {
            hud: [
              { label: 'PEAK GMV', value: '$5.1M / min', status: 'warn' },
              { label: 'HOLD WINDOW', value: '2 – 5 sec Pay', status: 'info' },
              { label: 'OVERSELL', value: '0% Tolerated', status: 'bad' },
              { label: 'UNDERSELL', value: 'Lost Revenue', status: 'warn' },
            ],
            nodes: [
              { id: 'buyers', type: 'users', x: 115, y: 215, label: '50k Buyers', sublabel: '100 Units Left!', tone: 'slate' },
              { id: 'chk', type: 'hex', x: 380, y: 215, label: 'Checkout Seam', sublabel: 'Reserve → Charge', tone: 'amber', badge: 'extreme contention', badgeTone: 'amber', load: 84 },
              { id: 'psp', type: 'hex', x: 645, y: 120, label: 'Payment PSP', sublabel: '2–5s Card Auth', tone: 'blue' },
              { id: 'inv', type: 'db', x: 645, y: 310, label: 'Inventory Ledger', sublabel: '100 Units Exact', tone: 'purple' },
            ],
            edges: [
              { from: 'buyers', to: 'chk', label: 'flash spike', packetColor: 'coral', speed: 1.3, packetCount: 3 },
              { from: 'chk', to: 'psp', label: 'charge card (3s)', packetColor: 'blue', bidirectional: true, speed: 2.3 },
              { from: 'chk', to: 'inv', label: 'atomic hold', packetColor: 'purple', bidirectional: true, speed: 1.7 },
            ],
            legend: [
              { label: 'flash-sale burst', tone: 'coral' },
              { label: 'payment & reservation seam', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Redis Split Bug',
          stage: 'PROBLEM',
          title: 'Why the Legacy Architecture (Redis Holds + MySQL Ledger) Drifted',
          body: [
            'For years, Shopify kept temporary holds in **Redis** (fast atomic Lua counters + cron expiration) and permanent merchant inventory in **MySQL**.',
            '**Fatal Flaw — The Cross-System Seam**: Because Redis and MySQL cannot participate in a single ACID transaction, a pod crash or network timeout *between* committing the MySQL order and releasing the Redis hold left **ghost reservations** (permanent underselling) or missed holds (overselling!).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Whenever two separate datastores (Redis + SQL) must agree on a strict financial/inventory invariant, network failures between them inevitably create split-brain drift!',
          },
          scene: {
            hud: [
              { label: 'HOLDS STORE', value: 'Redis Lua', status: 'warn' },
              { label: 'LEDGER STORE', value: 'MySQL Primary', status: 'info' },
              { label: 'SINGLE ACID TX', value: 'Impossible ✕', status: 'bad' },
              { label: 'FAILURE MODE', value: 'Ghost Drift / Oversell', status: 'bad' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 140, y: 215, label: 'Checkout Pod', sublabel: 'Crash Mid-Step!', tone: 'coral', badge: 'dual-write seam', badgeTone: 'rose' },
              { id: 'rd', type: 'cache', x: 485, y: 115, label: 'Redis Holds', sublabel: 'Reserved: 100', tone: 'amber', badge: 'out of sync!', badgeTone: 'rose' },
              { id: 'my', type: 'db', x: 485, y: 315, label: 'MySQL Ledger', sublabel: 'Committed: 94', tone: 'purple', badge: '6 ghost units', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'app', to: 'rd', label: '1. Lua DECR ✓', packetColor: 'amber', speed: 1.7 },
              { from: 'app', to: 'my', label: '2. Crash before COMMIT ✕', packetColor: 'coral', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'completed hold', tone: 'amber' },
              { label: 'failed cross-DB write', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Hot Counter Lock',
          stage: 'PROBLEM',
          title: 'Moving to MySQL Fixes Atomicity — But 1 Counter Row Creates a Lock Pileup!',
          body: [
            'Moving reservations into **MySQL** puts reservation + order ledger inside **ONE single ACID transaction** — zero cross-system drift! ',
            'Naive attempt: keep 1 row per SKU (`UPDATE inventory SET available = available - 1 WHERE sku_id = 42 AND available > 0`). Under a flash sale, **10,000 concurrent transactions queue up serially behind ONE single InnoDB row lock**, exhausting DB connections and timing out!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'You cannot fix hot-row lock serialization by adding more CPU cores! Contention on a single counter row must be solved with a **data-modeling shift**.',
          },
          scene: {
            hud: [
              { label: 'SINGLE ACID TX', value: 'Yes (MySQL)', status: 'good' },
              { label: 'DATA MODEL', value: '1 Counter Row', status: 'bad' },
              { label: 'LOCK WAITERS', value: '10,000 Serialized', status: 'bad' },
              { label: 'THROUGHPUT', value: 'Collapsed!', status: 'bad' },
            ],
            nodes: [
              { id: 't1', type: 'hex', x: 120, y: 110, label: 'Checkout #1', sublabel: 'Holds Row Lock', tone: 'amber' },
              { id: 't2', type: 'hex', x: 120, y: 215, label: 'Checkout #2..5k', sublabel: 'BLOCKED waiting', tone: 'coral', dim: true },
              { id: 't3', type: 'hex', x: 120, y: 320, label: 'Checkout #5k..10k', sublabel: 'TIMEOUT 504!', tone: 'coral', dim: true },
              { id: 'row', type: 'db', x: 525, y: 215, label: 'SKU #42 Row', sublabel: 'qty = 100 (1 Lock!)', tone: 'coral', badge: 'serialized bottleneck', badgeTone: 'rose', load: 99 },
            ],
            edges: [
              { from: 't1', to: 'row', label: 'exclusive X-lock', packetColor: 'amber', speed: 2.0 },
              { from: 't2', to: 'row', label: 'blocked!', packetColor: 'coral', dashed: true, speed: 3.1 },
              { from: 't3', to: 'row', label: 'lock wait timeout', packetColor: 'coral', dashed: true, speed: 3.5 },
            ],
            legend: [{ label: 'single-row lock pileup', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'SKIP LOCKED Pool',
          stage: 'SOLUTION',
          title: 'Shopify’s Breakthrough: Bounded Pool of Unit Rows + `FOR UPDATE SKIP LOCKED`',
          body: [
            'Instead of 1 counter row for 100 sneakers, Shopify stores a **bounded pool of individual reservable unit rows** (like movie seats — 1 row = 1 reservable unit, capped and dynamically replenished as stock drains so a 10M-unit SKU never bloats the table!).',
            'Each checkout runs MySQL 8’s **`SELECT id FROM reservations WHERE sku_id = 42 AND status = "AVAILABLE" LIMIT 1 FOR UPDATE SKIP LOCKED`**. Checkout #1 locks Unit Row #1; Checkout #2 **instantly skips locked Row #1 and grabs Row #2 with ZERO blocking!**',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '`FOR UPDATE SKIP LOCKED` transforms serialized N-way lock contention into lock-free parallel claims inside a single rock-solid ACID relational transaction!',
          },
          changes: [
            '+Replaced 1 hot counter row with a bounded pool of reservable unit rows',
            '+MySQL 8 `FOR UPDATE SKIP LOCKED` lets 100 checkouts grab distinct rows simultaneously',
            '+Reservation + Order Ledger commit in ONE atomic MySQL ACID transaction (0% drift!)',
          ],
          scene: {
            hud: [
              { label: 'ACID DRIFT', value: '0% (1 Database)', status: 'good' },
              { label: 'LOCK CONTENTION', value: 'Skipped Instantly!', status: 'good' },
              { label: 'PATTERN', value: 'Unit Pool + SKIP LOCK', status: 'good' },
              { label: 'TABLE SIZE', value: 'Bounded + Replenish', status: 'good' },
            ],
            nodes: [
              { id: 'c1', type: 'hex', x: 115, y: 110, label: 'Checkout #1', sublabel: 'SKIP LOCKED', tone: 'green' },
              { id: 'c2', type: 'hex', x: 115, y: 215, label: 'Checkout #2', sublabel: 'SKIP LOCKED', tone: 'blue' },
              { id: 'c3', type: 'hex', x: 115, y: 320, label: 'Checkout #3', sublabel: 'SKIP LOCKED', tone: 'purple' },
              { id: 'u1', type: 'db', x: 525, y: 105, label: 'Unit Row #1', sublabel: 'Locked by #1 ✓', tone: 'green', callout: 'zero wait' },
              { id: 'u2', type: 'db', x: 525, y: 220, label: 'Unit Row #2', sublabel: 'Skipped #1 → #2 ✓', tone: 'blue', callout: 'parallel!' },
              { id: 'u3', type: 'db', x: 525, y: 335, label: 'Unit Row #3', sublabel: 'Skipped #1,#2 → #3 ✓', tone: 'purple', callout: 'parallel!' },
            ],
            edges: [
              { from: 'c1', to: 'u1', label: 'claim row 1', packetColor: 'green', speed: 1.5 },
              { from: 'c2', to: 'u2', label: 'skip → row 2', packetColor: 'blue', speed: 1.5 },
              { from: 'c3', to: 'u3', label: 'skip → row 3', packetColor: 'purple', speed: 1.5 },
            ],
            legend: [{ label: 'parallel zero-wait unit claims', tone: 'green' }],
          },
        },
        {
          shortLabel: 'ProxySQL & Ops',
          stage: 'TECHNIQUE',
          title: 'Production Bottleneck Reality: ProxySQL Connections & SQL Tracing',
          body: [
            'During Black Friday load testing, MySQL CPU wasn’t even the first limit — **connection pool exhaustion at ProxySQL** was! Holding a DB transaction open *while calling Stripe over HTTP* starves DB connections in milliseconds.',
            '**Golden Rule**: Keep DB transactions short (milliseconds!). Reserve the row & **COMMIT** immediately with `expires_at = NOW() + 5m`, call Stripe *outside* the DB transaction, then open a tiny 2nd transaction to flip `RESERVED → SOLD`! Shopify also embeds **SQL comment tags** (`/* checkout_id=.. */`) to trace exact bottleneck queries in production.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Never hold a relational DB transaction open across an external HTTP call (Stripe/shipping API)! Commit the short `HELD` state first, call PSP outside the TX, then finalize atomically.',
          },
          scene: {
            hud: [
              { label: 'TX #1 (HOLD)', value: '3 ms → COMMIT', status: 'good' },
              { label: 'STRIPE HTTP', value: 'Outside DB TX ✓', status: 'good' },
              { label: 'TX #2 (CONFIRM)', value: '2 ms → SOLD', status: 'good' },
              { label: 'PROXYSQL POOL', value: 'Healthy (22% Used)', status: 'good' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 115, y: 215, label: 'Checkout Svc', sublabel: 'Short TX Discipline', tone: 'blue' },
              { id: 'px', type: 'hex', x: 345, y: 120, label: 'ProxySQL Pool', sublabel: 'Multiplexed Conns', tone: 'green', load: 22 },
              { id: 'db', type: 'db', x: 615, y: 120, label: 'MySQL 8 Shard', sublabel: 'SKIP LOCKED (3ms)', tone: 'purple' },
              { id: 'psp', type: 'hex', x: 485, y: 315, label: 'Stripe PSP', sublabel: 'Called Outside TX!', tone: 'amber', badge: 'no held DB conn', badgeTone: 'green' },
            ],
            edges: [
              { from: 'app', to: 'px', label: '1. 3ms hold + 3. confirm', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'px', to: 'db', label: 'fast SQL', packetColor: 'purple', bidirectional: true, speed: 1.5 },
              { from: 'app', to: 'psp', label: '2. charge (outside TX)', packetColor: 'amber', bidirectional: true, speed: 2.2 },
            ],
            legend: [
              { label: 'fast 3ms ACID SQL', tone: 'green' },
              { label: 'external PSP outside DB lock', tone: 'amber' },
            ],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Shopify Pattern — MySQL 8 / PostgreSQL `FOR UPDATE SKIP LOCKED` SQL',
        codeSnippets: {
          sql: `-- Phase 1: Claim N reservable unit rows in parallel with ZERO lock waiting (3ms TX!)
BEGIN;

SELECT id
FROM inventory_reservation_units
WHERE shop_id = :shop_id
  AND sku_id = :sku_id
  AND (status = 'AVAILABLE' OR (status = 'HELD' AND expires_at < NOW()))
LIMIT :requested_qty
FOR UPDATE SKIP LOCKED;

-- Verify returned row count == :requested_qty (else ROLLBACK -> 409 Sold Out!)
UPDATE inventory_reservation_units
SET status = 'HELD',
    checkout_token = :checkout_token,
    expires_at = NOW() + INTERVAL 5 MINUTE
WHERE id IN (:claimed_ids);

COMMIT; -- Release MySQL connection IMMEDIATELY before calling Stripe!

-- Phase 2 (after Stripe PaymentIntent succeeds): Finalize atomically in same MySQL DB
BEGIN;
UPDATE inventory_reservation_units
SET status = 'COMMITTED', order_id = :order_id
WHERE checkout_token = :checkout_token AND status = 'HELD' AND expires_at > NOW();
INSERT INTO inventory_ledger (sku_id, order_id, delta) VALUES (:sku_id, :order_id, -:requested_qty);
COMMIT;`,
        },
        tradeoffs: [
          { option: 'Redis Lua + MySQL Ledger', bestWhen: 'Soft approximate counters where occasional 0.01% drift is tolerable', pros: 'Sub-millisecond holds, offloads MySQL', cons: 'Two-system seam causes ghost inventory or overselling on crashes' },
          { option: 'MySQL Single Counter Row', bestWhen: 'Low-contention normal e-commerce SKUs (< 50 TPS/SKU)', pros: 'Simple schema, 1 row per SKU', cons: 'Catastrophic lock serialization during flash sales' },
          { option: 'MySQL Bounded Unit Pool + SKIP LOCKED', bestWhen: 'High-contention flash sales requiring 100% strict zero-oversell ACID', pros: 'Single-DB atomicity + parallel lock-skipping claims', cons: 'Requires bounded pool replenishment & strict short-TX connection discipline' },
        ],
        failureModes: [
          {
            title: 'Merchant Uploads 10 Million Stock Units for One SKU',
            mitigation: 'Never pre-insert 10M unit rows! Cap the live reservation pool (e.g., max 2,000 rows per hot SKU) and replenish asynchronously from the parent ledger count as units are committed.',
            interviewProbe: 'What happens to your `inventory_reservation_units` table if a merchant sets stock = 1,000,000?',
          },
        ],
      },
    },

    {
      id: 'wild-slack-kafka-redis',
      title: 'Slack: Kafka in Front of Redis Job Queues',
      subtitle: 'How Slack’s `JQRelay` stopped Redis OOM crashes and dropped background jobs across 1B+ daily async tasks.',
      duration: '10 min',
      level: 'Advanced',
      companies: ['Slack', 'Salesforce', 'Microsoft', 'Amazon'],
      tags: ['slack', 'kafka', 'redis', 'jqrelay', 'job queue', 'backpressure', 'in the wild'],
      objectives: [
        'Understand why pure Redis job queues OOM or drop jobs during consumer slowdowns & failovers',
        'Design the Kafka → `JQRelay` → Redis pattern for durable shock absorption + fast worker execution',
        'Handle priority lanes, retries, and regional failover without losing a single notification or webhook',
      ],
      steps: [
        {
          shortLabel: 'Redis OOM',
          stage: 'PROBLEM',
          title: 'Why pure Redis job queues crash when downstream workers slow down',
          body: [
            'Slack originally pushed every async job (push notifications, link unfurls, webhooks, Slackbot triggers — **billions/day**) directly into **Redis lists** because Redis pops in < 1 ms.',
            '**Failure Mode**: When Apple APNs or a database shard slowed down for 10 minutes, jobs piled up in Redis RAM → Redis hit `maxmemory` OOM and crashed! Even worse, Redis async replication drops queued jobs during primary failover.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Redis is an in-memory cache/fast queue — NEVER make RAM your only durable shock absorber for unbounded traffic bursts!',
          },
          scene: {
            hud: [
              { label: 'BACKLOG SPIKE', value: '20M Jobs Queued', status: 'bad' },
              { label: 'REDIS MEMORY', value: '99% OOM Crash!', status: 'bad' },
              { label: 'FAILOVER', value: 'Jobs Lost ✕', status: 'bad' },
              { label: 'FIX', value: 'Kafka Buffer First', status: 'good' },
            ],
            nodes: [
              { id: 'web', type: 'hex', x: 120, y: 215, label: 'Slack Web', sublabel: '100k jobs/s', tone: 'blue' },
              { id: 'rd', type: 'cache', x: 400, y: 215, label: 'Redis Queue', sublabel: 'RAM Exhausted!', tone: 'coral', badge: 'OOM Crash', badgeTone: 'rose', load: 99 },
              { id: 'wk', type: 'hex', x: 645, y: 215, label: 'Slow Workers', sublabel: 'APNs Stalled', tone: 'amber', dim: true },
            ],
            edges: [
              { from: 'web', to: 'rd', label: 'unbounded push', packetColor: 'coral', speed: 1.3, packetCount: 3 },
              { from: 'rd', to: 'wk', label: 'trickle pop', packetColor: 'amber', dashed: true, speed: 3.4 },
            ],
            legend: [{ label: 'RAM queue overflow', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Kafka + JQRelay',
          stage: 'SOLUTION',
          title: 'Kafka Absorbs Terabytes on Disk; `JQRelay` Meters Jobs Into Redis Safely',
          body: [
            'Slack kept their fast Redis worker fleet unchanged and put **Apache Kafka** right in front! Producers write every job durably to **Kafka** (`acks=all`, disk-backed terabyte retention).',
            'A lightweight Go service (**`JQRelay`**) reads from Kafka and feeds Redis **ONLY when Redis queue depth is below a safe memory watermark**! If workers stall for 2 hours, backlog sits safely on Kafka disks while Redis stays tiny and healthy at 15% RAM!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Whenever you need **durable unbounded buffering + fast Redis-style fine-grained worker retries/delayed jobs**, proposing **Kafka → Relay → Redis** is a Staff-level pattern straight from Slack’s engineering blog!',
          },
          changes: [
            '+Kafka absorbs unlimited multi-hour backlogs safely on replicated disks',
            '+`JQRelay` pauses pulling when Redis hits memory backpressure threshold',
            '~Zero OOM crashes and zero lost jobs during Redis primary failovers',
          ],
          scene: {
            hud: [
              { label: 'DURABILITY', value: 'Kafka Disk (RF=3)', status: 'good' },
              { label: 'REDIS RAM', value: 'Capped ≤ 30% ✓', status: 'good' },
              { label: 'BACKPRESSURE', value: 'JQRelay Pauses', status: 'good' },
              { label: 'RETRIES / DELAY', value: 'Fast Redis ZSET', status: 'good' },
            ],
            nodes: [
              { id: 'web', type: 'hex', x: 95, y: 215, label: 'Slack Web', sublabel: 'Durable Produce', tone: 'blue' },
              { id: 'kf', type: 'queue', x: 265, y: 215, label: 'Kafka Log', sublabel: 'TB Disk Buffer', tone: 'amber', badge: 'shock absorber', badgeTone: 'green' },
              { id: 'rel', type: 'hex', x: 455, y: 215, label: 'JQRelay (Go)', sublabel: 'Backpressure Gate', tone: 'green', badge: 'checks Redis RAM', badgeTone: 'green' },
              { id: 'rd', type: 'cache', x: 645, y: 120, label: 'Redis Workers', sublabel: 'Tiny Hot Window', tone: 'purple', load: 24 },
              { id: 'dlq', type: 'db', x: 645, y: 315, label: 'Retry / DLQ', sublabel: 'Safe Replay', tone: 'slate' },
            ],
            edges: [
              { from: 'web', to: 'kf', label: '100k/s durable', packetColor: 'amber', speed: 1.5 },
              { from: 'kf', to: 'rel', label: 'metered pull', packetColor: 'green', speed: 1.8 },
              { from: 'rel', to: 'rd', label: 'if RAM < 30%', packetColor: 'purple', speed: 1.7 },
              { from: 'rd', to: 'dlq', label: 'replay on crash', packetColor: 'amber', dashed: true, speed: 2.5 },
            ],
            legend: [{ label: 'backpressure-controlled relay', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'wild-figma-multiplayer',
      title: 'Figma: Multiplayer Editing on Simplified CRDTs',
      subtitle: 'How Figma syncs millions of vector canvas nodes in real time using Fractional Indexing + Property-Level LWW Trees.',
      duration: '10 min',
      level: 'Advanced',
      companies: ['Figma', 'Google', 'Microsoft', 'Notion'],
      tags: ['figma', 'crdt', 'fractional indexing', 'lww', 'multiplayer', 'canvas', 'in the wild'],
      objectives: [
        'Understand why Figma skipped complex P2P OT/CRDTs by using a single authoritative room server',
        'Order arbitrary nested canvas layers without renumbering siblings via Fractional Indexing',
        'Support clean per-user Undo/Redo in a multiplayer session without undoing teammates’ work',
      ],
      steps: [
        {
          shortLabel: 'Property LWW',
          stage: 'SOLUTION',
          title: 'Central Authority + Property-Level LWW Tree = 10× Simpler than Academic CRDTs',
          body: [
            'A Figma document is a tree of nodes (`Canvas → Frame → Button → Text`). Instead of locking a whole object, Figma syncs **atomic `(node_id, property_name, value)` mutations**! If Alice moves a rectangle’s `x` while Bob changes its `fillColor`, both merge cleanly with zero conflict!',
            'Because every file connects to **one authoritative Rust WebSocket server**, the server assigns strict arrival order (**Last-Write-Wins per property**) — skipping heavy P2P vector clocks while keeping **instant optimistic local UI updates**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**Fractional Indexing** orders sibling layers using strings/rationals between neighbors: moving Layer C between `0.2` and `0.3` assigns `0.25` — updating **1 single field** instead of shifting 500 array indexes!',
          },
          scene: {
            hud: [
              { label: 'CONFLICT UNIT', value: '(Node, Property)', status: 'good' },
              { label: 'LAYER ORDER', value: 'Fractional Index', status: 'good' },
              { label: 'UI FEEL', value: '0ms Optimistic', status: 'good' },
              { label: 'UNDO SCOPE', value: 'Per-User Inverse', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 105, y: 120, label: 'Alice', sublabel: 'btn.x = 240', tone: 'blue' },
              { id: 'b', type: 'users', x: 105, y: 310, label: 'Bob', sublabel: 'btn.color = #0F9', tone: 'purple' },
              { id: 'srv', type: 'hex', x: 400, y: 215, label: 'Rust Doc Server', sublabel: 'Property LWW Merge', tone: 'green', badge: 'zero conflict!', badgeTone: 'green' },
              { id: 's3', type: 'db', x: 655, y: 215, label: 'Checkpoint S3', sublabel: 'Every 30–60s', tone: 'amber' },
            ],
            edges: [
              { from: 'a', to: 'srv', label: 'prop delta', packetColor: 'blue', bidirectional: true, speed: 1.5 },
              { from: 'b', to: 'srv', label: 'prop delta', packetColor: 'purple', bidirectional: true, speed: 1.5 },
              { from: 'srv', to: 's3', label: 'periodic snapshot', packetColor: 'amber', dashed: true, speed: 2.5 },
            ],
            legend: [{ label: 'property-level multiplayer sync', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Multiplayer Undo',
          stage: 'TECHNIQUE',
          title: 'How Multiplayer Undo Never Erases Your Teammate’s Edits',
          body: [
            'If Alice changes color `Red → Blue`, Bob changes `x: 10 → 50`, and Alice presses `Ctrl+Z`, naive snapshot undo would revert Bob’s move! Figma maintains a **per-user local inverse property stack** (`undo` only emits `color = Red`), updating the stack cleanly whenever remote edits overwrite the same property.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Naming **Fractional Indexing** (also used by Linear & Jira to drag-reorder Kanban cards in O(1) DB writes!) + **Property-Level LWW** impresses any Staff/Principal interviewer!',
          },
          scene: {
            hud: [
              { label: 'ALICE UNDO', value: 'Reverts Color Only', status: 'good' },
              { label: 'BOB POSITION', value: 'Preserved ✓', status: 'good' },
              { label: 'DRAG REORDER', value: '1 Row Update (Frac)', status: 'good' },
              { label: 'OFFLINE REJOIN', value: 'Reconcile Deltas', status: 'info' },
            ],
            nodes: [
              { id: 'st', type: 'queue', x: 165, y: 215, label: 'Alice Undo Stack', sublabel: 'color: Blue→Red', tone: 'purple' },
              { id: 'doc', type: 'hex', x: 525, y: 215, label: 'Live Canvas Node', sublabel: 'x=50 (Bob) · Red ✓', tone: 'green' },
            ],
            edges: [
              { from: 'st', to: 'doc', label: 'apply property inverse', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'surgical property undo', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'wild-meta-zgateway-tao',
      title: 'Meta: Scaling DBs to Millions of Clients (ZGateway & TAO)',
      subtitle: 'How Meta shields ZippyDB & MySQL using `ZGateway` multiplexing proxies, TAO graph caching, and Memcached Leases.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Meta', 'Google', 'Microsoft', 'Amazon'],
      tags: ['meta', 'zgateway', 'tao', 'memcached leases', 'connection pooling', 'zippydb', 'in the wild'],
      objectives: [
        'Solve the N×M connection explosion when 100k app servers connect to 10k DB shards',
        'Design a stateless Database Proxy Tier (`ZGateway`) for multiplexing, routing, caching & shedding',
        'Prevent Cache Stampedes and Stale-Set race bugs using Meta’s Memcached Leases',
      ],
      steps: [
        {
          shortLabel: 'ZGateway Proxy',
          stage: 'SOLUTION',
          title: 'Decoupling 100k Clients from 10k Shards via `ZGateway` Proxy Layer',
          body: [
            'If 100,000 stateless web servers each open 10 TCP connections to every database shard, the database spends 100% of its RAM managing **1,000,000 sockets** and shard topology updates become a nightmare!',
            'Meta inserts a dedicated **`ZGateway` stateless proxy tier** between clients and ZippyDB shards. Clients talk to any local ZGateway; ZGateway **multiplexes connections**, caches shard routing maps, batches hot requests, enforces per-tenant rate limits, and sheds load cleanly!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Same pattern everywhere at scale: **ProxySQL / PgBouncer** (SQL), **Envoy** (RPC), **ZGateway** (Meta KV), and **Twemproxy / Redis Proxy**!',
          },
          scene: {
            hud: [
              { label: 'APP SERVERS', value: '100,000+ Clients', status: 'info' },
              { label: 'DB SOCKETS', value: 'Cut by 98% ✓', status: 'good' },
              { label: 'ROUTING', value: 'Cached at ZGateway', status: 'good' },
              { label: 'OVERLOAD', value: 'Adaptive Shedding', status: 'good' },
            ],
            nodes: [
              { id: 'app', type: 'users', x: 105, y: 215, label: '100k Web Pods', sublabel: 'Thin Clients', tone: 'slate' },
              { id: 'zg', type: 'hex', x: 365, y: 215, label: 'ZGateway Tier', sublabel: 'Mux · Route · RL · Cache', tone: 'green', badge: '98% fewer sockets', badgeTone: 'green', load: 36 },
              { id: 's1', type: 'db', x: 645, y: 120, label: 'ZippyDB Shard 1', sublabel: 'RocksDB + Paxos', tone: 'purple', load: 34 },
              { id: 's2', type: 'db', x: 645, y: 310, label: 'ZippyDB Shard N', sublabel: 'RocksDB + Paxos', tone: 'purple', load: 32 },
            ],
            edges: [
              { from: 'app', to: 'zg', label: 'any gateway', packetColor: 'blue', speed: 1.5, packetCount: 3 },
              { from: 'zg', to: 's1', label: 'pooled mux', packetColor: 'green', speed: 1.6 },
              { from: 'zg', to: 's2', label: 'pooled mux', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'multiplexed proxy pool', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Memcached Leases',
          stage: 'TECHNIQUE',
          title: 'Meta’s Memcached Leases solve BOTH Thundering Herd & Stale Sets in 64 bits',
          body: [
            'In Meta’s famous NSDI paper ("Scaling Memcache at Facebook"), two subtle bugs broke caching at billion-QPS scale: **Thundering Herds** (10k misses hitting MySQL) and **Stale Sets** (slow Reader A writes an outdated DB value into cache *after* Writer B already invalidated the key!).',
            '**Fix — 64-bit Lease Token**: On a cache miss, Memcached hands a **Lease Token** ONLY to the 1st caller (telling the other 9,999 to retry in 10 ms). If a write deletes the key before Caller 1 finishes, Memcached **invalidates the lease token**, rejecting Caller 1’s stale `SET` automatically!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Explaining **Memcached Leases** (64-bit invalidatable token fixing BOTH Thundering Herd and Stale-Set race conditions!) is peak Meta E5/E6 Staff-level mastery!',
          },
          scene: {
            hud: [
              { label: 'CALLER #1', value: 'Gets Lease #881', status: 'good' },
              { label: 'CALLERS #2..999', value: 'Wait 10ms (No DB!)', status: 'good' },
              { label: 'IF KEY DELETED', value: 'Lease #881 Revoked', status: 'warn' },
              { label: 'STALE WRITE', value: 'Rejected ✓', status: 'good' },
            ],
            nodes: [
              { id: 'r1', type: 'hex', x: 130, y: 120, label: 'Reader 1 (Slow)', sublabel: 'Lease #881', tone: 'amber' },
              { id: 'w', type: 'hex', x: 130, y: 310, label: 'Writer (New)', sublabel: 'DELETE key!', tone: 'green' },
              { id: 'mc', type: 'cache', x: 475, y: 215, label: 'Memcached', sublabel: 'Lease #881 Invalidated', tone: 'purple', badge: 'blocks stale SET ✓', badgeTone: 'green' },
            ],
            edges: [
              { from: 'w', to: 'mc', label: 'invalidate lease', packetColor: 'green', speed: 1.6 },
              { from: 'r1', to: 'mc', label: 'stale SET(#881) ✕', packetColor: 'coral', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'lease-protected cache consistency', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'wild-spotify-exabyte-lake',
      title: 'Spotify: Sub-Second Queries on an Exabyte Data Lake',
      subtitle: 'How Spotify’s Random Access Parquet (RAP) serves low-latency point lookups straight from GCS/S3 without duplicating data into Bigtable.',
      duration: '9 min',
      level: 'Advanced',
      companies: ['Spotify', 'Google', 'Databricks', 'Microsoft'],
      tags: ['spotify', 'parquet', 'rap', 'data lake', 'exabyte', 'point lookup', 'bloom filter', 'in the wild'],
      objectives: [
        'Understand the Lakehouse Serving Paradox: cheap Petabyte/Exabyte storage vs costly NoSQL serving copies',
        'See how sorted Parquet Row Groups + Byte-Range Reads + Bloom/Offset Indexes unlock sub-50ms lookups',
        'Know when to keep read-only ML features in Object Storage vs moving to DynamoDB/Bigtable',
      ],
      steps: [
        {
          shortLabel: 'The Copy Tax',
          stage: 'PROBLEM',
          title: 'Copying 500 TB of ML features from Parquet into Bigtable costs millions/year',
          body: [
            'Every night, Spark/Dataflow computes billions of ML recommendation features and writes cheap **Parquet files** to GCS/S3 ($0.02/GB). Historically, serving those features online meant bulk-loading all 500 TB into **Bigtable / Cassandra** — paying 10× more for storage, compaction, and dual-pipeline maintenance!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'For read-only, nightly-refreshed datasets (ML embeddings, wrapped stats, historical archives), paying for 24/7 hot mutable NoSQL clusters is huge FinOps waste.',
          },
          scene: {
            hud: [
              { label: 'LAKE COST', value: '$0.02 / GB (GCS)', status: 'good' },
              { label: 'HOT NOSQL COPY', value: '10× More Cost!', status: 'bad' },
              { label: 'WORKLOAD', value: 'Read-Only Batch', status: 'info' },
              { label: 'GOAL', value: 'Query Lake Direct', status: 'good' },
            ],
            nodes: [
              { id: 'sp', type: 'hex', x: 135, y: 215, label: 'Spark ML Job', sublabel: 'Nightly Features', tone: 'blue' },
              { id: 'gcs', type: 'db', x: 390, y: 120, label: 'GCS Parquet', sublabel: 'Cheap Exabyte', tone: 'green' },
              { id: 'bt', type: 'db', x: 390, y: 315, label: 'Hot Bigtable', sublabel: '10× Duplicate Cost', tone: 'coral', badge: 'expensive copy', badgeTone: 'rose' },
              { id: 'api', type: 'hex', x: 645, y: 215, label: 'Serving API', sublabel: 'Needs 1 User Key', tone: 'purple' },
            ],
            edges: [
              { from: 'sp', to: 'gcs', label: 'write parquet', packetColor: 'green', speed: 1.8 },
              { from: 'gcs', to: 'bt', label: 'costly ETL copy', packetColor: 'coral', dashed: true, speed: 2.3 },
              { from: 'bt', to: 'api', label: 'point lookup', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'avoidable duplicate storage cost', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'RAP Indexing',
          stage: 'SOLUTION',
          title: 'Random Access Parquet (RAP): Hash-Bucketed + Sorted + HTTP Range Reads',
          body: [
            'Spotify’s **RAP** writes Parquet files **bucketed & sorted by `entity_id`** alongside a tiny **Offset/Key Index**. To look up `user_42`, the serving layer hashes to the exact file, binary-searches the cached tiny index in RAM, and issues **1 single HTTP `Range: bytes=40960-45056` read** straight to GCS/S3 (cached on local NVMe)!',
            'Result: **~20–40 ms point lookups** directly off an Exabyte object-store lake at **1/10th the cost**!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'For **immutable batch-generated datasets** (recommendations, analytics lookups, ML feature snapshots), **Sorted Object-Store + HTTP Byte-Range Index + Local NVMe Cache** eliminates entire NoSQL clusters!',
          },
          scene: {
            hud: [
              { label: 'QUERY TIME', value: '20 – 40 ms Direct', status: 'good' },
              { label: 'FETCH METHOD', value: 'HTTP Byte-Range', status: 'good' },
              { label: 'COST SAVINGS', value: '~85% Cheaper ✓', status: 'good' },
              { label: 'MUTABLE WRITES', value: 'No (Batch Swap)', status: 'info' },
            ],
            nodes: [
              { id: 'api', type: 'hex', x: 120, y: 215, label: 'RAP Reader', sublabel: 'hash(user_42)', tone: 'blue' },
              { id: 'idx', type: 'cache', x: 375, y: 120, label: 'RAM Offset Index', sublabel: 'file + byte_offset', tone: 'green', badge: '0.1 ms lookup', badgeTone: 'green' },
              { id: 'gcs', type: 'db', x: 640, y: 215, label: 'GCS/S3 Parquet', sublabel: 'Range: 40KB..44KB', tone: 'purple', badge: '1 range read', badgeTone: 'purple' },
            ],
            edges: [
              { from: 'api', to: 'idx', label: 'find exact bytes', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'api', to: 'gcs', label: 'HTTP Range GET (4KB)', packetColor: 'purple', bidirectional: true, speed: 1.8 },
            ],
            legend: [{ label: 'direct byte-range lake lookup', tone: 'purple' }],
          },
        },
      ],
    },

    {
      id: 'wild-stripe-uber-netflix-ops',
      title: 'Stripe Idempotency, Uber Docstore & Netflix Adaptive Limits',
      subtitle: 'Three iconic Staff-level production patterns: Stripe atomic recovery points, Uber append-only sharded MySQL, and Netflix Little’s Law load shedding.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Stripe', 'Uber', 'Netflix', 'Microsoft'],
      tags: ['stripe', 'idempotency', 'recovery points', 'uber docstore', 'netflix', 'adaptive concurrency', 'in the wild'],
      objectives: [
        'Build Stripe-grade Idempotency Keys with parameter-mismatch rejection and atomic recovery points',
        'Understand Uber’s Docstore/Schemaless (MySQL shards + append-only versioning + Flux CDC)',
        'Replace brittle static thread limits with Netflix Adaptive Concurrency Limits (AIMD / Vegas)',
      ],
      steps: [
        {
          shortLabel: 'Stripe Idem',
          stage: 'TECHNIQUE',
          title: 'Stripe’s Rocket-Grade Idempotency: Recovery Points + Param Hash Guard',
          body: [
            'Basic idempotency caches the final response. **Stripe goes 3 levels deeper**: 1) Hash the request body (`amount, currency, card`) — if a client reuses the same `Idempotency-Key` with a *different* amount, reject immediately with `422 Parameter Mismatch`! 2) Lock the key row (`IN_PROGRESS`) so concurrent duplicate retries wait/409 instead of double-executing!',
            '3) Save **Atomic Recovery Points** inside Postgres after every external side effect (e.g., `CREATED → CHARGED_CARD → LEDGER_POSTED`) so a crash mid-request resumes cleanly from the exact last safe checkpoint!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning **Request Parameter Hash Verification + `IN_PROGRESS` Concurrent Lock + Atomic Recovery Points** turns a standard "add an idempotency key" comment into a Stripe Principal-level answer!',
          },
          scene: {
            hud: [
              { label: 'PARAM GUARD', value: 'SHA-256 Body Hash', status: 'good' },
              { label: 'CONCURRENT DUP', value: 'IN_PROGRESS Lock', status: 'good' },
              { label: 'CRASH RESUME', value: 'Recovery Points', status: 'good' },
              { label: 'DOUBLE CHARGE', value: '0% Guaranteed ✓', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 105, y: 215, label: 'API Retry', sublabel: 'Key + Body Hash', tone: 'slate' },
              { id: 'id', type: 'db', x: 350, y: 215, label: 'Idempotency Row', sublabel: 'State: CHARGED', tone: 'purple', badge: 'recovery point', badgeTone: 'purple' },
              { id: 'rec', type: 'hex', x: 635, y: 120, label: 'Resume Step 3', sublabel: 'Post Ledger Only!', tone: 'green' },
              { id: 'err', type: 'hex', x: 635, y: 310, label: '422 Mismatch', sublabel: 'If Amount Changed', tone: 'coral', dim: true },
            ],
            edges: [
              { from: 'c', to: 'id', label: 'check key + hash', packetColor: 'purple', speed: 1.6 },
              { from: 'id', to: 'rec', label: 'resume safely', packetColor: 'green', speed: 1.6 },
              { from: 'id', to: 'err', label: 'hash mismatch', packetColor: 'coral', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'checkpointed idempotent recovery', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Netflix Vegas',
          stage: 'SOLUTION',
          title: 'Netflix Adaptive Concurrency Limits & Uber Docstore Sharding',
          body: [
            '**Netflix Concurrency Limits**: Static rate limits break whenever a DB slows down or CPU scales up! Inspired by **TCP Vegas congestion control**, each service continuously compares **current latency vs baseline min latency (`RTT_min`)**: when queueing latency creeps up, it automatically shrinks max in-flight concurrency (`AIMD`) and sheds excess requests early — keeping p99 flat even under 5× overload!',
            '**Uber Docstore**: Wraps battle-tested sharded **MySQL InnoDB** nodes with a stateless Query Engine, Raft-managed consensus failover, and **Flux CDC** streaming every change into Kafka/Elasticsearch!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Static limits guess capacity; **Adaptive Concurrency Limits** measure real-time queueing delay via Little’s Law (`L = λW`) and self-tune automatically!',
          },
          scene: {
            hud: [
              { label: 'CONTROL LOOP', value: 'TCP Vegas / AIMD', status: 'good' },
              { label: 'SIGNAL', value: 'Queue Latency Drift', status: 'info' },
              { label: 'UBER STORAGE', value: 'Sharded MySQL + CDC', status: 'good' },
              { label: 'OVERLOAD P99', value: 'Protected Flat ✓', status: 'good' },
            ],
            nodes: [
              { id: 'in', type: 'users', x: 105, y: 215, label: '5× Traffic', sublabel: 'Overload Spike', tone: 'coral' },
              { id: 'lim', type: 'hex', x: 375, y: 215, label: 'Adaptive Limiter', sublabel: 'RTT > Base → Shrink L', tone: 'amber', badge: 'self-tuning', badgeTone: 'green' },
              { id: 'svc', type: 'hex', x: 645, y: 215, label: 'Backend Pool', sublabel: 'p99 Flat @ 22 ms!', tone: 'green', load: 64 },
            ],
            edges: [
              { from: 'in', to: 'lim', label: '5× burst', packetColor: 'coral', speed: 1.4, packetCount: 3 },
              { from: 'lim', to: 'svc', label: 'safe concurrency L', packetColor: 'green', bidirectional: true, speed: 1.6 },
            ],
            legend: [{ label: 'self-tuning overload defense', tone: 'green' }],
          },
        },
      ],
    },
  ],
};
