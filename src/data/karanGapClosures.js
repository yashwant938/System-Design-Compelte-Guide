// 12 Gap-Closure Lessons from karanpratapsingh/system-design & Staff Infrastructure Internals
// Brings the complete curriculum to exactly 100 interactive multi-step lessons across 14 modules!

export const EXTRA_MOD_01_FOUNDATIONS = [
  {
    id: 'osi-ip-tcp-udp',
    title: 'OSI Model, IP, TCP vs UDP',
    subtitle: 'All 7 OSI layers, IPv4/CIDR/IPv6/NAT, TCP reliability & congestion control vs low-latency UDP.',
    duration: '10 min',
    level: 'Beginner',
    companies: ['Microsoft', 'Google', 'Cloudflare', 'Amazon'],
    tags: ['osi model', 'tcp', 'udp', 'ipv4', 'ipv6', 'nat', 'cidr', 'flow control', 'congestion control'],
    objectives: [
      'Map real systems components (BGP, L4 NLB, L7 Envoy, TLS, HTTP/gRPC) onto the 7 OSI layers',
      'Explain IPv4/CIDR, Private RFC-1918 subnets, NAT traversal, and IPv6',
      'Compare TCP (3-way handshake, flow/congestion control, ordered delivery) vs UDP (gaming, VoIP, DNS, QUIC)',
    ],
    steps: [
      {
        shortLabel: 'OSI & IP/NAT',
        stage: 'SETUP',
        title: 'Where System Design Lives on the 7-Layer OSI & TCP/IP Stack',
        body: [
          'Every network hop encapsulates data down the **OSI Stack**: **L7 Application** (HTTP/3, gRPC, DNS), **L6 Presentation** (TLS encryption, Protobuf), **L5 Session**, **L4 Transport** (TCP/UDP ports + L4 Load Balancers), **L3 Network** (IPv4/IPv6 routing & BGP Anycast), **L2 Data Link** (Ethernet MAC / Switches), **L1 Physical** (Fiber optics).',
          'Because IPv4 only has `2^32 ≈ 4.3 Billion` addresses, **NAT (Network Address Translation)** lets thousands of private `10.0.x.x` VPC servers or home devices share one public IP via port mapping — while **IPv6** provides `2^128` unique addresses!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'In interviews, you operate primarily at **L3 (IP/BGP Anycast)**, **L4 (TCP/UDP NLB)**, and **L7 (HTTP/gRPC/WebSocket ALB & API Gateway)**.',
        },
        scene: {
          hud: [
            { label: 'L7 (APP)', value: 'HTTP · gRPC · WS', status: 'good' },
            { label: 'L4 (TRANSPORT)', value: 'TCP / UDP Ports', status: 'info' },
            { label: 'L3 (NETWORK)', value: 'IPv4/IPv6 · Anycast', status: 'info' },
            { label: 'NAT ROLE', value: 'Private ↔ Public IP', status: 'good' },
          ],
          nodes: [
            { id: 'l7', type: 'hex', x: 135, y: 215, label: 'L7 App/TLS', sublabel: 'Envoy / HTTP / gRPC', tone: 'green' },
            { id: 'l4', type: 'hex', x: 350, y: 215, label: 'L4 TCP/UDP', sublabel: 'NLB / Port :443', tone: 'blue' },
            { id: 'l3', type: 'hex', x: 545, y: 120, label: 'L3 IP + NAT', sublabel: '10.0.1.5 ↔ Pub IP', tone: 'purple' },
            { id: 'l1', type: 'hex', x: 545, y: 315, label: 'L1–L2 Fiber', sublabel: 'Ethernet / BGP', tone: 'amber' },
          ],
          edges: [
            { from: 'l7', to: 'l4', label: 'segment', packetColor: 'blue', speed: 1.7 },
            { from: 'l4', to: 'l3', label: 'IP packet', packetColor: 'purple', speed: 1.7 },
            { from: 'l3', to: 'l1', label: 'wire frames', packetColor: 'amber', speed: 1.7 },
          ],
          legend: [{ label: 'packet encapsulation down OSI', tone: 'blue' }],
        },
      },
      {
        shortLabel: 'TCP vs UDP',
        stage: 'TRADEOFF',
        title: 'TCP Guarantees Order & Reliability; UDP Trades Guarantees for Raw Speed',
        body: [
          '**TCP** enforces **3-Way Handshake**, **ACK + Retransmission**, **Flow Control** (receiver window prevents overflowing slow clients), and **Congestion Control** (Slow Start + AIMD/BBR prevents melting routers) — ideal for payments, APIs, SQL, and files.',
          '**UDP** is connectionless fire-and-forget with an 8-byte header and ZERO retransmit stalls — mandatory for **WebRTC video calls (Zoom/Teams)**, **FPS multiplayer gaming**, **DNS**, and as the foundation of **HTTP/3 QUIC**!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Never design live audio/video calls over TCP! One lost packet forces TCP to stall all subsequent frames waiting for retransmit — causing robotic voice freeze!',
        },
        scene: {
          hud: [
            { label: 'TCP HEADER', value: '20B · Ordered + ACK', status: 'info' },
            { label: 'UDP HEADER', value: '8B · Zero Stall', status: 'good' },
            { label: 'USE TCP FOR', value: 'REST · DB · Banking', status: 'good' },
            { label: 'USE UDP FOR', value: 'VoIP · Games · QUIC', status: 'good' },
          ],
          nodes: [
            { id: 'src', type: 'users', x: 115, y: 215, label: 'Sender', sublabel: 'App Stream', tone: 'slate' },
            { id: 'tcp', type: 'hex', x: 430, y: 120, label: 'TCP Channel', sublabel: 'ACK · Retransmit · BBR', tone: 'blue', callout: '100% lossless' },
            { id: 'udp', type: 'hex', x: 430, y: 315, label: 'UDP Datagrams', sublabel: 'Drop Late Frames OK', tone: 'green', callout: 'lowest latency' },
          ],
          edges: [
            { from: 'src', to: 'tcp', label: 'ordered ACKs', packetColor: 'blue', bidirectional: true, speed: 2.0 },
            { from: 'src', to: 'udp', label: 'fast stream', packetColor: 'green', speed: 1.3, packetCount: 3 },
          ],
          legend: [
            { label: 'reliable ordered TCP', tone: 'blue' },
            { label: 'low-latency UDP', tone: 'green' },
          ],
        },
      },
    ],
    deepDive: {
      tradeoffs: [
        { option: 'TCP (BBR / Cubic)', bestWhen: 'HTTP/1.1, HTTP/2, gRPC, Databases, Kafka, Payments', pros: 'Guaranteed ordered delivery, built-in congestion & flow control', cons: '1-RTT handshake, Head-of-Line blocking on lost packets' },
        { option: 'UDP', bestWhen: 'WebRTC calls, Online FPS games, DNS lookups, Telemetry, QUIC', pros: 'Zero handshake, 8-byte header, no retransmission stalls', cons: 'Packets can drop or arrive out of order (app must handle if needed)' },
      ],
    },
  },
];

export const EXTRA_MOD_02_SCALING = [
  {
    id: 'proxies-forward-reverse',
    title: 'Forward vs Reverse Proxy & API Gateway',
    subtitle: 'Client-side shielding (Forward Proxy/VPN) vs Server-side routing, TLS termination, caching & API Gateways.',
    duration: '8 min',
    level: 'Beginner',
    companies: ['Cloudflare', 'Microsoft', 'Amazon', 'Google'],
    tags: ['forward proxy', 'reverse proxy', 'api gateway', 'nginx', 'envoy', 'vpn', 'bff'],
    objectives: [
      'Distinguish Forward Proxy (acts for clients) from Reverse Proxy (acts for origin servers)',
      'Clarify how Reverse Proxy, Load Balancer, and API Gateway overlap and differ',
      'Apply the Backend-for-Frontend (BFF) gateway pattern cleanly for Web vs Mobile clients',
    ],
    steps: [
      {
        shortLabel: 'Forward vs Reverse',
        stage: 'SETUP',
        title: 'Forward Proxy hides the Client; Reverse Proxy hides the Servers',
        body: [
          'A **Forward Proxy** sits in front of **clients** (corporate firewall, school filter, VPN, egress NAT gateway): the destination website sees the Proxy’s IP, NEVER the individual user’s internal IP. Used for egress compliance, caching outbound downloads, and bypassing geo-blocks.',
          'A **Reverse Proxy** (NGINX, Envoy, Cloudflare) sits in front of **backend servers**: clients think they are talking directly to `api.company.com`, while the Reverse Proxy handles **TLS termination, gzip/Brotli compression, static caching, DDoS WAF, and hiding internal IPs**!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Mental shortcut: **Forward Proxy protects/controls Clients** going OUT to the internet; **Reverse Proxy protects/accelerates Servers** receiving traffic coming IN!',
        },
        scene: {
          hud: [
            { label: 'FORWARD PROXY', value: 'Client-Side Shield', status: 'info' },
            { label: 'REVERSE PROXY', value: 'Server-Side Shield', status: 'good' },
            { label: 'API GATEWAY', value: 'L7 Auth + RL + BFF', status: 'good' },
            { label: 'LOAD BALANCER', value: 'Health + Spread', status: 'good' },
          ],
          nodes: [
            { id: 'c', type: 'users', x: 95, y: 215, label: 'Corp Users', sublabel: 'Private LAN', tone: 'slate' },
            { id: 'fp', type: 'hex', x: 265, y: 215, label: 'Forward Proxy', sublabel: 'Hides Client IP', tone: 'amber', callout: 'egress' },
            { id: 'rp', type: 'hex', x: 475, y: 215, label: 'Reverse Proxy', sublabel: 'TLS · WAF · Cache', tone: 'green', callout: 'ingress' },
            { id: 's1', type: 'hex', x: 665, y: 125, label: 'Origin 1', sublabel: 'Hidden IP', tone: 'blue' },
            { id: 's2', type: 'hex', x: 665, y: 305, label: 'Origin 2', sublabel: 'Hidden IP', tone: 'blue' },
          ],
          edges: [
            { from: 'c', to: 'fp', label: 'outbound', packetColor: 'amber', speed: 1.8 },
            { from: 'fp', to: 'rp', label: 'public internet', packetColor: 'green', bidirectional: true, speed: 1.9 },
            { from: 'rp', to: 's1', label: 'internal', packetColor: 'blue', speed: 1.6 },
            { from: 'rp', to: 's2', label: 'internal', packetColor: 'blue', speed: 1.6 },
          ],
          legend: [
            { label: 'forward egress proxy', tone: 'amber' },
            { label: 'reverse ingress proxy', tone: 'green' },
          ],
        },
      },
      {
        shortLabel: 'API Gateway / BFF',
        stage: 'TECHNIQUE',
        title: 'API Gateway & Backend-for-Frontend (BFF) without Building a Bottleneck',
        body: [
          'An **API Gateway** (Kong, AWS API GW, Azure APIM, Envoy) is a specialized L7 Reverse Proxy tailored for microservices: **JWT Auth verification, Rate Limiting, Protocol Translation (REST → gRPC), Canary Routing, and Request Aggregation**.',
          'With **BFF (Backend-for-Frontend)**, Mobile gets a tiny compact JSON gateway while Web gets a rich dashboard gateway — **Watch Out**: never put complex business logic inside your API Gateway, or it turns into a giant single-point-of-failure monolith!',
        ],
        callout: {
          type: 'WATCH OUT',
          text: 'Keep API Gateways **thin and stateless** — cross-cutting concerns only (Auth, Rate Limit, Routing, Tracing), NEVER core domain business rules!',
        },
        scene: {
          hud: [
            { label: 'MOBILE BFF', value: 'Compact Payloads', status: 'good' },
            { label: 'WEB BFF', value: 'Rich Aggregation', status: 'good' },
            { label: 'ANTI-PATTERN', value: 'Fat Business GW', status: 'bad' },
            { label: 'UPSTREAM', value: 'Internal gRPC', status: 'info' },
          ],
          nodes: [
            { id: 'm', type: 'users', x: 110, y: 125, label: 'iOS / Android', sublabel: 'Low Bandwidth', tone: 'slate' },
            { id: 'w', type: 'users', x: 110, y: 305, label: 'Web Browser', sublabel: 'Rich UI', tone: 'slate' },
            { id: 'bm', type: 'hex', x: 375, y: 125, label: 'Mobile BFF', sublabel: 'Trimmed JSON', tone: 'green' },
            { id: 'bw', type: 'hex', x: 375, y: 305, label: 'Web BFF', sublabel: 'Full GraphQL', tone: 'purple' },
            { id: 'core', type: 'hex', x: 645, y: 215, label: 'Core gRPC Svcs', sublabel: 'Shared Domain', tone: 'blue' },
          ],
          edges: [
            { from: 'm', to: 'bm', label: 'HTTPS', packetColor: 'green', speed: 1.6 },
            { from: 'w', to: 'bw', label: 'HTTPS', packetColor: 'purple', speed: 1.6 },
            { from: 'bm', to: 'core', label: 'gRPC', packetColor: 'blue', speed: 1.6 },
            { from: 'bw', to: 'core', label: 'gRPC', packetColor: 'blue', speed: 1.6 },
          ],
          legend: [{ label: 'tailored BFF edge gateways', tone: 'green' }],
        },
      },
    ],
  },

  {
    id: 'clustering-ha',
    title: 'Clustering, Heartbeats & Fencing',
    subtitle: 'Shared-Nothing vs Shared-Disk clusters, Active-Active vs Active-Passive failover, Split-Brain & STONITH fencing.',
    duration: '8 min',
    level: 'Intermediate',
    companies: ['Microsoft', 'Amazon', 'Oracle', 'Google'],
    tags: ['clustering', 'heartbeat', 'split-brain', 'stonith', 'shared-nothing', 'active-passive', 'quorum'],
    objectives: [
      'Compare Shared-Nothing (Cassandra/Postgres shards) vs Shared-Disk (Aurora/SAN) cluster architectures',
      'Detect node deaths accurately with Heartbeats & Phi Accrual Failure Detectors',
      'Eliminate dual-primary Split-Brain corruption using Quorum + STONITH hardware/API fencing',
    ],
    steps: [
      {
        shortLabel: 'Cluster Types',
        stage: 'SETUP',
        title: 'Shared-Nothing Scales Linearly; Shared-Storage Simplifies Failover',
        body: [
          'A **Cluster** links multiple servers to act as one resilient system. In **Shared-Nothing** clusters (Cassandra, Kafka, sharded MySQL), every node owns its own CPU, RAM, and local NVMe disk — zero central storage lock, linear horizontal scale!',
          'In **Shared-Storage** cloud clusters (AWS Aurora, Azure SQL Hyperscale, Neon), stateless compute nodes share a distributed quorum storage layer — failing over to a new primary takes seconds with ZERO data copying!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Modern cloud-native databases decouple **Stateless Compute** from **Distributed Quorum Storage** (Aurora / AlloyDB / Neon) to get fast failover AND effortless read-replica scaling!',
        },
        scene: {
          hud: [
            { label: 'SHARED-NOTHING', value: 'Kafka · Cassandra', status: 'good' },
            { label: 'SHARED-STORAGE', value: 'Aurora · Neon · SQL', status: 'good' },
            { label: 'FAILURE DETECT', value: 'Phi Accrual Beat', status: 'info' },
            { label: 'SPLIT-BRAIN FIX', value: 'Quorum + STONITH', status: 'good' },
          ],
          nodes: [
            { id: 'c1', type: 'hex', x: 185, y: 120, label: 'Compute Primary', sublabel: 'Stateless SQL', tone: 'green', callout: 'writes' },
            { id: 'c2', type: 'hex', x: 565, y: 120, label: 'Compute Standby', sublabel: 'Instant Promote', tone: 'blue', callout: 'reads' },
            { id: 'st', type: 'db', x: 375, y: 310, label: 'Distributed Storage', sublabel: '6-Way Replicated Log', tone: 'purple', badge: 'decoupled layer', badgeTone: 'purple' },
          ],
          edges: [
            { from: 'c1', to: 'st', label: 'WAL write', packetColor: 'green', speed: 1.6 },
            { from: 'c2', to: 'st', label: 'read pages', packetColor: 'blue', bidirectional: true, speed: 1.8 },
            { from: 'c1', to: 'c2', label: 'heartbeat', packetColor: 'amber', dashed: true, speed: 2.2 },
          ],
          legend: [{ label: 'decoupled compute-storage cluster', tone: 'green' }],
        },
      },
      {
        shortLabel: 'STONITH Fence',
        stage: 'SOLUTION',
        title: 'Preventing Two Active Primaries (Split-Brain) with Quorum & STONITH',
        body: [
          'In a 2-node Active-Passive cluster, if the heartbeat cable snaps, Standby assumes Primary died and promotes itself — now **BOTH nodes accept writes** and corrupt data permanently (**Split-Brain**)!',
          '**Fix**: 1) Require an **odd-node Quorum (3+ witnesses / etcd)** to hold leadership, and 2) **STONITH ("Shoot The Other Node In The Head")** — power-fence or revoke the old primary’s storage/cloud API lease BEFORE the new primary accepts a single write!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Never design a 2-node HA cluster without a **3rd Tie-Breaker / Witness Node (Quorum)** + **Fencing Token / STONITH** — 2 nodes alone cannot distinguish "peer died" from "heartbeat link dropped"!',
        },
        scene: {
          hud: [
            { label: 'WITNESS NODE', value: '3rd Quorum Vote', status: 'good' },
            { label: 'OLD PRIMARY', value: 'Fenced / Revoked', status: 'warn' },
            { label: 'NEW PRIMARY', value: 'Epoch #8 Safe ✓', status: 'good' },
            { label: 'DATA CORRUPTION', value: 'Zero', status: 'good' },
          ],
          nodes: [
            { id: 'w', type: 'hex', x: 380, y: 90, label: 'etcd Witness', sublabel: 'Breaks 2-Node Tie', tone: 'purple' },
            { id: 'old', type: 'hex', x: 165, y: 290, label: 'Old Primary', sublabel: 'Lease Revoked!', tone: 'coral', dim: true, callout: 'fenced' },
            { id: 'new', type: 'hex', x: 595, y: 290, label: 'New Primary', sublabel: '2/3 Votes Won ✓', tone: 'green', callout: 'active' },
          ],
          edges: [
            { from: 'w', to: 'new', label: 'grant epoch #8', packetColor: 'green', speed: 1.6 },
            { from: 'w', to: 'old', label: 'STONITH revoke', packetColor: 'coral', dashed: true, speed: 2.4 },
          ],
          legend: [{ label: 'quorum-fenced failover', tone: 'green' }],
        },
      },
    ],
  },
];

export const EXTRA_MOD_03_DATA = [
  {
    id: 'storage-block-file-object-raid',
    title: 'Block, File, Object Storage & RAID',
    subtitle: 'EBS/NVMe Block vs NFS/EFS File vs S3 Object Storage, plus RAID 0/1/5/6/10 vs Cloud Erasure Coding.',
    duration: '9 min',
    level: 'Beginner',
    companies: ['Amazon', 'Microsoft', 'Google', 'Dropbox'],
    tags: ['block storage', 'file storage', 'object storage', 'raid', 'erasure coding', 'ebs', 'nfs', 'san', 'nas'],
    objectives: [
      'Choose correctly between Block (EBS/NVMe), File (NFS/EFS/SMB), and Object Storage (S3/Azure Blob)',
      'Contrast RAID 0, 1, 5, 6, and 10 performance vs redundancy overhead',
      'Explain why cloud Object Stores replace 3× replication with Reed-Solomon Erasure Coding (1.3×–1.5× overhead!)',
    ],
    steps: [
      {
        shortLabel: '3 Storage Types',
        stage: 'SETUP',
        title: 'Block for Databases, File for Shared POSIX Apps, Object for Massive Blobs',
        body: [
          '1. **Block Storage** (AWS EBS, Azure Managed Disk, Local NVMe): Splits disk into raw fixed-size blocks with ultra-low sub-ms random I/O — required for **Databases (Postgres, Kafka, OS boot disks)** (typically mounted by 1 VM at a time).',
          '2. **File Storage** (NFS, AWS EFS, Azure Files): Shared hierarchical folder tree mounted by hundreds of servers simultaneously — great for shared configs, ML datasets, and legacy enterprise apps.',
          '3. **Object Storage** (S3, Azure Blob, GCS): Flat HTTP key-value blobs + metadata, infinitely scalable, 11 nines durability, cheapest per TB — mandatory for **images, videos, backups, and Iceberg data lakes**!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Never mount S3/Blob as a live SQL database disk (no fast in-place byte overwrites!), and never store 50 TB of user videos on expensive EBS Block Storage!',
        },
        scene: {
          hud: [
            { label: 'BLOCK (EBS/NVME)', value: '< 1ms · Databases', status: 'good' },
            { label: 'FILE (NFS/EFS)', value: 'Shared POSIX Tree', status: 'info' },
            { label: 'OBJECT (S3/BLOB)', value: 'HTTP · Exabyte Cheap', status: 'good' },
            { label: 'DURABILITY', value: '99.999999999%', status: 'good' },
          ],
          nodes: [
            { id: 'blk', type: 'db', x: 145, y: 215, label: 'Block (EBS)', sublabel: 'Postgres / Kafka', tone: 'purple', callout: 'sub-ms IOPS' },
            { id: 'fil', type: 'db', x: 390, y: 215, label: 'File (EFS/NFS)', sublabel: 'Shared Folders', tone: 'blue', callout: 'POSIX mount' },
            { id: 'obj', type: 'db', x: 635, y: 215, label: 'Object (S3)', sublabel: 'Videos / Lakehouse', tone: 'green', callout: '$0.02 / GB' },
          ],
          edges: [
            { from: 'blk', to: 'fil', label: 'shared access →', packetColor: 'blue', dashed: true, speed: 2.3 },
            { from: 'fil', to: 'obj', label: 'infinite scale →', packetColor: 'green', dashed: true, speed: 2.3 },
          ],
          legend: [{ label: 'storage tier selection', tone: 'green' }],
        },
      },
      {
        shortLabel: 'RAID & Erasure',
        stage: 'TECHNIQUE',
        title: 'RAID 10 for Fast Local DBs; Erasure Coding Saves 50% Storage in Cloud Blobs',
        body: [
          '**RAID 0** (Striping): 2× speed, **0 redundancy** (1 dead disk loses all!). **RAID 1** (Mirroring): 50% usable space, survives 1 dead disk. **RAID 10** (Striped Mirrors): Fast random writes + high fault tolerance — standard for hot databases!',
          '**Erasure Coding (Reed-Solomon 10+4)** (used by S3, Azure Storage, HDFS): Splits an object into **10 data chunks + 4 parity chunks** across 14 racks — tolerates **4 simultaneous failures** with only **1.4× storage overhead** instead of 3× (300%) replication!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Citing **Reed-Solomon Erasure Coding (e.g., 10 data + 4 parity = 1.4× cost vs 3× replication)** when designing Dropbox/YouTube/Object Storage is pure Storage-Team Staff mastery!',
        },
        scene: {
          hud: [
            { label: '3× REPLICATION', value: '300% Cost · 2 Fails', status: 'warn' },
            { label: 'ERASURE (10+4)', value: '140% Cost · 4 Fails!', status: 'good' },
            { label: 'HOT DB RAID', value: 'RAID 10 (Fast I/O)', status: 'good' },
            { label: 'TRADE-OFF', value: 'Parity CPU on Rebuild', status: 'info' },
          ],
          nodes: [
            { id: 'f', type: 'hex', x: 135, y: 215, label: '100 MB Blob', sublabel: 'Reed-Solomon Encode', tone: 'blue' },
            { id: 'd', type: 'db', x: 430, y: 120, label: '10 Data Shards', sublabel: '10 Racks (100 MB)', tone: 'green' },
            { id: 'p', type: 'db', x: 430, y: 315, label: '4 Parity Shards', sublabel: '4 Racks (+40 MB)', tone: 'purple' },
            { id: 'ok', type: 'hex', x: 665, y: 215, label: 'Any 10 of 14', sublabel: '100% Reconstructible!', tone: 'green' },
          ],
          edges: [
            { from: 'f', to: 'd', label: 'split 10', packetColor: 'green', speed: 1.7 },
            { from: 'f', to: 'p', label: 'compute 4 parity', packetColor: 'purple', speed: 1.9 },
            { from: 'd', to: 'ok', label: 'read fast', packetColor: 'green', speed: 1.6 },
            { from: 'p', to: 'ok', label: 'heal up to 4 dead', packetColor: 'purple', dashed: true, speed: 2.3 },
          ],
          legend: [{ label: '1.4× cost erasure coding durability', tone: 'purple' }],
        },
      },
    ],
  },

  {
    id: 'normalization-federation',
    title: 'Normalization, Denormalization & Federation',
    subtitle: '1NF / 2NF / 3NF / BCNF vs strategic Denormalization for read speed, plus Database Federation (functional partitioning).',
    duration: '9 min',
    level: 'Beginner',
    companies: ['Microsoft', 'Amazon', 'Meta', 'Uber'],
    tags: ['normalization', 'denormalization', '3nf', 'bcnf', 'database federation', 'functional partitioning', 'schema design'],
    objectives: [
      'Apply 1NF → 2NF → 3NF normalization to eliminate insert, update, and delete anomalies',
      'Know when to intentionally Denormalize (caching counts/author names) to avoid expensive multi-table JOINs',
      'Scale monolithic databases BEFORE sharding using Database Federation (splitting by domain)',
    ],
    steps: [
      {
        shortLabel: 'Norm vs Denorm',
        stage: 'TRADEOFF',
        title: 'Normalize for Write Integrity (3NF); Denormalize Selectively for Read Speed',
        body: [
          '**Normalization (1NF → 2NF → 3NF)**: Every non-key attribute depends on *"the key, the whole key, and nothing but the key."* Storing `author_name` once in `users` instead of duplicating it across 10,000 `posts` prevents update anomalies and shrinks write size!',
          '**Denormalization**: In read-heavy apps (100:1 reads), joining 6 normalized tables on every page load crushes CPU! Strategically duplicating `like_count` or `author_username` onto the `posts` row trades tiny extra write/sync work for blazing **0-JOIN single-row reads**!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Rule of thumb: Start **Normalized (3NF)** in OLTP SQL for clean truth, then **Denormalize ONLY proven hot read paths** (or materialize read views via CQRS/NoSQL)!',
        },
        scene: {
          hud: [
            { label: '3NF NORMALIZED', value: 'Zero Update Drift', status: 'good' },
            { label: 'DENORMALIZED', value: '0-JOIN Fast Reads', status: 'good' },
            { label: 'WRITE COST', value: 'Higher on Denorm', status: 'warn' },
            { label: 'NOSQL RULE', value: 'Model by Query', status: 'info' },
          ],
          nodes: [
            { id: 'n', type: 'db', x: 185, y: 215, label: '3NF SQL Truth', sublabel: 'users + posts + likes', tone: 'purple', callout: 'clean writes' },
            { id: 'd', type: 'db', x: 565, y: 215, label: 'Denormalized View', sublabel: 'post + author + count', tone: 'green', callout: '1-hop read' },
          ],
          edges: [
            { from: 'n', to: 'd', label: 'sync / materialize', packetColor: 'green', speed: 1.8 },
          ],
          legend: [{ label: 'write truth → fast read projection', tone: 'green' }],
        },
      },
      {
        shortLabel: 'DB Federation',
        stage: 'SOLUTION',
        title: 'Database Federation (Functional Partitioning): Split by Domain Before Sharding!',
        body: [
          'Before jumping into complex horizontal row sharding, apply **Database Federation**: split one overloaded giant database into separate **domain databases** (`Users DB`, `Products DB`, `Orders DB`)!',
          'Each federated DB gets dedicated CPU/RAM/buffer-pool cache (higher cache hit ratio!) and scales independently — Trade-off: you can no longer run SQL JOINs or single-DB ACID transactions across `Users` and `Orders`!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'The cleanest DB scaling progression to quote in interviews: **1) Indexes + Caching → 2) Read Replicas → 3) Database Federation (split by domain) → 4) Horizontal Row Sharding**!',
        },
        scene: {
          hud: [
            { label: 'FEDERATION', value: 'Split by Domain', status: 'good' },
            { label: 'BUFFER POOL', value: 'Higher Cache Hits', status: 'good' },
            { label: 'CROSS-DB JOINS', value: 'Done in App / API', status: 'warn' },
            { label: 'NEXT STEP', value: 'Shard Hot Domain Only', status: 'info' },
          ],
          nodes: [
            { id: 'app', type: 'hex', x: 135, y: 215, label: 'App / Services', sublabel: 'Domain Routing', tone: 'blue' },
            { id: 'u', type: 'db', x: 525, y: 105, label: 'Users DB', sublabel: 'Auth & Profiles', tone: 'green' },
            { id: 'p', type: 'db', x: 525, y: 215, label: 'Catalog DB', sublabel: 'Products & Media', tone: 'purple' },
            { id: 'o', type: 'db', x: 525, y: 325, label: 'Orders DB', sublabel: 'Billing & Ledger', tone: 'amber' },
          ],
          edges: [
            { from: 'app', to: 'u', label: 'users', packetColor: 'green', speed: 1.7 },
            { from: 'app', to: 'p', label: 'catalog', packetColor: 'purple', speed: 1.7 },
            { from: 'app', to: 'o', label: 'orders', packetColor: 'amber', speed: 1.7 },
          ],
          legend: [{ label: 'functional database federation', tone: 'green' }],
        },
      },
    ],
  },

  {
    id: 'acid-vs-base',
    title: 'ACID vs BASE Consistency Models',
    subtitle: 'Strict transactional safety (ACID) vs Basically Available, Soft State, Eventual Consistency (BASE) at planetary scale.',
    duration: '7 min',
    level: 'Beginner',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta'],
    tags: ['acid', 'base', 'eventual consistency', 'soft state', 'transactions', 'nosql'],
    objectives: [
      'Recite ACID (Atomicity, Consistency, Isolation, Durability) and what breaks if any letter is missing',
      'Explain BASE (Basically Available, Soft State, Eventual Consistency) clearly',
      'Select ACID vs BASE per bounded context inside the SAME product (e.g., Amazon Cart vs Checkout!)',
    ],
    steps: [
      {
        shortLabel: 'ACID vs BASE',
        stage: 'TRADEOFF',
        title: 'Strict Pessimistic Safety (ACID) vs Optimistic Availability (BASE)',
        body: [
          '**ACID** (PostgreSQL, MySQL, Spanner) guarantees every transaction is **Atomic** (all-or-nothing), **Consistent** (invariants hold), **Isolated** (concurrent TXs don’t corrupt each other), and **Durable** (survives power loss via WAL) — prioritizing correctness even if writes wait.',
          '**BASE** (DynamoDB, Cassandra, DNS, Social Likes) prioritizes ultra-low latency and 99.999% availability: **Basically Available** (always responds), **Soft State** (state may change over time without input as gossip/replication converges), and **Eventual Consistency** (all replicas converge once writes stop)!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Real Big Tech apps mix BOTH! On **Amazon.com**, View Counts, Recommendations, and Reviews use **BASE** (fast, always up); Inventory Deduction and Credit Card Charging use strict **ACID**!',
        },
        scene: {
          hud: [
            { label: 'ACID PRIORITY', value: 'Strict Correctness', status: 'info' },
            { label: 'BASE PRIORITY', value: 'High Avail + Speed', status: 'good' },
            { label: 'USE ACID', value: 'Money · Seats · Auth', status: 'good' },
            { label: 'USE BASE', value: 'Likes · Views · Feeds', status: 'good' },
          ],
          nodes: [
            { id: 'app', type: 'hex', x: 135, y: 215, label: 'E-Commerce App', sublabel: 'Hybrid Consistency', tone: 'blue' },
            { id: 'acid', type: 'db', x: 525, y: 120, label: 'ACID Store', sublabel: 'Payments & Stock', tone: 'purple', callout: 'strict CP' },
            { id: 'base', type: 'db', x: 525, y: 315, label: 'BASE Store', sublabel: 'Views · Likes · Cart', tone: 'green', callout: 'fast AP' },
          ],
          edges: [
            { from: 'app', to: 'acid', label: 'strict commit', packetColor: 'purple', bidirectional: true, speed: 1.9 },
            { from: 'app', to: 'base', label: 'sub-5ms AP', packetColor: 'green', bidirectional: true, speed: 1.5 },
          ],
          legend: [
            { label: 'strict ACID boundary', tone: 'purple' },
            { label: 'high-availability BASE', tone: 'green' },
          ],
        },
      },
      {
        shortLabel: 'Hybrid Choice',
        stage: 'TECHNIQUE',
        title: 'How to Justify ACID vs BASE Clearly in 20 Seconds During an Interview',
        body: [
          'Ask one razor-sharp question: **"What is the dollar or trust cost of reading 500 ms stale data?"** If stale data causes double-charging a credit card or overselling a concert seat → **ACID**. If stale data shows `1,402` likes instead of `1,405` for half a second → **BASE**!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Framing consistency around **business cost of staleness** instead of dogma ("SQL is old, NoSQL is modern") immediately distinguishes Senior/Staff architects.',
        },
        scene: {
          hud: [
            { label: 'STALE LIKES', value: '$0 Cost → BASE', status: 'good' },
            { label: 'STALE BALANCE', value: 'High Cost → ACID', status: 'warn' },
            { label: 'CONVERGENCE', value: 'Gossip / Read Repair', status: 'info' },
            { label: 'WAL SAFETY', value: 'fsync Durability', status: 'good' },
          ],
          nodes: [
            { id: 'q', type: 'hex', x: 165, y: 215, label: 'Staleness Cost?', sublabel: 'Evaluate Per Entity', tone: 'amber' },
            { id: 'hi', type: 'db', x: 545, y: 120, label: 'High → ACID', sublabel: 'Ledger · Bookings', tone: 'purple' },
            { id: 'lo', type: 'db', x: 545, y: 310, label: 'Low → BASE', sublabel: 'Feed · Metrics · DNS', tone: 'green' },
          ],
          edges: [
            { from: 'q', to: 'hi', label: 'zero drift allowed', packetColor: 'purple', speed: 1.8 },
            { from: 'q', to: 'lo', label: '500ms lag fine', packetColor: 'green', speed: 1.6 },
          ],
          legend: [{ label: 'business-driven consistency choice', tone: 'green' }],
        },
      },
    ],
  },

  {
    id: 'geohashing-quadtrees-h3',
    title: 'Geohashing, Quadtrees & Spatial Indexes',
    subtitle: 'How Yelp, Uber & Google Maps query 2D `(lat, lng)` in milliseconds: Geohash edge bugs, Quadtrees, S2 & Uber H3.',
    duration: '10 min',
    level: 'Intermediate',
    companies: ['Uber', 'Google', 'Yelp', 'DoorDash'],
    tags: ['geohash', 'quadtree', 'h3', 's2', 'spatial index', 'nearby', 'redis geo', 'postgis'],
    objectives: [
      'Explain why naive SQL `WHERE lat BETWEEN ... AND lng BETWEEN ...` scans millions of rows slowly',
      'Understand Geohash Base32 prefix trees AND solve the Geohash Boundary Edge Bug (query 8 neighbors!)',
      'Compare Static Geohash vs Dynamic Density Quadtrees vs Equidistant Uber H3 Hexagons',
    ],
    steps: [
      {
        shortLabel: 'Geohash & Edge Bug',
        stage: 'PROBLEM',
        title: 'Geohash Encodes 2D Coordinates Into 1D Strings — Watch the Boundary Trap!',
        body: [
          '**Geohash** recursively bisects latitude and longitude into alternating bits encoded in Base32 (`9q8yy`). Longer shared prefix = physically closer! Now a standard B-Tree / Redis index finds nearby points with `LIKE "9q8yy%"`!',
          '**The Classic Boundary Bug**: Two coffee shops **10 meters apart** across a prime grid line can have **completely different Geohash prefixes** (`9q8yy` vs `9q8zn`)! **Mandatory Fix**: Always query your target cell PLUS its **8 surrounding neighbor cells** (9 cells total)!',
        ],
        callout: {
          type: 'WATCH OUT',
          text: 'Forgetting to query the **8 neighboring Geohash cells** around the target cell is the #1 bug interviewers catch in Yelp / Nearby Friends / Uber designs!',
        },
        scene: {
          hud: [
            { label: 'ENCODING', value: 'Base32 Prefix (1D)', status: 'info' },
            { label: 'PRECISION 6', value: '~1.2 km × 0.6 km', status: 'info' },
            { label: 'BOUNDARY FIX', value: 'Center + 8 Neighbors', status: 'good' },
            { label: 'REDIS GEO', value: '52-bit ZSET Geohash', status: 'good' },
          ],
          nodes: [
            { id: 'u', type: 'users', x: 120, y: 215, label: 'User (lat,lng)', sublabel: 'Cell: 9q8yy', tone: 'slate' },
            { id: 'c', type: 'hex', x: 390, y: 125, label: 'Center 9q8yy', sublabel: '10m from border!', tone: 'green' },
            { id: 'n', type: 'hex', x: 390, y: 310, label: '8 Neighbors', sublabel: '9q8zn · 9q8yv ...', tone: 'amber', callout: 'must include!' },
            { id: 'res', type: 'cache', x: 650, y: 215, label: 'Top-K Radius', sublabel: 'Exact Haversine Filter', tone: 'purple' },
          ],
          edges: [
            { from: 'u', to: 'c', label: 'prefix query', packetColor: 'green', speed: 1.6 },
            { from: 'u', to: 'n', label: '+ 8 adjacent cells', packetColor: 'amber', speed: 1.7 },
            { from: 'c', to: 'res', label: 'merge', packetColor: 'purple', speed: 1.7 },
            { from: 'n', to: 'res', label: 'merge', packetColor: 'purple', speed: 1.7 },
          ],
          legend: [{ label: '9-cell boundary-safe geohash search', tone: 'amber' }],
        },
      },
      {
        shortLabel: 'Quadtree vs H3',
        stage: 'SOLUTION',
        title: 'Dynamic Quadtrees (Yelp Static Places) vs H3 Hexagons (Uber Moving Cabs)',
        body: [
          'Manhattan has 10,000 restaurants per km² while the Sahara has 0! A **Quadtree** starts as 1 world rectangle and recursively splits any square into 4 quadrants ONLY when it exceeds `500` businesses — tiny deep grids in cities, huge coarse boxes in deserts! Great for **static places (Yelp)**, expensive to rebalance on 250k moving drivers/sec.',
          'For **rapidly moving vehicles (Uber/DoorDash)**, **Uber H3 Hexagons** (or Redis Geo / Google S2) give O(1) coordinate-to-cell hashing with **6 equidistant neighbors** and zero tree-rebalancing locks!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Rule to quote: **Quadtree** for dense/skewed *static* POIs (Yelp/Google Maps places); **Geohash / Redis Geo / H3 Hexagons** for *high-write moving* entities (Uber drivers / Nearby Friends)!',
        },
        scene: {
          hud: [
            { label: 'STATIC POIS', value: 'Quadtree (Yelp)', status: 'good' },
            { label: 'MOVING CABS', value: 'H3 / Redis Geo', status: 'good' },
            { label: 'H3 GEOMETRY', value: '6 Equidistant Sides', status: 'good' },
            { label: 'UPDATE COST', value: 'O(1) Hash Map', status: 'good' },
          ],
          nodes: [
            { id: 'qt', type: 'hex', x: 185, y: 215, label: 'Quadtree', sublabel: 'Adaptive Density', tone: 'purple', callout: 'static POIs' },
            { id: 'h3', type: 'hex', x: 545, y: 215, label: 'Uber H3 Hex', sublabel: 'O(1) Moving GPS', tone: 'green', callout: '250k updates/s' },
          ],
          edges: [
            { from: 'qt', to: 'h3', label: 'static vs real-time motion', packetColor: 'green', dashed: true, speed: 2.2 },
          ],
          legend: [{ label: 'spatial engine comparison', tone: 'green' }],
        },
      },
    ],
  },

  {
    id: 'probabilistic-structures',
    title: 'Probabilistic Data Structures at Scale',
    subtitle: 'Bloom Filters, HyperLogLog (1B uniques in 12 KB RAM!), Count-Min Sketch & SkipLists in Redis/RocksDB.',
    duration: '9 min',
    level: 'Advanced',
    companies: ['Google', 'Meta', 'Amazon', 'Redis'],
    tags: ['bloom filter', 'hyperloglog', 'count-min sketch', 'skiplist', 'probabilistic', 'unique visitors', 'redis'],
    objectives: [
      'Explain Bloom Filter guarantees: 0% False Negatives, tunable ~1% False Positives, O(k) RAM check',
      'Count 1 Billion unique daily visitors in just 12 KB RAM using HyperLogLog (`PFADD` / `PFCOUNT`)',
      'Know where SkipLists power Redis Sorted Sets and LSM-Tree MemTables',
    ],
    steps: [
      {
        shortLabel: 'Bloom & HLL',
        stage: 'SOLUTION',
        title: 'Count 1 Billion Unique Visitors in 12 KB RAM (HyperLogLog) & Skip Disk Reads (Bloom)',
        body: [
          'Storing 1 Billion 8-byte `user_id`s in a `HashSet` to count "Unique Daily Visitors" eats **8 GB RAM PER PAGE**! **HyperLogLog (Redis `PFADD` / `PFCOUNT`)** tracks the maximum leading zero bits across hashed registers and estimates cardinalities up to `10^9+` with **0.81% error in just 12 KB of RAM** — and merges across servers via element-wise `MAX`!',
          '**Bloom Filters** use a compact bit array + `k` hashes: if ANY bit is `0`, the key is **100% DEFINITELY ABSENT** (skipbing SSTable disk seeks in Cassandra/RocksDB or blocking Cache Penetration!). Standard Bloom Filters don’t support deletes (use **Counting Bloom** or **Cuckoo Filters** for deletes).',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Saying *"Exact unique counts need 8 GB per URL; Redis HyperLogLog gives 99.2% accurate unique counts for 1B users in 12 KB RAM and merges across regions!"* will make any Google/Meta interviewer smile.',
        },
        scene: {
          hud: [
            { label: 'EXACT HASHSET', value: '8 GB / 1B Users', status: 'bad' },
            { label: 'HYPERLOGLOG', value: '12 KB (0.81% err!)', status: 'good' },
            { label: 'BLOOM FILTER', value: '0% False Negatives', status: 'good' },
            { label: 'REDIS ZSET', value: 'SkipList O(log N)', status: 'info' },
          ],
          nodes: [
            { id: 'bf', type: 'cache', x: 145, y: 215, label: 'Bloom Filter', sublabel: 'Membership · 10b/key', tone: 'green', callout: 'SSTable / URL' },
            { id: 'hll', type: 'cache', x: 390, y: 120, label: 'HyperLogLog', sublabel: '1B Uniques in 12 KB!', tone: 'purple', callout: 'PFCOUNT' },
            { id: 'cms', type: 'cache', x: 390, y: 315, label: 'Count-Min Sketch', sublabel: 'Top-K Heavy Hitters', tone: 'amber', callout: 'frequency' },
            { id: 'sl', type: 'hex', x: 645, y: 215, label: 'SkipList', sublabel: 'Redis ZSET / MemTbl', tone: 'blue' },
          ],
          edges: [
            { from: 'bf', to: 'hll', label: 'exists?', packetColor: 'purple', dashed: true, speed: 2.2 },
            { from: 'bf', to: 'cms', label: 'how often?', packetColor: 'amber', dashed: true, speed: 2.2 },
            { from: 'hll', to: 'sl', label: 'rank leaderboards', packetColor: 'blue', dashed: true, speed: 2.2 },
          ],
          legend: [{ label: 'sub-linear Big Tech data structures', tone: 'purple' }],
        },
      },
      {
        shortLabel: 'When Exact Wins',
        stage: 'TRADEOFF',
        title: 'Never Use Probabilistic Structures for Money, Auth or Strict Uniqueness',
        body: [
          'Use **HyperLogLog** for analytics dashboards ("1.2M unique viewers"), **Bloom Filters** as a fast *pre-filter* in front of exact DB storage, and **Count-Min Sketch** for trending charts. NEVER use approximate sketches for **billing invoices, bank balances, or exact seat counts**!',
        ],
        callout: {
          type: 'WATCH OUT',
          text: 'Bloom Filters can return a **False Positive** (~1%): when a Bloom Filter says "maybe present," you STILL check the authoritative database/SSTable to verify!',
        },
        scene: {
          hud: [
            { label: 'ANALYTICS', value: 'HLL / CMS ✓', status: 'good' },
            { label: 'CACHE GUARD', value: 'Bloom Pre-Filter ✓', status: 'good' },
            { label: 'BILLING / AUTH', value: 'Exact ACID Only!', status: 'warn' },
            { label: 'DELETES', value: 'Cuckoo / Counting', status: 'info' },
          ],
          nodes: [
            { id: 'req', type: 'hex', x: 145, y: 215, label: 'Lookup Key', sublabel: 'Check Bloom First', tone: 'blue' },
            { id: 'no', type: 'hex', x: 485, y: 120, label: 'Bit = 0 → Absent!', sublabel: '0 Disk I/O (100% Sure)', tone: 'green' },
            { id: 'yes', type: 'db', x: 485, y: 310, label: 'All 1s → Verify DB', sublabel: 'Handles 1% False Pos', tone: 'amber' },
          ],
          edges: [
            { from: 'req', to: 'no', label: 'fast reject', packetColor: 'green', speed: 1.5 },
            { from: 'req', to: 'yes', label: 'confirm truth', packetColor: 'amber', dashed: true, speed: 2.1 },
          ],
          legend: [{ label: 'zero-false-negative pre-filter', tone: 'green' }],
        },
      },
    ],
  },
];

export const EXTRA_MOD_06_ARCH = [
  {
    id: 'ntier-esb-eda',
    title: 'N-Tier, ESB vs Event-Driven Architecture',
    subtitle: 'Classic 3-Tier systems, why Enterprise Service Bus (ESB) becomes a bottleneck, and modern "Dumb Pipe, Smart Endpoints" EDA.',
    duration: '8 min',
    level: 'Beginner',
    companies: ['Microsoft', 'Amazon', 'Uber', 'Salesforce'],
    tags: ['n-tier', '3-tier', 'esb', 'enterprise service bus', 'eda', 'event-driven', 'choreography'],
    objectives: [
      'Understand classic 3-Tier Architecture (Presentation → Business Logic → Data Tier)',
      'Explain why legacy SOA Enterprise Service Buses (ESB) fail at cloud scale ("Smart Pipe" bottleneck)',
      'Design decoupled Event-Driven Architectures (EDA) using "Dumb Pipes, Smart Endpoints" (Kafka/EventBridge)',
    ],
    steps: [
      {
        shortLabel: '3-Tier & ESB',
        stage: 'PROBLEM',
        title: 'N-Tier Starts Simple — Legacy ESB Centralizes Too Much Logic in the Pipe',
        body: [
          'Classic **3-Tier Architecture** separates **Presentation (Web/Mobile)** → **Application Tier (Stateless API)** → **Data Tier (SQL/Cache)** so each layer scales and deploys independently.',
          'In legacy enterprise SOA, teams plugged every service into a centralized **Enterprise Service Bus (ESB)** that performed XML transformations, business routing, and orchestration inside the bus itself (**"Smart Pipe, Dumb Endpoints"**). Result: the ESB became a brittle, slow, single-team bottleneck!',
        ],
        callout: {
          type: 'WATCH OUT',
          text: 'Martin Fowler’s microservices golden rule: **"Smart Endpoints and Dumb Pipes!"** Keep message brokers (Kafka/SQS) purely focused on fast reliable delivery, NOT business transformations!',
        },
        scene: {
          hud: [
            { label: '3-TIER', value: 'UI → App → Data', status: 'good' },
            { label: 'LEGACY ESB', value: 'Smart Pipe (Bottleneck)', status: 'bad' },
            { label: 'MODERN EDA', value: 'Dumb Pipe (Kafka)', status: 'good' },
            { label: 'COUPLING', value: 'Loose Async Events', status: 'good' },
          ],
          nodes: [
            { id: 'esb', type: 'hex', x: 185, y: 215, label: 'Legacy ESB ✕', sublabel: 'Fat Business Logic Pipe', tone: 'coral', load: 91 },
            { id: 'eda', type: 'queue', x: 545, y: 215, label: 'Modern Kafka EDA ✓', sublabel: 'Dumb Pipe · Smart Svcs', tone: 'green', load: 26 },
          ],
          edges: [
            { from: 'esb', to: 'eda', label: 'evolve to cloud-native EDA →', packetColor: 'green', speed: 1.9 },
          ],
          legend: [{ label: 'decoupled event-driven evolution', tone: 'green' }],
        },
      },
      {
        shortLabel: 'Modern EDA',
        stage: 'SOLUTION',
        title: 'Event-Driven Architecture (EDA): Producers Emit Facts; Consumers React Independently',
        body: [
          'In **EDA**, `OrderService` publishes an immutable domain fact (`OrderPlaced`) to Kafka/EventBridge without knowing who listens! **Inventory**, **Email**, **Loyalty Points**, and **Fraud ML** subscribe independently — adding a 5th consumer requires **ZERO changes to `OrderService`**!',
          'Guard against "Event Spaghetti" with a **Schema Registry (Protobuf/Avro)**, correlation `trace_id` headers, and idempotent consumers.',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Always pair EDA with **Schema Registry (Backward-Compatible Protobuf/Avro Evolution)** so a producer adding a new field never crashes downstream consumers!',
        },
        scene: {
          hud: [
            { label: 'PRODUCER', value: 'Zero Consumer Coupling', status: 'good' },
            { label: 'CONTRACTS', value: 'Avro/Proto Registry', status: 'good' },
            { label: 'NEW FEATURE', value: 'Plug In New Consumer', status: 'good' },
            { label: 'DEBUGGING', value: 'OTel TraceID Required', status: 'warn' },
          ],
          nodes: [
            { id: 'ord', type: 'hex', x: 115, y: 215, label: 'Order Svc', sublabel: 'Emits OrderPlaced', tone: 'blue' },
            { id: 'bus', type: 'queue', x: 350, y: 215, label: 'Event Bus', sublabel: 'Kafka + Schema Reg', tone: 'amber' },
            { id: 's1', type: 'hex', x: 635, y: 105, label: 'Inventory', sublabel: 'Independent Sub', tone: 'green' },
            { id: 's2', type: 'hex', x: 635, y: 215, label: 'Notifications', sublabel: 'Independent Sub', tone: 'purple' },
            { id: 's3', type: 'hex', x: 635, y: 325, label: 'Fraud / BI', sublabel: 'Added Later (0 edits!)', tone: 'blue' },
          ],
          edges: [
            { from: 'ord', to: 'bus', label: 'publish fact', packetColor: 'amber', speed: 1.6 },
            { from: 'bus', to: 's1', label: 'react', packetColor: 'green', speed: 1.7 },
            { from: 'bus', to: 's2', label: 'react', packetColor: 'purple', speed: 1.7 },
            { from: 'bus', to: 's3', label: 'react', packetColor: 'blue', speed: 1.7 },
          ],
          legend: [{ label: 'dumb pipe, smart endpoints', tone: 'green' }],
        },
      },
    ],
  },

  {
    id: 'cqrs-event-sourcing',
    title: 'CQRS & Event Sourcing Internals',
    subtitle: 'Separating Write Commands from Read Projections (CQRS) and storing immutable state transitions (Event Sourcing + Snapshots).',
    duration: '11 min',
    level: 'Advanced',
    companies: ['Microsoft', 'Amazon', 'Stripe', 'Coinbase'],
    tags: ['cqrs', 'event sourcing', 'projections', 'event store', 'snapshots', 'upcasting', 'audit log'],
    objectives: [
      'Separate Write Models (normalized ACID commands) from Read Models (denormalized Elasticsearch/Redis projections) via CQRS',
      'Model state as an immutable Append-Only Event Store with Snapshots for fast replay & time-travel auditing',
      'Anticipate CQRS pitfalls: eventual read-projection lag and Event Schema Versioning (Upcasting)',
    ],
    steps: [
      {
        shortLabel: 'CQRS Split',
        stage: 'SOLUTION',
        title: 'CQRS: Optimize the Write DB for Integrity and Read DBs for Specialized Queries',
        body: [
          'In complex domains (E-Commerce, Banking, Analytics), **Writes** need normalized ACID consistency (`PostgreSQL`), while **Reads** need full-text faceted search (`Elasticsearch`), user timelines (`Redis`), and dashboards (`ClickHouse`). One single table cannot optimize all four!',
          '**CQRS (Command Query Responsibility Segregation)** sends **Commands** (`POST /orders`) to the Write Store, streams committed changes via **Outbox/CDC Kafka**, and builds tailored **Read Projections** asynchronously — letting reads and writes scale completely independently!',
        ],
        callout: {
          type: 'WATCH OUT',
          text: 'CQRS introduces **Eventual Consistency Lag** (50–500 ms) between a Command succeeding and the Read Projection updating! Handle UI UX cleanly via Optimistic UI updates or returning the created entity directly in the Command response.',
        },
        scene: {
          hud: [
            { label: 'WRITE PATH', value: 'Commands → Postgres', status: 'info' },
            { label: 'READ PATH', value: 'Queries → Projections', status: 'good' },
            { label: 'SYNC LAG', value: '50 – 300 ms Async', status: 'warn' },
            { label: 'SCALING', value: 'Independent R/W', status: 'good' },
          ],
          nodes: [
            { id: 'cmd', type: 'hex', x: 110, y: 120, label: 'Write Command', sublabel: 'Create / Mutate', tone: 'purple' },
            { id: 'qry', type: 'hex', x: 110, y: 315, label: 'Read Query', sublabel: 'Search / Dash', tone: 'green' },
            { id: 'wdb', type: 'db', x: 375, y: 120, label: 'Write DB (3NF)', sublabel: 'ACID + Outbox', tone: 'purple' },
            { id: 'kf', type: 'queue', x: 615, y: 215, label: 'CDC Event Bus', sublabel: 'Projector Workers', tone: 'amber' },
            { id: 'rdb', type: 'db', x: 375, y: 315, label: 'Read Projections', sublabel: 'Redis / Elastic / OLAP', tone: 'green', callout: '0-JOIN reads' },
          ],
          edges: [
            { from: 'cmd', to: 'wdb', label: 'ACID write', packetColor: 'purple', speed: 1.7 },
            { from: 'wdb', to: 'kf', label: 'CDC stream', packetColor: 'amber', speed: 1.7 },
            { from: 'kf', to: 'rdb', label: 'update views', packetColor: 'green', speed: 1.7 },
            { from: 'qry', to: 'rdb', label: 'instant read', packetColor: 'green', bidirectional: true, speed: 1.5 },
          ],
          legend: [
            { label: 'write command side', tone: 'purple' },
            { label: 'materialized read side', tone: 'green' },
          ],
        },
      },
      {
        shortLabel: 'Event Sourcing',
        stage: 'TECHNIQUE',
        title: 'Event Sourcing: The Append-Only Event Log IS Your Source of Truth',
        body: [
          'Standard DBs overwrite `balance = 150` and destroy history. **Event Sourcing** stores ONLY immutable facts: `[AccountOpened($0), Deposited($200), Withdrew($50)]`! Current state is derived by folding events — giving you **100% regulatory auditability, time-travel debugging, and zero-loss replay** into brand-new analytics views!',
          '**Two Production Must-Haves**: 1) **Periodic Snapshots** (every 200 events) so hydrating a 5-year-old account takes 2 ms instead of replaying 50,000 events, and 2) **Event Upcasters** to translate `v1` historical events cleanly into `v2` code!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Use Event Sourcing where **history and audit trail are core business requirements** (Fintech Ledgers, Stock Exchanges, Healthcare, Collaborative Docs) — NOT simple CRUD profile apps!',
        },
        scene: {
          hud: [
            { label: 'AUDIT TRAIL', value: '100% Immutable ✓', status: 'good' },
            { label: 'FAST REHYDRATE', value: 'Snapshots + Tail', status: 'good' },
            { label: 'EVOLUTION', value: 'Schema Upcasters', status: 'info' },
            { label: 'GDPR DELETE', value: 'Crypto-Shred Key!', status: 'good' },
          ],
          nodes: [
            { id: 'es', type: 'queue', x: 145, y: 215, label: 'Event Store', sublabel: 'e1 → e2 → e3 → e4', tone: 'amber' },
            { id: 'sn', type: 'db', x: 415, y: 120, label: 'Snapshot #200', sublabel: 'Fast State Load', tone: 'purple' },
            { id: 'vw', type: 'cache', x: 415, y: 315, label: 'Replayable Views', sublabel: 'Rebuild Anytime!', tone: 'green' },
          ],
          edges: [
            { from: 'es', to: 'sn', label: 'every N events', packetColor: 'purple', dashed: true, speed: 2.2 },
            { from: 'es', to: 'vw', label: 'fold / replay', packetColor: 'green', speed: 1.7 },
          ],
          legend: [{ label: 'immutable event-sourced state', tone: 'amber' }],
        },
      },
    ],
  },
];

export const EXTRA_MOD_07_SECURITY = [
  {
    id: 'tls-mtls-pki',
    title: 'SSL/TLS 1.3, PKI Certificates & mTLS',
    subtitle: 'How HTTPS actually works under the hood: Asymmetric ECDHE key exchange, Symmetric AES-GCM encryption, CA chains & Mutual TLS.',
    duration: '9 min',
    level: 'Intermediate',
    companies: ['Microsoft', 'Cloudflare', 'Google', 'Amazon'],
    tags: ['ssl', 'tls 1.3', 'mtls', 'https', 'pki', 'ecdhe', 'aes', 'certificates', 'x509'],
    objectives: [
      'Explain why TLS uses Asymmetric cryptography ONLY for the handshake and Symmetric AES-GCM for bulk data',
      'Verify server identity via X.509 Certificate Authority (CA) trust chains and Forward Secrecy (ECDHE)',
      'Upgrade one-way HTTPS to Mutual TLS (mTLS) for Zero-Trust microservice authentication',
    ],
    steps: [
      {
        shortLabel: 'TLS 1.3 Flow',
        stage: 'TECHNIQUE',
        title: 'Hybrid Crypto: Asymmetric ECDHE Handshake → Fast Symmetric AES-GCM Tunnel',
        body: [
          'Asymmetric crypto (RSA/ECDSA) solves key exchange over an untrusted internet, but is **1,000× slower** than symmetric AES! So **TLS 1.3** runs a **1-RTT Hybrid Handshake**:',
          '1) Client sends `ClientHello` + ephemeral **ECDHE Key Share**. 2) Server replies with its **X.509 Certificate** (signed by a trusted Root CA like DigiCert/Let’s Encrypt), its ECDHE Key Share, and signature. 3) Both sides derive the exact same temporary **Symmetric AES-256-GCM Session Key** — giving **Perfect Forward Secrecy** (even if the server’s private key leaks next year, past recorded traffic CANNOT be decrypted!).',
        ],
        callout: {
          type: 'KEY IDEA',
          text: '**TLS 1.3** removed legacy weak ciphers and cut the handshake to **1 RTT** (plus optional **0-RTT session resumption** — only use 0-RTT for idempotent GETs to prevent replay attacks!).',
        },
        scene: {
          hud: [
            { label: 'HANDSHAKE', value: '1 RTT (ECDHE)', status: 'good' },
            { label: 'BULK CRYPTO', value: 'AES-256-GCM Fast', status: 'good' },
            { label: 'FORWARD SECRECY', value: 'Ephemeral Keys ✓', status: 'good' },
            { label: 'IDENTITY', value: 'X.509 CA Chain', status: 'info' },
          ],
          nodes: [
            { id: 'c', type: 'users', x: 120, y: 215, label: 'Browser', sublabel: 'Trusts Root CAs', tone: 'slate' },
            { id: 's', type: 'hex', x: 455, y: 215, label: 'HTTPS Server', sublabel: 'Cert + ECDHE Share', tone: 'green', callout: 'TLS 1.3' },
            { id: 'ca', type: 'db', x: 665, y: 120, label: 'Root CA Chain', sublabel: 'Signs Server Cert', tone: 'purple' },
          ],
          edges: [
            { from: 'c', to: 's', label: '1. ECDHE + Cert Verify (1 RTT)', packetColor: 'purple', bidirectional: true, curve: -32, speed: 2.0 },
            { from: 'c', to: 's', label: '2. Fast AES-256-GCM Data', packetColor: 'green', bidirectional: true, curve: 32, speed: 1.5 },
            { from: 'ca', to: 's', label: 'signed cert', packetColor: 'amber', dashed: true, speed: 2.6 },
          ],
          legend: [
            { label: '1-RTT asymmetric key exchange', tone: 'purple' },
            { label: 'fast symmetric encrypted stream', tone: 'green' },
          ],
        },
      },
      {
        shortLabel: 'Mutual TLS (mTLS)',
        stage: 'SOLUTION',
        title: 'Mutual TLS (mTLS): Both Client AND Server Prove Cryptographic Identity',
        body: [
          'In regular browser HTTPS, only the **server** presents a certificate. Inside a Zero-Trust microservice mesh (Istio/Envoy/Azure), **BOTH services present short-lived X.509 workload certificates (SPIFFE IDs)** rotated automatically every 24 hours!',
          'Now even if an attacker compromises a pod on the internal VPC network, they CANNOT impersonate `PaymentService` without its cryptographic identity cert!',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Always specify **mTLS between internal microservices** + **automated short-lived cert rotation (SPIFFE/cert-manager)** when answering Microsoft/Google security deep dives!',
        },
        scene: {
          hud: [
            { label: 'SERVER VERIFY', value: 'X.509 Cert ✓', status: 'good' },
            { label: 'CLIENT VERIFY', value: 'X.509 Cert ✓', status: 'good' },
            { label: 'CERT ROTATION', value: 'Auto Every 24h', status: 'good' },
            { label: 'ZERO TRUST', value: 'Spoofing Blocked', status: 'good' },
          ],
          nodes: [
            { id: 'a', type: 'hex', x: 165, y: 215, label: 'Order Envoy', sublabel: 'Cert: spiffe://order', tone: 'blue' },
            { id: 'b', type: 'hex', x: 565, y: 215, label: 'Payment Envoy', sublabel: 'Cert: spiffe://pay', tone: 'green' },
            { id: 'ca', type: 'hex', x: 365, y: 95, label: 'Internal Mesh CA', sublabel: 'Auto-Issues 24h Certs', tone: 'purple' },
          ],
          edges: [
            { from: 'ca', to: 'a', label: 'cert', packetColor: 'purple', dashed: true, speed: 2.4 },
            { from: 'ca', to: 'b', label: 'cert', packetColor: 'purple', dashed: true, speed: 2.4 },
            { from: 'a', to: 'b', label: 'Mutual 2-Way Cert Verify + AES', packetColor: 'green', bidirectional: true, speed: 1.6 },
          ],
          legend: [{ label: 'zero-trust mutual TLS', tone: 'green' }],
        },
      },
    ],
  },
];

export const EXTRA_MOD_08_SHIPPING = [
  {
    id: 'vms-containers-serverless',
    title: 'VMs vs Containers vs MicroVMs vs Serverless',
    subtitle: 'Hypervisors & Guest OS vs Docker Linux namespaces/cgroups vs Firecracker MicroVMs vs FaaS cold-start trade-offs.',
    duration: '8 min',
    level: 'Beginner',
    companies: ['Amazon', 'Microsoft', 'Google', 'Cloudflare'],
    tags: ['vm', 'virtual machine', 'docker', 'container', 'namespaces', 'cgroups', 'firecracker', 'serverless', 'lambda'],
    objectives: [
      'Compare Hardware Virtualization (VMs) vs OS-Level Isolation (Docker Containers)',
      'Understand Linux `namespaces` (isolation), `cgroups` (CPU/RAM caps), and `OverlayFS` layers',
      'Pick cleanly between Containers (K8s), MicroVMs (Firecracker), and Serverless FaaS (Lambda/Azure Functions)',
    ],
    steps: [
      {
        shortLabel: 'VM vs Container',
        stage: 'SETUP',
        title: 'VMs Boot a Full Guest OS (Minutes, Strong Isolation); Containers Share Host Kernel (ms)',
        body: [
          'A **Virtual Machine (EC2 / Azure VM)** runs a **Hypervisor (KVM/Hyper-V)** emulating hardware with a full **Guest OS kernel** per VM — gigabytes of RAM overhead and 30–90s boot, but bulletproof hardware-level isolation!',
          'A **Container (Docker)** shares the host’s single Linux kernel using **`namespaces`** (isolated PIDs, network, filesystem) + **`cgroups`** (strict CPU/memory ceilings) + **`OverlayFS`** (layered copy-on-write images) — megabytes in size and **sub-second startup**!',
        ],
        callout: {
          type: 'KEY IDEA',
          text: 'Need BOTH container startup speed AND VM kernel security (for untrusted user code like LeetCode or AWS Lambda)? Use **Firecracker MicroVMs** (~125 ms boot, dedicated minimal guest kernel, ~5 MB RAM overhead)!',
        },
        scene: {
          hud: [
            { label: 'VM BOOT', value: '30–90s · Full OS', status: 'warn' },
            { label: 'CONTAINER', value: '< 1s · Shared Kernel', status: 'good' },
            { label: 'FIRECRACKER', value: '125ms · Own Kernel', status: 'good' },
            { label: 'SERVERLESS', value: 'Scale-to-Zero FaaS', status: 'info' },
          ],
          nodes: [
            { id: 'vm', type: 'hex', x: 140, y: 215, label: 'VM (Hypervisor)', sublabel: 'Full Guest OS · GBs', tone: 'purple' },
            { id: 'dk', type: 'hex', x: 380, y: 215, label: 'Docker Container', sublabel: 'Shared Kernel · MBs', tone: 'green', callout: 'K8s pods' },
            { id: 'fc', type: 'hex', x: 635, y: 215, label: 'MicroVM / FaaS', sublabel: '125ms · Scale to 0', tone: 'blue' },
          ],
          edges: [
            { from: 'vm', to: 'dk', label: '10× density', packetColor: 'green', speed: 1.9 },
            { from: 'dk', to: 'fc', label: 'untrusted / spiky', packetColor: 'blue', speed: 1.9 },
          ],
          legend: [{ label: 'compute isolation spectrum', tone: 'green' }],
        },
      },
      {
        shortLabel: 'When Serverless?',
        stage: 'TRADEOFF',
        title: 'Serverless (Lambda / Functions) Wins on Spiky Glue; Containers Win on Steady High-QPS',
        body: [
          '**Serverless FaaS** scales to zero (`$0` when idle) and auto-handles sudden event triggers (S3 thumbnail resize, Stripe webhook handler, nightly cron). **Trade-offs**: Cold-start latency spikes, 15-min execution limits, and **high per-invocation cost under 24/7 steady traffic** (remember Amazon Prime Video saving 90% moving back to ECS containers!).',
        ],
        callout: {
          type: 'INTERVIEW SIGNAL',
          text: 'Rule of thumb: Use **Serverless FaaS** for spiky/low-duty event handlers and glue code; use **Kubernetes / ECS Containers** for steady high-QPS APIs, WebSockets, and long-running workers!',
        },
        scene: {
          hud: [
            { label: 'SPIKY / IDLE', value: 'Serverless ($0 Idle)', status: 'good' },
            { label: 'STEADY 24/7 API', value: 'K8s Containers', status: 'good' },
            { label: 'WEBSOCKETS', value: 'Containers Only', status: 'warn' },
            { label: 'COLD START FIX', value: 'Provisioned Conc.', status: 'info' },
          ],
          nodes: [
            { id: 'sp', type: 'hex', x: 185, y: 215, label: 'Spiky Events', sublabel: 'S3 Resize · Webhooks', tone: 'amber' },
            { id: 'faas', type: 'hex', x: 545, y: 120, label: 'Serverless FaaS', sublabel: 'Pay Per ms ($0 Idle)', tone: 'green' },
            { id: 'k8s', type: 'hex', x: 545, y: 310, label: 'K8s Container Fleet', sublabel: 'Steady High-QPS / WS', tone: 'blue' },
          ],
          edges: [
            { from: 'sp', to: 'faas', label: 'bursty glue', packetColor: 'green', speed: 1.7 },
            { from: 'sp', to: 'k8s', label: 'always-on core', packetColor: 'blue', dashed: true, speed: 2.1 },
          ],
          legend: [{ label: 'cost-optimal compute choice', tone: 'green' }],
        },
      },
    ],
  },
];
