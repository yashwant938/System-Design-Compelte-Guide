function node(id, type, x, y, label, sublabel, tone) {
  return { id, type, x, y, label, sublabel, tone };
}

function edge(from, to, label, packetColor = 'blue') {
  return { from, to, label, packetColor };
}

function metric(label, value, status = 'info') {
  return { label, value, status };
}

const queueRecovery = {
  id: 'queue-backlog-recovery',
  title: 'Recover a growing work queue',
  subtitle: 'Estimate the drain time for a webhook queue and decide which work to admit while its destination recovers.',
  duration: '9 min',
  level: 'Intermediate',
  tags: ['queues', 'backpressure', 'admission control', 'retries', 'capacity', 'redrive'],
  objectives: [
    'Predict recovery time from arrivals and successful completions.',
    'Keep new notifications within their freshness target while replaying older work.',
    'Choose a retry policy that preserves delivery and ordering guarantees.',
  ],
  sources: [
    { title: 'Amazon Builders’ Library · Avoiding insurmountable queue backlogs', url: 'https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/' },
  ],
  steps: [
    {
      shortLabel: 'Count completions', stage: 'PROBLEM', title: 'A green enqueue graph can hide a growing delay',
      body: [
        'A webhook service receives 800 distinct events per second. For five minutes its destination can commit only 500 deliveries per second. The producer gets a fast acknowledgement as soon as each event reaches durable storage. Customers measure the time until their webhook arrives.',
        'With an initially empty queue, 90,000 events accumulate. Count successful, distinct deliveries at the destination. Attempts that time out and return to the queue consume worker capacity without necessarily retiring a job. Track the age of the oldest eligible event for each destination alongside queue depth.',
      ],
      scene: {
        hud: [metric('Arrival', '800 events/s'), metric('Completion', '500 events/s', 'warn'), metric('Elapsed', '5 min'), metric('Backlog', '90,000', 'bad')],
        nodes: [
          node('ingress', 'hex', 120, 205, 'Ingress', 'accepted events', 'blue'),
          node('work', 'queue', 380, 205, 'Delivery queue', 'pending events', 'amber'),
          node('target', 'db', 640, 205, 'Destination', 'commit + acknowledge', 'coral'),
        ],
        edges: [edge('ingress', 'work', '800/s'), edge('work', 'target', '500/s', 'amber')],
      },
    },
    {
      shortLabel: 'Budget the drain', stage: 'TECHNIQUE', title: 'Reserve delivery capacity for the backlog',
      body: [
        'After recovery, a load test confirms that the destination can commit 1,100 events/s at its latency target. Fresh traffic still arrives at 800/s. The spare 300/s takes five minutes to clear 90,000 events. A two-minute drain target needs 1,550/s in total.',
        'If events for different customers are independent, place fresh and delayed work in separate lanes and reserve a minimum share for the delayed lane. Preserve ordering within each ordered key. A newer update that depends on an earlier one stays behind it.',
      ],
      callout: { type: 'KEY IDEA', text: 'If arrivals equal sustainable completions, the queue can stay at the same depth indefinitely. Set the recovery target before selecting worker counts.' },
      scene: {
        hud: [metric('New', '800/s'), metric('Replay', '300/s', 'good'), metric('Total', '1,100/s'), metric('Drain', '300 s')],
        nodes: [
          node('fresh', 'queue', 135, 120, 'Fresh lane', 'independent keys', 'green'),
          node('old', 'queue', 135, 310, 'Replay lane', 'delayed keys', 'amber'),
          node('schedule', 'hex', 385, 215, 'Scheduler', 'reserve shares', 'purple'),
          node('target', 'db', 640, 215, 'Destination', 'tested ceiling', 'blue'),
        ],
        edges: [edge('fresh', 'schedule', '800/s', 'green'), edge('old', 'schedule', '300/s', 'amber'), edge('schedule', 'target', '1,100/s')],
      },
    },
    {
      shortLabel: 'Bound redelivery', stage: 'TRADEOFF', title: 'Choose what happens after an ambiguous acknowledgement',
      body: [
        'Suppose the receiver commits event 901 and the acknowledgement gets lost. Retry with the same delivery ID. A cooperating receiver can store that ID and its side effect in one transaction and acknowledge duplicates. Retain the record across the entire retry and replay window.',
        'Set per-destination concurrency, use delayed retries with jitter and quarantine repeatedly failing jobs with their reason and age. Inspect a failed sample and redrive at a rate the receiver can absorb. For strict per-key order, park the affected key or request explicit authorization to skip it.',
      ],
      callout: { type: 'INTERVIEW SIGNAL', text: 'Try the incident with only 900 sustainable completions/s. With unchanged arrivals, the same backlog takes 900 seconds. Which customer-facing deadline breaks first?' },
      scene: {
        hud: [metric('Keys', 'Stable event IDs'), metric('Lane', 'Per destination'), metric('Redrive', 'Rate capped'), metric('Signal', 'Oldest event age')],
        nodes: [
          node('worker', 'hex', 115, 210, 'Worker', 'event 901', 'blue'),
          node('target', 'db', 390, 120, 'Receiver', 'ID + side effect', 'green'),
          node('retry', 'queue', 390, 305, 'Delayed retry', 'jittered delay', 'amber'),
          node('park', 'queue', 650, 305, 'Quarantine', 'inspect failure', 'coral'),
        ],
        edges: [edge('worker', 'target', 'try delivery'), edge('worker', 'retry', 'timeout', 'amber'), edge('retry', 'park', 'limit reached', 'coral')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'FIFO per key', bestWhen: 'A later mutation depends on an earlier one.', pros: 'Preserves the interpretation of each event.', cons: 'An unavailable receiver can block that key.' },
      { option: 'Separate replay lane', bestWhen: 'Old and new work can safely interleave.', pros: 'Keeps current traffic fresh during recovery.', cons: 'Requires fair scheduling and a policy for ordering.' },
    ],
    capacityMath: [
      { label: 'Backlog after slowdown', value: '90,000 events', formula: '(800 − 500) events/s × 300 s' },
      { label: 'Two-minute recovery', value: '1,550 events/s', formula: '800 incoming/s + 90,000 queued ÷ 120 s' },
    ],
    failureModes: [
      { title: 'Adding workers increases timeouts', mitigation: 'Cap concurrent calls to the receiver and measure completed work while increasing the limit gradually.', interviewProbe: 'Which metric distinguishes slower processing from more retry attempts?' },
      { title: 'Duplicate delivery after a late replay', mitigation: 'Align the receiver’s deduplication horizon with the maximum permitted replay age, or reconcile expired IDs before resending.' },
    ],
  },
};

const pointInTimeRestore = {
  id: 'point-in-time-restore',
  title: 'Prove a database can be restored',
  subtitle: 'Run a point-in-time recovery drill and measure the distance from a backup file to a working order service.',
  duration: '9 min',
  level: 'Intermediate',
  tags: ['backup', 'restore', 'point-in-time recovery', 'WAL', 'RPO', 'RTO', 'disaster recovery'],
  objectives: [
    'Define the recovery point and recovery time in terms the order service can test.',
    'Identify the base backup, continuous log archive and configuration needed to restore.',
    'Validate the recovered state and reconcile outstanding writes before serving traffic.',
  ],
  sources: [
    { title: 'PostgreSQL · Continuous archiving and point-in-time recovery', url: 'https://www.postgresql.org/docs/current/continuous-archiving.html' },
  ],
  steps: [
    {
      shortLabel: 'Set objectives', stage: 'SETUP', title: 'Start the clock at service interruption',
      body: [
        'An order service has a recovery point objective (RPO) of five minutes and a recovery time objective (RTO) of 45 minutes. In a drill the primary becomes unavailable at 12:00 UTC. The last fully archived, contiguous log ends with a known test purchase committed at 11:58. At most two minutes of acknowledged writes are at risk under these assumptions.',
        'Record the first time the restored application passes its acceptance checks and traffic can resume. Detection, provisioning, copying, replay, validation and routing all count. A warm replica helps with a machine failure. A mistaken bulk update can also reach that replica, so the service needs an earlier recovery point.',
      ],
      scene: {
        hud: [metric('Loss objective', '≤ 5 min'), metric('Time objective', '≤ 45 min'), metric('Archive point', '11:58 UTC'), metric('Failure', '12:00 UTC', 'bad')],
        nodes: [
          node('orders', 'hex', 115, 205, 'Orders', 'acknowledged writes', 'blue'),
          node('db', 'db', 380, 205, 'Primary', 'interrupted at noon', 'coral'),
          node('archive', 'db', 635, 205, 'Log archive', 'through 11:58', 'green'),
        ],
        edges: [edge('orders', 'db', 'commit'), edge('db', 'archive', 'archive WAL', 'green')],
      },
    },
    {
      shortLabel: 'Restore in isolation', stage: 'TECHNIQUE', title: 'Rebuild from a base image and an unbroken log',
      body: [
        'Restore a PostgreSQL base backup into an isolated environment with the required version, configuration, credentials and keys. Supply every required write-ahead log (WAL) segment from the start of the backup through the chosen recovery point. Verify the timeline and set the target deliberately when recovering from a bad transaction.',
        'In this drill detection and provisioning take 5 minutes. Copying 240 GiB at a measured 200 MiB/s takes about 20.5 minutes. Replay adds 8 minutes. Testing and routing add 7. With sequential phases, that totals about 40.5 minutes. Measure each phase under restore conditions, including access to encrypted backups.',
      ],
      scene: {
        hud: [metric('Prepare', '5 min'), metric('Copy', '20.5 min'), metric('Replay', '8 min'), metric('Test + route', '7 min')],
        nodes: [
          node('base', 'db', 130, 130, 'Base backup', '240 GiB', 'blue'),
          node('log', 'db', 130, 310, 'Log archive', 'continuous WAL', 'purple'),
          node('recovery', 'db', 397, 215, 'Restore target', 'isolated cluster', 'green'),
          node('check', 'hex', 645, 215, 'Test client', 'isolated effects', 'amber'),
        ],
        edges: [edge('base', 'recovery', 'copy'), edge('log', 'recovery', 'replay', 'purple'), edge('check', 'recovery', 'verify', 'amber')],
      },
    },
    {
      shortLabel: 'Reconcile and route', stage: 'SOLUTION', title: 'Test the recovered service with a known transaction',
      body: [
        'Read the test purchase by order ID, check totals against line items and compare the last recovered commit with an independent receipt log. In the isolated environment, exercise a new purchase with outbound charges and email disabled. Record the observed data gap, restore time and any missing dependency.',
        'Before cutover, fence the former writer and plan how to reconcile receipts for the uncovered interval. Replay confirmed missing orders idempotently. When restoring after a logical error, later valid purchases may share the timeline with the bad change. Recovering those purchases requires application-level reconciliation.',
      ],
      callout: { type: 'WATCH OUT', text: 'Try the drill with one WAL segment unavailable. Recovery through that gap requires another intact copy or a usable later backup chain. Document the latest point the available chain can actually reach.' },
      scene: {
        hud: [metric('Old writer', 'Fenced'), metric('Test order', 'Verified', 'good'), metric('At-risk interval', '2 min'), metric('Elapsed', '40.5 min', 'good')],
        nodes: [
          node('receipt', 'db', 110, 145, 'Receipts', 'external evidence', 'purple'),
          node('verify', 'hex', 370, 215, 'Reconciler', 'stable order IDs', 'amber'),
          node('new', 'db', 640, 145, 'New writer', 'verified recovery', 'green'),
          node('traffic', 'client', 640, 330, 'Clients', 'routing switched', 'blue'),
        ],
        edges: [edge('receipt', 'verify', 'compare IDs', 'purple'), edge('verify', 'new', 'repair missing', 'amber'), edge('traffic', 'new', 'orders')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Warm standby', bestWhen: 'An independent fault takes down the primary.', pros: 'Cuts provisioning and data transfer delay.', cons: 'Can follow the primary into a logical error.' },
      { option: 'Base backup + archived WAL', bestWhen: 'The team needs a historical recovery target.', pros: 'Can replay to a point before an unwanted change.', cons: 'Needs a continuous archive, working keys and measured replay time.' },
    ],
    capacityMath: [
      { label: 'Copy time', value: '1,228.8 seconds', formula: '240 × 1,024 MiB ÷ 200 MiB/s' },
      { label: 'RTO margin', value: 'About 4.5 minutes', formula: '45 − (5 + 20.48 + 8 + 7) minutes' },
    ],
    failureModes: [
      { title: 'Restore bandwidth falls to 100 MiB/s', mitigation: 'Copy time rises to about 41 minutes and total time to 61. Stage a closer backup, increase measured throughput or use a warm standby for the failure class it covers.', interviewProbe: 'Which phase would you measure again after changing the backup location?' },
      { title: 'The restored worker repeats an external charge', mitigation: 'Disable outbound side effects in drills. During recovery, compare payment-provider receipts with order IDs and use the original idempotency keys.' },
    ],
  },
};

const incidentResponse = {
  id: 'slo-incident-response',
  title: 'From an SLO page to verified recovery',
  subtitle: 'Investigate a checkout incident, coordinate a reversible mitigation and record the evidence needed to close it.',
  duration: '8 min',
  level: 'Intermediate',
  tags: ['SLO', 'burn rate', 'incident command', 'on call', 'postmortem', 'observability'],
  objectives: [
    'Calculate the burn rate of a request-based availability objective.',
    'Assign ownership of changes and communication during an incident.',
    'Separate immediate mitigation, verification and longer-term corrective work.',
  ],
  sources: [
    { title: 'Google SRE Workbook · Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/' },
    { title: 'Google SRE Workbook · Incident response', url: 'https://sre.google/workbook/incident-response/' },
    { title: 'Google SRE Workbook · Postmortem culture', url: 'https://sre.google/workbook/postmortem-culture/' },
  ],
  steps: [
    {
      shortLabel: 'Read the page', stage: 'PROBLEM', title: 'How quickly is checkout spending its error budget?',
      body: [
        'The objective is 99.9% successful eligible checkout requests over 30 days. Define eligibility at the client-facing edge so timeouts count. From 60,000 eligible requests in an hour, 1,200 failed. The hour’s error fraction is 2%, twenty times the allowed 0.1%. In the most recent five minutes, 100 of 5,000 failed as well.',
        'An example page threshold of 14.4× on both the one-hour and five-minute windows now fires. The long window indicates sustained impact and the short one confirms it is recent. With traffic constant for a 720-hour period, an hour at 20× consumes about 2.78% of the period’s full budget. Use actual counts when traffic varies.',
      ],
      scene: {
        hud: [metric('Objective', '99.9%'), metric('1-hour burn', '20×', 'bad'), metric('5-minute burn', '20×', 'bad'), metric('Page if both exceed', '14.4×')],
        nodes: [
          node('edge', 'hex', 120, 215, 'Checkout edge', 'good + total counts', 'blue'),
          node('slow', 'hex', 380, 125, 'One-hour ratio', 'sustained impact', 'amber'),
          node('fast', 'hex', 380, 315, 'Five-minute ratio', 'recent impact', 'coral'),
          node('oncall', 'users', 640, 215, 'On-call', 'both exceed limit', 'purple'),
        ],
        edges: [edge('edge', 'slow', '60,000 calls'), edge('edge', 'fast', '5,000 calls'), edge('slow', 'oncall', '20×', 'amber'), edge('fast', 'oncall', '20×', 'coral')],
      },
    },
    {
      shortLabel: 'Mitigate', stage: 'TECHNIQUE', title: 'Give one person ownership of production changes',
      body: [
        'The incident commander records impact, owners and the next update time. The operations lead controls configuration changes. The communications lead tells support which users are affected and when the next update will arrive. Keep a timestamped record of observations, hypotheses, actions and their outcomes.',
        'Failures are concentrated in one region after a connection-pool change. Compare that region with an unaffected one and check whether there is capacity to reverse the setting safely. Revert in one affected cell, hold other changes and inspect connection wait time and client-visible successes before extending the mitigation.',
      ],
      scene: {
        hud: [metric('Scope', 'One region'), metric('First change', 'One cell'), metric('Observer', 'Operations lead'), metric('Signal', 'Checkout success')],
        nodes: [
          node('command', 'users', 115, 215, 'Commander', 'decision log', 'purple'),
          node('ops', 'users', 365, 120, 'Operations', 'one change owner', 'blue'),
          node('comms', 'users', 365, 310, 'Communications', 'impact updates', 'amber'),
          node('cell', 'hex', 640, 120, 'Affected cell', 'previous setting', 'green'),
        ],
        edges: [edge('command', 'ops', 'authorize'), edge('command', 'comms', 'coordinate', 'amber'), edge('ops', 'cell', 'revert setting', 'green')],
      },
    },
    {
      shortLabel: 'Verify closure', stage: 'RECAP', title: 'A quiet pager is only one recovery signal',
      body: [
        'After the change, the five-minute error fraction falls below the paging threshold. Check that order creation and paid-order completion recover at expected volumes in every affected cohort. Reconcile orders left pending during the outage. Include the oldest pending order and an independent synthetic purchase in the handoff.',
        'Write the timeline using measurements. Explain how the pool size exhausted database connections and why the release gate missed one region. Assign a database connection limit test to the release owner, with a due date and a pass condition. Replay the incident in staging and retain the results with the postmortem.',
      ],
      callout: { type: 'INTERVIEW SIGNAL', text: 'If eligible requests drop to zero, there is no observed success ratio. Which independent probe and demand signal would tell you whether customers have lost access to checkout?' },
      scene: {
        hud: [metric('Edge errors', 'Back to baseline', 'good'), metric('Traffic', 'Check demand'), metric('Pending orders', 'Reconcile'), metric('Follow-up', 'Owner + test')],
        nodes: [
          node('signal', 'hex', 115, 145, 'Edge counters', 'requests + success', 'blue'),
          node('ledger', 'db', 115, 310, 'Order ledger', 'pending + paid', 'green'),
          node('review', 'users', 395, 215, 'Incident team', 'verify impact', 'purple'),
          node('test', 'hex', 645, 215, 'Release test', 'replay failure', 'amber'),
        ],
        edges: [edge('signal', 'review', 'volume'), edge('ledger', 'review', 'outcomes', 'green'), edge('review', 'test', 'action item', 'amber')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Immediate rollback', bestWhen: 'A correlated change is reversible and the old settings still work.', pros: 'Can restore service while investigation continues.', cons: 'The same dependency may also impair the previous release.' },
      { option: 'Shift traffic', bestWhen: 'Failures are localized and a healthy target has tested headroom.', pros: 'Reduces exposure to the affected cell.', cons: 'Transferred load can overwhelm the destination.' },
    ],
    capacityMath: [
      { label: 'Observed burn', value: '20 times budget rate', formula: '(1,200 ÷ 60,000) ÷ (1 − 0.999)' },
      { label: 'Monthly budget share used in the hour', value: '2.78% at constant traffic', formula: '1,200 ÷ (60,000 × 720 × 0.001)' },
    ],
    failureModes: [
      { title: 'Averages hide a broken customer region', mitigation: 'Split the SLI by affected region and client path. Compare request volume and sampled user journeys as well as aggregate success.' },
      { title: 'Two responders change the same pool at once', mitigation: 'Name a change owner and record the exact time and scope of each operation. Coordinate concurrent experiments across isolated cells.' },
    ],
  },
};

const canaryAnalysis = {
  id: 'canary-analysis',
  title: 'Decide when a canary is safe to promote',
  subtitle: 'Compare matched cohorts, budget exposure and handle an inconclusive release.',
  duration: '8 min',
  level: 'Advanced',
  tags: ['canary', 'progressive delivery', 'release engineering', 'rollout', 'rollback', 'sample size'],
  objectives: [
    'Compare per-version outcomes under a representative traffic mix.',
    'Estimate how long a release needs to encounter a rare request path.',
    'Choose a promotion, pause or rollback action and plan for stored state.',
  ],
  sources: [
    { title: 'Google SRE Workbook · Canarying releases', url: 'https://sre.google/workbook/canarying-releases/' },
  ],
  steps: [
    {
      shortLabel: 'Compare cohorts', stage: 'PROBLEM', title: 'A small canary can fail inside a healthy-looking fleet',
      body: [
        'A router assigns 1% of eligible checkouts to a candidate. In ten minutes the candidate fails 20 of 2,000 requests (1%). The control fails 198 of 198,000 (0.1%). The combined error rate is 0.109%. That aggregate largely reflects the much larger control population.',
        'Attach version and region to request counters. Assign comparable customers to both versions within region and client type. Keep users sticky when a session spans requests. If the canary serves only internal staff or a cold region, traffic mix and cache warmup can explain part of a difference.',
      ],
      scene: {
        hud: [metric('Candidate traffic', '1%'), metric('Candidate errors', '1%', 'bad'), metric('Control errors', '0.1%'), metric('Fleet errors', '0.109%')],
        nodes: [
          node('route', 'hex', 120, 215, 'Router', 'sticky assignment', 'blue'),
          node('candidate', 'hex', 380, 120, 'Candidate', '20 of 2,000', 'coral'),
          node('control', 'hex', 380, 310, 'Control', '198 of 198,000', 'green'),
          node('gate', 'hex', 640, 215, 'Release gate', 'per-version counters', 'purple'),
        ],
        edges: [edge('route', 'candidate', '1%', 'amber'), edge('route', 'control', '99%', 'green'), edge('candidate', 'gate', '1% errors', 'coral'), edge('control', 'gate', '0.1% errors', 'green')],
      },
    },
    {
      shortLabel: 'Check coverage', stage: 'INSIGHT', title: 'A quiet first minute tells you little about a rare path',
      body: [
        'Suppose a saved-card path accounts for one request in 1,000. For n independent, representative candidate requests, the chance of seeing the path at least once is 1 − 0.999ⁿ. After 100 requests it is roughly 9.5%. It takes 2,995 requests for at least a 95% chance of observing it once.',
        'Seeing the path once can reveal a deterministic failure. Estimating a small change in the path’s error rate takes many more observations. A safer release can exercise the path with a controlled test account and track path-specific outcomes. Repeated requests from the same customer weaken the independence assumption.',
      ],
      scene: {
        hud: [metric('Path frequency', '0.1%'), metric('100 requests', '9.5% coverage'), metric('2,995 requests', '95% coverage'), metric('Assumption', 'Independent mix')],
        nodes: [
          node('cohort', 'hex', 120, 215, 'Candidate', 'eligible requests', 'blue'),
          node('rare', 'hex', 385, 125, 'Saved card', 'rare path', 'amber'),
          node('common', 'hex', 385, 310, 'Other methods', 'common paths', 'green'),
          node('counter', 'db', 640, 125, 'Path counters', 'eligible + failed', 'purple'),
        ],
        edges: [edge('cohort', 'rare', '1 in 1,000', 'amber'), edge('cohort', 'common', '999 in 1,000', 'green'), edge('rare', 'counter', 'outcomes', 'purple')],
      },
    },
    {
      shortLabel: 'Decide and verify', stage: 'SOLUTION', title: 'Let a release gate return “insufficient evidence”',
      body: [
        'Agree on the error and latency guardrails, minimum exposure and maximum observation time before shifting traffic. Suppose the gate aborts when at least 1% of candidate requests fail after 2,000 observations and the matched control is healthy. The sample above triggers a rollback. Sparse samples, missing telemetry or an unhealthy control pause the rollout for investigation.',
        'Move new requests back to the known working version, drain in-flight work and recheck errors and completed orders in the affected cohort. Ensure that the previous version can read records written by the candidate. If state has already changed incompatibly, the operational recovery may require a forward repair.',
      ],
      callout: { type: 'WATCH OUT', text: 'Suppose parallel versions share a dependency and both slow down after launch. Measure dependency saturation and user outcomes against their absolute guardrails. A per-version comparison alone can miss fleet-wide harm.' },
      scene: {
        hud: [metric('Control', 'Healthy', 'good'), metric('Sample', '2,000 eligible'), metric('Decision', 'Rollback', 'warn'), metric('Recovery check', 'Completed orders')],
        nodes: [
          node('gate', 'hex', 115, 215, 'Gate', 'guardrail exceeded', 'amber'),
          node('router', 'hex', 365, 215, 'Router', 'drain candidate', 'blue'),
          node('stable', 'hex', 630, 125, 'Stable version', 'new requests', 'green'),
          node('orders', 'db', 630, 310, 'Order data', 'check compatibility', 'purple'),
        ],
        edges: [edge('gate', 'router', 'abort', 'amber'), edge('router', 'stable', 'restore traffic', 'green'), edge('stable', 'orders', 'read + write', 'purple')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Matched live control', bestWhen: 'Normal traffic reaches both versions.', pros: 'Controls for time-of-day changes and common load swings.', cons: 'Shared dependencies and biased routing can mask regressions.' },
      { option: 'Targeted synthetic journey', bestWhen: 'A critical path receives little organic traffic.', pros: 'Provides deliberate coverage with bounded exposure.', cons: 'Synthetic state and traffic may miss production variation.' },
    ],
    capacityMath: [
      { label: 'Excess candidate failures', value: '18 above the control-rate expectation', formula: '20 observed − (2,000 × 0.001) expected' },
      { label: 'At least one rare request', value: '2,995 candidate requests', formula: 'Round up ln(0.05) ÷ ln(0.999)' },
    ],
    failureModes: [
      { title: 'A timer promotes a release while telemetry is missing', mitigation: 'Make missing samples and expired observation windows explicit pause outcomes. Verify the monitoring path independently before continuing.' },
      { title: 'Rollback restores the binary but leaves unreadable data', mitigation: 'Retain backward-compatible readers and delay removal of old fields until the rollback window expires.', interviewProbe: 'How would you test an old reader with a record produced by the new version?' },
    ],
  },
};

const capacityEconomics = {
  id: 'capacity-unit-economics',
  title: 'Price the capacity needed to survive a zone loss',
  subtitle: 'Size the surviving fleet from measured throughput, then express its monthly cost per million completed checkouts.',
  duration: '9 min',
  level: 'Intermediate',
  tags: ['capacity planning', 'load testing', 'headroom', 'availability zones', 'FinOps', 'unit economics', 'cost'],
  objectives: [
    'Derive a per-instance service rate at a stated latency target.',
    'Size a balanced fleet for peak traffic with one zone unavailable.',
    'Relate monthly spend to completed business operations using a consistent scope.',
  ],
  sources: [
    { title: 'Amazon Builders’ Library · Static stability using Availability Zones', url: 'https://aws.amazon.com/builders-library/static-stability-using-availability-zones/' },
    { title: 'FinOps Foundation · Unit economics', url: 'https://www.finops.org/framework/capabilities/unit-economics/' },
  ],
  steps: [
    {
      shortLabel: 'Measure a ceiling', stage: 'SETUP', title: 'Find a sustainable service rate under peak conditions',
      body: [
        'A checkout API peaks at 2,400 HTTP requests/s. Replay the route mix, payload sizes and cache behaviour of that peak. In a sustained test a warmed instance handles 200 requests/s with a 180 ms p99, below the 200 ms objective. At 240 requests/s p99 rises to 310 ms and the waiting queue grows.',
        'Use 200 requests/s as the measured planning ceiling for this scenario. Repeat with cold caches, the intended database pool limit, background work and a disrupted zone. Multiplying one instance’s rate assumes the rest of the system scales with it. A shared database connection limit can invalidate that assumption.',
      ],
      scene: {
        hud: [metric('Peak input', '2,400 req/s'), metric('Latency goal', 'p99 ≤ 200 ms'), metric('Test at 200/s', '180 ms', 'good'), metric('Test at 240/s', '310 ms', 'bad')],
        nodes: [
          node('load', 'users', 115, 215, 'Load replay', 'peak request mix', 'blue'),
          node('api', 'hex', 380, 215, 'API instance', 'one tested unit', 'amber'),
          node('store', 'db', 640, 215, 'Database', 'shared constraints', 'purple'),
        ],
        edges: [edge('load', 'api', 'step load'), edge('api', 'store', 'checkout I/O', 'purple')],
      },
    },
    {
      shortLabel: 'Remove a zone', stage: 'TECHNIQUE', title: 'Run the peak on the capacity that survives',
      body: [
        'Distribute identical instances evenly across three independent zones. During one zone loss, two zones must handle all 2,400 requests/s. At 200/s per instance, the lower bound is six per zone, or 18 in service. Each healthy zone normally carries 800/s. After redistribution it carries 1,200/s, exactly the measured ceiling.',
        'If the demand forecast includes 20% growth, plan for 2,880/s. Each surviving zone then needs at least eight instances. Provisioning 24 affords 3,200/s after a zone loss. Confirm that health checks remove the failed zone promptly and that routing spreads demand evenly across the survivors.',
      ],
      callout: { type: 'INTERVIEW SIGNAL', text: 'Assume the fleet still has six instances per zone and a second instance is offline for maintenance when a different zone fails. Eleven survivors handle 2,200/s. Decide whether to delay maintenance, keep more spare capacity or limit admitted load.' },
      scene: {
        hud: [metric('Forecast peak', '2,880 req/s'), metric('Zone A', 'Unavailable', 'bad'), metric('Zones B + C', '16 instances'), metric('Surviving capacity', '3,200 req/s', 'good')],
        nodes: [
          node('route', 'hex', 120, 215, 'Router', 'healthy zones only', 'blue'),
          { ...node('a', 'hex', 560, 85, 'Zone A', 'out of service', 'coral'), dim: true },
          node('b', 'hex', 560, 220, 'Zone B', '8 instances', 'green'),
          node('c', 'hex', 560, 350, 'Zone C', '8 instances', 'green'),
        ],
        edges: [edge('route', 'b', '1,440/s', 'green'), edge('route', 'c', '1,440/s', 'green')],
      },
    },
    {
      shortLabel: 'Price an outcome', stage: 'TRADEOFF', title: 'Choose a denominator the customer would recognize',
      body: [
        'Use illustrative rates for one 720-hour month. Eighteen always-on instances at $0.10 per instance-hour cost $1,296. Egress of 12,000 GB at $0.05/GB costs $600. Add $200 for allocated storage. These three costs total $2,096. With 40 million distinct completed checkouts in that month, the scoped cost is $52.40 per million.',
        'At 24 instances the total becomes $2,528, or $63.20 per million at the same monthly volume. The additional $432 buys capacity for the higher peak under the zone-loss assumption. Peak API traffic sizes the fleet. Monthly completed checkouts price the outcome. Keep retries out of that outcome count and document any excluded cost, such as staff time or shared databases.',
      ],
      callout: { type: 'KEY IDEA', text: 'Two teams can report the same cost per API call and different cost per checkout if one needs twice as many calls to finish a purchase. Use a common time interval and cost boundary for comparisons.' },
      scene: {
        hud: [metric('Compute · 24 nodes', '$1,728'), metric('Egress + storage', '$800'), metric('Checkouts', '40 million'), metric('Per million', '$63.20')],
        nodes: [
          node('bill', 'db', 130, 130, 'Cost records', 'same 30 days', 'amber'),
          node('orders', 'db', 130, 310, 'Order ledger', 'distinct completions', 'green'),
          node('measure', 'hex', 395, 215, 'Unit cost', 'cost per million', 'purple'),
          node('decision', 'users', 640, 215, 'Service owner', 'peak + cost target', 'blue'),
        ],
        edges: [edge('bill', 'measure', 'allocated cost', 'amber'), edge('orders', 'measure', 'successful units', 'green'), edge('measure', 'decision', 'compare plans')],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Preprovisioned spare capacity', bestWhen: 'Failover must absorb a peak immediately.', pros: 'Recovered throughput depends mainly on healthy routing and tested dependencies.', cons: 'The fleet carries spare capacity during normal operation.' },
      { option: 'Scale after a fault', bestWhen: 'A degraded service can meet its objective while instances start.', pros: 'Lowers standing compute cost.', cons: 'Quota, startup time, cold caches or a degraded control plane can delay recovery.' },
    ],
    capacityMath: [
      { label: 'Instances per zone at forecast peak', value: '8 per zone', formula: 'Round up 2,880 ÷ (2 surviving zones × 200 req/s)' },
      { label: 'Extra monthly cost', value: '$432', formula: '6 extra instances × $0.10/hour × 720 hours' },
    ],
    failureModes: [
      { title: 'A hot key saturates one shard while fleet CPU is low', mitigation: 'Drive skewed traffic in the failover test. Track per-shard throughput, connection wait and p99 before assuming linear scaling.' },
      { title: 'Failed checkouts make the cost dashboard look better', mitigation: 'Count distinct successful checkout IDs as the business denominator and pair unit cost with success rate.', interviewProbe: 'If successful volume falls to 32 million at the same $2,528 spend, what changes? The cost becomes $79 per million.' },
    ],
  },
};

export const PRODUCTION_ENGINEERING = {
  id: 'mod-production-engineering',
  title: 'Production Engineering',
  track: 'hld',
  lessons: [queueRecovery, pointInTimeRestore, incidentResponse, canaryAnalysis, capacityEconomics],
};
