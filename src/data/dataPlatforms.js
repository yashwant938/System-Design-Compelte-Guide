function node(id, type, x, y, label, sublabel, tone) {
  return { id, type, x, y, label, sublabel, tone };
}

function edge(from, to, label, packetColor = 'blue') {
  return { from, to, label, packetColor };
}

function metric(label, value, status = 'info') {
  return { label, value, status };
}

const factGrain = {
  id: 'warehouse-fact-grain',
  title: 'Model warehouse facts at a declared grain',
  subtitle: 'Build a sales report that survives one-to-many joins and counts returning buyers correctly.',
  duration: '8 min',
  level: 'Intermediate',
  tags: ['warehouse', 'OLAP', 'fact table', 'star schema', 'dimensions', 'grain', 'distinct counts', 'HyperLogLog'],
  objectives: [
    'State what each row represents and choose a key that enforces that meaning.',
    'Combine line items and tender records without multiplying money.',
    'Roll up distinct buyers using sets or compatible mergeable sketches.',
  ],
  sources: [
    { title: 'Kimball Group · Declaring the grain', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/' },
    { title: 'Google BigQuery · HyperLogLog++ functions', url: 'https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions' },
  ],
  steps: [
    {
      shortLabel: 'Declare the grain', stage: 'SETUP', title: 'What happened once per row?',
      body: [
        'Order 41 contains a $30 book and a $20 game. The sale-line fact table records one completed sale per order line, keyed by order ID and line number. Store the quantity and net amount on that row. Customer, product and sale date link to dimensions for grouping and filtering.',
        'The buyer used a $15 gift card and paid $35 by card. The tender table records one capture per payment ID. An order can have multiple lines and multiple captures. Document the currency, tax treatment and refund rules alongside each monetary measure.',
      ],
      scene: {
        hud: [metric('Order', '41'), metric('Sale lines', '2'), metric('Captures', '2'), metric('Order amount', '$50')],
        nodes: [
          node('order', 'hex', 145, 215, 'Order 41', 'one checkout', 'blue'),
          node('lines', 'db', 410, 125, 'Sale lines', '$30 and $20', 'green'),
          node('tender', 'db', 410, 315, 'Captures', '$15 and $35', 'purple'),
          node('product', 'db', 645, 125, 'Products', 'one key per version', 'amber'),
        ],
        edges: [edge('order', 'lines', '2 lines', 'green'), edge('order', 'tender', '2 payments', 'purple'), edge('lines', 'product', 'product key', 'amber')],
      },
    },
    {
      shortLabel: 'Prevent fanout', stage: 'PROBLEM', title: 'Why does a $50 order appear to sell $100?',
      body: [
        'Joining sale lines to captures on order ID yields four rows. Each line now appears twice. Summing the joined line amounts gives $100, and summing the joined captures also gives $100. An equality check between these two wrong totals would pass.',
        'For an order-level reconciliation, group each fact table by order ID and currency first, then join the two one-row-per-order results. Preserve unmatched orders when looking for missing captures. For a product report, aggregate the sale lines directly. Joining captures to products needs a documented allocation rule if the business wants that cut.',
      ],
      scene: {
        hud: [metric('Raw join', '4 rows', 'warn'), metric('Naive sum', '$100', 'bad'), metric('Line rollup', '$50'), metric('Capture rollup', '$50')],
        nodes: [
          node('lines', 'db', 125, 125, 'Sale lines', '2 records', 'green'),
          node('captures', 'db', 125, 310, 'Captures', '2 records', 'purple'),
          node('sales', 'hex', 365, 125, 'Order sales', '$50', 'green'),
          node('paid', 'hex', 365, 310, 'Order paid', '$50', 'purple'),
          node('result', 'db', 640, 215, 'Comparison', 'one order row', 'blue'),
        ],
        edges: [edge('lines', 'sales', 'group by order', 'green'), edge('captures', 'paid', 'group by order', 'purple'), edge('sales', 'result', '$50'), edge('paid', 'result', '$50')],
      },
    },
    {
      shortLabel: 'Count buyers', stage: 'TECHNIQUE', title: 'A returning customer belongs to two days and one week',
      body: [
        'Exercise: Monday’s buyers are A, B and C. Tuesday’s are B, C and D. The daily report shows three on each day. The two-day report shows four buyers because B and C return. Adding the daily counts gives six buyer-days, a different metric.',
        'For an exact count, take distinct stable buyer IDs across the entire reporting period. For an approximate dashboard, store one compatible HyperLogLog sketch per day and merge sketches before extracting the estimate. A pair of scalar counts loses the overlap information. Keep atomic facts for late corrections or rebuilding a period.',
      ],
      scene: {
        hud: [metric('Day 1', '3 buyers'), metric('Day 2', '3 buyers'), metric('Overlap', '2 buyers'), metric('Two-day count', '4 buyers', 'good')],
        nodes: [
          node('mon', 'db', 140, 125, 'Monday', 'A, B, C', 'green'),
          node('tue', 'db', 140, 315, 'Tuesday', 'B, C, D', 'purple'),
          node('union', 'hex', 400, 215, 'Union', 'stable buyer IDs', 'amber'),
          node('week', 'db', 635, 215, 'Two-day result', 'A, B, C, D', 'blue'),
        ],
        edges: [edge('mon', 'union', 'set', 'green'), edge('tue', 'union', 'set', 'purple'), edge('union', 'week', 'count')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Atomic line facts', bestWhen: 'Analysts need new product or buyer cuts.', pros: 'Preserve detail and support exact recomputation.', cons: 'Long periods can require large scans.' },
      { option: 'Daily distinct sketches', bestWhen: 'A dashboard tolerates approximate counts.', pros: 'Compact, mergeable summaries.', cons: 'Cannot recover member IDs or remove one user from an ordinary HLL sketch.' },
    ],
    capacityMath: [
      { label: 'Order-key join', value: '4 rows', formula: '2 sale lines × 2 captures on the same order' },
      { label: 'Distinct union', value: '4 buyers', formula: '3 Monday + 3 Tuesday − 2 buyers in both' },
    ],
    failureModes: [
      { title: 'A product dimension returns two names per line', mitigation: 'Reference the correct version using a surrogate dimension key or an effective-time join. Assert that each line matches at most one version.' },
      { title: 'The weekly dashboard sums daily unique counts', mitigation: 'Recompute from distinct buyer IDs or merge compatible sketches before estimating the weekly count.' },
    ],
  },
};

const eventWindows = {
  id: 'event-time-windows',
  title: 'Revise event-time windows when data arrives late',
  subtitle: 'Follow mobile purchases through an on-time result, a late correction and an eventual backfill.',
  duration: '8 min',
  level: 'Intermediate',
  tags: ['event time', 'processing time', 'watermark', 'allowed lateness', 'streaming', 'triggers', 'backfill'],
  objectives: [
    'Assign events to half-open windows using the time they occurred.',
    'Distinguish a progress watermark from the policy for late records.',
    'Publish revised aggregates without counting an earlier result twice.',
  ],
  sources: [
    { title: 'Apache Beam Programming Guide · Watermarks and late data', url: 'https://beam.apache.org/documentation/programming-guide/#watermarks-and-late-data' },
    { title: 'Apache Beam Programming Guide · Triggers', url: 'https://beam.apache.org/documentation/programming-guide/#triggers' },
  ],
  steps: [
    {
      shortLabel: 'Choose event time', stage: 'SETUP', title: 'A delayed upload still belongs to the original minute',
      body: [
        'A dashboard totals purchases in one-minute UTC windows. For the window starting at 10:00, include events at or after 10:00:00 and before 10:01:00. A purchase at exactly 10:01:00 starts the next window. Processing time records when the pipeline sees the event.',
        'Purchases A ($8 at 10:00:10) and B ($12 at 10:00:40) arrive promptly. C ($5 at 10:00:50) is delayed. When the watermark passes the end of the window, an on-time trigger publishes $20. The watermark estimates event-time progress. The arrival of C can still change the total.',
      ],
      scene: {
        hud: [metric('Window start', '10:00:00'), metric('Window end', '10:01:00 exclusive'), metric('Observed', 'A + B'), metric('First total', '$20')],
        nodes: [
          node('input', 'queue', 130, 210, 'Purchases', 'event timestamps', 'blue'),
          node('bucket', 'hex', 382, 210, 'Minute window', 'group by event time', 'purple'),
          node('sink', 'db', 635, 210, 'Dashboard', 'revision 1', 'green'),
        ],
        edges: [edge('input', 'bucket', 'A, B'), edge('bucket', 'sink', '$20', 'green')],
      },
    },
    {
      shortLabel: 'Revise a result', stage: 'TECHNIQUE', title: 'Agree on whether an update is a total or a delta',
      body: [
        'Configure two minutes of allowed lateness after the window end, a late trigger for each newly accepted record and accumulating results. At watermark 10:02:00, C arrives. Its window is still retained. Deduplicate by purchase ID, update the state and publish $25 as revision 2.',
        'Upsert by merchant and window start, accepting only increasing revisions. If the sink adds both accumulated totals, it reports $45. A delta protocol would send +$5 for C and would also need stable update IDs or another way to make duplicate delivery harmless.',
      ],
      scene: {
        hud: [metric('Watermark', '10:02:00'), metric('Late event', '+$5'), metric('New total', '$25', 'good'), metric('Sink action', 'Replace rev 1')],
        nodes: [
          node('phone', 'client', 120, 215, 'Device', 'purchase C', 'amber'),
          node('state', 'db', 380, 215, 'Window state', '$20 → $25', 'purple'),
          node('out', 'db', 640, 215, 'Dashboard', 'revision 2', 'green'),
        ],
        edges: [edge('phone', 'state', 'arrived late', 'amber'), edge('state', 'out', 'upsert $25', 'green')],
      },
    },
    {
      shortLabel: 'Expire and repair', stage: 'TRADEOFF', title: 'Give events beyond the online horizon a recovery path',
      body: [
        'Exercise: purchase D ($7 at 10:00:55) arrives when the watermark is 10:04:00. The policy allows the 10:00 window to expire once the watermark passes 10:03:00. Its online state can already be gone. If the dashboard needs historical corrections, retain an independent input log and recompute that window from deduplicated purchases.',
        'The reconciled total is $32. Publish the corrected value with ordering that takes precedence over older online revisions. Monitor late-event counts, watermark lag and the age of published corrections. Increasing lateness retains more state and delays expiry, which costs memory and checkpoint I/O.',
      ],
      scene: {
        hud: [metric('Watermark', '10:04:00'), metric('Online window', 'Expired', 'warn'), metric('Backfill', 'A, B, C, D'), metric('Corrected', '$32', 'good')],
        nodes: [
          node('raw', 'db', 130, 210, 'Input archive', 'stable purchase IDs', 'blue'),
          node('rebuild', 'hex', 385, 210, 'Recompute', 'one merchant-minute', 'amber'),
          node('sink', 'db', 640, 210, 'Dashboard', 'corrected result', 'green'),
        ],
        edges: [edge('raw', 'rebuild', 'deduplicate'), edge('rebuild', 'sink', 'replace $25', 'green')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Accumulating updates', bestWhen: 'Readers want the newest total per window.', pros: 'A keyed sink can replace an entire aggregate.', cons: 'The sink must reject older revisions on retry.' },
      { option: 'Delta updates', bestWhen: 'A downstream consumer maintains its own totals.', pros: 'Ships only the change since the prior result.', cons: 'Repeated deltas overcount without deduplication or transactional delivery.' },
    ],
    capacityMath: [
      { label: 'Online correction', value: '$25', formula: '$8 + $12 + $5' },
      { label: 'After backfill', value: '$32', formula: '$25 + $7 from distinct event D' },
    ],
    failureModes: [
      { title: 'An idle input partition stalls window progress', mitigation: 'Observe watermarks per partition. Define an idle-input policy, then account for late records if that partition resumes.' },
      { title: 'An old online update overwrites a repaired window', mitigation: 'Use ordered revisions or generations shared by both output paths. Test delivery of the old result after backfill.' },
    ],
  },
};

const deletionLifecycle = {
  id: 'deletion-across-derived-data',
  title: 'Carry a deletion through derived data and restores',
  subtitle: 'Trace one removed profile from the primary store through indexes, snapshots and a recovery drill.',
  duration: '9 min',
  level: 'Advanced',
  tags: ['retention', 'deletion', 'lineage', 'tombstone', 'backups', 'snapshots', 'data lifecycle', 'reconciliation'],
  objectives: [
    'Identify derived datasets that can still surface a removed record.',
    'Keep retries, out-of-order updates and backfills from recreating a deleted version.',
    'Apply the current deletion history before a restored dataset starts serving.',
  ],
  sources: [
    { title: 'Engineering at Meta · DELF and deletion correctness', url: 'https://engineering.fb.com/2020/08/12/security/delf/' },
    { title: 'Apache Iceberg · Snapshot expiration and maintenance', url: 'https://iceberg.apache.org/docs/latest/maintenance/' },
  ],
  steps: [
    {
      shortLabel: 'Trace the copies', stage: 'SETUP', title: 'A missing profile page is one observation',
      body: [
        'A directory builds search documents, cached profiles and a warehouse table from its primary store. A request removes profile P from the directory. The primary row disappears, but asynchronous consumers can still return an earlier version. Draw each data flow, including scheduled exports and backups, and assign an owner to each output.',
        'Record a deletion marker for P with generation 17 in the same transaction as the source change, or use a change log that captures both. Apply a read filter while derived stores catch up. Track completion per destination using a minimal identifier, generation and acknowledgement.',
      ],
      scene: {
        hud: [metric('Profile', 'P'), metric('Generation', '17'), metric('Source', 'Removed', 'good'), metric('Derived copies', 'Pending', 'warn')],
        nodes: [
          node('source', 'db', 115, 210, 'Primary', 'profile + change log', 'blue'),
          node('stream', 'queue', 335, 210, 'Change stream', 'delete P at v17', 'amber'),
          node('index', 'db', 590, 95, 'Search', 'indexed document', 'purple'),
          node('cache', 'cache', 590, 220, 'Cache', 'profile entry', 'green'),
          node('lake', 'db', 590, 345, 'Warehouse', 'derived rows', 'blue'),
        ],
        edges: [edge('source', 'stream', 'persist'), edge('stream', 'index', 'delete', 'purple'), edge('stream', 'cache', 'evict', 'green'), edge('stream', 'lake', 'apply')],
      },
    },
    {
      shortLabel: 'Reject stale writes', stage: 'TECHNIQUE', title: 'Handle a duplicate deletion and an older update',
      body: [
        'The index applies deletion 17 twice, then receives a delayed update at generation 16. Keep the highest applied generation per entity, including after removal, and apply the change atomically with that generation. A repeated delete is a no-op and the delayed update cannot reinsert the profile. Scope markers to an entity incarnation if identifiers can be reused.',
        'Inspect each derived store by key. A cache evicted before the database replica catches up can refill from stale reads. A warehouse delete can hide rows from current queries while historical snapshots still reference the files. Apply the chosen snapshot and backup retention schedule and report retained recovery copies separately from queryable data.',
      ],
      scene: {
        hud: [metric('Newest applied', 'v17'), metric('Duplicate delete', 'v17 · no-op'), metric('Delayed update', 'v16 · ignored'), metric('Current lookup', 'Absent', 'good')],
        nodes: [
          node('replay', 'queue', 125, 215, 'Replay', 'v17, then v16', 'amber'),
          node('gate', 'hex', 380, 215, 'Version check', 'last applied v17', 'purple'),
          node('idx', 'db', 635, 215, 'Search index', 'P remains absent', 'green'),
        ],
        edges: [edge('replay', 'gate', 'compare', 'amber'), edge('gate', 'idx', 'retain deletion', 'green')],
      },
    },
    {
      shortLabel: 'Gate a restore', stage: 'SOLUTION', title: 'Read today’s deletion history before opening yesterday’s backup',
      body: [
        'Exercise: a day-1 backup contains P, P is removed on day 5, and the team restores the backup on day 20. The backup and its own change-log checkpoint predate the deletion. Restore into isolation, load a deletion history stored outside the restored snapshot, replay through a recorded cutoff and verify P is absent through the application and its derived stores.',
        'Keep new changes flowing or briefly fence writes during handoff so deletions after that cutoff are also applied. If backups can be restored for 30 days and a restore can take two additional days, a marker expiring after 14 days leaves a gap. Under this policy, cover at least the full 32-day exposure from a pre-deletion snapshot, plus any longer replay or export horizon. Limit access to the markers and expire them when their dependent copies are gone.',
      ],
      scene: {
        hud: [metric('Backup', 'Day 1'), metric('Deletion', 'Day 5'), metric('Restore', 'Day 20'), metric('Before cutover', 'Verify absence')],
        nodes: [
          node('snap', 'db', 130, 125, 'Backup', 'P exists', 'amber'),
          node('history', 'db', 130, 310, 'Deletion history', 'P removed', 'purple'),
          node('recovery', 'db', 390, 215, 'Isolated restore', 'apply missing marks', 'blue'),
          node('check', 'hex', 640, 215, 'Readiness gate', 'verify consumers', 'green'),
        ],
        edges: [edge('snap', 'recovery', 'restore', 'amber'), edge('history', 'recovery', 'reconcile', 'purple'), edge('recovery', 'check', 'inspect outputs', 'green')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Read-time suppression', bestWhen: 'A product must stop showing data while consumers catch up.', pros: 'Can take effect quickly at audited read paths.', cons: 'Other readers and historical files still need explicit handling.' },
      { option: 'Rewrite or expire stored copies', bestWhen: 'Retention policy requires removal of recoverable data.', pros: 'Can reclaim files after all references expire.', cons: 'Shared files, historical snapshots and backup windows constrain timing.' },
    ],
    capacityMath: [
      { label: 'Restore exercise', value: '15 days after removal', formula: 'Restore starts on day 20, deletion occurred on day 5' },
      { label: 'Illustrative worst-case exposure', value: '32 days', formula: '30-day backup availability + up to 2 days for an isolated restore' },
    ],
    failureModes: [
      { title: 'A backfill recreates an already-deleted document', mitigation: 'Apply the current marker set to backfill output and validate the sink version during publication. Reconcile failed destinations.' },
      { title: 'A tagged historical snapshot still references a file', mitigation: 'Inventory retained snapshot references and verify file reachability after retention maintenance. Keep historical-access and current-read checks distinct.' },
    ],
  },
};

const historicalFeatures = {
  id: 'point-in-time-features',
  title: 'Keep historical features consistent with online serving',
  subtitle: 'Reconstruct exactly which inputs a recommendation could have used when it made a prediction.',
  duration: '9 min',
  level: 'Advanced',
  tags: ['machine learning', 'feature store', 'point-in-time join', 'as-of join', 'leakage', 'training-serving skew', 'drift'],
  objectives: [
    'Choose features by entity, decision time and serving availability.',
    'Use a labelled training example without leaking later observations into its features.',
    'Detect differences between an offline reconstruction and values actually served.',
  ],
  sources: [
    { title: 'Feast · Point-in-time joins', url: 'https://docs.feast.dev/getting-started/concepts/point-in-time-joins' },
    { title: 'Google · Rules of ML, training-serving skew', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml/' },
  ],
  steps: [
    {
      shortLabel: 'Set a cutoff', stage: 'PROBLEM', title: 'An event can occur before a prediction and arrive afterward',
      body: [
        'At 10:00 a recommendation model scores shopper A. A feature snapshot counting recent views has value 3, event time 09:55 and serving availability 09:56. A newer snapshot has value 4 and event time 09:59, but reaches the serving store at 10:03. A later training export contains both.',
        'The prediction could use 3. A historical join that only filters event time can choose 4 and leak information from the future availability of the data. A purchase at 10:30 can define the target label for a one-hour conversion example. Its outcome must stay out of the pre-10:00 inputs.',
      ],
      scene: {
        hud: [metric('Decision', '10:00'), metric('Known then', '3 views', 'good'), metric('Late arrival', '10:03', 'warn'), metric('Label observed', '10:30')],
        nodes: [
          node('known', 'db', 135, 125, 'Available 09:56', 'value 3', 'green'),
          node('late', 'db', 135, 315, 'Available 10:03', 'value 4', 'amber'),
          node('point', 'hex', 398, 215, '10:00 cutoff', 'shopper A', 'purple'),
          node('model', 'hex', 640, 215, 'Prediction', 'uses value 3', 'blue'),
        ],
        edges: [edge('known', 'point', 'eligible', 'green'), { ...edge('late', 'point', 'too late', 'amber'), dashed: true, packetCount: 0 }, edge('point', 'model', '3 views')],
      },
    },
    {
      shortLabel: 'Join as of time', stage: 'TECHNIQUE', title: 'Reproduce what the serving store would have returned',
      body: [
        'Start with one training row per prediction containing entity ID, decision time and feature-definition version. For each row, look backward within the feature’s freshness limit. Require both its event time and its online availability to be at or before the decision. Among eligible rows use the same precedence rule the serving writer uses. In this example the newest event time wins, with a sequence number breaking ties.',
        'A four-minute freshness limit would expire the 09:55 snapshot by 10:00. The 09:59 snapshot still has not arrived. The training row should get the versioned missing-value treatment used online. Record this decision-time default as a distinct condition so that a sudden rise in defaults appears in monitoring.',
      ],
      scene: {
        hud: [metric('TTL example', '4 min'), metric('Known value age', '5 min'), metric('Newer value', 'Arrives later'), metric('Feature result', 'Missing')],
        nodes: [
          node('rows', 'db', 125, 125, 'Decision rows', 'entity + timestamp', 'blue'),
          node('features', 'db', 125, 310, 'Feature history', 'event + available time', 'green'),
          node('join', 'hex', 390, 215, 'As-of join', 'TTL + precedence', 'purple'),
          node('training', 'db', 635, 215, 'Training set', 'same default', 'amber'),
        ],
        edges: [edge('rows', 'join', 'cutoff'), edge('features', 'join', 'candidates', 'green'), edge('join', 'training', 'feature row', 'amber')],
      },
    },
    {
      shortLabel: 'Measure parity', stage: 'SOLUTION', title: 'Compare the two pipelines on the same decisions',
      body: [
        'Log a sample of serving inputs with prediction ID, schema and transform version, feature timestamps and default flags. Reconstruct those same predictions offline using the historical contract. Compare values with a feature-specific tolerance and track mismatch, missingness and age by feature, version and region.',
        'Exercise: among 1,000 paired feature values, 40 differ under the agreed tolerance. Thirty came from an offline backfill that ignored serving availability. Ten used a different default. The mismatch rate is 4%. Fix both causes, replay the same sample, and verify new traffic with a fresh sample. Shifts in both pipelines’ feature distributions can occur even when every pair matches.',
      ],
      scene: {
        hud: [metric('Paired decisions', '1,000'), metric('Late feature', '30'), metric('Wrong default', '10'), metric('Mismatch', '4%', 'warn')],
        nodes: [
          node('served', 'db', 130, 125, 'Serving log', 'actual input', 'green'),
          node('offline', 'db', 130, 310, 'Offline replay', 'as-of input', 'purple'),
          node('diff', 'hex', 385, 215, 'Pair by decision', 'same version', 'blue'),
          node('monitor', 'hex', 640, 215, 'Mismatch report', 'age + default flags', 'amber'),
        ],
        edges: [edge('served', 'diff', 'sampled rows', 'green'), edge('offline', 'diff', 'reconstruction', 'purple'), edge('diff', 'monitor', 'compare')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Log actual serving inputs', bestWhen: 'Exact historical availability is difficult to reconstruct.', pros: 'Provides evidence of what a prediction used.', cons: 'Adds storage, access-control and retention requirements.' },
      { option: 'Reconstruct from versioned history', bestWhen: 'Event and availability timestamps are recorded.', pros: 'Can cover past decisions across a large dataset.', cons: 'Requires reproducing ordering, freshness and transforms used at serving time.' },
    ],
    capacityMath: [
      { label: 'Age at the decision', value: '5 minutes', formula: '10:00 decision − 09:55 feature event time' },
      { label: 'Mismatch rate', value: '4%', formula: '(30 availability errors + 10 default errors) ÷ 1,000 paired values' },
    ],
    failureModes: [
      { title: 'Using the latest profile makes offline accuracy jump', mitigation: 'Inspect feature lineage and join cutoffs around known decisions. Compare training rows with inputs logged at serving time.' },
      { title: 'Only the online job updates its missing-value rule', mitigation: 'Version the transform and default together and verify parity on a sample containing missing inputs before rolling the model forward.' },
    ],
  },
};

export const DATA_PLATFORMS = {
  id: 'mod-data-platforms',
  title: 'Data Platforms & Analytics',
  track: 'hld',
  lessons: [factGrain, eventWindows, deletionLifecycle, historicalFeatures],
};
