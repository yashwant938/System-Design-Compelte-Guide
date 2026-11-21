export const STUDY_PATHS = [
  {
    id: 'first-design',
    title: 'Design your first service',
    outcome: 'Trace a request, size the workload, and design a URL shortener.',
    lessons: ['request-lifecycle', 'latency-throughput', 'napkin-math', 'apis', 'indexes', 'caching', 'design-url-shortener'],
    exercise: { title: 'Estimate peak traffic and storage', href: '#/lab/capacity' },
  },
  {
    id: 'correctness',
    title: 'Keep distributed data correct',
    outcome: 'Explain what a reader can observe during a failure or migration.',
    lessons: ['replication', 'transactions', 'logical-clocks', 'session-guarantees', 'concurrent-updates', 'atomic-commit', 'schema-evolution', 'online-resharding', 'replica-repair'],
    exercise: { title: 'Test read and write quorum overlap', href: '#/lab/quorum' },
  },
  {
    id: 'operations',
    title: 'Operate a service under load',
    outcome: 'Choose a recovery target, budget for capacity, and decide when to roll back.',
    lessons: ['queues', 'observability', 'queue-backlog-recovery', 'point-in-time-restore', 'slo-incident-response', 'canary-analysis', 'capacity-unit-economics'],
    exercise: { title: 'Model recovery after a worker outage', href: '#/lab/backlog' },
  },
  {
    id: 'data-platform',
    title: 'Build a trustworthy data platform',
    outcome: 'Preserve the meaning of a metric across late arrivals, deletions, and model training.',
    lessons: ['storage-engines', 'batch-stream', 'warehouse-fact-grain', 'event-time-windows', 'deletion-across-derived-data', 'point-in-time-features'],
    exercise: { title: 'Test your data platform decisions', href: '#/practice/quiz/data-platforms' },
  },
  {
    id: 'machine-coding',
    title: 'Implement a concurrent design',
    outcome: 'Move from an interface to a locking policy and check a contested reservation.',
    lessons: ['hld-lld', 'lld-oop-uml', 'lld-solid', 'lld-gof-patterns', 'lld-concurrency', 'lld-bookmyshow', 'lld-task-scheduler'],
    exercise: { title: 'Run two competing seat reservations', href: '#/lab/lld' },
  },
];
