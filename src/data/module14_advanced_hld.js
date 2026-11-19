// Module 14: 10 Advanced FAANG, Microsoft & Hello Interview HLD Problem Breakdowns

export const MODULE_14_ADVANCED_HLD = {
  id: 'mod-14-advanced-hld',
  number: '14',
  title: 'Advanced HLD Designs (10)',
  track: 'hld',
  lessons: [
    {
      id: 'design-ad-click-aggregator',
      title: 'Design an Ad Click Aggregator (Meta / Google Ads)',
      subtitle: '1M clicks/s ingestion, click-fraud deduplication, Flink 1-min Event-Time Watermarks, ClickHouse OLAP & Lambda exact billing reconciliation.',
      duration: '13 min',
      level: 'Advanced',
      companies: ['Meta', 'Google', 'Amazon', 'Microsoft'],
      tags: ['ad click aggregator', 'flink', 'watermarks', 'clickhouse', 'olap', 'deduplication', 'billing', 'hello interview'],
      objectives: [
        'Ingest 1M ad clicks/sec reliably via Edge Click Redirector + Kafka partitioned by `ad_id`',
        'Prevent double-charging advertisers via signed `impression_id` deduplication + click-fraud filtering',
        'Combine Flink real-time 1-min dashboards (Speed Layer) with Spark nightly exact reconciliation (Billing Layer)',
      ],
      steps: [
        {
          shortLabel: 'Ingest & Dedup',
          stage: 'SETUP',
          title: 'Signed Click Tokens stop replay fraud; Kafka absorbs 1M clicks/sec',
          body: [
            '**Requirements**: Advertisers view real-time clicks per minute (< 60s freshness) AND receive **100% accurate billing invoices** (zero missed or double-counted clicks!). At 1B clicks/day (`~12k avg`, `~100k–1M peak`), direct SQL `UPDATE ads SET clicks = clicks + 1` locks instantly.',
            'When an ad renders, the Ad Server embeds a **cryptographically signed `impression_id`** (HMAC + timestamp). On click, the Edge Redirector validates the signature, immediately sends HTTP `302` to the advertiser landing page, and emits `(ad_id, impression_id, ts)` into **Kafka partitioned by `ad_id`**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Partitioning Kafka by `ad_id` sends all clicks for one ad to the same Flink worker — Watch out for Super Bowl **Hot Ads**! Fix by salting hot `ad_id#0..9` during Stage 1 aggregation, then merging in Stage 2!',
          },
          scene: {
            hud: [
              { label: 'PEAK INGEST', value: '500k Clicks/s', status: 'warn' },
              { label: 'REDIRECT SLA', value: '< 15 ms (302)', status: 'good' },
              { label: 'FRAUD GUARD', value: 'Signed imp_id', status: 'good' },
              { label: 'HOT AD FIX', value: '2-Stage Salt Agg', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 95, y: 215, label: 'Ad Clickers', sublabel: 'Signed Token', tone: 'slate' },
              { id: 'ed', type: 'hex', x: 270, y: 215, label: 'Click Collector', sublabel: 'Verify HMAC + 302', tone: 'green', badge: '< 15ms', badgeTone: 'green' },
              { id: 'kf', type: 'queue', x: 470, y: 215, label: 'Kafka Clicks', sublabel: 'Key: ad_id#salt', tone: 'amber' },
              { id: 'fl', type: 'hex', x: 665, y: 120, label: 'Flink 1m Agg', sublabel: 'Dedup + Watermark', tone: 'blue' },
              { id: 's3', type: 'db', x: 665, y: 315, label: 'Raw S3 Lake', sublabel: 'Exact Billing Replay', tone: 'purple' },
            ],
            edges: [
              { from: 'u', to: 'ed', label: 'click + HMAC', packetColor: 'coral', bidirectional: true, speed: 1.4 },
              { from: 'ed', to: 'kf', label: 'durable log', packetColor: 'amber', speed: 1.5 },
              { from: 'kf', to: 'fl', label: 'real-time stream', packetColor: 'blue', speed: 1.6 },
              { from: 'kf', to: 's3', label: 'immutable archive', packetColor: 'purple', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'fast 302 redirect', tone: 'coral' },
              { label: 'real-time Flink stream', tone: 'blue' },
              { label: 'immutable billing archive', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Flink + Billing',
          stage: 'SOLUTION',
          title: 'Flink Event-Time Watermarks + ClickHouse OLAP + Nightly Exact Reconciliation',
          body: [
            '**Apache Flink** deduplicates duplicate clicks by `impression_id` inside stateful RocksDB (with TTL), aggregates 1-minute tumbling windows using **Event Time + 2-minute Watermarks** (handling delayed mobile clicks!), and writes compact rollups to **ClickHouse / Apache Druid** for sub-second Advertiser dashboards.',
            'Because late clicks arriving 30 minutes later still matter for money, a **Nightly Spark Reconciliation Job** recomputes exact totals from the raw S3 Kafka archive and overwrites/trues up the billing ledger!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Distinguishing **Real-Time Approximate Dashboard (Flink → ClickHouse, < 60s)** from **100% Exact Financial Billing Reconciliation (Spark over Raw S3)** is the #1 Staff differentiator on Hello Interview’s Ad Click Aggregator!',
          },
          scene: {
            hud: [
              { label: 'DASHBOARD LAG', value: '< 30 sec (OLAP)', status: 'good' },
              { label: 'DEDUP STATE', value: 'Flink RocksDB', status: 'good' },
              { label: 'LATE CLICKS', value: 'Watermarks + Reconcile', status: 'good' },
              { label: 'BILLING', value: '100% Exact (Spark)', status: 'good' },
            ],
            nodes: [
              { id: 'fl', type: 'hex', x: 145, y: 125, label: 'Flink Speed Layer', sublabel: '1-min Rollups', tone: 'blue' },
              { id: 'sp', type: 'hex', x: 145, y: 310, label: 'Spark Billing Job', sublabel: 'Exact Raw Dedup', tone: 'purple' },
              { id: 'ch', type: 'db', x: 455, y: 215, label: 'ClickHouse OLAP', sublabel: 'Columnar Rollups', tone: 'green', badge: '< 50ms queries', badgeTone: 'green' },
              { id: 'adv', type: 'users', x: 675, y: 215, label: 'Advertisers', sublabel: 'Live Dash + Invoice', tone: 'slate' },
            ],
            edges: [
              { from: 'fl', to: 'ch', label: '1m increments', packetColor: 'blue', speed: 1.6 },
              { from: 'sp', to: 'ch', label: 'exact truth overwrite', packetColor: 'purple', dashed: true, speed: 2.5 },
              { from: 'ch', to: 'adv', label: 'fast OLAP SQL', packetColor: 'green', bidirectional: true, speed: 1.6 },
            ],
            legend: [{ label: 'speed + exact billing convergence', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        capacityMath: [
          { label: 'Peak Click Volume', value: '100k – 500k clicks/sec', formula: '1B clicks/day ≈ 12k avg; Super Bowl peaks 10–40×' },
          { label: 'Raw Event Storage', value: '~100 GB/day (~180 TB/5yr)', formula: '1B × 100 bytes/event compressed Parquet in S3' },
        ],
        failureModes: [
          {
            title: 'Hot Ad Skew Starving One Flink Partition (e.g., Nike Super Bowl Ad)',
            mitigation: 'Append a random shard salt (`ad_id#0..15`) for Stage 1 partial counting across 16 Flink slots, then perform a tiny Stage 2 sum by `ad_id` (only 16 rows/min)!',
            interviewProbe: 'What happens if 40% of all clicks globally hit ONE single ad campaign during the World Cup final?',
          },
        ],
      },
    },

    {
      id: 'design-leetcode-judge',
      title: 'Design an Online Code Judge (LeetCode)',
      subtitle: 'Secure untrusted code execution with Firecracker microVMs / gVisor, pre-warmed sandbox pools, SSE verdicts & live contest leaderboards.',
      duration: '12 min',
      level: 'Intermediate',
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
      tags: ['leetcode', 'code execution', 'firecracker', 'sandbox', 'seccomp', 'cgroups', 'contest leaderboard', 'hello interview'],
      objectives: [
        'Execute untrusted user C++/Python/Java code safely without container escapes or fork bombs',
        'Keep submission latency < 2s using a Pre-Warmed Firecracker / gVisor Sandbox Pool',
        'Rank 50,000 live contest participants in O(log N) via Redis Sorted Sets',
      ],
      steps: [
        {
          shortLabel: 'Safe Sandboxing',
          stage: 'PROBLEM',
          title: 'Untrusted user code WILL try fork bombs, crypto-mining & kernel exploits!',
          body: [
            'Running user-submitted C++ or Python directly in a standard Docker container on shared host kernels risks **kernel privilege escalation**, `while(1) fork()` fork bombs, 100 GB RAM OOM attacks, and outbound DDoS calls!',
            '**Defense-in-Depth**: Execute every submission inside an ephemeral **Firecracker microVM** (AWS Lambda isolation — dedicated guest kernel booting in ~125 ms!) or **gVisor**, locked down with **`--network=none`**, **cgroups** (1 vCPU, 256 MB RAM, 2-sec wall timeout), **read-only filesystem**, and **seccomp-bpf** syscall allowlists!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Naming **Firecracker microVMs (dedicated kernel isolation) + `cgroups` CPU/RAM caps + `seccomp-bpf` + `--network=none` + Ephemeral Destroy-After-Run** is the gold-standard security answer!',
          },
          scene: {
            hud: [
              { label: 'ISOLATION', value: 'Firecracker microVM', status: 'good' },
              { label: 'NETWORK', value: 'Disabled (Air-Gap)', status: 'good' },
              { label: 'LIMITS', value: '2s · 256MB · 1 vCPU', status: 'info' },
              { label: 'CLEANUP', value: 'Destroy After Run', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 95, y: 215, label: 'Coder', sublabel: 'Submit C++/Py', tone: 'slate' },
              { id: 'api', type: 'hex', x: 265, y: 215, label: 'Submit API', sublabel: 'Returns sub_id', tone: 'blue' },
              { id: 'q', type: 'queue', x: 455, y: 215, label: 'Lang Queues', sublabel: 'C++ · Java · Py', tone: 'amber' },
              { id: 'vm', type: 'hex', x: 655, y: 215, label: 'Firecracker Pool', sublabel: 'Pre-Warmed Sandboxes', tone: 'green', badge: 'zero escape ✓', badgeTone: 'green', load: 54 },
            ],
            edges: [
              { from: 'u', to: 'api', label: 'POST /submit', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'api', to: 'q', label: 'enqueue job', packetColor: 'amber', speed: 1.6 },
              { from: 'q', to: 'vm', label: 'run 100 tests', packetColor: 'green', speed: 1.5 },
            ],
            legend: [{ label: 'isolated sandbox execution', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Pool & Contest',
          stage: 'SOLUTION',
          title: 'Pre-Warmed Language Pools + Compiled Binary Reuse + Live Contest Rank',
          body: [
            '1) **Speed**: Maintain a **Pre-Warmed Sandbox Pool** per language runtime (Python/Node/JVM already booted!) and compile C++/Java **ONCE** inside the sandbox, streaming all 100 test cases via stdin/stdout in a single execution loop (fail fast on first Wrong Answer / TLE!).',
            '2) **Results & Contests**: Push verdict (`Accepted · 14 ms`) to the user via **SSE / WebSocket** (no wasteful polling!) and update weekly contest scores (`score = solved * 1e9 - penalty_sec`) in a **Redis Sorted Set (`ZADD` / `ZREVRANK`)** in O(log N)!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'During a Sunday Contest (50,000 simultaneous submissions at minute 5!), isolate **Contest Queue** from **Regular Practice Queue** and pre-scale sandbox workers 15 minutes before start!',
          },
          scene: {
            hud: [
              { label: 'COLD START', value: '0 ms (Warm Pool)', status: 'good' },
              { label: 'TEST CASES', value: 'S3 + Local NVMe', status: 'info' },
              { label: 'VERDICT PUSH', value: 'SSE Stream', status: 'good' },
              { label: 'LEADERBOARD', value: 'Redis ZSET O(logN)', status: 'good' },
            ],
            nodes: [
              { id: 'vm', type: 'hex', x: 140, y: 215, label: 'Sandbox Worker', sublabel: 'AC · 14ms · 42MB', tone: 'green' },
              { id: 'db', type: 'db', x: 430, y: 115, label: 'Submissions DB', sublabel: 'History + Code', tone: 'purple' },
              { id: 'lb', type: 'cache', x: 430, y: 315, label: 'Redis ZSET', sublabel: 'Live Contest Rank', tone: 'amber', badge: 'ZREVRANK O(logN)', badgeTone: 'amber' },
              { id: 'sse', type: 'users', x: 665, y: 215, label: 'Browser UI', sublabel: 'Instant Verdict!', tone: 'blue' },
            ],
            edges: [
              { from: 'vm', to: 'db', label: 'save verdict', packetColor: 'purple', speed: 1.7 },
              { from: 'vm', to: 'lb', label: 'update score', packetColor: 'amber', speed: 1.6 },
              { from: 'db', to: 'sse', label: 'SSE push', packetColor: 'green', speed: 1.5 },
            ],
            legend: [{ label: 'verdict + live leaderboard', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-top-k-heavy-hitters',
      title: 'Design Top-K Trending / Heavy Hitters',
      subtitle: 'Finding the Top-100 viral videos/hashtags across 1M events/sec using Count-Min Sketch, Min-Heaps & Multi-Window Rollups.',
      duration: '10 min',
      level: 'Advanced',
      companies: ['YouTube', 'Twitter/X', 'TikTok', 'Google'],
      tags: ['top k', 'heavy hitters', 'count-min sketch', 'min-heap', 'streaming', 'trending', 'hello interview'],
      objectives: [
        'Explain why an exact HashMap across 500M distinct items OOMs single stream processors',
        'Use Count-Min Sketch (probabilistic O(1) RAM frequency estimator) + Bounded Size-K Min-Heap',
        'Support arbitrary sliding windows (Last 5 min / 1 hr / 24 hr) via time-bucketed merges',
      ],
      steps: [
        {
          shortLabel: 'Count-Min Sketch',
          stage: 'SOLUTION',
          title: 'Count-Min Sketch + Size-K Min-Heap tracks Heavy Hitters in just 10 MB RAM!',
          body: [
            'Counting exact views for 1 Billion distinct video IDs across 100 stream workers takes **tens of gigabytes of RAM** and massive network shuffles. Yet we ONLY care about the **Top 100 Heavy Hitters**!',
            '**Count-Min Sketch** uses a tiny `d × w` 2D integer matrix (`d = 5` hash functions, `w = 100k` columns = **2 MB RAM!**): on each view, increment `grid[i][hash_i(id)]++`; estimate frequency as **`min_i(grid[i][hash_i(id)])`** (never under-counts!). Pair with a **Min-Heap of size K = 100** to emit local Top-K every 10 seconds!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'For **Fast Path (1-min / 1-hr Trending)**, Count-Min Sketch + Heap gives sub-second results in tiny RAM; for **All-Time Exact Charts**, pair with partitioned Flink/MapReduce exact counters!',
          },
          scene: {
            hud: [
              { label: 'SKETCH RAM', value: '~2–10 MB Fixed!', status: 'good' },
              { label: 'UPDATE TIME', value: 'O(d) = 5 Hashes', status: 'good' },
              { label: 'TOP-K HEAP', value: 'Size K = 100', status: 'good' },
              { label: 'WINDOWS', value: '5m · 1h · 24h', status: 'info' },
            ],
            nodes: [
              { id: 'kf', type: 'queue', x: 105, y: 215, label: 'View Stream', sublabel: '1M events/sec', tone: 'amber' },
              { id: 'cm1', type: 'hex', x: 350, y: 120, label: 'Fast Path (CMS)', sublabel: 'Count-Min + Heap', tone: 'green', badge: '2 MB RAM!', badgeTone: 'green' },
              { id: 'ex', type: 'hex', x: 350, y: 315, label: 'Exact MapReduce', sublabel: '24h / 7d Truth', tone: 'purple' },
              { id: 'rd', type: 'cache', x: 635, y: 215, label: 'Trending Redis', sublabel: 'Top-100 Merged', tone: 'blue', badge: '1 ms API read', badgeTone: 'blue' },
            ],
            edges: [
              { from: 'kf', to: 'cm1', label: 'stream', packetColor: 'green', speed: 1.4, packetCount: 3 },
              { from: 'kf', to: 'ex', label: 'partitioned agg', packetColor: 'purple', dashed: true, speed: 2.3 },
              { from: 'cm1', to: 'rd', label: 'flush Top-100 / 10s', packetColor: 'blue', speed: 1.7 },
              { from: 'ex', to: 'rd', label: 'exact 24h chart', packetColor: 'purple', dashed: true, speed: 2.4 },
            ],
            legend: [{ label: 'Count-Min Sketch fast path', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Sliding Buckets',
          stage: 'TECHNIQUE',
          title: 'Multi-Window Trending: Merge 1-Minute Buckets Without Re-Scanning Raw Logs',
          body: [
            'To serve **"Trending in Last 1 Hour"** AND **"Last 24 Hours"**, store each 1-minute Top-K rollup (or CMS sketch — **Count-Min Sketches are linearly additive!** `CMS(1h) = ∑ CMS(1m_1..60)`!). Adding the new minute and subtracting the 61st minute keeps sliding Top-K fresh every second!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Noting that **Count-Min Sketches are mergeable across shards and time buckets simply by matrix addition** is an instant Google/Meta Staff-level highlight!',
          },
          scene: {
            hud: [
              { label: 'MERGE PROPERTY', value: 'Matrix Sum (CMS)', status: 'good' },
              { label: 'FRESHNESS', value: 'Every 10 sec', status: 'good' },
              { label: 'VELOCITY SCORE', value: 'Z-Score Spike', status: 'info' },
              { label: 'CACHE READ', value: 'CDN / Redis 1ms', status: 'good' },
            ],
            nodes: [
              { id: 'b1', type: 'cache', x: 145, y: 120, label: 'Bucket t-1m', sublabel: 'CMS Matrix', tone: 'green' },
              { id: 'b2', type: 'cache', x: 145, y: 310, label: 'Bucket t-60m', sublabel: 'Expired (Subtract)', tone: 'coral', dim: true },
              { id: 'm', type: 'hex', x: 455, y: 215, label: 'Window Merger', sublabel: 'Add New · Drop Old', tone: 'purple' },
              { id: 'api', type: 'users', x: 675, y: 215, label: 'Trending Tab', sublabel: 'Top-100 Videos', tone: 'blue' },
            ],
            edges: [
              { from: 'b1', to: 'm', label: '+new min', packetColor: 'green', speed: 1.6 },
              { from: 'b2', to: 'm', label: '-old min', packetColor: 'coral', dashed: true, speed: 2.3 },
              { from: 'm', to: 'api', label: 'instant rank', packetColor: 'blue', speed: 1.6 },
            ],
            legend: [{ label: 'sliding additive window', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-fb-live-comments',
      title: 'Design Live Video Comments (FB Live / Twitch)',
      subtitle: 'Broadcasting comments to 10M simultaneous viewers on ONE live stream via a Hierarchical SSE Fan-Out Tree.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Meta', 'Twitch', 'YouTube', 'Disney+ Hotstar'],
      tags: ['live comments', 'facebook live', 'twitch', 'sse', 'fanout tree', 'pub sub', 'hello interview'],
      objectives: [
        'Solve Extreme Single-Room Fan-Out: 10,000 comments/sec broadcast to 10M viewers on ONE video',
        'Replace naive 1-tier Pub/Sub with a Hierarchical Regional SSE Fan-Out Tree',
        'Batch comment frames every 200ms and apply Slow-Mode / Sampling when chat explodes',
      ],
      steps: [
        {
          shortLabel: 'Fan-Out Tree',
          stage: 'SOLUTION',
          title: 'Hierarchical SSE Fan-Out Tree scales 1 Live Room to 10M+ Viewers',
          body: [
            'In 1:1 WhatsApp, 1 write fans out to 1 recipient. In **Facebook Live / Twitch**, 1 comment fans out to **10,000,000 live viewers simultaneously**! A single Redis Pub/Sub node collapses past ~500 subscribers.',
            '**Architecture**: 1) Writers POST comments via standard REST (`POST /videos/{id}/comments`) → persisted to Cassandra + published to **Kafka (`key = video_id`)**. 2) **Regional Aggregator Nodes** subscribe to Kafka and fan out to **100 Edge SSE Push Servers** (each holding 100k read-only SSE streams) — forming a **2-tier broadcast tree**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Why **REST (POST) for writing + SSE for reading** instead of WebSockets? 99% of viewers only READ comments! SSE over HTTP/2 scales seamlessly behind standard L7 CDNs/load balancers with native reconnect + `Last-Event-ID` cursor catchup!',
          },
          scene: {
            hud: [
              { label: 'LIVE VIEWERS', value: '10M on 1 Stream', status: 'warn' },
              { label: 'PROTOCOL', value: 'POST + SSE Tree', status: 'good' },
              { label: 'BATCH FRAME', value: 'Every 200 ms', status: 'good' },
              { label: 'CHAT STORM', value: 'Sample / Slow-Mode', status: 'good' },
            ],
            nodes: [
              { id: 'w', type: 'users', x: 95, y: 215, label: 'Commenters', sublabel: 'POST /comment', tone: 'slate' },
              { id: 'kf', type: 'queue', x: 265, y: 215, label: 'Kafka Room', sublabel: 'video_id Partition', tone: 'amber' },
              { id: 'reg', type: 'hex', x: 455, y: 215, label: 'Regional Fanout', sublabel: 'Batch 200ms Frames', tone: 'purple', badge: 'Tier 1 Hub', badgeTone: 'purple' },
              { id: 'e1', type: 'hex', x: 655, y: 115, label: 'SSE Edge 1..50', sublabel: '5M US Viewers', tone: 'green' },
              { id: 'e2', type: 'hex', x: 655, y: 315, label: 'SSE Edge 51..100', sublabel: '5M EU/APAC Viewers', tone: 'green' },
            ],
            edges: [
              { from: 'w', to: 'kf', label: 'POST + persist', packetColor: 'amber', speed: 1.5 },
              { from: 'kf', to: 'reg', label: '1 stream', packetColor: 'purple', speed: 1.5 },
              { from: 'reg', to: 'e1', label: 'batched SSE', packetColor: 'green', speed: 1.4, packetCount: 3 },
              { from: 'reg', to: 'e2', label: 'batched SSE', packetColor: 'green', speed: 1.4, packetCount: 3 },
            ],
            legend: [{ label: '2-tier SSE broadcast fan-out', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Chat Storm Guard',
          stage: 'TECHNIQUE',
          title: 'Human Eyes Can Only Read ~10 Comments/Sec — Batch, Sample & Moderate!',
          body: [
            'When a goal is scored and 50,000 viewers type "GOAL!!" in 1 second, pushing 50,000 DOM updates/sec crashes mobile browsers! **Edge Fanout** batches frames every **200 ms**, caps broadcast at ~20 comments/sec (always showing the commenter’s *own* post optimistically!), and pipes writes through an async ML toxicity filter!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Connecting **product physics** ("humans cannot read > 15 comments/sec on a phone") to **systems savings** (sampling/batching cuts mobile egress by 99%) is peak Meta Product Architecture!',
          },
          scene: {
            hud: [
              { label: 'INCOMING BURST', value: '50k msgs/sec', status: 'warn' },
              { label: 'PUSH CAP', value: '20 msgs/sec / UI', status: 'good' },
              { label: 'EGRESS SAVED', value: '99% Bandwidth!', status: 'good' },
              { label: 'OWN COMMENT', value: 'Optimistic Echo ✓', status: 'good' },
            ],
            nodes: [
              { id: 'b', type: 'queue', x: 145, y: 215, label: '50k/s Burst', sublabel: 'Goal Scored!', tone: 'coral' },
              { id: 's', type: 'hex', x: 400, y: 215, label: 'Sampler + Batch', sublabel: 'Top 20/sec + VIPs', tone: 'green', badge: 'protects mobile CPU', badgeTone: 'green' },
              { id: 'v', type: 'users', x: 650, y: 215, label: '10M Phones', sublabel: 'Smooth 60fps Chat', tone: 'blue' },
            ],
            edges: [
              { from: 'b', to: 's', label: '50k/s raw', packetColor: 'coral', speed: 1.4 },
              { from: 's', to: 'v', label: 'smooth 20/s SSE', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'human-paced sampled broadcast', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-post-search',
      title: 'Design Real-Time Post Search (Facebook / X)',
      subtitle: 'Near-real-time Inverted Indexes, Document-Partitioned Scatter-Gather, Two-Stage BM25 + ML Personalization & Early Termination.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Meta', 'Twitter/X', 'Google', 'Microsoft'],
      tags: ['search', 'inverted index', 'elasticsearch', 'scatter gather', 'bm25', 'document partitioning', 'hello interview'],
      objectives: [
        'Index 500M new posts/day into searchable inverted index segments in < 10 seconds',
        'Justify Document-Partitioned Sharding (scatter-gather) vs Term-Partitioned Sharding (hot-word bottleneck)',
        'Rank billions of matching documents fast via Two-Stage Retrieval (BM25 + ML Personalization) & Early Termination',
      ],
      steps: [
        {
          shortLabel: 'Doc Partitioning',
          stage: 'SOLUTION',
          title: 'Why Document-Partitioned Shards Beat Term-Partitioned Shards',
          body: [
            'If you shard an Inverted Index by **Term** (`"the"`, `"breaking"` on Shard 1), every multi-word query (`"system design interview"`) must ship huge posting lists across the network to intersect them AND hot words crush 1 shard!',
            '**Document-Partitioned Sharding** (Elasticsearch, Meta Unicorn, X Earlybird) shards posts by `hash(post_id)` across `N` shards. Each shard builds a local inverted index. On query, the **Aggregator** scatters to all shards in parallel, each shard intersects locally and returns ONLY its **Top 50 IDs**, and the Aggregator merges & ranks!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Sort posting lists **newest-first** (recency-ordered segments in RAM) so the shard stops scanning as soon as it collects 50 fresh high-engagement hits (**Early Termination**) — cutting search p99 to < 80 ms!',
          },
          scene: {
            hud: [
              { label: 'SHARDING', value: 'By post_id (Doc)', status: 'good' },
              { label: 'INDEX FRESHNESS', value: '< 5 sec NRT', status: 'good' },
              { label: 'SEARCH P99', value: '< 100 ms', status: 'good' },
              { label: 'OPTIMIZATION', value: 'Early Termination', status: 'good' },
            ],
            nodes: [
              { id: 'q', type: 'users', x: 95, y: 215, label: 'Search Query', sublabel: '"microsoft l63"', tone: 'slate' },
              { id: 'agg', type: 'hex', x: 275, y: 215, label: 'Search Aggregator', sublabel: 'Scatter → Merge Top50', tone: 'blue' },
              { id: 's1', type: 'db', x: 525, y: 105, label: 'Index Shard 1', sublabel: 'Local Inverted + RAM', tone: 'green' },
              { id: 's2', type: 'db', x: 525, y: 215, label: 'Index Shard 2', sublabel: 'Local Inverted + RAM', tone: 'green' },
              { id: 's3', type: 'db', x: 525, y: 325, label: 'Index Shard N', sublabel: 'Local Inverted + RAM', tone: 'green' },
              { id: 'ml', type: 'hex', x: 690, y: 215, label: 'ML Ranker', sublabel: 'Social Graph Boost', tone: 'purple' },
            ],
            edges: [
              { from: 'q', to: 'agg', label: 'query', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'agg', to: 's1', label: 'Top 50', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'agg', to: 's2', label: 'Top 50', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'agg', to: 's3', label: 'Top 50', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'agg', to: 'ml', label: 'rerank Top 20', packetColor: 'purple', bidirectional: true, speed: 1.8 },
            ],
            legend: [{ label: 'parallel document-partitioned search', tone: 'green' }],
          },
        },
        {
          shortLabel: 'NRT Indexing',
          stage: 'TECHNIQUE',
          title: 'Near-Real-Time Indexing: Kafka → Tokenizer → Immutable RAM Segments',
          body: [
            'New posts flow from Kafka into an **Indexer Pipeline** (lowercase, stem, strip stop-words, extract hashtags/mentions, generate vector embeddings for hybrid search) and append into tiny in-memory Lucene segments refreshed every 1–5 seconds before background segment merging!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'In scatter-gather across 50 shards, 1 slow shard delays everyone! Apply **Hedged Reads to shard replicas** and strict **120 ms shard deadlines** (returning 49/50 shards beats failing the search!).',
          },
          scene: {
            hud: [
              { label: 'INGESTION', value: 'Kafka → Indexer', status: 'good' },
              { label: 'REFRESH', value: 'Every 2 sec RAM', status: 'good' },
              { label: 'TAIL GUARD', value: 'Partial 49/50 OK', status: 'good' },
              { label: 'PRIVACY', value: 'Friend/ACL Filter', status: 'info' },
            ],
            nodes: [
              { id: 'kf', type: 'queue', x: 135, y: 215, label: 'Post Kafka', sublabel: '6k posts/sec', tone: 'amber' },
              { id: 'idx', type: 'hex', x: 390, y: 215, label: 'Text + Embed Pipeline', sublabel: 'Tokenize · Stem', tone: 'purple' },
              { id: 'seg', type: 'db', x: 645, y: 215, label: 'NRT RAM Segments', sublabel: 'Searchable in 2s!', tone: 'green' },
            ],
            edges: [
              { from: 'kf', to: 'idx', label: 'new posts', packetColor: 'amber', speed: 1.6 },
              { from: 'idx', to: 'seg', label: 'append segment', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'near-real-time search indexing', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-stock-exchange',
      title: 'Design a Stock Exchange (NASDAQ / Coinbase)',
      subtitle: 'Sub-millisecond Single-Threaded Deterministic Matching Engine, LMAX Disruptor Ring Buffer, Limit Order Book & Event Sourcing.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Coinbase', 'Bloomberg', 'Citadel', 'Robinhood'],
      tags: ['stock exchange', 'matching engine', 'limit order book', 'lmax disruptor', 'event sourcing', 'fix protocol', 'low latency'],
      objectives: [
        'Explain why the core Matching Engine runs SINGLE-THREADED in RAM (zero lock contention, deterministic!)',
        'Design the Price-Time Priority Limit Order Book (Sorted Tree of Price Levels + FIFO Doubly-Linked Queue)',
        'Achieve instant crash recovery & auditability via Event Sourcing Sequencer + Deterministic Replay',
      ],
      steps: [
        {
          shortLabel: 'Single-Thread Core',
          stage: 'INSIGHT',
          title: 'Counter-Intuitive Truth: Single-Threaded RAM Engine = 1M+ Orders/Sec!',
          body: [
            'Most candidates try to put a SQL database or multi-threaded mutexes inside a Stock Exchange Matching Engine — that destroys latency (milliseconds instead of microseconds!) and causes lock contention.',
            '**Real Exchanges (NASDAQ, LMAX, Coinbase)**: Shard by **Stock Symbol** (`AAPL` on Core 1, `MSFT` on Core 2). Each symbol’s **Matching Engine** is a **single-threaded, lock-free, pinned CPU loop** reading from a **Sequencer Ring Buffer (LMAX Disruptor)** with ZERO disk I/O and ZERO network calls on the hot path!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**Order Book Data Structure**: `Bids` (Max-Tree) and `Asks` (Min-Tree) map `price → DoublyLinkedList<Order>` (FIFO time priority) + `HashMap<orderId, Node*>` for **O(1) cancel** and **O(1) best-price match**!',
          },
          scene: {
            hud: [
              { label: 'MATCH LATENCY', value: '< 10 µs (RAM)', status: 'good' },
              { label: 'HOT PATH LOCKS', value: 'Zero (1 Thread/Sym)', status: 'good' },
              { label: 'ORDER BOOK', value: 'Tree + FIFO DLL + Map', status: 'info' },
              { label: 'DURABILITY', value: 'Event-Sourced Log', status: 'good' },
            ],
            nodes: [
              { id: 'gw', type: 'hex', x: 100, y: 215, label: 'FIX Gateway', sublabel: 'Risk & Balance Check', tone: 'blue' },
              { id: 'seq', type: 'queue', x: 285, y: 215, label: 'Sequencer', sublabel: 'LMAX Ring + Raft Log', tone: 'amber', badge: 'strict seq #', badgeTone: 'amber' },
              { id: 'me', type: 'hex', x: 495, y: 215, label: 'Matching Engine', sublabel: 'Single-Thread AAPL', tone: 'green', badge: '< 10 µs match!', badgeTone: 'green', load: 42 },
              { id: 'md', type: 'hex', x: 675, y: 120, label: 'Market Data', sublabel: 'UDP Multicast / WS', tone: 'purple' },
              { id: 'bk', type: 'hex', x: 675, y: 315, label: 'Hot Standby', sublabel: 'Deterministic Replica', tone: 'blue' },
            ],
            edges: [
              { from: 'gw', to: 'seq', label: 'validated order', packetColor: 'blue', speed: 1.5 },
              { from: 'seq', to: 'me', label: 'ring buffer', packetColor: 'green', speed: 1.3, packetCount: 3 },
              { from: 'me', to: 'md', label: 'L2 book / trades', packetColor: 'purple', speed: 1.4 },
              { from: 'seq', to: 'bk', label: 'same input stream', packetColor: 'amber', dashed: true, curve: 70, speed: 1.6 },
            ],
            legend: [{ label: 'lock-free deterministic matching loop', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Event Sourcing',
          stage: 'SOLUTION',
          title: 'Deterministic Event Sourcing Gives Instant Hot-Standby Failover',
          body: [
            'How does an in-memory Matching Engine survive a server crash without losing a single trade? Every incoming command passes through the replicated **Input Sequencer Log** FIRST. A **Hot Standby Matching Engine** consumes the exact same ordered sequence in parallel — because matching is 100% deterministic, Standby’s RAM Order Book is **bit-for-bit identical** and takes over in milliseconds!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Pair this with **Pre-Trade Risk Checks** (verify user has sufficient buying power & reserve cash *before* entering the Sequencer) + **Regulatory Immutable Audit Trail** directly from the Event Log!',
          },
          scene: {
            hud: [
              { label: 'FAILOVER', value: 'Hot Standby (< 10ms)', status: 'good' },
              { label: 'AUDIT TRAIL', value: '100% Replayable', status: 'good' },
              { label: 'RISK ENGINE', value: 'Pre-Trade Reserve', status: 'good' },
              { label: 'SHARD KEY', value: 'By Ticker Symbol', status: 'info' },
            ],
            nodes: [
              { id: 'log', type: 'queue', x: 165, y: 215, label: 'Replicated Event Log', sublabel: 'Order #1..#9,812,004', tone: 'amber' },
              { id: 'p', type: 'hex', x: 475, y: 120, label: 'Primary Engine', sublabel: 'Live Active', tone: 'green' },
              { id: 's', type: 'hex', x: 475, y: 310, label: 'Standby Engine', sublabel: 'Bit-Identical RAM', tone: 'blue', badge: 'instant takeover', badgeTone: 'blue' },
            ],
            edges: [
              { from: 'log', to: 'p', label: 'exact stream', packetColor: 'green', speed: 1.5 },
              { from: 'log', to: 's', label: 'exact stream', packetColor: 'blue', speed: 1.5 },
            ],
            legend: [{ label: 'deterministic state-machine replication', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-hotel-airbnb',
      title: 'Design Hotel & Vacation Booking (Airbnb / Booking)',
      subtitle: 'Geo + Date availability search, zero double-booking via room-type inventory counters + pessimistic/optimistic locks, and payment escrow.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Airbnb', 'Booking.com', 'Expedia', 'Amazon'],
      tags: ['airbnb', 'hotel booking', 'overbooking', 'availability', 'optimistic locking', 'elasticsearch', 'escrow'],
      objectives: [
        'Model room-type inventory per `(hotel_id, room_type, date)` cleanly (NOT individual room numbers!)',
        'Prevent double-booking across multi-night stays atomically (`check_in .. check_out - 1`)',
        'Separate high-QPS Availability Search (Elasticsearch + Cache) from ACID Reservation Commits',
      ],
      steps: [
        {
          shortLabel: 'Date Inventory',
          stage: 'SOLUTION',
          title: 'Model `(hotel_id, room_type_id, date)` Rows — Lock All Stay Nights Atomically!',
          body: [
            'Hotels don’t sell "Room #304" online — they sell **Room Types** ("King Deluxe", 40 total rooms). Store 1 row per `(hotel_id, room_type_id, date)` holding `(total_inventory, total_reserved)`!',
            'Booking a 3-night stay (May 10–13) runs ONE ACID transaction in PostgreSQL: `SELECT * FROM room_inventory WHERE room_type_id = ? AND date IN ("05-10","05-11","05-12") ORDER BY date FOR UPDATE` → verify `total_reserved + 1 <= total_inventory * 1.1` (if 10% overbooking allowed, else `1.0`) → increment all 3 rows + insert `reservation` with **`Idempotency-Key`**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Always `ORDER BY date` in `SELECT ... FOR UPDATE` when locking multi-night date ranges so overlapping bookings (`May 10–12` and `May 11–13`) acquire row locks in the exact same order — zero deadlocks!',
          },
          scene: {
            hud: [
              { label: 'SEARCH QPS', value: '50k/s (Elastic)', status: 'info' },
              { label: 'BOOKING TPS', value: '500/s (Postgres)', status: 'good' },
              { label: 'DOUBLE BOOK', value: '0% (Multi-Night TX)', status: 'good' },
              { label: 'DEADLOCK FIX', value: 'ORDER BY date', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 100, y: 215, label: 'Travelers', sublabel: 'Search & Book', tone: 'slate' },
              { id: 'es', type: 'db', x: 350, y: 115, label: 'Elasticsearch', sublabel: 'Geo + Filters + Dates', tone: 'amber', badge: '50k reads/s', badgeTone: 'amber' },
              { id: 'bk', type: 'hex', x: 350, y: 315, label: 'Booking Svc', sublabel: 'Idem-Key + Escrow', tone: 'blue' },
              { id: 'pg', type: 'db', x: 640, y: 315, label: 'Postgres Inventory', sublabel: '(room_type, date)', tone: 'purple', badge: 'ACID lock', badgeTone: 'green' },
              { id: 'cdc', type: 'queue', x: 640, y: 115, label: 'CDC Sync', sublabel: 'Update Search Index', tone: 'green' },
            ],
            edges: [
              { from: 'u', to: 'es', label: 'browse listings', packetColor: 'amber', bidirectional: true, speed: 1.6 },
              { from: 'u', to: 'bk', label: 'POST /book', packetColor: 'blue', bidirectional: true, speed: 1.8 },
              { from: 'bk', to: 'pg', label: 'lock 3 nights', packetColor: 'purple', bidirectional: true, speed: 1.6 },
              { from: 'pg', to: 'cdc', label: 'sold out event', packetColor: 'green', dashed: true, speed: 2.1 },
              { from: 'cdc', to: 'es', label: 'refresh availability', packetColor: 'green', dashed: true, speed: 2.1 },
            ],
            legend: [{ label: 'search vs strict ACID booking', tone: 'purple' }],
          },
        },
        {
          shortLabel: 'Airbnb Listings',
          stage: 'TECHNIQUE',
          title: 'Airbnb Unique Homes + Dynamic Pricing + Host Payout Escrow',
          body: [
            'For **Airbnb** (where `total_inventory == 1` unique home), use a PostgreSQL **Exclusion Constraint (`EXCLUDE USING gist (listing_id WITH =, daterange WITH &&)`)** so overlapping date ranges for the same apartment are physically rejected by the database engine itself! Hold funds in an **Escrow Ledger** and release to Host 24h after check-in.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Citing PostgreSQL’s native `daterange` **GiST Exclusion Constraint** for unique-home Airbnb bookings is a jaw-dropping Senior/Staff database modeling win!',
          },
          scene: {
            hud: [
              { label: 'OVERLAP GUARD', value: 'GiST daterange!', status: 'good' },
              { label: 'PAYOUT MODEL', value: '24h Post-Checkin', status: 'info' },
              { label: 'PRICING', value: 'Per-Night Calendar', status: 'info' },
              { label: 'CANCELS', value: 'Saga Refund Rules', status: 'good' },
            ],
            nodes: [
              { id: 'g', type: 'db', x: 185, y: 215, label: 'Postgres GiST', sublabel: 'No Overlapping Dates', tone: 'purple', badge: 'engine-enforced ✓', badgeTone: 'green' },
              { id: 'esc', type: 'hex', x: 545, y: 215, label: 'Escrow Ledger', sublabel: 'Hold → Release Host', tone: 'green' },
            ],
            edges: [
              { from: 'g', to: 'esc', label: 'confirmed stay', packetColor: 'green', speed: 1.8 },
            ],
            legend: [{ label: 'overlap-proof booking + escrow', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-food-delivery',
      title: 'Design Food Delivery Logistics (DoorDash / Swiggy)',
      subtitle: '3-sided marketplace (Eater, Restaurant, Courier), ML prep-time ETA, Order Saga & multi-order route batching.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['DoorDash', 'Uber', 'Swiggy', 'Amazon'],
      tags: ['doordash', 'uber eats', 'swiggy', 'food delivery', 'dispatch', 'eta', 'batching', 'saga'],
      objectives: [
        'Coordinate a 3-sided real-time marketplace with asynchronous restaurant acceptance & courier dispatch',
        'Time courier dispatch using Restaurant Prep-Time ML predictions (not instant dispatch!)',
        'Optimize unit economics via Multi-Order Batching (1 courier picking up 2 nearby orders)',
      ],
      steps: [
        {
          shortLabel: '3-Sided Saga',
          stage: 'SOLUTION',
          title: 'Order Saga Orchestrator + Prep-Time Synchronized Courier Dispatch',
          body: [
            'Unlike Uber rides (2-sided: rider + driver), **Food Delivery is 3-sided**: if a restaurant takes 25 minutes to bake a pizza, dispatching a courier 2 minutes away immediately wastes 23 minutes of courier idle pay! If you dispatch too late, the pizza sits cold!',
            'The **Order Orchestrator (Saga)** moves `PAID → SENT_TO_RESTAURANT → ACCEPTED (prep_eta = 22m) → DELAYED DISPATCH @ T+14m → PICKED_UP → DELIVERED`. Live GPS streams from courier phone → **H3 Geo Index** → SSE/WS map dot on customer’s screen!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Menu browsing is **99% read-heavy** (cache whole restaurant menus in Redis/CDN per city); Order/Dispatch is **write-critical** (ACID state machine + idempotent webhooks to restaurant POS tablets)!',
          },
          scene: {
            hud: [
              { label: 'MARKETPLACE', value: '3-Sided Sync', status: 'info' },
              { label: 'DISPATCH TIME', value: 'Prep_ETA − Drive_ETA', status: 'good' },
              { label: 'MENU READS', value: '99% Redis / CDN', status: 'good' },
              { label: 'TRACKING', value: 'GPS → SSE Map', status: 'good' },
            ],
            nodes: [
              { id: 'e', type: 'users', x: 95, y: 215, label: 'Customer', sublabel: 'Orders Pizza', tone: 'slate' },
              { id: 'orch', type: 'hex', x: 315, y: 215, label: 'Order Saga', sublabel: 'Prep ML + State', tone: 'purple', badge: 'synced timing', badgeTone: 'green' },
              { id: 'rest', type: 'hex', x: 590, y: 115, label: 'Restaurant POS', sublabel: 'Prep: 22 min', tone: 'amber' },
              { id: 'disp', type: 'hex', x: 590, y: 315, label: 'Dispatch + H3', sublabel: 'Batch Nearby Couriers', tone: 'green' },
            ],
            edges: [
              { from: 'e', to: 'orch', label: 'place order + track', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'orch', to: 'rest', label: '1. accept + prep ETA', packetColor: 'amber', bidirectional: true, speed: 1.9 },
              { from: 'orch', to: 'disp', label: '2. dispatch @ T+14m', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'just-in-time 3-sided dispatch', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Route Batching',
          stage: 'TECHNIQUE',
          title: 'Solving the Vehicle Routing Problem (VRP) Every 15 Seconds',
          body: [
            'Instead of greedy 1-order-to-1-driver matching, DoorDash/Uber Eats runs a **Global Batch Optimizer** every 15–30 seconds per metro zone — minimizing total wait + cold-food risk while stacking compatible 2-order routes to cut delivery costs 30%!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Replacing naive greedy nearest-driver assignment with **15-second Batched Global Bipartite / VRP Optimization** is how real Uber & DoorDash dispatch engines work!',
          },
          scene: {
            hud: [
              { label: 'OPTIMIZER', value: '15s Zone Batching', status: 'good' },
              { label: 'STACKED ORDERS', value: '-30% Delivery Cost', status: 'good' },
              { label: 'FRESHNESS', value: 'Max Cold-Time Cap', status: 'info' },
              { label: 'OUTAGE SAFE', value: 'POS Heartbeat Guard', status: 'good' },
            ],
            nodes: [
              { id: 'o', type: 'queue', x: 145, y: 215, label: '15s Order Window', sublabel: 'Zone: Seattle', tone: 'amber' },
              { id: 'opt', type: 'hex', x: 415, y: 215, label: 'VRP Solver', sublabel: 'Min Wait + Batch', tone: 'green' },
              { id: 'c', type: 'users', x: 660, y: 215, label: 'Couriers', sublabel: 'Stacked Routes ✓', tone: 'blue' },
            ],
            edges: [
              { from: 'o', to: 'opt', label: 'pending orders', packetColor: 'amber', speed: 1.8 },
              { from: 'opt', to: 'c', label: 'optimal offers', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'batched route optimization', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-online-auction',
      title: 'Design Real-Time Online Auction (eBay / IPL)',
      subtitle: 'Surviving last-10-second sniping storms with atomic Redis Lua CAS, strict monotonic bid ordering, soft-close & live SSE broadcast.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['eBay', 'Amazon', 'Uber', 'Microsoft'],
      tags: ['auction', 'bidding', 'sniping', 'redis lua', 'cas', 'soft close', 'sse', 'contention'],
      objectives: [
        'Handle 100k concurrent bidders firing snipe bids in the final 5 seconds of a hot auction',
        'Enforce strict monotonic bid ordering (`new_bid >= high + min_increment`) atomically via Redis Lua / Kafka partition',
        'Close auctions reliably with Distributed Timer + Soft-Close Extension + Winner Payment Saga',
      ],
      steps: [
        {
          shortLabel: 'Sniping Storm',
          stage: 'SOLUTION',
          title: 'Per-Auction Atomic Redis Lua CAS + Async Postgres Durability + Live SSE',
          body: [
            'During the final 10 seconds of a collectible drop, **50,000 bidders** slam `POST /auctions/99/bid` simultaneously. Classic SQL updates serialize and crash!',
            '**Solution**: Guard the active high bid inside an **atomic Redis Lua script** (`if now < end_ts and amount >= cur_high + step: SET cur_high, cur_winner; return OK`). Append every accepted bid durably to **Kafka (`key = auction_id`) → Postgres Bid Ledger**, and fan out the new high bid to 100k watchers via an **SSE Pub/Sub tree** in < 100 ms!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**Soft-Close Anti-Sniping**: If a valid bid lands in the final 10 seconds, atomically extend `end_ts += 30s` inside the same Lua script so fair human bidding beats last-millisecond bots!',
          },
          scene: {
            hud: [
              { label: 'FINAL 10s', value: '50k Snipe Bids/s', status: 'warn' },
              { label: 'HIGH-BID GUARD', value: 'Atomic Redis Lua', status: 'good' },
              { label: 'ANTI-SNIPE', value: 'Soft-Close +30s', status: 'good' },
              { label: 'WATCHER PUSH', value: 'SSE < 100 ms', status: 'good' },
            ],
            nodes: [
              { id: 'b', type: 'users', x: 95, y: 215, label: '50k Bidders', sublabel: 'Snipe Storm!', tone: 'slate' },
              { id: 'api', type: 'hex', x: 270, y: 215, label: 'Bid Service', sublabel: 'Pre-Auth + RL', tone: 'blue' },
              { id: 'lua', type: 'cache', x: 475, y: 120, label: 'Redis Lua CAS', sublabel: 'high = $1,250 ✓', tone: 'green', badge: 'strict monotonic', badgeTone: 'green' },
              { id: 'kf', type: 'queue', x: 475, y: 315, label: 'Kafka → SQL', sublabel: 'Durable Audit', tone: 'amber' },
              { id: 'sse', type: 'hex', x: 675, y: 215, label: 'SSE Broadcast', sublabel: '100k Watchers', tone: 'purple' },
            ],
            edges: [
              { from: 'b', to: 'api', label: 'POST /bid', packetColor: 'coral', speed: 1.4, packetCount: 3 },
              { from: 'api', to: 'lua', label: 'atomic CAS', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'api', to: 'kf', label: 'accepted bids', packetColor: 'amber', speed: 1.7 },
              { from: 'lua', to: 'sse', label: 'new high $1,250', packetColor: 'purple', speed: 1.5 },
            ],
            legend: [{ label: 'atomic CAS high-bid path', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Proxy & Close',
          stage: 'TECHNIQUE',
          title: 'Auto-Proxy Bidding + Deterministic Auction Close & Settlement Saga',
          body: [
            'Support eBay-style **Proxy Auto-Bidding** (`max_bid = $2,000` kept secret on server; Lua automatically outbids challengers by `$10` up to `$2,000`!). When `now >= end_ts`, the **Closing Worker** locks the auction `CLOSED`, verifies final high bid from the durable Kafka/SQL log, and triggers the **Winner Settlement Payment Saga** (falling back to 2nd highest bidder if payment fails!).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'What if Redis crashes mid-auction? Rebuild `cur_high` deterministically by replaying the auction’s **Kafka partition / Postgres bid log** (always `acks=all` before returning `200 OK` on high-value auctions!).',
          },
          scene: {
            hud: [
              { label: 'PROXY BID', value: 'Secret Max Cap', status: 'info' },
              { label: 'REDIS CRASH', value: 'Replay Kafka Log', status: 'good' },
              { label: 'SETTLEMENT', value: 'Charge → Escrow', status: 'good' },
              { label: 'DEFAULT FALLBACK', value: 'Offer #2 Bidder', status: 'info' },
            ],
            nodes: [
              { id: 'clk', type: 'hex', x: 145, y: 215, label: 'Close Scheduler', sublabel: 'now >= end_ts', tone: 'amber' },
              { id: 'ver', type: 'db', x: 400, y: 215, label: 'Bid Ledger DB', sublabel: 'Final Winner Proof', tone: 'purple' },
              { id: 'pay', type: 'hex', x: 650, y: 215, label: 'Settlement Saga', sublabel: 'Charge + Notify', tone: 'green' },
            ],
            edges: [
              { from: 'clk', to: 'ver', label: 'freeze auction', packetColor: 'purple', speed: 1.7 },
              { from: 'ver', to: 'pay', label: 'charge winner', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'reliable auction close saga', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-video-conferencing',
      title: 'Design Video Conferencing (Microsoft Teams / Zoom)',
      subtitle: 'Microsoft flagship design: WebSocket Signaling, STUN/TURN NAT traversal, Mesh vs MCU vs SFU, Simulcast & Cloud Recording.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Microsoft', 'Zoom', 'Google', 'Meta'],
      tags: ['microsoft teams', 'zoom', 'webrtc', 'sfu', 'mcu', 'stun', 'turn', 'simulcast', 'video call'],
      objectives: [
        'Separate Control Plane Signaling (WebSockets SDP/ICE) from UDP Media Plane (SRTP)',
        'Compare P2P Mesh vs MCU vs SFU (Selective Forwarding Unit) for 2 vs 50 vs 1,000 participants',
        'Deliver smooth video across fiber AND weak 3G laptops simultaneously via Simulcast / SVC',
      ],
      steps: [
        {
          shortLabel: 'Signaling & NAT',
          stage: 'SETUP',
          title: 'WebRTC Signaling (SDP/ICE) + STUN/TURN Punch Through Firewalls',
          body: [
            'Most laptops hide behind corporate NAT firewalls without a public IP! **Step 1 (Signaling)**: Participants connect over WebSockets to a **Signaling Server** to exchange **SDP** (supported codecs: VP9/AV1/Opus) and **ICE candidates**.',
            '**Step 2 (NAT Traversal)**: Clients query a lightweight **STUN** server to learn their public IP:port for direct UDP hole-punching. If a strict enterprise firewall blocks direct UDP (~15% of calls), traffic relays transparently through a **TURN** server over UDP/TCP :443!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Video calls use **UDP (SRTP)**, NOT TCP! Retransmitting a dropped video frame from 400 ms ago causes horrible stutter — it is far better to drop 1 frame and keep live audio/video synchronized!',
          },
          scene: {
            hud: [
              { label: 'SIGNALING', value: 'WebSocket SDP/ICE', status: 'info' },
              { label: 'MEDIA PROTO', value: 'UDP SRTP (No TCP!)', status: 'good' },
              { label: 'NAT PUNCH', value: 'STUN (85%) / TURN', status: 'good' },
              { label: 'E2E LATENCY', value: '< 150 ms Target', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 110, y: 215, label: 'Alice (NAT)', sublabel: 'Teams Client', tone: 'blue' },
              { id: 'sig', type: 'hex', x: 380, y: 95, label: 'Signaling + STUN', sublabel: 'SDP / ICE Setup', tone: 'purple' },
              { id: 'turn', type: 'hex', x: 380, y: 325, label: 'TURN Relay', sublabel: 'Fallback :443', tone: 'amber', dim: true },
              { id: 'b', type: 'users', x: 650, y: 215, label: 'Bob (Corp FW)', sublabel: 'Teams Client', tone: 'green' },
            ],
            edges: [
              { from: 'a', to: 'sig', label: 'SDP/ICE', packetColor: 'purple', dashed: true, speed: 2.0 },
              { from: 'b', to: 'sig', label: 'SDP/ICE', packetColor: 'purple', dashed: true, speed: 2.0 },
              { from: 'a', to: 'b', label: 'direct UDP SRTP (< 80ms)', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'a', to: 'turn', label: '15% firewall relay', packetColor: 'amber', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'direct encrypted SRTP', tone: 'green' },
              { label: 'signaling control plane', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'SFU & Simulcast',
          stage: 'SOLUTION',
          title: 'SFU + Simulcast Scales 50-Person Meetings Without Melting Server CPUs',
          body: [
            '**P2P Mesh** requires `N-1` uploads per user — explodes past 4 people! **MCU** decodes and re-encodes every stream into 1 mosaic on the server (huge GPU cost + latency). **SFU (Selective Forwarding Unit — Zoom, Teams, Meet)** receives 1 upload per speaker and **forwards encrypted UDP packets directly without decoding** (10× cheaper CPU!).',
            '**Simulcast / SVC**: Alice uploads 3 tiny layered qualities (`1080p`, `480p`, `180p`). The **SFU** forwards `1080p` to fiber viewers on desktop and `180p` to a commuter on 3G — AND only forwards active speakers’ video in 500-person town halls!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'For **Microsoft Teams Global Calls**, cascade **Multi-Region SFUs** over Microsoft’s private fiber backbone (US-SFU ↔ EU-SFU sends 1 single stream across the Atlantic instead of 50 redundant user streams!).',
          },
          scene: {
            hud: [
              { label: 'ARCHITECTURE', value: 'Cascaded SFU', status: 'good' },
              { label: 'ADAPTIVE VIDEO', value: 'Simulcast / SVC', status: 'good' },
              { label: 'ACTIVE SPEAKER', value: 'Audio-Level Route', status: 'good' },
              { label: 'RECORDING', value: 'Composite Bot → S3', status: 'info' },
            ],
            nodes: [
              { id: 'sp', type: 'users', x: 100, y: 215, label: 'Speaker (US)', sublabel: '1080p+480p+180p', tone: 'blue' },
              { id: 'sfu1', type: 'hex', x: 315, y: 215, label: 'SFU US-West', sublabel: 'Zero Decode Relay', tone: 'green', badge: 'Simulcast', badgeTone: 'green', load: 34 },
              { id: 'sfu2', type: 'hex', x: 525, y: 215, label: 'SFU EU-West', sublabel: 'Private Backbone', tone: 'purple', load: 31 },
              { id: 'd1', type: 'users', x: 690, y: 115, label: 'Fiber Desktop', sublabel: 'Gets 1080p ✓', tone: 'green' },
              { id: 'd2', type: 'users', x: 690, y: 315, label: '3G Mobile', sublabel: 'Gets 180p ✓', tone: 'amber' },
            ],
            edges: [
              { from: 'sp', to: 'sfu1', label: '1 SVC upload', packetColor: 'blue', speed: 1.5 },
              { from: 'sfu1', to: 'sfu2', label: '1 trans-ocean hop', packetColor: 'purple', speed: 1.6 },
              { from: 'sfu2', to: 'd1', label: '1080p layer', packetColor: 'green', speed: 1.5 },
              { from: 'sfu2', to: 'd2', label: '180p layer', packetColor: 'amber', speed: 1.9 },
            ],
            legend: [{ label: 'cascaded SFU simulcast routing', tone: 'green' }],
          },
        },
      ],
    },
  ],
};
