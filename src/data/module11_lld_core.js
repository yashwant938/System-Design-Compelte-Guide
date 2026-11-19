// Module 11: LLD Core Mastery — OOP & UML, SOLID Principles, All 23 GoF Design Patterns, and Concurrency/Thread-Safety

export const MODULE_11_LLD_CORE = {
  id: 'mod-11-lld-core',
  number: '11',
  title: 'LLD Core & 23 Patterns',
  track: 'lld',
  lessons: [
    {
      id: 'lld-oop-uml',
      title: 'OOP Pillars, Domain Modeling & UML',
      subtitle: 'Composition over Inheritance, Association vs Aggregation vs Composition, and the 45-Minute LLD Interview Playbook.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Uber', 'Flipkart'],
      tags: ['oop', 'uml', 'composition', 'aggregation', 'class diagram', 'sequence diagram', 'lld framework'],
      objectives: [
        'Choose Composition over Inheritance to prevent brittle deep hierarchies',
        'Draw clean UML Class Relationships (Association, Aggregation ◇, Composition ◆, Inheritance ▷)',
        'Execute the 5-step 45-Minute Big Tech LLD / Machine Coding Playbook',
      ],
      steps: [
        {
          shortLabel: 'UML & OOP',
          stage: 'SETUP',
          title: 'Composition > Inheritance & UML Relationship Semantics',
          body: [
            '**Association** (`A → B`): Student takes Course (independent lifecycles). **Aggregation** (`Team ◇— Player`): Player survives if Team dissolves. **Composition** (`ParkingLot ◆— ParkingFloor`): Floors cannot exist without the ParkingLot!',
            'Always favor **Composition over Inheritance**: instead of `ElectricSurgeWeekendTruck extends Truck extends Vehicle`, compose `Vehicle` with a `PricingStrategy` and `FuelType` enum!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'In LLD interviews, **extract Nouns → Entities**, **extract Verbs → Methods/Services**, and **spot Future Changes → Interfaces / Design Patterns**!',
          },
          scene: {
            hud: [
              { label: 'COMPOSITION ◆', value: 'Owns Lifecycle', status: 'good' },
              { label: 'AGGREGATION ◇', value: 'Shared Reference', status: 'info' },
              { label: 'RULE #1', value: 'Compose Behaviors', status: 'good' },
              { label: 'TIME BUDGET', value: '45 Min LLD Loop', status: 'info' },
            ],
            nodes: [
              {
                id: 'lot',
                type: 'uml',
                x: 155,
                y: 215,
                label: 'ParkingLot',
                sublabel: '«Facade»',
                tone: 'blue',
                umlFields: ['- floors: List<Floor>', '- pricing: PricingStrategy'],
                umlMethods: ['+ park(Vehicle)', '+ exit(Ticket)'],
              },
              {
                id: 'fl',
                type: 'uml',
                x: 525,
                y: 120,
                label: 'ParkingFloor',
                sublabel: '◆ Composed',
                tone: 'purple',
                umlFields: ['- spots: List<Spot>'],
                umlMethods: ['+ findFree(Size)'],
              },
              {
                id: 'pr',
                type: 'uml',
                x: 525,
                y: 310,
                label: '«interface» Pricing',
                sublabel: '◇ Strategy',
                tone: 'green',
                umlFields: ['Hourly | Dynamic'],
                umlMethods: ['+ compute(Ticket)'],
              },
            ],
            edges: [
              { from: 'lot', to: 'fl', label: '◆ 1..N owns', packetColor: 'purple', speed: 1.9 },
              { from: 'lot', to: 'pr', label: '◇ delegates', packetColor: 'green', speed: 1.9 },
            ],
            legend: [
              { label: '◆ strict composition', tone: 'purple' },
              { label: '◇ strategy interface', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: '45m Playbook',
          stage: 'TECHNIQUE',
          title: 'The 45-Minute Big Tech LLD / Machine Coding Pacing Blueprint',
          body: [
            '**0–5m Clarify Scope**: Actors, concurrency (single vs multi-threaded?), persistence (in-memory vs DB?), out-of-scope features.',
            '**5–15m Core Entities & API Signatures**: Sketch clean classes, enums, interfaces, and relationships on the whiteboard.',
            '**15–35m Working Extensible Code**: Apply Strategy/State/Factory cleanly; implement happy path + edge cases + thread-safety (`ReentrantLock` / `synchronized` / `AtomicReference`). **35–45m Walkthrough & Extensions**: Dry-run 2 flows and show how a new requirement plugs in with zero edits to existing code!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Don’t write boilerplate getters/setters for 15 minutes! Focus on **interfaces, core algorithms, concurrency safety, and extensibility** — interviewers love Java `record` / TypeScript types / Python `@dataclass` for clean concise DTOs.',
          },
          scene: {
            hud: [
              { label: '0–5 MIN', value: 'Clarify Scope', status: 'info' },
              { label: '5–15 MIN', value: 'Entities + UML', status: 'info' },
              { label: '15–35 MIN', value: 'Clean Thread-Safe Code', status: 'good' },
              { label: '35–45 MIN', value: 'Dry-Run + Extend', status: 'good' },
            ],
            nodes: [
              { id: 's1', type: 'hex', x: 120, y: 215, label: '1. Clarify', sublabel: '0–5m · Locks?', tone: 'amber' },
              { id: 's2', type: 'hex', x: 300, y: 215, label: '2. Models', sublabel: '5–15m · UML', tone: 'blue' },
              { id: 's3', type: 'hex', x: 485, y: 215, label: '3. Patterns', sublabel: '15–35m · Code', tone: 'green' },
              { id: 's4', type: 'hex', x: 660, y: 215, label: '4. Prove', sublabel: '35–45m · Edge Cases', tone: 'purple' },
            ],
            edges: [
              { from: 's1', to: 's2', label: 'nouns', packetColor: 'blue', speed: 1.9 },
              { from: 's2', to: 's3', label: 'interfaces', packetColor: 'green', speed: 1.9 },
              { from: 's3', to: 's4', label: 'dry-run', packetColor: 'purple', speed: 1.9 },
            ],
            legend: [{ label: 'winning LLD cadence', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'lld-solid',
      title: 'SOLID Principles + Clean Code',
      subtitle: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — with Bad vs Good refactors.',
      duration: '10 min',
      level: 'Beginner',
      companies: ['Microsoft', 'Amazon', 'Google', 'Atlassian'],
      tags: ['solid', 'srp', 'ocp', 'lsp', 'isp', 'dip', 'dry', 'kiss', 'yagni', 'clean code'],
      widget: 'solid-comparator',
      objectives: [
        'Spot SRP, OCP, LSP, ISP, and DIP violations immediately in code reviews',
        'Refactor brittle if/else chains into OCP-compliant Strategy/Polymorphic interfaces',
        'Apply Dependency Inversion (Constructor Injection) for clean testable architecture',
      ],
      steps: [
        {
          shortLabel: 'Why SOLID?',
          stage: 'PROBLEM',
          title: 'God Classes + Hardwired Dependencies rot every codebase',
          body: [
            'When a single `OrderManager` class validates coupons, runs raw SQL, charges Stripe, sends emails, AND contains 8 `if (tier == ...)` branches, changing email templates risks breaking payment math — and unit testing requires spinning up a live MySQL database!',
            'Explore all 5 **SOLID Bad vs Good Code Refactors** interactively in the **SOLID Code Lab** right below this stage!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Balance SOLID with **YAGNI (You Aren’t Gonna Need It)** and **KISS**: don’t create 5 layers of `AbstractFactoryProviderImpl` for a class that will never have a second implementation!',
          },
          scene: {
            hud: [
              { label: 'S · SRP', value: '1 Reason to Change', status: 'good' },
              { label: 'O · OCP', value: 'Extend, Don’t Edit', status: 'good' },
              { label: 'L · LSP', value: 'Safe Subtypes', status: 'info' },
              { label: 'I & D', value: 'Lean + Injected Deps', status: 'good' },
            ],
            nodes: [
              {
                id: 'bad',
                type: 'uml',
                x: 190,
                y: 215,
                label: 'GodOrderManager ✕',
                sublabel: 'Violates S, O, D',
                tone: 'coral',
                umlFields: ['- mySqlConn', '- stripeSdk'],
                umlMethods: ['+ calcIfElse()', '+ saveSql()', '+ sendSmtp()'],
              },
              {
                id: 'svc',
                type: 'uml',
                x: 550,
                y: 120,
                label: 'OrderService ✓',
                sublabel: 'DIP Constructor DI',
                tone: 'green',
                umlFields: ['- repo: OrderRepo', '- policy: Discount'],
                umlMethods: ['+ checkout(Order)'],
              },
              {
                id: 'ports',
                type: 'uml',
                x: 550,
                y: 310,
                label: '«ports» Interfaces',
                sublabel: 'ISP Lean Contracts',
                tone: 'purple',
                umlFields: ['OrderRepo · Notifier'],
                umlMethods: ['+ save()', '+ notify()'],
              },
            ],
            edges: [
              { from: 'bad', to: 'svc', label: 'SOLID refactor →', packetColor: 'green', speed: 1.9 },
              { from: 'svc', to: 'ports', label: 'depends on abstractions', packetColor: 'purple', speed: 1.9 },
            ],
            legend: [{ label: 'decoupled clean architecture', tone: 'green' }],
          },
        },
        {
          shortLabel: 'DIP & Hexagonal',
          stage: 'SOLUTION',
          title: 'Dependency Inversion unlocks Hexagonal Architecture & 10ms Unit Tests',
          body: [
            'By pointing dependencies **inward toward interfaces** (`OrderService → PaymentGateway ← StripeAdapter`), your core business logic has **ZERO dependency** on AWS, Azure, Stripe, or PostgreSQL.',
            'In interviews, passing interfaces through the constructor lets you swap `InMemoryRepo` during machine coding and prove PostgreSQL/Redis drops straight in for production!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In machine coding rounds (Uber, Flipkart, Amazon, Microsoft), always build clean in-memory repositories behind a `Repository` interface — it proves DIP without wasting time on SQL boilerplate!',
          },
          scene: {
            hud: [
              { label: 'DOMAIN CORE', value: 'Zero Framework Deps', status: 'good' },
              { label: 'UNIT TESTS', value: 'Mockable in 5 ms', status: 'good' },
              { label: 'SWAPPABLE', value: 'InMemory ↔ Postgres', status: 'good' },
              { label: 'ARCHITECTURE', value: 'Ports & Adapters', status: 'info' },
            ],
            nodes: [
              { id: 'core', type: 'hex', x: 380, y: 215, label: 'Domain Core', sublabel: 'Pure Business Rules', tone: 'green', badge: 'DIP protected', badgeTone: 'green' },
              { id: 'in', type: 'hex', x: 135, y: 215, label: 'REST / CLI', sublabel: 'Driving Adapter', tone: 'blue' },
              { id: 'pg', type: 'db', x: 635, y: 120, label: 'Postgres Repo', sublabel: 'Prod Adapter', tone: 'purple' },
              { id: 'mem', type: 'cache', x: 635, y: 310, label: 'InMemory Repo', sublabel: 'Unit Test Adapter', tone: 'amber' },
            ],
            edges: [
              { from: 'in', to: 'core', label: 'calls port', packetColor: 'blue', speed: 1.7 },
              { from: 'core', to: 'pg', label: 'implements port', packetColor: 'purple', speed: 1.8 },
              { from: 'core', to: 'mem', label: 'test double', packetColor: 'amber', dashed: true, speed: 2.0 },
            ],
            legend: [{ label: 'hexagonal port boundary', tone: 'purple' }],
          },
        },
      ],
    },

    {
      id: 'lld-gof-patterns',
      title: 'All 23 GoF Design Patterns',
      subtitle: 'Every Creational (5), Structural (7), and Behavioral (11) pattern — searchable explorer with real-world uses, pitfalls & clean code.',
      duration: '15 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Amazon', 'Google', 'Meta'],
      tags: ['design patterns', 'gof', 'strategy', 'factory', 'observer', 'state', 'decorator', 'command', 'singleton', 'builder', 'proxy'],
      widget: 'gof-explorer',
      objectives: [
        'Recognize the Top 8 high-frequency interview patterns immediately (Strategy, Factory, Observer, State, Decorator, Builder, Command, Chain)',
        'Understand ALL 23 Gang of Four patterns across Creational, Structural, and Behavioral families',
        'Avoid over-engineering by knowing each pattern’s exact anti-pattern trade-off',
      ],
      steps: [
        {
          shortLabel: '3 Families',
          stage: 'SETUP',
          title: 'How the 23 GoF Patterns divide into 3 clean mental buckets',
          body: [
            '1. **Creational (5)** — *How objects are born*: Singleton, Factory Method, Abstract Factory, Builder, Prototype.',
            '2. **Structural (7)** — *How classes compose cleanly*: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.',
            '3. **Behavioral (11)** — *How objects collaborate & vary algorithms*: Strategy, Observer, State, Command, Chain of Responsibility, Template Method, Iterator, Mediator, Memento, Visitor, Interpreter.',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Browse, filter, and inspect clean code for ALL 23 patterns in the **Interactive 23 Design Patterns Explorer** directly below this canvas!',
          },
          scene: {
            hud: [
              { label: 'CREATIONAL', value: '5 Patterns', status: 'info' },
              { label: 'STRUCTURAL', value: '7 Patterns', status: 'info' },
              { label: 'BEHAVIORAL', value: '11 Patterns', status: 'good' },
              { label: 'TOTAL GOF', value: '23 / 23 Covered ✓', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'hex', x: 155, y: 215, label: 'Creational (5)', sublabel: 'Factory · Builder', tone: 'blue' },
              { id: 's', type: 'hex', x: 380, y: 215, label: 'Structural (7)', sublabel: 'Adapter · Decorator', tone: 'purple' },
              { id: 'b', type: 'hex', x: 605, y: 215, label: 'Behavioral (11)', sublabel: 'Strategy · State · Obs', tone: 'green', badge: 'top interview ROI', badgeTone: 'green' },
            ],
            edges: [
              { from: 'c', to: 's', label: 'build → compose', packetColor: 'purple', speed: 2.0 },
              { from: 's', to: 'b', label: 'compose → behave', packetColor: 'green', speed: 2.0 },
            ],
            legend: [{ label: 'GoF taxonomy', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Top 8 ROI',
          stage: 'TECHNIQUE',
          title: 'The Power-8 Patterns that solve 95% of Big Tech LLD Interviews',
          body: [
            '**Strategy** (swappable pricing/dispatch/eviction) · **State** (Vending Machine/Order/Elevator) · **Observer** (notifications/displays) · **Factory / Abstract Factory** (creation) · **Decorator** (middleware/cache/logging wrappers) · **Command** (Chess/Editor Undo-Redo) · **Chain of Responsibility** (Logger levels / ATM cash) · **Facade** (top-level System API).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Never force a pattern just to name-drop it! Always state *which changing requirement* justifies the pattern: "Because pricing rules will evolve (Weekend, EV, Surge), I’ll inject a `PricingStrategy`."',
          },
          scene: {
            hud: [
              { label: '#1 MOST ASKED', value: 'Strategy', status: 'good' },
              { label: 'LIFECYCLES', value: 'State Machine', status: 'good' },
              { label: 'UNDO / REDO', value: 'Command', status: 'info' },
              { label: 'PIPELINES', value: 'Chain + Decorator', status: 'info' },
            ],
            nodes: [
              { id: 'st', type: 'uml', x: 185, y: 130, label: 'Strategy', tone: 'green', umlFields: ['Parking · Cache'], umlMethods: ['+ execute()'] },
              { id: 'sm', type: 'uml', x: 565, y: 130, label: 'State', tone: 'purple', umlFields: ['Vending · Order'], umlMethods: ['+ transition()'] },
              { id: 'ob', type: 'uml', x: 185, y: 300, label: 'Observer', tone: 'blue', umlFields: ['Alerts · Displays'], umlMethods: ['+ onEvent()'] },
              { id: 'cm', type: 'uml', x: 565, y: 300, label: 'Command', tone: 'amber', umlFields: ['Chess · Editor'], umlMethods: ['+ do() / undo()'] },
            ],
            edges: [
              { from: 'st', to: 'sm', label: 'vary algo vs state', packetColor: 'green', dashed: true, speed: 2.3 },
              { from: 'ob', to: 'cm', label: 'events + history', packetColor: 'blue', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'high-frequency LLD patterns', tone: 'green' }],
          },
        },
      ],
    },

    {
      id: 'lld-concurrency',
      title: 'Concurrency & Thread-Safety in LLD',
      subtitle: 'Race conditions, AB-BA Deadlocks & Lock Ordering, ReentrantLock, ReadWriteLock, Condition, CAS Atomics & Striped Locks.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Microsoft', 'Amazon', 'Google', 'Bloomberg'],
      tags: ['concurrency', 'multithreading', 'deadlock', 'mutex', 'readwritelock', 'cas', 'atomic', 'semaphore', 'thread pool'],
      objectives: [
        'Spot check-then-act race conditions in Parking Lots, Caches, and Ticket Booking',
        'Prevent AB-BA Deadlocks using strict Global Lock Ordering (e.g., lock lower `accountId` first)',
        'Scale concurrent throughput using ReadWriteLock, Lock Striping (ConcurrentHashMap), and Atomic CAS',
      ],
      steps: [
        {
          shortLabel: 'AB-BA Deadlock',
          stage: 'PROBLEM',
          title: 'Two bank transfers lock Account A & B in opposite order → Deadlock!',
          body: [
            'Thread 1 transfers `A → B` (locks `A`, waits for `B`). Simultaneously, Thread 2 transfers `B → A` (locks `B`, waits for `A`). All **4 Coffman Conditions** hold (Mutual Exclusion, Hold-and-Wait, No Preemption, **Circular Wait**) — both threads freeze forever!',
            '**Instant Fix — Global Lock Ordering**: Always lock `min(acc1.id, acc2.id)` first, then `max(acc1.id, acc2.id)`! Breaking Circular Wait makes AB-BA deadlock **mathematically impossible**!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In banking/wallet/Splitwise/Seat-Lock LLD rounds, proactively writing `first = id1 < id2 ? a : b; second = id1 < id2 ? b : a;` before the interviewer even asks about deadlocks is a massive Strong Hire signal!',
          },
          scene: {
            hud: [
              { label: 'DEADLOCK CAUSE', value: 'Circular Wait', status: 'bad' },
              { label: 'PROVEN FIX', value: 'Lock min(id) First', status: 'good' },
              { label: 'READ-HEAVY', value: 'ReadWriteLock', status: 'good' },
              { label: 'LOCK-FREE', value: 'Atomic CAS', status: 'good' },
            ],
            nodes: [
              { id: 't1', type: 'hex', x: 145, y: 130, label: 'Thread 1', sublabel: 'Transfer A → B', tone: 'green', badge: '1st: A, 2nd: B', badgeTone: 'green' },
              { id: 't2', type: 'hex', x: 145, y: 300, label: 'Thread 2', sublabel: 'Transfer B → A', tone: 'blue', badge: '1st: A, 2nd: B', badgeTone: 'green' },
              { id: 'la', type: 'cache', x: 470, y: 130, label: 'Lock(Account A)', sublabel: 'id = 101 (First)', tone: 'purple' },
              { id: 'lb', type: 'cache', x: 470, y: 300, label: 'Lock(Account B)', sublabel: 'id = 205 (Second)', tone: 'amber' },
            ],
            edges: [
              { from: 't1', to: 'la', label: '1. lock 101', packetColor: 'green', speed: 1.6 },
              { from: 'la', to: 'lb', label: '2. lock 205', packetColor: 'green', speed: 1.8 },
              { from: 't2', to: 'la', label: 'waits cleanly for 101', packetColor: 'blue', dashed: true, speed: 2.4 },
            ],
            legend: [
              { label: 'ordered lock acquisition (deadlock-free)', tone: 'green' },
            ],
          },
        },
        {
          shortLabel: 'Striped & CAS',
          stage: 'SOLUTION',
          title: 'Scaling past a Global Mutex: ReadWriteLock, Lock Striping & Atomic CAS',
          body: [
            'Putting `synchronized` on `ParkingLot.park()` or `Cache.get()` serializes 64 CPU cores down to 1 single lane! Scale cleanly in 3 tiers:',
            '1) **`ReadWriteLock`** lets 100 concurrent readers share access while excluding writers. 2) **Fine-Grained / Striped Locking** locks only `spot #42` or `bucket hash(k) % 64` (like Java `ConcurrentHashMap`). 3) **Lock-Free CAS (`AtomicInteger.compareAndSet`)** eliminates OS mutex context switches for counters and token buckets!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Never use `while (!ready) {}` busy-wait spinning in Task Schedulers or Producer-Consumer queues — it burns 100% CPU! Always park sleeping threads cleanly on a **`Condition` variable (`await()` / `signal()`)**.',
          },
          scene: {
            hud: [
              { label: 'GLOBAL LOCK', value: '1 Core Active', status: 'bad' },
              { label: 'STRIPED / PER-KEY', value: '64× Concurrency', status: 'good' },
              { label: 'WAIT STRATEGY', value: 'Condition.await()', status: 'good' },
              { label: 'COUNTERS', value: 'Atomic CAS', status: 'good' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 105, y: 215, label: '64 Threads', sublabel: 'Parallel Ops', tone: 'slate' },
              { id: 'b0', type: 'cache', x: 400, y: 100, label: 'Lock Stripe 0', sublabel: 'Seat A1..A5', tone: 'green' },
              { id: 'b1', type: 'cache', x: 400, y: 215, label: 'Lock Stripe 1', sublabel: 'Seat B1..B5', tone: 'blue' },
              { id: 'b2', type: 'cache', x: 400, y: 330, label: 'Atomic CAS', sublabel: 'Token Counter', tone: 'purple', badge: 'lock-free', badgeTone: 'purple' },
            ],
            edges: [
              { from: 'c', to: 'b0', label: 'parallel', packetColor: 'green', speed: 1.5 },
              { from: 'c', to: 'b1', label: 'parallel', packetColor: 'blue', speed: 1.5 },
              { from: 'c', to: 'b2', label: 'CAS loop', packetColor: 'purple', speed: 1.4 },
            ],
            legend: [{ label: 'high-concurrency fine-grained locks', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Deadlock-Free Transfer & Striped Concurrency Pattern',
        codeSnippets: {
          java: `// Deadlock-free bank transfer via strict global lock ordering
public void transfer(Account from, Account to, long cents) {
    if (from.getId().equals(to.getId())) throw new IllegalArgumentException("Same account");
    Account first  = from.getId().compareTo(to.getId()) < 0 ? from : to;
    Account second = first == from ? to : from;

    first.lock().lock();
    try {
        second.lock().lock();
        try {
            from.debit(cents);
            to.credit(cents);
        } finally {
            second.lock().unlock();
        }
    } finally {
        first.lock().unlock();
    }
}`,
          cpp: `// C++17 std::scoped_lock prevents AB-BA deadlock atomically
void transfer(Account& from, Account& to, int64_t cents) {
    if (&from == &to) throw std::invalid_argument("Same account");
    std::scoped_lock guard(from.mtx, to.mtx); // Deadlock-avoidance algorithm built-in!
    from.debit(cents);
    to.credit(cents);
}`,
          python: `def transfer(acc_from: Account, acc_to: Account, cents: int) -> None:
    first, second = (acc_from, acc_to) if acc_from.id < acc_to.id else (acc_to, acc_from)
    with first.lock:
        with second.lock:
            acc_from.debit(cents)
            acc_to.credit(cents)`,
        },
      },
    },
  ],
};
