// Module 04: Communication (4 lessons) & Module 05: Reliability (4 lessons)

export const MODULE_04_COMMUNICATION = {
  id: 'mod-04-communication',
  number: '04',
  title: 'Communication',
  track: 'hld',
  lessons: [
    {
      id: 'apis',
      title: 'REST, gRPC, GraphQL & Webhooks',
      subtitle: 'Choosing API protocols, Protobuf binary contracts, cursor pagination, and idempotency keys.',
      duration: '10 min',
      level: 'Beginner',
      companies: ['Meta', 'Google', 'Microsoft', 'Stripe'],
      tags: ['rest', 'grpc', 'protobuf', 'graphql', 'webhooks', 'pagination', 'idempotency'],
      objectives: [
        'Choose between REST, gRPC, GraphQL, and Webhooks based on client & payload needs',
        'Why cursor-based pagination beats OFFSET at scale',
        'Design safe retries with Idempotency Keys and signed Webhooks',
      ],
      steps: [
        {
          shortLabel: 'Protocol fit',
          stage: 'TECHNIQUE',
          title: 'REST externally, gRPC internally, GraphQL for complex UI graphs',
          body: [
            '**REST (HTTP + JSON)** wins for public APIs (cacheable via CDN, universal tooling). **gRPC (HTTP/2 + Protobuf)** wins for internal service-to-service hops (strict typed schema, 5–10× smaller payloads, bidirectional streaming).',
            '**GraphQL** eliminates over-fetching and under-fetching for mobile clients querying deeply nested graphs (Meta, GitHub) — while **Webhooks** invert polling so payment/CI platforms push signed events (`HMAC-SHA256`) to your endpoint.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Always use **Cursor Pagination** (`?after=id_991&limit=20`) instead of `OFFSET 100000` (which forces the DB to scan & discard 100k rows and produces duplicates when new items insert!).',
          },
          scene: {
            hud: [
              { label: 'PUBLIC API', value: 'REST + OpenAPI', status: 'good' },
              { label: 'INTERNAL RPC', value: 'gRPC + Protobuf', status: 'good' },
              { label: 'MOBILE AGG', value: 'GraphQL / BFF', status: 'info' },
              { label: 'ASYNC PUSH', value: 'Signed Webhooks', status: 'info' },
            ],
            nodes: [
              { id: 'mob', type: 'users', x: 115, y: 120, label: 'Mobile / Web', sublabel: 'REST / GraphQL', tone: 'slate' },
              { id: 'ext', type: 'hex', x: 115, y: 300, label: 'Stripe / Partner', sublabel: 'HMAC Webhook', tone: 'amber' },
              { id: 'gw', type: 'hex', x: 375, y: 215, label: 'API Gateway', sublabel: 'Edge BFF', tone: 'green', badge: 'protocol bridge', badgeTone: 'green' },
              { id: 's1', type: 'hex', x: 640, y: 130, label: 'Order Svc', sublabel: 'gRPC HTTP/2', tone: 'blue' },
              { id: 's2', type: 'hex', x: 640, y: 300, label: 'User Svc', sublabel: 'gRPC HTTP/2', tone: 'purple' },
            ],
            edges: [
              { from: 'mob', to: 'gw', label: 'JSON / GQL', packetColor: 'green', bidirectional: true, speed: 1.7 },
              { from: 'ext', to: 'gw', label: 'POST webhook', packetColor: 'amber', speed: 2.1 },
              { from: 'gw', to: 's1', label: 'Protobuf', packetColor: 'blue', bidirectional: true, speed: 1.5 },
              { from: 'gw', to: 's2', label: 'Protobuf', packetColor: 'purple', bidirectional: true, speed: 1.5 },
            ],
            legend: [
              { label: 'external JSON/GQL', tone: 'green' },
              { label: 'internal binary gRPC', tone: 'blue' },
            ],
          },
        },
        {
          shortLabel: 'Idempotency',
          stage: 'SOLUTION',
          title: 'Idempotency Keys prevent double-charges on flaky retries',
          body: [
            'Alice taps "Pay \$50", the server charges her card, and the Wi-Fi drops before the `200 OK` arrives. Her app retries `POST /payments`. Without protection, she is charged **\$100**!',
            'With an **`Idempotency-Key: uuid`** header stored in a unique DB/Redis table alongside the cached response, the retry sees the existing key and returns the original `200 OK` receipt without executing the charge twice.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'GET, PUT, and DELETE are naturally idempotent; POST is NOT. Make every mutating POST (payments, bookings, orders) idempotent via a client-generated UUID key!',
          },
          scene: {
            hud: [
              { label: 'HEADER', value: 'Idempotency-Key', status: 'good' },
              { label: 'RETRY #2', value: 'Returns Cached 200', status: 'good' },
              { label: 'DOUBLE CHARGE', value: 'Impossible ✓', status: 'good' },
              { label: 'KEY TTL', value: '24–72 Hours', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 115, y: 215, label: 'Client Retry', sublabel: 'Key: ik_881a', tone: 'amber' },
              { id: 'api', type: 'hex', x: 365, y: 215, label: 'Payment API', sublabel: 'Atomic Check', tone: 'green', badge: 'deduped!', badgeTone: 'green' },
              { id: 'idem', type: 'db', x: 635, y: 120, label: 'Idempotency DB', sublabel: 'ik_881a → 200 OK', tone: 'purple' },
              { id: 'psp', type: 'hex', x: 635, y: 310, label: 'Card PSP', sublabel: 'Skipped on retry', tone: 'slate', dim: true },
            ],
            edges: [
              { from: 'c', to: 'api', label: 'retry ik_881a', packetColor: 'amber', bidirectional: true, speed: 1.8 },
              { from: 'api', to: 'idem', label: 'found → replay 200', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'api', to: 'psp', label: 'NOT called twice', packetColor: 'coral', dashed: true, dim: true, speed: 3.0 },
            ],
            legend: [
              { label: 'safe idempotent replay', tone: 'green' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'REST (HTTP/JSON)', bestWhen: 'Public APIs, CRUD, CDN-cacheable GETs', pros: 'Universal, human-readable, HTTP cache semantics', cons: 'Verbose payloads, over/under-fetching across nested entities' },
          { option: 'gRPC (HTTP/2 + Protobuf)', bestWhen: 'Internal microservices, low-latency streaming, polyglot backends', pros: '5–10× smaller payloads, strict contracts, bidirectional streaming', cons: 'Poor native browser support (needs gRPC-Web), harder curl debugging' },
          { option: 'GraphQL', bestWhen: 'Complex UI screens (web + iOS + Android) needing tailored projections', pros: 'Single round trip, zero over-fetching, strongly typed schema', cons: 'N+1 DB query risk (fix with DataLoader), harder HTTP CDN caching' },
        ],
      },
    },

    {
      id: 'queues',
      title: 'Message Queues',
      subtitle: 'Peak shaving, decoupling slow workers, visibility timeouts, at-least-once delivery, and Dead-Letter Queues.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Uber', 'Shopify'],
      tags: ['sqs', 'rabbitmq', 'dlq', 'peak shaving', 'backpressure', 'idempotent consumer', 'competing consumers'],
      objectives: [
        'Smooth massive traffic spikes (peak shaving) without crashing downstream DBs',
        'Handle worker crashes safely via Visibility Timeouts + Idempotent Consumers',
        'Route poison-pill messages to a Dead-Letter Queue (DLQ) with alerting',
      ],
      steps: [
        {
          shortLabel: 'Peak shaving',
          stage: 'SOLUTION',
          title: 'Buffers absorb 50× traffic spikes without losing a single order',
          body: [
            'During a flash sale, 100,000 orders/sec hit Checkout, while your email/invoice/inventory worker pipeline can safely process 5,000/sec. Synchronous RPCs would time out and drop orders!',
            'Inserting a durable **Message Queue** (AWS SQS, RabbitMQ, Azure Service Bus) lets Checkout enqueue and ACK in **4 ms**, while **Competing Consumer Workers** drain the queue steadily at their maximum safe throughput (**Peak Shaving**).',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Queues trade immediate synchronous completion for **resilience, backpressure protection, and elastic independent scaling** of producers vs consumers.',
          },
          scene: {
            hud: [
              { label: 'INGEST SPIKE', value: '100k msg/s', status: 'warn' },
              { label: 'CHECKOUT P99', value: '4 ms ACK', status: 'good' },
              { label: 'WORKER DRAIN', value: '5k/s Steady', status: 'good' },
              { label: 'DROPPED ORDERS', value: '0', status: 'good' },
            ],
            nodes: [
              { id: 'p', type: 'hex', x: 115, y: 215, label: 'Checkout API', sublabel: '100k spike', tone: 'blue' },
              { id: 'q', type: 'queue', x: 350, y: 215, label: 'Order Queue', sublabel: 'SQS / RabbitMQ', tone: 'amber', badge: 'shock absorber', badgeTone: 'amber' },
              { id: 'w1', type: 'hex', x: 615, y: 120, label: 'Worker 1..N', sublabel: 'Steady Drain', tone: 'green', load: 58 },
              { id: 'dlq', type: 'queue', x: 615, y: 315, label: 'Dead-Letter Q', sublabel: 'Failed > 3x', tone: 'coral', badge: 'alert + inspect', badgeTone: 'rose' },
            ],
            edges: [
              { from: 'p', to: 'q', label: 'burst enqueue', packetColor: 'coral', speed: 1.3, packetCount: 3 },
              { from: 'q', to: 'w1', label: 'pull + ACK', packetColor: 'green', speed: 2.0 },
              { from: 'q', to: 'dlq', label: 'poison pill', packetColor: 'coral', dashed: true, speed: 3.1, packetCount: 1 },
            ],
            legend: [
              { label: 'traffic burst', tone: 'coral' },
              { label: 'controlled worker drain', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'At-least-once',
          stage: 'TECHNIQUE',
          title: 'Visibility Timeout + Idempotent Workers = Effectively-Once',
          body: [
            'When Worker 1 pulls a message, the queue hides it for a **Visibility Timeout** (e.g., 30s). If Worker 1 crashes before calling `ACK`, the message reappears and Worker 2 processes it (**At-Least-Once delivery**).',
            'Because Worker 1 might have crashed *after* writing to DB but *before* calling `ACK`, every queue consumer **MUST be idempotent** (dedup by `message_id` / `order_id` unique constraint)!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Poison Pill Bug: A malformed JSON message crashes Worker 1 → retries on Worker 2 → crashes Worker 2 forever in an infinite loop! Always configure `maxReceiveCount = 3` → move to **Dead-Letter Queue (DLQ)**.',
          },
          scene: {
            hud: [
              { label: 'DELIVERY', value: 'At-Least-Once', status: 'info' },
              { label: 'SAFETY RULE', value: 'Idempotent Consumer', status: 'good' },
              { label: 'RETRY CAP', value: '3× → DLQ', status: 'good' },
              { label: 'LOSS RISK', value: 'Zero (Durable)', status: 'good' },
            ],
            nodes: [
              { id: 'q', type: 'queue', x: 150, y: 215, label: 'Queue', sublabel: 'Vis Timeout 30s', tone: 'amber' },
              { id: 'w1', type: 'hex', x: 420, y: 120, label: 'Worker 1', sublabel: 'Crash pre-ACK!', tone: 'coral', badge: 'died', badgeTone: 'rose', dim: true },
              { id: 'w2', type: 'hex', x: 420, y: 310, label: 'Worker 2', sublabel: 'Dedup + ACK ✓', tone: 'green', badge: 'idempotent', badgeTone: 'green' },
              { id: 'db', type: 'db', x: 660, y: 215, label: 'Orders DB', sublabel: 'UNIQUE(msg_id)', tone: 'purple' },
            ],
            edges: [
              { from: 'q', to: 'w1', label: 'try 1', packetColor: 'coral', dashed: true, speed: 2.5 },
              { from: 'q', to: 'w2', label: 'redeliver @ 30s', packetColor: 'green', speed: 1.8 },
              { from: 'w2', to: 'db', label: 'upsert safely', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [{ label: 'crash-safe redelivery', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'pubsub',
      title: 'Pub/Sub & Event Streaming (Kafka)',
      subtitle: 'Inside Apache Kafka: append-only partitioned logs, Consumer Groups, Offsets, ISR, and Zero-Copy.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['LinkedIn', 'Uber', 'Microsoft', 'Netflix'],
      tags: ['kafka', 'pubsub', 'partitions', 'consumer group', 'offset', 'isr', 'zero copy', 'event hubs'],
      objectives: [
        'Contrast traditional destructive queues (SQS/RabbitMQ) vs replayable event logs (Kafka)',
        'Understand how Topics, Partitions, Partition Keys, and Consumer Groups govern ordering and parallelism',
        'Explain why Kafka sustains 1M+ msg/sec (sequential disk I/O + OS page cache + zero-copy sendfile)',
      ],
      steps: [
        {
          shortLabel: 'Log & Groups',
          stage: 'SOLUTION',
          title: 'Kafka is a durable replayable commit log — multiple apps read independently',
          body: [
            'Unlike RabbitMQ (which deletes a message once consumed), **Apache Kafka** (and Azure Event Hubs) appends events to immutable **Partitions** retained for days/weeks. Each **Consumer Group** tracks its own **Offset**!',
            'So a single `OrderPlaced` event can simultaneously feed **Billing**, **Fraud ML**, **Notifications**, and **Data Warehouse** — and a brand-new analytics service can replay the last 7 days from offset `0`!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Ordering in Kafka is guaranteed **ONLY within a single Partition**, NOT across the whole topic! Always key related events by entity ID (e.g., `key = order_id` or `user_id`) so all state transitions for one order land in the exact same partition in strict order.',
          },
          scene: {
            hud: [
              { label: 'ORDERING', value: 'Per Partition', status: 'info' },
              { label: 'MAX PARALLELISM', value: '1 Consumer / Part.', status: 'warn' },
              { label: 'REPLAYABLE', value: 'Yes (Offset Seek)', status: 'good' },
              { label: 'THROUGHPUT', value: '1M+ msg/s', status: 'good' },
            ],
            nodes: [
              { id: 'prod', type: 'hex', x: 105, y: 215, label: 'Producer', sublabel: 'hash(order_id)', tone: 'blue' },
              { id: 'p0', type: 'queue', x: 350, y: 120, label: 'Partition 0', sublabel: 'Offsets 0..941', tone: 'amber', badge: 'ordered', badgeTone: 'amber' },
              { id: 'p1', type: 'queue', x: 350, y: 310, label: 'Partition 1', sublabel: 'Offsets 0..882', tone: 'amber', badge: 'ordered', badgeTone: 'amber' },
              { id: 'g1', type: 'hex', x: 635, y: 120, label: 'Billing Grp', sublabel: 'Offset: 941', tone: 'green' },
              { id: 'g2', type: 'hex', x: 635, y: 310, label: 'Fraud ML Grp', sublabel: 'Offset: 710', tone: 'purple' },
            ],
            edges: [
              { from: 'prod', to: 'p0', label: 'ord_101', packetColor: 'blue', speed: 1.6 },
              { from: 'prod', to: 'p1', label: 'ord_204', packetColor: 'blue', speed: 1.6 },
              { from: 'p0', to: 'g1', label: 'consume', packetColor: 'green', speed: 1.8 },
              { from: 'p1', to: 'g1', label: 'consume', packetColor: 'green', speed: 1.9 },
              { from: 'p0', to: 'g2', label: 'independent copy', packetColor: 'purple', dashed: true, speed: 2.3 },
              { from: 'p1', to: 'g2', label: 'independent copy', packetColor: 'purple', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'partitioned publish', tone: 'blue' },
              { label: 'independent consumer group', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Why so fast?',
          stage: 'TECHNIQUE',
          title: 'Sequential I/O, Zero-Copy `sendfile()`, and ISR Durability (`acks=all`)',
          body: [
            'Why is Kafka blazing fast despite writing to disk? 1) **Sequential disk appends** rival RAM speed, 2) **OS Page Cache** serves hot consumers straight from kernel RAM, 3) **Zero-Copy (`sendfile()`)** streams bytes directly from Page Cache → NIC without copying into JVM heap!',
            'For durability without data loss, configure **`acks=all`** with **`min.insync.replicas=2`** (replication factor 3) so a message commits only once written to Leader + at least 1 In-Sync Replica (ISR).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'If a topic has 6 partitions and you launch 10 consumers in one Consumer Group, 4 consumers sit 100% idle! Maximum concurrency in a consumer group equals the partition count.',
          },
          scene: {
            hud: [
              { label: 'DISK PATTERN', value: 'Sequential Log', status: 'good' },
              { label: 'NETWORK', value: 'Zero-Copy NIC', status: 'good' },
              { label: 'DURABILITY', value: 'acks=all · ISR≥2', status: 'good' },
              { label: 'COMPACTION', value: 'Latest Key State', status: 'info' },
            ],
            nodes: [
              { id: 'ldr', type: 'queue', x: 185, y: 215, label: 'Leader Broker', sublabel: 'Page Cache + WAL', tone: 'green', badge: 'zero-copy', badgeTone: 'green' },
              { id: 'isr1', type: 'db', x: 455, y: 120, label: 'ISR Replica 1', sublabel: 'Synced ✓', tone: 'blue' },
              { id: 'isr2', type: 'db', x: 455, y: 310, label: 'ISR Replica 2', sublabel: 'Synced ✓', tone: 'blue' },
              { id: 'nic', type: 'hex', x: 665, y: 215, label: 'DMA → NIC', sublabel: 'Bypass JVM Heap', tone: 'purple' },
            ],
            edges: [
              { from: 'ldr', to: 'isr1', label: 'replicate', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'ldr', to: 'isr2', label: 'replicate', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'ldr', to: 'nic', label: 'sendfile()', packetColor: 'purple', speed: 1.5 },
            ],
            legend: [
              { label: 'ISR durability', tone: 'blue' },
              { label: 'zero-copy stream', tone: 'purple' },
            ],
          },
        },
      ],
    },

    {
      id: 'realtime',
      title: 'Real-Time Updates',
      subtitle: 'Short Polling vs Long Polling vs Server-Sent Events (SSE) vs WebSockets vs WebRTC.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Meta', 'Microsoft', 'Discord', 'OpenAI'],
      tags: ['websockets', 'sse', 'long polling', 'short polling', 'webrtc', 'streaming'],
      objectives: [
        'Compare all 5 real-time communication mechanisms by direction, overhead, and firewall friendliness',
        'Know why ChatGPT / LLM token streaming uses SSE while WhatsApp / Trading uses WebSockets',
        'Understand WebRTC P2P media (STUN/TURN) for video & voice calls',
      ],
      steps: [
        {
          shortLabel: 'Compare 5',
          stage: 'TECHNIQUE',
          title: 'Pick the simplest push mechanism that matches your directionality',
          body: [
            '**Short Polling** wastes bandwidth asking "any updates?" every 2s. **Long Polling** holds the HTTP request open until data arrives (good fallback).',
            '**Server-Sent Events (SSE)** is pure one-way HTTP streaming (Server → Client) with automatic reconnects — ideal for **LLM token streaming (ChatGPT/Copilot)**, live sports scores, and stock tickers! **WebSockets** upgrade HTTP to a full-duplex persistent TCP socket for **Chat, Multiplayer Games, and Collaborative Docs**.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Don’t reach for WebSockets blindly! If updates only flow Server → Client (notifications, dashboards, AI streaming), **SSE over HTTP/2** is far simpler to load-balance and firewall-friendly than WebSockets.',
          },
          scene: {
            hud: [
              { label: 'SSE', value: 'Server → Client', status: 'good' },
              { label: 'WEBSOCKETS', value: 'Full Duplex TCP', status: 'good' },
              { label: 'WEBRTC', value: 'P2P Audio/Video', status: 'info' },
              { label: 'LONG POLL', value: 'Legacy Fallback', status: 'warn' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 120, y: 215, label: 'Browser / App', sublabel: 'Real-time UI', tone: 'slate' },
              { id: 'sse', type: 'hex', x: 430, y: 100, label: 'SSE Stream', sublabel: 'AI Tokens / Feed', tone: 'green', badge: 'HTTP/2 1-way', badgeTone: 'green' },
              { id: 'ws', type: 'hex', x: 430, y: 215, label: 'WebSocket GW', sublabel: 'Chat / Docs', tone: 'blue', badge: 'full duplex', badgeTone: 'blue' },
              { id: 'rtc', type: 'hex', x: 430, y: 335, label: 'WebRTC SFU', sublabel: 'Teams / Zoom', tone: 'purple', badge: 'UDP media', badgeTone: 'purple' },
            ],
            edges: [
              { from: 'sse', to: 'c', label: 'text/event-stream', packetColor: 'green', speed: 1.6 },
              { from: 'c', to: 'ws', label: 'ws:// bidirectional', packetColor: 'blue', bidirectional: true, speed: 1.5 },
              { from: 'c', to: 'rtc', label: 'SRTP / UDP P2P', packetColor: 'purple', bidirectional: true, speed: 1.4 },
            ],
            legend: [
              { label: 'SSE 1-way push', tone: 'green' },
              { label: 'WebSocket 2-way', tone: 'blue' },
              { label: 'WebRTC UDP media', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Scaling WS',
          stage: 'SOLUTION',
          title: 'Scaling 10M WebSockets: Stateful Gateways + Pub/Sub Backplane',
          body: [
            'A single tuned Linux box holds ~100k–500k idle WebSocket connections (limited by RAM per socket + file descriptors, not CPU). To serve 10M concurrent users, run 100 **WebSocket Gateways**.',
            'When Alice (on Gateway #1) messages Bob (on Gateway #47), Gateway #1 publishes to **Redis Pub/Sub / Kafka** (or looks up Bob’s gateway in a **Session Registry**) so Gateway #47 pushes the frame down Bob’s open socket!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Deploying a WebSocket gateway disconnects 100k users at once — causing a **Thundering Herd Reconnect Storm**! Mitigate with **draining + randomized client reconnect jitter**.',
          },
          scene: {
            hud: [
              { label: 'CONNS / NODE', value: '100k – 500k', status: 'good' },
              { label: 'CROSS-GW BUS', value: 'Redis Pub/Sub', status: 'info' },
              { label: 'HEARTBEAT', value: 'Every 30s', status: 'info' },
              { label: 'RECONNECT', value: 'Jittered Backoff', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 95, y: 120, label: 'Alice', sublabel: 'On GW #1', tone: 'slate' },
              { id: 'gw1', type: 'hex', x: 270, y: 120, label: 'WS GW #1', sublabel: '100k sockets', tone: 'blue' },
              { id: 'bus', type: 'queue', x: 455, y: 215, label: 'Pub/Sub Bus', sublabel: 'Routes to GW #47', tone: 'amber' },
              { id: 'gw47', type: 'hex', x: 270, y: 315, label: 'WS GW #47', sublabel: '100k sockets', tone: 'green' },
              { id: 'b', type: 'users', x: 95, y: 315, label: 'Bob', sublabel: 'Receives in 25ms', tone: 'slate' },
            ],
            edges: [
              { from: 'a', to: 'gw1', label: 'send msg', packetColor: 'blue', speed: 1.7 },
              { from: 'gw1', to: 'bus', label: 'route(Bob)', packetColor: 'amber', speed: 1.6 },
              { from: 'bus', to: 'gw47', label: 'deliver', packetColor: 'green', speed: 1.6 },
              { from: 'gw47', to: 'b', label: 'push frame', packetColor: 'green', speed: 1.5 },
            ],
            legend: [{ label: 'cross-gateway message relay', tone: 'green' }],
          },
        },
      ],
    },
  ],
};

export const MODULE_05_RELIABILITY = {
  id: 'mod-05-reliability',
  number: '05',
  title: 'Reliability',
  track: 'hld',
  lessons: [
    {
      id: 'redundancy',
      title: 'Redundancy, Failover & Cells',
      subtitle: 'Multi-AZ & Multi-Region DR (RPO/RTO), Active-Active vs Active-Passive, and Cell-Based Blast Radius Isolation.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Microsoft', 'Netflix', 'Google'],
      tags: ['high availability', 'rpo', 'rto', 'active-active', 'cell architecture', 'multi-region', 'blast radius'],
      objectives: [
        'Define Availability Nines (99.9% vs 99.99%), RPO (data loss), and RTO (downtime)',
        'Compare Active-Passive (Warm Standby / Pilot Light) vs Active-Active Multi-Region',
        'Apply Amazon/Azure Cell-Based Architecture to cap outage blast radius to 1/N of users',
      ],
      steps: [
        {
          shortLabel: 'Active-Active',
          stage: 'SOLUTION',
          title: 'Active-Passive vs Active-Active Multi-Region & RPO/RTO',
          body: [
            '**RPO (Recovery Point Objective)** is the max data loss tolerated (e.g., 5 seconds of async lag). **RTO (Recovery Time Objective)** is how fast service recovers after disaster.',
            '**Active-Passive** runs production in US-East and fails over to US-West on disaster (simpler consistency, minutes of RTO). **Active-Active** serves live traffic in both US and EU simultaneously (lowest latency, near-zero RTO, but requires handling multi-region write conflicts!).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'If you say "Active-Active Multi-Region," immediately address **how writes avoid conflicts** (e.g., Geo-Pinned Home Region per user, CRDTs, or Distributed SQL Spanner)!',
          },
          scene: {
            hud: [
              { label: 'AVAILABILITY', value: '99.99% (52m/yr)', status: 'good' },
              { label: 'RPO TARGET', value: '< 5 sec', status: 'good' },
              { label: 'RTO TARGET', value: '< 30 sec', status: 'good' },
              { label: 'ROUTING', value: 'GeoDNS + Health', status: 'info' },
            ],
            nodes: [
              { id: 'dns', type: 'hex', x: 380, y: 80, label: 'Global Traffic Mgr', sublabel: 'Azure Front Door / R53', tone: 'green' },
              { id: 'us', type: 'hex', x: 185, y: 235, label: 'US-East Region', sublabel: '3 AZs · Active', tone: 'blue', badge: 'healthy', badgeTone: 'green', load: 44 },
              { id: 'eu', type: 'hex', x: 575, y: 235, label: 'EU-West Region', sublabel: '3 AZs · Active', tone: 'purple', badge: 'healthy', badgeTone: 'green', load: 41 },
              { id: 'sync', type: 'db', x: 380, y: 340, label: 'Cross-Region Rep', sublabel: 'Async / Global DB', tone: 'amber' },
            ],
            edges: [
              { from: 'dns', to: 'us', label: 'Americas', packetColor: 'blue', speed: 1.7 },
              { from: 'dns', to: 'eu', label: 'EMEA / Failover', packetColor: 'purple', speed: 1.7 },
              { from: 'us', to: 'sync', label: 'replicate', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'eu', to: 'sync', label: 'replicate', packetColor: 'amber', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'active-active regional traffic', tone: 'blue' }],
          },
        },
        {
          shortLabel: 'Cell Isolation',
          stage: 'TECHNIQUE',
          title: 'Cell-Based Architecture caps blast radius to 1/N of customers',
          body: [
            'A bad config deploy or noisy tenant in a giant shared cluster can take down **100% of users** at once. **Amazon, Slack, and Microsoft Azure** partition production into independent **Cells** (each cell has its own stateless services, Redis, and DB shard serving 5% of tenants).',
            'A thin **Cell Router** hashes `tenant_id → Cell #k`. Even a catastrophic bug rolled out to Cell 1 leaves 95% of customers completely untouched!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Cell-based architecture + Shuffle Sharding (assigning each tenant to 2 of N cells) makes multi-tenant "noisy neighbor" outages mathematically near-impossible.',
          },
          scene: {
            hud: [
              { label: 'BLAST RADIUS', value: 'Max 1 Cell (25%)', status: 'good' },
              { label: 'DEPLOY ROLLOUT', value: 'Cell 1 → 2 → All', status: 'good' },
              { label: 'NOISY NEIGHBOR', value: 'Contained ✓', status: 'good' },
              { label: 'PATTERN', value: 'Azure / AWS Cells', status: 'info' },
            ],
            nodes: [
              { id: 'rt', type: 'hex', x: 135, y: 215, label: 'Cell Router', sublabel: 'Stateless Thin', tone: 'green' },
              { id: 'c1', type: 'hex', x: 485, y: 95, label: 'Cell 1 (Canary)', sublabel: 'App + Cache + DB', tone: 'coral', badge: 'bad deploy isolated', badgeTone: 'rose' },
              { id: 'c2', type: 'hex', x: 485, y: 215, label: 'Cell 2', sublabel: 'App + Cache + DB', tone: 'green', badge: '100% healthy', badgeTone: 'green' },
              { id: 'c3', type: 'hex', x: 485, y: 335, label: 'Cell 3..N', sublabel: 'App + Cache + DB', tone: 'green', badge: '100% healthy', badgeTone: 'green' },
            ],
            edges: [
              { from: 'rt', to: 'c1', label: '5% tenants', packetColor: 'coral', dashed: true, speed: 2.5 },
              { from: 'rt', to: 'c2', label: 'healthy', packetColor: 'green', speed: 1.7 },
              { from: 'rt', to: 'c3', label: 'healthy', packetColor: 'green', speed: 1.7 },
            ],
            legend: [
              { label: 'isolated healthy cell', tone: 'green' },
              { label: 'contained canary fault', tone: 'coral' },
            ],
          },
        },
      ],
    },

    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      subtitle: 'Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log/Counter, and atomic Redis Lua scripts.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Stripe', 'Cloudflare', 'Microsoft', 'Amazon'],
      tags: ['token bucket', 'leaky bucket', 'sliding window', 'redis lua', '429', 'ddos'],
      objectives: [
        'Compare all 5 Rate Limiting algorithms by burst handling, accuracy, and RAM footprint',
        'Prevent distributed race conditions using atomic Redis Lua scripts',
        'Return standard `HTTP 429` + `X-RateLimit-Remaining` + `Retry-After` headers',
      ],
      steps: [
        {
          shortLabel: '5 Algorithms',
          stage: 'TECHNIQUE',
          title: 'Token Bucket vs Leaky Bucket vs Sliding Window Counter',
          body: [
            '1. **Token Bucket** (AWS/Stripe): Tokens refill at rate `R` up to capacity `B` — **allows controlled short bursts** while capping long-term average.',
            '2. **Leaky Bucket**: Requests queue and drain at a **strictly constant pace** — smooths traffic for fragile downstream APIs.',
            '3. **Fixed Window**: Simple counter per minute, BUT suffers a **2× boundary spike** (`59.9s` + `60.1s`). **Sliding Window Counter** blends previous + current window weights in **O(1) memory** with < 0.1% approximation error!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Stress-test all 4 algorithms side-by-side with live burst buttons in **Design Lab → Rate Limiter Arena**!',
          },
          scene: {
            hud: [
              { label: 'TOKEN BUCKET', value: 'Bursts Allowed', status: 'good' },
              { label: 'LEAKY BUCKET', value: 'Constant Outflow', status: 'info' },
              { label: 'SLIDING COUNTER', value: 'O(1) Accurate', status: 'good' },
              { label: 'HTTP CODE', value: '429 + Retry-After', status: 'warn' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 110, y: 215, label: 'API Clients', sublabel: 'Burst 500 req/s', tone: 'slate' },
              { id: 'rl', type: 'hex', x: 350, y: 215, label: 'Rate Limiter', sublabel: 'Gateway Middleware', tone: 'amber', badge: 'Token Bucket', badgeTone: 'amber' },
              { id: 'rd', type: 'cache', x: 350, y: 355, label: 'Redis Lua', sublabel: 'Atomic Eval (0.4ms)', tone: 'purple' },
              { id: 'ok', type: 'hex', x: 635, y: 130, label: 'Backend API', sublabel: 'Protected ✓', tone: 'green', load: 36 },
              { id: 'rej', type: 'hex', x: 635, y: 300, label: '429 Rejected', sublabel: 'Retry-After: 2s', tone: 'coral' },
            ],
            edges: [
              { from: 'c', to: 'rl', label: 'API key', packetColor: 'blue', speed: 1.5, packetCount: 3 },
              { from: 'rl', to: 'rd', label: 'Lua script', packetColor: 'purple', bidirectional: true, speed: 1.4 },
              { from: 'rl', to: 'ok', label: 'allowed', packetColor: 'green', speed: 1.7 },
              { from: 'rl', to: 'rej', label: 'over limit', packetColor: 'coral', dashed: true, speed: 2.0 },
            ],
            legend: [
              { label: 'allowed request', tone: 'green' },
              { label: '429 throttled', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Race & Failover',
          stage: 'SOLUTION',
          title: 'Atomic Redis Lua fixes read-then-write races; Fail-Open vs Fail-Closed',
          body: [
            'If 2 API Gateways run `GET count` → both see `99` → both allow and `SET 100`, you leak extra requests! Running the check-and-decrement inside a single **Redis Lua script** executes atomically on Redis’s single-threaded loop.',
            'What if Redis itself goes unreachable? Decide explicitly: **Fail-Open** (allow traffic so checkout doesn’t break during a Redis blip) vs **Fail-Closed** (block traffic for security-critical login/OTP endpoints)!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Always ask your interviewer: "If the rate-limiter Redis cluster goes down, should we Fail-Open for availability or Fail-Closed for protection?" That question alone earns Staff points.',
          },
          scene: {
            hud: [
              { label: 'ATOMICITY', value: 'Redis Lua Eval', status: 'good' },
              { label: 'CHECKOUT RL', value: 'Fail-Open', status: 'info' },
              { label: 'LOGIN / OTP RL', value: 'Fail-Closed', status: 'warn' },
              { label: 'MULTI-REGION', value: 'Local + Async Sync', status: 'good' },
            ],
            nodes: [
              { id: 'g1', type: 'hex', x: 145, y: 135, label: 'Gateway 1', sublabel: 'EVALSHA', tone: 'blue' },
              { id: 'g2', type: 'hex', x: 145, y: 295, label: 'Gateway 2', sublabel: 'EVALSHA', tone: 'blue' },
              { id: 'lua', type: 'cache', x: 470, y: 215, label: 'Redis Single-Thread', sublabel: 'Atomic Lua Script', tone: 'green', badge: 'zero race!', badgeTone: 'green' },
            ],
            edges: [
              { from: 'g1', to: 'lua', label: 'atomic #1', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'g2', to: 'lua', label: 'atomic #2', packetColor: 'green', bidirectional: true, speed: 1.9 },
            ],
            legend: [{ label: 'serialized atomic Lua execution', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'timeouts-retries',
      title: 'Timeouts, Retries & Circuit Breakers',
      subtitle: 'Stopping cascading failures with Exponential Backoff + Full Jitter, Circuit Breakers, and Bulkheads.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Netflix', 'Microsoft', 'Google'],
      tags: ['circuit breaker', 'exponential backoff', 'jitter', 'bulkhead', 'cascading failure', 'load shedding'],
      objectives: [
        'Prevent thread-pool exhaustion with strict connect + read timeouts',
        'Avoid synchronized thundering-herd retries using Exponential Backoff + Full Jitter',
        'Implement the 3-state Circuit Breaker (Closed → Open → Half-Open) and Bulkhead Isolation',
      ],
      steps: [
        {
          shortLabel: 'Cascading crash',
          stage: 'PROBLEM',
          title: 'One slow dependency freezes every caller’s thread pool',
          body: [
            'Suppose Recommendation Service stalls for 30 seconds instead of failing fast. Frontend API threads wait indefinitely; incoming requests pile up, exhaust all 500 worker threads, and **crash the entire Checkout site** even though Checkout doesn’t even need recommendations!',
            'Then clients blindly retry every 1 second in lockstep, multiplying load 10× on the struggling server (**Retry Storm**).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'A slow dependency is FAR more dangerous than a dead dependency that returns `503` in 2 ms! Always configure explicit timeouts on every outbound HTTP/DB/RPC client.',
          },
          scene: {
            hud: [
              { label: 'RECS SERVICE', value: '30s Hang!', status: 'bad' },
              { label: 'CALLER THREADS', value: '500 / 500 Blocked', status: 'bad' },
              { label: 'CHECKOUT', value: 'Collateral Outage', status: 'bad' },
              { label: 'RETRY LOAD', value: '10× Storm', status: 'bad' },
            ],
            nodes: [
              { id: 'fe', type: 'hex', x: 165, y: 215, label: 'Storefront API', sublabel: '500/500 Blocked', tone: 'coral', badge: 'thread exhaustion', badgeTone: 'rose', load: 99 },
              { id: 'rec', type: 'hex', x: 545, y: 215, label: 'Recs Service', sublabel: 'Stalled 30s', tone: 'coral', badge: 'zombie hang', badgeTone: 'rose', load: 98 },
            ],
            edges: [
              { from: 'fe', to: 'rec', label: 'no timeout + retry storm!', packetColor: 'coral', speed: 1.4, packetCount: 3 },
            ],
            legend: [{ label: 'cascading thread starvation', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Breaker + Jitter',
          stage: 'SOLUTION',
          title: 'Circuit Breaker + Full Jitter + Bulkhead contain the blast',
          body: [
            '1. **Circuit Breaker**: Normally **CLOSED**. If error/timeout rate crosses 50%, it trips **OPEN** and fails fast locally in `0.1 ms` (serving a cached fallback!) so Recs can breathe. After 30s, **HALF-OPEN** sends 1 probe request to test recovery.',
            '2. **Exponential Backoff + Full Jitter**: `sleep = random(0, min(cap, base * 2^attempt))` spreads retries evenly over time.',
            '3. **Bulkhead Pattern**: Give Recommendations its own 20-thread pool separate from Checkout’s 200-thread pool — like watertight ship compartments!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'AWS’s famous "Exponential Backoff And Jitter" study proved Full Jitter reduces server contention and finishes all work faster than pure exponential backoff.',
          },
          changes: [
            '+Circuit Breaker trips OPEN → fails fast in 0.1 ms with fallback',
            '+Bulkhead isolates Recs to max 20 threads; Checkout stays 100% healthy',
            '+Full Jitter eliminates synchronized retry spikes',
          ],
          scene: {
            hud: [
              { label: 'BREAKER STATE', value: 'OPEN → Fallback', status: 'warn' },
              { label: 'CHECKOUT SLA', value: '100% Healthy ✓', status: 'good' },
              { label: 'RETRY POLICY', value: 'Exp + Full Jitter', status: 'good' },
              { label: 'ISOLATION', value: 'Bulkhead Pools', status: 'good' },
            ],
            nodes: [
              { id: 'fe', type: 'hex', x: 135, y: 215, label: 'Storefront', sublabel: 'Bulkhead Isolated', tone: 'green', load: 34 },
              { id: 'cb', type: 'hex', x: 375, y: 120, label: 'Circuit Breaker', sublabel: 'OPEN → Cached Recs', tone: 'amber', badge: 'fail-fast 0.1ms', badgeTone: 'amber' },
              { id: 'chk', type: 'hex', x: 625, y: 295, label: 'Checkout Pool', sublabel: '200 Threads OK', tone: 'green', badge: 'unharmed', badgeTone: 'green', load: 40 },
              { id: 'rec', type: 'hex', x: 625, y: 120, label: 'Recs Service', sublabel: 'Recovering safely', tone: 'coral', dim: true, load: 22 },
            ],
            edges: [
              { from: 'fe', to: 'cb', label: '0.1ms fallback', packetColor: 'amber', bidirectional: true, speed: 1.6 },
              { from: 'cb', to: 'rec', label: '1 half-open probe', packetColor: 'coral', dashed: true, speed: 3.4, packetCount: 1 },
              { from: 'fe', to: 'chk', label: 'isolated pool', packetColor: 'green', bidirectional: true, speed: 1.6 },
            ],
            legend: [
              { label: 'protected checkout traffic', tone: 'green' },
              { label: 'circuit-breaker fallback', tone: 'amber' },
            ],
          },
        },
      ],
    },

    {
      id: 'observability',
      title: 'Observability & SLOs',
      subtitle: 'Metrics (RED/USE), Structured Logs, OpenTelemetry Distributed Tracing, and Error Budgets.',
      duration: '8 min',
      level: 'Beginner',
      companies: ['Google', 'Microsoft', 'Datadog', 'Amazon'],
      tags: ['prometheus', 'grafana', 'opentelemetry', 'jaeger', 'elk', 'sli', 'slo', 'sla', 'error budget'],
      sources: [
        { title: 'Google SRE · Service level objectives', url: 'https://sre.google/sre-book/service-level-objectives/' },
        { title: 'Google SRE Workbook · Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/' },
        { title: 'OpenTelemetry · Sampling', url: 'https://opentelemetry.io/docs/concepts/sampling/' },
      ],
      objectives: [
        'Distinguish the Three Pillars: Metrics (what), Traces (where), Logs (why)',
        'Propagate W3C `traceparent` TraceID/SpanID across microservices and Kafka',
        'Manage reliability scientifically using SLIs, SLOs, SLAs, and Error Budgets',
      ],
      steps: [
        {
          shortLabel: 'Three Pillars',
          stage: 'SOLUTION',
          title: 'Metrics alert you, Traces pinpoint the slow hop, Logs explain why',
          body: [
            '1. **Metrics** (Prometheus / Azure Monitor): Cheap numeric time-series tracking **RED** (Rate, Errors, Duration p99) for services and **USE** (Utilization, Saturation, Errors) for hardware.',
            '2. **Distributed Tracing** (OpenTelemetry / Jaeger): Stamps every request with a **`TraceID`** at the gateway and creates child **`SpanID`s** across every gRPC, DB, and Kafka hop so you spot the exact 420 ms bottleneck in a waterfall graph.',
            '3. **Structured Logs** (JSON in ELK / Loki): Attach `trace_id` to error logs for root-cause stack traces.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: '**Tail sampling** lets a collector retain traces based on observed errors or latency. Budget for buffering spans while the decision is pending. Use counters over eligible requests to calculate success rates because sampled traces can overrepresent errors.',
          },
          scene: {
            hud: [
              { label: 'METRICS', value: 'RED · Prometheus', status: 'good' },
              { label: 'TRACING', value: 'OTel TraceID', status: 'good' },
              { label: 'SAMPLING', value: 'Prioritize errors', status: 'good' },
              { label: 'ERROR BUDGET', value: '0.1% / 30 days', status: 'info' },
            ],
            nodes: [
              { id: 'svc', type: 'hex', x: 135, y: 215, label: 'Microservices', sublabel: 'OTel SDK', tone: 'blue' },
              { id: 'col', type: 'hex', x: 360, y: 215, label: 'OTel Collector', sublabel: 'Tail Sampler', tone: 'green' },
              { id: 'm', type: 'db', x: 630, y: 95, label: 'Metrics TSDB', sublabel: 'Prometheus/Alert', tone: 'amber' },
              { id: 't', type: 'db', x: 630, y: 215, label: 'Trace Store', sublabel: 'Tempo / Jaeger', tone: 'purple' },
              { id: 'l', type: 'db', x: 630, y: 335, label: 'Log Index', sublabel: 'ELK / Loki', tone: 'blue' },
            ],
            edges: [
              { from: 'svc', to: 'col', label: 'OTLP stream', packetColor: 'green', speed: 1.6 },
              { from: 'col', to: 'm', label: 'p99 / RPS', packetColor: 'amber', speed: 1.8 },
              { from: 'col', to: 't', label: 'slow/err spans', packetColor: 'purple', speed: 1.9 },
              { from: 'col', to: 'l', label: 'JSON logs', packetColor: 'blue', speed: 2.0 },
            ],
            legend: [
              { label: 'telemetry pipeline', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'SLI / SLO / SLA',
          stage: 'TECHNIQUE',
          title: 'Count the checkout requests that miss the objective',
          body: [
            'Define a good checkout as an eligible request that succeeds within 300 ms. The **service level indicator (SLI)** is the measured fraction of good requests. The **service level objective (SLO)** sets a target for that fraction over a window. A **service level agreement (SLA)** specifies commitments to users and the consequences of missing them. Its definitions, window and thresholds come from the agreement.',
            'In a 30-day window with one million eligible requests, a 99.9% objective allows 1,000 misses. At 99.94% good, 600 missed and 400 remain in the **error budget**. A separate time-based 99.9% availability objective over 30 days permits 43.2 minutes of unavailability. Request-based misses can cluster in a busy minute or spread over many hours.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: '**Burn rate** is the observed bad-request fraction divided by the allowed fraction. An error rate of 2% against a 0.1% allowance burns at 20×. Compare recent and sustained windows when deciding whether to page.',
          },
          scene: {
            hud: [
              { label: 'SLI (MEASURED)', value: '99.94%', status: 'good' },
              { label: 'SLO (TARGET)', value: '99.90%', status: 'good' },
              { label: 'MISSES', value: '600 of 1,000 allowed', status: 'info' },
              { label: 'BUDGET LEFT', value: '400 (40%)', status: 'good' },
            ],
            nodes: [
              { id: 'sli', type: 'hex', x: 165, y: 215, label: 'SLI', sublabel: 'Good / eligible', tone: 'blue' },
              { id: 'slo', type: 'hex', x: 400, y: 215, label: 'Error budget', sublabel: '1,000 misses', tone: 'green', badge: '400 remaining', badgeTone: 'green' },
              { id: 'act', type: 'hex', x: 635, y: 215, label: 'Release policy', sublabel: 'Review burn rate', tone: 'purple' },
            ],
            edges: [
              { from: 'sli', to: 'slo', label: 'compare', packetColor: 'blue', speed: 1.8 },
              { from: 'slo', to: 'act', label: 'burn-rate alert', packetColor: 'green', speed: 1.8 },
            ],
            legend: [{ label: 'SRE error-budget loop', tone: 'green' }],
          },
        },
      ],
    },
  ],
};

export const MODULES_04_05 = [MODULE_04_COMMUNICATION, MODULE_05_RELIABILITY];
