# System Design Complete Guide

[Open the published guide](https://system-design-guide.yashwant938.workers.dev)

Learn to design a service, estimate what it needs, explain its guarantees, and recover it when something fails. The guide pairs high-level architecture (HLD) with low-level design (LLD), machine coding, and production case studies.

## Where to start

- **First system design?** Open **Learn → Design your first service**. Follow a request from the network to storage, estimate a workload in the lab, then sketch a URL shortener.
- **Preparing for a design review?** Open **Practice → Design Reviews**. Pick a case, write down your assumptions, show your arithmetic, and describe how the system fails. Compare your answer with the worked design and mark the evidence you included.
- **Looking up a specific topic?** Use **Ctrl/Cmd + K**, expand a module on the course map, or follow a path on distributed correctness, operations, data platforms, or machine coding. The map also holds your bookmarked lessons and resumes your last lesson step.

The original course draws inspiration from [designed-to-scale](https://designed-to-scale.vercel.app/#/cdn/1), [ByteByteGo](https://github.com/ByteByteGoHq/system-design-101), [Karan Pratap Singh’s system design guide](https://github.com/karanpratapsingh/system-design), and [Hello Interview](https://www.hellointerview.com/learn/system-design/in-the-wild/shopify-inventory-reservations). The advanced modules link to original papers, engineering reports, and documentation inside each lesson.

---

## Curriculum

### Learn · 17 modules and 116 interactive lessons

Each lesson uses a narrated architecture diagram. Use the arrow keys to step through it, **R** to replay, and **Space** to pause. A link such as `#/logical-clocks/2` opens one exact step. Worked examples include trade-offs, capacity estimates, failure analysis, or reference code as appropriate to the lesson.

| # | Module | Track | Lessons | Key Highlights |
| :--- | :--- | :--- | :---: | :--- |
| **01** | **Foundations** | HLD | 4 | DNS/TCP/TLS 1.3/HTTP3 QUIC, **OSI 7-Layer + IPv4/IPv6/NAT + TCP vs UDP**, Tail Latency (p99) & Hedged RPCs, Napkin Math |
| **02** | **Scaling** | HLD | 7 | Vertical vs Horizontal, L4/L7 Load Balancing (P2C), **Forward vs Reverse Proxy & BFF**, **Clustering & STONITH Fencing**, Stateless, Caching (Stampede/Bloom), **Content Delivery (CDN)** |
| **03** | **Data & Storage** | HLD | 16 | SQL vs NoSQL, **Block/File/Object & RAID/Erasure Coding**, **Normalization (1NF–BCNF) & DB Federation**, **ACID vs BASE**, B+ Tree / Spatial Indexes (**Geohash Edge Bug / Quadtree / H3**), B-Tree vs LSM-Tree, **Probabilistic Structures (Bloom, HyperLogLog 12KB, SkipList)**, Replication & Quorum, Sharding, Consistent Hashing, Snowflake IDs, CAP & PACELC, Raft Consensus & Fencing Tokens, MVCC & Isolation, Object Storage |
| **04** | **Communication** | HLD | 4 | REST/gRPC/GraphQL/Webhooks, Message Queues & DLQ, Kafka Internals (ISR/Zero-Copy), Polling/SSE/WebSockets/WebRTC |
| **05** | **Reliability** | HLD | 4 | Active-Active DR & Cell Architecture, 5 Rate Limiting Algorithms (Redis Lua), Circuit Breakers & Full Jitter, OpenTelemetry & SLO Error Budgets |
| **06** | **Architecture** | HLD | 6 | Modular Monolith vs Microservices & Strangler Fig, **N-Tier & ESB vs Event-Driven Architecture (EDA)**, **CQRS & Event Sourcing (Snapshots + Upcasting)**, Service Mesh (Envoy mTLS), Sagas & Transactional Outbox CDC, Flink/Kappa Stream Processing |
| **07** | **Security & Enterprise** | HLD | 4 | OAuth 2.0 + PKCE / OIDC / JWT Rotation, **SSL/TLS 1.3 Handshake (ECDHE/AES-GCM), PKI & mTLS**, RBAC / ABAC / Google Zanzibar ReBAC, KMS Envelope Encryption & Multi-Tenant Isolation (Microsoft L62/L63) |
| **08** | **Shipping & DevOps** | HLD | 3 | Testing Pyramid, Shadow Traffic & Chaos Engineering; **VMs vs Docker Containers vs Firecracker MicroVMs vs Serverless**; CI/CD, K8s, Canary & Expand-Contract DB Migrations |
| **09** | **Fintech, AI & Real-World** | HLD | 4 | Payment Systems, UPI & Immutable Double-Entry Ledger; Hybrid RAG + vLLM PagedAttention; Discord ScyllaDB & Hotstar 50M; Prime Video -90% Monolith, Netflix Open Connect & Stack Overflow |
| **10** | **Whole Systems (HLD)** | HLD | 13 | HLD/LLD Two Zoom Levels + **12 Core Systems**: TinyURL, Twitter/X News Feed, WhatsApp/Teams Chat, YouTube/Netflix, Uber H3 Dispatch, Google Autocomplete & Web Crawler, Google Docs/Loop (OT/CRDT), BookMyShow Flash Sale, DynamoDB KV Store, Dropbox/OneDrive, Distributed Rate Limiter, Datadog/Azure Monitor & Priority Notifications |
| **11** | **Advanced HLD Designs** | HLD | 10 | **Hello Interview & Staff FAANG Classics**: Ad Click Aggregator (Flink/ClickHouse/Billing), LeetCode Code Judge (Firecracker microVMs), Top-K Heavy Hitters (Count-Min Sketch), FB Live Comments (2-tier SSE Fanout Tree), Real-Time Post Search (Doc-Partitioned Inverted Index), High-Frequency Stock Exchange (LMAX Single-Thread Matching Engine), Airbnb/Hotel Booking (GiST Exclusion), DoorDash Food Delivery (3-Sided Saga + VRP), Real-Time Online Auction (Redis Lua + Soft-Close), Microsoft Teams / Zoom Video Conferencing (Cascaded SFU + Simulcast) |
| **12** | **In The Wild (Big Tech)** | HLD | 6 | **Shopify** (Moving Inventory Reservations from Redis → MySQL 8 `FOR UPDATE SKIP LOCKED` + ProxySQL Ops), **Slack** (Kafka + `JQRelay` in front of Redis Job Queues), **Figma** (Multiplayer Simplified CRDT + Fractional Indexing), **Meta** (`ZGateway` Multiplexing Proxy, TAO & Memcached Leases), **Spotify** (Exabyte Data Lake Random Access Parquet RAP), **Stripe / Uber / Netflix** (Atomic Idempotency Recovery Points, Docstore, Adaptive Concurrency Limits) |
| **13** | **LLD Core & 23 Patterns** | LLD | 4 | OOP & UML Mastery, Interactive **SOLID Bad vs Good Code Comparator**, Searchable **All 23 Gang of Four Design Patterns Explorer**, Concurrency & Deadlock Lock Ordering |
| **14** | **LLD Machine Coding** | LLD | 15 | Full UML + Clean Multi-Language Code (**Java / C++ / Python / TypeScript**): Parking Lot, Elevator LOOK Dispatcher, BookMyShow SeatLock TTL, Splitwise Debt Simplifier, LRU/LFU+TTL Cache, Rate Limiter SDK, Async Log4j Logger, Vending Machine/ATM, Chess Engine, Multi-Threaded Task Scheduler, **Amazon Locker**, **Uber Dispatch & Surge Decorator**, **In-Memory Kafka Pub/Sub Broker**, **Thread-Safe Online Auction**, and **Composite File System & Specification `find()`** |
| **15** | **Distributed Correctness** | HLD | 7 | Logical and vector clocks, session guarantees, merging concurrent updates, atomic commit, schema evolution, live shard migration, replica repair |
| **16** | **Production Engineering** | HLD | 5 | Queue recovery, point-in-time restore drills, SLO incidents, canary decisions, capacity planning and unit economics |
| **17** | **Data Platforms** | HLD | 4 | Fact grain, event-time windows, deletion across derived datasets, point-in-time features for training and serving |

### Design Lab · 7 simulators

1. **Consistent Hashing Ring Lab** — Add/remove nodes, adjust vNodes, and compare remapping % vs `hash(k) % N`.
2. **Rate Limiter Arena** — Live Token Bucket vs Fixed Window (boundary bug!) vs Sliding Window Counter burst test.
3. **LRU Eviction & Cache Stampede Lab** — O(1) Doubly-Linked List simulator + toggle Single-Flight Mutex under 50 concurrent misses.
4. **Dynamo Quorum (`W + R > N`) & 5-Node Raft Consensus Lab** — Kill/revive Raft nodes and watch majority quorums hold or halt.
5. **Back-of-the-Envelope Napkin Math Estimator** — Big Tech presets (TinyURL, Twitter, WhatsApp, YouTube, Uber, Stripe) → QPS, 5-year TB, Gbps, Cache RAM & Shards.
6. **LLD Concurrency Lab** — Live BookMyShow Seat A5 dual-user race simulator (Lock ON vs OFF + 10s TTL) + 3-Car Elevator LOOK Dispatcher.
7. **Queue Recovery** — Change the arrival rate, outage duration, worker pool, and downstream limit. Predict the backlog at restart and watch how much spare capacity is available to drain it.

### Practice

- **116 scenario questions** with domain filters, explanations and score history. Questions in the three advanced modules link back to their lessons.
- **Three written design reviews** cover offline field inspections, a regional package registry, and shared batch compute. Each has requirements, capacity estimates, architecture, failure handling, and eight evidence checks.
- **Company-oriented practice rubrics** for Microsoft, Google, Amazon, and Meta.
- **60-Day Study Roadmap**: 16 checkable milestones persisted automatically in `localStorage`.

Your study name selects a local browser profile. Use **Profile → Copy Sync Code** to transfer progress, including review notes and checks, to another device. The code contains a copy of your notes.

### Cheatsheets

- **6 Core System Design Patterns Matrix** (Real-Time Updates, Scaling Reads, Scaling Writes, High Contention, Long-Running Tasks, Multi-Step Workflows), 45-Minute HLD & LLD Interview Blueprints, Jeff Dean Latency Numbers Ladder, Powers of 2 & HTTP Status Codes, "When to Use What" Decision Matrices, and All 23 GoF Patterns Quick-Scan Grid.

---

## Quick Start

```bash
npm ci
npm run dev
```

### Verify Tests & Production Build

```bash
npm test
npm run build
npm run preview
```

### Deploy to Cloudflare Workers (Recommended — Edge HTTPS)

```bash
npm run build
npx wrangler deploy
```

### Deploy Static Bundle to GitHub Pages

```bash
npm run deploy
```

The application uses React, Vite, Tailwind CSS, Lucide icons, and an SVG diagram renderer. The static build runs without an application server.
