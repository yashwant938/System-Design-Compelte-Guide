// The figures in each brief are scenario assumptions. Each stage has a stable
// key so saved notes and evidence checks survive edits to the teaching copy.
export const DESIGN_REVIEWS = [
  {
    id: 'field-inspections',
    title: 'Offline field inspections',
    brief: 'A utility sends inspectors to sites with intermittent mobile coverage. Two inspectors can visit the same site while offline. A supervisor must see exactly which reports and photos have arrived before signing off.',
    assumptions: [
      '12,000 inspectors each file two reports per hour during an eight-hour shift.',
      'A report carries 4 kB of metadata and two photos averaging 1.5 MB each. Use decimal units.',
      'At shift end, 25% of inspectors reconnect with four queued reports each over five minutes.',
    ],
    lessons: [
      { id: 'transactions', label: 'Transaction isolation' },
      { id: 'files', label: 'Object storage' },
    ],
    stages: [
      {
        id: 'requirements', title: 'Requirements',
        prompt: 'Define what “saved” means in the field and what a supervisor may sign. Decide what happens when two inspectors disagree about the same site.',
        answer: [
          'The device confirms a local save only after the report and photo references reach persistent storage. It shows separate states for queued, server received, and attachments verified. An online metadata acknowledgment target could be p95 under five seconds, measured from the start of an upload.',
          'Keep each inspector’s report as a separate observation. A supervisor resolves conflicting findings and signs a specific set of report revisions only after all required photos verify. A replacement device can recover data that the server has acknowledged. A device lost before its first sync can lose queued work.',
        ],
        checks: {
          acknowledgment: 'I named the durable write behind each acknowledgment and the device-loss boundary.',
          signoff: 'My sign-off rule identifies a revision and explains how conflicting findings are preserved.',
        },
      },
      {
        id: 'estimates', title: 'Capacity estimates',
        prompt: 'Estimate a day of photo storage, the reconnect rate, and its photo bandwidth. Which resource would you isolate to keep metadata responsive?',
        answer: [
          '12,000 × 2 × 8 = 192,000 reports per shift. The photo volume is 192,000 × 3 MB = 576 GB per shift. Metadata adds 768 MB. These are payload bytes before replication, indexes, retries, or retention.',
          '3,000 reconnecting devices × 4 reports / 300 seconds = 40 reports/s on average during the window. Their photos require 120 MB/s, about 960 Mb/s. Individual seconds may be much busier. Send photo bytes directly to object storage and give metadata its own request budget.',
        ],
        checks: {
          volume: 'I showed daily volume with units and stated which overheads I excluded.',
          reconnect: 'I sized the reconnect window separately and identified the dominant traffic.',
        },
      },
      {
        id: 'design', title: 'System design',
        prompt: 'Trace one report from a phone to the sign-off screen. Show the retry identity, the upload path, and the transaction that makes a revision eligible for review.',
        answer: [
          'Generate a report ID on the device and keep it across retries. The metadata API writes an immutable revision and its expected photo digests in one transaction. Enforce uniqueness on the tenant, report ID, and revision. A repeat with matching content returns the existing receipt. A repeat with different content raises a conflict.',
          'Issue time-limited uploads for the expected attachments. Once storage confirms the size and digest for each object, mark that attachment verified. A conditional update marks the revision ready only when every expected attachment verifies. The sign-off transaction records the approved revision IDs and verifies their ready state.',
        ],
        checks: {
          replay: 'I traced a retry through a uniqueness constraint and defined the response to mismatched content.',
          attachments: 'I explained how attachment verification gates sign-off.',
        },
      },
      {
        id: 'failures', title: 'Failure review',
        prompt: 'The server committed a report but its reply was lost. One photo arrived and its notification was delayed. Walk through reconnection, recovery, and the evidence you would inspect.',
        answer: [
          'On reconnect, repeat the same metadata request, read the server’s attachment status, and send only missing content. The app can release the local photo after the server confirms verification. Replaying a storage notification repeats the same conditional attachment update.',
          'A reconciliation worker checks old pending revisions against stored objects. It verifies any existing object and flags genuinely missing uploads for the device. Test by dropping the metadata reply, withholding the notification, and replaying both. Expect one revision, two verified digests, and one eligible sign-off. Monitor age of the oldest pending revision.',
        ],
        checks: {
          convergence: 'I traced the lost reply and delayed event to a single consistent result.',
          recovery: 'I gave a repair path and a test with an observable pass condition.',
        },
      },
    ],
  },
  {
    id: 'package-registry',
    title: 'Regional package registry',
    brief: 'Build a registry that lets development teams publish a package version once and download identical bytes from several regions. A release can send thousands of build workers to the same new version within seconds.',
    assumptions: [
      'Peak traffic is 800 downloads/s with a mean payload size of 5 MB.',
      'At peak, edge caches normally serve 95% of requested bytes. After a new release this can fall to 70%.',
      'Once publication succeeds, new versions should appear in fresh version listings within 30 seconds. A yanked version stays available to a build pinned to its digest.',
    ],
    lessons: [
      { id: 'cdn', label: 'Content delivery networks' },
      { id: 'caching', label: 'Cache behavior' },
    ],
    stages: [
      {
        id: 'requirements', title: 'Requirements',
        prompt: 'Specify the result of two concurrent publishes of the same version. Explain what a client reading a version list or using a previously pinned digest can observe.',
        answer: [
          'Treat a package/version pair as an immutable binding to a digest. The first committed publication wins. A retry with the same bytes can return the stored receipt. Report a conflict for different bytes under that version.',
          'Measure listing freshness from acknowledged publication to discovery through each region. Give yanks the same bounded propagation target. A fresh listing excludes a yanked version from new resolution, while an existing pin continues to fetch the same digest. Preserve the binding to prevent version reuse.',
        ],
        checks: {
          immutability: 'I specified the result of concurrent publishes with equal and unequal bytes.',
          freshness: 'I gave listing discovery a measurable bound and a rule for previously pinned builds.',
        },
      },
      {
        id: 'estimates', title: 'Capacity estimates',
        prompt: 'Calculate edge and origin payload bandwidth at both hit rates. Predict what happens if the origin can sustain 300 MB/s.',
        answer: [
          'Total delivery is 800 × 5 MB = 4,000 MB/s, or 32 Gb/s using decimal units. With a 95% byte hit rate, 5% reaches the origin, about 200 MB/s. With a 70% byte hit rate, origin traffic rises to 1,200 MB/s before request coalescing or secondary caches.',
          'The cold-release estimate is four times a 300 MB/s origin budget. The budget covers only 7.5% of requested bytes at this peak. A release needs at least a 92.5% effective byte hit rate at that tier, extra capacity, or delayed demand. Benchmark synchronized cold requests for the same object.',
        ],
        checks: {
          bandwidth: 'I converted the byte hit rate into origin bandwidth for both cases.',
          budget: 'I quantified the origin shortfall and described a load test for it.',
        },
      },
      {
        id: 'design', title: 'System design',
        prompt: 'Design the publish path and both read paths. Identify the commit point, the cache keys, and the operation that changes on a yank.',
        answer: [
          'Upload the blob into staging and verify its digest. Finalize it under an immutable content key in storage that regional misses can reach. Only then commit the package/version binding with a unique constraint in the metadata store. Readers should never discover a version whose bytes have yet to reach its serving origin.',
          'Route blob downloads by digest through a CDN and regional shield cache. Give metadata listings short, bounded cache lifetimes and refresh on changes. Count replica lag, listing cache age, and negative cache entries against the discovery budget. A yank changes resolution metadata while retained digest objects remain fetchable.',
        ],
        checks: {
          publish: 'I identified the metadata commit point and showed that published bytes are already readable.',
          cachekeys: 'I separated mutable listings from immutable digest keys and bounded discovery delay.',
        },
      },
      {
        id: 'failures', title: 'Failure review',
        prompt: 'A publisher times out after uploading a blob. At the next release, several regions simultaneously miss the hot blob. Explain how you recover safely and prove it.',
        answer: [
          'Retry publication with the same version and digest and read back the binding. A missing binding can be created after blob verification. Reclaim unreferenced uploads after a grace period using a deletion protocol that excludes active publications, such as a staging lease checked atomically during finalization.',
          'Coalesce concurrent fills per digest at each regional shield and cap concurrent origin reads. Prewarm announced large releases where possible. In a cold-cache drill, drop a publish reply and issue simultaneous regional downloads. Verify one binding, identical digests, bounded concurrent origin reads, and the listing-freshness target.',
        ],
        checks: {
          orphan: 'I handled the ambiguous publication result and protected in-flight blobs from cleanup.',
          coldstart: 'I named a cold-cache control and the measurements that would validate it.',
        },
      },
    ],
  },
  {
    id: 'batch-scheduler',
    title: 'Shared batch compute',
    brief: 'Three teams share a pool of workers that render previews from immutable inputs. One team can submit an entire day of jobs at once. The platform must make progress for each team and expose one final output per job.',
    assumptions: [
      'The steady arrival rate is 15,000 jobs/hour across the teams. Each job occupies four vCPUs for 30 seconds.',
      'The pool has 1,000 allocatable vCPUs. A surge triples the total arrival rate for 20 minutes.',
      'Jobs can safely run again. Teams have equal entitlement, and idle capacity may be borrowed. Treat CPU as the only limiting resource for the estimate.',
    ],
    lessons: [
      { id: 'queues', label: 'Message queues' },
      { id: 'lld-task-scheduler', label: 'Task scheduling' },
    ],
    stages: [
      {
        id: 'requirements', title: 'Requirements',
        prompt: 'Define a successful submission, fairness during contention, and what a client sees if the same job runs twice.',
        answer: [
          'Return a durable job ID after recording the request with its tenant-scoped idempotency key. Expose the states queued, running, succeeded, failed, and cancelled. A successful job points to one immutable output manifest even if multiple attempts did work.',
          'When all three teams maintain runnable backlogs, target roughly one third of active slots per team after running jobs finish. Let other teams borrow unused slots. Specify an observation window longer than a job and monitor queue age per team so aggregate throughput cannot hide starvation.',
        ],
        checks: {
          result: 'I specified the submission acknowledgment and observable outcome of duplicate execution.',
          fairness: 'I defined fairness over a time window and accounted for idle teams.',
        },
      },
      {
        id: 'estimates', title: 'Capacity estimates',
        prompt: 'Derive steady CPU demand, the backlog at the end of the surge, and the time to clear it. State the assumptions that make this a lower bound.',
        answer: [
          'Each job needs 120 vCPU-seconds. Steady demand is 15,000 × 120 / 3,600 = 500 vCPUs. With 1,000 allocatable vCPUs the ideal service rate is 30,000 jobs/hour. The surge brings 45,000/hour, growing the backlog by 15,000/hour × one third hour = 5,000 jobs.',
          'After the surge, spare service is 30,000 − 15,000 = 15,000 jobs/hour. Clearing 5,000 queued jobs takes another 20 minutes at full utilization. Startup time, retries, and uneven resource requirements increase the recovery time. Check measured job runtimes and allocation efficiency before committing to a deadline.',
        ],
        checks: {
          units: 'I derived the service rate from CPU-seconds per job.',
          drain: 'I subtracted continuing arrivals during recovery and identified an idealization.',
        },
      },
      {
        id: 'design', title: 'System design',
        prompt: 'Trace submission, dispatch, execution, and publication. Describe how to share capacity and where ownership of an attempt is checked.',
        answer: [
          'Atomically insert the job and its durable queue entry, or use a transactional outbox to enqueue it. Select across tenant queues based on current allocations and demand. Identical four-vCPU jobs allow simple slot accounting. Atomically claim a queued job with a lease expiry and incrementing attempt number.',
          'A worker heartbeats its lease and writes to a path unique to the job and attempt. Commit success with a conditional update requiring the same active attempt, a valid lease, and running state. Store the winning manifest pointer in that update. Downstream readers consume the committed pointer.',
        ],
        checks: {
          handoff: 'I covered the boundary between recording the job and making it dispatchable.',
          ownership: 'I identified how a stale worker is prevented from replacing a newer result.',
        },
      },
      {
        id: 'failures', title: 'Failure review',
        prompt: 'Worker A loses contact after writing output. Worker B takes over, then A returns. Describe both finalization orders and a drill that also checks fairness.',
        answer: [
          'After A’s lease expires, the scheduler can assign B a new attempt. A’s conditional commit fails if it arrives after expiry or reassignment. If A committed while its lease was valid, the job is already succeeded and B cannot claim it. Unpublished attempt files can be collected after the recovery window.',
          'Pause A across expiry, run B, then resume A and check the committed pointer and terminal state. In a second run, let A commit just before expiry. Add a large backlog for one team and small steady streams for the others. Record per-team slot share and oldest runnable job age while checking for a single winning manifest.',
        ],
        checks: {
          interleaving: 'I gave the outcome for each ordering of expiry and commit.',
          drill: 'My drill checks both the committed result and service to the smaller teams.',
        },
      },
    ],
  },
];

export function getStageProgress(record, stage) {
  const savedNote = record?.notes?.[stage.id];
  const note = typeof savedNote === 'string' ? savedNote : '';
  const savedChecks = record?.checks?.[stage.id];
  const criteria = Object.keys(stage.checks);
  const checked = criteria.filter((key) => Array.isArray(savedChecks) && savedChecks.includes(key));
  return { note, checked, reviewed: Boolean(note.trim()) && checked.length === criteria.length };
}
