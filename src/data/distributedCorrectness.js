function node(id, type, x, y, label, sublabel, tone) {
  return { id, type, x, y, label, sublabel, tone };
}

function edge(from, to, label, packetColor) {
  return { from, to, label, packetColor };
}

function metric(label, value, status) {
  return { label, value, status };
}

const dynamoPaper = {
  title: 'Amazon Dynamo paper, section 4.4 on data versioning',
  url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
};

const logicalClocks = {
  id: 'logical-clocks',
  title: 'Clocks, causality and concurrent events',
  subtitle: 'Reconstruct a request from two traces whose wall clocks disagree.',
  duration: '9 min', level: 'Intermediate',
  tags: ['happens-before', 'logical time', 'Lamport clocks', 'vector clocks', 'clock skew'],
  objectives: [
    'Recover causal order from process order and message delivery',
    'Update a Lamport clock across a request boundary',
    'Recognize concurrent versions by comparing a pair of vectors',
  ],
  steps: [
    {
      shortLabel: 'Trace', stage: 'PROBLEM', title: 'The receipt appears to predate the request',
      body: [
        'Checkout records sending a request at 12:00:00.120. Billing records receiving that same request at 12:00:00.095. Subtracting the two wall-clock readings gives −25 ms. Both logs can be genuine.',
        'The matching message ID establishes that the send preceded the receive. Within either process, program order supplies more edges. Follow chains of those edges to determine what **happened before** what. Use a local monotonic timer for elapsed time measured within one process.',
      ],
      scene: {
        nodes: [node('checkout', 'hex', 165, 215, 'Checkout', 'send at .120', 'blue'), node('billing', 'hex', 595, 215, 'Billing', 'receive at .095', 'purple')],
        edges: [edge('checkout', 'billing', 'message 41', 'green')],
        hud: [metric('Apparent latency', '−25 ms', 'bad'), metric('Matching ID', '41', 'info')],
        legend: [{ label: 'Causal dependency', tone: 'green' }],
      },
    },
    {
      shortLabel: 'Scalar clock', stage: 'TECHNIQUE', title: 'Carry one counter with each message',
      body: [
        'Increment a local counter at each event. Checkout sends at logical time 7. Billing already has counter 9, so it timestamps the receive at `max(9, 7) + 1 = 10`. A later local event at Billing advances it to 11.',
        'If X happened before Y, this rule gives `L(X) < L(Y)`. An unrelated worker could also have produced time 8. Sorting all three numbers gives a display order, but the inequality alone supplies no message path from Checkout to the worker.',
      ],
      scene: {
        nodes: [node('checkout', 'hex', 140, 195, 'Checkout', 'send = 7', 'blue'), node('billing', 'hex', 520, 195, 'Billing', 'receive = 10', 'purple'), node('batch', 'queue', 320, 325, 'Batch worker', 'local event = 8', 'slate')],
        edges: [edge('checkout', 'billing', 'stamp 7', 'green')],
        hud: [metric('Prior counter', '9', 'info'), metric('Receive counter', '10', 'good')],
        legend: [{ label: 'Receipt advances the counter', tone: 'green' }],
      },
    },
    {
      shortLabel: 'Vectors', stage: 'SOLUTION', title: 'Find concurrent edits by comparing both components',
      body: [
        'For two writers A and B, keep counters `[A, B]`. Each writer increments its own component. On receipt, merge the componentwise maxima and then increment the receiving process component for the receive event.',
        'A produces `[2, 0]` and B produces `[1, 1]`. A is ahead in the first component and B in the second, so neither version includes the other. If B now receives A’s message, its receive event is `[2, 2]`. That event includes both histories.',
      ],
      callout: { type: 'INTERVIEW SIGNAL', text: 'Try `[3, 2]` and `[3, 4]`. A vector precedes a second when every component is at most its counterpart and at least one is smaller. Here the first precedes the second.' },
      scene: {
        nodes: [node('a', 'hex', 160, 120, 'Writer A', '[2, 0]', 'blue'), node('b', 'hex', 160, 315, 'Writer B', '[1, 1]', 'purple'), node('receive', 'hex', 585, 215, 'B receives', '[2, 2]', 'green')],
        edges: [edge('a', 'receive', 'message', 'blue'), edge('b', 'receive', 'local history', 'purple')],
        hud: [metric('Input versions', 'Concurrent', 'info'), metric('Receive vector', '[2, 2]', 'good')],
        legend: [{ label: 'A’s history', tone: 'blue' }, { label: 'B’s history', tone: 'purple' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Lamport counter', bestWhen: 'A trace must order dependent events', pros: 'One integer per timestamp', cons: 'Cannot identify every concurrent pair' },
      { option: 'Vector clock', bestWhen: 'Replicas must retain concurrent versions', pros: 'Distinguishes dominance and concurrency', cons: 'Metadata grows with tracked writers and needs a membership policy' },
    ],
    failureModes: [{ title: 'A restarted writer reuses its old identifier and resets its counter', mitigation: 'Persist the counter or allocate a fresh writer incarnation before generating events. Include incarnation changes in the membership policy.', interviewProbe: 'Which distinct events could otherwise acquire the same timestamp?' }],
  },
  sources: [{ title: 'Leslie Lamport, Time, Clocks, and the Ordering of Events in a Distributed System', url: 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf' }, dynamoPaper],
};

const sessionGuarantees = {
  id: 'session-guarantees', title: 'Read-your-writes across replicas',
  subtitle: 'Follow an address change from a primary to two replicas and a second API worker.',
  duration: '8 min', level: 'Intermediate',
  tags: ['session consistency', 'read-your-writes', 'monotonic reads', 'replica lag', 'session tokens'],
  objectives: ['State the read contract for an editing session', 'Use a partition-scoped position to select an eligible replica', 'Bound the wait when no replica can serve the read'],
  steps: [
    {
      shortLabel: 'Stale read', stage: 'PROBLEM', title: 'The confirmation page shows the old address',
      body: ['A shopper changes a delivery address. The primary commits the edit at position 82 in the account partition. The next GET goes to a nearby replica that has applied through 80. A successful write followed by an older screen breaks **read-your-writes**.', 'A second promise, **monotonic reads**, prevents a session that has observed position 85 from moving backward on the next read. Neither promise alone tells a different shopper how fresh an unrelated read will be.'],
      scene: {
        nodes: [node('session', 'client', 140, 210, 'Shopper', 'same session', 'blue'), node('primary', 'db', 575, 125, 'Primary', 'applied 82', 'green'), node('replica', 'db', 575, 310, 'Replica', 'applied 80', 'coral')],
        edges: [edge('session', 'primary', 'save address', 'green'), edge('replica', 'session', 'old address', 'coral')],
        hud: [metric('Write position', '82', 'good'), metric('Read position', '80', 'bad')],
        legend: [{ label: 'Committed write', tone: 'green' }, { label: 'Stale result', tone: 'coral' }],
      },
    },
    {
      shortLabel: 'Read fence', stage: 'TECHNIQUE', title: 'Carry the minimum acceptable position',
      body: ['In this example each partition has one ordered, durable log. Return its position with the write acknowledgment and carry it with the next request. A replica serves a snapshot that includes at least that position. At floor 82, replica A at 80 waits and B at 84 qualifies.', 'For monotonic reads, advance the session floor to the greatest position it has observed, including reads. Bind the token to its partition and log lineage. Positions from independent logs are incomparable.'],
      scene: {
        nodes: [node('router', 'hex', 150, 215, 'API worker', 'floor 82', 'blue'), node('slow', 'db', 575, 120, 'Replica A', '80 < 82', 'amber'), node('ready', 'db', 575, 315, 'Replica B', '84 ≥ 82', 'green')],
        edges: [edge('router', 'ready', 'eligible', 'green')],
        hud: [metric('Eligible replicas', '1 of 2', 'good'), metric('Next read floor', '84', 'info')],
        legend: [{ label: 'Snapshot satisfies session floor', tone: 'green' }],
      },
    },
    {
      shortLabel: 'Deadline', stage: 'TRADEOFF', title: 'Decide what the reader sees during a partition',
      body: ['The shopper reconnects to a different API worker carrying floor 84. Its local replica is at 83 and the primary route is unavailable. Wait until the local replica catches up within the request deadline, route to an eligible peer, or return a retryable status.', 'A read floor cannot make a lost write durable. If a failover can lose acknowledged writes, the new leader may never satisfy the old token. Specify acknowledgment durability and how the service detects incompatible histories.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'The UI has a 120 ms deadline. After a 90 ms local wait, a remote read needs at least 50 ms. The remaining 30 ms rules out that route. Return the agreed retry response or use a previously confirmed local display clearly marked as such.' },
      scene: {
        nodes: [node('worker', 'hex', 165, 215, 'New worker', 'floor 84', 'blue'), node('local', 'db', 575, 215, 'Local replica', 'applied 83', 'amber')],
        edges: [edge('worker', 'local', 'wait for 84', 'amber')],
        hud: [metric('Time left', '30 ms', 'warn'), metric('Remote minimum', '50 ms', 'bad')],
        legend: [{ label: 'Bounded wait', tone: 'amber' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Read from the write leader', bestWhen: 'One leader serves the partition and can establish its current authority', pros: 'Simple path to fresh data', cons: 'Leader load and regional round trips' },
      { option: 'Session token with eligible replica selection', bestWhen: 'A session moves between workers or regions', pros: 'Caught-up replicas can serve local reads', cons: 'Tokens need continuity and slow replicas can cause waits' },
    ],
    failureModes: [{ title: 'The next request lands on a fresh API worker', mitigation: 'Propagate a store-issued session token through the client or shared session state. Scope it to the correct partition, tenant and session.', interviewProbe: 'Does a different device share the same session contract?' }],
  },
  sources: [{ title: 'Azure Cosmos DB, session consistency and the scope of guarantees', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels#session-consistency' }],
};

const concurrentUpdates = {
  id: 'concurrent-updates', title: 'Merging concurrent edits',
  subtitle: 'Design an offline count, then decide which kinds of edits need a different policy.',
  duration: '8 min', level: 'Intermediate',
  tags: ['offline first', 'CRDT', 'G-counter', 'multi-value register', 'conflict resolution'],
  objectives: ['Trace a lost increment during an offline edit', 'Merge a grow-only counter under duplicate delivery', 'Separate convergence from application invariants'],
  steps: [
    {
      shortLabel: 'Lost intent', stage: 'PROBLEM', title: 'Two taps become one increment',
      body: ['Two offline devices read a shared count of 5. Each records a tap by assigning 6 to the same field. When they reconnect, a deterministic last-writer rule can make every replica display 6. The product promised one increment for each accepted tap, so the intended result is 7.', 'Saving a replacement value discarded the evidence that there were two separate actions. Choose a replicated data type whose operations preserve that evidence.'],
      scene: {
        nodes: [node('a', 'client', 140, 120, 'Device A', '5 + 1 → 6', 'blue'), node('b', 'client', 140, 315, 'Device B', '5 + 1 → 6', 'purple'), node('server', 'db', 575, 215, 'Merged field', 'value 6', 'coral')],
        edges: [edge('a', 'server', 'set 6', 'blue'), edge('b', 'server', 'set 6', 'purple')],
        hud: [metric('Accepted taps', '2', 'info'), metric('Visible increase', '1', 'bad')],
        legend: [{ label: 'A’s assignment', tone: 'blue' }, { label: 'B’s assignment', tone: 'purple' }],
      },
    },
    {
      shortLabel: 'State merge', stage: 'SOLUTION', title: 'Give each writer its own increasing component',
      body: ['Model the initial 5 as `[3, 2]`, one cumulative total per device. Each device owns exactly one component. Offline A reaches `[4, 2]` and B reaches `[3, 3]`. Merge the state by taking the larger value at each component, yielding `[4, 3]` with visible total 7.', 'This grow-only counter has an associative, commutative and idempotent merge. Replaying the old state `[4, 2]` leaves `[4, 3]` unchanged. Sending a bare “increment” twice would need a separate deduplication rule.'],
      scene: {
        nodes: [node('a', 'client', 140, 120, 'Device A', '[4, 2]', 'blue'), node('b', 'client', 140, 315, 'Device B', '[3, 3]', 'purple'), node('merged', 'db', 575, 215, 'Merged state', '[4, 3] = 7', 'green')],
        edges: [edge('a', 'merged', 'A state', 'blue'), edge('b', 'merged', 'B state', 'purple')],
        hud: [metric('Merge rule', 'Per-writer max', 'info'), metric('Duplicate A', 'Still 7', 'good')],
        legend: [{ label: 'Per-writer cumulative state', tone: 'blue' }],
      },
    },
    {
      shortLabel: 'Invariant', stage: 'TRADEOFF', title: 'A converged count can still oversell a seat',
      body: ['Now each device tries to reserve the same last seat. Even a perfectly merged counter can record two accepted reservations. To enforce one sale, serialize the claim on a single authoritative record or allocate a unique reservation right to one device before disconnection.', 'For concurrent edits to a delivery address, summing values has no meaning. Preserve both versions for review, or publish a deterministic overwrite policy if the product can tolerate losing one edit.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'A device loses its counter state and restarts. Give it a fresh writer identity or restore its old high-water mark. Explain how old identities can be retired while delayed messages are still in flight.' },
      scene: {
        nodes: [node('a', 'client', 140, 120, 'Device A', 'requests seat 9', 'blue'), node('b', 'client', 140, 315, 'Device B', 'requests seat 9', 'purple'), node('seat', 'db', 575, 215, 'Seat 9', 'one owner', 'green')],
        edges: [edge('a', 'seat', 'claim', 'blue'), edge('b', 'seat', 'claim', 'purple')],
        hud: [metric('Unique seats', '1', 'info'), metric('Successful claims', 'At most 1', 'good')],
        legend: [{ label: 'Competing conditional claims', tone: 'blue' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Grow-only counter', bestWhen: 'Independent increments can be accepted offline', pros: 'Repeated state merges preserve the total', cons: 'Deletion, reset and writer retirement need additional rules' },
      { option: 'Multi-value register', bestWhen: 'A human can choose between competing scalar edits', pros: 'Retains competing values until resolved', cons: 'Consumers need a conflict presentation policy' },
      { option: 'Conditional claim', bestWhen: 'There is one exclusive owner', pros: 'A successful atomic transition prevents double allocation', cons: 'Disconnected writers may have to wait' },
    ],
  },
  sources: [{ title: 'Trillium, the grow-only counter implementation and proof', url: 'https://arxiv.org/pdf/2109.07863' }, { title: 'Automerge, conflicts and multi-value registers', url: 'https://automerge.org/docs/reference/documents/conflicts/' }],
};

const atomicCommit = {
  id: 'atomic-commit', title: 'Two-phase commit and uncertain outcomes',
  subtitle: 'Move 20 credits between two database shards and recover the decision after a crash.',
  duration: '10 min', level: 'Advanced',
  tags: ['two-phase commit', '2PC', 'prepared transactions', 'coordinator', 'atomicity', 'consensus'],
  objectives: ['Identify what a prepare vote promises', 'Recover participants from the durable decision', 'Distinguish atomic commit from isolation and availability'],
  steps: [
    {
      shortLabel: 'Prepare', stage: 'SETUP', title: 'Each shard promises it can complete its half',
      body: ['Accounts A and B start at 75 and 30 credits on different shards. Transfer T8 moves 20 from A to B. Both participants stage their changes under T8. A prepare vote of yes means the participant has durably recorded enough state to finish later and will retain the resources it needs.', 'The coordinator can choose commit only after both vote yes. A no vote or a missing vote before a commit decision allows the coordinator to choose abort. A participant that has already voted yes must learn the outcome.'],
      scene: {
        nodes: [node('tm', 'hex', 145, 215, 'Coordinator', 'transaction T8', 'blue'), node('a', 'db', 570, 120, 'Shard A', 'stage 75 → 55', 'purple'), node('b', 'db', 570, 315, 'Shard B', 'stage 30 → 50', 'purple')],
        edges: [edge('a', 'tm', 'prepared', 'purple'), edge('b', 'tm', 'prepared', 'purple')],
        hud: [metric('Prepared votes', '2 / 2', 'good'), metric('Initial total', '105 credits', 'info')],
        legend: [{ label: 'Durable promise to finish', tone: 'purple' }],
      },
    },
    {
      shortLabel: 'Decision', stage: 'PROBLEM', title: 'The coordinator fails halfway through notifying participants',
      body: ['The coordinator durably records COMMIT, sends it to A and crashes before B receives it. A commits. B still holds its prepared state. A local timeout at B cannot distinguish this history from a delayed abort in a different execution.', 'If B independently aborts, 20 credits disappear. B can retry the decision lookup, or learn a provable decision from a participant that already knows it. With all authoritative decision evidence unreachable, classic two-phase commit can block.'],
      scene: {
        nodes: [node('tm', 'db', 145, 215, 'Decision log', 'T8 = COMMIT', 'blue'), node('a', 'db', 570, 120, 'Shard A', 'committed 55', 'green'), node('b', 'db', 570, 315, 'Shard B', 'still prepared', 'amber')],
        edges: [edge('tm', 'a', 'commit T8', 'green')],
        hud: [metric('Decision', 'Durable', 'good'), metric('In doubt', 'Shard B', 'warn')],
        legend: [{ label: 'Delivered decision', tone: 'green' }, { label: 'Awaiting delivery', tone: 'amber' }],
      },
    },
    {
      shortLabel: 'Recover', stage: 'SOLUTION', title: 'Resend the recorded outcome using the same transaction ID',
      body: ['A recovery worker reads T8’s durable commit record and resends it. A recognizes a completed T8. B applies its staged credit once and releases the locks. The final balances are 55 and 50. Clients can query T8 after a response timeout without starting a second transfer.', 'Atomic commit establishes one final outcome. To promise consistent multi-shard snapshots or serializable execution, specify a concurrency-control and read protocol as well. To survive the loss of one coordinator machine, the decision record must remain accessible under the intended fault model.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'Suppose B voted no before a decision was recorded. Can a majority vote of the participants commit the transfer? B cannot honor a commit, so the transaction must abort.' },
      scene: {
        nodes: [node('recovery', 'hex', 145, 215, 'Recovery', 'replays T8', 'blue'), node('a', 'db', 570, 120, 'Shard A', 'already applied', 'green'), node('b', 'db', 570, 315, 'Shard B', 'applies once', 'green')],
        edges: [edge('recovery', 'a', 'commit T8', 'green'), edge('recovery', 'b', 'commit T8', 'green')],
        hud: [metric('In doubt', '0 shards', 'good'), metric('Final total', '105 credits', 'good')],
        legend: [{ label: 'Replay of the same decision', tone: 'green' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Co-locate the accounts', bestWhen: 'The common transfer fits one transaction boundary', pros: 'One local commit path', cons: 'Some transfers still cross the boundary' },
      { option: 'Two-phase commit', bestWhen: 'Every resource can prepare and needs one final outcome', pros: 'Atomic decision across participants', cons: 'In-doubt participants can hold locks during an outage' },
      { option: 'Saga', bestWhen: 'Intermediate states and compensating operations fit the business contract', pros: 'Steps can be local transactions', cons: 'Other readers may observe partial progress and compensation can fail' },
    ],
    failureModes: [{ title: 'Recovery discarded the only commit decision before every participant learned it', mitigation: 'Retain durable transaction metadata until the protocol can prove it is safe to forget. Monitor the age of prepared transactions and resolve them from authoritative evidence.', interviewProbe: 'If a timeout triggers a new transfer ID, what prevents a duplicate debit?' }],
  },
  sources: [{ title: 'Jim Gray and Leslie Lamport, Consensus on Transaction Commit', url: 'https://www.microsoft.com/en-us/research/publication/consensus-on-transaction-commit/' }, { title: 'PostgreSQL, two-phase transactions', url: 'https://www.postgresql.org/docs/current/two-phase.html' }],
};

const schemaEvolution = {
  id: 'schema-evolution', title: 'Schema evolution and replay',
  subtitle: 'Change an event contract while old producers, new consumers and archived records coexist.',
  duration: '8 min', level: 'Intermediate',
  tags: ['schemas', 'serialization', 'Avro', 'compatibility', 'replay', 'event contracts'],
  objectives: ['Check both directions of reader/writer compatibility', 'Choose a meaningful default for historical records', 'Detect a semantic change that still decodes successfully'],
  steps: [
    {
      shortLabel: 'Old data', stage: 'SETUP', title: 'A new consumer must read yesterday’s event',
      body: ['Version 1 of an Avro record named Dispatch has one string field, `orderId`. Version 2 retains that field and adds a string `serviceLevel` with reader default `standard`. The old service only ever shipped standard orders, so this default accurately describes the archive.', 'Avro decodes a record using its writer schema and resolves the fields against the reader schema. With a v1 writer and v2 reader the missing field receives the reader default. That direction tests **backward compatibility**.'],
      scene: {
        nodes: [node('archive', 'queue', 155, 215, 'Archive', 'writer v1', 'purple'), node('reader', 'hex', 585, 215, 'Consumer v2', 'adds default', 'green')],
        edges: [edge('archive', 'reader', 'order 17', 'purple')],
        hud: [metric('Writer', 'v1', 'info'), metric('Service level', 'standard', 'good')],
        legend: [{ label: 'Historical event', tone: 'purple' }],
      },
    },
    {
      shortLabel: 'Old reader', stage: 'TECHNIQUE', title: 'Keep mixed deployments working in both directions',
      body: ['A v2 producer emits an express order. The v1 reader recognizes `orderId` and skips the unfamiliar field under Avro resolution rules. That direction tests **forward compatibility**. The old reader can still decode the record.', 'If that reader is the dispatcher and it treats all orders as standard, decoding is insufficient. Upgrade dispatchers before enabling express orders. Track consumer versions and exercise the business outcome in a mixed-version test.'],
      scene: {
        nodes: [node('producer', 'hex', 150, 215, 'Producer v2', 'express order', 'blue'), node('old', 'hex', 580, 125, 'Dispatcher v1', 'standard route', 'amber'), node('new', 'hex', 580, 310, 'Dispatcher v2', 'express route', 'green')],
        edges: [edge('producer', 'old', 'decodes', 'amber'), edge('producer', 'new', 'decodes', 'green')],
        hud: [metric('Wire decoding', 'Both pass', 'good'), metric('Correct dispatch', 'v2 only', 'warn')],
        legend: [{ label: 'Semantically wrong delivery', tone: 'amber' }, { label: 'Correct service level', tone: 'green' }],
      },
    },
    {
      shortLabel: 'Replay', stage: 'TRADEOFF', title: 'Test the oldest retained writer before removing a default',
      body: ['A proposed v3 reader keeps `serviceLevel` but removes its default. A v2 event always includes the field and passes a latest-only test. A v1 event from the retention window has no such field and fails resolution. Compatibility with the previous version does not imply compatibility with all retained writers.', 'Keep a fixture encoded with each supported writer schema and test the decoded value with the candidate reader. Preserve the writer schemas or identifiers needed to resolve archived bytes, including snapshots that could be restored later.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'What if v1 included both standard and express orders but never recorded that distinction? Use an explicit unknown value or recover the fact from an authoritative source. A convenient default would invent history.' },
      scene: {
        nodes: [node('v1', 'queue', 150, 120, 'v1 fixture', 'field absent', 'purple'), node('v2', 'queue', 150, 315, 'v2 fixture', 'field present', 'blue'), node('reader', 'hex', 585, 215, 'Candidate v3', 'no default', 'amber')],
        edges: [edge('v1', 'reader', 'fails', 'coral'), edge('v2', 'reader', 'passes', 'green')],
        hud: [metric('Replay fixtures', '2', 'info'), metric('Passing', '1 of 2', 'bad')],
        legend: [{ label: 'Older record breaks replay', tone: 'coral' }, { label: 'Newer record resolves', tone: 'green' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Reader default', bestWhen: 'A historical value can be inferred accurately', pros: 'Existing data can be read without rewriting it', cons: 'Incorrect defaults silently misclassify history' },
      { option: 'New event type with translation', bestWhen: 'An event changes meaning or requires a new workflow', pros: 'Consumers can migrate explicitly', cons: 'Translation and dual-version support need ownership' },
    ],
    failureModes: [{ title: 'A replay worker cannot resolve an old writer schema', mitigation: 'Retain schema history for the full restore and replay horizon. Test retrieval and decoding against a restored sample.', interviewProbe: 'Do offline backups extend your compatibility window beyond the live queue’s retention?' }],
  },
  sources: [{ title: 'Apache Avro specification, schema resolution', url: 'https://avro.apache.org/docs/1.12.0/specification/#schema-resolution' }],
};

const onlineResharding = {
  id: 'online-resharding', title: 'Moving a live shard',
  subtitle: 'Split a key range while orders are changing and prove that each acknowledged write survives cutover.',
  duration: '10 min', level: 'Advanced',
  tags: ['online resharding', 'snapshot', 'CDC', 'change data capture', 'cutover', 'backfill', 'Vitess'],
  objectives: ['Join a snapshot to its change stream without a gap', 'Estimate whether a migration can catch up', 'Fence the old writer and establish a rollback boundary'],
  steps: [
    {
      shortLabel: 'Snapshot', stage: 'SETUP', title: 'Copy a consistent version and retain changes from its boundary',
      body: ['An order shard owns hash keys 0–99. Move 50–99 to a new shard. Keep the old shard as the only writer. Take a consistent snapshot of the moving range at source-log position 100 and retain the stream of committed changes strictly after 100.', 'In this design the copy finishes before ordered replay begins. An order present in the snapshot and deleted at position 102 first appears on the target and is then removed. Capturing only inserts and updates would silently bring that order back.'],
      scene: {
        nodes: [node('source', 'db', 145, 215, 'Old shard', 'owns 0–99', 'purple'), node('target', 'db', 570, 120, 'New shard', 'copy 50–99', 'blue'), node('log', 'queue', 570, 315, 'Retained log', 'changes > 100', 'amber')],
        edges: [edge('source', 'target', 'snapshot 100', 'blue'), edge('source', 'log', 'live writes', 'amber')],
        hud: [metric('Write owner', 'Old shard', 'info'), metric('Snapshot position', '100', 'info')],
        legend: [{ label: 'Consistent copy', tone: 'blue' }, { label: 'Post-snapshot changes', tone: 'amber' }],
      },
    },
    {
      shortLabel: 'Catch up', stage: 'TECHNIQUE', title: 'Replay faster than new changes arrive',
      body: ['After copying, the target has 900,000 relevant changes to apply. It sustains 3,000 changes per second while 2,000 new ones arrive each second. At these constant rates, drain time is `900,000 / (3,000 − 2,000) = 900 seconds`, or 15 minutes. If apply capacity drops below arrivals, the lag grows.', 'Apply data and its source checkpoint in one transaction where possible. Otherwise use versioned, idempotent application so a crash between write and checkpoint can safely replay an event. Compare source and target rows at a common logical point, including missing keys and deletes.'],
      scene: {
        nodes: [node('source', 'db', 120, 215, 'Source', '2,000/s', 'purple'), node('log', 'queue', 380, 215, 'Backlog', '900,000', 'amber'), node('target', 'db', 640, 215, 'Target', '3,000/s', 'blue')],
        edges: [edge('source', 'log', 'arrive', 'purple'), edge('log', 'target', 'apply', 'blue')],
        hud: [metric('Net drain', '1,000/s', 'good'), metric('Catch-up time', '15 min', 'info')],
        legend: [{ label: 'New changes', tone: 'purple' }, { label: 'Ordered replay', tone: 'blue' }],
      },
    },
    {
      shortLabel: 'Transfer ownership', stage: 'SOLUTION', title: 'Stop old writes before authorizing the new owner',
      body: ['Briefly fence writes for 50–99 on the old shard and drain in-flight transactions. Record the final committed position F. Wait for the target to apply through F and verify the agreed checks. Publish the new routing epoch and authorize the target for that range. A router with an old map must receive a retry or redirect from the fenced owner.', 'Before the new shard accepts writes, an aborted cutover can reopen the old owner after disabling the target. After new writes arrive, reversing the map alone can lose those writes. Use validated reverse replication, fence the target, and catch the old owner up before switching back.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'A dashboard says lag is zero seconds, but the final position is 701 and the target checkpoint is 700. Which observation gates cutover? Wait for verified application through 701.' },
      scene: {
        nodes: [node('old', 'db', 145, 120, 'Old shard', 'range fenced', 'amber'), node('router', 'hex', 145, 315, 'Router', 'new epoch', 'purple'), node('new', 'db', 575, 215, 'New owner', 'applied F', 'green')],
        edges: [edge('old', 'new', 'final log F', 'amber'), edge('router', 'new', 'writes 50–99', 'green')],
        hud: [metric('Writable owners', 'Exactly 1 after switch', 'good'), metric('Catch-up gate', 'Applied through F', 'info')],
        legend: [{ label: 'Last old-owner changes', tone: 'amber' }, { label: 'Post-cutover traffic', tone: 'green' }],
      },
    },
  ],
  deepDive: {
    capacityMath: [
      { label: 'Log retention during copy', value: '1.8 million relevant changes', formula: 'At 2,000 changes/s over 15 minutes, 2,000 × 900 changes accumulate before replay. Retain headroom for retries and slower copies.' },
      { label: 'Catch-up condition', value: 'Apply rate > incoming rate', formula: 'Time to drain = backlog / (apply rate − incoming rate), assuming stable rates and the same unit.' },
    ],
    failureModes: [{ title: 'Copy duration exceeds source log retention', mitigation: 'Stop before promoting the target. Recover a complete retained stream from the snapshot boundary or restart from a fresh consistent snapshot.', interviewProbe: 'Why could equal row counts on the two sides still hide a missing update?' }],
  },
  sources: [{ title: 'Vitess, reshard workflow and traffic switching', url: 'https://vitess.io/docs/24.0/reference/vreplication/reshard/' }, { title: 'Vitess, VDiff validation', url: 'https://vitess.io/docs/24.0/reference/vreplication/vdiff/' }],
};

const replicaRepair = {
  id: 'replica-repair', title: 'Replica repair and deleted data',
  subtitle: 'Follow a delete through a replica outage, anti-entropy repair and eventual compaction.',
  duration: '8 min', level: 'Advanced',
  tags: ['anti-entropy', 'Merkle trees', 'Cassandra', 'tombstones', 'repair', 'compaction'],
  objectives: ['Explain why deletion needs versioned evidence', 'Use range hashes to find divergent replicas', 'Set a repair deadline with margin before tombstone collection'],
  steps: [
    {
      shortLabel: 'Delete marker', stage: 'PROBLEM', title: 'Two replicas delete a key while the third is offline',
      body: ['Replicas A, B and C store catalog item 47 with mutation timestamp 10. C disconnects. A and B accept a delete with timestamp 12 and retain a **tombstone**, a versioned deletion marker. C still has the item at 10.', 'On reconciliation the marker at 12 suppresses the older item at 10. If A and B had immediately erased every trace of item 47, a later merge could mistake C’s copy for data they lacked.'],
      scene: {
        nodes: [node('a', 'db', 135, 215, 'Replica A', 'delete @12', 'purple'), node('b', 'db', 450, 120, 'Replica B', 'delete @12', 'green'), node('c', 'db', 620, 310, 'Replica C', 'value @10', 'amber')],
        edges: [edge('a', 'b', 'delete 47', 'green')],
        hud: [metric('Delete retained', '2 / 3 replicas', 'warn'), metric('C status', 'Offline', 'warn')],
        legend: [{ label: 'Received delete', tone: 'green' }, { label: 'Stale replica', tone: 'amber' }],
      },
    },
    {
      shortLabel: 'Repair', stage: 'TECHNIQUE', title: 'Narrow the mismatch to a range before streaming data',
      body: ['C rejoins while the marker still exists. Replicas compare Merkle trees built over matching key ranges. Different root hashes indicate a mismatch. Comparing child hashes narrows the difference, then the repair streams the affected range and reconciles versions.', 'A Merkle hash locates divergence. Record timestamps and tombstones determine the result. An idle range may never receive client reads, so schedule repair across all replicated ranges and monitor successful completion for each.'],
      scene: {
        nodes: [node('ab', 'db', 140, 215, 'Replica A', 'marker @12', 'purple'), node('range', 'hex', 385, 215, 'Range 32–63', 'hash differs', 'amber'), node('c', 'db', 640, 215, 'Replica C', 'marker @12', 'green')],
        edges: [edge('ab', 'range', 'compare', 'amber'), edge('range', 'c', 'repair', 'green')],
        hud: [metric('Repaired key', 'Item 47', 'info'), metric('C after merge', 'Deleted', 'good')],
        legend: [{ label: 'Range comparison', tone: 'amber' }, { label: 'Deletion propagated', tone: 'green' }],
      },
    },
    {
      shortLabel: 'Retention', stage: 'TRADEOFF', title: 'Budget repair time before the marker can be reclaimed',
      body: ['Suppose this table has a seven-day grace period. If a replica misses a deletion and the other copies have already purged the marker during eligible compaction, the stale value can reappear. The grace period sets an eligibility threshold. Physical removal depends on compaction conditions.', 'Budget for outage, waiting for the next repair, repair runtime and retries. If the replica was absent beyond the safe horizon, isolate the stale copy and rebuild it from verified current data using the store’s supported procedures. Check restores against the same deletion history.'],
      callout: { type: 'INTERVIEW SIGNAL', text: 'With a 168-hour grace period, 96 hours offline, 48 hours of scheduling delay and 12 hours for repair leave only 12 hours of margin. An additional 18-hour delay exceeds the budget by 6 hours.' },
      scene: {
        nodes: [node('outage', 'hex', 130, 215, 'Offline', '96 hours', 'amber'), node('schedule', 'queue', 380, 215, 'Repair queue', '48 hours', 'purple'), node('repair', 'db', 635, 215, 'Completion', '12 more hours', 'green')],
        edges: [edge('outage', 'schedule', 'rejoin', 'amber'), edge('schedule', 'repair', 'run', 'green')],
        hud: [metric('Coverage time', '156 h', 'info'), metric('Margin', '12 h', 'warn')],
        legend: [{ label: 'Time before repair', tone: 'amber' }, { label: 'Repair completion', tone: 'green' }],
      },
    },
  ],
  deepDive: {
    tradeoffs: [
      { option: 'Read-triggered repair', bestWhen: 'Frequently accessed keys need prompt reconciliation', pros: 'Focuses work on active data', cons: 'Cold keys may never be read' },
      { option: 'Scheduled range repair', bestWhen: 'Every replicated range needs bounded coverage', pros: 'Covers cold data and missed hints', cons: 'Consumes network and disk capacity and needs scheduling' },
    ],
    failureModes: [{ title: 'A green cluster-wide average hides one unrepaired range', mitigation: 'Track the oldest successful repair for each table and range, membership changes and the gap to its configured grace period.', interviewProbe: 'If a repair job starts on time but keeps failing on the same range, which alert should page the operator?' }],
  },
  sources: [{ title: 'Apache Cassandra, tombstones and deletion semantics', url: 'https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/tombstones.html' }, { title: 'Apache Cassandra, repair coverage and Merkle trees', url: 'https://cassandra.apache.org/doc/latest/cassandra/managing/operating/repair.html' }],
};

export const DISTRIBUTED_CORRECTNESS = {
  id: 'mod-distributed-correctness',
  title: 'Distributed Correctness & Data Lifecycle',
  track: 'hld',
  lessons: [logicalClocks, sessionGuarantees, concurrentUpdates, atomicCommit, schemaEvolution, onlineResharding, replicaRepair],
};
