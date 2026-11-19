// Module 01: Foundations (3 lessons) & Module 02: Scaling (5 lessons)
// Every lesson has multi-step animated 2.5D isometric scenes + Staff-level Deep Engineering Vault

export const MODULE_01_FOUNDATIONS = {
  id: 'mod-01-foundations',
  number: '01',
  title: 'Foundations',
  track: 'hld',
  lessons: [
    {
      id: 'request-lifecycle',
      title: 'How a Request Travels',
      subtitle: 'From typing a URL to rendered pixels: DNS, TCP/TLS 1.3, HTTP/2 & HTTP/3 QUIC, and backend hops.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Google', 'Amazon', 'Meta'],
      tags: ['dns', 'tcp', 'tls', 'http2', 'http3', 'quic', 'osi', 'nat', 'browser'],
      objectives: [
        'Trace DNS recursive resolution and Anycast edge routing',
        'Understand TCP 3-way handshake + TLS 1.3 RTT cost',
        'Contrast HTTP/1.1, HTTP/2 multiplexing, and HTTP/3 QUIC',
        'Identify where latency hides inside a production request lifecycle',
      ],
      steps: [
        {
          shortLabel: 'DNS lookup',
          stage: 'SETUP',
          title: 'Translating a domain name to an IP',
          body: [
            'Before a single byte of HTTP leaves your browser, it must resolve `api.shop.com` to an IPv4/IPv6 address via **DNS**. The browser checks its own cache, OS cache, ISP recursive resolver, and then walks Root → TLD (`.com`) → Authoritative Nameserver.',
            'Modern systems use **Anycast DNS** and GeoDNS so a user in Mumbai receives an IP belonging to an edge PoP 15 ms away instead of crossing an ocean.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'DNS TTL controls the trade-off between lookup speed (long TTL = fewer lookups) and failover agility (short TTL = faster traffic shifting during an outage).',
          },
          scene: {
            hud: [
              { label: 'PHASE', value: 'DNS Resolution', status: 'info' },
              { label: 'CACHE MISS RTT', value: '20 – 120 ms', status: 'warn' },
              { label: 'CACHE HIT', value: '< 1 ms', status: 'good' },
              { label: 'PROTOCOL', value: 'UDP :53 / DoH', status: 'info' },
            ],
            nodes: [
              { id: 'browser', type: 'users', x: 130, y: 215, label: 'Browser', sublabel: 'Local Cache', tone: 'slate' },
              { id: 'resolver', type: 'hex', x: 380, y: 215, label: 'DNS Resolver', sublabel: 'ISP / 1.1.1.1', tone: 'blue', badge: 'recursive', badgeTone: 'blue' },
              { id: 'auth', type: 'db', x: 625, y: 145, label: 'Authoritative', sublabel: 'Route53 / Azure DNS', tone: 'purple', callout: 'TTL 60s' },
              { id: 'root', type: 'db', x: 625, y: 295, label: 'Root & TLD', sublabel: '.com NS', tone: 'amber' },
            ],
            edges: [
              { from: 'browser', to: 'resolver', label: 'A/AAAA query', packetColor: 'coral', bidirectional: true, speed: 2.1 },
              { from: 'resolver', to: 'root', label: '1. root → .com', packetColor: 'amber', dashed: true, speed: 2.6 },
              { from: 'resolver', to: 'auth', label: '2. IP: 203.0.113.42', packetColor: 'green', bidirectional: true, speed: 2.0 },
            ],
            legend: [
              { label: 'DNS query', tone: 'coral' },
              { label: 'resolved IP', tone: 'green' },
              { label: 'cache miss walk', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'TCP & TLS',
          stage: 'PROBLEM',
          title: 'Handshakes cost multiple round trips',
          body: [
            'Once the browser has an IP, it opens a reliable **TCP connection** (SYN → SYN-ACK → ACK = 1 RTT) and then negotiates **TLS encryption** so traffic cannot be eavesdropped or tampered with.',
            'With legacy TLS 1.2, TCP + TLS requires **3 full round trips** before sending the first HTTP byte. On a 120 ms mobile network, that burns 360 ms doing pure ceremony!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'TLS 1.3 cuts the cryptographic handshake down to 1 RTT (and 0-RTT for resumed sessions), while TCP Keep-Alive avoids repeating handshakes per request.',
          },
          scene: {
            hud: [
              { label: 'TCP HANDSHAKE', value: '1 RTT', status: 'warn' },
              { label: 'TLS 1.2 / 1.3', value: '2 RTT → 1 RTT', status: 'good' },
              { label: 'CONGESTION CTRL', value: 'Slow Start', status: 'info' },
              { label: 'PORT', value: 'HTTPS :443', status: 'info' },
            ],
            nodes: [
              { id: 'client', type: 'users', x: 165, y: 215, label: 'Client', sublabel: 'NAT + Ephemeral Port', tone: 'slate' },
              { id: 'edge', type: 'hex', x: 560, y: 215, label: 'TLS Edge', sublabel: 'Envoy / Nginx', tone: 'blue', badge: 'TLS 1.3', badgeTone: 'green', load: 38 },
            ],
            edges: [
              { from: 'client', to: 'edge', label: '1. TCP SYN / SYN-ACK / ACK', packetColor: 'coral', curve: -48, speed: 2.3 },
              { from: 'client', to: 'edge', label: '2. TLS 1.3 KeyShare + Cert', packetColor: 'purple', curve: 0, bidirectional: true, speed: 2.1 },
              { from: 'client', to: 'edge', label: '3. Encrypted HTTP Request', packetColor: 'green', curve: 52, bidirectional: true, speed: 1.8 },
            ],
            legend: [
              { label: 'TCP handshake', tone: 'coral' },
              { label: 'TLS crypto', tone: 'purple' },
              { label: 'HTTP payload', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'HTTP/2 & 3',
          stage: 'SOLUTION',
          title: 'Multiplexing & QUIC kill head-of-line blocking',
          body: [
            '**HTTP/1.1** could only serve one request at a time per TCP connection, forcing browsers to open 6 parallel sockets. **HTTP/2** introduced binary framing and **stream multiplexing** over a single TCP connection plus HPACK header compression.',
            'However, a single dropped TCP packet still stalls every HTTP/2 stream (**TCP Head-of-Line blocking**). **HTTP/3 (QUIC)** runs over UDP with built-in TLS 1.3 and independent streams, surviving Wi-Fi ↔ 5G handoffs cleanly via Connection IDs.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'gRPC runs on top of HTTP/2 using binary Protocol Buffers, enabling bidirectional streaming and 5–10x smaller payloads than JSON over HTTP/1.1.',
          },
          changes: [
            '+Multiplexed parallel streams on 1 connection',
            '+QUIC merges transport + TLS 1.3 into 1 RTT',
            '~Eliminates TCP head-of-line stalls on lossy mobile links',
          ],
          scene: {
            hud: [
              { label: 'HTTP/1.1', value: '6 TCP Conns', status: 'bad' },
              { label: 'HTTP/2', value: '1 TCP · Mux', status: 'warn' },
              { label: 'HTTP/3 QUIC', value: 'UDP · 0/1-RTT', status: 'good' },
              { label: 'MOBILE LOSS', value: 'Isolated Streams', status: 'good' },
            ],
            nodes: [
              { id: 'mobile', type: 'users', x: 130, y: 215, label: 'Mobile App', sublabel: '5G / Wi-Fi Roam', tone: 'slate', badge: 'QUIC ConnID', badgeTone: 'green' },
              { id: 'gw', type: 'hex', x: 400, y: 215, label: 'Edge Gateway', sublabel: 'HTTP/3 → HTTP/2', tone: 'green', load: 34 },
              { id: 'api', type: 'hex', x: 640, y: 215, label: 'Origin API', sublabel: 'gRPC / REST', tone: 'blue', load: 42 },
            ],
            edges: [
              { from: 'mobile', to: 'gw', label: 'Stream 1 (JSON)', packetColor: 'green', curve: -40, speed: 1.7 },
              { from: 'mobile', to: 'gw', label: 'Stream 2 (Image)', packetColor: 'blue', curve: 0, speed: 2.0 },
              { from: 'mobile', to: 'gw', label: 'Stream 3 (CSS)', packetColor: 'purple', curve: 40, speed: 1.9 },
              { from: 'gw', to: 'api', label: 'Internal gRPC', packetColor: 'amber', bidirectional: true, speed: 1.6 },
            ],
            legend: [
              { label: 'independent QUIC streams', tone: 'green' },
              { label: 'internal RPC', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Backend hops',
          stage: 'TECHNIQUE',
          title: 'Inside the datacenter: Edge → App → Cache → DB',
          body: [
            'Once past TLS termination at the **Load Balancer / API Gateway**, the request is authenticated, rate-limited, and routed to a stateless application server.',
            'The app server checks an in-memory **Cache** (Redis, ~0.5 ms) before falling back to the primary **Database** (PostgreSQL, ~5–15 ms), then serializes the response back along the path.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In Microsoft/Google interviews, always distinguish external WAN latency (50–200 ms) from internal datacenter RPC latency (0.5–2 ms).',
          },
          scene: {
            hud: [
              { label: 'GATEWAY HOP', value: '2 ms', status: 'good' },
              { label: 'REDIS HIT', value: '0.6 ms', status: 'good' },
              { label: 'DB QUERY', value: '8 ms', status: 'info' },
              { label: 'TOTAL P95', value: '48 ms', status: 'good' },
            ],
            nodes: [
              { id: 'user', type: 'users', x: 95, y: 215, label: 'Client', sublabel: 'HTTPS', tone: 'slate' },
              { id: 'lb', type: 'hex', x: 265, y: 215, label: 'API Gateway', sublabel: 'Auth · RL', tone: 'green', load: 32 },
              { id: 'app', type: 'hex', x: 455, y: 215, label: 'App Server', sublabel: 'Stateless', tone: 'blue', load: 45 },
              { id: 'redis', type: 'cache', x: 645, y: 125, label: 'Redis Cache', sublabel: '0.6 ms', tone: 'green', badge: '92% hit', badgeTone: 'green' },
              { id: 'db', type: 'db', x: 645, y: 295, label: 'Postgres DB', sublabel: '8 ms miss', tone: 'purple', callout: 'users' },
            ],
            edges: [
              { from: 'user', to: 'lb', label: 'TLS', packetColor: 'coral', bidirectional: true, speed: 2.0 },
              { from: 'lb', to: 'app', label: 'HTTP/2', packetColor: 'blue', bidirectional: true, speed: 1.8 },
              { from: 'app', to: 'redis', label: 'hit', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'app', to: 'db', label: 'miss only', packetColor: 'amber', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'client request', tone: 'coral' },
              { label: 'cache hit', tone: 'green' },
              { label: 'DB fallback', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Recap',
          stage: 'RECAP',
          title: 'End-to-end request lifecycle mental model',
          body: [
            '1. **DNS** resolves hostname → IP (Anycast puts users on the nearest PoP).',
            '2. **TCP + TLS 1.3** or **HTTP/3 QUIC** establishes an encrypted multiplexed tunnel with minimal RTTs.',
            '3. **API Gateway** enforces AuthN/AuthZ and Rate Limits; **App Servers** read from **Cache** first and **Database** only on miss.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Every millisecond saved on the critical path multiplies across millions of users. Cut RTTs first (CDN, HTTP/3, Keep-Alive), then cut compute and DB round trips.',
          },
          scene: {
            hud: [
              { label: 'DNS', value: 'Anycast Geo', status: 'good' },
              { label: 'TRANSPORT', value: 'QUIC / TLS 1.3', status: 'good' },
              { label: 'EDGE', value: 'Gateway + CDN', status: 'good' },
              { label: 'DATA PATH', value: 'Cache → DB', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 100, y: 215, label: 'User', sublabel: 'Browser/App', tone: 'slate' },
              { id: 'dns', type: 'hex', x: 255, y: 120, label: 'Anycast DNS', sublabel: 'Nearest IP', tone: 'amber' },
              { id: 'gw', type: 'hex', x: 350, y: 255, label: 'Edge & LB', sublabel: 'HTTP/3 + TLS', tone: 'green' },
              { id: 'svc', type: 'hex', x: 525, y: 215, label: 'Microservice', sublabel: 'Business Logic', tone: 'blue' },
              { id: 'store', type: 'db', x: 675, y: 215, label: 'Cache + DB', sublabel: 'Fast + Durable', tone: 'purple' },
            ],
            edges: [
              { from: 'u', to: 'dns', label: 'resolve', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'u', to: 'gw', label: 'QUIC', packetColor: 'green', bidirectional: true, speed: 1.9 },
              { from: 'gw', to: 'svc', label: 'gRPC', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'svc', to: 'store', label: 'query', packetColor: 'purple', bidirectional: true, speed: 1.8 },
            ],
            legend: [
              { label: 'DNS lookup', tone: 'amber' },
              { label: 'encrypted edge', tone: 'green' },
              { label: 'data access', tone: 'purple' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          {
            option: 'HTTP/1.1',
            bestWhen: 'Legacy clients, simple internal health checks',
            pros: 'Universal compatibility, human-readable headers',
            cons: 'Head-of-line blocking, 6-connection cap per origin, verbose headers',
          },
          {
            option: 'HTTP/2',
            bestWhen: 'Web browsers, internal service-to-service gRPC',
            pros: 'Binary framing, multiplexed streams, HPACK compression',
            cons: 'Single lost TCP packet stalls all multiplexed streams',
          },
          {
            option: 'HTTP/3 (QUIC)',
            bestWhen: 'Mobile apps, global edge CDNs, lossy wireless links',
            pros: '0/1-RTT handshake, independent UDP streams, seamless IP migration',
            cons: 'Higher CPU cost than kernel-offloaded TCP; some corporate firewalls block UDP :443',
          },
        ],
        failureModes: [
          {
            title: 'DNS Propagation Lag During Regional Outage',
            mitigation: 'Keep DNS TTL low (30–60s) for critical APIs and pair with Anycast BGP routing so failover occurs in seconds rather than waiting on stale ISP resolvers.',
            interviewProbe: 'What happens if an enterprise DNS resolver ignores your 30-second TTL?',
          },
          {
            title: 'Connection Pool / Ephemeral Port Exhaustion (TIME_WAIT)',
            mitigation: 'Enable HTTP Keep-Alive, persistent gRPC HTTP/2 channels, and bounded upstream connection pools with idle timeouts.',
            interviewProbe: 'Why did our API Gateway suddenly throw EADDRNOTAVAIL under 50k RPS?',
          },
        ],
      },
    },

    {
      id: 'latency-throughput',
      title: 'Latency & Throughput',
      subtitle: 'Why averages lie, how p99 tail latency explodes across microservices, and Little’s Law.',
      duration: '8 min',
      level: 'Beginner',
      companies: ['Google', 'Microsoft', 'Amazon'],
      tags: ['p99', 'tail latency', 'throughput', 'qps', 'hedged requests', 'littles law'],
      objectives: [
        'Distinguish latency (ms) from throughput (RPS/QPS)',
        'Understand why p99 matters far more than mean latency',
        'Calculate tail-latency amplification in fan-out microservices',
        'Apply hedged requests, timeouts, and async offloading to protect p99',
      ],
      steps: [
        {
          shortLabel: 'Latency vs RPS',
          stage: 'SETUP',
          title: 'Speed of one request vs volume per second',
          body: [
            '**Latency** is the duration a single request takes from client send to client receive (e.g., `45 ms`). **Throughput** is how many requests the system finishes per second (e.g., `25,000 RPS`).',
            'They are related by **Little’s Law** (`Concurrency = Throughput × Latency`), but not identical: a batch pipeline has high throughput and terrible latency; an unqueued server at 95% CPU sees latency shoot toward infinity.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Queueing Theory warning: Above ~70–80% CPU utilization, request queues grow nonlinearly and p99 latency spikes 10x before throughput even hits 100%.',
          },
          scene: {
            hud: [
              { label: 'MEDIAN (p50)', value: '18 ms', status: 'good' },
              { label: 'THROUGHPUT', value: '12,000 RPS', status: 'good' },
              { label: 'CPU LOAD', value: '62%', status: 'info' },
              { label: 'QUEUE DEPTH', value: '3 reqs', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 130, y: 215, label: 'Clients', sublabel: '12k req/s', tone: 'slate' },
              { id: 'q', type: 'queue', x: 350, y: 215, label: 'Accept Queue', sublabel: 'Depth: 3', tone: 'amber' },
              { id: 'w', type: 'hex', x: 590, y: 215, label: 'Worker Pool', sublabel: '18 ms avg', tone: 'blue', load: 62 },
            ],
            edges: [
              { from: 'c', to: 'q', label: 'λ = 12k/s', packetColor: 'coral', speed: 1.8 },
              { from: 'q', to: 'w', label: 'L = λ × W', packetColor: 'green', bidirectional: true, speed: 1.8 },
            ],
            legend: [
              { label: 'arrival rate λ', tone: 'coral' },
              { label: 'completed work', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Tail explosion',
          stage: 'PROBLEM',
          title: 'Fan-out multiplies p99 tail latency',
          body: [
            'Suppose each backend leaf service has a **99% probability** of replying in < 20 ms, and a 1% chance of a GC pause taking **500 ms**.',
            'If your homepage aggregator fans out to **100 leaf services** in parallel and waits for all of them, the chance that at least one leaf is slow is `1 - 0.99^100 = 63.4%`! Now **more than half** your users suffer the 500 ms tail!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Google’s famous "The Tail at Scale" paper (Jeff Dean & Luiz Barroso) proved that tail latency becomes the common-case latency in large fan-out architectures.',
          },
          scene: {
            hud: [
              { label: 'SINGLE LEAF p99', value: '1% slow', status: 'good' },
              { label: 'FAN-OUT WIDTH', value: '100 leaves', status: 'warn' },
              { label: 'USER SLOW PROB', value: '63.4%!', status: 'bad' },
              { label: 'PAGE LATENCY', value: '512 ms', status: 'bad' },
            ],
            nodes: [
              { id: 'agg', type: 'hex', x: 185, y: 215, label: 'Aggregator', sublabel: 'Waits for ALL', tone: 'blue', load: 74 },
              { id: 'l1', type: 'hex', x: 520, y: 95, label: 'Leaf 1..33', sublabel: '15 ms', tone: 'green', load: 42 },
              { id: 'l2', type: 'hex', x: 520, y: 215, label: 'Leaf 34..66', sublabel: '18 ms', tone: 'green', load: 45 },
              { id: 'l3', type: 'hex', x: 520, y: 335, label: 'Leaf 97 (GC!)', sublabel: '500 ms stall', tone: 'coral', badge: 'GC pause', badgeTone: 'rose', load: 96 },
            ],
            edges: [
              { from: 'agg', to: 'l1', label: '15 ms', packetColor: 'green', speed: 1.5 },
              { from: 'agg', to: 'l2', label: '18 ms', packetColor: 'green', speed: 1.6 },
              { from: 'agg', to: 'l3', label: '500 ms tail!', packetColor: 'coral', dashed: true, speed: 4.5 },
            ],
            legend: [
              { label: 'fast leaf', tone: 'green' },
              { label: 'straggler blocking response', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Hedged RPCs',
          stage: 'SOLUTION',
          title: 'Taming p99 with Hedged Requests & Partial Degradation',
          body: [
            'How does Google Search keep p99 blazing fast across 1,000 shards? Two key techniques: **Hedged Requests** (if a read takes longer than p95, issue a duplicate read to a replica and use whichever finishes first, adding only ~5% extra load) and **Graceful Partial Degradation**.',
            'For non-critical widgets (like "Recommended for you"), apply strict **deadline propagation** (e.g., 40 ms budget) and omit or serve stale cache if the widget misses its deadline.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Only hedge idempotent READ operations! Hedging a non-idempotent POST payment could charge a customer twice.',
          },
          changes: [
            '+Hedged backup read fired after p95 delay (20 ms)',
            '+Strict deadline budget propagated across RPC tree',
            '~p99 drops from 512 ms → 34 ms with only +5% traffic',
          ],
          scene: {
            hud: [
              { label: 'HEDGE DELAY', value: '20 ms (p95)', status: 'info' },
              { label: 'EXTRA LOAD', value: '+5% reads', status: 'good' },
              { label: 'NEW p99', value: '34 ms', status: 'good' },
              { label: 'STRAGGLER', value: 'Bypassed', status: 'good' },
            ],
            nodes: [
              { id: 'agg', type: 'hex', x: 170, y: 215, label: 'Aggregator', sublabel: 'Hedge @ 20ms', tone: 'blue', load: 48 },
              { id: 'p1', type: 'hex', x: 520, y: 135, label: 'Replica A', sublabel: 'Stalled (GC)', tone: 'coral', badge: 'cancelled', badgeTone: 'rose', dim: true, load: 95 },
              { id: 'p2', type: 'hex', x: 520, y: 295, label: 'Replica B', sublabel: 'Wins in 12 ms!', tone: 'green', badge: 'hedged winner', badgeTone: 'green', load: 38 },
            ],
            edges: [
              { from: 'agg', to: 'p1', label: 't=0ms primary', packetColor: 'coral', dashed: true, speed: 4.0, dim: true },
              { from: 'agg', to: 'p2', label: 't=20ms hedge → 32ms done', packetColor: 'green', bidirectional: true, speed: 1.5 },
            ],
            legend: [
              { label: 'slow primary cancelled', tone: 'coral' },
              { label: 'fast hedged replica', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Recap',
          stage: 'RECAP',
          title: 'Key latency & throughput rules to quote in interviews',
          body: [
            '1. Never cite average latency alone — always set **SLOs on p95 and p99** (and p99.9 for payments/search).',
            '2. Keep steady-state utilization below **65–70%** so sudden bursts do not trigger queueing collapse.',
            '3. Use **hedged reads**, **request coalescing**, **deadline propagation**, and **asynchronous queues** to protect tail latency.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Memorize Jeff Dean’s latency ladder: L1 cache 0.5 ns · RAM 100 ns · NVMe SSD 100 µs · Same-DC RPC 0.5 ms · Cross-continent RTT 150 ms.',
          },
          scene: {
            hud: [
              { label: 'RAM READ', value: '100 ns', status: 'good' },
              { label: 'NVME SSD', value: '100 µs', status: 'info' },
              { label: 'SAME-DC RPC', value: '0.5 ms', status: 'info' },
              { label: 'US ↔ EU RTT', value: '80 – 150 ms', status: 'warn' },
            ],
            nodes: [
              { id: 'ram', type: 'cache', x: 140, y: 215, label: 'RAM', sublabel: '100 ns', tone: 'green' },
              { id: 'ssd', type: 'db', x: 320, y: 215, label: 'NVMe SSD', sublabel: '100 µs (1000x)', tone: 'blue' },
              { id: 'dc', type: 'hex', x: 500, y: 215, label: 'Same-DC RPC', sublabel: '0.5 ms (5000x)', tone: 'purple' },
              { id: 'wan', type: 'users', x: 665, y: 215, label: 'Global WAN', sublabel: '150 ms (1.5Mx)', tone: 'amber' },
            ],
            edges: [
              { from: 'ram', to: 'ssd', label: '1,000×', packetColor: 'blue', speed: 2.0 },
              { from: 'ssd', to: 'dc', label: '5×', packetColor: 'purple', speed: 2.2 },
              { from: 'dc', to: 'wan', label: '300×', packetColor: 'amber', speed: 2.6 },
            ],
            legend: [
              { label: 'memory speed', tone: 'green' },
              { label: 'network speed', tone: 'amber' },
            ],
          },
        },
      ],
      deepDive: {
        capacityMath: [
          { label: "Little's Law", value: 'L = λ × W', formula: 'Concurrent Requests = Throughput (req/s) × Avg Latency (sec)' },
          { label: 'Fan-out Tail Formula', value: 'P(slow) = 1 − (0.99)^N', formula: 'For N = 100 downstream calls, P(slow) = 63.4%' },
          { label: 'Utilization Target', value: '≤ 65–70% CPU', formula: 'Leaves headroom for 2x traffic spikes + zone failover' },
          { label: '4 Nines Availability', value: '99.99% = 52.6 min/yr', formula: '99.9% = 8.76 hr/yr · 99.999% = 5.26 min/yr' },
        ],
        failureModes: [
          {
            title: 'Retry Storm Turning a Blip Into a Total Outage',
            mitigation: 'Cap retries at 2–3, use Exponential Backoff + Full Jitter, and enforce a per-client retry budget (max 10% of total traffic).',
            interviewProbe: 'Why can naive immediate retries make a 5-second DB hiccup last 45 minutes?',
          },
        ],
      },
    },

    {
      id: 'napkin-math',
      title: 'Napkin Math',
      subtitle: 'Convert DAU into QPS, peak traffic, 5-year storage, bandwidth, and cache RAM in 90 seconds.',
      duration: '8 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Google', 'Meta', 'Amazon'],
      tags: ['back of the envelope', 'estimation', 'qps', 'storage', 'bandwidth', 'powers of 2'],
      objectives: [
        'Use the 10^5 seconds/day shortcut to convert DAU into QPS instantly',
        'Size peak traffic (3x–5x), storage over 5 years, and network bandwidth',
        'Apply the 80/20 rule to estimate Redis cache RAM',
        'Translate numbers into concrete hardware decisions (shards, replicas, CDN)',
      ],
      steps: [
        {
          shortLabel: 'QPS shortcut',
          stage: 'SETUP',
          title: 'The 100,000 seconds/day magic shortcut',
          body: [
            'A day has `86,400` seconds — round it to **`10^5` (100,000) seconds** in interviews! That lets you do mental math instantaneously without fumbling.',
            'Example: **100M DAU** making **10 reads/day** = `10^9` reads/day ÷ `10^5` sec/day = **`10,000 avg QPS`**. Multiply by **3×** for peak hours = **`30,000 peak QPS`**.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Interviewers do not care about 4 decimal places — they care about order-of-magnitude correctness (10 GB vs 10 TB decides single Postgres vs sharded cluster!).',
          },
          scene: {
            hud: [
              { label: 'DAU', value: '100 Million', status: 'info' },
              { label: 'AVG READ QPS', value: '10,000 /s', status: 'info' },
              { label: 'PEAK (3×)', value: '30,000 /s', status: 'warn' },
              { label: 'WRITE (10:1)', value: '1,000 /s', status: 'good' },
            ],
            nodes: [
              { id: 'dau', type: 'users', x: 145, y: 215, label: '100M DAU', sublabel: '10 reads · 1 write', tone: 'slate' },
              { id: 'calc', type: 'hex', x: 400, y: 215, label: '÷ 10^5 sec', sublabel: 'Daily → QPS', tone: 'green', badge: '86,400 ≈ 100k', badgeTone: 'green' },
            ],
            edges: [
              { from: 'dau', to: 'calc', label: '1B req/day', packetColor: 'blue', speed: 1.9 },
            ],
            overlayCard: {
              x: 470,
              y: 120,
              title: 'INSTANT QPS CHEAT SHEET',
              rows: [
                { label: '1M req/day', value: '≈ 12 QPS', pct: 15, tone: 'blue' },
                { label: '100M req/day', value: '≈ 1.2k QPS', pct: 45, tone: 'green' },
                { label: '1B req/day', value: '≈ 12k QPS', pct: 80, tone: 'amber' },
                { label: '10B req/day', value: '≈ 120k QPS', pct: 100, tone: 'coral' },
              ],
              footer: 'Always multiply avg QPS by 3x for Peak!',
            },
            legend: [{ label: 'daily request volume', tone: 'blue' }],
          },
        },
        {
          shortLabel: 'Storage & RAM',
          stage: 'TECHNIQUE',
          title: '5-year storage, replication & 80/20 cache RAM',
          body: [
            'Suppose each write stores **1 KB** of JSON metadata. `100M writes/day × 1 KB = 100 GB/day`. Over **5 years** (`~1,825 days ≈ 2,000 days`), raw storage is **200 TB** (times 3× replication = **600 TB** → must shard across DB nodes!).',
            'For **Cache RAM**, apply the **80/20 rule**: cache the hottest **20%** of daily read data. `20% × 1B reads × 1 KB` deduplicated across active items typically fits in a **100–256 GB Redis cluster**.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Numbers drive architecture! 50 GB total fits on one NVMe Postgres box; 200 TB requires sharding; 10 Gbps media egress demands a CDN.',
          },
          scene: {
            hud: [
              { label: 'DAILY NEW DATA', value: '100 GB/day', status: 'info' },
              { label: '5-YR RAW', value: '182 TB', status: 'warn' },
              { label: '3× REPLICATED', value: '546 TB', status: 'bad' },
              { label: 'HOT CACHE (20%)', value: '~128 GB RAM', status: 'good' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 145, y: 215, label: 'Write Path', sublabel: '1k writes/s × 1KB', tone: 'blue' },
              { id: 'cache', type: 'cache', x: 400, y: 120, label: 'Redis Cluster', sublabel: '128 GB Hot 20%', tone: 'green', badge: 'fits in RAM', badgeTone: 'green' },
              { id: 'db', type: 'db', x: 400, y: 300, label: 'Sharded DB', sublabel: '546 TB (3x repl)', tone: 'purple', badge: 'needs sharding', badgeTone: 'amber' },
              { id: 'cdn', type: 'hex', x: 635, y: 215, label: 'Object + CDN', sublabel: 'Images / Video', tone: 'amber', callout: 'S3 / Blob' },
            ],
            edges: [
              { from: 'app', to: 'cache', label: 'hot read keys', packetColor: 'green', speed: 1.7 },
              { from: 'app', to: 'db', label: '100 GB/day', packetColor: 'purple', speed: 2.1 },
              { from: 'db', to: 'cdn', label: 'media blobs', packetColor: 'amber', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'hot cache', tone: 'green' },
              { label: 'durable writes', tone: 'purple' },
              { label: 'media offload', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Recap',
          stage: 'RECAP',
          title: 'The 4-line Napkin Math template for interviews',
          body: [
            '1. **QPS**: `DAU × actions / 10^5` (and Peak = `3× avg`).',
            '2. **Storage**: `writes/day × payload_bytes × 365 × 5 × replication_factor`.',
            '3. **Bandwidth**: `peak_QPS × avg_response_bytes × 8` (bits/sec).',
            '4. **Decision trigger**: Use these numbers immediately to justify your Cache, CDN, Read Replicas, or Sharding — then try the live calculator in **Design Lab**!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: '1 Million bytes = 1 MB · 1 Billion bytes = 1 GB · 1 Trillion bytes = 1 TB · 1 Quadrillion bytes = 1 PB.',
          },
          scene: {
            hud: [
              { label: '10^6 BYTES', value: '1 MB', status: 'info' },
              { label: '10^9 BYTES', value: '1 GB', status: 'info' },
              { label: '10^12 BYTES', value: '1 TB', status: 'warn' },
              { label: '10^15 BYTES', value: '1 PB', status: 'bad' },
            ],
            nodes: [
              { id: 'q', type: 'hex', x: 135, y: 215, label: '1. QPS', sublabel: 'Peak = 3× Avg', tone: 'blue' },
              { id: 's', type: 'db', x: 315, y: 215, label: '2. Storage', sublabel: '5-Yr × 3× Repl', tone: 'purple' },
              { id: 'b', type: 'hex', x: 495, y: 215, label: '3. Bandwidth', sublabel: 'Mbps / Gbps', tone: 'amber' },
              { id: 'c', type: 'cache', x: 660, y: 215, label: '4. Cache', sublabel: '80/20 Hot Set', tone: 'green' },
            ],
            edges: [
              { from: 'q', to: 's', label: 'drives shards', packetColor: 'purple', speed: 2.0 },
              { from: 's', to: 'b', label: 'drives CDN', packetColor: 'amber', speed: 2.0 },
              { from: 'b', to: 'c', label: 'drives RAM', packetColor: 'green', speed: 2.0 },
            ],
            legend: [{ label: 'sizing pipeline', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        capacityMath: [
          { label: 'Seconds per Day', value: '86,400 ≈ 10^5', formula: 'Seconds/month ≈ 2.5M · Seconds/year ≈ 3×10^7' },
          { label: 'Typical Single Postgres Box', value: '~5k–15k QPS', formula: 'Simple indexed reads; writes ~2k–5k TPS on NVMe' },
          { label: 'Typical Single Redis Node', value: '~80k–120k ops/s', formula: 'Single-threaded command loop, sub-millisecond p99' },
          { label: 'Typical Kafka Broker', value: '~100k–500k msg/s', formula: 'Sequential disk I/O + OS page cache + zero-copy sendfile()' },
        ],
      },
    },
  ],
};

export const MODULE_02_SCALING = {
  id: 'mod-02-scaling',
  number: '02',
  title: 'Scaling',
  track: 'hld',
  lessons: [
    {
      id: 'vertical-horizontal',
      title: 'Vertical vs Horizontal',
      subtitle: 'When buying a bigger box beats distributed complexity — and when you must scale out.',
      duration: '7 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Stack Overflow'],
      tags: ['scale up', 'scale out', 'vertical', 'horizontal', 'spof', 'autoscaling'],
      objectives: [
        'Compare vertical scaling (scale-up) vs horizontal scaling (scale-out)',
        'Identify the hardware ceiling and single-point-of-failure trap',
        'Know when vertical scaling is actually the smarter Staff-level choice',
      ],
      steps: [
        {
          shortLabel: 'Scale up',
          stage: 'PROBLEM',
          title: 'Vertical scaling hits a wall — and has zero failover',
          body: [
            '**Vertical scaling** (scale-up) means upgrading a single server to more CPU cores, RAM, and NVMe SSDs. It requires **zero code changes**, zero network hops between nodes, and keeps transactions trivially ACID.',
            'But hardware has a hard ceiling (cost grows super-linearly past 64–128 cores), and if that single machine loses power or needs a kernel reboot, your **entire product goes offline**.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Vertical scaling alone gives you high capacity up to a ceiling, but 0% redundancy — a single machine is a Single Point of Failure (SPOF).',
          },
          scene: {
            hud: [
              { label: 'NODES', value: '1 Server', status: 'warn' },
              { label: 'CPU LOAD', value: '94% (Ceiling)', status: 'bad' },
              { label: 'FAILOVER', value: 'None (SPOF)', status: 'bad' },
              { label: 'CODE CHANGES', value: 'Zero', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 165, y: 215, label: 'All Users', sublabel: '15,000 req/s', tone: 'slate' },
              { id: 'big', type: 'hex', x: 525, y: 215, label: 'Giant Server', sublabel: '128 vCPU · 512GB', tone: 'coral', badge: 'SPOF · maxed', badgeTone: 'rose', load: 94 },
            ],
            edges: [
              { from: 'u', to: 'big', label: '100% traffic', packetColor: 'coral', bidirectional: true, speed: 1.5, packetCount: 3 },
            ],
            legend: [{ label: 'saturated traffic', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Scale out',
          stage: 'SOLUTION',
          title: 'Horizontal scaling adds commodity machines behind an LB',
          body: [
            '**Horizontal scaling** (scale-out) spreads traffic across a fleet of identical commodity servers behind a **Load Balancer**. Traffic doubles? Add more nodes dynamically via an **Auto-Scaling Group**.',
            'Now a single server crash only affects 1/N of capacity, and the load balancer drains it automatically in seconds.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'In real Big Tech systems, you combine BOTH: scale vertically to a cost-efficient sweet spot (e.g., 16–32 vCPU nodes) and scale horizontally across availability zones for resilience and elastic growth.',
          },
          changes: [
            '+Load Balancer spreads requests across 4 commodity servers',
            '+Survives single-node crash with zero downtime',
            '~Per-node CPU drops from 94% → 32%',
          ],
          scene: {
            hud: [
              { label: 'NODES', value: '4 Servers', status: 'good' },
              { label: 'AVG CPU', value: '32%', status: 'good' },
              { label: 'FAILOVER', value: 'Auto-drained', status: 'good' },
              { label: 'ELASTICITY', value: 'Auto-scaling', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 110, y: 215, label: 'All Users', sublabel: '15,000 req/s', tone: 'slate' },
              { id: 'lb', type: 'hex', x: 315, y: 215, label: 'Load Balancer', sublabel: 'Health Checks', tone: 'green', load: 24 },
              { id: 's1', type: 'hex', x: 580, y: 95, label: 'App 1', sublabel: 'AZ-a', tone: 'blue', load: 32 },
              { id: 's2', type: 'hex', x: 580, y: 215, label: 'App 2', sublabel: 'AZ-b', tone: 'blue', load: 31 },
              { id: 's3', type: 'hex', x: 580, y: 335, label: 'App 3', sublabel: 'AZ-c', tone: 'blue', load: 33 },
            ],
            edges: [
              { from: 'u', to: 'lb', label: '15k req/s', packetColor: 'blue', speed: 1.6 },
              { from: 'lb', to: 's1', label: '5k/s', packetColor: 'green', speed: 1.9 },
              { from: 'lb', to: 's2', label: '5k/s', packetColor: 'green', speed: 1.9 },
              { from: 'lb', to: 's3', label: '5k/s', packetColor: 'green', speed: 1.9 },
            ],
            legend: [
              { label: 'incoming traffic', tone: 'blue' },
              { label: 'balanced traffic', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Recap',
          stage: 'RECAP',
          title: 'Know when NOT to over-distribute',
          body: [
            '1. **Stack Overflow** served 1.3B monthly page views on just 9 beefy web servers and 2 SQL Server clusters — don’t introduce distributed complexity before you need it.',
            '2. Always scale **stateless web/API tiers horizontally** across multiple AZs for availability, and only shard stateful databases once vertical scaling + read replicas + caching are exhausted.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Senior candidates explicitly state: "First we scale the DB vertically and add caching + read replicas; we only shard when write QPS or storage exceeds a single primary."',
          },
          scene: {
            hud: [
              { label: 'STATELESS TIER', value: 'Horizontal + AZs', status: 'good' },
              { label: 'DB FIRST STEP', value: 'Vertical + Cache', status: 'good' },
              { label: 'DB NEXT STEP', value: 'Read Replicas', status: 'info' },
              { label: 'DB LAST STEP', value: 'Sharding', status: 'warn' },
            ],
            nodes: [
              { id: 'v', type: 'hex', x: 170, y: 215, label: '1. Vertical', sublabel: 'Simple + Cache', tone: 'green' },
              { id: 'r', type: 'db', x: 390, y: 215, label: '2. Replicas', sublabel: 'Scale Reads', tone: 'blue' },
              { id: 'sh', type: 'db', x: 605, y: 215, label: '3. Sharding', sublabel: 'Scale Writes/TB', tone: 'purple' },
            ],
            edges: [
              { from: 'v', to: 'r', label: 'read bottleneck', packetColor: 'blue', speed: 2.0 },
              { from: 'r', to: 'sh', label: 'write / TB limit', packetColor: 'purple', speed: 2.2 },
            ],
            legend: [{ label: 'scaling ladder', tone: 'blue' }],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          {
            option: 'Vertical Scaling',
            bestWhen: 'Early stage, heavy ACID SQL joins, low operational headcount',
            pros: 'No distributed transactions, lowest latency (local RAM/IPC), minimal ops',
            cons: 'Hardware ceiling, downtime during upgrades, single point of failure',
          },
          {
            option: 'Horizontal Scaling',
            bestWhen: 'High availability SLAs, spiky workloads, global scale',
            pros: 'Near-infinite scale, zero-downtime rolling upgrades, fault tolerance',
            cons: 'Requires load balancer, stateless design, distributed state & debugging overhead',
          },
        ],
      },
    },

    {
      id: 'load-balancing',
      title: 'Load Balancing',
      subtitle: 'L4 vs L7 routing, balancing algorithms, active health checks, and avoiding LB SPOF.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Google', 'Cloudflare'],
      tags: ['l4', 'l7', 'nginx', 'envoy', 'haproxy', 'round robin', 'least connections', 'anycast'],
      objectives: [
        'Compare Layer 4 (TCP/UDP) vs Layer 7 (HTTP/gRPC) load balancers',
        'Pick the right balancing algorithm (Round Robin, Least Connections, Consistent Hash)',
        'Design high-availability load balancers with Anycast BGP / active-passive VIP',
      ],
      steps: [
        {
          shortLabel: 'L4 vs L7',
          stage: 'SETUP',
          title: 'Transport-level speed (L4) vs content-aware routing (L7)',
          body: [
            'A **Layer 4 Load Balancer** (AWS NLB, Azure LB, Maglev) inspects only IP + TCP/UDP port and forwards packets at millions of connections/sec with ultra-low overhead — it never decrypts HTTPS.',
            'A **Layer 7 Load Balancer** (Envoy, NGINX, AWS ALB) terminates TLS and reads HTTP URLs, headers, cookies, and gRPC paths — routing `/api/payments` to the Payment cluster and `/static/*` to Media.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'At Big Tech scale (Google Maglev, Meta Katran), requests hit an L4 Anycast load balancer fleet first, which spreads connections across a horizontally scaled L7 Envoy/NGINX tier.',
          },
          scene: {
            hud: [
              { label: 'L4 THROUGHPUT', value: 'Millions RPS', status: 'good' },
              { label: 'L7 ROUTING', value: 'Path / Header', status: 'good' },
              { label: 'TLS TERM', value: 'At L7 Edge', status: 'info' },
              { label: 'ARCHITECTURE', value: 'L4 → L7 Tiered', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 100, y: 215, label: 'Clients', sublabel: 'HTTPS', tone: 'slate' },
              { id: 'l4', type: 'hex', x: 275, y: 215, label: 'L4 LB', sublabel: 'TCP / ECMP', tone: 'amber', badge: 'ultra-fast', badgeTone: 'amber', load: 22 },
              { id: 'l7', type: 'hex', x: 465, y: 215, label: 'L7 Proxy', sublabel: 'Envoy / TLS', tone: 'green', badge: 'path routing', badgeTone: 'green', load: 40 },
              { id: 'pay', type: 'hex', x: 660, y: 125, label: 'Payments', sublabel: '/api/pay', tone: 'purple', load: 36 },
              { id: 'feed', type: 'hex', x: 660, y: 300, label: 'Feed Svc', sublabel: '/api/feed', tone: 'blue', load: 44 },
            ],
            edges: [
              { from: 'u', to: 'l4', label: 'TCP:443', packetColor: 'amber', speed: 1.6 },
              { from: 'l4', to: 'l7', label: 'L4 forward', packetColor: 'green', speed: 1.6 },
              { from: 'l7', to: 'pay', label: '/api/pay', packetColor: 'purple', speed: 1.8 },
              { from: 'l7', to: 'feed', label: '/api/feed', packetColor: 'blue', speed: 1.8 },
            ],
            legend: [
              { label: 'L4 TCP packets', tone: 'amber' },
              { label: 'L7 path routes', tone: 'blue' },
            ],
          },
        },
        {
          shortLabel: 'Algorithms',
          stage: 'TECHNIQUE',
          title: 'Why Least Connections beats Round Robin under skew',
          body: [
            '**Round Robin** sends requests 1-2-3-1-2-3 blindly. If one endpoint takes 5 ms and another takes 800 ms (or runs on slower hardware), Round Robin overloads busy servers!',
            '**Least Connections** (or **Power of Two Choices — P2C**, used by Envoy and NGINX) picks two random healthy backends and forwards to whichever has fewer active in-flight requests — achieving near-optimal load balance in O(1) time.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning "Power of Two Choices (P2C) Least-Requests" in a Microsoft/Google/Meta interview immediately signals real production L7 proxy experience!',
          },
          scene: {
            hud: [
              { label: 'ALGORITHM', value: 'P2C Least Conn', status: 'good' },
              { label: 'HEAVY SERVER', value: 'Avoided', status: 'good' },
              { label: 'COMPLEXITY', value: 'O(1)', status: 'good' },
              { label: 'TAIL LATENCY', value: '-42% p99', status: 'good' },
            ],
            nodes: [
              { id: 'lb', type: 'hex', x: 185, y: 215, label: 'Envoy L7', sublabel: 'P2C Least Conn', tone: 'green', load: 28 },
              { id: 's1', type: 'hex', x: 540, y: 100, label: 'Node A', sublabel: '140 active', tone: 'coral', badge: 'busy · skipped', badgeTone: 'rose', load: 91 },
              { id: 's2', type: 'hex', x: 540, y: 215, label: 'Node B', sublabel: '22 active', tone: 'blue', badge: 'selected', badgeTone: 'green', load: 34 },
              { id: 's3', type: 'hex', x: 540, y: 330, label: 'Node C', sublabel: '19 active', tone: 'blue', badge: 'selected', badgeTone: 'green', load: 30 },
            ],
            edges: [
              { from: 'lb', to: 's1', label: 'throttled', packetColor: 'coral', dashed: true, dim: true, speed: 3.5 },
              { from: 'lb', to: 's2', label: 'route here', packetColor: 'green', speed: 1.6 },
              { from: 'lb', to: 's3', label: 'route here', packetColor: 'green', speed: 1.6 },
            ],
            legend: [
              { label: 'fast healthy node', tone: 'green' },
              { label: 'congested node skipped', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Health & HA',
          stage: 'SOLUTION',
          title: 'Health checks & eliminating LB as a Single Point of Failure',
          body: [
            'Load balancers run both **active health checks** (periodic `GET /healthz`) and **passive outlier detection** (ejecting a backend that returns 5 consecutive 5xx errors).',
            'What if the Load Balancer itself dies? Production setups deploy **redundant LB pairs** (Active-Active via DNS/ECMP BGP or Active-Passive via floating Virtual IP / VRRP) across multiple Availability Zones.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Keep `/healthz` shallow (process alive) and `/readyz` mindful of dependencies — never fail `/healthz` just because a downstream analytics DB blinked, or the LB will kill your entire healthy fleet!',
          },
          changes: [
            '+Active-Active redundant LB fleet via BGP ECMP',
            '+Unhealthy Node C automatically ejected on 3 failed probes',
            '~Zero user-visible errors during backend crash',
          ],
          scene: {
            hud: [
              { label: 'LB REDUNDANCY', value: 'Active-Active', status: 'good' },
              { label: 'NODE C STATUS', value: 'Ejected', status: 'warn' },
              { label: 'FAILOVER TIME', value: '< 2 sec', status: 'good' },
              { label: 'UPTIME', value: '99.99%', status: 'good' },
            ],
            nodes: [
              { id: 'dns', type: 'users', x: 110, y: 215, label: 'Anycast BGP', sublabel: 'ECMP Split', tone: 'slate' },
              { id: 'lb1', type: 'hex', x: 320, y: 145, label: 'LB Primary', sublabel: 'AZ-a', tone: 'green', load: 34 },
              { id: 'lb2', type: 'hex', x: 320, y: 285, label: 'LB Secondary', sublabel: 'AZ-b', tone: 'green', load: 35 },
              { id: 'ok', type: 'hex', x: 600, y: 150, label: 'Healthy Pool', sublabel: '200 OK', tone: 'blue', badge: 'serving', badgeTone: 'green', load: 48 },
              { id: 'bad', type: 'hex', x: 600, y: 300, label: 'Crashed Node', sublabel: '503 / Timeout', tone: 'coral', badge: 'ejected', badgeTone: 'rose', dim: true, load: 0 },
            ],
            edges: [
              { from: 'dns', to: 'lb1', label: '50%', packetColor: 'green', speed: 1.8 },
              { from: 'dns', to: 'lb2', label: '50%', packetColor: 'green', speed: 1.8 },
              { from: 'lb1', to: 'ok', label: 'active', packetColor: 'blue', speed: 1.7 },
              { from: 'lb2', to: 'ok', label: 'active', packetColor: 'blue', speed: 1.7 },
              { from: 'lb2', to: 'bad', label: 'health probe fail', packetColor: 'coral', dashed: true, dim: true, speed: 3.0 },
            ],
            legend: [
              { label: 'ECMP balanced', tone: 'green' },
              { label: 'ejected probe', tone: 'coral' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'Round Robin / Weighted RR', bestWhen: 'Uniform fast endpoints, identical VM sizes', pros: 'Dead simple, zero state', cons: 'Ignores slow requests & uneven CPU load' },
          { option: 'Least Connections / P2C', bestWhen: 'Mixed fast/slow APIs, WebSockets, variable DB queries', pros: 'Naturally avoids overloaded nodes', cons: 'Slightly more state tracking on LB' },
          { option: 'Consistent Hash (IP/Key)', bestWhen: 'Local in-memory caches, stateful chat rooms, CDN edges', pros: 'Maximizes cache hit rate on backend', cons: 'Hot keys can skew load onto one server' },
        ],
      },
    },

    {
      id: 'stateless',
      title: 'Stateless Services',
      subtitle: 'Why storing sessions in server RAM breaks autoscaling, and how externalizing state unlocks elasticity.',
      duration: '7 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Netflix'],
      tags: ['stateless', 'sticky sessions', 'redis session', 'jwt', 'autoscaling'],
      objectives: [
        'See why in-memory server sessions break load balancing and deploys',
        'Externalize session state to Redis or signed stateless JWTs',
        'Separate stateless compute tiers from stateful data tiers',
      ],
      steps: [
        {
          shortLabel: 'Sticky trap',
          stage: 'PROBLEM',
          title: 'In-memory sessions trap users on one server',
          body: [
            'If Server A stores Alice’s shopping cart or login session in its local RAM, every future request from Alice **must** land on Server A (**sticky sessions**).',
            'When Server A restarts for a deployment or crashes, Alice is logged out and loses her cart. Worse, autoscaling adds Server D, which gets zero existing sticky users while Server A stays overloaded!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Sticky sessions couple user availability to a single server instance — turning horizontal scaling into brittle vertical silos.',
          },
          scene: {
            hud: [
              { label: 'SESSION STORE', value: 'Local RAM', status: 'bad' },
              { label: 'ON SERVER CRASH', value: 'Cart Lost!', status: 'bad' },
              { label: 'AUTOSCALING', value: 'Uneven / Broken', status: 'bad' },
              { label: 'DEPLOY IMPACT', value: 'Forced Logout', status: 'warn' },
            ],
            nodes: [
              { id: 'alice', type: 'users', x: 120, y: 215, label: 'Alice', sublabel: 'Cookie: SrvA', tone: 'slate' },
              { id: 'lb', type: 'hex', x: 325, y: 215, label: 'Load Balancer', sublabel: 'Sticky Cookie', tone: 'amber' },
              { id: 's1', type: 'hex', x: 580, y: 140, label: 'Server A', sublabel: 'Alice RAM (Crash!)', tone: 'coral', badge: 'session lost', badgeTone: 'rose', load: 90 },
              { id: 's2', type: 'hex', x: 580, y: 295, label: 'Server B', sublabel: 'No Alice state', tone: 'slate', dim: true, load: 12 },
            ],
            edges: [
              { from: 'alice', to: 'lb', label: 'checkout', packetColor: 'coral', speed: 1.8 },
              { from: 'lb', to: 's1', label: 'pinned to A', packetColor: 'coral', speed: 1.8 },
              { from: 'lb', to: 's2', label: '401 Unauthorized', packetColor: 'amber', dashed: true, dim: true, speed: 2.8 },
            ],
            legend: [
              { label: 'pinned sticky route', tone: 'coral' },
              { label: 'missing state fallback', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'External state',
          stage: 'SOLUTION',
          title: 'Move state out to a shared Redis store (or signed JWT)',
          body: [
            'By moving session & cart state out of app server RAM into a replicated **Redis Cluster** (or self-contained signed **JWT** for read-only auth claims), every app server becomes **100% stateless and interchangeable**.',
            'Now the Load Balancer can route Alice’s request to ANY server, you can run zero-downtime rolling deploys, and Kubernetes HPA can scale from 5 → 500 pods effortlessly.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Treat stateless compute servers like cattle (disposable, replaceable in seconds), and isolate all durable state inside purpose-built replicated data stores.',
          },
          changes: [
            '+Shared replicated Redis cluster holds session state (0.5 ms)',
            '+App servers hold zero user state in RAM',
            '~Any server can answer any user — instant autoscaling & zero-downtime deploys',
          ],
          scene: {
            hud: [
              { label: 'APP TIER', value: '100% Stateless', status: 'good' },
              { label: 'SESSION STORE', value: 'Redis Cluster', status: 'good' },
              { label: 'ON SERVER CRASH', value: 'Zero Impact', status: 'good' },
              { label: 'AUTOSCALING', value: 'Linear', status: 'good' },
            ],
            nodes: [
              { id: 'alice', type: 'users', x: 100, y: 215, label: 'Alice', sublabel: 'Session ID', tone: 'slate' },
              { id: 'lb', type: 'hex', x: 260, y: 215, label: 'LB', sublabel: 'Any Node', tone: 'green' },
              { id: 's1', type: 'hex', x: 450, y: 135, label: 'App 1', sublabel: 'Stateless', tone: 'blue', load: 38 },
              { id: 's2', type: 'hex', x: 450, y: 295, label: 'App 2', sublabel: 'Stateless', tone: 'blue', load: 36 },
              { id: 'redis', type: 'cache', x: 650, y: 215, label: 'Redis HA', sublabel: 'Sessions + Cart', tone: 'purple', badge: 'replicated', badgeTone: 'green' },
            ],
            edges: [
              { from: 'alice', to: 'lb', label: 'req', packetColor: 'green', speed: 1.7 },
              { from: 'lb', to: 's1', label: 'req 1', packetColor: 'blue', speed: 1.8 },
              { from: 'lb', to: 's2', label: 'req 2', packetColor: 'blue', speed: 1.8 },
              { from: 's1', to: 'redis', label: '0.5 ms', packetColor: 'purple', bidirectional: true, speed: 1.6 },
              { from: 's2', to: 'redis', label: '0.5 ms', packetColor: 'purple', bidirectional: true, speed: 1.6 },
            ],
            legend: [
              { label: 'any-node routing', tone: 'blue' },
              { label: 'shared state lookup', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Exceptions',
          stage: 'TRADEOFF',
          title: 'When stateful services ARE intentional',
          body: [
            'Not every tier can be stateless: **WebSocket gateways** (chat servers holding open TCP sockets), **real-time multiplayer game servers**, and **in-memory stream processors (Flink)** hold live state in RAM on purpose.',
            'For those, keep business logic stateless and isolate connection state into a dedicated **Stateful Gateway Tier** with a Redis mapping (`userId → gatewayHost`).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Calling out the split between stateful WebSocket edge servers and stateless backend microservices is a classic Senior/Staff signal in WhatsApp & Uber designs.',
          },
          scene: {
            hud: [
              { label: 'WS GATEWAY', value: 'Stateful Socket', status: 'warn' },
              { label: 'CORE APIS', value: 'Stateless', status: 'good' },
              { label: 'ROUTING TABLE', value: 'Redis Registry', status: 'info' },
              { label: 'BLAST RADIUS', value: 'Isolated', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 110, y: 215, label: 'Chat Users', sublabel: 'Persistent WS', tone: 'slate' },
              { id: 'ws', type: 'hex', x: 315, y: 215, label: 'WS Gateway', sublabel: 'Holds Sockets', tone: 'amber', badge: 'stateful edge', badgeTone: 'amber' },
              { id: 'svc', type: 'hex', x: 540, y: 140, label: 'Chat Logic', sublabel: 'Stateless Fleet', tone: 'blue', badge: 'elastic', badgeTone: 'green' },
              { id: 'reg', type: 'cache', x: 540, y: 295, label: 'Presence Map', sublabel: 'user → gw_id', tone: 'purple' },
            ],
            edges: [
              { from: 'c', to: 'ws', label: 'TCP WS', packetColor: 'amber', bidirectional: true, speed: 1.9 },
              { from: 'ws', to: 'svc', label: 'gRPC', packetColor: 'blue', speed: 1.7 },
              { from: 'svc', to: 'reg', label: 'lookup gw', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [
              { label: 'stateful TCP socket', tone: 'amber' },
              { label: 'stateless RPC', tone: 'blue' },
            ],
          },
        },
      ],
    },

    {
      id: 'caching',
      title: 'Caching',
      subtitle: 'Cache-Aside, Write-Through, Write-Behind, LRU/LFU eviction, and surviving Stampedes & Hot Keys.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Meta', 'Amazon', 'Microsoft', 'Google'],
      tags: ['redis', 'memcached', 'cache-aside', 'write-through', 'write-back', 'stampede', 'bloom filter', 'lru', 'lfu'],
      objectives: [
        'Compare Cache-Aside, Write-Through, and Write-Behind caching patterns',
        'Pick eviction policies (LRU, LFU, TTL jitter)',
        'Mitigate Cache Stampede (Thundering Herd), Cache Penetration, and Hot Keys',
      ],
      steps: [
        {
          shortLabel: 'DB overload',
          stage: 'PROBLEM',
          title: 'Repeated hot reads crush your database',
          body: [
            'Most internet apps are **90–99% reads** and obey a power-law distribution: **20% of items receive 80%+ of traffic** (trending posts, product pages, user profiles).',
            'Sending every identical read to disk-backed PostgreSQL wastes CPU parsing SQL, acquiring latches, and hitting storage IOPS — collapsing latency at just 10k RPS.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'A single Redis node handles ~100,000 ops/sec at < 1 ms latency because it serves directly from RAM with zero query planner overhead.',
          },
          scene: {
            hud: [
              { label: 'READ LATENCY', value: '145 ms', status: 'bad' },
              { label: 'DB CPU', value: '96%', status: 'bad' },
              { label: 'CACHE HIT RATE', value: '0%', status: 'bad' },
              { label: 'READ/WRITE', value: '95 : 5', status: 'info' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 185, y: 215, label: 'App Fleet', sublabel: '50k reads/s', tone: 'blue', load: 52 },
              { id: 'db', type: 'db', x: 545, y: 215, label: 'Primary DB', sublabel: 'Disk IOPS maxed', tone: 'coral', badge: 'overloaded', badgeTone: 'rose', load: 96 },
            ],
            edges: [
              { from: 'app', to: 'db', label: '50k identical SELECTs/s', packetColor: 'coral', bidirectional: true, speed: 1.4, packetCount: 3 },
            ],
            legend: [{ label: 'uncached DB queries', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Cache-Aside',
          stage: 'SOLUTION',
          title: 'Cache-Aside (Lazy Loading) offloads 95% of reads',
          body: [
            'In **Cache-Aside**, the app checks **Redis** first. On a **Hit** (95%), it returns in < 1 ms. On a **Miss** (5%), it queries the DB, writes the result into Redis with a **TTL**, and returns.',
            'On writes, the app updates the DB first and **deletes (invalidates)** the cache key — deleting is safer than overwriting the cache because concurrent writes cannot leave an older value stuck in Redis.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Update DB → Delete Cache (never Update Cache before DB, which risks stale data on concurrent updates). Always attach a TTL as a safety net!',
          },
          changes: [
            '+Redis Cluster intercepts 95% of reads in 0.6 ms',
            '~Primary DB load plunges from 96% → 18%',
            '~p99 read latency drops from 145 ms → 4 ms',
          ],
          scene: {
            hud: [
              { label: 'READ LATENCY', value: '4 ms', status: 'good' },
              { label: 'DB CPU', value: '18%', status: 'good' },
              { label: 'CACHE HIT RATE', value: '95%', status: 'good' },
              { label: 'PATTERN', value: 'Cache-Aside', status: 'info' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 165, y: 215, label: 'App Fleet', sublabel: 'Check Cache First', tone: 'blue', load: 42 },
              { id: 'redis', type: 'cache', x: 440, y: 120, label: 'Redis Cache', sublabel: '0.6 ms · TTL 5m', tone: 'green', badge: '95% hit', badgeTone: 'green', load: 34 },
              { id: 'db', type: 'db', x: 590, y: 295, label: 'Primary DB', sublabel: '5% miss + writes', tone: 'purple', load: 18 },
            ],
            edges: [
              { from: 'app', to: 'redis', label: '1. GET (95% hit)', packetColor: 'green', bidirectional: true, speed: 1.4, packetCount: 3 },
              { from: 'app', to: 'db', label: '2. miss only (5%)', packetColor: 'amber', dashed: true, speed: 2.6 },
              { from: 'db', to: 'redis', label: '3. populate + TTL', packetColor: 'purple', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'fast cache hit', tone: 'green' },
              { label: '5% DB miss', tone: 'amber' },
              { label: 'lazy fill', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Stampede fix',
          stage: 'TECHNIQUE',
          title: 'Preventing Cache Stampede, Penetration & Avalanche',
          body: [
            '1. **Cache Stampede (Thundering Herd)**: A celebrity key expires and 10,000 requests simultaneously miss and slam the DB. Fix: **Single-Flight Mutex / Request Coalescing** (only 1 request queries DB; 9,999 wait for its result) + **Probabilistic Early Expiration**.',
            '2. **Cache Penetration**: Attackers request non-existent IDs (`id=-999`), bypassing the cache every time. Fix: **Bloom Filter** in front of DB + cache negative `NULL` sentinels with short TTL.',
            '3. **Cache Avalanche**: 1M keys expire at the exact same second. Fix: Add **random TTL jitter** (`baseTTL + rand(0, 20%)`).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Naming all three caching failure modes — Stampede (Single-Flight), Penetration (Bloom Filter), Avalanche (TTL Jitter) — is a guaranteed Strong Hire highlight at Microsoft, Meta, and Amazon.',
          },
          scene: {
            hud: [
              { label: 'STAMPEDE', value: 'Single-Flight Lock', status: 'good' },
              { label: 'PENETRATION', value: 'Bloom Filter', status: 'good' },
              { label: 'AVALANCHE', value: 'TTL + Jitter', status: 'good' },
              { label: 'HOT KEYS', value: 'L1 Local + Salt', status: 'good' },
            ],
            nodes: [
              { id: 'reqs', type: 'users', x: 105, y: 215, label: '10k Reqs', sublabel: 'Same Hot Key', tone: 'slate' },
              { id: 'sf', type: 'hex', x: 320, y: 215, label: 'Single-Flight', sublabel: 'Coalesce + Bloom', tone: 'green', badge: '1 DB call only', badgeTone: 'green', load: 35 },
              { id: 'l1', type: 'cache', x: 540, y: 120, label: 'L1 + Redis', sublabel: 'TTL + Jitter', tone: 'blue', badge: 'protected', badgeTone: 'blue' },
              { id: 'db', type: 'db', x: 635, y: 295, label: 'Primary DB', sublabel: '1 query / miss', tone: 'purple', load: 14 },
            ],
            edges: [
              { from: 'reqs', to: 'sf', label: '10k concurrent', packetColor: 'coral', speed: 1.5, packetCount: 3 },
              { from: 'sf', to: 'l1', label: 'shared fill', packetColor: 'green', bidirectional: true, speed: 1.7 },
              { from: 'sf', to: 'db', label: '1 coalesced read', packetColor: 'amber', dashed: true, speed: 2.5, packetCount: 1 },
            ],
            legend: [
              { label: '10k waiting callers', tone: 'coral' },
              { label: '1 single-flight DB read', tone: 'amber' },
              { label: 'broadcast hit', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Write patterns',
          stage: 'TRADEOFF',
          title: 'Write-Through vs Write-Behind (Write-Back) & Eviction',
          body: [
            '**Write-Through** updates cache and DB synchronously on every write (always fresh reads, higher write latency). **Write-Behind** writes to cache immediately and flushes asynchronously to DB in batches (blazing writes for counters/likes, risks data loss if cache crashes before flush).',
            'When memory fills up, evict with **LRU** (Least Recently Used — O(1) HashMap + Doubly-Linked List) or **LFU / W-TinyLFU** (evicts infrequent items so one-time scans don’t pollute hot cache!).',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Explore LRU/LFU pointer swaps and trigger a live Cache Stampede in the interactive **Design Lab → Caching & Eviction Lab**!',
          },
          scene: {
            hud: [
              { label: 'CACHE-ASIDE', value: 'Read-heavy General', status: 'good' },
              { label: 'WRITE-THROUGH', value: 'Consistent Reads', status: 'info' },
              { label: 'WRITE-BEHIND', value: 'Ultra-fast Writes', status: 'warn' },
              { label: 'EVICTION', value: 'LRU / W-TinyLFU', status: 'good' },
            ],
            nodes: [
              { id: 'w', type: 'hex', x: 140, y: 215, label: 'Writer', sublabel: 'POST /like', tone: 'blue' },
              { id: 'c', type: 'cache', x: 390, y: 215, label: 'Redis Buffer', sublabel: 'ACK in 0.5ms', tone: 'green', badge: 'Write-Behind', badgeTone: 'amber' },
              { id: 'd', type: 'db', x: 640, y: 215, label: 'DB Batch', sublabel: 'Flush every 5s', tone: 'purple' },
            ],
            edges: [
              { from: 'w', to: 'c', label: 'instant write', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'c', to: 'd', label: 'async batch flush', packetColor: 'amber', dashed: true, speed: 2.8 },
            ],
            legend: [
              { label: 'fast cache ACK', tone: 'green' },
              { label: 'async DB flush', tone: 'amber' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'Cache-Aside (Lazy)', bestWhen: 'General read-heavy apps (profiles, feeds, catalogs)', pros: 'Only caches requested data; resilient if Redis restarts', cons: 'First request misses; brief staleness window possible' },
          { option: 'Write-Through', bestWhen: 'Read-after-write freshness required, moderate writes', pros: 'Cache never stale on writes; simple read path', cons: 'Higher write latency (2 hops); caches cold write-only data' },
          { option: 'Write-Behind (Write-Back)', bestWhen: 'High-volume counters, views, telemetry, gaming leaderboards', pros: 'Ultra-fast write latency + DB write coalescing', cons: 'Risk of data loss if cache crashes before async DB flush' },
          { option: 'Redis vs Memcached', bestWhen: 'Redis for rich structures/HA/persistence; Memcached for simple multi-threaded KV', pros: 'Redis: Sorted Sets, Lua, Streams, Cluster; Memcached: pure multi-core slab KV', cons: 'Redis single-threaded command loop can block on O(N) KEYS * calls' },
        ],
        failureModes: [
          {
            title: 'Hot Key Saturating One Redis Shard (e.g., Justin Bieber Tweet)',
            mitigation: 'Add an in-process L1 micro-cache (e.g., 5-second Caffeine/LRU in app RAM) OR salt hot keys across K shards (`key#0..key#9`) and read randomly.',
            interviewProbe: 'Your Redis cluster has 20 shards at 10% CPU, except Shard 7 is at 100% CPU. Why and how do you fix it?',
          },
        ],
      },
    },

    {
      id: 'cdn',
      title: 'Content Delivery',
      subtitle: 'Put static files close to users with edge servers — cutting global latency by 90% and shielding your origin.',
      duration: '10 min',
      level: 'Beginner',
      companies: ['Netflix', 'Cloudflare', 'Amazon', 'Microsoft'],
      tags: ['cdn', 'edge', 'cloudfront', 'cloudflare', 'akamai', 'cache invalidation', 'origin shield', 'anycast'],
      objectives: [
        'Why speed-of-light distance makes a single origin slow globally',
        'How edge servers cache static files (90%+ of page bytes)',
        'Cold edge warming vs warm cache hit ratios',
        'Invalidation strategies: content hashing, TTL, and purge APIs',
        'Protecting your origin with Origin Shield and Edge Compute',
      ],
      steps: [
        {
          shortLabel: 'Far away',
          stage: 'PROBLEM',
          title: 'Your users are far away',
          body: [
            'Your servers live in **Virginia (us-east-1)**, where latency to New York is 10 ms. But light in fiber optic cable travels at ~200,000 km/s — physics sets a hard floor of **75 ms RTT from London** and **200+ ms RTT from Sydney**.',
            'Every image, CSS file, JS bundle, and video chunk forces global users to cross oceans repeatedly while hammering your single origin at **9,000 req/s**.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'You cannot optimize code to beat the speed of light. TCP + TLS + HTTP across 16,000 km can burn over 600 ms before the first pixel renders!',
          },
          scene: {
            hud: [
              { label: 'LONDON LATENCY', value: '80 ms', status: 'warn' },
              { label: 'SYDNEY LATENCY', value: '210 ms', status: 'bad' },
              { label: 'ORIGIN LOAD', value: '9,000 req/s', status: 'bad' },
              { label: 'CACHE HIT RATE', value: '0%', status: 'bad' },
            ],
            nodes: [
              { id: 'origin', type: 'hex', x: 380, y: 110, label: 'Origin', sublabel: 'Virginia', tone: 'blue', load: 88 },
              { id: 'lon', type: 'users', x: 175, y: 310, label: 'London', sublabel: 'EU Users', tone: 'slate' },
              { id: 'syd', type: 'users', x: 585, y: 310, label: 'Sydney', sublabel: 'APAC Users', tone: 'slate' },
            ],
            edges: [
              { from: 'lon', to: 'origin', label: '≈ 75 ms RTT', packetColor: 'coral', bidirectional: true, speed: 2.3, packetCount: 2 },
              { from: 'syd', to: 'origin', label: '≈ 200 ms RTT', packetColor: 'coral', bidirectional: true, speed: 3.4, packetCount: 2 },
            ],
            legend: [
              { label: 'long-haul request', tone: 'coral' },
              { label: 'response', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Same bytes',
          stage: 'INSIGHT',
          title: '98% of a web page is identical for every user',
          body: [
            'Inspect a typical 2 MB web page: only **30 KB** is personalized HTML/JSON ("Hello, Alice"). The remaining **1.97 MB** — hero images, product thumbnails, fonts, React JS bundles, CSS — is **byte-for-byte identical** for everyone in London and Sydney.',
            'Shipping the exact same 1.6 MB image across the Pacific Ocean 50,000 times a minute is pure waste.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Static assets are typically 90–98% of the bytes on a page. Cache them once in every major city and let your Origin focus solely on tiny dynamic API calls.',
          },
          scene: {
            hud: [
              { label: 'PERSONAL HTML', value: '30 KB (2%)', status: 'info' },
              { label: 'STATIC ASSETS', value: '2.0 MB (98%)', status: 'good' },
              { label: 'ORIGIN LOAD', value: '9,000 req/s', status: 'warn' },
              { label: 'CACHEABLE', value: '98% bytes', status: 'good' },
            ],
            nodes: [
              { id: 'origin', type: 'hex', x: 220, y: 115, label: 'Origin', sublabel: 'Virginia', tone: 'blue', load: 88 },
              { id: 'lon', type: 'users', x: 120, y: 315, label: 'London', sublabel: 'Same JS/Images', tone: 'slate' },
              { id: 'syd', type: 'users', x: 350, y: 315, label: 'Sydney', sublabel: 'Same JS/Images', tone: 'slate' },
            ],
            edges: [
              { from: 'lon', to: 'origin', label: '2 MB each time', packetColor: 'coral', speed: 2.3 },
              { from: 'syd', to: 'origin', label: '2 MB each time', packetColor: 'coral', speed: 3.1 },
            ],
            overlayCard: {
              x: 455,
              y: 55,
              title: 'WHAT A PAGE IS MADE OF',
              rows: [
                { label: 'HTML (per user)', value: '30 KB', pct: 4, tone: 'blue' },
                { label: 'Images & Video', value: '1.6 MB', pct: 78, tone: 'green' },
                { label: 'JS + CSS + Fonts', value: '400 KB', pct: 20, tone: 'purple' },
              ],
              footer: '98% of bytes are identical for everyone',
            },
            legend: [
              { label: 'redundant static bytes', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Edges',
          stage: 'SOLUTION',
          title: 'Place CDN Edge PoPs next to your users',
          body: [
            'A **Content Delivery Network (CDN)** deploys hundreds of caching **Edge Servers (Points of Presence / PoPs)** inside cities worldwide, routed automatically via **Anycast BGP**.',
            'Now London users fetch images in **12 ms** from Edge London, and Sydney users fetch in **16 ms** from Edge Sydney! Only the 10% uncached or dynamic requests ever touch Virginia.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Major CDNs: Cloudflare, AWS CloudFront, Fastly, Akamai, Azure Front Door, and Netflix’s custom ISP-embedded Open Connect appliances.',
          },
          changes: [
            '+Edge servers deployed in London and Sydney',
            '~90% of requests answered locally at the edge',
            '~Origin load drops 9,000 → 933 req/s (CPU 88% → 28%)',
          ],
          scene: {
            hud: [
              { label: 'LONDON LATENCY', value: '12 ms', status: 'good' },
              { label: 'SYDNEY LATENCY', value: '16 ms', status: 'good' },
              { label: 'ORIGIN LOAD', value: '933 req/s', status: 'good' },
              { label: 'CACHE HIT RATE', value: '90%', status: 'good' },
            ],
            nodes: [
              { id: 'origin', type: 'hex', x: 380, y: 85, label: 'Origin', sublabel: 'Virginia', tone: 'blue', load: 28 },
              { id: 'edge-lon', type: 'hex', x: 185, y: 205, label: 'Edge London', sublabel: 'PoP LHR', tone: 'green', badge: 'warm · 92% hit', badgeTone: 'green', load: 31 },
              { id: 'edge-syd', type: 'hex', x: 575, y: 205, label: 'Edge Sydney', sublabel: 'PoP SYD', tone: 'green', badge: 'warm · 89% hit', badgeTone: 'green', load: 29 },
              { id: 'lon', type: 'users', x: 185, y: 345, label: 'London', sublabel: '12 ms', tone: 'slate' },
              { id: 'syd', type: 'users', x: 575, y: 345, label: 'Sydney', sublabel: '16 ms', tone: 'slate' },
            ],
            edges: [
              { from: 'lon', to: 'edge-lon', label: '12 ms hit', packetColor: 'green', bidirectional: true, speed: 1.4, packetCount: 2 },
              { from: 'syd', to: 'edge-syd', label: '16 ms hit', packetColor: 'green', bidirectional: true, speed: 1.5, packetCount: 2 },
              { from: 'edge-lon', to: 'origin', label: '10% miss', packetColor: 'amber', dashed: true, speed: 2.8, packetCount: 1 },
              { from: 'edge-syd', to: 'origin', label: '10% miss', packetColor: 'amber', dashed: true, speed: 3.1, packetCount: 1 },
            ],
            legend: [
              { label: 'edge hit (local)', tone: 'green' },
              { label: 'edge miss → origin', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Cold edge',
          stage: 'TECHNIQUE',
          title: 'Pull CDN warming: what happens on a cold edge',
          body: [
            'Most modern web apps use a **Pull CDN**: you don’t manually upload files to 300 cities. When Sydney’s edge starts **cold** (or after a deploy), the first request for `hero.webp` misses, fetches from Origin, caches it locally, and every subsequent Sydney user gets a 12 ms hit.',
            'During the warming window, Sydney latency temporarily hovers around **88 ms** and Origin load bumps to ~2,300 req/s before settling back down.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Use a Push CDN (pre-warming edges before launch) for massive predictable events like iOS updates, Netflix premieres, or Disney+ Hotstar cricket finals.',
          },
          scene: {
            hud: [
              { label: 'LONDON LATENCY', value: '12 ms', status: 'good' },
              { label: 'SYDNEY LATENCY', value: '88 ms', status: 'warn' },
              { label: 'ORIGIN LOAD', value: '2,340 req/s', status: 'warn' },
              { label: 'CACHE HIT RATE', value: '71%', status: 'warn' },
            ],
            nodes: [
              { id: 'origin', type: 'hex', x: 380, y: 85, label: 'Origin', sublabel: 'Virginia', tone: 'blue', load: 52 },
              { id: 'edge-lon', type: 'hex', x: 185, y: 205, label: 'Edge London', sublabel: '≈ 10 ms', tone: 'green', badge: 'warm', badgeTone: 'green', load: 30 },
              { id: 'edge-syd', type: 'hex', x: 575, y: 205, label: 'Edge Sydney', sublabel: 'filling cache', tone: 'amber', badge: 'cold · filling', badgeTone: 'amber', load: 54 },
              { id: 'lon', type: 'users', x: 185, y: 345, label: 'London', sublabel: 'fast hits', tone: 'slate' },
              { id: 'syd', type: 'users', x: 575, y: 345, label: 'Sydney', sublabel: 'warming up', tone: 'slate' },
            ],
            edges: [
              { from: 'lon', to: 'edge-lon', label: '10 ms', packetColor: 'green', bidirectional: true, speed: 1.4 },
              { from: 'syd', to: 'edge-syd', label: '12 ms local', packetColor: 'amber', bidirectional: true, speed: 1.7 },
              { from: 'edge-syd', to: 'origin', label: 'only on a miss', packetColor: 'amber', dashed: true, speed: 2.2, packetCount: 3 },
            ],
            legend: [
              { label: 'warm cache hit', tone: 'green' },
              { label: 'cold cache fill → origin', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Invalidation',
          stage: 'TECHNIQUE',
          title: 'Cache invalidation: Content Hashing beats manual purging',
          body: [
            'How do you deploy a new `app.js` without users stuck on yesterday’s cached bundle? **Never overwrite the same URL** and hope TTLs expire!',
            'Instead, use **Content-Hashed (Fingerprinted) URLs** like `app.8f3a2c.js` with `Cache-Control: public, max-age=31536000, immutable`. Your tiny `index.html` (`max-age=0, must-revalidate`) points to the new hash — instant atomic rollouts AND instant rollbacks!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Use Content-Hashed Immutable URLs for JS/CSS/images, short `s-maxage` + `stale-while-revalidate` for semi-dynamic pages, and Surrogate Keys / Purge APIs for emergency takedowns.',
          },
          scene: {
            hud: [
              { label: 'STATIC ASSETS', value: 'immutable · 1 yr', status: 'good' },
              { label: 'HTML SHELL', value: 'revalidate', status: 'info' },
              { label: 'STALE BUG RISK', value: 'Zero', status: 'good' },
              { label: 'ROLLBACK TIME', value: '< 1 sec', status: 'good' },
            ],
            nodes: [
              { id: 'html', type: 'hex', x: 160, y: 215, label: 'index.html', sublabel: 'no-cache', tone: 'amber', badge: 'tiny · 4 KB', badgeTone: 'amber' },
              { id: 'old', type: 'cache', x: 440, y: 125, label: 'app.v1a2.js', sublabel: 'Old build', tone: 'slate', dim: true },
              { id: 'new', type: 'cache', x: 440, y: 295, label: 'app.8f3c.js', sublabel: 'max-age=1yr', tone: 'green', badge: 'immutable', badgeTone: 'green' },
              { id: 'u', type: 'users', x: 660, y: 215, label: 'Users', sublabel: 'Atomic v2', tone: 'blue' },
            ],
            edges: [
              { from: 'html', to: 'new', label: 'points to hash', packetColor: 'green', speed: 1.7 },
              { from: 'new', to: 'u', label: 'cached 1 year', packetColor: 'green', speed: 1.6 },
            ],
            legend: [
              { label: 'immutable hashed asset', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Origin Shield',
          stage: 'SOLUTION',
          title: 'Origin Shielding collapses 300 edge misses into 1',
          body: [
            'With 300 global Edge PoPs, a brand-new viral video causes all 300 edges to miss simultaneously and send 300 redundant requests to Origin.',
            'Adding a regional **Origin Shield** (a mid-tier cache layer right in front of Origin) coalesces misses across all edges: Edge London, Edge Paris, and Edge Sydney hit the Origin Shield first, so Origin only serves **1 single copy**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Tiered caching (Edge PoP → Regional Origin Shield → Origin) reduces origin egress bills by 80%+ and shields databases from viral launch spikes.',
          },
          changes: [
            '+Regional Origin Shield added in front of Virginia Origin',
            '+300 edge misses collapsed into 1 single origin fetch',
            '~Origin CPU stays flat at 12% even during viral launches',
          ],
          scene: {
            hud: [
              { label: 'EDGE POPS', value: '300 Cities', status: 'good' },
              { label: 'SHIELD LAYER', value: 'Regional L2', status: 'good' },
              { label: 'ORIGIN MISSES', value: '300 → 1', status: 'good' },
              { label: 'ORIGIN CPU', value: '12%', status: 'good' },
            ],
            nodes: [
              { id: 'e1', type: 'hex', x: 130, y: 110, label: 'Edge London', sublabel: 'L1', tone: 'green' },
              { id: 'e2', type: 'hex', x: 130, y: 215, label: 'Edge Tokyo', sublabel: 'L1', tone: 'green' },
              { id: 'e3', type: 'hex', x: 130, y: 320, label: 'Edge Sydney', sublabel: 'L1', tone: 'green' },
              { id: 'shield', type: 'cache', x: 400, y: 215, label: 'Origin Shield', sublabel: 'L2 Coalescer', tone: 'purple', badge: 'request collapse', badgeTone: 'purple', load: 24 },
              { id: 'origin', type: 'hex', x: 650, y: 215, label: 'Origin', sublabel: 'Virginia', tone: 'blue', load: 12 },
            ],
            edges: [
              { from: 'e1', to: 'shield', label: 'miss', packetColor: 'amber', dashed: true, speed: 2.0 },
              { from: 'e2', to: 'shield', label: 'miss', packetColor: 'amber', dashed: true, speed: 2.0 },
              { from: 'e3', to: 'shield', label: 'miss', packetColor: 'amber', dashed: true, speed: 2.0 },
              { from: 'shield', to: 'origin', label: '1 fetch only!', packetColor: 'purple', bidirectional: true, speed: 2.2, packetCount: 1 },
            ],
            legend: [
              { label: 'edge misses', tone: 'amber' },
              { label: 'single coalesced origin read', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Recap',
          stage: 'RECAP',
          title: 'CDN architecture checklist for Big Tech interviews',
          body: [
            '1. Put static images, JS, CSS, HLS/DASH video chunks, and public read-heavy APIs behind a **CDN**.',
            '2. Use **Pull CDN** for general apps and **Push / Pre-warmed CDN** for predictable global media drops.',
            '3. Version static assets with **content hashes (`immutable`)**; use **Origin Shield** to prevent 300-PoP miss storms; never cache private user data with `public` headers!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Security bug alert: Caching a response containing a `Set-Cookie` or personalized header at a shared CDN edge leaks Alice’s account page to Bob! Always mark private routes `Cache-Control: private, no-store`.',
          },
          scene: {
            hud: [
              { label: 'GLOBAL LATENCY', value: '12 – 20 ms', status: 'good' },
              { label: 'ORIGIN OFFLOAD', value: '95%+', status: 'good' },
              { label: 'INVALIDATION', value: 'Content Hash', status: 'good' },
              { label: 'PRIVATE DATA', value: 'private, no-store', status: 'info' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 115, y: 215, label: 'Global Users', sublabel: 'Anycast', tone: 'slate' },
              { id: 'edge', type: 'hex', x: 315, y: 215, label: '300+ Edges', sublabel: 'TLS + Static', tone: 'green', badge: '95% hit', badgeTone: 'green' },
              { id: 'sh', type: 'cache', x: 505, y: 215, label: 'Origin Shield', sublabel: 'L2 Tier', tone: 'purple' },
              { id: 'o', type: 'hex', x: 675, y: 215, label: 'Origin', sublabel: 'Dynamic APIs', tone: 'blue', load: 14 },
            ],
            edges: [
              { from: 'u', to: 'edge', label: '12 ms', packetColor: 'green', bidirectional: true, speed: 1.5 },
              { from: 'edge', to: 'sh', label: '5% miss', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'sh', to: 'o', label: '1x fill', packetColor: 'purple', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'edge hit', tone: 'green' },
              { label: 'tiered miss', tone: 'amber' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'Pull CDN', bestWhen: 'Web apps, e-commerce, UGC (Instagram/YouTube long tail)', pros: 'Zero sync ops; only caches actually requested assets', cons: 'First request per PoP suffers cold-cache latency' },
          { option: 'Push CDN', bestWhen: 'Small immutable bundles, major game patches, live broadcast events', pros: 'Zero cold-start latency at launch time', cons: 'You pay storage & bandwidth even for files nobody downloads' },
          { option: 'Edge Compute (Workers)', bestWhen: 'Auth JWT verification, A/B testing, geo-redirects, HTML assembly', pros: 'Sub-20ms dynamic personalization without origin RTT', cons: 'Strict CPU/memory limits; global DB writes still need origin' },
        ],
        failureModes: [
          {
            title: 'Cache Poisoning / Personal Data Leak on CDN Edge',
            mitigation: 'Separate static asset domains (`cdn.example.com`, cookie-less), set `Cache-Control: private, no-store` on authenticated endpoints, and configure strict `Vary` keys.',
            interviewProbe: 'A user reports seeing another customer’s order history right after we turned on CDN caching. What happened?',
          },
        ],
      },
    },
  ],
};

export const MODULES_01_02 = [MODULE_01_FOUNDATIONS, MODULE_02_SCALING];
