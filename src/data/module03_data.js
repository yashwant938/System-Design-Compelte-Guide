// Module 03: Data & Storage (11 comprehensive step-by-step lessons)

export const MODULE_03_DATA_STORAGE = {
  id: 'mod-03-data-storage',
  number: '03',
  title: 'Data & Storage',
  track: 'hld',
  lessons: [
    {
      id: 'sql-nosql',
      sources: [
        { title: 'Google Research, Spanner architecture and commit-wait', url: 'https://research.google/pubs/spanner-googles-globally-distributed-database/' },
        { title: 'Google Cloud, TrueTime and external consistency', url: 'https://docs.cloud.google.com/spanner/docs/true-time-external-consistency' },
      ],
      title: 'SQL vs NoSQL',
      subtitle: 'Choosing between Relational ACID, Document, Key-Value, Wide-Column, Graph, Time-Series, and Vector DBs.',
      duration: '10 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Google', 'Meta'],
      tags: ['postgresql', 'mysql', 'dynamodb', 'cassandra', 'mongodb', 'neo4j', 'acid', 'nosql'],
      objectives: [
        'Choose SQL when relational integrity, joins, and ACID transactions dominate',
        'Pick the exact NoSQL family (KV, Document, Wide-Column, Graph, Time-Series, Vector)',
        'Understand Polyglot Persistence in modern Big Tech architectures',
      ],
      steps: [
        {
          shortLabel: 'Relational SQL',
          stage: 'SETUP',
          title: 'SQL shines for structured schemas & strict ACID guarantees',
          body: [
            '**Relational databases** (PostgreSQL, MySQL, Azure SQL) organize data into normalized tables linked by foreign keys and enforce **ACID** transactions (Atomicity, Consistency, Isolation, Durability).',
            'If Alice transfers \$100 to Bob, both rows commit together or roll back cleanly — never leaving money created out of thin air.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Default to PostgreSQL unless a concrete access pattern (massive write velocity, flexible nested JSON, graph traversals, or multi-TB KV scale) demands a specialized NoSQL engine.',
          },
          scene: {
            hud: [
              { label: 'GUARANTEE', value: 'Strict ACID', status: 'good' },
              { label: 'JOINS', value: 'Native SQL', status: 'good' },
              { label: 'SCALE LIMIT', value: 'Vertical + Shards', status: 'warn' },
              { label: 'BEST FOR', value: 'Finance · Orders', status: 'info' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 140, y: 215, label: 'Order Svc', sublabel: 'BEGIN TX', tone: 'blue' },
              { id: 'pg', type: 'db', x: 420, y: 215, label: 'PostgreSQL', sublabel: 'ACID + MVCC', tone: 'purple', badge: 'strict schema', badgeTone: 'purple', callout: 'orders + ledger' },
              { id: 'rep', type: 'db', x: 645, y: 215, label: 'Read Replica', sublabel: 'Analytics', tone: 'blue' },
            ],
            edges: [
              { from: 'app', to: 'pg', label: 'ACID COMMIT', packetColor: 'green', bidirectional: true, speed: 1.8 },
              { from: 'pg', to: 'rep', label: 'WAL stream', packetColor: 'purple', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'ACID transaction', tone: 'green' },
              { label: 'WAL replication', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'NoSQL families',
          stage: 'TECHNIQUE',
          title: 'Not one NoSQL — pick the right data model for the query',
          body: [
            '**"NoSQL" is 6 distinct engines**: **Key-Value** (DynamoDB, Redis) for sub-10ms key lookups; **Document** (MongoDB, Cosmos DB) for evolving product catalogs; **Wide-Column** (Cassandra, ScyllaDB, Bigtable) for trillions of write-heavy chat/telemetry rows; **Graph** (Neo4j) for social hops; **Time-Series** (InfluxDB/Timescale) for metrics; **Vector** (Pinecone/pgvector) for AI embeddings.',
            'In NoSQL, you **model around your query access patterns** (denormalize and duplicate data) to avoid expensive distributed joins!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Never say "I will use NoSQL because it scales better." Name the exact NoSQL family and access pattern (e.g., "Cassandra partitioned by `(channel_id, bucket)` with `message_id` clustering key for sequential chat scans").',
          },
          scene: {
            hud: [
              { label: 'KEY-VALUE', value: 'DynamoDB / Redis', status: 'good' },
              { label: 'WIDE-COLUMN', value: 'Cassandra / Scylla', status: 'good' },
              { label: 'DOCUMENT', value: 'MongoDB / Cosmos', status: 'info' },
              { label: 'SEARCH / VECTOR', value: 'Elastic / Milvus', status: 'info' },
            ],
            nodes: [
              { id: 'gw', type: 'hex', x: 135, y: 215, label: 'Polyglot API', sublabel: 'Right tool/job', tone: 'green' },
              { id: 'sql', type: 'db', x: 430, y: 90, label: 'PostgreSQL', sublabel: 'Billing (ACID)', tone: 'purple' },
              { id: 'wc', type: 'db', x: 430, y: 215, label: 'ScyllaDB', sublabel: 'Chat (1M writes/s)', tone: 'blue', badge: 'LSM-Tree', badgeTone: 'blue' },
              { id: 'es', type: 'db', x: 430, y: 340, label: 'Elasticsearch', sublabel: 'Full-text Search', tone: 'amber' },
              { id: 'vec', type: 'cache', x: 645, y: 215, label: 'Vector DB', sublabel: 'RAG / HNSW', tone: 'green' },
            ],
            edges: [
              { from: 'gw', to: 'sql', label: 'payments', packetColor: 'purple', speed: 1.9 },
              { from: 'gw', to: 'wc', label: 'messages', packetColor: 'blue', speed: 1.6 },
              { from: 'gw', to: 'es', label: 'search', packetColor: 'amber', speed: 2.0 },
              { from: 'wc', to: 'vec', label: 'embeddings', packetColor: 'green', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'polyglot persistence', tone: 'blue' },
            ],
          },
        },
        {
          shortLabel: 'NewSQL',
          stage: 'SOLUTION',
          title: 'How Spanner orders transactions across shards',
          body: [
            '**Distributed SQL** combines a relational interface with transactions across shards. In the Spanner design, each replica group uses Paxos. A transaction writing to multiple groups uses two-phase commit across those groups.',
            'Placement determines which acknowledgments cross a region boundary. A single-group write and a multi-group transaction can take different paths. Estimate latency from the leader, the required replicas, and any cross-group coordination.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'TrueTime returns an interval that contains the current time. Its width varies. Before exposing a commit, Spanner waits until the earliest possible current time has passed the chosen commit timestamp. This helps preserve real-time order between completed transactions.',
          },
          scene: {
            hud: [
              { label: 'SQL + ACID', value: 'Yes (Global)', status: 'good' },
              { label: 'SHARDING', value: 'Automatic', status: 'good' },
              { label: 'CONSENSUS', value: 'Paxos per group', status: 'info' },
              { label: 'WRITE LATENCY', value: 'Higher (WAN RTT)', status: 'warn' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 115, y: 215, label: 'Global App', sublabel: 'SQL Client', tone: 'slate' },
              { id: 'r1', type: 'db', x: 350, y: 120, label: 'Group A lead', sublabel: 'Commit coordinator', tone: 'green' },
              { id: 'r2', type: 'db', x: 350, y: 310, label: 'Group B lead', sublabel: 'Participant', tone: 'blue' },
              { id: 'r3', type: 'db', x: 615, y: 120, label: 'Group A peers', sublabel: 'Paxos replicas', tone: 'purple' },
            ],
            edges: [
              { from: 'c', to: 'r1', label: 'TX write', packetColor: 'green', bidirectional: true, speed: 1.9 },
              { from: 'r1', to: 'r3', label: 'replicate', packetColor: 'purple', dashed: true, speed: 2.3 },
              { from: 'r1', to: 'r2', label: '2PC', packetColor: 'blue', bidirectional: true, speed: 2.3 },
            ],
            legend: [
              { label: 'distributed ACID write', tone: 'green' },
              { label: 'Paxos replication', tone: 'purple' },
              { label: 'cross-group commit', tone: 'blue' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'Relational (PostgreSQL / MySQL)', bestWhen: 'Orders, ledger, IAM, complex joins, < 50k TPS', pros: 'ACID, rich SQL, mature ecosystem', cons: 'Manual sharding at massive write/TB scale' },
          { option: 'Wide-Column (Cassandra / ScyllaDB)', bestWhen: 'Chat messages, IoT, audit logs, massive write QPS', pros: 'Linear horizontal writes, masterless high availability', cons: 'No ad-hoc joins; must design tables per query' },
          { option: 'Key-Value (DynamoDB)', bestWhen: 'Shopping carts, session stores, user preferences', pros: 'Predictable single-digit ms latency at any scale', cons: 'Limited secondary query flexibility; hot partition limits' },
          { option: 'Distributed SQL (Spanner / Cockroach)', bestWhen: 'Global financial metadata, multi-region inventory', pros: 'Auto-sharding + SQL + strong ACID', cons: 'Higher cross-region write latency & compute cost' },
        ],
      },
    },

    {
      id: 'indexes',
      title: 'Indexes',
      subtitle: 'B+ Trees, Clustered vs Secondary, Composite Leftmost Prefix, Covering, Inverted & Spatial indexes.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Google', 'Amazon'],
      tags: ['b-tree', 'composite index', 'covering index', 'inverted index', 'geohash', 'h3', 'quadtree'],
      objectives: [
        'Turn O(N) full table scans into O(log N) B+ Tree seeks',
        'Apply Leftmost Prefix and Covering Indexes to eliminate heap lookups',
        'Choose Inverted Indexes (search) and Spatial Indexes (Uber/Yelp)',
      ],
      steps: [
        {
          shortLabel: 'Full scan',
          stage: 'PROBLEM',
          title: 'Without an index, every query reads the entire table',
          body: [
            'Searching `WHERE email = "alice@ms.com"` on a 50-million-row unindexed table forces the database to read **every 8 KB disk page sequentially** (O(N) full table scan — 4+ seconds and 100% disk I/O!).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'An index speeds up READS dramatically, but every index slows down WRITES (INSERT/UPDATE/DELETE must update every B+ Tree) and consumes extra RAM & disk.',
          },
          scene: {
            hud: [
              { label: 'ROWS SCANNED', value: '50,000,000', status: 'bad' },
              { label: 'QUERY TIME', value: '4,200 ms', status: 'bad' },
              { label: 'COMPLEXITY', value: 'O(N) Full Scan', status: 'bad' },
              { label: 'DISK IOPS', value: '98% Saturated', status: 'bad' },
            ],
            nodes: [
              { id: 'q', type: 'hex', x: 145, y: 215, label: 'SQL Query', sublabel: 'WHERE email=?', tone: 'blue' },
              { id: 'p1', type: 'db', x: 380, y: 120, label: 'Pages 1..1M', sublabel: 'Scanning...', tone: 'coral', load: 98 },
              { id: 'p2', type: 'db', x: 380, y: 310, label: 'Pages 1M..5M', sublabel: 'Scanning...', tone: 'coral', load: 98 },
              { id: 'hit', type: 'db', x: 630, y: 215, label: 'Page 4,812,001', sublabel: 'Row finally found', tone: 'amber' },
            ],
            edges: [
              { from: 'q', to: 'p1', label: 'scan all', packetColor: 'coral', speed: 1.6 },
              { from: 'q', to: 'p2', label: 'scan all', packetColor: 'coral', speed: 1.6 },
              { from: 'p2', to: 'hit', label: '4.2 sec!', packetColor: 'amber', dashed: true, speed: 3.0 },
            ],
            legend: [{ label: 'full table disk scan', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'B+ Tree',
          stage: 'SOLUTION',
          title: 'A 4-level B+ Tree finds 1 row in 50 million in 4 page reads',
          body: [
            'A **B+ Tree** packs hundreds of sorted keys into each 8–16 KB node (high branching factor ~500). With 500 keys per node, a tree just **4 levels deep** indexes `500^4 = 62.5 BILLION` rows!',
            'Better yet, all leaf pages are linked sequentially in a doubly-linked list, making **range queries** (`WHERE created_at BETWEEN t1 AND t2`) blazingly fast sequential scans.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Composite Index `(tenant_id, status, created_at)` obeys the **Leftmost Prefix Rule**: it accelerates `(tenant_id)` and `(tenant_id, status)`, but CANNOT be used efficiently for a query filtering only on `(created_at)`.',
          },
          changes: [
            '+B+ Tree index built on (email) — 4 levels deep',
            '~Rows scanned drops 50,000,000 → 1 leaf entry',
            '~Query time drops 4,200 ms → 1.4 ms',
          ],
          scene: {
            hud: [
              { label: 'TREE DEPTH', value: '4 Hops', status: 'good' },
              { label: 'QUERY TIME', value: '1.4 ms', status: 'good' },
              { label: 'COMPLEXITY', value: 'O(log_500 N)', status: 'good' },
              { label: 'RANGE SCANS', value: 'Linked Leaves', status: 'good' },
            ],
            nodes: [
              { id: 'root', type: 'hex', x: 380, y: 85, label: 'Root Node', sublabel: 'Pinned in RAM', tone: 'green', badge: 'hop 1', badgeTone: 'green' },
              { id: 'b1', type: 'hex', x: 205, y: 205, label: 'Branch A–M', sublabel: '500 keys', tone: 'blue', badge: 'hop 2', badgeTone: 'blue' },
              { id: 'b2', type: 'hex', x: 555, y: 205, label: 'Branch N–Z', sublabel: 'skipped', tone: 'slate', dim: true },
              { id: 'leaf', type: 'db', x: 205, y: 335, label: 'Leaf Page', sublabel: 'alice@ms.com → row', tone: 'purple', badge: '1.4 ms hit!', badgeTone: 'green' },
              { id: 'next', type: 'db', x: 460, y: 335, label: 'Next Leaf', sublabel: 'Range Scan →', tone: 'purple', dim: true },
            ],
            edges: [
              { from: 'root', to: 'b1', label: 'A–M', packetColor: 'green', speed: 1.5 },
              { from: 'b1', to: 'leaf', label: 'exact match', packetColor: 'green', speed: 1.5 },
              { from: 'leaf', to: 'next', label: 'linked list', packetColor: 'purple', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'O(log N) tree traversal', tone: 'green' },
              { label: 'sequential range link', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Specialized',
          stage: 'TECHNIQUE',
          title: 'Covering, Inverted (Search) & Spatial (Geo) Indexes',
          body: [
            '1. **Covering Index (`INCLUDE`)**: Stores extra selected columns right in the leaf page so the DB performs an **Index-Only Scan** without ever fetching the main heap row!',
            '2. **Inverted Index** (Elasticsearch/Lucene): Maps `token → [doc_id_1, doc_id_9, ...]` for instant full-text search.',
            '3. **Spatial Index** (**Geohash**, **QuadTree**, **Uber H3 hexagons**): Maps 2D `(lat, lng)` coordinates into 1D prefix strings or hexagonal cells for sub-10ms "find nearby drivers" queries.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In PostgreSQL/SQL Server, ordering columns in a composite index as **Equality columns first, Range column last** (`WHERE tenant_id = ? AND created_at > ?` → index `(tenant_id, created_at)`) is a classic optimization question.',
          },
          scene: {
            hud: [
              { label: 'COVERING', value: 'Index-Only Scan', status: 'good' },
              { label: 'FULL-TEXT', value: 'Inverted Index', status: 'good' },
              { label: 'GEO / UBER', value: 'H3 / QuadTree', status: 'good' },
              { label: 'AI / RAG', value: 'HNSW Vector', status: 'info' },
            ],
            nodes: [
              { id: 'cov', type: 'db', x: 140, y: 215, label: 'Covering B+', sublabel: 'No Heap Fetch', tone: 'green' },
              { id: 'inv', type: 'db', x: 380, y: 120, label: 'Inverted', sublabel: 'word → docIDs', tone: 'amber' },
              { id: 'geo', type: 'hex', x: 380, y: 310, label: 'Spatial H3', sublabel: '(lat,lng) → Hex', tone: 'blue' },
              { id: 'vec', type: 'cache', x: 630, y: 215, label: 'HNSW Graph', sublabel: 'Cosine Top-K', tone: 'purple' },
            ],
            edges: [
              { from: 'cov', to: 'inv', label: 'SQL vs Text', packetColor: 'amber', dashed: true, speed: 2.3 },
              { from: 'cov', to: 'geo', label: '2D Radius', packetColor: 'blue', dashed: true, speed: 2.3 },
              { from: 'inv', to: 'vec', label: 'Hybrid RAG', packetColor: 'purple', speed: 2.0 },
            ],
            legend: [{ label: 'index specialization', tone: 'purple' }],
          },
        },
      ],
    },

    {
      id: 'storage-engines',
      title: 'Storage Engines',
      subtitle: 'Inside the disk layer: B-Tree in-place updates (Postgres) vs LSM-Tree MemTable + SSTables (Cassandra/RocksDB).',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
      tags: ['lsm-tree', 'b-tree', 'sstable', 'memtable', 'wal', 'compaction', 'bloom filter', 'rocksdb'],
      objectives: [
        'Trace how B-Tree engines use WAL + fixed-size pages (read-optimized)',
        'Trace how LSM-Trees convert random writes into sequential append-only I/O',
        'Understand Compaction, Write/Read Amplification, and Bloom Filters',
      ],
      steps: [
        {
          shortLabel: 'B-Tree disk',
          stage: 'SETUP',
          title: 'B-Trees update fixed 8–16 KB pages in place',
          body: [
            'In PostgreSQL and MySQL InnoDB, data lives in fixed-size **pages** on disk. Before mutating a page in RAM, the engine appends the change to a sequential **Write-Ahead Log (WAL)** for crash recovery, then flushes dirty pages asynchronously.',
            'Reads are ultra-predictable (1 key lives in exactly 1 place!), but heavy random writes cause **random disk seeks** and **page splits** (write amplification).',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'B-Trees optimize for predictable **READ latency** and strong page-level concurrency locks; LSM-Trees optimize for blistering **WRITE throughput**.',
          },
          scene: {
            hud: [
              { label: 'ENGINE', value: 'B+ Tree (InnoDB)', status: 'info' },
              { label: 'READ SPEED', value: 'Fast · 1 Lookup', status: 'good' },
              { label: 'RANDOM WRITES', value: 'Page Splits', status: 'warn' },
              { label: 'CRASH SAFETY', value: 'WAL Append', status: 'good' },
            ],
            nodes: [
              { id: 'w', type: 'hex', x: 130, y: 215, label: 'Write Tx', sublabel: 'UPDATE row', tone: 'blue' },
              { id: 'wal', type: 'queue', x: 365, y: 115, label: 'WAL Log', sublabel: 'Sequential fsync', tone: 'green', badge: 'durable', badgeTone: 'green' },
              { id: 'buf', type: 'cache', x: 365, y: 310, label: 'Buffer Pool', sublabel: 'Dirty 8KB Page', tone: 'amber' },
              { id: 'disk', type: 'db', x: 630, y: 215, label: 'B-Tree Disk', sublabel: 'In-Place Overwrite', tone: 'purple' },
            ],
            edges: [
              { from: 'w', to: 'wal', label: '1. append WAL', packetColor: 'green', speed: 1.6 },
              { from: 'w', to: 'buf', label: '2. mutate page', packetColor: 'amber', speed: 1.8 },
              { from: 'buf', to: 'disk', label: '3. checkpoint flush', packetColor: 'purple', dashed: true, speed: 2.6 },
            ],
            legend: [
              { label: 'crash-safe WAL', tone: 'green' },
              { label: 'in-place page flush', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'LSM-Tree',
          stage: 'SOLUTION',
          title: 'LSM-Trees turn random writes into sequential appends',
          body: [
            '**Log-Structured Merge-Trees** (RocksDB, Cassandra, ScyllaDB, Bigtable) never overwrite data in place! Every write appends to a **WAL** and inserts into an in-memory sorted tree (**MemTable** — Red-Black Tree / SkipList).',
            'When the MemTable hits ~64 MB, it flushes sequentially to disk as an immutable sorted file called an **SSTable (Sorted String Table)**. Background **Compaction** merges SSTables and discards tombstones/old versions.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'How do LSM-Trees avoid checking 20 SSTables when reading a non-existent key? Each SSTable attaches an in-memory **Bloom Filter** — if the Bloom Filter says "definitely not here," the engine skips that SSTable with zero disk I/O!',
          },
          changes: [
            '+Writes hit RAM MemTable + Sequential WAL (10× faster writes!)',
            '+Immutable SSTables merged asynchronously via Compaction',
            '+Bloom Filters skip disk reads for missing keys',
          ],
          scene: {
            hud: [
              { label: 'WRITE PATH', value: 'RAM + Seq WAL', status: 'good' },
              { label: 'WRITE TPS', value: '10× Higher', status: 'good' },
              { label: 'READ ASSIST', value: 'Bloom Filters', status: 'info' },
              { label: 'BACKGROUND', value: 'Compaction CPU', status: 'warn' },
            ],
            nodes: [
              { id: 'in', type: 'hex', x: 105, y: 215, label: '1M Writes/s', sublabel: 'Random Keys', tone: 'blue' },
              { id: 'mem', type: 'cache', x: 300, y: 155, label: 'MemTable', sublabel: 'Sorted RAM + WAL', tone: 'green', badge: 'O(log M) RAM', badgeTone: 'green' },
              { id: 'l0', type: 'db', x: 500, y: 115, label: 'SSTable L0', sublabel: 'Immutable + Bloom', tone: 'amber' },
              { id: 'l1', type: 'db', x: 500, y: 295, label: 'SSTable L1..Ln', sublabel: 'Compacted Runs', tone: 'purple', badge: 'merged', badgeTone: 'purple' },
              { id: 'read', type: 'users', x: 680, y: 215, label: 'Readers', sublabel: 'Mem → L0 → L1', tone: 'slate' },
            ],
            edges: [
              { from: 'in', to: 'mem', label: 'append only', packetColor: 'green', speed: 1.4, packetCount: 3 },
              { from: 'mem', to: 'l0', label: 'seq flush', packetColor: 'amber', speed: 2.0 },
              { from: 'l0', to: 'l1', label: 'compaction', packetColor: 'purple', dashed: true, speed: 2.7 },
              { from: 'read', to: 'l0', label: 'Bloom check', packetColor: 'blue', dashed: true, speed: 2.1 },
            ],
            legend: [
              { label: 'sequential RAM/WAL write', tone: 'green' },
              { label: 'background compaction', tone: 'purple' },
            ],
          },
        },
      ],
      deepDive: {
        tradeoffs: [
          { option: 'B+ Tree (Postgres, MySQL)', bestWhen: 'Read-heavy OLTP, point lookups, strong transactional locks', pros: 'Predictable p99 reads, key exists in 1 place', cons: 'Higher write amplification on random inserts, page fragmentation' },
          { option: 'LSM-Tree (RocksDB, Cassandra, Scylla)', bestWhen: 'Write-heavy workloads (chat, metrics, time-series, IoT)', pros: 'Blistering sequential writes, superior compression ratio', cons: 'Compaction I/O spikes can hurt p99 reads; reads may inspect multiple levels' },
        ],
      },
    },

    {
      id: 'replication',
      sources: [
        { title: 'PostgreSQL, synchronous replication and standby reads', url: 'https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION' },
        { title: 'Amazon Dynamo paper, replica selection, reads and hinted handoff', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf' },
      ],
      title: 'Replication',
      subtitle: 'Single-Leader sync vs async, Multi-Leader conflicts, and Leaderless Dynamo quorums (W + R > N).',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Meta', 'Microsoft', 'Google'],
      tags: ['leader-follower', 'replication lag', 'multi-leader', 'leaderless', 'quorum', 'read-your-writes', 'merkle tree'],
      objectives: [
        'Distinguish durable acknowledgments from visibility on a read replica',
        'Handle Replication Lag anomalies (Read-Your-Writes, Monotonic Reads)',
        'Understand Leaderless Dynamo quorums (W + R > N), Read Repair, and Hinted Handoff',
      ],
      steps: [
        {
          shortLabel: 'Leader-Follower',
          stage: 'SOLUTION',
          title: 'Single-Leader scales reads — but watch Async Replication Lag',
          body: [
            'Writes go to the **leader**, which streams its log to replicas. A synchronous durability policy can require a standby to flush a commit before the leader acknowledges it. Failover preserves that commit if a surviving, sufficiently up-to-date standby is promoted.',
            'A replica can receive a log entry before applying it. With asynchronous replication, a write may finish before the replica even receives it. Alice changes her avatar, reads 50 ms later from a lagging replica, and sees the previous version.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Return an acknowledged log position with the edit. Serve the next read from the authoritative leader or from a replica whose visible snapshot includes that position on the same log history. A fixed timer can expire while a replica is still behind.',
          },
          scene: {
            hud: [
              { label: 'WRITES', value: 'Leader Only', status: 'info' },
              { label: 'READS', value: 'Leader or replica', status: 'info' },
              { label: 'EXAMPLE LAG', value: '120 ms', status: 'warn' },
              { label: 'WRITE POLICY', value: '1 standby flush', status: 'good' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 120, y: 215, label: 'App Tier', sublabel: 'RW Split', tone: 'blue' },
              { id: 'lead', type: 'db', x: 380, y: 120, label: 'Leader DB', sublabel: 'Writes + RYW', tone: 'green', badge: 'primary', badgeTone: 'green', load: 42 },
              { id: 'r1', type: 'db', x: 630, y: 120, label: 'Replica 1', sublabel: 'Flushed to disk', tone: 'purple', badge: 'sync standby', badgeTone: 'blue' },
              { id: 'r2', type: 'db', x: 630, y: 310, label: 'Replica 2', sublabel: 'Async (120ms lag)', tone: 'amber', badge: 'lag: 120ms', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'app', to: 'lead', label: 'WRITES', packetColor: 'green', speed: 1.6 },
              { from: 'app', to: 'r2', label: 'read', packetColor: 'blue', bidirectional: true, speed: 1.8 },
              { from: 'lead', to: 'r1', label: 'sync WAL', packetColor: 'purple', speed: 1.7 },
              { from: 'lead', to: 'r2', label: 'async WAL', packetColor: 'amber', dashed: true, speed: 2.8 },
            ],
            legend: [
              { label: 'primary write', tone: 'green' },
              { label: 'read replica query', tone: 'blue' },
              { label: 'async lag stream', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Leaderless W+R>N',
          stage: 'TECHNIQUE',
          title: 'When a read quorum intersects a write quorum',
          body: [
            'Keep the home replicas for a key fixed at A, B and C. A write of version 5 completes on A and B. A later read from A and C sees version 5 from A and the older version 4 from C. With a single ordered writer in this example the coordinator can return version 5 and repair C.',
            'For the same fixed set of `N` replicas, two response sets of sizes `W` and `R` intersect in at least `max(0, W + R − N)` members. Concurrent writers also need a versioning and reconciliation policy. Intersection alone does not order them.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In the original Dynamo design a substitute host may accept a hinted write while a home replica is unavailable. A later read from home replicas can miss that write until handoff or repair. Which assumption in the intersection formula changed?',
          },
          scene: {
            hud: [
              { label: 'REPLICAS (N)', value: 'N = 3', status: 'info' },
              { label: 'WRITE QUORUM', value: 'W = 2', status: 'good' },
              { label: 'READ QUORUM', value: 'R = 2', status: 'good' },
              { label: 'OVERLAP', value: 'W + R > N ✓', status: 'good' },
            ],
            nodes: [
              { id: 'coord', type: 'hex', x: 145, y: 215, label: 'Coordinator', sublabel: 'W=2 · R=2', tone: 'green', badge: 'quorum met', badgeTone: 'green' },
              { id: 'n1', type: 'db', x: 470, y: 85, label: 'Replica A', sublabel: 'v5', tone: 'green', badge: 'W + R overlap', badgeTone: 'green' },
              { id: 'n2', type: 'db', x: 470, y: 215, label: 'Replica B', sublabel: 'v5', tone: 'blue' },
              { id: 'n3', type: 'db', x: 470, y: 345, label: 'Replica C', sublabel: 'v4', tone: 'amber', badge: 'stale read', badgeTone: 'amber' },
            ],
            edges: [
              { from: 'coord', to: 'n1', label: 'write + read v5', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'coord', to: 'n2', label: 'write v5', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'n3', to: 'coord', label: 'read v4', packetColor: 'amber', speed: 2.2 },
            ],
            legend: [
              { label: 'quorum ACK', tone: 'green' },
              { label: 'stale read response', tone: 'amber' },
            ],
          },
        },
      ],
    },

    {
      id: 'sharding',
      title: 'Sharding',
      subtitle: 'Horizontal partitioning across databases: shard key selection, hot partitions, and cross-shard joins.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Meta', 'Instagram', 'Microsoft', 'Amazon'],
      tags: ['partitioning', 'shard key', 'hot partition', 'celebrity problem', 'resharding', 'vitess', 'citus'],
      objectives: [
        'Choose a high-cardinality shard key aligned with dominant queries',
        'Compare Hash, Range, and Directory-based sharding',
        'Solve the Celebrity Hot-Shard problem and Cross-Shard Joins',
      ],
      steps: [
        {
          shortLabel: 'Shard keys',
          stage: 'TECHNIQUE',
          title: 'Your shard key makes or breaks the whole database',
          body: [
            '**Sharding** splits one giant table horizontally across `K` independent database clusters. Every shard holds `1/K` of the rows and writes.',
            'Picking the wrong shard key ruins performance: sharding Tweets by `timestamp` sends 100% of today’s writes to the newest shard (**write hot-spot**)! Sharding by `user_id` spreads writes evenly and keeps a user’s timeline on 1 shard.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Once a table is sharded by `user_id`, querying by `email` becomes a slow **Scatter-Gather** fan-out across ALL shards unless you maintain a secondary lookup table (`email → user_id`).',
          },
          scene: {
            hud: [
              { label: 'SHARD KEY', value: 'hash(user_id)', status: 'good' },
              { label: 'WRITE SCALE', value: '4× Linear', status: 'good' },
              { label: 'CROSS-SHARD JOIN', value: 'Avoid!', status: 'warn' },
              { label: 'ROUTER', value: 'Vitess / Citus', status: 'info' },
            ],
            nodes: [
              { id: 'app', type: 'hex', x: 110, y: 215, label: 'App Tier', sublabel: 'user_id = 42', tone: 'blue' },
              { id: 'rt', type: 'hex', x: 300, y: 215, label: 'Shard Router', sublabel: 'Hash / Lookup', tone: 'green', badge: 'O(1) route', badgeTone: 'green' },
              { id: 's0', type: 'db', x: 585, y: 95, label: 'Shard 0', sublabel: 'Users 0..24%', tone: 'purple', load: 34 },
              { id: 's1', type: 'db', x: 585, y: 215, label: 'Shard 1', sublabel: 'Users 25..49%', tone: 'purple', load: 36 },
              { id: 's2', type: 'db', x: 585, y: 335, label: 'Shard 2', sublabel: 'Users 50..99%', tone: 'purple', load: 35 },
            ],
            edges: [
              { from: 'app', to: 'rt', label: 'key: u42', packetColor: 'blue', speed: 1.7 },
              { from: 'rt', to: 's0', label: 'route', packetColor: 'green', speed: 1.7 },
              { from: 'rt', to: 's1', label: 'route', packetColor: 'green', speed: 1.9 },
              { from: 'rt', to: 's2', label: 'route', packetColor: 'green', speed: 2.1 },
            ],
            legend: [{ label: 'targeted single-shard query', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Hot shard fix',
          stage: 'SOLUTION',
          title: 'Key Salting defeats the Celebrity Hot Partition',
          body: [
            'Even with `hash(user_id)`, if a celebrity with 100M followers posts during the World Cup, **1 single shard** gets blasted with 200,000 likes/sec while 99 other shards sit idle!',
            '**Fix — Key Salting**: Append a random suffix `0..9` to hot keys (`post_99#0` .. `post_99#9`) so writes scatter across 10 shards. Readers merge the 10 sub-keys (or read from a cached aggregate).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Also avoid `hash(key) % N` directly on physical servers — map keys to **4,096 virtual logical shards** (or use Consistent Hashing) so adding new database hardware only moves a tiny slice of logical shards without rehashing everything.',
          },
          scene: {
            hud: [
              { label: 'HOT KEY', value: 'celebrity_post', status: 'warn' },
              { label: 'SALT SUFFIX', value: '#0 .. #9', status: 'good' },
              { label: 'SHARD SKEW', value: '100% → 10%', status: 'good' },
              { label: 'VIRTUAL SHARDS', value: '4,096 Buckets', status: 'info' },
            ],
            nodes: [
              { id: 'fan', type: 'users', x: 115, y: 215, label: '200k Likes/s', sublabel: 'Viral Post', tone: 'slate' },
              { id: 'salt', type: 'hex', x: 325, y: 215, label: 'Salter', sublabel: 'key + rand(0..9)', tone: 'amber', badge: 'spreads writes', badgeTone: 'green' },
              { id: 'd1', type: 'db', x: 590, y: 115, label: 'Shard A', sublabel: 'post#0..3', tone: 'green', load: 35 },
              { id: 'd2', type: 'db', x: 590, y: 215, label: 'Shard B', sublabel: 'post#4..6', tone: 'green', load: 34 },
              { id: 'd3', type: 'db', x: 590, y: 315, label: 'Shard C', sublabel: 'post#7..9', tone: 'green', load: 36 },
            ],
            edges: [
              { from: 'fan', to: 'salt', label: 'hot key', packetColor: 'coral', speed: 1.4, packetCount: 3 },
              { from: 'salt', to: 'd1', label: '33%', packetColor: 'green', speed: 1.8 },
              { from: 'salt', to: 'd2', label: '33%', packetColor: 'green', speed: 1.8 },
              { from: 'salt', to: 'd3', label: '33%', packetColor: 'green', speed: 1.8 },
            ],
            legend: [
              { label: 'hot spike', tone: 'coral' },
              { label: 'salted balanced writes', tone: 'green' },
            ],
          },
        },
      ],
    },

    {
      id: 'consistent-hashing',
      title: 'Consistent Hashing',
      subtitle: 'Hash rings and Virtual Nodes: scale caches and shards while remapping only 1/N of keys.',
      duration: '9 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Discord', 'Akamai', 'Microsoft'],
      tags: ['hash ring', 'virtual nodes', 'vnodes', 'dynamo', 'cassandra', 'cache sharding'],
      objectives: [
        'See why `hash(k) % N` triggers a catastrophic cache miss storm on resize',
        'Map servers and keys onto a 0..2^32-1 Consistent Hash Ring',
        'Use Virtual Nodes (100–200 per server) to eliminate load skew',
      ],
      steps: [
        {
          shortLabel: 'Modulo disaster',
          stage: 'PROBLEM',
          title: 'Adding 1 server to `hash(k) % N` invalidates ~80% of keys!',
          body: [
            'Suppose you shard Redis across `N = 4` nodes using `server = hash(key) % 4`. Now traffic grows and you add a 5th node (`N = 5`).',
            'Suddenly almost EVERY key hashes to a different server! **80% of your cache misses simultaneously**, slamming your backend SQL database into an outage.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'With naive modulo hashing, adding or losing 1 server out of N remaps approximately `(N-1)/N` of all keys — near 100% churn in large clusters!',
          },
          scene: {
            hud: [
              { label: 'FORMULA', value: 'hash(k) % N', status: 'bad' },
              { label: 'CLUSTER CHANGE', value: '4 → 5 Nodes', status: 'warn' },
              { label: 'KEYS REMAPPED', value: '~80% Misses!', status: 'bad' },
              { label: 'DB IMPACT', value: 'Meltdown', status: 'bad' },
            ],
            nodes: [
              { id: 'mod', type: 'hex', x: 165, y: 215, label: 'hash(k) % 5', sublabel: 'Was % 4!', tone: 'coral', badge: '80% churn', badgeTone: 'rose' },
              { id: 'c1', type: 'cache', x: 470, y: 120, label: 'Redis 1..4', sublabel: 'Wrong keys!', tone: 'amber', load: 20 },
              { id: 'db', type: 'db', x: 645, y: 270, label: 'Origin DB', sublabel: 'Cache Storm!', tone: 'coral', badge: '99% CPU', badgeTone: 'rose', load: 99 },
            ],
            edges: [
              { from: 'mod', to: 'c1', label: '80% cache miss', packetColor: 'amber', dashed: true, speed: 1.7 },
              { from: 'c1', to: 'db', label: 'stampede to DB!', packetColor: 'coral', speed: 1.3, packetCount: 3 },
            ],
            legend: [{ label: 'massive remapping storm', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Ring + vNodes',
          stage: 'SOLUTION',
          title: 'Consistent Hash Ring + Virtual Nodes moves only 1/N keys',
          body: [
            'Place both **servers** and **keys** onto a circular ring `0 .. 2^32 − 1`. Each key walks **clockwise** to the first server it encounters.',
            'When Server E joins, it ONLY steals the arc between its predecessor and itself — moving just **`1/N` (~20%) of keys**! Giving each physical machine **150 Virtual Nodes (vNodes)** scattered around the ring ensures even load balance (standard deviation < 5%) AND lets beefier hardware take more vNodes.',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Play with a live interactive ring right now in **Design Lab → Consistent Hashing Ring Lab** (add/remove nodes, adjust vNodes, watch exact key movement %!).',
          },
          changes: [
            '+Servers & keys placed on circular 2^32 hash ring',
            '+150 Virtual Nodes per machine eliminate uneven arc skew',
            '~Adding 5th server remaps only ~20% keys instead of 80%',
          ],
          scene: {
            hud: [
              { label: 'ALGORITHM', value: 'Consistent Ring', status: 'good' },
              { label: 'VNODES / NODE', value: '150 vNodes', status: 'good' },
              { label: 'KEYS MOVED', value: 'Only 1/N (20%)', status: 'good' },
              { label: 'SKEW STDDEV', value: '< 5%', status: 'good' },
            ],
            nodes: [
              { id: 'nA', type: 'hex', x: 380, y: 78, label: 'Node A', sublabel: 'vNodes: 150', tone: 'blue' },
              { id: 'nB', type: 'hex', x: 585, y: 215, label: 'Node B', sublabel: 'vNodes: 150', tone: 'green', badge: 'new · takes 20%', badgeTone: 'green' },
              { id: 'nC', type: 'hex', x: 380, y: 350, label: 'Node C', sublabel: 'vNodes: 150', tone: 'purple' },
              { id: 'nD', type: 'hex', x: 175, y: 215, label: 'Node D', sublabel: 'vNodes: 150', tone: 'amber' },
            ],
            edges: [
              { from: 'nA', to: 'nB', label: 'clockwise arc', packetColor: 'green', curve: -22, speed: 2.0 },
              { from: 'nB', to: 'nC', label: 'clockwise arc', packetColor: 'purple', curve: 22, speed: 2.0 },
              { from: 'nC', to: 'nD', label: 'clockwise arc', packetColor: 'amber', curve: 22, speed: 2.0 },
              { from: 'nD', to: 'nA', label: 'clockwise arc', packetColor: 'blue', curve: -22, speed: 2.0 },
            ],
            legend: [{ label: 'minimal 1/N clockwise handoff', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'unique-ids',
      title: 'Unique IDs at Scale',
      subtitle: 'Twitter Snowflake 64-bit IDs, UUIDv7, ULID, and why random UUIDv4 hurts B+ Tree index performance.',
      duration: '8 min',
      level: 'Intermediate',
      companies: ['Twitter/X', 'Discord', 'Instagram', 'Microsoft'],
      tags: ['snowflake', 'uuidv4', 'uuidv7', 'ulid', 'clock skew', '64-bit id'],
      objectives: [
        'Explain why DB auto-increment fails across shards and UUIDv4 fragments B+ Trees',
        'Dissect the 64-bit Twitter Snowflake bit layout (timestamp + machine + sequence)',
        'Handle NTP clock rollback and compare Snowflake vs UUIDv7',
      ],
      steps: [
        {
          shortLabel: 'UUIDv4 trap',
          stage: 'PROBLEM',
          title: 'Why random UUIDv4 destroys B+ Tree write performance',
          body: [
            'A single DB `AUTO_INCREMENT` is a bottleneck across shards. Switching to random 128-bit **UUIDv4** avoids coordination, BUT random IDs are **unsorted**: every insert lands on a random B+ Tree leaf page, causing constant disk cache misses and 50%-empty page splits!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Benchmarks consistently show random UUIDv4 primary keys cut PostgreSQL/InnoDB write throughput by 3–5× compared to time-sortable 64-bit IDs or UUIDv7.',
          },
          scene: {
            hud: [
              { label: 'UUIDv4 SIZE', value: '128-bit Random', status: 'warn' },
              { label: 'TIME SORTABLE', value: 'No', status: 'bad' },
              { label: 'B+ TREE SPLITS', value: 'Heavy Random I/O', status: 'bad' },
              { label: 'GOAL', value: '64-bit K-Sorted', status: 'good' },
            ],
            nodes: [
              { id: 'gen', type: 'hex', x: 150, y: 215, label: 'Random UUIDv4', sublabel: 'a9f1... / 02b8...', tone: 'coral' },
              { id: 'p1', type: 'db', x: 525, y: 110, label: 'Leaf Page 14', sublabel: 'Random Jump!', tone: 'coral', load: 88 },
              { id: 'p2', type: 'db', x: 525, y: 215, label: 'Leaf Page 892', sublabel: 'Page Split!', tone: 'coral', load: 91 },
              { id: 'p3', type: 'db', x: 525, y: 320, label: 'Leaf Page 401', sublabel: 'Cache Miss!', tone: 'coral', load: 85 },
            ],
            edges: [
              { from: 'gen', to: 'p1', label: 'scatter', packetColor: 'coral', speed: 1.7 },
              { from: 'gen', to: 'p2', label: 'scatter', packetColor: 'coral', speed: 1.5 },
              { from: 'gen', to: 'p3', label: 'scatter', packetColor: 'coral', speed: 1.9 },
            ],
            legend: [{ label: 'random B+ Tree page thrashing', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Snowflake 64b',
          stage: 'SOLUTION',
          title: 'Snowflake IDs: 4,096 IDs/ms per machine, zero coordination',
          body: [
            '**Twitter Snowflake** packs a globally unique, roughly **time-sortable 64-bit integer** with zero network round trips: **1 sign bit (`0`) + 41 bits timestamp (69 years in ms) + 10 bits datacenter/machine ID (1,024 nodes) + 12 bits per-ms sequence (4,096 IDs/ms/node)**.',
            'Because timestamps occupy the most significant bits, new rows always append cleanly to the **rightmost B+ Tree leaf**! Modern standard alternative: **UUIDv7** (48-bit Unix ms timestamp + 74-bit randomness in standard 128-bit UUID columns).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'What if NTP moves a machine’s clock backwards by 15 ms? Wait out small drift (`< 5 ms`), refuse generation / alert on large rollback, or use monotonic sequence bits + monotonic clock (`CLOCK_MONOTONIC`).',
          },
          scene: {
            hud: [
              { label: 'SIZE', value: '64-bit BIGINT', status: 'good' },
              { label: 'THROUGHPUT', value: '4M IDs/sec/node', status: 'good' },
              { label: 'SORT ORDER', value: 'Time-Ordered ✓', status: 'good' },
              { label: 'LIFESPAN', value: '69 Years (41b)', status: 'info' },
            ],
            nodes: [
              { id: 'w1', type: 'hex', x: 145, y: 140, label: 'Worker #12', sublabel: 'Local Seq 0..4095', tone: 'green', badge: 'zero lock', badgeTone: 'green' },
              { id: 'w2', type: 'hex', x: 145, y: 295, label: 'Worker #13', sublabel: 'Local Seq 0..4095', tone: 'blue' },
              { id: 'db', type: 'db', x: 375, y: 215, label: 'Rightmost Leaf', sublabel: 'Sequential Append!', tone: 'purple', load: 24 },
            ],
            edges: [
              { from: 'w1', to: 'db', label: 'append', packetColor: 'green', speed: 1.6 },
              { from: 'w2', to: 'db', label: 'append', packetColor: 'blue', speed: 1.6 },
            ],
            overlayCard: {
              x: 460,
              y: 95,
              title: '64-BIT SNOWFLAKE LAYOUT',
              rows: [
                { label: 'Sign (1 bit)', value: '0 (positive)', pct: 5, tone: 'slate' },
                { label: 'Timestamp (41 bits)', value: '69 yrs (ms)', pct: 64, tone: 'green' },
                { label: 'DC + Node (10 bits)', value: '1,024 nodes', pct: 18, tone: 'blue' },
                { label: 'Sequence (12 bits)', value: '4,096 / ms', pct: 20, tone: 'purple' },
              ],
              footer: '4.19 Billion IDs/sec across 1,024 nodes!',
            },
            legend: [{ label: 'sequential B+ Tree append', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'cap',
      sources: [
        { title: 'Seth Gilbert and Nancy Lynch, Perspectives on the CAP Theorem', url: 'https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf' },
        { title: 'Daniel Abadi, Consistency Tradeoffs in Modern Distributed Database System Design', url: 'https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf' },
      ],
      title: 'CAP & Consistency',
      subtitle: 'CAP Theorem, PACELC (Latency vs Consistency), Linearizability, Causal Consistency, Vector Clocks & CRDTs.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
      tags: ['cap theorem', 'pacelc', 'linearizability', 'eventual consistency', 'causal', 'crdt', 'vector clocks'],
      objectives: [
        'Explain what a partition means for a specific operation',
        'Apply PACELC to reason about Latency vs Consistency during normal operation',
        'Compare Linearizable, Causal, and Eventual consistency + CRDTs',
      ],
      steps: [
        {
          shortLabel: 'CAP & PACELC',
          stage: 'INSIGHT',
          title: 'What can an isolated replica promise to a reader?',
          body: [
            'A write completes on one side of a network split. An isolated replica cannot tell whether that write occurred. If it must answer every read successfully while the split persists, its local answer can violate **linearizability**. If it waits for evidence, that read can remain unavailable.',
            '**PACELC** also asks about normal operation. A write that requires an acknowledgment from another region pays for the network round trip even when every link is healthy. State the placement and the contract for the operation you are designing.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'An inventory service can offer a stale browse page and still require a conditional write at the authoritative store to reserve an item. Describe the failure behavior of each endpoint.',
          },
          scene: {
            hud: [
              { label: 'ON PARTITION', value: 'CP vs AP', status: 'warn' },
              { label: 'NORMAL OPS', value: 'Latency vs Cons.', status: 'info' },
              { label: 'RESERVATION', value: 'Wait or reject', status: 'info' },
              { label: 'BROWSE', value: 'Stale read allowed', status: 'good' },
            ],
            nodes: [
              { id: 'us', type: 'db', x: 185, y: 155, label: 'US-East Cluster', sublabel: 'Majority (2/3)', tone: 'green', badge: 'CP: active', badgeTone: 'green' },
              { id: 'eu', type: 'db', x: 575, y: 155, label: 'EU-West Node', sublabel: 'Isolated (1/3)', tone: 'coral', badge: 'CP: 503 · AP: stale OK', badgeTone: 'rose' },
              { id: 'cut', type: 'hex', x: 380, y: 315, label: 'Network Split', sublabel: 'Fiber Cut (P)', tone: 'amber' },
            ],
            edges: [
              { from: 'us', to: 'eu', label: '✕ PARTITIONED', packetColor: 'coral', dashed: true, packetCount: 0 },
              { from: 'cut', to: 'us', label: 'CP serves', packetColor: 'green', speed: 2.0 },
              { from: 'cut', to: 'eu', label: 'AP serves stale', packetColor: 'amber', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'consistent majority', tone: 'green' },
              { label: 'partitioned link', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Spectrum & CRDTs',
          stage: 'TECHNIQUE',
          title: 'Choose a visibility guarantee and a merge rule',
          body: [
            '**Linearizability** makes operations on an object appear to take effect in an order that respects real time. **Causal consistency** preserves dependencies. A reader who sees a reply can also see the comment that the reply depended on, while unrelated writes can be observed in different orders.',
            'A **conflict-free replicated data type** defines operations and a merge or delivery protocol that make replicas converge when they receive the same updates. A grow-only counter is one example. Its merge rule and the freshness of a read are separate design choices.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'To sell a unique seat, reserve it with a conditional operation on its authoritative record. To transfer money across accounts, also define how both balance updates commit atomically and which isolation level maintains the invariant.',
          },
          scene: {
            hud: [
              { label: 'REAL-TIME ORDER', value: 'Linearizable', status: 'info' },
              { label: 'DEPENDENCIES', value: 'Causal', status: 'info' },
              { label: 'AFTER PROPAGATION', value: 'Convergence', status: 'good' },
              { label: 'MERGE EXAMPLE', value: 'CRDT counter', status: 'good' },
            ],
            nodes: [
              { id: 'lin', type: 'hex', x: 135, y: 215, label: 'Linearizable', sublabel: 'Conditional seat claim', tone: 'purple' },
              { id: 'cau', type: 'hex', x: 380, y: 215, label: 'Causal', sublabel: 'Feeds · Comments', tone: 'blue' },
              { id: 'crdt', type: 'hex', x: 625, y: 215, label: 'Eventual + CRDT', sublabel: 'Docs · Counters', tone: 'green', badge: 'converges!', badgeTone: 'green' },
            ],
            edges: [],
            legend: [{ label: 'Exclusive claim', tone: 'purple' }, { label: 'Dependent reads', tone: 'blue' }, { label: 'Mergeable updates', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'consensus',
      sources: [{ title: 'Diego Ongaro and John Ousterhout, Raft leader election and safety', url: 'https://raft.github.io/raft.pdf' }],
      title: 'Consensus & Leaders',
      subtitle: 'Preventing Split-Brain with Raft Leader Election, Log Replication, Quorums, and Fencing Tokens.',
      duration: '10 min',
      level: 'Advanced',
      companies: ['Google', 'Microsoft', 'Amazon', 'Cloudflare'],
      tags: ['raft', 'paxos', 'etcd', 'zookeeper', 'split-brain', 'fencing token', 'distributed lock'],
      objectives: [
        'Calculate the number of reachable voters required for a majority',
        'Step through Raft Leader Election (Terms, Randomized Timeouts, Majority Votes)',
        'Use monotonic Fencing Tokens to make distributed locks safe across GC pauses',
      ],
      steps: [
        {
          shortLabel: 'Raft Election',
          stage: 'SOLUTION',
          title: 'A Raft term can have at most one elected leader',
          body: [
            'In a **5-voter Raft group**, the leader sends heartbeats. When a follower’s randomized election timer expires, it increments its term, becomes a candidate and requests votes. A voter checks the candidate’s log before granting its vote.',
            'A voter grants at most one vote per term. Any two majorities share at least one voter, so only one candidate can win in a term. A split vote can leave a term without a leader until a later election succeeds.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'A stable four-voter configuration is valid and requires three votes. Three voters require two. Both tolerate one unavailable voter, which explains why three is a common choice. Five voters tolerate two unavailable voters when the remaining three can communicate.',
          },
          scene: {
            hud: [
              { label: 'CLUSTER SIZE', value: '5 Nodes (Odd)', status: 'good' },
              { label: 'QUORUM', value: '3 / 5 Votes', status: 'good' },
              { label: 'FAULT TOLERANCE', value: '2 Failures', status: 'good' },
              { label: 'TERM', value: 'Term #7', status: 'info' },
            ],
            nodes: [
              { id: 'ldr', type: 'hex', x: 380, y: 120, label: 'Node 1', sublabel: 'Term #7 Leader', tone: 'green', badge: 'elected (4/5)', badgeTone: 'green' },
              { id: 'f2', type: 'hex', x: 165, y: 295, label: 'Node 2', sublabel: 'Follower', tone: 'blue' },
              { id: 'f3', type: 'hex', x: 380, y: 325, label: 'Node 3', sublabel: 'Follower', tone: 'blue' },
              { id: 'f4', type: 'hex', x: 595, y: 295, label: 'Node 4', sublabel: 'Follower', tone: 'blue' },
              { id: 'f5', type: 'hex', x: 645, y: 125, label: 'Node 5', sublabel: 'Offline', tone: 'coral', badge: 'down', badgeTone: 'rose', dim: true },
            ],
            edges: [
              { from: 'ldr', to: 'f2', label: 'AppendEntries', packetColor: 'green', bidirectional: true, speed: 1.7 },
              { from: 'ldr', to: 'f3', label: 'AppendEntries', packetColor: 'green', bidirectional: true, speed: 1.7 },
              { from: 'ldr', to: 'f4', label: 'AppendEntries', packetColor: 'green', bidirectional: true, speed: 1.7 },
              { from: 'ldr', to: 'f5', label: 'unreachable', packetColor: 'coral', dashed: true, dim: true, speed: 3.0 },
            ],
            legend: [
              { label: 'Raft heartbeat / log commit', tone: 'green' },
              { label: 'tolerated failure', tone: 'coral' },
            ],
          },
        },
        {
          shortLabel: 'Fencing Tokens',
          stage: 'TECHNIQUE',
          title: 'Why Redis locks alone fail — and how Fencing Tokens save you',
          body: [
            'Suppose Worker A grabs a 10-second lock, then freezes for 15 seconds due to a JVM **GC pause**. The lock expires and Worker B acquires it. Then Worker A wakes up and blindly overwrites the storage file!',
            'Issue a strictly increasing **fencing token** with each grant. A holds 33 and B holds 34. Once storage accepts B’s write and records 34, it rejects A’s delayed write with 33. Storage must atomically check the recorded maximum and apply each write.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'What happens if storage crashes and forgets its highest token? Persist the fencing state with the protected resource so recovery can still reject an older grant.',
          },
          scene: {
            hud: [
              { label: 'WORKER A', value: 'Token #33 (Stale)', status: 'bad' },
              { label: 'WORKER B', value: 'Token #34 (Valid)', status: 'good' },
              { label: 'STORAGE MAX', value: '34', status: 'info' },
              { label: 'CORRUPTION', value: 'Blocked ✓', status: 'good' },
            ],
            nodes: [
              { id: 'etcd', type: 'hex', x: 140, y: 215, label: 'etcd Lock', sublabel: 'Monotonic Rev', tone: 'purple' },
              { id: 'wa', type: 'hex', x: 385, y: 120, label: 'Worker A', sublabel: 'Woke from GC!', tone: 'coral', badge: 'token 33', badgeTone: 'rose' },
              { id: 'wb', type: 'hex', x: 385, y: 310, label: 'Worker B', sublabel: 'Current Owner', tone: 'green', badge: 'token 34', badgeTone: 'green' },
              { id: 'st', type: 'db', x: 635, y: 215, label: 'Storage', sublabel: 'Rejects < 34', tone: 'blue', badge: 'fenced!', badgeTone: 'green' },
            ],
            edges: [
              { from: 'etcd', to: 'wa', label: '#33 (expired)', packetColor: 'coral', dashed: true, speed: 2.8 },
              { from: 'etcd', to: 'wb', label: '#34 (active)', packetColor: 'green', speed: 1.7 },
              { from: 'wb', to: 'st', label: 'write(#34) ✓', packetColor: 'green', speed: 1.7 },
              { from: 'wa', to: 'st', label: 'write(#33) ✕ REJECT', packetColor: 'coral', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'valid fenced write', tone: 'green' },
              { label: 'stale zombie rejected', tone: 'coral' },
            ],
          },
        },
      ],
    },

    {
      id: 'transactions',
      title: 'Transactions & Isolation',
      subtitle: 'ACID, MVCC snapshots, Isolation Levels, Phantom Reads, Write Skew, and Optimistic vs Pessimistic locking.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Amazon', 'Stripe', 'Google'],
      tags: ['acid', 'mvcc', 'isolation levels', 'write skew', 'phantom read', 'optimistic locking', 'pessimistic locking'],
      objectives: [
        'Explain how MVCC lets readers never block writers and writers never block readers',
        'Compare Read Committed, Repeatable Read (Snapshot), and Serializable',
        'Prevent double-booking Write Skew with `SELECT ... FOR UPDATE` or `@Version` optimistic locking',
      ],
      steps: [
        {
          shortLabel: 'MVCC & Levels',
          stage: 'TECHNIQUE',
          title: 'MVCC snapshots + the 4 SQL Isolation Levels',
          body: [
            'Modern databases (PostgreSQL, MySQL InnoDB) use **MVCC (Multi-Version Concurrency Control)**: every update writes a new versioned row tuple (`xmin`, `xmax`) rather than locking readers out!',
            '**Read Committed** stops dirty reads. **Repeatable Read / Snapshot Isolation** stops non-repeatable reads, BUT still permits **Write Skew** (two on-call doctors both see `on_call_count == 2` in their snapshot and both clock out concurrently, leaving 0 doctors!).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Default PostgreSQL isolation is `READ COMMITTED`, while MySQL InnoDB defaults to `REPEATABLE READ`. Always state your locking/isolation strategy explicitly in booking/payment designs!',
          },
          scene: {
            hud: [
              { label: 'READ COMMITTED', value: 'No Dirty Reads', status: 'info' },
              { label: 'SNAPSHOT / RR', value: 'Write Skew Risk', status: 'warn' },
              { label: 'SERIALIZABLE', value: 'Zero Anomalies', status: 'good' },
              { label: 'ENGINE', value: 'MVCC Versions', status: 'good' },
            ],
            nodes: [
              { id: 't1', type: 'hex', x: 145, y: 135, label: 'Doctor A Tx', sublabel: 'Reads count=2', tone: 'amber' },
              { id: 't2', type: 'hex', x: 145, y: 295, label: 'Doctor B Tx', sublabel: 'Reads count=2', tone: 'amber' },
              { id: 'db', type: 'db', x: 465, y: 215, label: 'Snapshot DB', sublabel: 'Both clock out!', tone: 'coral', badge: 'Write Skew: 0 left!', badgeTone: 'rose' },
            ],
            edges: [
              { from: 't1', to: 'db', label: 'UPDATE A=off', packetColor: 'coral', speed: 1.9 },
              { from: 't2', to: 'db', label: 'UPDATE B=off', packetColor: 'coral', speed: 1.9 },
            ],
            legend: [{ label: 'concurrent write skew', tone: 'coral' }],
          },
        },
        {
          shortLabel: 'Opt vs Pess Lock',
          stage: 'SOLUTION',
          title: 'Preventing double-booking: Optimistic (`@Version`) vs Pessimistic (`FOR UPDATE`)',
          body: [
            '**Optimistic Locking** adds a `version` column: `UPDATE seats SET status="BOOKED", version=version+1 WHERE id=5 AND version=7`. If 0 rows update, a rival won — retry or reject! Zero lock wait under low contention.',
            '**Pessimistic Locking** (`SELECT ... FOR UPDATE`) acquires an exclusive row lock immediately. Best under **extreme contention** (flash sales / BookMyShow front-row seats) where optimistic retries would waste CPU.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Use **Optimistic Locking** for low-contention updates (profile edits, wikis) and **Pessimistic Locking / Redis Lua lease** for high-contention hot seats or flash-sale inventory!',
          },
          scene: {
            hud: [
              { label: 'OPTIMISTIC', value: 'WHERE version=v', status: 'good' },
              { label: 'PESSIMISTIC', value: 'SELECT FOR UPDATE', status: 'good' },
              { label: 'LOW CONTENTION', value: 'Use Optimistic', status: 'info' },
              { label: 'FLASH SALE', value: 'Use Pessimistic', status: 'warn' },
            ],
            nodes: [
              { id: 'u1', type: 'users', x: 120, y: 135, label: 'User 1', sublabel: 'version=7', tone: 'green' },
              { id: 'u2', type: 'users', x: 120, y: 295, label: 'User 2', sublabel: 'version=7', tone: 'coral' },
              { id: 'db', type: 'db', x: 470, y: 215, label: 'Seat A5 Row', sublabel: 'v7 → v8 Atomic', tone: 'purple', badge: '1 winner only', badgeTone: 'green' },
            ],
            edges: [
              { from: 'u1', to: 'db', label: 'CAS v7→v8 (1 row ✓)', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'u2', to: 'db', label: 'CAS v7 (0 rows ✕)', packetColor: 'coral', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'atomic winner', tone: 'green' },
              { label: 'conflict rejected safely', tone: 'coral' },
            ],
          },
        },
      ],
    },

    {
      id: 'files',
      title: 'Files & Media Storage',
      subtitle: 'Object Storage (S3/Azure Blob), Direct Pre-Signed Uploads, 4MB Chunking & Content-Hash Deduplication.',
      duration: '8 min',
      level: 'Beginner',
      companies: ['Dropbox', 'Microsoft', 'YouTube', 'Netflix'],
      tags: ['s3', 'azure blob', 'presigned url', 'multipart upload', 'deduplication', 'erasure coding'],
      objectives: [
        'Never stream large files through application servers — use Pre-Signed URLs',
        'Split large files into content-addressed chunks for resumable delta sync & dedup',
        'Separate durable Object Storage (11 nines) from relational Metadata DB',
      ],
      steps: [
        {
          shortLabel: 'Pre-signed URLs',
          stage: 'SOLUTION',
          title: 'Bypass app servers with Direct-to-Object-Storage Pre-Signed URLs',
          body: [
            'Uploading 2 GB videos through your Node/Java API servers saturates RAM, sockets, and bandwidth. Instead, the client asks your API for a **short-lived Pre-Signed URL** (valid 5 min, scoped to 1 key + max size).',
            'The client uploads chunks **directly to S3 / Azure Blob Storage** (11 nines = `99.999999999%` durability via erasure coding). Object Storage then fires an async event to your **Transcoder / Metadata Worker**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Split files into **4 MB chunks** hashed by `SHA-256`: if two users upload the same PDF or you edit 1 paragraph of a 100 MB PowerPoint, only the 1 changed chunk ever uploads (Dropbox & OneDrive delta sync!).',
          },
          scene: {
            hud: [
              { label: 'APP SERVER BW', value: 'Near Zero', status: 'good' },
              { label: 'DURABILITY', value: '11 Nines (S3/Blob)', status: 'good' },
              { label: 'RESUMABLE', value: '4 MB Multipart', status: 'good' },
              { label: 'DEDUP', value: 'SHA-256 Chunk Hash', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 110, y: 215, label: 'Client', sublabel: '2 GB Video', tone: 'slate' },
              { id: 'api', type: 'hex', x: 350, y: 105, label: 'API + Meta DB', sublabel: 'Signs URL (2 KB)', tone: 'blue' },
              { id: 's3', type: 'db', x: 400, y: 300, label: 'Object Storage', sublabel: 'S3 / Azure Blob', tone: 'green', badge: 'direct upload', badgeTone: 'green' },
              { id: 'wk', type: 'hex', x: 645, y: 215, label: 'Async Pipeline', sublabel: 'Virus Scan · HLS', tone: 'purple' },
            ],
            edges: [
              { from: 'c', to: 'api', label: '1. get signed URL', packetColor: 'blue', bidirectional: true, speed: 1.8 },
              { from: 'c', to: 's3', label: '2. PUT 4MB chunks direct', packetColor: 'green', speed: 1.5, packetCount: 3 },
              { from: 's3', to: 'wk', label: '3. S3 Event trigger', packetColor: 'purple', dashed: true, speed: 2.2 },
            ],
            legend: [
              { label: 'tiny auth control plane', tone: 'blue' },
              { label: 'direct high-throughput media', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Storage Tiers',
          stage: 'TECHNIQUE',
          title: 'Lifecycle Policies: Hot → Cool → Archive slashes storage bills 85%',
          body: [
            'Most media follows an extreme age curve: 95% of views happen in the first 30 days. Automated **Lifecycle Rules** move untouched objects from **Hot Standard** → **Infrequent Access** → **Glacier / Cold Archive** (10× cheaper per TB) while keeping metadata instant.',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning Lifecycle Tiering + CDN Origin Cache + SHA-256 Deduplication shows strong FinOps / cost-architecture awareness (a core Microsoft L63 & Amazon L6 rubric item!).',
          },
          scene: {
            hud: [
              { label: 'DAYS 0–30', value: 'Hot + CDN', status: 'good' },
              { label: 'DAYS 31–180', value: 'Cool / IA (-45%)', status: 'info' },
              { label: 'DAYS 180+', value: 'Archive (-85%)', status: 'good' },
              { label: 'METADATA', value: 'Always Instant', status: 'good' },
            ],
            nodes: [
              { id: 'h', type: 'cache', x: 165, y: 215, label: 'Hot + CDN', sublabel: '0–30 days', tone: 'green' },
              { id: 'c', type: 'db', x: 400, y: 215, label: 'Cool / IA', sublabel: '31–180 days', tone: 'blue' },
              { id: 'a', type: 'db', x: 635, y: 215, label: 'Cold Archive', sublabel: '180d+ (Compliance)', tone: 'purple' },
            ],
            edges: [
              { from: 'h', to: 'c', label: 'auto-tier 30d', packetColor: 'blue', speed: 2.2 },
              { from: 'c', to: 'a', label: 'auto-tier 180d', packetColor: 'purple', speed: 2.4 },
            ],
            legend: [{ label: 'automated cost lifecycle', tone: 'purple' }],
          },
        },
      ],
    },
  ],
};
