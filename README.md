# System Design Complete Guide — Interactive HLD, In-The-Wild & LLD Mastery Atlas

An all-in-one, interactive visual study platform covering **High-Level Design (HLD)**, **Real-World "In The Wild" Production Engineering Deep Dives**, and **Low-Level Design (LLD) / Machine Coding** for **Microsoft (L60–L65)**, **Google (L4–L6)**, **Amazon (SDE2/SDE3)**, and **Meta (E4–E6)** interviews.

Synthesizes the animated step-by-step visual clarity of [designed-to-scale](https://designed-to-scale.vercel.app/#/cdn/1), the architectural breadth of [ByteByteGo `system-design-101`](https://github.com/ByteByteGoHq/system-design-101), and the real-world production breakdowns of [Hello Interview](https://www.hellointerview.com/learn/system-design/in-the-wild/shopify-inventory-reservations) — all inside **one self-contained interactive website** with zero "coming soon" placeholders.

---

## Complete Curriculum (14 Modules · 88 Interactive Lessons)

### 1. Interactive Step-by-Step Course (`Learn` — 14 Modules · 88 Animated Lessons)
Every lesson features a **2.5D Isometric SVG Architecture Stage** with live telemetry KPIs, animated request/response/event packets, `Replay (R)` / `Pause (Space)` controls, keyboard navigation (`← →`), hash deep-links (`#/<lesson>/<step>`), auto-checking `YOU'LL LEARN` objectives, and a **Staff-Level Deep Engineering Vault** (Trade-off Matrices, Capacity Math, Failure Modes & Production Code):

| # | Module | Track | Lessons | Key Highlights |
| :--- | :--- | :--- | :---: | :--- |
| **01** | **Foundations** | HLD | 3 | DNS/TCP/TLS 1.3/HTTP3 QUIC, Tail Latency (p99) & Hedged RPCs, Napkin Math |
| **02** | **Scaling** | HLD | 5 | Vertical vs Horizontal, L4/L7 Load Balancing (P2C), Stateless, Caching (Stampede/Bloom), **Content Delivery (CDN)** |
| **03** | **Data & Storage** | HLD | 11 | SQL vs NoSQL, B+ Tree / Spatial Indexes, B-Tree vs LSM-Tree, Replication & Quorum, Sharding, Consistent Hashing, Snowflake IDs, CAP & PACELC, Raft Consensus & Fencing Tokens, MVCC & Isolation, Object Storage |
| **04** | **Communication** | HLD | 4 | REST/gRPC/GraphQL/Webhooks, Message Queues & DLQ, Kafka Internals (ISR/Zero-Copy), Polling/SSE/WebSockets/WebRTC |
| **05** | **Reliability** | HLD | 4 | Active-Active DR & Cell Architecture, 5 Rate Limiting Algorithms (Redis Lua), Circuit Breakers & Full Jitter, OpenTelemetry & SLO Error Budgets |
| **06** | **Architecture** | HLD | 4 | Modular Monolith vs Microservices & Strangler Fig, Service Mesh (Envoy mTLS), Sagas & Transactional Outbox CDC, Flink/Kappa Stream Processing |
| **07** | **Security & Enterprise** | HLD | 3 | OAuth 2.0 + PKCE / OIDC / JWT Rotation, RBAC / ABAC / Google Zanzibar ReBAC, KMS Envelope Encryption & Multi-Tenant Isolation (Microsoft L62/L63) |
| **08** | **Shipping & DevOps** | HLD | 2 | Testing Pyramid, Shadow Traffic & Chaos Engineering; CI/CD, Docker/K8s, Canary & Expand-Contract DB Migrations |
| **09** | **Fintech, AI & Real-World** | HLD | 4 | Payment Systems, UPI & Immutable Double-Entry Ledger; Hybrid RAG + vLLM PagedAttention; Discord ScyllaDB & Hotstar 50M; Prime Video -90% Monolith, Netflix Open Connect & Stack Overflow |
| **10** | **Whole Systems (HLD)** | HLD | 13 | HLD/LLD Two Zoom Levels + **12 Core Systems**: TinyURL, Twitter/X News Feed, WhatsApp/Teams Chat, YouTube/Netflix, Uber H3 Dispatch, Google Autocomplete & Web Crawler, Google Docs/Loop (OT/CRDT), BookMyShow Flash Sale, DynamoDB KV Store, Dropbox/OneDrive, Distributed Rate Limiter, Datadog/Azure Monitor & Priority Notifications |
| **11** | **Advanced HLD Designs** | HLD | 10 | **Hello Interview & Staff FAANG Classics**: Ad Click Aggregator (Flink/ClickHouse/Billing), LeetCode Code Judge (Firecracker microVMs), Top-K Heavy Hitters (Count-Min Sketch), FB Live Comments (2-tier SSE Fanout Tree), Real-Time Post Search (Doc-Partitioned Inverted Index), High-Frequency Stock Exchange (LMAX Single-Thread Matching Engine), Airbnb/Hotel Booking (GiST Exclusion), DoorDash Food Delivery (3-Sided Saga + VRP), Real-Time Online Auction (Redis Lua + Soft-Close), Microsoft Teams / Zoom Video Conferencing (Cascaded SFU + Simulcast) |
| **12** | **In The Wild (Big Tech)** | HLD | 6 | **Shopify** (Moving Inventory Reservations from Redis → MySQL 8 `FOR UPDATE SKIP LOCKED` + ProxySQL Ops), **Slack** (Kafka + `JQRelay` in front of Redis Job Queues), **Figma** (Multiplayer Simplified CRDT + Fractional Indexing), **Meta** (`ZGateway` Multiplexing Proxy, TAO & Memcached Leases), **Spotify** (Exabyte Data Lake Random Access Parquet RAP), **Stripe / Uber / Netflix** (Atomic Idempotency Recovery Points, Docstore, Adaptive Concurrency Limits) |
| **13** | **LLD Core & 23 Patterns** | LLD | 4 | OOP & UML Mastery, Interactive **SOLID Bad vs Good Code Comparator**, Searchable **All 23 Gang of Four Design Patterns Explorer**, Concurrency & Deadlock Lock Ordering |
| **14** | **LLD Machine Coding** | LLD | 15 | Full UML + Clean Multi-Language Code (**Java / C++ / Python / TypeScript**): Parking Lot, Elevator LOOK Dispatcher, BookMyShow SeatLock TTL, Splitwise Debt Simplifier, LRU/LFU+TTL Cache, Rate Limiter SDK, Async Log4j Logger, Vending Machine/ATM, Chess Engine, Multi-Threaded Task Scheduler, **Amazon Locker**, **Uber Dispatch & Surge Decorator**, **In-Memory Kafka Pub/Sub Broker**, **Thread-Safe Online Auction**, and **Composite File System & Specification `find()`** |

### 2. Interactive Engineering Workbench (`Design Lab` — 6 Live Simulators)
1. **Consistent Hashing Ring Lab** — Add/remove nodes, adjust vNodes, and compare remapping % vs `hash(k) % N`.
2. **Rate Limiter Arena** — Live Token Bucket vs Fixed Window (boundary bug!) vs Sliding Window Counter burst test.
3. **LRU Eviction & Cache Stampede Lab** — O(1) Doubly-Linked List simulator + toggle Single-Flight Mutex under 50 concurrent misses.
4. **Dynamo Quorum (`W + R > N`) & 5-Node Raft Consensus Lab** — Kill/revive Raft nodes and watch majority quorums hold or halt.
5. **Back-of-the-Envelope Napkin Math Estimator** — Big Tech presets (TinyURL, Twitter, WhatsApp, YouTube, Uber, Stripe) → QPS, 5-year TB, Gbps, Cache RAM & Shards.
6. **LLD Concurrency Lab** — Live BookMyShow Seat A5 dual-user race simulator (Lock ON vs OFF + 10s TTL) + 3-Car Elevator LOOK Dispatcher.

### 3. Interview War Room (`Practice`)
- **75-Question Staff-Level HLD, In-The-Wild & LLD Mock Exam** with domain filters, instant explanations, and accuracy breakdown.
- **Big Tech Hiring Rubrics**: Microsoft (L60–L65), Google (L4–L6), Amazon (L5–L6), and Meta (E4–E6).
- **60-Day Study Roadmap**: 16 checkable milestones persisted automatically in `localStorage`.

### 4. Visual Reference Atlas (`Cheatsheets`)
- **6 Core System Design Patterns Matrix** (Real-Time Updates, Scaling Reads, Scaling Writes, High Contention, Long-Running Tasks, Multi-Step Workflows), 45-Minute HLD & LLD Interview Blueprints, Jeff Dean Latency Numbers Ladder, Powers of 2 & HTTP Status Codes, "When to Use What" Decision Matrices, and All 23 GoF Patterns Quick-Scan Grid.

---

## Quick Start

```bash
npm install
npm run dev
```

### Verify Tests & Production Build

```bash
npm test
npm run build
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

> Built with React 19, Vite 6, Tailwind CSS, Lucide Icons, and a custom 2.5D Isometric SVG Stage Engine. Works 100% statically on GitHub Pages, Vercel, Cloudflare Pages, or Netlify with zero backend required.
