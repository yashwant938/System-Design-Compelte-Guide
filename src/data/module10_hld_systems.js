// Module 10: Whole Systems — HLD & LLD Zoom + 12 Flagship Big Tech HLD Interview Case Studies

export const MODULE_10_WHOLE_SYSTEMS = {
  id: 'mod-10-whole-systems',
  number: '10',
  title: 'Whole Systems (HLD)',
  track: 'hld',
  lessons: [
    {
      id: 'hld-lld',
      title: 'HLD & LLD: Two Zoom Levels',
      subtitle: 'The same system at two zoom levels: the macro map of services (HLD), and the micro code inside one service (LLD).',
      duration: '8 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Google', 'Meta'],
      tags: ['hld', 'lld', 'contracts', 'api', 'architecture', 'interview framework'],
      objectives: [
        'Know what High-Level Design (HLD) decides vs Low-Level Design (LLD)',
        'Connect HLD service boundaries to LLD classes, interfaces, and schemas via Contracts',
        'Navigate the 45-minute Big Tech interview loop smoothly between both zoom levels',
      ],
      steps: [
        {
          shortLabel: 'Two levels',
          stage: 'SETUP',
          title: 'One system, two zoom levels',
          body: [
            'Picture a food-delivery app. From **far away (HLD)**, it is a map of distributed services — **Orders**, **Couriers**, **Payments** — each owning its database, communicating through an API Gateway and Kafka event stream.',
            'Up close (**LLD**), each box is a software program of its own, with **SOLID classes, design patterns, state machines, SQL schemas, and thread-safe locks**. Neither is "more real" — they answer different questions and change at different speeds.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'HLD optimizes for **scale, latency, availability, and failure domains** across machines; LLD optimizes for **extensibility, clean OOP contracts, and thread safety** inside a codebase.',
          },
          scene: {
            hud: [
              { label: 'ZOOM LEVEL', value: 'Whole System (HLD)', status: 'info' },
              { label: 'BUILDING BLOCKS', value: 'Services · DBs · Queues', status: 'info' },
              { label: 'YOU PRODUCE', value: 'Architecture Blueprint', status: 'good' },
              { label: 'INTERVIEW ROUND', value: 'System Design (45m)', status: 'info' },
            ],
            nodes: [
              { id: 'gw', type: 'hex', x: 130, y: 215, label: 'API Gateway', sublabel: 'Auth · Routing', tone: 'green' },
              { id: 'ord', type: 'hex', x: 350, y: 140, label: 'Orders', sublabel: 'HLD Service', tone: 'blue' },
              { id: 'odb', type: 'db', x: 585, y: 105, label: 'Orders DB', sublabel: 'ACID Postgres', tone: 'purple', callout: 'orders' },
              { id: 'cou', type: 'hex', x: 350, y: 295, label: 'Couriers', sublabel: 'Dispatch Svc', tone: 'green', dim: true },
              { id: 'cdb', type: 'db', x: 585, y: 295, label: 'Geo Store', sublabel: 'Redis H3', tone: 'purple', callout: 'locations' },
            ],
            edges: [
              { from: 'gw', to: 'ord', label: 'POST /order', packetColor: 'coral', speed: 1.8 },
              { from: 'ord', to: 'odb', label: 'commit', packetColor: 'purple', speed: 1.7 },
              { from: 'ord', to: 'cou', label: 'OrderPlaced event', packetColor: 'amber', dashed: true, speed: 2.1 },
              { from: 'cou', to: 'cdb', label: 'nearest driver', packetColor: 'green', speed: 1.8 },
            ],
            legend: [
              { label: 'request', tone: 'coral' },
              { label: 'event', tone: 'amber' },
              { label: 'data access', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Zoom into LLD',
          stage: 'TECHNIQUE',
          title: 'Zooming inside the Orders box reveals LLD classes & patterns',
          body: [
            'Zoom 10× into the `Orders` hexagon: now we care about **`OrderController`**, **`OrderState`** (`CREATED → PAID → ASSIGNED → DELIVERED`), **`PricingStrategy`** (Normal / Surge / Promo), and **`ReentrantLock` / Optimistic `@Version`** so two couriers cannot claim the same order!',
            'The **Contract** (REST/gRPC Protobuf + Kafka Event Schema) is the seam where HLD and LLD lock together.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'At Microsoft (L61–L63) and Amazon (SDE2/SDE3), you face BOTH an **HLD Architecture Round** and an **LLD Object-Oriented / Machine Coding Round**. Master both tracks in this atlas!',
          },
          scene: {
            hud: [
              { label: 'ZOOM LEVEL', value: 'Inside 1 Service (LLD)', status: 'info' },
              { label: 'BUILDING BLOCKS', value: 'Classes · Patterns · Locks', status: 'info' },
              { label: 'YOU PRODUCE', value: 'UML + Clean Code', status: 'good' },
              { label: 'SEAM', value: 'API & Event Contracts', status: 'good' },
            ],
            nodes: [
              {
                id: 'svc',
                type: 'uml',
                x: 205,
                y: 215,
                label: 'OrderService',
                sublabel: '«Facade»',
                tone: 'blue',
                umlFields: ['- repo: OrderRepo', '- pricing: PricingStrategy'],
                umlMethods: ['+ createOrder(cmd)', '+ assignCourier(id)'],
              },
              {
                id: 'strat',
                type: 'uml',
                x: 545,
                y: 120,
                label: '«interface» PricingStrategy',
                tone: 'green',
                umlFields: ['Standard | Surge | VIP'],
                umlMethods: ['+ calculate(cart): Money'],
              },
              {
                id: 'state',
                type: 'uml',
                x: 545,
                y: 310,
                label: '«interface» OrderState',
                tone: 'purple',
                umlFields: ['Created → Paid → Done'],
                umlMethods: ['+ next(ctx)', '+ cancel(ctx)'],
              },
            ],
            edges: [
              { from: 'svc', to: 'strat', label: 'delegates price', packetColor: 'green', speed: 1.9 },
              { from: 'svc', to: 'state', label: 'transitions', packetColor: 'purple', speed: 1.9 },
            ],
            legend: [
              { label: 'strategy dispatch', tone: 'green' },
              { label: 'state transition', tone: 'purple' },
            ],
          },
        },
      ],
    },

    {
      id: 'design-url-shortener',
      title: 'Design a URL Shortener (TinyURL)',
      subtitle: 'Base62 encoding, 100:1 read/write ratio, KGS vs Snowflake IDs, 301 vs 302 redirects, and hot-link caching.',
      duration: '12 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Google', 'Meta'],
      tags: ['tinyurl', 'bitly', 'base62', '301 vs 302', 'kgs', 'snowflake', 'shortener'],
      objectives: [
        'Size 100M writes/day and 10B reads/day (~115k Read QPS) using napkin math',
        'Choose 7-char Base62 keys (3.5 Trillion URLs) via Snowflake or Key Generation Service (KGS)',
        'Decide 301 Permanent (CDN-friendly, no analytics) vs 302 Temporary (click analytics)',
      ],
      steps: [
        {
          shortLabel: 'Math & Base62',
          stage: 'SETUP',
          title: '100:1 Read-Heavy — 7 Base62 characters hold 3.5 Trillion URLs',
          body: [
            '**Requirements**: `POST /v1/shorten` creates a short alias (`sho.rt/aB9x2K1`); `GET /{code}` redirects in < 20 ms with 99.99% availability. At **100M new URLs/day** (`~1,150 write QPS`) and **100:1 read ratio**, peak reads reach **~350,000 QPS**!',
            'With `[a-z, A-Z, 0-9]` (**62 characters**), a **7-character code** provides `62^7 = 3.52 Trillion` unique URLs — enough for **96+ years** at 100M URLs/day!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**301 Moved Permanently** lets browsers cache the redirect forever (less server load, ZERO click analytics). **302 Found** hits your server every click (slightly more load, FULL real-time click analytics!).',
          },
          scene: {
            hud: [
              { label: 'WRITE QPS', value: '1.2k /s (3.5k peak)', status: 'good' },
              { label: 'READ QPS', value: '115k /s (350k peak)', status: 'warn' },
              { label: 'KEY SPACE (62^7)', value: '3.52 Trillion', status: 'good' },
              { label: '5-YR STORAGE', value: '~91 TB (500B/row)', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 100, y: 215, label: 'Global Clicks', sublabel: '350k peak QPS', tone: 'slate' },
              { id: 'cdn', type: 'hex', x: 270, y: 215, label: 'Edge / LB', sublabel: 'Rate Limit · 302', tone: 'green' },
              { id: 'svc', type: 'hex', x: 465, y: 215, label: 'URL Service', sublabel: 'Stateless + KGS', tone: 'blue', load: 38 },
              { id: 'rd', type: 'cache', x: 660, y: 110, label: 'Redis Cluster', sublabel: 'Hot 20% (95% hit)', tone: 'green', badge: '0.5 ms', badgeTone: 'green' },
              { id: 'db', type: 'db', x: 660, y: 315, label: 'NoSQL / Sharded DB', sublabel: 'key → long_url', tone: 'purple', callout: 'short_code PK' },
            ],
            edges: [
              { from: 'c', to: 'cdn', label: 'GET /aB9x2K', packetColor: 'coral', bidirectional: true, speed: 1.5 },
              { from: 'cdn', to: 'svc', label: 'route', packetColor: 'blue', speed: 1.6 },
              { from: 'svc', to: 'rd', label: '95% hit', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'svc', to: 'db', label: '5% miss + writes', packetColor: 'purple', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'hot Redis redirect', tone: 'green' },
              { label: 'durable DB fallback', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'KGS & Analytics',
          stage: 'SOLUTION',
          title: 'Zero-Collision Key Generation (KGS / Counter Range) + Async Click Pipeline',
          body: [
            'How do we generate unique 7-char codes with zero hash collisions and zero DB round trips? Either **Base62-encode a Snowflake ID** (random-ish XOR obfuscated so competitors can’t guess your daily volume!) OR run a **Range Allocator (ZooKeeper/etcd)** leasing blocks of 100,000 numbers to each app server in RAM!',
            'For **Click Analytics**, NEVER run `UPDATE urls SET clicks = clicks + 1` synchronously on the redirect path! Emit a click event to **Kafka → Flink → ClickHouse** asynchronously so redirects stay under 10 ms.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Security & Abuse check: Mention **Safe Browsing Malware URL Scanning** on shorten + **Per-IP Rate Limiting** so spammers cannot turn your domain into a phishing redirector!',
          },
          scene: {
            hud: [
              { label: 'COLLISIONS', value: 'Zero (Range Lease)', status: 'good' },
              { label: 'REDIRECT P99', value: '< 12 ms', status: 'good' },
              { label: 'ANALYTICS', value: 'Async Kafka→OLAP', status: 'good' },
              { label: 'ABUSE GUARD', value: 'Malware Scan + RL', status: 'good' },
            ],
            nodes: [
              { id: 'zk', type: 'hex', x: 140, y: 120, label: 'Range Lease (etcd)', sublabel: 'Leases 100k IDs', tone: 'purple' },
              { id: 'api', type: 'hex', x: 375, y: 215, label: 'URL Service', sublabel: 'Base62 + Obfuscate', tone: 'blue' },
              { id: 'kf', type: 'queue', x: 560, y: 315, label: 'Click Kafka', sublabel: 'Non-Blocking Emit', tone: 'amber' },
              { id: 'olap', type: 'db', x: 690, y: 145, label: 'ClickHouse', sublabel: 'Geo / Referrer Stats', tone: 'green' },
            ],
            edges: [
              { from: 'zk', to: 'api', label: 'block [1M..1.1M]', packetColor: 'purple', dashed: true, speed: 2.6 },
              { from: 'api', to: 'kf', label: 'async click event', packetColor: 'amber', speed: 1.7 },
              { from: 'kf', to: 'olap', label: 'batch agg', packetColor: 'green', speed: 2.0 },
            ],
            legend: [{ label: 'non-blocking analytics pipeline', tone: 'amber' }],
          },
        },
      ],
      deepDive: {
        capacityMath: [
          { label: 'Write QPS', value: '1,150 avg · 3,500 peak', formula: '100M URLs/day ÷ 86,400 sec' },
          { label: 'Read QPS (100:1)', value: '115k avg · 350k peak', formula: '10B redirects/day ÷ 86,400 sec' },
          { label: '5-Year Storage', value: '~91 TB raw', formula: '100M/day × 365 × 5 × 500 bytes/record' },
          { label: 'Hot Cache (20%)', value: '~180 GB RAM', formula: 'Unique hot URLs fit easily in a 4-shard Redis cluster' },
        ],
        failureModes: [
          {
            title: 'Sequential Predictable Short URLs Leaking Business Metrics',
            mitigation: 'Apply a bijective Feistel cipher / modular prime permutation to the sequential counter before Base62 encoding — still 100% collision-free, completely non-guessable!',
            interviewProbe: 'If ID 1001 is `g9` and ID 1002 is `ga`, can a competitor scrape all private unlisted links?',
          },
        ],
      },
    },

    {
      id: 'design-news-feed',
      title: 'Design a News Feed (Twitter / X / LinkedIn)',
      subtitle: 'Fan-out on Write (Push) vs Fan-out on Read (Pull), the Hybrid Celebrity Split, Timeline Caches & Ranking.',
      duration: '12 min',
      level: 'Intermediate',
      companies: ['Meta', 'Twitter/X', 'LinkedIn', 'Microsoft'],
      tags: ['news feed', 'fanout on write', 'fanout on read', 'celebrity problem', 'redis sorted set', 'timeline'],
      objectives: [
        'Compare Push (Fan-out on Write) vs Pull (Fan-out on Read) latency & write amplification',
        'Design the Hybrid Fan-out solution for 100M-follower celebrities',
        'Hydrate cached post IDs via Ranking ML + Media CDN with Cursor Pagination',
      ],
      steps: [
        {
          shortLabel: 'Push vs Pull',
          stage: 'PROBLEM',
          title: 'Fan-out on Write breaks for celebrities; Fan-out on Read is slow',
          body: [
            '**Fan-out on Write (Push)**: When Alice posts, a worker immediately pushes `post_id` into every follower’s precomputed **Redis Home Timeline** (`ZADD`). Reads are an instant `O(1)` 5 ms cache lookup! **Problem**: When Elon Musk (180M followers) tweets, pushing 180M Redis writes creates a massive backlog lag!',
            '**Fan-out on Read (Pull)**: Don’t push on write; instead, when Alice opens the app, query the latest posts of all 500 accounts she follows and merge them on the fly — slow `500-way scatter-gather` every single reload!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Neither pure Push nor pure Pull works at Twitter/Instagram scale. Always jump straight to the **Hybrid Fan-out Model**!',
          },
          scene: {
            hud: [
              { label: 'NORMAL USER', value: 'Push (Fan-out Write)', status: 'good' },
              { label: 'CELEBRITY > 50k', value: 'Pull at Read Time', status: 'good' },
              { label: 'TIMELINE CACHE', value: 'Redis ZSET (IDs)', status: 'info' },
              { label: 'FEED LOAD P99', value: '< 80 ms', status: 'good' },
            ],
            nodes: [
              { id: 'pub', type: 'hex', x: 105, y: 215, label: 'Post Service', sublabel: 'Write + Kafka', tone: 'blue' },
              { id: 'fw', type: 'hex', x: 325, y: 115, label: 'Fanout Workers', sublabel: '< 50k Followers', tone: 'green', badge: 'Push ZADD', badgeTone: 'green' },
              { id: 'cel', type: 'cache', x: 325, y: 315, label: 'Celebrity Cache', sublabel: 'Top 1% Accounts', tone: 'amber', badge: 'Pull on Read', badgeTone: 'amber' },
              { id: 'tl', type: 'cache', x: 545, y: 115, label: 'Home Timelines', sublabel: 'Redis [post_id]', tone: 'purple' },
              { id: 'agg', type: 'hex', x: 660, y: 265, label: 'Feed Aggregator', sublabel: 'Merge + ML Rank', tone: 'green' },
            ],
            edges: [
              { from: 'pub', to: 'fw', label: 'normal user', packetColor: 'green', speed: 1.6 },
              { from: 'pub', to: 'cel', label: 'celebrity only', packetColor: 'amber', speed: 1.7 },
              { from: 'fw', to: 'tl', label: 'push IDs', packetColor: 'purple', speed: 1.6 },
              { from: 'tl', to: 'agg', label: 'precomputed', packetColor: 'purple', speed: 1.6 },
              { from: 'cel', to: 'agg', label: 'merge live', packetColor: 'amber', speed: 1.6 },
            ],
            legend: [
              { label: 'push fanout', tone: 'green' },
              { label: 'celebrity pull merge', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Hydrate & Rank',
          stage: 'SOLUTION',
          title: 'Store ONLY tiny IDs in Timeline Cache; Hydrate + ML Rank on Read',
          body: [
            'Never duplicate full 2 KB post JSON inside 100M user timelines! Store only **8-byte `post_id`s** (capped at latest 800 items per active user; skip inactive users who haven’t logged in for 30 days!).',
            'On read: 1) Merge user’s Redis Timeline + followed Celebrities’ recent IDs, 2) Pass top-200 IDs through **ML Ranking Service**, 3) Batch-hydrate top-20 Post + Author objects from Cache, 4) Return with a **Cursor Token** and CDN media URLs!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Skipping fan-out for inactive users (> 30 days offline) saves 60–75% of Redis RAM and write IOPS immediately!',
          },
          scene: {
            hud: [
              { label: 'CACHE PAYLOAD', value: '8-byte IDs Only', status: 'good' },
              { label: 'INACTIVE USERS', value: 'Skipped (Backfill)', status: 'good' },
              { label: 'RANKING', value: 'Top 200 → Top 20', status: 'info' },
              { label: 'PAGINATION', value: 'Opaque Cursor', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 100, y: 215, label: 'Reader', sublabel: 'GET /feed', tone: 'slate' },
              { id: 'agg', type: 'hex', x: 285, y: 215, label: 'Feed Mixer', sublabel: 'Push + Celeb Pull', tone: 'blue' },
              { id: 'ml', type: 'hex', x: 485, y: 120, label: 'ML Ranker', sublabel: 'Relevance Score', tone: 'purple' },
              { id: 'hyd', type: 'cache', x: 485, y: 310, label: 'Post/User Cache', sublabel: 'MGET Top 20', tone: 'green' },
              { id: 'cdn', type: 'hex', x: 675, y: 215, label: 'Media CDN', sublabel: 'Images / Video', tone: 'amber' },
            ],
            edges: [
              { from: 'u', to: 'agg', label: 'cursor', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'agg', to: 'ml', label: '200 IDs', packetColor: 'purple', bidirectional: true, speed: 1.6 },
              { from: 'agg', to: 'hyd', label: 'hydrate 20', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'hyd', to: 'cdn', label: 'signed media URLs', packetColor: 'amber', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'rank + hydrate read path', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        capacityMath: [
          { label: 'DAU & Reads', value: '300M DAU · 100k Feed QPS', formula: '300M × 30 feed views/day ÷ 86,400' },
          { label: 'Timeline RAM', value: '~1.9 TB (IDs only)', formula: '300M active × 800 IDs × 8 bytes = 1.92 TB across Redis cluster' },
        ],
      },
    },

    {
      id: 'design-chat',
      title: 'Design a Chat System (WhatsApp / Teams)',
      subtitle: 'Stateful WebSocket Gateways, 1:1 & Group Fanout, ScyllaDB storage, E2E Encryption, and Presence Storms.',
      duration: '12 min',
      level: 'Intermediate',
      companies: ['Meta', 'Microsoft', 'Discord', 'Slack'],
      tags: ['whatsapp', 'microsoft teams', 'chat', 'websockets', 'presence', 'e2e encryption', 'scylladb'],
      objectives: [
        'Route real-time 1:1 and group messages across distributed stateful WebSocket Gateways',
        'Guarantee message ordering (client sequence / Snowflake IDs) and offline delivery',
        'Prevent Presence Heartbeat Storms in massive groups',
      ],
      steps: [
        {
          shortLabel: '1:1 & Offline',
          stage: 'SOLUTION',
          title: 'Persistent WebSocket Gateways + Session Registry + Push Fallback',
          body: [
            'Alice sends a message over her persistent **WebSocket** to `GW #1`. The **Chat Service** assigns a monotonic `message_id` (Snowflake/HLC), persists it to **ScyllaDB/Cassandra** partitioned by `(conversation_id, bucket)`, and looks up Bob’s active gateway in the **Redis Session Registry**.',
            'If Bob is online on `GW #42`, relay via Kafka/gRPC and push instantly + send a **Delivered ✓✓** receipt back to Alice! If Bob is offline, save to his **Inbox Sync Queue** and fire **APNs / FCM Push Notification**.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'For **WhatsApp E2E Encryption (Signal Protocol)**, servers NEVER hold plaintext keys — they relay opaque encrypted blobs and store only public identity/pre-keys. For **Microsoft Teams Enterprise**, messages are persisted in compliant region-pinned storage for search & eDiscovery!',
          },
          scene: {
            hud: [
              { label: 'CONCURRENT', value: '50M+ Sockets', status: 'info' },
              { label: 'DELIVERY P99', value: '< 100 ms', status: 'good' },
              { label: 'STORAGE', value: 'ScyllaDB LSM', status: 'good' },
              { label: 'OFFLINE', value: 'Sync + APNs/FCM', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 95, y: 120, label: 'Alice', sublabel: 'WS Open', tone: 'slate' },
              { id: 'gw1', type: 'hex', x: 265, y: 120, label: 'WS GW #1', sublabel: 'Stateful', tone: 'blue' },
              { id: 'svc', type: 'hex', x: 465, y: 215, label: 'Chat Router', sublabel: 'Persist + Lookup', tone: 'green' },
              { id: 'db', type: 'db', x: 665, y: 120, label: 'ScyllaDB', sublabel: '(conv_id, bucket)', tone: 'purple' },
              { id: 'gw2', type: 'hex', x: 265, y: 315, label: 'WS GW #42', sublabel: 'Bob Online', tone: 'green' },
              { id: 'b', type: 'users', x: 95, y: 315, label: 'Bob', sublabel: 'ACK ✓✓', tone: 'slate' },
            ],
            edges: [
              { from: 'a', to: 'gw1', label: 'msg', packetColor: 'blue', bidirectional: true, speed: 1.6 },
              { from: 'gw1', to: 'svc', label: 'gRPC', packetColor: 'blue', speed: 1.5 },
              { from: 'svc', to: 'db', label: 'write msg', packetColor: 'purple', speed: 1.6 },
              { from: 'svc', to: 'gw2', label: 'Bob on GW42', packetColor: 'green', speed: 1.5 },
              { from: 'gw2', to: 'b', label: 'push frame', packetColor: 'green', bidirectional: true, speed: 1.5 },
            ],
            legend: [
              { label: 'outbound chat message', tone: 'blue' },
              { label: 'real-time push + ACK', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Groups & Presence',
          stage: 'TECHNIQUE',
          title: 'Small vs Giant Groups & Taming Presence Heartbeat Storms',
          body: [
            '**Small Groups (< 500 members)**: Fan-out message IDs to each member’s online gateway / inbox. **Giant Channels (Slack/Discord 50k+ members)**: Do NOT fan-out to 50k inboxes — store once under `channel_id` and push only to users actively viewing that channel!',
            '**Presence**: Clients send a heartbeat every 30s (`SETEX presence:uid 45 online`). Avoid broadcasting "Alice came online" to 5,000 contacts on every network flap — use **Lazy Presence Pull** (fetch online dots ONLY for the 20 contacts currently visible on screen!) + a 15-second disconnect grace period.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Switching Presence from global Push broadcast to **Lazy On-Screen Pull + Disconnect Grace Window** eliminates 95% of useless presence fan-out traffic!',
          },
          scene: {
            hud: [
              { label: 'SMALL GROUP', value: 'Fanout (< 500)', status: 'good' },
              { label: 'GIANT CHANNEL', value: 'Single Log + Viewers', status: 'good' },
              { label: 'PRESENCE', value: 'Lazy On-Screen Pull', status: 'good' },
              { label: 'FLAP GUARD', value: '15s Grace TTL', status: 'info' },
            ],
            nodes: [
              { id: 'hb', type: 'users', x: 120, y: 215, label: 'Clients', sublabel: '30s Heartbeat', tone: 'slate' },
              { id: 'pr', type: 'cache', x: 380, y: 215, label: 'Presence Redis', sublabel: 'TTL 45s Key', tone: 'green', badge: 'lazy query', badgeTone: 'green' },
              { id: 'pn', type: 'hex', x: 645, y: 215, label: 'Push Service', sublabel: 'APNs / FCM Offline', tone: 'amber' },
            ],
            edges: [
              { from: 'hb', to: 'pr', label: 'heartbeat + MGET visible', packetColor: 'green', bidirectional: true, speed: 1.8 },
              { from: 'pr', to: 'pn', label: 'offline fallback', packetColor: 'amber', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'storm-free presence', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-video-streaming',
      title: 'Design Video Streaming (YouTube / Netflix)',
      subtitle: 'Resumable chunked uploads, parallel DAG transcoding, HLS/DASH Adaptive Bitrate, CDN & View Counting.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Google', 'Netflix', 'Amazon', 'Meta'],
      tags: ['youtube', 'netflix', 'hls', 'dash', 'abr', 'transcoding', 'dag', 'cdn'],
      objectives: [
        'Handle multi-GB uploads reliably with resumable pre-signed multipart chunks',
        'Split raw video into GOP segments and transcode 360p–4K in parallel via a DAG pipeline',
        'Deliver smooth playback on fluctuating mobile networks via HLS/DASH Adaptive Bitrate (ABR)',
      ],
      steps: [
        {
          shortLabel: 'Upload & DAG',
          stage: 'SOLUTION',
          title: 'Parallel GOP Transcoding cuts 4K encoding from 2 hours to 4 minutes',
          body: [
            'Creators upload 4K raw files via **resumable 5 MB chunks directly to S3/GCS**. Instead of encoding a 1-hour video sequentially on 1 CPU, the **Splitter** breaks it into independent **4-second GOP (Group of Pictures) chunks** and fans them out via a **DAG Task Queue** across hundreds of spot GPU/CPU transcoders!',
            'Each chunk outputs **360p, 720p, 1080p, 4K** in **H.264 / VP9 / AV1**, plus a master **`.m3u8` HLS / `.mpd` DASH Manifest** pushed to Object Storage & CDN.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**Adaptive Bitrate Streaming (ABR)**: The player downloads 4-second chunks from the CDN and dynamically switches between 1080p and 480p mid-video whenever your subway Wi-Fi dips — zero buffering wheel!',
          },
          scene: {
            hud: [
              { label: 'UPLOAD', value: 'Direct S3 Multipart', status: 'good' },
              { label: 'TRANSCODE', value: 'Parallel GOP DAG', status: 'good' },
              { label: 'PLAYBACK', value: 'HLS / DASH ABR', status: 'good' },
              { label: 'DELIVERY', value: 'Global Edge CDN', status: 'good' },
            ],
            nodes: [
              { id: 'cr', type: 'users', x: 95, y: 120, label: 'Creator', sublabel: '4K Resumable', tone: 'slate' },
              { id: 'raw', type: 'db', x: 265, y: 120, label: 'Raw Blob', sublabel: '4s GOP Chunks', tone: 'amber' },
              { id: 'dag', type: 'hex', x: 465, y: 120, label: 'DAG Workers', sublabel: '360p..4K + AV1', tone: 'purple', badge: 'parallel 100×', badgeTone: 'purple' },
              { id: 'cdn', type: 'hex', x: 465, y: 310, label: 'Edge CDN', sublabel: 'HLS .m3u8 + .ts', tone: 'green', badge: 'ABR 4s chunks', badgeTone: 'green' },
              { id: 'vw', type: 'users', x: 145, y: 310, label: 'Billion Viewers', sublabel: 'Adaptive Player', tone: 'blue' },
            ],
            edges: [
              { from: 'cr', to: 'raw', label: 'PUT chunks', packetColor: 'amber', speed: 1.7 },
              { from: 'raw', to: 'dag', label: 'split GOPs', packetColor: 'purple', speed: 1.6 },
              { from: 'dag', to: 'cdn', label: 'encoded chunks', packetColor: 'green', speed: 1.8 },
              { from: 'cdn', to: 'vw', label: '4K / 720p ABR', packetColor: 'green', speed: 1.4, packetCount: 3 },
            ],
            legend: [
              { label: 'parallel DAG transcode', tone: 'purple' },
              { label: 'CDN ABR stream', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Views & Costs',
          stage: 'TECHNIQUE',
          title: 'Hot vs Cold Encoding Tiers & Deduplicated View Counting',
          body: [
            '**Cost Optimization (YouTube real world)**: 90% of uploaded videos get < 100 views! Encode only 360p/720p H.264 on upload; trigger expensive **AV1 / 4K transcoding** ONLY once a video crosses a view velocity threshold!',
            'For **View Counts** (anti-bot fraud + write spikes), buffer view heartbeats in **Kafka → Flink** (dedup by `user_id/IP + video_id` window) and batch-flush aggregated counts to DB every few seconds.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Tiered on-demand AV1 transcoding saves tens of millions of dollars per year in compute while keeping viral videos 40% smaller on CDN egress!',
          },
          scene: {
            hud: [
              { label: 'NEW VIDEO', value: 'Fast H.264 720p', status: 'good' },
              { label: 'VIRAL VIDEO', value: 'Trigger AV1 4K', status: 'good' },
              { label: 'VIEW COUNTER', value: 'Kafka → Flink Agg', status: 'good' },
              { label: 'COPYRIGHT', value: 'ContentID Audio/Vid', status: 'info' },
            ],
            nodes: [
              { id: 'p', type: 'users', x: 120, y: 215, label: 'View Events', sublabel: '30s Watched', tone: 'slate' },
              { id: 'k', type: 'queue', x: 350, y: 215, label: 'Kafka Views', sublabel: 'High Throughput', tone: 'amber' },
              { id: 'f', type: 'hex', x: 590, y: 130, label: 'Flink Dedup', sublabel: 'Anti-Bot + Batch', tone: 'green' },
              { id: 'c', type: 'hex', x: 590, y: 300, label: 'AV1 Trigger', sublabel: 'If Views > 10k', tone: 'purple' },
            ],
            edges: [
              { from: 'p', to: 'k', label: 'heartbeat', packetColor: 'amber', speed: 1.6 },
              { from: 'k', to: 'f', label: 'dedup count', packetColor: 'green', speed: 1.7 },
              { from: 'k', to: 'c', label: 'viral hook', packetColor: 'purple', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'buffered streaming analytics', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-uber',
      title: 'Design Ride-Hailing & Geo Dispatch (Uber)',
      subtitle: '5-sec Driver GPS Ingestion, Uber H3 Hexagonal Spatial Index, Atomic Dispatch Locking & Real-Time Surge.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Uber', 'Lyft', 'Google', 'Amazon'],
      tags: ['uber', 'h3', 'geohash', 'quadtree', 'spatial index', 'matching', 'eta', 'surge pricing'],
      objectives: [
        'Ingest 1M+ active drivers updating GPS coordinates every 4–5 seconds (~250k writes/sec)',
        'Compare Geohash, QuadTree, and Uber H3 Hexagons for equidistant nearby-driver search',
        'Prevent double-dispatching the same driver to two riders with atomic distributed locks',
      ],
      steps: [
        {
          shortLabel: 'Geo Ingestion',
          stage: 'SOLUTION',
          title: '250k GPS Updates/sec → In-Memory H3 Spatial Index (Not Disk SQL!)',
          body: [
            'With **1M active drivers** sending `(lat, lng)` every 4 seconds (`250,000 updates/sec`), writing ephemeral GPS pings to PostgreSQL would melt the disk. Instead, write live driver coordinates into an in-memory **Geo-Sharded Redis / H3 Location Store** (partitioned by City/Region)!',
            '**Why Uber H3 Hexagons beat Square Geohashes?** Every neighbor of a hexagon is at the **exact same center-to-center distance** (no awkward diagonal corner distortion!), and checking `k-ring(hex, 1)` returns the 7 surrounding hexagons in O(1)!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Historical GPS trails for trips/receipts still stream asynchronously via **Kafka → Cassandra/S3**, keeping the hot dispatch index 100% RAM-resident and sub-5ms!',
          },
          scene: {
            hud: [
              { label: 'LOCATION WRITES', value: '250k GPS / sec', status: 'warn' },
              { label: 'SPATIAL INDEX', value: 'Uber H3 Hexagons', status: 'good' },
              { label: 'RADIUS QUERY', value: 'k-ring < 5 ms', status: 'good' },
              { label: 'SHARD KEY', value: 'City / H3 Cell', status: 'info' },
            ],
            nodes: [
              { id: 'drv', type: 'users', x: 105, y: 215, label: '1M Drivers', sublabel: 'GPS every 4s', tone: 'slate' },
              { id: 'loc', type: 'hex', x: 315, y: 215, label: 'Location Ingest', sublabel: 'lat/lng → H3 ID', tone: 'blue' },
              { id: 'h3', type: 'cache', x: 565, y: 120, label: 'H3 RAM Index', sublabel: 'cell → [driver_ids]', tone: 'green', badge: '< 5ms query', badgeTone: 'green' },
              { id: 'kf', type: 'queue', x: 565, y: 310, label: 'Kafka + Flink', sublabel: 'Surge & Trip Log', tone: 'amber' },
            ],
            edges: [
              { from: 'drv', to: 'loc', label: '250k/s GPS', packetColor: 'blue', speed: 1.4, packetCount: 3 },
              { from: 'loc', to: 'h3', label: 'update cell', packetColor: 'green', speed: 1.5 },
              { from: 'loc', to: 'kf', label: 'async trail', packetColor: 'amber', dashed: true, speed: 2.1 },
            ],
            legend: [
              { label: 'live RAM spatial update', tone: 'green' },
              { label: 'async surge / archive', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Atomic Match',
          stage: 'TECHNIQUE',
          title: 'ETA Ranking + Atomic Redis Lock prevents Double-Dispatching a Driver',
          body: [
            '1) Rider requests pickup → Dispatch fetches ~20 nearby idle drivers from **H3 k-ring**, 2) **Routing / ETA Engine** (road graph Contraction Hierarchies — NOT straight-line bird-flight distance across a river!) ranks true driving ETA, 3) **Atomic Lock (`SET lock:driver_99 ride_7 NX EX 15`)** offers the ride exclusively to Driver #1 for 15 seconds!',
            'If Driver #1 declines or times out, the lock expires and Dispatch automatically offers to Driver #2.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Calling out **Road-Network ETA vs Euclidean Distance** (a driver 200m away across a highway divider takes 12 min to U-turn!) AND **15s Atomic Offer Locks** wins Uber/Google interviews.',
          },
          scene: {
            hud: [
              { label: 'CANDIDATES', value: 'H3 Top 20 Idle', status: 'info' },
              { label: 'RANKING', value: 'Road-Graph ETA', status: 'good' },
              { label: 'DOUBLE DISPATCH', value: 'Blocked (NX Lock)', status: 'good' },
              { label: 'OFFER TTL', value: '15 Seconds', status: 'warn' },
            ],
            nodes: [
              { id: 'r', type: 'users', x: 100, y: 215, label: 'Rider', sublabel: 'Request Pickup', tone: 'slate' },
              { id: 'm', type: 'hex', x: 300, y: 215, label: 'Match Engine', sublabel: 'H3 + Road ETA', tone: 'purple' },
              { id: 'lk', type: 'cache', x: 500, y: 120, label: 'Redis NX Lock', sublabel: 'driver_99 · 15s', tone: 'green', badge: 'exclusive offer', badgeTone: 'green' },
              { id: 'd', type: 'hex', x: 665, y: 265, label: 'Driver #99', sublabel: 'Accepts via WS ✓', tone: 'blue' },
            ],
            edges: [
              { from: 'r', to: 'm', label: 'request', packetColor: 'purple', speed: 1.7 },
              { from: 'm', to: 'lk', label: 'SET NX EX 15', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'm', to: 'd', label: 'push offer', packetColor: 'blue', bidirectional: true, speed: 1.7 },
            ],
            legend: [{ label: 'atomic exclusive ride lock', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-search-autocomplete',
      title: 'Design Search Autocomplete & Web Crawler',
      subtitle: 'Sharded Top-K Tries (< 30 ms keystroke), Offline Flink/Spark Aggregation, Politeness Queue & Bloom Filter Crawler.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Google', 'Microsoft', 'Amazon'],
      tags: ['typeahead', 'autocomplete', 'trie', 'web crawler', 'bloom filter', 'robots.txt', 'politeness'],
      objectives: [
        'Serve Top-5 autocomplete suggestions in < 30 ms using precomputed Trie node caches',
        'Avoid mutating live Tries on every keystroke via offline aggregation + blue-green snapshots',
        'Design a polite, deduped, trap-resistant distributed Web Crawler',
      ],
      steps: [
        {
          shortLabel: 'Top-K Trie',
          stage: 'SOLUTION',
          title: 'Precompute Top-5 queries at every Trie node → O(prefix_len) = 5 ms!',
          body: [
            'Walking a subtree of 50 million strings under prefix `"sys"` on every keystroke is way too slow! Instead, **cache the Top-5 highest-frequency queries directly inside every Trie node** (prefix max 50 chars). Now lookup is **O(1) memory hops**!',
            'Shard Tries by prefix frequency range (`aa–am`, `an–az`, ...) and **never update live Tries on writes** — log queries to Kafka, aggregate weekly/hourly with Spark/Flink (with exponential time decay for trending news), build a fresh Trie snapshot, and swap it in!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Frontend wins too: **Debounce keystrokes (100–150 ms)** + browser `Cache-Control` caching cuts backend QPS by 70% immediately!',
          },
          scene: {
            hud: [
              { label: 'KEYSTROKE P99', value: '< 25 ms', status: 'good' },
              { label: 'NODE STORAGE', value: 'Cached Top-5', status: 'good' },
              { label: 'LIVE UPDATES', value: 'Immutable Swap', status: 'good' },
              { label: 'DEBOUNCE', value: '150 ms Client', status: 'info' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 100, y: 215, label: 'Search Box', sublabel: '"sys..." (150ms)', tone: 'slate' },
              { id: 'tr', type: 'cache', x: 355, y: 135, label: 'Sharded Trie RAM', sublabel: '"sys" → Top 5!', tone: 'green', badge: '5 ms read', badgeTone: 'green' },
              { id: 'kf', type: 'queue', x: 355, y: 315, label: 'Query Logs', sublabel: 'Kafka Stream', tone: 'amber' },
              { id: 'agg', type: 'hex', x: 635, y: 215, label: 'Trie Builder', sublabel: 'Hourly Snapshot', tone: 'purple' },
            ],
            edges: [
              { from: 'u', to: 'tr', label: 'GET ?q=sys', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'u', to: 'kf', label: 'log final query', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'kf', to: 'agg', label: 'freq + decay', packetColor: 'purple', speed: 2.0 },
              { from: 'agg', to: 'tr', label: 'blue-green swap', packetColor: 'purple', dashed: true, speed: 2.6 },
            ],
            legend: [
              { label: '5 ms Trie hit', tone: 'green' },
              { label: 'offline Trie rebuild', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Web Crawler',
          stage: 'TECHNIQUE',
          title: 'Polite, Deduplicated Web Crawler: Frontier + Per-Host Queues + Bloom Filter',
          body: [
            'To crawl 1 Billion pages/month without DDoS-ing websites: the **URL Frontier** separates **Priority Queues** (fresh news crawled hourly) from **Per-Host Politeness Queues** (each worker hits 1 domain at most once per `robots.txt` Crawl-Delay!).',
            'Use a **Bloom Filter** to skip already-visited URLs in O(1) RAM, **SimHash** to skip near-duplicate mirrored pages, a **local DNS cache**, and max URL depth limits to escape infinite calendar **Spider Traps**!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Naming the 4 classic Crawler challenges — **Politeness (Per-Host Queue + robots.txt)**, **URL Dedup (Bloom Filter)**, **Content Dedup (SimHash)**, and **Spider Traps** — guarantees top marks.',
          },
          scene: {
            hud: [
              { label: 'POLITENESS', value: '1 Queue / Domain', status: 'good' },
              { label: 'URL DEDUP', value: 'Bloom Filter', status: 'good' },
              { label: 'CONTENT DEDUP', value: 'SimHash Fingerpr.', status: 'good' },
              { label: 'DNS BOTTLENECK', value: 'Local DNS Cache', status: 'info' },
            ],
            nodes: [
              { id: 'fr', type: 'queue', x: 120, y: 215, label: 'URL Frontier', sublabel: 'Priority + Host Q', tone: 'amber' },
              { id: 'ft', type: 'hex', x: 350, y: 215, label: 'HTML Fetcher', sublabel: 'DNS Cache + robots', tone: 'blue' },
              { id: 'ded', type: 'hex', x: 590, y: 120, label: 'SimHash + Parse', sublabel: 'Extract New Links', tone: 'purple' },
              { id: 'bf', type: 'cache', x: 590, y: 310, label: 'Seen Bloom', sublabel: 'Skip Visited URLs', tone: 'green' },
            ],
            edges: [
              { from: 'fr', to: 'ft', label: 'polite pop', packetColor: 'amber', speed: 1.8 },
              { from: 'ft', to: 'ded', label: 'HTML bytes', packetColor: 'blue', speed: 1.7 },
              { from: 'ded', to: 'bf', label: 'check seen', packetColor: 'green', speed: 1.6 },
              { from: 'bf', to: 'fr', label: 'new URLs', packetColor: 'purple', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'crawl feedback loop', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-google-docs',
      title: 'Design Collaborative Editor (Google Docs / Loop)',
      subtitle: 'Operational Transformation (OT) vs CRDTs (Yjs/RGA), Room-Sticky WebSockets, Op-Log & Snapshots.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Google', 'Microsoft', 'Figma', 'Notion'],
      tags: ['google docs', 'microsoft loop', 'ot', 'crdt', 'yjs', 'websockets', 'collaboration'],
      objectives: [
        'Explain why naive full-document saves overwrite concurrent teammates’ edits',
        'Contrast Operational Transformation (OT — Google Docs) vs CRDTs (Figma / Microsoft Loop)',
        'Route all editors of Doc X to the same WebSocket coordinator + persist Append-Only Op Logs + Snapshots',
      ],
      steps: [
        {
          shortLabel: 'OT vs CRDT',
          stage: 'SOLUTION',
          title: 'Merge concurrent keystrokes cleanly with OT or CRDTs',
          body: [
            'Document says `"CAT"`. Simultaneously, Alice inserts `"S"` at index 3 (`"CATS"`) while Bob deletes `"C"` at index 0 (`"AT"`). Naive index replay crashes or outputs garbage!',
            '**OT (Google Docs)** routes all ops through a single central **Doc Authority Server** that transforms Alice’s index `3 → 2` relative to Bob’s delete (`"ATS"`). **CRDTs (Yjs / Automerge / Figma)** assign every character a unique fractional/causal ID so edits are **mathematically commutative** — converging identically even after offline edits on airplanes!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Use **OT** when you have a single authoritative cloud server and want minimal metadata overhead; use **CRDTs** for **offline-first / P2P / multi-region** apps (Microsoft Loop, Figma, Apple Notes)!',
          },
          scene: {
            hud: [
              { label: 'ROOM STICKY', value: 'Consistent Hash(doc)', status: 'good' },
              { label: 'CONFLICT RES', value: 'OT or CRDT (Yjs)', status: 'good' },
              { label: 'PERSISTENCE', value: 'Op-Log + Snapshot', status: 'good' },
              { label: 'KEYSTROKE P99', value: '< 50 ms Broadcast', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 100, y: 120, label: 'Alice', sublabel: 'ins("S", 3)', tone: 'blue' },
              { id: 'b', type: 'users', x: 100, y: 310, label: 'Bob', sublabel: 'del(0)', tone: 'purple' },
              { id: 'room', type: 'hex', x: 375, y: 215, label: 'Doc Room Server', sublabel: 'OT / CRDT Merge', tone: 'green', badge: 'converged: "ATS"', badgeTone: 'green' },
              { id: 'log', type: 'db', x: 645, y: 125, label: 'Append Op-Log', sublabel: 'Every Delta', tone: 'amber' },
              { id: 'snap', type: 'db', x: 645, y: 305, label: 'S3 Snapshots', sublabel: 'Every 500 Ops', tone: 'purple' },
            ],
            edges: [
              { from: 'a', to: 'room', label: 'WS op', packetColor: 'blue', bidirectional: true, speed: 1.5 },
              { from: 'b', to: 'room', label: 'WS op', packetColor: 'purple', bidirectional: true, speed: 1.5 },
              { from: 'room', to: 'log', label: 'append delta', packetColor: 'amber', speed: 1.8 },
              { from: 'log', to: 'snap', label: 'compact', packetColor: 'purple', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'live collaborative sync', tone: 'blue' },
              { label: 'delta log + snapshot', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Snapshots',
          stage: 'TECHNIQUE',
          title: 'Avoid replaying 100,000 edits on load with Periodic Snapshots',
          body: [
            'If a 6-month-old spec doc has 200,000 keystroke deltas, replaying from op #1 takes seconds! Compact the document into an immutable **Snapshot every 500 operations** (stored in S3). Opening the doc loads `Latest Snapshot + last 42 tail ops` in < 80 ms, AND powers full **Version History / Time-Travel Undo**!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Keep **Ephemeral Presence** (live colored cursors & typing indicators) in RAM / Redis PubSub — NEVER write cursor moves to the durable Op-Log!',
          },
          scene: {
            hud: [
              { label: 'DOC LOAD', value: 'Snapshot + Tail Ops', status: 'good' },
              { label: 'HISTORY', value: 'Time-Travel Undo', status: 'good' },
              { label: 'CURSORS', value: 'Ephemeral RAM Only', status: 'info' },
              { label: 'FAILOVER', value: 'Redis / Kafka Replay', status: 'good' },
            ],
            nodes: [
              { id: 's', type: 'db', x: 165, y: 215, label: 'Snapshot #400', sublabel: 'Base State (S3)', tone: 'purple' },
              { id: 't', type: 'queue', x: 400, y: 215, label: 'Ops #401..442', sublabel: '42 Tiny Deltas', tone: 'amber' },
              { id: 'c', type: 'users', x: 645, y: 215, label: 'Fast Client', sublabel: 'Loaded in 75 ms', tone: 'green' },
            ],
            edges: [
              { from: 's', to: 't', label: '+ tail replay', packetColor: 'amber', speed: 1.8 },
              { from: 't', to: 'c', label: 'hydrate editor', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'fast snapshot + delta load', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-ticket-booking',
      title: 'Design Flash-Sale & Ticket Booking (BookMyShow)',
      subtitle: 'Virtual Waiting Room, 10-Min Atomic Seat Holds (Redis TTL + DB Lock), Payment Idempotency & Zero Double-Booking.',
      duration: '12 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Ticketmaster', 'Microsoft', 'Uber'],
      tags: ['bookmyshow', 'ticketmaster', 'flash sale', 'seat lock', 'waiting room', 'pessimistic lock', 'saga'],
      objectives: [
        'Absorb 1M simultaneous Taylor Swift ticket fans with a Virtual Waiting Room',
        'Guarantee ZERO double-booking via a 2-phase 10-minute Seat Hold + Payment Saga',
        'Choose Pessimistic (`FOR UPDATE`) vs Redis Distributed Lock + DB Unique Constraint',
      ],
      steps: [
        {
          shortLabel: 'Waiting Room',
          stage: 'PROBLEM',
          title: '1M fans clicking "Buy" at 10:00:00 AM melts any database',
          body: [
            'During a concert drop or Amazon Prime flash sale, **1,000,000 users** hammer 10,000 seats in the exact same second. Sending all 1M straight to PostgreSQL causes massive lock contention and crashes checkout for everyone.',
            '**Defense 1 — Virtual Waiting Room** (Cloudflare/Edge Queue): Admit users into checkout at a controlled rate (e.g., 5,000/min) with a signed FIFO queue token. Serve static seat maps from **CDN / Redis** refreshed every 2 seconds!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Separate **Browsing** (eventually consistent 2-sec cached seat map — millions of reads!) from **Booking** (strongly consistent atomic seat reservation — thousands of writes!).',
          },
          scene: {
            hud: [
              { label: 'FAN SPIKE', value: '1M Concurrent', status: 'warn' },
              { label: 'EDGE QUEUE', value: 'Waiting Room FIFO', status: 'good' },
              { label: 'SEAT MAP', value: 'Redis / CDN (2s)', status: 'good' },
              { label: 'DB LOCKS', value: 'Protected ✓', status: 'good' },
            ],
            nodes: [
              { id: 'f', type: 'users', x: 100, y: 215, label: '1M Fans', sublabel: '10:00:00 Drop', tone: 'slate' },
              { id: 'wr', type: 'queue', x: 315, y: 215, label: 'Waiting Room', sublabel: '5k/min Token Gate', tone: 'amber', badge: 'throttles spike', badgeTone: 'amber' },
              { id: 'map', type: 'cache', x: 590, y: 115, label: 'Seat Map Cache', sublabel: 'Read-Only 2s TTL', tone: 'green' },
              { id: 'bk', type: 'hex', x: 590, y: 310, label: 'Booking Engine', sublabel: 'ACID Reserve', tone: 'blue' },
            ],
            edges: [
              { from: 'f', to: 'wr', label: '1M spike', packetColor: 'coral', speed: 1.3, packetCount: 3 },
              { from: 'wr', to: 'map', label: 'browse seats', packetColor: 'green', speed: 1.7 },
              { from: 'wr', to: 'bk', label: 'controlled trickle', packetColor: 'blue', speed: 2.0 },
            ],
            legend: [
              { label: 'flash-sale burst', tone: 'coral' },
              { label: 'controlled admission', tone: 'blue' },
            ],
          },
        },
        {
          shortLabel: '10-Min Hold',
          stage: 'SOLUTION',
          title: 'Two-Phase Seat Hold (10-min TTL) + DB `SELECT FOR UPDATE` = Zero Double-Book',
          body: [
            '**Phase 1 (Hold)**: User picks Seat A5 → `BEGIN; SELECT * FROM show_seats WHERE id=A5 FOR UPDATE;` Check `status == AVAILABLE` (or `HELD` with `hold_expires_at < NOW()`), update `status = HELD, hold_expires_at = NOW() + 10 min, booking_id = B1`, `COMMIT`. Also mirror lock in Redis for ultra-fast rejection!',
            '**Phase 2 (Confirm)**: User pays via Stripe (with **Idempotency Key = B1**). On webhook confirmation, atomically flip `HELD → BOOKED` ONLY IF `booking_id == B1 AND hold_expires_at > NOW()`. If payment arrives after expiry, trigger an automatic refund!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Try breaking and fixing this exact race condition live with 2 simultaneous buyers in **Design Lab → LLD Seat Lock Concurrency Simulator**!',
          },
          scene: {
            hud: [
              { label: 'DOUBLE BOOKING', value: '0% (ACID Lock)', status: 'good' },
              { label: 'HOLD TTL', value: '10 Minutes', status: 'info' },
              { label: 'ABANDONED CART', value: 'Auto-Expires ✓', status: 'good' },
              { label: 'LATE PAYMENT', value: 'Auto-Refund Saga', status: 'good' },
            ],
            nodes: [
              { id: 'b1', type: 'hex', x: 130, y: 215, label: 'Booking Svc', sublabel: 'Phase 1: Hold', tone: 'blue' },
              { id: 'db', type: 'db', x: 400, y: 120, label: 'Postgres ACID', sublabel: 'FOR UPDATE + TTL', tone: 'purple', badge: 'single source of truth', badgeTone: 'green' },
              { id: 'psp', type: 'hex', x: 400, y: 315, label: 'Payment PSP', sublabel: 'Idem-Key = B1', tone: 'amber' },
              { id: 'tkt', type: 'hex', x: 655, y: 215, label: 'Ticket Issued', sublabel: 'QR + Email', tone: 'green', badge: 'BOOKED ✓', badgeTone: 'green' },
            ],
            edges: [
              { from: 'b1', to: 'db', label: '1. lock 10m', packetColor: 'purple', bidirectional: true, speed: 1.6 },
              { from: 'b1', to: 'psp', label: '2. charge card', packetColor: 'amber', bidirectional: true, speed: 1.9 },
              { from: 'psp', to: 'tkt', label: '3. confirm webhook', packetColor: 'green', speed: 1.7 },
              { from: 'db', to: 'tkt', label: '4. status=BOOKED', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: '2-phase transactional booking', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-kv-store',
      title: 'Design a Distributed KV Store (DynamoDB)',
      subtitle: 'Consistent Hashing + vNodes, Quorum (W+R>N), Vector Clocks, Gossip Protocol, Hinted Handoff & LSM-Tree.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
      tags: ['dynamodb', 'cassandra', 'kv store', 'gossip protocol', 'merkle tree', 'hinted handoff', 'vector clocks'],
      objectives: [
        'Assemble all 7 Dynamo paper building blocks into one cohesive planetary-scale KV store',
        'Detect node failures decentrally via Gossip Protocol (no single master SPOF)',
        'Handle temporary outages with Sloppy Quorums + Hinted Handoff and permanent drift with Merkle Trees',
      ],
      steps: [
        {
          shortLabel: 'Dynamo Ring',
          stage: 'SOLUTION',
          title: 'The 7 Pillars of Amazon’s Dynamo Paper in One Blueprint',
          body: [
            '1. **Data Partitioning**: Consistent Hashing Ring + Virtual Nodes.',
            '2. **High Availability**: Replicate every key to the next `N = 3` distinct physical hosts clockwise (across separate racks/AZs!).',
            '3. **Tunable Consistency**: Quorum `W + R > N` (`2 + 2 > 3` for strong overlap, or `W=1, R=1` for ultra-low latency).',
            '4. **Conflict Resolution**: **Vector Clocks** detect concurrent divergent writes; client or CRDT merges siblings (e.g., union of shopping cart items!).',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Dynamo skips virtual nodes belonging to the SAME physical host/AZ when picking the `N=3` replicas so one rack power outage never wipes all 3 copies!',
          },
          scene: {
            hud: [
              { label: 'PARTITIONING', value: 'Hash Ring + vNodes', status: 'good' },
              { label: 'CONSISTENCY', value: 'Tunable W+R>N', status: 'good' },
              { label: 'FAILURE DETECT', value: 'Gossip Heartbeats', status: 'good' },
              { label: 'STORAGE', value: 'WAL + MemTable + SST', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'hex', x: 115, y: 215, label: 'Coordinator', sublabel: 'Any Node on Ring', tone: 'green' },
              { id: 'n1', type: 'db', x: 400, y: 95, label: 'Node A (AZ-1)', sublabel: 'LSM + vClock', tone: 'blue', badge: 'W ACK 1', badgeTone: 'green' },
              { id: 'n2', type: 'db', x: 400, y: 215, label: 'Node B (AZ-2)', sublabel: 'LSM + vClock', tone: 'blue', badge: 'W ACK 2', badgeTone: 'green' },
              { id: 'n3', type: 'db', x: 400, y: 335, label: 'Node C (AZ-3)', sublabel: 'Temp Down', tone: 'coral', dim: true },
              { id: 'hh', type: 'db', x: 650, y: 275, label: 'Node D (Hint)', sublabel: 'Hinted Handoff', tone: 'amber', badge: 'holds for C', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'c', to: 'n1', label: 'write', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'c', to: 'n2', label: 'write', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'c', to: 'hh', label: 'sloppy hint', packetColor: 'amber', dashed: true, speed: 2.0 },
              { from: 'hh', to: 'n3', label: 'replay on recovery', packetColor: 'purple', dashed: true, speed: 2.7 },
            ],
            legend: [
              { label: 'quorum write', tone: 'green' },
              { label: 'hinted handoff replay', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Gossip & Merkle',
          stage: 'TECHNIQUE',
          title: 'Gossip Failure Detection + Merkle Tree Anti-Entropy Sync',
          body: [
            '**5. Failure Detection (Gossip)**: Each node periodically sends its heartbeat membership table to 2–3 random peers. If Node C’s counter hasn’t increased for `T` seconds across multiple peers, it’s marked suspect/down without any central coordinator!',
            '**6. Anti-Entropy (Merkle Trees)**: How do two replicas with 100M keys efficiently find the 3 keys that drifted? Compare their **Merkle Tree root hash** — if identical, stop in O(1); if different, descend ONLY the mismatched hash branch!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Every single concept in this lesson — Consistent Hashing, LSM-Trees, Quorums, Gossip, Hinted Handoff, Merkle Trees — appears across Amazon, Google, and Microsoft distributed storage interviews!',
          },
          scene: {
            hud: [
              { label: 'MEMBERSHIP', value: 'Peer Gossip', status: 'good' },
              { label: 'SYNC DIFF', value: 'Merkle Tree O(log N)', status: 'good' },
              { label: 'SPOF', value: 'Zero Masters', status: 'good' },
              { label: 'DISK ENGINE', value: 'LSM-Tree', status: 'good' },
            ],
            nodes: [
              { id: 'm1', type: 'db', x: 185, y: 215, label: 'Replica A', sublabel: 'Merkle Root: 8f9a', tone: 'blue' },
              { id: 'm2', type: 'db', x: 575, y: 215, label: 'Replica B', sublabel: 'Merkle Root: 8f1c', tone: 'purple' },
              { id: 'g', type: 'hex', x: 380, y: 95, label: 'Gossip Mesh', sublabel: 'P2P Heartbeats', tone: 'green' },
            ],
            edges: [
              { from: 'm1', to: 'm2', label: 'sync ONLY mismatched leaf!', packetColor: 'purple', bidirectional: true, speed: 1.9 },
              { from: 'g', to: 'm1', label: 'ring state', packetColor: 'green', dashed: true, speed: 2.3 },
              { from: 'g', to: 'm2', label: 'ring state', packetColor: 'green', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'Merkle anti-entropy sync', tone: 'purple' }],
          },
        },
      ],
    },

    {
      id: 'design-dropbox',
      title: 'Design Cloud File Sync (Dropbox / OneDrive)',
      subtitle: '4MB Content-Defined Chunks, SHA-256 Deduplication, Delta Sync, ACID Metadata DB & Real-Time Device Sync.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Dropbox', 'Google', 'Apple'],
      tags: ['dropbox', 'onedrive', 'google drive', 'delta sync', 'deduplication', 'chunking', 'metadata db'],
      objectives: [
        'Cut upload bandwidth by 90% via 4MB chunking, compression, and SHA-256 deduplication',
        'Separate high-bandwidth Block Storage (S3/Azure Blob) from strongly consistent Metadata DB',
        'Push real-time file changes to Laptop/Phone devices and resolve offline edit conflicts',
      ],
      steps: [
        {
          shortLabel: 'Chunk & Dedup',
          stage: 'SOLUTION',
          title: 'Client Watcher splits into 4 MB SHA-256 chunks → Delta Sync + Dedup',
          body: [
            'Edit 1 slide in a 200 MB PowerPoint deck on Microsoft OneDrive: the Desktop Client splits the file into **4 MB chunks** (or Rolling Rabin Fingerprint chunks) and hashes each with **SHA-256**.',
            'It asks the **Metadata Service** which chunk hashes already exist globally in Blob Storage. 49 of 50 chunks already exist — so **only 1 single 4 MB chunk uploads**! If a colleague uploads the exact same 1 GB dataset, **0 bytes upload** (cross-user content-addressed dedup)!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Cross-user dedup requires careful encryption design (Convergent Encryption or per-tenant dedup scope) so an attacker cannot probe whether another company uploaded a confidential file!',
          },
          scene: {
            hud: [
              { label: 'CHUNK SIZE', value: '4 MB (SHA-256)', status: 'good' },
              { label: 'DELTA UPLOAD', value: '1 of 50 Chunks', status: 'good' },
              { label: 'BLOCK STORE', value: 'Azure Blob / S3', status: 'good' },
              { label: 'META DB', value: 'ACID Postgres/SQL', status: 'info' },
            ],
            nodes: [
              { id: 'pc', type: 'users', x: 105, y: 215, label: 'Desktop App', sublabel: 'Chunker + SHA-256', tone: 'slate' },
              { id: 'meta', type: 'hex', x: 350, y: 115, label: 'Metadata Svc', sublabel: 'File → [chunk_ids]', tone: 'purple', badge: 'ACID v14', badgeTone: 'purple' },
              { id: 'blob', type: 'db', x: 350, y: 315, label: 'Block Storage', sublabel: 'Immutable Chunks', tone: 'green', badge: '98% deduped', badgeTone: 'green' },
              { id: 'sync', type: 'hex', x: 640, y: 215, label: 'Notification Svc', sublabel: 'Long Poll / WS', tone: 'blue' },
            ],
            edges: [
              { from: 'pc', to: 'meta', label: '1. check hashes + commit', packetColor: 'purple', bidirectional: true, speed: 1.7 },
              { from: 'pc', to: 'blob', label: '2. upload ONLY missing 4MB', packetColor: 'green', speed: 1.6 },
              { from: 'meta', to: 'sync', label: '3. notify Laptop/Phone', packetColor: 'blue', speed: 1.7 },
            ],
            legend: [
              { label: 'delta chunk upload', tone: 'green' },
              { label: 'metadata + sync broadcast', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Offline Conflicts',
          stage: 'TECHNIQUE',
          title: 'Optimistic Version Checks prevent silent overwrites on offline laptops',
          body: [
            'Alice edits `budget.xlsx` (v14) offline on a flight; Bob saves v15 in the office. When Alice lands and syncs with `parent_version = 14`, the Metadata DB sees current version is `15` and **NEVER silently overwrites Bob’s work** — it saves `budget (Alice’s conflicted copy).xlsx` so both versions survive safely!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Calling out `parent_version` optimistic concurrency + conflicted-copy creation + soft-delete trash bin (30-day recovery) is classic Microsoft OneDrive / Dropbox engineering rigor.',
          },
          scene: {
            hud: [
              { label: 'CONFLICT GUARD', value: 'parent_ver Check', status: 'good' },
              { label: 'DATA LOSS', value: 'Zero (Branch Copy)', status: 'good' },
              { label: 'CLIENT CACHE', value: 'Local SQLite Index', status: 'info' },
              { label: 'RESTORE', value: 'Immutable Chunks', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 135, y: 135, label: 'Alice (Offline)', sublabel: 'base=v14 → v15a', tone: 'amber' },
              { id: 'b', type: 'users', x: 135, y: 295, label: 'Bob (Online)', sublabel: 'base=v14 → v15 ✓', tone: 'green' },
              { id: 'db', type: 'db', x: 475, y: 215, label: 'Metadata DB', sublabel: 'Keeps v15 + Conflict Copy', tone: 'purple', badge: 'zero data loss', badgeTone: 'green' },
            ],
            edges: [
              { from: 'b', to: 'db', label: 'commit v15 ✓', packetColor: 'green', speed: 1.6 },
              { from: 'a', to: 'db', label: 'stale v14 → save copy', packetColor: 'amber', dashed: true, speed: 2.1 },
            ],
            legend: [{ label: 'conflict-safe file sync', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-rate-limiter',
      title: 'Design a Distributed Rate Limiter & API Gateway',
      subtitle: 'Multi-tier quota rules, Envoy/Edge middleware, atomic Redis Cluster Lua, multi-region sync & soft/hard limits.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Stripe', 'Cloudflare', 'Microsoft', 'Amazon'],
      tags: ['rate limiter', 'api gateway', 'envoy', 'redis cluster', 'lua', 'quotas'],
      objectives: [
        'Architect a global low-latency (< 2 ms) distributed Rate Limiter in front of all APIs',
        'Support per-user, per-IP, per-tenant, and per-endpoint dynamic rules reloaded without restarts',
        'Handle multi-region quota enforcement without cross-ocean synchronous Redis hops',
      ],
      steps: [
        {
          shortLabel: 'Gateway + Lua',
          stage: 'SOLUTION',
          title: 'Local Config Cache + Redis Cluster Lua adds < 1.5 ms overhead',
          body: [
            'Place the Rate Limiter inside your **API Gateway (Envoy/Kong)** so abusive traffic is dropped at the edge before burning backend CPU. Gateways poll a **Rules Config Service** (cached in local RAM) mapping `(tier, endpoint) → {limit, window}`.',
            'On every request, Gateway executes a pre-loaded **`EVALSHA` Redis Lua script** implementing **Sliding Window Counter** or **Token Bucket** atomically in 0.5 ms and returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` headers.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'For **Multi-Region** apps (US + EU + APAC), NEVER do synchronous cross-ocean Redis calls on every API request! Enforce quotas in **local regional Redis** and asynchronously gossip deltas every 500 ms (or split global quota across regions dynamically).',
          },
          scene: {
            hud: [
              { label: 'ADDED LATENCY', value: '< 1.5 ms', status: 'good' },
              { label: 'ATOMICITY', value: 'Redis EVALSHA', status: 'good' },
              { label: 'RULES RELOAD', value: 'Dynamic Push', status: 'good' },
              { label: 'MULTI-REGION', value: 'Local + Async Sync', status: 'info' },
            ],
            nodes: [
              { id: 'cfg', type: 'db', x: 380, y: 80, label: 'Rules Store', sublabel: 'YAML / etcd Push', tone: 'purple' },
              { id: 'gw', type: 'hex', x: 185, y: 240, label: 'Edge Gateway', sublabel: 'Local Rule Cache', tone: 'green', badge: '< 1.5ms check', badgeTone: 'green' },
              { id: 'rd', type: 'cache', x: 430, y: 295, label: 'Regional Redis', sublabel: 'Lua Token Bucket', tone: 'amber' },
              { id: 'api', type: 'hex', x: 645, y: 215, label: 'Core Services', sublabel: 'Shielded ✓', tone: 'blue' },
            ],
            edges: [
              { from: 'cfg', to: 'gw', label: 'push rules', packetColor: 'purple', dashed: true, speed: 2.5 },
              { from: 'gw', to: 'rd', label: 'EVALSHA', packetColor: 'amber', bidirectional: true, speed: 1.4 },
              { from: 'gw', to: 'api', label: '200 allowed', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'edge-enforced atomic rate limit', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Adaptive RL',
          stage: 'TECHNIQUE',
          title: 'Shadow Mode, Adaptive Concurrency Limits & Graceful Load Shedding',
          body: [
            'Before turning on a brand-new strict rate limit, deploy it in **Shadow (Dry-Run) Mode** for 48 hours to log false positives without blocking legitimate enterprise customers!',
            'Pair static per-user quotas with **Adaptive Load Shedding** (Netflix Concurrency Limits / Little’s Law): shed low-priority background batch traffic first while preserving 100% of checkout/payment calls during severe incidents.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Distinguishing **Rate Limiting** (fairness per tenant/user) from **Adaptive Load Shedding** (protecting server health by dropping low-priority traffic first) is true Staff-level thinking.',
          },
          scene: {
            hud: [
              { label: 'SAFE LAUNCH', value: 'Shadow Dry-Run', status: 'good' },
              { label: 'P0 CHECKOUT', value: 'Always Admitted', status: 'good' },
              { label: 'P3 BATCH', value: 'Shed First on Spike', status: 'warn' },
              { label: 'OUTAGE MODE', value: 'Configurable Fail', status: 'info' },
            ],
            nodes: [
              { id: 'in', type: 'hex', x: 145, y: 215, label: 'Priority Classifier', sublabel: 'P0 Crit · P3 Batch', tone: 'blue' },
              { id: 'p0', type: 'hex', x: 525, y: 120, label: 'P0 Checkout', sublabel: '100% Protected', tone: 'green', badge: 'priority pass', badgeTone: 'green' },
              { id: 'p3', type: 'hex', x: 525, y: 310, label: 'P3 Analytics', sublabel: '503 Load Shed', tone: 'coral', badge: 'shed under load', badgeTone: 'rose', dim: true },
            ],
            edges: [
              { from: 'in', to: 'p0', label: 'admit', packetColor: 'green', speed: 1.5 },
              { from: 'in', to: 'p3', label: 'shed early', packetColor: 'coral', dashed: true, speed: 2.5 },
            ],
            legend: [{ label: 'priority load shedding', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'design-monitoring-notifications',
      title: 'Design Metrics Monitoring & Notification Platform',
      subtitle: 'High-volume TSDB (Gorilla compression & downsampling), Alert Engine, and Multi-Channel Priority Notifications.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Datadog', 'Microsoft', 'Amazon', 'Apple'],
      tags: ['datadog', 'azure monitor', 'prometheus', 'tsdb', 'gorilla', 'notifications', 'apns', 'fcm'],
      objectives: [
        'Ingest 10M+ metrics/sec into a Time-Series DB using Gorilla delta-of-delta compression & rollups',
        'Design a reliable Alerting Engine with deduplication and PagerDuty routing',
        'Architect a Multi-Channel Notification System (Push/SMS/Email) with Priority Queues, Templates, and User Fatigue Caps',
      ],
      steps: [
        {
          shortLabel: 'Metrics TSDB',
          stage: 'SOLUTION',
          title: 'Time-Series Ingestion: Gorilla Compression (12×) + Multi-Tier Rollups',
          body: [
            '100,000 servers emitting 100 metrics every 10 seconds = **1,000,000 data points/sec**! Writing to normal SQL fails immediately. A **Time-Series DB** (Prometheus/VictoriaMetrics/M3DB) appends `(metric, tags, ts, val)` into **Gorilla compressed blocks** (delta-of-delta timestamps + XOR float compression = **1.37 bytes/point**!).',
            'Keep raw 10-second granularity for **7 days**, downsample to **1-minute rollups** for 30 days, and **1-hour rollups** for 2 years — slashing storage 90% while keeping 1-year Grafana graphs instant!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: '**High-Cardinality Tag Explosion**: Never put unbounded values like `user_id` or `request_id` into Prometheus metric labels — `10M users × 10 endpoints = 100M time series` will OOM your TSDB! Put IDs in Logs/Traces, not Metric tags.',
          },
          scene: {
            hud: [
              { label: 'INGESTION', value: '1M+ pts/sec', status: 'good' },
              { label: 'COMPRESSION', value: '1.37 B/pt (Gorilla)', status: 'good' },
              { label: 'DOWNSAMPLING', value: '10s → 1m → 1h', status: 'good' },
              { label: 'TRAP GUARD', value: 'Cap Cardinality', status: 'warn' },
            ],
            nodes: [
              { id: 'ag', type: 'users', x: 100, y: 215, label: '100k Hosts', sublabel: 'Pull / Push Agent', tone: 'slate' },
              { id: 'kf', type: 'queue', x: 295, y: 215, label: 'Metrics Kafka', sublabel: 'Buffer + Partition', tone: 'amber' },
              { id: 'ts', type: 'db', x: 525, y: 120, label: 'TSDB Cluster', sublabel: 'Gorilla + Rollups', tone: 'purple' },
              { id: 'al', type: 'hex', x: 525, y: 315, label: 'Alert Engine', sublabel: 'Rules + Dedup', tone: 'coral', badge: 'fires PagerDuty', badgeTone: 'rose' },
            ],
            edges: [
              { from: 'ag', to: 'kf', label: '1M pts/s', packetColor: 'amber', speed: 1.4, packetCount: 3 },
              { from: 'kf', to: 'ts', label: 'batch write', packetColor: 'purple', speed: 1.6 },
              { from: 'ts', to: 'al', label: 'eval SLO burn', packetColor: 'coral', dashed: true, speed: 2.0 },
            ],
            legend: [{ label: 'high-throughput TSDB pipeline', tone: 'purple' }],
          },
        },
        {
          shortLabel: 'Notifications',
          stage: 'TECHNIQUE',
          title: 'Multi-Channel Notification Platform: Priority Queues & Anti-Spam Caps',
          body: [
            'Never mix **P0 OTP / Fraud Alerts** into the same queue as **10 Million Marketing Promo Emails** — a marketing blast would delay login OTP codes by 30 minutes!',
            'Split into **Isolated Priority Topics (`P0-OTP`, `P1-Transactional`, `P2-Marketing`)**, enforce **User Preferences + Daily Rate Caps** (max 3 promos/day), deduplicate via `notification_id`, render localized templates, and dispatch to **APNs / FCM / Twilio / SendGrid** with retry + DLQ!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Checking **Opt-Out Preferences + Quiet Hours (Do Not Disturb timezone)** + **Separate OTP vs Marketing Queues** nails the Notification System interview every time!',
          },
          scene: {
            hud: [
              { label: 'P0 OTP SLA', value: '< 2 sec (Isolated)', status: 'good' },
              { label: 'P2 PROMO', value: 'Separate Queue', status: 'info' },
              { label: 'DEDUP & CAPS', value: 'Redis Preference', status: 'good' },
              { label: 'CHANNELS', value: 'APNs · FCM · SMS · Mail', status: 'good' },
            ],
            nodes: [
              { id: 'svc', type: 'hex', x: 115, y: 215, label: 'Notify API', sublabel: 'Prefs · DND · Dedup', tone: 'blue' },
              { id: 'p0', type: 'queue', x: 350, y: 115, label: 'P0 Critical Q', sublabel: 'OTP / Security', tone: 'green', badge: 'fast lane', badgeTone: 'green' },
              { id: 'p2', type: 'queue', x: 350, y: 315, label: 'P2 Bulk Q', sublabel: 'Marketing / Digest', tone: 'amber' },
              { id: 'w', type: 'hex', x: 635, y: 215, label: 'Channel Workers', sublabel: 'APNs · SMS · Email', tone: 'purple' },
            ],
            edges: [
              { from: 'svc', to: 'p0', label: 'OTP < 2s', packetColor: 'green', speed: 1.4 },
              { from: 'svc', to: 'p2', label: 'bulk campaign', packetColor: 'amber', speed: 2.3 },
              { from: 'p0', to: 'w', label: 'priority send', packetColor: 'green', speed: 1.4 },
              { from: 'p2', to: 'w', label: 'throttled send', packetColor: 'amber', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'P0 critical fast lane', tone: 'green' },
              { label: 'P2 isolated bulk lane', tone: 'amber' },
            ],
          },
        },
      ],
    },
  ],
};
