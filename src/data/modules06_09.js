// Modules 06 (Architecture), 07 (Security & Enterprise), 08 (Shipping & DevOps),
// and 09 (Fintech, AI/LLM & Real-World Big Tech — ByteByteGo 101 signatures)

export const MODULE_06_ARCHITECTURE = {
  id: 'mod-06-architecture',
  number: '06',
  title: 'Architecture',
  track: 'hld',
  lessons: [
    {
      id: 'microservices',
      title: 'Monolith vs Microservices',
      subtitle: 'Modular Monoliths, independent deployability, Strangler Fig migration, and avoiding the Distributed Monolith.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Netflix', 'Uber', 'Microsoft'],
      tags: ['monolith', 'microservices', 'modular monolith', 'strangler fig', 'cqrs', 'conways law'],
      objectives: [
        'Start with a Modular Monolith and split only when team autonomy or scaling bottlenecks demand it',
        'Enforce Database-per-Service so microservices never share tables directly',
        'Migrate safely from legacy monolith using the Strangler Fig pattern',
      ],
      steps: [
        {
          shortLabel: 'Trade-offs',
          stage: 'SETUP',
          title: 'Microservices solve organizational scale, not day-one code',
          body: [
            'A **Modular Monolith** compiles into one deployable unit with strict internal module boundaries: zero network latency, easy ACID joins, trivial debugging. When **100+ engineers** collide on one CI pipeline or Video Transcoding needs GPUs while Checkout needs CPU, splitting into **Microservices** shines.',
            'Cardinal Rule: **Database-per-Service**. If Service A queries Service B’s SQL tables directly, you built a **Distributed Monolith** — all the latency of microservices with none of the independence!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Amazon Prime Video cut monitoring infrastructure costs by **90%** by consolidating an over-fragmented serverless microservice pipeline back into a single Modular Monolith.',
          },
          scene: {
            hud: [
              { label: 'SMALL TEAM', value: 'Modular Monolith', status: 'good' },
              { label: '100+ DEVS', value: 'Microservices', status: 'info' },
              { label: 'DATA RULE', value: '1 DB per Service', status: 'good' },
              { label: 'ANTI-PATTERN', value: 'Shared DB Coupling', status: 'bad' },
            ],
            nodes: [
              { id: 'gw', type: 'hex', x: 120, y: 215, label: 'API Gateway', sublabel: 'Strangler Router', tone: 'green' },
              { id: 's1', type: 'hex', x: 385, y: 115, label: 'Order Svc', sublabel: 'Team A · Go', tone: 'blue' },
              { id: 'd1', type: 'db', x: 635, y: 115, label: 'Order DB', sublabel: 'Private Schema', tone: 'purple' },
              { id: 's2', type: 'hex', x: 385, y: 315, label: 'Catalog Svc', sublabel: 'Team B · Java', tone: 'blue' },
              { id: 'd2', type: 'db', x: 635, y: 315, label: 'Catalog DB', sublabel: 'Private Schema', tone: 'purple' },
            ],
            edges: [
              { from: 'gw', to: 's1', label: '/orders', packetColor: 'green', speed: 1.7 },
              { from: 'gw', to: 's2', label: '/catalog', packetColor: 'green', speed: 1.7 },
              { from: 's1', to: 'd1', label: 'owned', packetColor: 'purple', speed: 1.8 },
              { from: 's2', to: 'd2', label: 'owned', packetColor: 'purple', speed: 1.8 },
              { from: 's1', to: 's2', label: 'API/Event only', packetColor: 'amber', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'private owned DB', tone: 'purple' },
              { label: 'contract-only IPC', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Strangler Fig',
          stage: 'SOLUTION',
          title: 'Strangler Fig migrates monoliths slice-by-slice without a rewrite',
          body: [
            'Never do a "Big Bang 18-month rewrite." Put a routing proxy in front of the monolith, peel off one domain (e.g., `/payments`), run **shadow traffic** to verify output parity, shift 1% → 10% → 100% traffic, and retire the old monolith module.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Recommending **Strangler Fig + Shadow Traffic + Feature Flags** for legacy migrations is a classic Microsoft/Amazon Senior/Principal behavioral + design answer.',
          },
          scene: {
            hud: [
              { label: 'STRATEGY', value: 'Strangler Fig', status: 'good' },
              { label: 'NEW SLICE', value: '/payments (100%)', status: 'good' },
              { label: 'LEGACY', value: 'Shrinking Safely', status: 'info' },
              { label: 'DOWNTIME', value: 'Zero', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 110, y: 215, label: 'Traffic', sublabel: '100% Live', tone: 'slate' },
              { id: 'px', type: 'hex', x: 325, y: 215, label: 'Strangler Proxy', sublabel: 'Canary / Shadow', tone: 'green' },
              { id: 'new', type: 'hex', x: 615, y: 120, label: 'New Payment Svc', sublabel: 'Extracted ✓', tone: 'green', badge: 'live 100%', badgeTone: 'green' },
              { id: 'old', type: 'hex', x: 615, y: 310, label: 'Legacy Monolith', sublabel: 'Rest of routes', tone: 'amber', dim: true },
            ],
            edges: [
              { from: 'u', to: 'px', label: 'all reqs', packetColor: 'blue', speed: 1.7 },
              { from: 'px', to: 'new', label: '/payments', packetColor: 'green', speed: 1.6 },
              { from: 'px', to: 'old', label: '/* remaining', packetColor: 'amber', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'incremental cutover', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'service-discovery',
      title: 'Service Discovery & Mesh',
      subtitle: 'Dynamic container IPs, Client vs Server Discovery (Consul/K8s DNS), and Envoy Sidecar Service Mesh.',
      duration: '8 min',
      level: 'Intermediate',
      companies: ['Google', 'Microsoft', 'Lyft', 'Amazon'],
      tags: ['service discovery', 'consul', 'kubernetes dns', 'service mesh', 'istio', 'envoy', 'mtls'],
      objectives: [
        'Discover ephemeral pod IPs without hardcoded hostnames',
        'Compare Client-Side Discovery (Eureka/gRPC) vs Server-Side (K8s Service/ALB)',
        'Offload mTLS, retries, timeouts, and telemetry to an Envoy Service Mesh sidecar',
      ],
      steps: [
        {
          shortLabel: 'Static IP Trap',
          stage: 'PROBLEM',
          title: 'Hardcoded IPs break the instant autoscaling restarts a container',
          body: [
            'In cloud-native Kubernetes clusters, pods scale up during traffic spikes and get replaced on deploys with **brand-new ephemeral IP addresses** every few minutes.',
            'Hardcoding `10.0.4.12:8080` in config files causes cascading `Connection Refused` failures the moment a single container recycles.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Traditional DNS caching inside JVM/Node clients can keep sending traffic to a dead pod IP for 60+ seconds unless you use active health-checked discovery or Envoy sidecars!',
          },
          scene: {
            hud: [
              { label: 'POD LIFESPAN', value: 'Ephemeral IPs', status: 'warn' },
              { label: 'STATIC CONFIG', value: 'Stale / Broken', status: 'bad' },
              { label: 'DNS TTL LAG', value: '30 – 60s Errors', status: 'bad' },
              { label: 'FIX', value: 'Registry + Mesh', status: 'good' },
            ],
            nodes: [
              { id: 'ord', type: 'hex', x: 145, y: 215, label: 'Order Pod', sublabel: 'Calls 10.0.4.12', tone: 'blue' },
              { id: 'old', type: 'hex', x: 520, y: 120, label: '10.0.4.12', sublabel: 'Terminated!', tone: 'coral', badge: 'dead IP', badgeTone: 'rose', dim: true },
              { id: 'new', type: 'hex', x: 520, y: 310, label: '10.0.9.88', sublabel: 'New Healthy Pod', tone: 'green', badge: 'unreached', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'ord', to: 'old', label: 'ECONNREFUSED', packetColor: 'coral', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'stale hardcoded IP failure', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Registry & Mesh',
          stage: 'SOLUTION',
          title: 'Dynamic Registry + Envoy Sidecars standardize resilience across languages',
          body: [
            'In Kubernetes and autoscaled clouds, pod IPs change every minute. Every healthy pod registers in a **Service Registry** (CoreDNS/etcd, Consul) with a heartbeat TTL.',
            'A **Service Mesh** (Istio/Linkerd + **Envoy Sidecars**) intercepts all pod-to-pod traffic transparently — giving Go, Python, Java, and C# services uniform **mTLS encryption, retries, circuit breaking, canary splits, and OpenTelemetry tracing** with zero app code!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Control Plane (Istiod) pushes routing & certs; Data Plane (Envoy sidecar next to each container) handles every packet at sub-millisecond overhead.',
          },
          changes: [
            '+Control Plane pushes live healthy endpoints via xDS in milliseconds',
            '+Envoy Sidecars enforce mTLS + automatic retries across all languages',
          ],
          scene: {
            hud: [
              { label: 'DATA PLANE', value: 'Envoy Sidecars', status: 'good' },
              { label: 'CONTROL PLANE', value: 'Registry / Istio', status: 'info' },
              { label: 'SECURITY', value: 'Zero-Trust mTLS', status: 'good' },
              { label: 'HOP COST', value: '~0.5 ms', status: 'good' },
            ],
            nodes: [
              { id: 'cp', type: 'hex', x: 380, y: 80, label: 'Control Plane', sublabel: 'Certs + Endpoints', tone: 'purple' },
              { id: 'a', type: 'hex', x: 165, y: 265, label: 'Order Pod', sublabel: '+ Envoy Sidecar', tone: 'blue', badge: 'mTLS', badgeTone: 'green' },
              { id: 'b', type: 'hex', x: 595, y: 265, label: 'Billing Pod', sublabel: '+ Envoy Sidecar', tone: 'green', badge: 'mTLS', badgeTone: 'green' },
            ],
            edges: [
              { from: 'cp', to: 'a', label: 'xDS routes', packetColor: 'purple', dashed: true, speed: 2.5 },
              { from: 'cp', to: 'b', label: 'xDS routes', packetColor: 'purple', dashed: true, speed: 2.5 },
              { from: 'a', to: 'b', label: 'encrypted mTLS + retries', packetColor: 'green', bidirectional: true, speed: 1.6 },
            ],
            legend: [
              { label: 'sidecar mTLS data plane', tone: 'green' },
              { label: 'xDS config push', tone: 'purple' },
            ],
          },
        },
      ],
    },

    {
      id: 'sagas',
      title: 'Sagas, 2PC & Transactional Outbox',
      subtitle: 'Distributed transactions across microservices without blocking locks: 2PC pitfalls, Saga compensations, and Outbox + CDC.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Amazon', 'Uber', 'Microsoft', 'Stripe'],
      tags: ['saga', '2pc', 'two phase commit', 'outbox pattern', 'cdc', 'debezium', 'compensating transaction'],
      objectives: [
        'Explain why Two-Phase Commit (2PC) blocks under coordinator failure',
        'Design Choreography vs Orchestration Sagas with Compensating Transactions',
        'Solve the Dual-Write bug atomically with the Transactional Outbox + Debezium CDC',
      ],
      steps: [
        {
          shortLabel: '2PC vs Saga',
          stage: 'SOLUTION',
          title: 'Sagas replace blocking 2PC locks with local ACID steps + compensations',
          body: [
            '**Two-Phase Commit (2PC)** holds row locks across Order, Payment, and Inventory DBs until a coordinator finishes Prepare + Commit. If the coordinator crashes mid-phase, all participants stay locked indefinitely!',
            'The **Saga Pattern** executes a sequence of local ACID transactions (`ReserveSeat → ChargeCard → IssueTicket`). If `ChargeCard` fails, the **Saga Orchestrator** triggers a **Compensating Transaction** (`ReleaseSeat`) to semantically undo prior steps!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Use **Choreography** (services react to Kafka events) for 2–3 simple steps; use **Orchestration** (Temporal / Step Functions state machine) for complex 4+ step business workflows like flight+hotel+payment booking!',
          },
          scene: {
            hud: [
              { label: 'PATTERN', value: 'Saga Orchestrator', status: 'good' },
              { label: 'LOCK HOLDING', value: 'Zero Cross-DB Locks', status: 'good' },
              { label: 'ON FAILURE', value: 'Compensate Undo', status: 'warn' },
              { label: 'ENGINE', value: 'Temporal / Durable', status: 'info' },
            ],
            nodes: [
              { id: 'orch', type: 'hex', x: 380, y: 95, label: 'Saga Orchestrator', sublabel: 'Temporal State', tone: 'purple', badge: 'durable workflow', badgeTone: 'purple' },
              { id: 'inv', type: 'hex', x: 145, y: 290, label: '1. Inventory', sublabel: 'Reserve / Undo', tone: 'green' },
              { id: 'pay', type: 'hex', x: 380, y: 290, label: '2. Payment', sublabel: 'Declined!', tone: 'coral', badge: 'failed → rollback', badgeTone: 'rose' },
              { id: 'ship', type: 'hex', x: 615, y: 290, label: '3. Shipping', sublabel: 'Skipped', tone: 'slate', dim: true },
            ],
            edges: [
              { from: 'orch', to: 'inv', label: 'compensate: release!', packetColor: 'amber', dashed: true, speed: 2.0 },
              { from: 'orch', to: 'pay', label: 'charge → fail', packetColor: 'coral', bidirectional: true, speed: 1.8 },
              { from: 'orch', to: 'ship', label: 'not called', packetColor: 'slate', dashed: true, dim: true, speed: 3.0 },
            ],
            legend: [
              { label: 'failed step', tone: 'coral' },
              { label: 'compensating rollback', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Outbox + CDC',
          stage: 'TECHNIQUE',
          title: 'Transactional Outbox + Debezium CDC fixes the Dual-Write Bug',
          body: [
            'Classic distributed bug: `db.save(order)` succeeds, then the container crashes right before `kafka.publish("OrderCreated")`! Now DB and Kafka are permanently out of sync.',
            '**Fix — Transactional Outbox**: Insert the `order` row AND an `outbox_events` row in the **SAME local SQL ACID transaction**. **Debezium CDC** tails PostgreSQL’s WAL log and reliably publishes every outbox row to Kafka with zero lost events!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Naming the **Dual-Write Problem** and solving it with **Transactional Outbox + CDC (Debezium)** is one of the highest-signal Staff architecture answers in big tech interviews.',
          },
          scene: {
            hud: [
              { label: 'DUAL-WRITE BUG', value: 'Eliminated ✓', status: 'good' },
              { label: 'LOCAL TX', value: 'orders + outbox', status: 'good' },
              { label: 'RELAY', value: 'Debezium WAL CDC', status: 'info' },
              { label: 'EVENT LOSS', value: 'Zero', status: 'good' },
            ],
            nodes: [
              { id: 'svc', type: 'hex', x: 115, y: 215, label: 'Order Svc', sublabel: '1 ACID TX', tone: 'blue' },
              { id: 'pg', type: 'db', x: 335, y: 215, label: 'Postgres', sublabel: 'orders + outbox', tone: 'purple', badge: 'atomic commit', badgeTone: 'green' },
              { id: 'cdc', type: 'hex', x: 525, y: 215, label: 'Debezium CDC', sublabel: 'Tails WAL Log', tone: 'green' },
              { id: 'kf', type: 'queue', x: 690, y: 215, label: 'Kafka', sublabel: 'At-Least-Once', tone: 'amber' },
            ],
            edges: [
              { from: 'svc', to: 'pg', label: 'BEGIN..COMMIT', packetColor: 'purple', speed: 1.7 },
              { from: 'pg', to: 'cdc', label: 'WAL stream', packetColor: 'green', speed: 1.7 },
              { from: 'cdc', to: 'kf', label: 'publish event', packetColor: 'amber', speed: 1.7 },
            ],
            legend: [{ label: 'atomic DB → WAL → Kafka', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'batch-stream',
      title: 'Batch & Stream Processing',
      subtitle: 'Lambda vs Kappa architectures, Apache Flink Event Time & Watermarks, Spark, and Iceberg/Lakehouse.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Uber', 'Netflix', 'Google', 'Microsoft'],
      tags: ['flink', 'spark', 'kafka streams', 'lambda', 'kappa', 'watermarks', 'iceberg', 'clickhouse'],
      objectives: [
        'Contrast Batch (Spark/MapReduce) vs Real-Time Stream Processing (Flink)',
        'Handle late-arriving mobile events with Event Time + Watermarks',
        'Simplify dual Lambda codebases into unified Kappa streaming pipelines',
      ],
      steps: [
        {
          shortLabel: 'Flink & Kappa',
          stage: 'SOLUTION',
          title: 'Kappa Architecture + Flink Watermarks process millions of events/sec',
          body: [
            '**Batch Processing** (Spark) runs hourly/daily over Parquet/Iceberg lakehouses for exact billing & ML training. **Stream Processing** (Apache Flink) computes sub-second sliding windows (Uber surge pricing, fraud alerts, trending hashtags) continuously off Kafka.',
            'Mobile phones go offline in tunnels and deliver events 2 minutes late! Flink tracks **Event Time** (timestamp on phone) plus a **Watermark** tolerance window so late data lands in the exact historical bucket rather than skewing the current minute.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: '**Lambda** runs two codebases (Batch + Speed) and merges outputs; **Kappa** treats everything as a single Kafka replayable stream into Flink, avoiding duplicated business logic.',
          },
          scene: {
            hud: [
              { label: 'STREAM ENGINE', value: 'Apache Flink', status: 'good' },
              { label: 'WINDOW TIME', value: 'Event + Watermark', status: 'good' },
              { label: 'OLAP SINK', value: 'ClickHouse / Pinot', status: 'info' },
              { label: 'LAKEHOUSE', value: 'S3 + Iceberg', status: 'info' },
            ],
            nodes: [
              { id: 'kf', type: 'queue', x: 120, y: 215, label: 'Kafka Log', sublabel: 'Click / Ride Events', tone: 'amber' },
              { id: 'fl', type: 'hex', x: 375, y: 130, label: 'Apache Flink', sublabel: '1-min Sliding Win', tone: 'green', badge: 'sub-sec', badgeTone: 'green' },
              { id: 'sp', type: 'hex', x: 375, y: 310, label: 'Apache Spark', sublabel: 'Nightly ML / ETL', tone: 'blue' },
              { id: 'olap', type: 'db', x: 640, y: 130, label: 'ClickHouse', sublabel: 'Live Dashboards', tone: 'purple' },
              { id: 'lake', type: 'db', x: 640, y: 310, label: 'Iceberg Lake', sublabel: 'Parquet on S3', tone: 'slate' },
            ],
            edges: [
              { from: 'kf', to: 'fl', label: 'stream', packetColor: 'green', speed: 1.5 },
              { from: 'kf', to: 'sp', label: 'archive', packetColor: 'blue', dashed: true, speed: 2.5 },
              { from: 'fl', to: 'olap', label: 'real-time agg', packetColor: 'purple', speed: 1.6 },
              { from: 'sp', to: 'lake', label: 'batch tables', packetColor: 'blue', speed: 2.3 },
            ],
            legend: [
              { label: 'real-time Flink stream', tone: 'green' },
              { label: 'batch lakehouse ETL', tone: 'blue' },
            ],
          },
        },
        {
          shortLabel: 'Checkpoints',
          stage: 'TECHNIQUE',
          title: 'Exactly-Once State Checkpointing survives worker crashes cleanly',
          body: [
            'If a Flink worker crashes halfway through computing a 1-hour revenue counter, naively restarting loses the in-memory sum or double-counts events!',
            'Flink injects **Chandy-Lamport Checkpoint Barriers** periodically into the Kafka stream and snapshots operator state (RocksDB) to S3 — recovering seamlessly with **Exactly-Once** accuracy!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning **Event Time + Watermarks + RocksDB Checkpointing** for stream analytics separates Staff engineers from generic "just use Spark" answers.',
          },
          scene: {
            hud: [
              { label: 'STATE STORE', value: 'Local RocksDB', status: 'good' },
              { label: 'RECOVERY', value: 'S3 Checkpoints', status: 'good' },
              { label: 'SEMANTICS', value: 'Exactly-Once', status: 'good' },
              { label: 'LATE DATA', value: 'Side Output Tag', status: 'info' },
            ],
            nodes: [
              { id: 'kf', type: 'queue', x: 140, y: 215, label: 'Kafka Offset', sublabel: 'Barrier #42', tone: 'amber' },
              { id: 'op', type: 'hex', x: 400, y: 215, label: 'Flink Operator', sublabel: 'RocksDB State', tone: 'green', badge: 'checkpointed', badgeTone: 'green' },
              { id: 's3', type: 'db', x: 645, y: 215, label: 'S3 Snapshot', sublabel: 'Durable State', tone: 'purple' },
            ],
            edges: [
              { from: 'kf', to: 'op', label: 'events + barrier', packetColor: 'amber', speed: 1.7 },
              { from: 'op', to: 's3', label: 'async snapshot', packetColor: 'purple', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'checkpointed stream state', tone: 'purple' }],
          },
        },
      ],
    },
  ],
};

export const MODULE_07_SECURITY = {
  id: 'mod-07-security',
  number: '07',
  title: 'Security & Enterprise',
  track: 'hld',
  lessons: [
    {
      id: 'authentication',
      title: 'Authentication (JWT, OAuth 2.0, OIDC)',
      subtitle: 'Stateful Session Cookies vs Stateless JWTs, Refresh Token Rotation, OAuth 2.0 + PKCE, and Enterprise SSO.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Google', 'Okta', 'Amazon'],
      tags: ['jwt', 'oauth2', 'pkce', 'oidc', 'sso', 'session cookie', 'refresh token', 'entra id'],
      objectives: [
        'Compare Session Cookies vs JWTs (including the JWT instant-revocation trap!)',
        'Trace OAuth 2.0 Authorization Code + PKCE and OpenID Connect (OIDC)',
        'Mitigate XSS/CSRF using HttpOnly, Secure, SameSite cookies and short-lived Access Tokens',
      ],
      steps: [
        {
          shortLabel: 'OAuth2 + PKCE',
          stage: 'SOLUTION',
          title: 'Short-lived Access JWT (15m) + Rotating Refresh Token',
          body: [
            'A **JWT** (`Header.Payload.Signature`) is cryptographically signed (RS256/ES256) so any microservice verifies identity locally with zero DB hits. **Trap**: You cannot easily revoke a stolen stateless JWT before it expires!',
            '**Production Gold Standard**: Issue a **15-minute Access JWT** + a stateful **Refresh Token** stored in an `HttpOnly, Secure, SameSite=Lax` cookie with **Refresh Token Rotation** (if a stolen refresh token is reused, revoke the entire token family immediately!).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Never store sensitive secrets in a JWT payload — it is Base64-encoded, NOT encrypted! And never put long-lived JWTs in `localStorage` where XSS scripts can exfiltrate them.',
          },
          scene: {
            hud: [
              { label: 'ACCESS JWT', value: '15 min (RS256)', status: 'good' },
              { label: 'REFRESH TOKEN', value: 'HttpOnly + Rotate', status: 'good' },
              { label: 'FLOW', value: 'Auth Code + PKCE', status: 'good' },
              { label: 'IDENTITY', value: 'OIDC / Entra ID', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 105, y: 215, label: 'Client App', sublabel: 'PKCE Verifier', tone: 'slate' },
              { id: 'idp', type: 'hex', x: 365, y: 115, label: 'IdP (OIDC)', sublabel: 'Entra / Auth0', tone: 'purple', badge: 'signs RS256', badgeTone: 'purple' },
              { id: 'gw', type: 'hex', x: 365, y: 310, label: 'API Gateway', sublabel: 'Verifies JWKS', tone: 'green', badge: 'local 0.1ms', badgeTone: 'green' },
              { id: 'api', type: 'hex', x: 635, y: 310, label: 'Backend Svc', sublabel: 'Trusted Claims', tone: 'blue' },
            ],
            edges: [
              { from: 'c', to: 'idp', label: '1. login + PKCE → JWT', packetColor: 'purple', bidirectional: true, speed: 1.9 },
              { from: 'c', to: 'gw', label: '2. Bearer Access JWT', packetColor: 'green', speed: 1.6 },
              { from: 'idp', to: 'gw', label: 'public JWKS keys', packetColor: 'amber', dashed: true, speed: 2.8 },
              { from: 'gw', to: 'api', label: 'x-user-id', packetColor: 'blue', speed: 1.6 },
            ],
            legend: [
              { label: 'OIDC token issuance', tone: 'purple' },
              { label: 'verified API request', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Revocation',
          stage: 'TECHNIQUE',
          title: 'Refresh Token Rotation & Emergency Session Revocation',
          body: [
            'When an employee leaves or a laptop is stolen, waiting 15 minutes for a JWT to expire may be too long for high-security admin routes.',
            'Maintain a tiny Redis **Revocation Blocklist** (keyed by `jti` with 15-minute TTL) for emergency logouts, AND rotate the Refresh Token on every refresh so reuse of a stolen token immediately revokes the entire session family!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Distinguishing **Session Cookies** (instant revoke, stateful Redis lookup) vs **Short Access JWT + Rotating Refresh Cookie** (stateless edge verify + safe revoke) nails every Big Tech security follow-up.',
          },
          scene: {
            hud: [
              { label: 'STOLEN REFRESH', value: 'Reuse Detected!', status: 'bad' },
              { label: 'RESPONSE', value: 'Revoke Family ✓', status: 'good' },
              { label: 'JTI BLOCKLIST', value: 'Redis 15m TTL', status: 'info' },
              { label: 'XSS GUARD', value: 'HttpOnly Cookie', status: 'good' },
            ],
            nodes: [
              { id: 'atk', type: 'users', x: 120, y: 215, label: 'Stolen Token', sublabel: 'Replayed rt_v1', tone: 'coral' },
              { id: 'auth', type: 'hex', x: 380, y: 215, label: 'Auth Server', sublabel: 'Detects Reuse!', tone: 'amber', badge: 'family revoked', badgeTone: 'rose' },
              { id: 'rd', type: 'cache', x: 635, y: 215, label: 'Revocation Set', sublabel: 'Blocks all tokens', tone: 'green' },
            ],
            edges: [
              { from: 'atk', to: 'auth', label: 'old rt_v1', packetColor: 'coral', speed: 1.8 },
              { from: 'auth', to: 'rd', label: 'revoke family_id', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'refresh-reuse defense', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'authorization',
      title: 'Authorization (RBAC, ABAC, Zanzibar)',
      subtitle: 'Role-Based (RBAC), Attribute-Based (ABAC), and Relationship-Based (Google Zanzibar / ReBAC) permissions.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Google', 'Microsoft', 'GitHub', 'Notion'],
      tags: ['rbac', 'abac', 'rebac', 'zanzibar', 'spicedb', 'acl', 'iam'],
      objectives: [
        'Differentiate AuthN (who you are) from AuthZ (what you can do)',
        'Scale from RBAC/ABAC to Google Zanzibar ReBAC for nested Docs/Drive sharing',
        'Avoid stale permission bugs with Zanzibar Zookies (consistency tokens)',
      ],
      steps: [
        {
          shortLabel: 'RBAC → Zanzibar',
          stage: 'TECHNIQUE',
          title: 'How Google Drive & Microsoft 365 evaluate billions of permissions in < 10 ms',
          body: [
            '**RBAC** assigns static roles (`Admin`, `Editor`). **ABAC** adds policy rules (`if user.dept == doc.dept && time < 6pm`). Neither models nested sharing graphs cleanly ("Alice is in Engineering → Engineering can edit Folder Q4 → Doc X is inside Folder Q4").',
            '**Google Zanzibar (ReBAC)** stores relation tuples (`doc:X#parent@folder:Q4`, `folder:Q4#editor@group:eng#member`) and traverses the graph with distributed caching + **Zookies** to prevent the "New Enemy" stale-revocation vulnerability!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'When designing Google Drive, OneDrive, Notion, or GitHub at Microsoft/Google, proposing a dedicated **Zanzibar-style ReBAC tuple graph** immediately elevates your design to Staff level.',
          },
          scene: {
            hud: [
              { label: 'SIMPLE APPS', value: 'RBAC / ABAC', status: 'info' },
              { label: 'DOCS / DRIVE', value: 'Zanzibar ReBAC', status: 'good' },
              { label: 'CHECK P99', value: '< 10 ms', status: 'good' },
              { label: 'STALE GUARD', value: 'Zookie Token', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 110, y: 215, label: 'Alice', sublabel: 'Can edit Doc X?', tone: 'slate' },
              { id: 'z', type: 'hex', x: 350, y: 215, label: 'AuthZ Engine', sublabel: 'Zanzibar / SpiceDB', tone: 'purple', badge: 'Check(Alice, edit, X)', badgeTone: 'purple' },
              { id: 'g', type: 'db', x: 625, y: 125, label: 'Tuple Graph', sublabel: 'Alice→Eng→Dir→Doc', tone: 'green', badge: 'ALLOW ✓', badgeTone: 'green' },
              { id: 'c', type: 'cache', x: 625, y: 305, label: 'Leopard Cache', sublabel: 'Flattened Groups', tone: 'blue' },
            ],
            edges: [
              { from: 'u', to: 'z', label: 'check()', packetColor: 'purple', bidirectional: true, speed: 1.7 },
              { from: 'z', to: 'g', label: 'graph walk', packetColor: 'green', speed: 1.7 },
              { from: 'z', to: 'c', label: 'cached membership', packetColor: 'blue', bidirectional: true, speed: 1.5 },
            ],
            legend: [{ label: 'ReBAC graph authorization', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Zookie Guard',
          stage: 'PROBLEM',
          title: 'Preventing the "New Enemy" Stale-Permission Vulnerability',
          body: [
            'Suppose Alice removes Bob from `Doc X` at `t=10`, then writes secret salary data into `Doc X` at `t=11`. If Bob reads from a lagging AuthZ replica still at `t=9`, he reads the brand-new secret even though he was ALREADY removed!',
            'Google Zanzibar solves this with a **Zookie** (an opaque timestamp consistency token saved on the Doc): AuthZ refuses to evaluate any check using a snapshot older than the Doc’s Zookie!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Security > Speed when permissions shrink: a Zookie guarantees causal consistency between a document edit and its latest ACL revocation.',
          },
          scene: {
            hud: [
              { label: 'DOC ZOOKIE', value: 't ≥ 11 Required', status: 'info' },
              { label: 'STALE REPLICA', value: 't = 9 Bypassed', status: 'warn' },
              { label: 'BOB CHECK', value: 'DENY (403) ✓', status: 'good' },
              { label: 'NEW ENEMY BUG', value: 'Prevented ✓', status: 'good' },
            ],
            nodes: [
              { id: 'bob', type: 'users', x: 115, y: 215, label: 'Bob (Revoked)', sublabel: 'Reads Doc @ t=11', tone: 'coral' },
              { id: 'chk', type: 'hex', x: 380, y: 215, label: 'Zanzibar Check', sublabel: 'Min TS = Zookie(11)', tone: 'purple', badge: 'causal fence', badgeTone: 'purple' },
              { id: 'fresh', type: 'db', x: 640, y: 215, label: 'Fresh Snapshot', sublabel: 't = 11 → DENY', tone: 'green', badge: '403 Blocked ✓', badgeTone: 'green' },
            ],
            edges: [
              { from: 'bob', to: 'chk', label: 'GET Doc X', packetColor: 'coral', speed: 1.8 },
              { from: 'chk', to: 'fresh', label: 'eval @ t≥11', packetColor: 'green', bidirectional: true, speed: 1.7 },
            ],
            legend: [{ label: 'zookie-fenced permission check', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'encryption',
      title: 'Encryption, KMS & Multi-Tenancy',
      subtitle: 'TLS + Envelope Encryption (DEK/KEK), Secret Rotation, and Microsoft Azure Multi-Tenant Isolation Tiers.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Amazon', 'Google', 'Salesforce'],
      tags: ['kms', 'envelope encryption', 'multi-tenancy', 'silo', 'pool', 'gdpr', 'azure key vault', 'zero trust'],
      objectives: [
        'Use Envelope Encryption (fast local DEK encrypted by KMS KEK) for at-rest security',
        'Design Multi-Tenant SaaS isolation: Pool (shared DB + RLS) vs Bridge vs Silo (dedicated DB)',
        'Satisfy Enterprise GDPR/HIPAA compliance, data residency, and Customer-Managed Keys (CMK)',
      ],
      steps: [
        {
          shortLabel: 'Envelope KMS',
          stage: 'TECHNIQUE',
          title: 'Envelope Encryption: Encrypt data locally with DEK, wrap DEK with KMS KEK',
          body: [
            'You cannot send 10 GB files across the network to AWS KMS / Azure Key Vault to encrypt them. Instead, generate a local symmetric **AES-256 Data Encryption Key (DEK)** to encrypt the payload locally in microseconds, then ask KMS to encrypt ONLY the 32-byte DEK using the master **Key Encryption Key (KEK)**.',
            'Store `(ciphertext + encrypted_DEK)` together! Enterprise customers can even supply a **Customer-Managed Key (CMK / BYOK)** to cryptographically shred all their data instantaneously.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Microsoft L62/L63 interviewers LOVE enterprise cloud constraints: **Multi-Tenancy Isolation (Pool vs Silo)**, **Data Residency (EU data stays in EU)**, **Row-Level Security**, and **KMS Envelope Encryption**.',
          },
          scene: {
            hud: [
              { label: 'IN TRANSIT', value: 'TLS 1.3 + mTLS', status: 'good' },
              { label: 'AT REST', value: 'AES-256 Envelope', status: 'good' },
              { label: 'SMB TENANTS', value: 'Pool + RLS', status: 'info' },
              { label: 'BANKS / GOV', value: 'Silo + CMK', status: 'good' },
            ],
            nodes: [
              { id: 'kms', type: 'hex', x: 380, y: 80, label: 'KMS / Key Vault', sublabel: 'HSM Master KEK', tone: 'purple', badge: 'never leaves HSM', badgeTone: 'purple' },
              { id: 'pool', type: 'db', x: 185, y: 270, label: 'Pool Tier (SMB)', sublabel: 'Shared DB + RLS', tone: 'blue', badge: 'cost optimal', badgeTone: 'blue' },
              { id: 'silo', type: 'db', x: 575, y: 270, label: 'Silo Tier (Bank)', sublabel: 'Dedicated DB + CMK', tone: 'green', badge: 'strict compliance', badgeTone: 'green' },
            ],
            edges: [
              { from: 'kms', to: 'pool', label: 'wrap DEK', packetColor: 'purple', dashed: true, speed: 2.2 },
              { from: 'kms', to: 'silo', label: 'customer BYOK', packetColor: 'green', bidirectional: true, speed: 1.9 },
            ],
            legend: [
              { label: 'HSM-backed envelope key wrap', tone: 'purple' },
              { label: 'enterprise BYOK silo', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Zero Trust',
          stage: 'SOLUTION',
          title: 'Zero Trust + Automated Secret Rotation + Data Residency',
          body: [
            'Never trust a request merely because it came from inside your VPC! **Zero Trust** authenticates every service-to-service hop with short-lived **mTLS workload identities (SPIFFE/Managed Identity)** and rotates DB credentials automatically without restarts.',
            'For global SaaS (Microsoft 365 / Azure), pin EU tenants’ storage, backups, and search indexes strictly inside **EU regions (Data Residency)** to satisfy GDPR compliance.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'No static long-lived API keys in `.env` files! Use **Cloud Workload Identity (OIDC / Azure Managed Identity)** to mint ephemeral 1-hour credentials on demand.',
          },
          scene: {
            hud: [
              { label: 'NETWORK MODEL', value: 'Zero Trust mTLS', status: 'good' },
              { label: 'SECRETS', value: 'Auto-Rotated', status: 'good' },
              { label: 'EU TENANTS', value: 'Pinned EU-West', status: 'good' },
              { label: 'COMPLIANCE', value: 'GDPR · SOC2 · HIPAA', status: 'info' },
            ],
            nodes: [
              { id: 'id', type: 'hex', x: 145, y: 215, label: 'Managed Identity', sublabel: '1-hr Short Token', tone: 'green' },
              { id: 'eu', type: 'db', x: 425, y: 125, label: 'EU Tenant Pod', sublabel: 'GDPR Pinned', tone: 'blue' },
              { id: 'us', type: 'db', x: 425, y: 305, label: 'US Tenant Pod', sublabel: 'HIPAA Pinned', tone: 'purple' },
              { id: 'aud', type: 'queue', x: 660, y: 215, label: 'Immutable Audit', sublabel: 'WORM Log', tone: 'amber' },
            ],
            edges: [
              { from: 'id', to: 'eu', label: 'mTLS auth', packetColor: 'blue', speed: 1.7 },
              { from: 'id', to: 'us', label: 'mTLS auth', packetColor: 'purple', speed: 1.7 },
              { from: 'eu', to: 'aud', label: 'access trail', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'us', to: 'aud', label: 'access trail', packetColor: 'amber', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'zero-trust audited isolation', tone: 'green' }],
          },
        },
      ],
    },
  ],
};

export const MODULE_08_SHIPPING = {
  id: 'mod-08-shipping',
  number: '08',
  title: 'Shipping & DevOps',
  track: 'hld',
  lessons: [
    {
      id: 'testing',
      title: 'Testing, Load & Chaos Engineering',
      subtitle: 'Testing pyramid, consumer-driven contracts, shadow traffic, soak/load testing, and Netflix Chaos Monkey.',
      duration: '7 min',
      level: 'Beginner',
      companies: ['Netflix', 'Amazon', 'Microsoft', 'Google'],
      tags: ['chaos engineering', 'load testing', 'contract testing', 'shadow traffic', 'game day'],
      objectives: [
        'Validate production readiness with Load, Spike, and Soak testing (memory leaks)',
        'Test new services safely using Shadow Traffic mirroring',
        'Verify failover actually works via Chaos Engineering & Game Days',
      ],
      steps: [
        {
          shortLabel: 'Shadow & Chaos',
          stage: 'TECHNIQUE',
          title: 'If you never test failover in production, failover is broken',
          body: [
            'Unit and integration tests catch logic bugs, NOT p99 connection-pool exhaustion or broken AZ failover. **Shadow Traffic** asynchronously mirrors real production reads to a new v2 service and compares diffs with zero user risk.',
            '**Chaos Engineering** (Netflix Chaos Monkey / Azure Chaos Studio) intentionally kills pods, injects 300 ms latency, or blacks out an Availability Zone during business hours to prove automated recovery works!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Run **Soak Tests** (sustained 12-hour traffic) to uncover slow memory leaks and file-descriptor exhaustion that 5-minute load bursts completely miss.',
          },
          scene: {
            hud: [
              { label: 'SHADOW MODE', value: '0 User Impact', status: 'good' },
              { label: 'CHAOS FAULT', value: 'AZ-b Killed', status: 'warn' },
              { label: 'AUTO-HEAL', value: '99.99% Held ✓', status: 'good' },
              { label: 'SOAK TEST', value: 'No Mem Leak', status: 'good' },
            ],
            nodes: [
              { id: 'lb', type: 'hex', x: 135, y: 215, label: 'Edge Proxy', sublabel: 'Traffic Mirror', tone: 'blue' },
              { id: 'v1', type: 'hex', x: 430, y: 120, label: 'Prod v1', sublabel: 'Serves Users', tone: 'green', badge: 'live', badgeTone: 'green' },
              { id: 'v2', type: 'hex', x: 430, y: 310, label: 'Shadow v2', sublabel: 'Async Mirror', tone: 'purple', badge: 'diff checker', badgeTone: 'purple' },
              { id: 'ch', type: 'hex', x: 660, y: 215, label: 'Chaos Monkey', sublabel: 'Fault Injection', tone: 'amber' },
            ],
            edges: [
              { from: 'lb', to: 'v1', label: '100% live', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'lb', to: 'v2', label: 'mirrored copy', packetColor: 'purple', dashed: true, speed: 2.0 },
              { from: 'ch', to: 'v1', label: 'kill 1 pod', packetColor: 'amber', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'live production', tone: 'green' },
              { label: 'shadow diff test', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Testing Pyramid',
          stage: 'SETUP',
          title: 'Unit → Contract → Load/Soak → Production Game Days',
          body: [
            '1. **Unit & Component Tests** run in milliseconds on every PR. 2. **Consumer-Driven Contract Tests (Pact)** ensure Service B never breaks Service A’s schema.',
            '3. **Load + Spike + 12h Soak Tests** prove throughput, GC health, and zero connection leaks before peak events like Prime Day!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Amazon runs mandatory **Game Days** every quarter — intentionally pulling plugs on production regions so on-call engineers practice failover calmly.',
          },
          scene: {
            hud: [
              { label: 'PR GATE', value: 'Unit + Contract', status: 'good' },
              { label: 'PRE-LAUNCH', value: 'Load + Soak', status: 'info' },
              { label: 'IN PROD', value: 'Chaos Game Day', status: 'good' },
              { label: 'CONFIDENCE', value: 'Proven Failover', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'hex', x: 140, y: 215, label: 'Unit & Pact', sublabel: 'Every PR (< 2m)', tone: 'green' },
              { id: 'l', type: 'hex', x: 390, y: 215, label: 'Load & Soak', sublabel: '3× Peak · 12 hrs', tone: 'blue' },
              { id: 'g', type: 'hex', x: 640, y: 215, label: 'Game Day', sublabel: 'Live AZ Failover', tone: 'purple' },
            ],
            edges: [
              { from: 'u', to: 'l', label: 'promote', packetColor: 'blue', speed: 1.9 },
              { from: 'l', to: 'g', label: 'prove HA', packetColor: 'purple', speed: 1.9 },
            ],
            legend: [{ label: 'reliability verification ladder', tone: 'purple' }],
          },
        },
      ],
    },

    {
      id: 'cicd',
      title: 'CI/CD, Containers & Deployments',
      subtitle: 'Docker & Kubernetes internals, immutable pipelines, Blue-Green, Canary rollouts, and Feature Flags.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Netflix', 'Microsoft', 'Google', 'Amazon'],
      tags: ['cicd', 'docker', 'kubernetes', 'canary', 'blue-green', 'feature flags', 'rollback'],
      objectives: [
        'Explain Docker isolation (namespaces, cgroups, OverlayFS) and Kubernetes Control Plane',
        'Compare Rolling, Blue-Green, and automated Canary deployments with metric rollback',
        'Decouple code deployment from feature launch using Feature Flags',
      ],
      steps: [
        {
          shortLabel: 'Canary CI/CD',
          stage: 'SOLUTION',
          title: 'Automated Canary Deployments catch regressions at 1% traffic',
          body: [
            'Modern CI/CD builds an immutable container image once (`Git → Test → Security Scan → Registry`), then deploys progressively: **Canary** shifts **1% → 5% → 25% → 100%** of traffic while automatically comparing error rates & p99 against the baseline.',
            'If error rate rises by even 0.2%, the controller rolls back in **< 10 seconds**. Pair with **Expand-and-Contract DB migrations** (never drop a column while old pods still read it!).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Always mention **Backward-Compatible Schema Migrations (Expand & Contract)** during zero-downtime deployments — dropping or renaming a column in one deploy breaks live v1 pods!',
          },
          scene: {
            hud: [
              { label: 'STRATEGY', value: 'Canary 1%→100%', status: 'good' },
              { label: 'ROLLBACK', value: 'Auto < 10s', status: 'good' },
              { label: 'ORCHESTRATOR', value: 'Kubernetes HPA', status: 'info' },
              { label: 'DB SCHEMA', value: 'Expand & Contract', status: 'good' },
            ],
            nodes: [
              { id: 'ci', type: 'hex', x: 110, y: 215, label: 'CI Pipeline', sublabel: 'Build · Scan · Sign', tone: 'purple' },
              { id: 'ing', type: 'hex', x: 345, y: 215, label: 'K8s Ingress', sublabel: '95% v1 · 5% v2', tone: 'blue' },
              { id: 'v1', type: 'hex', x: 625, y: 125, label: 'Stable v1', sublabel: '95% Traffic', tone: 'green', load: 42 },
              { id: 'v2', type: 'hex', x: 625, y: 305, label: 'Canary v2', sublabel: '5% · Auto-Judge', tone: 'amber', badge: 'metrics OK ✓', badgeTone: 'green', load: 18 },
            ],
            edges: [
              { from: 'ci', to: 'ing', label: 'immutable image', packetColor: 'purple', speed: 2.0 },
              { from: 'ing', to: 'v1', label: '95%', packetColor: 'green', speed: 1.6 },
              { from: 'ing', to: 'v2', label: '5% canary', packetColor: 'amber', speed: 2.0 },
            ],
            legend: [
              { label: 'stable fleet', tone: 'green' },
              { label: 'canary slice', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Feature Flags',
          stage: 'TECHNIQUE',
          title: 'Decouple Deploy from Release with Feature Flags + Expand-Contract DB',
          body: [
            '**Deployment** puts dark code into production safely; **Release** flips a **Feature Flag** for 1% of staff → 10% of beta users → 100% globally (instant 100 ms kill-switch without redeploying!).',
            'For DB changes, use **Expand & Contract**: 1) Add new column nullable, 2) Dual-write old + new + backfill, 3) Switch reads to new, 4) Drop old column in a later deploy!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Running `ALTER TABLE ADD COLUMN ... DEFAULT ... NOT NULL` on a 500M-row legacy MySQL table can lock writes for 20 minutes! Always verify online/non-blocking schema migrations.',
          },
          scene: {
            hud: [
              { label: 'KILL SWITCH', value: '< 100 ms Flag Off', status: 'good' },
              { label: 'DB MIGRATION', value: 'Expand & Contract', status: 'good' },
              { label: 'ZERO DOWNTIME', value: 'Backward Compat', status: 'good' },
              { label: 'ROLLBACK', value: 'Safe Anytime', status: 'good' },
            ],
            nodes: [
              { id: 'fl', type: 'hex', x: 145, y: 215, label: 'Feature Flag', sublabel: '1% → 100% Rollout', tone: 'purple' },
              { id: 'app', type: 'hex', x: 400, y: 215, label: 'Dual-Write App', sublabel: 'v1 + v2 Safe', tone: 'green' },
              { id: 'db', type: 'db', x: 645, y: 215, label: 'Zero-Lock DB', sublabel: 'old_col + new_col', tone: 'blue' },
            ],
            edges: [
              { from: 'fl', to: 'app', label: 'instant toggle', packetColor: 'purple', speed: 1.6 },
              { from: 'app', to: 'db', label: 'dual-write', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'zero-downtime progressive rollout', tone: 'green' }],
          },
        },
      ],
    },
  ],
};

export const MODULE_09_FINTECH_AI_REALWORLD = {
  id: 'mod-09-fintech-ai-realworld',
  number: '09',
  title: 'Fintech, AI & Real-World',
  track: 'hld',
  lessons: [
    {
      id: 'payments-ledger',
      title: 'Payment Systems, UPI & Double-Entry Ledger',
      subtitle: 'ByteByteGo Fintech deep dive: PSPs, Card Networks, Immutable Double-Entry Ledgers, Idempotency & Reconciliation.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Stripe', 'Amazon', 'Uber', 'Microsoft'],
      tags: ['payments', 'stripe', 'upi', 'double-entry ledger', 'reconciliation', 'idempotency', 'psp', 'fintech'],
      objectives: [
        'Trace Pay-in / Pay-out flows across Merchant, PSP (Stripe/Adyen), Card Network, and Banks',
        'Design an append-only Double-Entry Accounting Ledger (sum of debits + credits == 0)',
        'Guarantee zero double-charges and catch silent bank drift via T+1 Reconciliation',
      ],
      steps: [
        {
          shortLabel: 'Payment Flow',
          stage: 'SETUP',
          title: 'Never mutate a balance column — use an immutable Double-Entry Ledger',
          body: [
            'When Alice pays \$50 to Merchant M, **NEVER** run `UPDATE accounts SET balance = balance - 50` without an audit log! Every financial movement appends **two balanced immutable rows**: `DEBIT Alice -$50` and `CREDIT Merchant +$50` (**Double-Entry Bookkeeping** — the sum across all rows MUST always equal `0.00`).',
            'Use a strict **Payment State Machine** (`CREATED → AUTHORIZED → CAPTURED → SETTLED / FAILED`), client **Idempotency Keys**, and async **PSP Webhooks** because card authorization takes 1–3 seconds.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Store money as **integer minor units** (`5000` cents in `BIGINT` + `currency = "USD"`), NEVER IEEE-754 `float`/`double` (`0.1 + 0.2 = 0.30000000000000004`)!',
          },
          scene: {
            hud: [
              { label: 'LEDGER RULE', value: '∑(DR + CR) = 0', status: 'good' },
              { label: 'MONEY TYPE', value: 'BIGINT Cents', status: 'good' },
              { label: 'EXACTLY-ONCE', value: 'Idempotency Key', status: 'good' },
              { label: 'SAFETY NET', value: 'T+1 Reconcile', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 95, y: 215, label: 'Checkout', sublabel: 'Idem-Key UUID', tone: 'slate' },
              { id: 'pay', type: 'hex', x: 280, y: 215, label: 'Payment Svc', sublabel: 'State Machine', tone: 'blue', badge: 'strict ACID', badgeTone: 'green' },
              { id: 'psp', type: 'hex', x: 495, y: 110, label: 'PSP / UPI Switch', sublabel: 'Stripe · Visa · NPCI', tone: 'amber' },
              { id: 'led', type: 'db', x: 495, y: 315, label: 'Double-Entry DB', sublabel: 'Append-Only Ledger', tone: 'purple', badge: 'DR + CR = 0', badgeTone: 'purple' },
              { id: 'rec', type: 'hex', x: 675, y: 215, label: 'Reconciler', sublabel: 'Daily Settlement Diff', tone: 'green' },
            ],
            edges: [
              { from: 'c', to: 'pay', label: 'POST /pay', packetColor: 'blue', bidirectional: true, speed: 1.7 },
              { from: 'pay', to: 'psp', label: 'auth + capture', packetColor: 'amber', bidirectional: true, speed: 2.0 },
              { from: 'pay', to: 'led', label: 'DR -$50 / CR +$50', packetColor: 'purple', speed: 1.6 },
              { from: 'psp', to: 'rec', label: 'settlement file', packetColor: 'green', dashed: true, speed: 2.5 },
              { from: 'led', to: 'rec', label: 'internal ledger', packetColor: 'green', dashed: true, speed: 2.5 },
            ],
            legend: [
              { label: 'PSP / card clearing', tone: 'amber' },
              { label: 'immutable ledger', tone: 'purple' },
              { label: 'reconciliation audit', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Reconciliation',
          stage: 'TECHNIQUE',
          title: 'Reconciliation catches every silent distributed inconsistency',
          body: [
            'Even with perfect retries and webhooks, external banks crash, drop webhooks, or settle partial refunds 24 hours later. Every night (or hourly), the **Reconciliation Engine** compares your internal **Double-Entry Ledger** against the PSP’s **Settlement File**.',
            'Any mismatch (`internal = FAILED` while `bank = CAPTURED`) triggers automated refund/adjustment workflows or alerts Finance Ops!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Bringing up **Double-Entry Ledger + BIGINT Cents + Idempotency Key + T+1 Reconciliation** covers 100% of what Stripe, Amazon Pay, and Uber Payments interviewers grade for!',
          },
          scene: {
            hud: [
              { label: 'MATCH RATE', value: '99.998%', status: 'good' },
              { label: 'MISMATCHES', value: 'Auto-Queued', status: 'warn' },
              { label: 'PCI SCOPE', value: 'Tokenized at PSP', status: 'good' },
              { label: 'FRAUD CHECK', value: 'Pre-Auth ML', status: 'info' },
            ],
            nodes: [
              { id: 'l', type: 'db', x: 165, y: 135, label: 'Internal Ledger', sublabel: 'Postgres ACID', tone: 'purple' },
              { id: 'b', type: 'db', x: 165, y: 295, label: 'PSP Settlement', sublabel: 'SFTP / API File', tone: 'amber' },
              { id: 'diff', type: 'hex', x: 440, y: 215, label: 'Reconcile Engine', sublabel: '3-Way Match', tone: 'green', badge: 'zero drift', badgeTone: 'green' },
              { id: 'ops', type: 'hex', x: 665, y: 215, label: 'Auto-Heal / Alert', sublabel: 'Refund / Ticket', tone: 'blue' },
            ],
            edges: [
              { from: 'l', to: 'diff', label: 'tx records', packetColor: 'purple', speed: 1.9 },
              { from: 'b', to: 'diff', label: 'bank rows', packetColor: 'amber', speed: 1.9 },
              { from: 'diff', to: 'ops', label: '0.002% exceptions', packetColor: 'coral', dashed: true, speed: 2.5 },
            ],
            legend: [{ label: 'financial audit loop', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'ai-llm-rag',
      title: 'AI / LLM Serving & Production RAG',
      subtitle: 'Hybrid Search (BM25 + HNSW Vector), Reranking, Semantic Caching, KV-Cache, vLLM PagedAttention & SSE streaming.',
      duration: '12 min',
      level: 'Advanced',
      companies: ['Microsoft', 'Google', 'OpenAI', 'Meta'],
      tags: ['rag', 'llm', 'vector database', 'hnsw', 'vllm', 'pagedattention', 'kv cache', 'ai gateway', 'semantic cache'],
      objectives: [
        'Architect an enterprise Hybrid RAG pipeline (Ingestion → Chunking → BM25+Vector → Reranker)',
        'Understand LLM GPU bottlenecks: Compute-bound Prefill vs Memory-Bandwidth-bound Decode',
        'Scale serving with Continuous Batching, PagedAttention (vLLM), Semantic Caching, and SSE token streaming',
      ],
      steps: [
        {
          shortLabel: 'Hybrid RAG',
          stage: 'SOLUTION',
          title: 'Enterprise RAG: Hybrid Search (BM25 + Vector) + Cross-Encoder Reranking',
          body: [
            'Pure vector cosine search misses exact SKUs, error codes (`ERR_5041`), and acronyms; pure keyword search (BM25) misses synonyms. Production RAG runs **Hybrid Retrieval** (BM25 + Dense HNSW Vector DB merged via **Reciprocal Rank Fusion**), then re-scores top-50 candidates down to top-5 with a fast **Cross-Encoder Reranker**.',
            'Crucial Enterprise Security Rule: Pass the caller’s **ACL / Tenant Permissions** directly into the Vector DB pre-filter so users NEVER retrieve chunks from confidential docs they can’t open!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning **Document-level ACL filtering before RAG context injection** + **Semantic Caching** (Redis vector similarity hit > 0.96 skips the GPU entirely!) is a massive differentiator in 2026 Microsoft Copilot & Google AI interviews.',
          },
          scene: {
            hud: [
              { label: 'RETRIEVAL', value: 'BM25 + HNSW RRF', status: 'good' },
              { label: 'RERANK', value: 'Top 50 → Top 5', status: 'good' },
              { label: 'SECURITY', value: 'ACL Pre-Filter', status: 'good' },
              { label: 'STREAMING', value: 'SSE Tokens', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 95, y: 215, label: 'User Prompt', sublabel: 'SSE Stream', tone: 'slate' },
              { id: 'gw', type: 'hex', x: 265, y: 215, label: 'AI Gateway', sublabel: 'PII · Token RL · Cache', tone: 'green', badge: 'guardrails', badgeTone: 'green' },
              { id: 'vec', type: 'db', x: 470, y: 110, label: 'Hybrid Index', sublabel: 'BM25 + HNSW + ACL', tone: 'purple' },
              { id: 'rr', type: 'hex', x: 470, y: 315, label: 'Reranker', sublabel: 'Cross-Encoder Top-5', tone: 'amber' },
              { id: 'gpu', type: 'hex', x: 665, y: 215, label: 'vLLM GPU Fleet', sublabel: 'PagedAttention', tone: 'blue', badge: 'KV-Cache', badgeTone: 'blue', load: 72 },
            ],
            edges: [
              { from: 'u', to: 'gw', label: 'query / SSE', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'gw', to: 'vec', label: 'top-50 + ACL', packetColor: 'purple', bidirectional: true, speed: 1.7 },
              { from: 'vec', to: 'rr', label: 'rerank', packetColor: 'amber', speed: 1.8 },
              { from: 'rr', to: 'gpu', label: 'grounded prompt', packetColor: 'blue', speed: 1.6 },
            ],
            legend: [
              { label: 'SSE token stream', tone: 'green' },
              { label: 'hybrid retrieval', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'vLLM GPU Scale',
          stage: 'TECHNIQUE',
          title: 'Prefill vs Decode, KV-Cache & Continuous Batching (vLLM)',
          body: [
            'LLM inference has two radically different phases: **Prefill** (processing the entire prompt in parallel — **GPU compute-bound**, sets **TTFT** Time-To-First-Token) and **Decode** (generating 1 token at a time using cached attention states — **GPU VRAM bandwidth-bound**, sets **TPOT**).',
            '**vLLM PagedAttention** stores the **KV-Cache** in non-contiguous OS-style virtual memory pages, cutting VRAM waste by 60%+, while **Continuous Batching** swaps finished requests out mid-batch to boost GPU throughput 10–20×!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Measure LLM serving with **TTFT** (Time to First Token, < 500 ms), **TPOT** (Time Per Output Token, < 30 ms), and **Token-per-Minute (TPM)** rate limits — not just raw RPS!',
          },
          scene: {
            hud: [
              { label: 'TTFT (PREFILL)', value: '320 ms', status: 'good' },
              { label: 'TPOT (DECODE)', value: '18 ms/tok', status: 'good' },
              { label: 'VRAM EFFICIENCY', value: 'PagedAttention', status: 'good' },
              { label: 'BATCHING', value: 'Continuous', status: 'good' },
            ],
            nodes: [
              { id: 'sc', type: 'cache', x: 145, y: 215, label: 'Semantic Cache', sublabel: 'Skip GPU on 0.96+', tone: 'green' },
              { id: 'pre', type: 'hex', x: 390, y: 125, label: 'Prefill Pool', sublabel: 'Compute-Bound', tone: 'amber', load: 78 },
              { id: 'dec', type: 'hex', x: 390, y: 305, label: 'Decode Pool', sublabel: 'VRAM BW-Bound', tone: 'blue', load: 68 },
              { id: 'kv', type: 'db', x: 645, y: 215, label: 'Paged KV-Cache', sublabel: 'Prefix Sharing', tone: 'purple', badge: 'zero fragmentation', badgeTone: 'purple' },
            ],
            edges: [
              { from: 'sc', to: 'pre', label: 'cache miss', packetColor: 'amber', speed: 1.7 },
              { from: 'pre', to: 'kv', label: 'write KV pages', packetColor: 'purple', speed: 1.6 },
              { from: 'kv', to: 'dec', label: 'stream tokens', packetColor: 'blue', bidirectional: true, speed: 1.4 },
            ],
            legend: [{ label: 'disaggregated prefill / decode', tone: 'blue' }],
          },
        },
      ],
    },

    {
      id: 'realworld-discord-hotstar',
      title: 'Case Study: Discord & Disney+ Hotstar',
      subtitle: 'ByteByteGo 101 classics: Storing trillions of messages in ScyllaDB & scaling live cricket to 50M+ concurrent users.',
      duration: '10 min',
      level: 'Advanced',
      companies: ['Discord', 'Disney+ Hotstar', 'Meta'],
      tags: ['discord', 'scylladb', 'request coalescing', 'hotstar', '50m concurrent', 'live streaming', 'bytebytego'],
      objectives: [
        'Trace Discord’s journey from MongoDB → Cassandra → ScyllaDB + Rust Data Services',
        'Apply Request Coalescing to collapse 100k simultaneous identical channel reads into 1 DB query',
        'Learn Hotstar’s Ladder-Based Pre-Scaling for 50M+ simultaneous World Cup viewers',
      ],
      steps: [
        {
          shortLabel: 'Discord Trillions',
          stage: 'SOLUTION',
          title: 'How Discord stores Trillions of messages with sub-20ms p99',
          body: [
            'Discord outgrew **MongoDB** (RAM index limits), moved to **Cassandra** (177 nodes), and hit massive **JVM Garbage Collection pauses** + hot-partition storms when 100,000 members opened an announcement channel at the exact same second.',
            'Their two legendary wins: 1) Migrated to **ScyllaDB** (C++ Cassandra rewrite, shard-per-core, zero JVM GC pauses — slashing 177 nodes down to **72 nodes** and p99 from 40–125 ms to **15 ms**!), 2) Built **Rust Data Services** with **Request Coalescing** (100k concurrent reads for Channel #1 collapse into **1** DB query!).',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Partition Key lesson from Discord: Partitioning chat purely by `channel_id` creates unbounded giant partitions! Discord uses a composite partition key `(channel_id, 10_day_bucket)` so every partition stays bounded and fast.',
          },
          scene: {
            hud: [
              { label: 'MESSAGES', value: 'Trillions+', status: 'info' },
              { label: 'DB NODES', value: '177 → 72 Scylla', status: 'good' },
              { label: 'P99 READS', value: '125ms → 15ms', status: 'good' },
              { label: 'HOT CHANNEL', value: 'Rust Coalesced', status: 'good' },
            ],
            nodes: [
              { id: 'u', type: 'users', x: 105, y: 215, label: '100k Users', sublabel: 'Same Channel!', tone: 'slate' },
              { id: 'rs', type: 'hex', x: 365, y: 215, label: 'Rust Data Svc', sublabel: 'Request Coalescing', tone: 'green', badge: '100k → 1 query', badgeTone: 'green', load: 32 },
              { id: 'sc', type: 'db', x: 635, y: 215, label: 'ScyllaDB (C++)', sublabel: '(chan_id, bucket)', tone: 'purple', badge: 'zero GC pause', badgeTone: 'purple', load: 28 },
            ],
            edges: [
              { from: 'u', to: 'rs', label: '100k reads', packetColor: 'coral', speed: 1.4, packetCount: 3 },
              { from: 'rs', to: 'sc', label: '1 single fetch!', packetColor: 'green', bidirectional: true, speed: 1.7, packetCount: 1 },
            ],
            legend: [
              { label: 'thundering channel open', tone: 'coral' },
              { label: 'coalesced ScyllaDB query', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Hotstar 50M',
          stage: 'TECHNIQUE',
          title: 'How Disney+ Hotstar handles 50M+ concurrent live sports viewers',
          body: [
            'When a wicket falls in an India vs Pakistan cricket match, **10 Million users join within 60 seconds** — far too fast for reactive CPU autoscaling (EC2/K8s nodes take 3–5 minutes to boot!).',
            'Hotstar’s solution: **Ladder-Based Pre-Warming** (pre-provision fleet buffers ahead of predicted match milestones), **Multi-CDN dynamic steering** (Akamai + CloudFront), **Jittered Client Polling**, and **Graceful Shedding** (disable social emojis/feeds automatically if core video playback is threatened).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Reactive autoscaling FAILS on sudden step-function spikes (Super Bowl, IPL, Taylor Swift tickets). Always combine **Pre-Warming**, **Virtual Waiting Rooms**, and **Feature Degradation Kill-Switches**!',
          },
          scene: {
            hud: [
              { label: 'CONCURRENT', value: '50M+ Viewers', status: 'info' },
              { label: 'SCALING', value: 'Pre-Warmed Ladders', status: 'good' },
              { label: 'VIDEO DELIVERY', value: 'Multi-CDN HLS', status: 'good' },
              { label: 'OVERLOAD PLAN', value: 'Shed Non-Core UI', status: 'good' },
            ],
            nodes: [
              { id: 'v', type: 'users', x: 105, y: 215, label: '50M Viewers', sublabel: '+10M in 60s', tone: 'slate' },
              { id: 'cdn', type: 'hex', x: 350, y: 120, label: 'Multi-CDN', sublabel: 'HLS 4s Chunks', tone: 'green', badge: '99.9% edge', badgeTone: 'green' },
              { id: 'api', type: 'hex', x: 350, y: 310, label: 'Pre-Warmed API', sublabel: 'Ladder Pool', tone: 'blue', load: 55 },
              { id: 'deg', type: 'hex', x: 635, y: 310, label: 'Kill-Switch', sublabel: 'Shed Chat/Emojis', tone: 'amber', badge: 'protect video', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'v', to: 'cdn', label: 'ABR video', packetColor: 'green', speed: 1.5, packetCount: 3 },
              { from: 'v', to: 'api', label: 'jittered heartbeat', packetColor: 'blue', speed: 2.0 },
              { from: 'api', to: 'deg', label: 'load > 80%', packetColor: 'amber', dashed: true, speed: 2.4 },
            ],
            legend: [{ label: 'multi-CDN live edge', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'realworld-prime-netflix-so',
      title: 'Case Study: Prime Video, Netflix & Stack Overflow',
      subtitle: 'ByteByteGo 101 architecture lessons: When Monoliths beat Serverless (-90% cost), Open Connect CDN, and Vertical Mastery.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Netflix', 'Stack Overflow'],
      tags: ['prime video', 'netflix', 'open connect', 'stack overflow', 'serverless', 'cost optimization', 'bytebytego'],
      objectives: [
        'Explain why Amazon Prime Video moved from Lambda/Step Functions to a Monolith (-90% cost)',
        'Understand Netflix’s Control Plane (AWS) vs Data Plane (ISP Open Connect Appliances)',
        'Recognize when vertical scaling + caching (Stack Overflow) beats distributed sprawl',
      ],
      steps: [
        {
          shortLabel: 'Prime -90%',
          stage: 'INSIGHT',
          title: 'Amazon Prime Video: Moving FROM Serverless TO a Monolith cut costs 90%',
          body: [
            'Prime Video’s audio/video quality monitor originally chained **AWS Step Functions + Lambdas**, writing every decoded video frame to **S3** between stages. At scale, S3 I/O and Step Function state transitions blew past budget and throughput limits!',
            'They packed all stages into **one single ECS container process** passing frames in shared RAM instead of S3 — **cutting costs by 90%** and increasing throughput dramatically! Architecture isn’t dogma; measure data-movement bottlenecks.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Serialization + network/S3 round trips between micro-steps dominate high-bandwidth media workloads. Keep tight inner loops in-process!',
          },
          scene: {
            hud: [
              { label: 'BEFORE', value: 'Step Fn + S3 Hops', status: 'bad' },
              { label: 'AFTER', value: 'Single ECS Process', status: 'good' },
              { label: 'COST DROP', value: '-90% Savings!', status: 'good' },
              { label: 'FRAME TRANSFER', value: 'In-Memory RAM', status: 'good' },
            ],
            nodes: [
              { id: 'old', type: 'hex', x: 185, y: 215, label: 'Old Serverless', sublabel: 'Lambda → S3 → Lambda', tone: 'coral', badge: 'high S3 cost', badgeTone: 'rose', dim: true },
              { id: 'new', type: 'hex', x: 565, y: 215, label: 'Unified Monolith', sublabel: 'Shared RAM Pipeline', tone: 'green', badge: '-90% cost ✓', badgeTone: 'green', load: 45 },
            ],
            edges: [
              { from: 'old', to: 'new', label: 'consolidate hot loop', packetColor: 'green', speed: 2.0 },
            ],
            legend: [{ label: 'data-locality optimization', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Netflix & SO',
          stage: 'SOLUTION',
          title: 'Netflix Open Connect (Control vs Data Plane) & Stack Overflow Simplicity',
          body: [
            '**Netflix** splits cleanly into two worlds: **AWS Control Plane** (login, recommendations, search, billing) and **Open Connect Data Plane** (custom NVMe cache boxes placed *physically inside local ISPs*, pre-loaded overnight during off-peak hours so 4K streams travel 1 hop!).',
            '**Stack Overflow** proved the flip side: with disciplined C# code, zero ORM bloat, aggressive Redis caching, and 2 beefy SQL Server boxes, **just 9 web servers** handled over 1 billion monthly page views at 10% CPU!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Separating **Control Plane** (API/metadata/billing) from **Data Plane** (high-throughput video/files/packets) is one of the cleanest architectural abstractions you can draw on any Big Tech whiteboard.',
          },
          scene: {
            hud: [
              { label: 'NETFLIX CTRL', value: 'AWS Microservices', status: 'info' },
              { label: 'NETFLIX DATA', value: 'ISP Open Connect', status: 'good' },
              { label: 'STACK OVERFLOW', value: '9 Web + 2 SQL', status: 'good' },
              { label: 'CORE LESSON', value: 'Right-Size Complexity', status: 'good' },
            ],
            nodes: [
              { id: 'tv', type: 'users', x: 115, y: 215, label: 'Smart TV', sublabel: 'Press Play', tone: 'slate' },
              { id: 'aws', type: 'hex', x: 430, y: 115, label: 'AWS Control Plane', sublabel: 'Auth · Recs · URL', tone: 'blue' },
              { id: 'oca', type: 'cache', x: 430, y: 315, label: 'Open Connect Box', sublabel: 'Inside Your ISP!', tone: 'green', badge: '4K in 5 ms', badgeTone: 'green' },
            ],
            edges: [
              { from: 'tv', to: 'aws', label: '1. metadata (10 KB)', packetColor: 'blue', bidirectional: true, speed: 2.0 },
              { from: 'tv', to: 'oca', label: '2. 4K video stream (GBs)', packetColor: 'green', speed: 1.4, packetCount: 3 },
            ],
            legend: [
              { label: 'control plane API', tone: 'blue' },
              { label: 'ISP-local video data plane', tone: 'green' },
            ],
          },
        },
      ],
    },
  ],
};

export const MODULES_06_09 = [
  MODULE_06_ARCHITECTURE,
  MODULE_07_SECURITY,
  MODULE_08_SHIPPING,
  MODULE_09_FINTECH_AI_REALWORLD,
];
