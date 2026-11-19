// Module 12: 10 Flagship Machine Coding & LLD Systems (Java / C++ / Python / TypeScript production references)

export const MODULE_12_LLD_SYSTEMS = {
  id: 'mod-12-lld-systems',
  number: '12',
  title: 'LLD Machine Coding (15)',
  track: 'lld',
  lessons: [
    {
      id: 'lld-parking-lot',
      title: 'LLD: Parking Lot System',
      subtitle: 'Multi-floor spot allocation (Strategy), dynamic pricing, Factory vehicle creation, and thread-safe entry gates.',
      duration: '12 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Uber', 'Google'],
      tags: ['parking lot', 'strategy', 'factory', 'facade', 'concurrency', 'machine coding'],
      objectives: [
        'Model ParkingLot ◆ ParkingFloor ◆ ParkingSpot cleanly with VehicleSize enums',
        'Plug in swappable SpotAllocationStrategy (Nearest Entrance / Best-Fit) & PricingStrategy',
        'Prevent two entrance gates assigning the exact same spot via atomic/synchronized booking',
      ],
      steps: [
        {
          shortLabel: 'Entities & UML',
          stage: 'SETUP',
          title: 'Core Domain Model + Extensibility Interfaces',
          body: [
            '**Requirements**: Multi-level garage with `COMPACT`, `LARGE`, `MOTORCYCLE`, and `EV_CHARGING` spots; multiple concurrent Entry/Exit gates; pluggable spot assignment (Nearest Gate) and pricing (Hourly / Weekend / EV KWh).',
            '**Design Patterns**: **Facade** (`ParkingLotSystem`), **Strategy** (`SpotAllocationStrategy` & `PricingStrategy`), **Factory** (`VehicleFactory`), and **Observer** (Display Board updates free counts per floor).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Use a **Min-Heap (`PriorityQueue`) per entrance gate** sorted by walking distance so `allocateNearestSpot()` runs in **O(log S)** instead of linearly scanning all 5,000 spots!',
          },
          scene: {
            hud: [
              { label: 'PATTERNS', value: 'Strategy · Facade · Obs', status: 'good' },
              { label: 'ALLOCATION', value: 'O(log S) Min-Heap', status: 'good' },
              { label: 'CONCURRENCY', value: 'Atomic Spot Claim', status: 'good' },
              { label: 'EXTENSIBLE', value: 'EV · Valet · Surge', status: 'info' },
            ],
            nodes: [
              {
                id: 'lot',
                type: 'uml',
                x: 165,
                y: 215,
                label: 'ParkingLotSystem',
                sublabel: '«Facade»',
                tone: 'blue',
                umlFields: ['- alloc: AllocationStrategy', '- price: PricingStrategy'],
                umlMethods: ['+ park(Vehicle, gateId)', '+ unpark(ticketId)'],
              },
              {
                id: 'alloc',
                type: 'uml',
                x: 540,
                y: 115,
                label: '«interface» SpotAllocator',
                tone: 'green',
                umlFields: ['NearestGate | BestFit'],
                umlMethods: ['+ claimSpot(Vehicle): Spot'],
              },
              {
                id: 'spot',
                type: 'uml',
                x: 540,
                y: 315,
                label: 'ParkingSpot',
                sublabel: 'Thread-Safe CAS',
                tone: 'purple',
                umlFields: ['- occupied: AtomicBool', '- type: SpotType'],
                umlMethods: ['+ tryOccupy(v): bool', '+ release()'],
              },
            ],
            edges: [
              { from: 'lot', to: 'alloc', label: 'find + claim', packetColor: 'green', speed: 1.8 },
              { from: 'alloc', to: 'spot', label: 'CAS false→true', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [
              { label: 'strategy delegation', tone: 'green' },
              { label: 'atomic CAS claim', tone: 'purple' },
            ],
          },
        },
        {
          shortLabel: 'Concurrency',
          stage: 'TECHNIQUE',
          title: 'Multi-Gate Race Condition Prevention with `AtomicBoolean.compareAndSet`',
          body: [
            'Two cars enter Gate 1 and Gate 2 at the exact same millisecond. Both see `Spot F1-A4` free! If `spot.tryOccupy()` uses **`AtomicBoolean.compareAndSet(false, true)`** (or a per-spot `ReentrantLock`), **exactly ONE gate succeeds** and the loser transparently pops the next free spot from the heap — zero global garage lock needed!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Inspect clean production code in **Java, C++, Python, and TypeScript** in the **Staff-Level Deep Engineering Vault** below!',
          },
          scene: {
            hud: [
              { label: 'GATE 1 & 2', value: 'Concurrent Entry', status: 'info' },
              { label: 'SPOT CLAIM', value: 'Lock-Free CAS', status: 'good' },
              { label: 'DOUBLE PARK', value: 'Impossible ✓', status: 'good' },
              { label: 'EXIT PAYMENT', value: 'Strategy + Receipt', status: 'good' },
            ],
            nodes: [
              { id: 'g1', type: 'hex', x: 135, y: 125, label: 'Gate 1', sublabel: 'Car A', tone: 'green' },
              { id: 'g2', type: 'hex', x: 135, y: 305, label: 'Gate 2', sublabel: 'Car B', tone: 'amber' },
              { id: 's1', type: 'cache', x: 455, y: 125, label: 'Spot F1-A4', sublabel: 'CAS → Car A ✓', tone: 'green', badge: 'won CAS', badgeTone: 'green' },
              { id: 's2', type: 'cache', x: 455, y: 305, label: 'Spot F1-A5', sublabel: 'Car B fallback ✓', tone: 'blue' },
            ],
            edges: [
              { from: 'g1', to: 's1', label: 'CAS true ✓', packetColor: 'green', speed: 1.6 },
              { from: 'g2', to: 's1', label: 'CAS false', packetColor: 'coral', dashed: true, speed: 2.1 },
              { from: 'g2', to: 's2', label: 'next spot ✓', packetColor: 'blue', speed: 1.8 },
            ],
            legend: [{ label: 'lock-free atomic spot booking', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Parking Lot System — Thread-Safe Multi-Language Reference',
        codeSnippets: {
          java: `enum VehicleType { MOTORCYCLE, CAR, TRUCK }
enum SpotType { SMALL, MEDIUM, LARGE }

class ParkingSpot {
    final String id; final SpotType type;
    private final AtomicBoolean occupied = new AtomicBoolean(false);
    ParkingSpot(String id, SpotType type) { this.id = id; this.type = type; }
    boolean tryOccupy() { return occupied.compareAndSet(false, true); }
    void release() { occupied.set(false); }
}

interface PricingStrategy { long calculateCents(Instant entry, Instant exit, VehicleType t); }

class HourlyPricing implements PricingStrategy {
    public long calculateCents(Instant in, Instant out, VehicleType t) {
        long hrs = Math.max(1, Duration.between(in, out).toHours() + 1);
        long rate = (t == VehicleType.TRUCK) ? 800 : (t == VehicleType.CAR ? 500 : 200);
        return hrs * rate;
    }
}

class ParkingLot {
    private final List<ParkingSpot> spots;
    private final Map<String, Ticket> activeTickets = new ConcurrentHashMap<>();
    private final PricingStrategy pricing;

    ParkingLot(List<ParkingSpot> spots, PricingStrategy pricing) {
        this.spots = spots; this.pricing = pricing;
    }

    public Ticket park(String plate, VehicleType type) {
        for (ParkingSpot s : spots) {
            if (fits(type, s.type) && s.tryOccupy()) {
                Ticket t = new Ticket(UUID.randomUUID().toString(), plate, type, s, Instant.now());
                activeTickets.put(t.id(), t);
                return t;
            }
        }
        throw new IllegalStateException("Garage full for " + type);
    }

    public long unpark(String ticketId) {
        Ticket t = activeTickets.remove(ticketId);
        if (t == null) throw new IllegalArgumentException("Invalid ticket");
        t.spot().release();
        return pricing.calculateCents(t.entryTime(), Instant.now(), t.vehicleType());
    }
}`,
          cpp: `enum class SpotType { Small, Medium, Large };
class ParkingSpot {
    std::string id_; SpotType type_; std::atomic<bool> occupied_{false};
public:
    ParkingSpot(std::string id, SpotType t) : id_(std::move(id)), type_(t) {}
    bool tryOccupy() {
        bool expected = false;
        return occupied_.compare_exchange_strong(expected, true);
    }
    void release() { occupied_.store(false, std::memory_order_release); }
    SpotType type() const { return type_; }
};

struct PricingStrategy {
    virtual ~PricingStrategy() = default;
    virtual int64_t calculateCents(int64_t minutes) const = 0;
};`,
          python: `from dataclasses import dataclass
from threading import Lock
import time, uuid

class ParkingSpot:
    def __init__(self, spot_id: str, size: str):
        self.spot_id, self.size = spot_id, size
        self._lock = Lock()
        self._occupied = False

    def try_occupy(self) -> bool:
        with self._lock:
            if self._occupied: return False
            self._occupied = True
            return True

    def release(self) -> None:
        with self._lock:
            self._occupied = False`,
          typescript: `type SpotSize = 'SMALL' | 'MEDIUM' | 'LARGE';
interface PricingStrategy { calculateCents(mins: number): number; }

class ParkingSpot {
  private occupied = false;
  constructor(public readonly id: string, public readonly size: SpotSize) {}
  tryOccupy(): boolean {
    if (this.occupied) return false;
    this.occupied = true;
    return true;
  }
  release(): void { this.occupied = false; }
}`,
        },
        failureModes: [
          {
            title: 'Payment Succeeds at Exit Gate, Power Fails Before Gate Opens',
            mitigation: 'Mark ticket `PAID` durably with an idempotency key; allow re-scanning the paid QR within a 15-minute exit grace window without charging twice.',
            interviewProbe: 'How do you extend this design to support reserving a spot online 2 hours in advance?',
          },
        ],
      },
    },

    {
      id: 'lld-elevator',
      title: 'LLD: Elevator System (LOOK Dispatcher)',
      subtitle: 'Multi-elevator scheduling (SCAN/LOOK Strategy), State machine, Min/Max heaps for stops, and Observer floor displays.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Amazon', 'Google', 'Flipkart'],
      tags: ['elevator', 'look algorithm', 'scan', 'state pattern', 'strategy', 'observer'],
      objectives: [
        'Use a Min-Heap (upStops) and Max-Heap (downStops) inside each ElevatorCar for LOOK scheduling',
        'Plug in swappable DispatchStrategy (Nearest Same-Direction, Least-Load, Odd/Even Zones)',
        'Decouple floor display panels using the Observer pattern',
      ],
      steps: [
        {
          shortLabel: 'LOOK Heaps',
          stage: 'SOLUTION',
          title: 'LOOK Algorithm: Min-Heap going UP, Max-Heap going DOWN',
          body: [
            'FCFS (First-Come First-Served) bounces the elevator wildly between Floor 1 and Floor 40! The **LOOK algorithm** (smart SCAN) services all requests ahead in the current direction using a **Min-Heap (`upStops`)** while ascending, then reverses immediately at the highest requested floor (not necessarily floor 40!) and drains a **Max-Heap (`downStops`)**.',
            'Our **ElevatorDispatcher** picks the optimal elevator among `K` cars: prefer an idle car or a car already moving toward the caller’s floor in the same direction!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Watch the LOOK Scheduler dispatch 3 live elevators in real time inside **Design Lab → LLD Concurrency & Elevator Lab**!',
          },
          scene: {
            hud: [
              { label: 'SCHEDULER', value: 'LOOK (Min/Max Heap)', status: 'good' },
              { label: 'DISPATCH', value: 'Strategy Pluggable', status: 'good' },
              { label: 'DISPLAYS', value: 'Observer Broadcast', status: 'info' },
              { label: 'SAFETY', value: 'Weight & Emergency', status: 'good' },
            ],
            nodes: [
              { id: 'disp', type: 'uml', x: 165, y: 215, label: 'ElevatorController', sublabel: '«Dispatcher»', tone: 'blue', umlFields: ['- cars: List<Car>', '- strategy: Dispatch'], umlMethods: ['+ hallCall(fl, dir)', '+ stepAll()'] },
              { id: 'car', type: 'uml', x: 545, y: 120, label: 'ElevatorCar', sublabel: 'LOOK Dual-Heap', tone: 'green', umlFields: ['- upQ: MinHeap', '- downQ: MaxHeap'], umlMethods: ['+ addStop(floor)', '+ moveStep()'] },
              { id: 'obs', type: 'uml', x: 545, y: 315, label: '«interface» DisplayObs', tone: 'purple', umlFields: ['Lobby · Floor Panels'], umlMethods: ['+ onFloorChange(fl, dir)'] },
            ],
            edges: [
              { from: 'disp', to: 'car', label: 'assign floor', packetColor: 'green', speed: 1.7 },
              { from: 'car', to: 'obs', label: 'notify floor', packetColor: 'purple', speed: 1.9 },
            ],
            legend: [{ label: 'LOOK dispatch + observer', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Edge Cases',
          stage: 'TECHNIQUE',
          title: 'Handling Peak Rush Hour, Overweight & Maintenance States',
          body: [
            'Model `ElevatorState` (`IDLE`, `MOVING_UP`, `MOVING_DOWN`, `MAINTENANCE`, `OVERWEIGHT`) so out-of-service cars are skipped automatically by the dispatcher. In skyscrapers (100 floors), swap `DispatchStrategy` to **Zone / Destination Dispatch** (group passengers by floor clusters before boarding!).',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning **Destination Control Panels** (passengers enter target floor in the lobby so the controller groups everyone heading to floors 30–35 into Car #2) wows Microsoft/Amazon interviewers!',
          },
          scene: {
            hud: [
              { label: 'CAR #1', value: 'Floors 1–20', status: 'good' },
              { label: 'CAR #2', value: 'Floors 21–40', status: 'good' },
              { label: 'CAR #3', value: 'MAINTENANCE', status: 'warn' },
              { label: 'WAIT TIME', value: '-38% Rush Hour', status: 'good' },
            ],
            nodes: [
              { id: 'hall', type: 'users', x: 110, y: 215, label: 'Lobby Call', sublabel: 'Floor 1 → 32', tone: 'slate' },
              { id: 'c1', type: 'hex', x: 455, y: 115, label: 'Car 1', sublabel: 'At Fl 14 (UP)', tone: 'blue' },
              { id: 'c2', type: 'hex', x: 455, y: 215, label: 'Car 2', sublabel: 'At Fl 2 (IDLE)', tone: 'green', badge: 'selected ✓', badgeTone: 'green' },
              { id: 'c3', type: 'hex', x: 455, y: 325, label: 'Car 3', sublabel: 'Maintenance', tone: 'coral', dim: true },
            ],
            edges: [
              { from: 'hall', to: 'c2', label: 'optimal cost=1', packetColor: 'green', speed: 1.6 },
            ],
            legend: [{ label: 'minimum-cost car selection', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Elevator LOOK Controller — Clean Reference',
        codeSnippets: {
          java: `enum Direction { UP, DOWN, IDLE }

class ElevatorCar {
    final int id; int currentFloor = 0; Direction dir = Direction.IDLE;
    private final TreeSet<Integer> upStops = new TreeSet<>();
    private final TreeSet<Integer> downStops = new TreeSet<>(Collections.reverseOrder());

    synchronized void addStop(int floor) {
        if (floor >= currentFloor) upStops.add(floor);
        else downStops.add(floor);
        if (dir == Direction.IDLE) dir = floor >= currentFloor ? Direction.UP : Direction.DOWN;
    }

    synchronized void step() {
        if (dir == Direction.UP) {
            if (!upStops.isEmpty()) { currentFloor = upStops.pollFirst(); }
            else if (!downStops.isEmpty()) { dir = Direction.DOWN; }
            else { dir = Direction.IDLE; }
        } else if (dir == Direction.DOWN) {
            if (!downStops.isEmpty()) { currentFloor = downStops.pollFirst(); }
            else if (!upStops.isEmpty()) { dir = Direction.UP; }
            else { dir = Direction.IDLE; }
        }
    }
}`,
          python: `import heapq

class ElevatorCar:
    def __init__(self, car_id: int):
        self.id = car_id
        self.floor = 0
        self.direction = "IDLE"
        self.up_stops: set[int] = set()
        self.down_stops: set[int] = set()

    def add_stop(self, target: int) -> None:
        (self.up_stops if target >= self.floor else self.down_stops).add(target)
        if self.direction == "IDLE":
            self.direction = "UP" if target >= self.floor else "DOWN"

    def step(self) -> None:
        if self.direction == "UP":
            if self.up_stops: self.floor = min(self.up_stops); self.up_stops.remove(self.floor)
            else: self.direction = "DOWN" if self.down_stops else "IDLE"
        elif self.direction == "DOWN":
            if self.down_stops: self.floor = max(self.down_stops); self.down_stops.remove(self.floor)
            else: self.direction = "UP" if self.up_stops else "IDLE"`,
        },
      },
    },

    {
      id: 'lld-bookmyshow',
      title: 'LLD: Movie Ticket Booking (BookMyShow)',
      subtitle: 'Per-seat TTL SeatLockManager, multi-seat atomic lock ordering (zero deadlock!), Booking State Machine & Payment Strategy.',
      duration: '12 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Microsoft', 'Flipkart', 'Uber'],
      tags: ['bookmyshow', 'seat lock', 'ttl', 'deadlock ordering', 'booking', 'concurrency'],
      objectives: [
        'Model Show ◆ ShowSeat separately from static CinemaSeat templates',
        'Lock multiple requested seats in sorted `seatId` order to prevent AB-BA deadlocks',
        'Expire temporary seat holds automatically if payment fails or times out',
      ],
      steps: [
        {
          shortLabel: 'Seat Lock TTL',
          stage: 'SOLUTION',
          title: 'Sorted Multi-Seat Locking + 10-Min TTL SeatLockManager',
          body: [
            'Critical race: Alice selects seats `[A1, A2]` while Bob selects `[A2, A1]`. Locking in caller order causes an **AB-BA deadlock**! **Fix**: Sort requested `seatIds` ascending (`[A1, A2]`) before acquiring locks, verify every seat is neither `BOOKED` nor actively `LOCKED` (non-expired TTL), and stamp `SeatLock(seatId, userId, expiresAt)`!',
            'Booking confirms ONLY if every requested seat still holds an unexpired lock owned by `userId`!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Distinguish **static `Seat`** (row/col in Auditorium) from **per-screening `ShowSeat`** (price + AVAILABLE/LOCKED/BOOKED for the 7 PM show)!',
          },
          scene: {
            hud: [
              { label: 'LOCK SCOPE', value: 'Per (Show, Seat)', status: 'good' },
              { label: 'DEADLOCK FIX', value: 'Sort Seat IDs', status: 'good' },
              { label: 'HOLD TTL', value: '10 Min Auto-Expire', status: 'info' },
              { label: 'DOUBLE BOOK', value: '0% Guaranteed', status: 'good' },
            ],
            nodes: [
              { id: 'bk', type: 'uml', x: 165, y: 215, label: 'BookingService', sublabel: '«Facade»', tone: 'blue', umlFields: ['- lockMgr: SeatLockMgr', '- pay: PaymentStrategy'], umlMethods: ['+ createBooking(seats)', '+ confirm(bookingId)'] },
              { id: 'lm', type: 'uml', x: 545, y: 120, label: 'SeatLockManager', sublabel: 'TTL + Lock Order', tone: 'green', umlFields: ['- locks: ConcurrentMap'], umlMethods: ['+ lockSeats(show, ids)', '+ validateOwner(u, ids)'] },
              { id: 'ss', type: 'uml', x: 545, y: 315, label: 'ShowSeat', tone: 'purple', umlFields: ['- status: SeatStatus', '- version: long'], umlMethods: ['+ markBooked()'] },
            ],
            edges: [
              { from: 'bk', to: 'lm', label: '1. sorted lock(10m)', packetColor: 'green', speed: 1.6 },
              { from: 'bk', to: 'ss', label: '2. confirm BOOKED', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'deadlock-free TTL seat lock', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Confirm Flow',
          stage: 'TECHNIQUE',
          title: 'Two-Phase Confirm: Hold → Charge → Verify Lock Ownership → Issue Ticket',
          body: [
            'Never trust client-side timers! On payment callback, `confirmBooking()` re-verifies `lockMgr.isLockedBy(showId, seatId, userId)` under lock before flipping `status = BOOKED`. If the lock expired mid-payment and another user took the seat, automatically refund!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Simulate 2 users clicking Seat A5 simultaneously (with Lock ON vs OFF) in **Design Lab → LLD Seat Lock Simulator**!',
          },
          scene: {
            hud: [
              { label: 'ALICE', value: 'Holds A5 (TTL 10m)', status: 'good' },
              { label: 'BOB', value: '409 Seat Locked', status: 'warn' },
              { label: 'PAYMENT OK', value: 'Status → BOOKED ✓', status: 'good' },
              { label: 'TIMEOUT', value: 'Auto-Released ✓', status: 'info' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 115, y: 130, label: 'Alice', sublabel: 'Clicks A5 @ t=0ms', tone: 'green' },
              { id: 'b', type: 'users', x: 115, y: 300, label: 'Bob', sublabel: 'Clicks A5 @ t=1ms', tone: 'coral' },
              { id: 'm', type: 'hex', x: 455, y: 215, label: 'SeatLockManager', sublabel: 'Owner: Alice (9:59)', tone: 'purple', badge: 'atomic', badgeTone: 'green' },
            ],
            edges: [
              { from: 'a', to: 'm', label: 'LOCKED ✓', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'b', to: 'm', label: '409 Conflict ✕', packetColor: 'coral', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'atomic seat reservation', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'BookMyShow SeatLockManager — Deadlock-Free TTL Lock',
        codeSnippets: {
          java: `record SeatLock(String seatId, String userId, Instant expiresAt) {
    boolean isExpired() { return Instant.now().isAfter(expiresAt); }
}

class InMemorySeatLockManager {
    private final ConcurrentHashMap<String, Object> seatMonitors = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SeatLock> locks = new ConcurrentHashMap<>();

    public void lockSeats(String showId, List<String> seatIds, String userId, Duration ttl) {
        List<String> sorted = seatIds.stream().distinct().sorted().toList(); // Prevents AB-BA deadlock!
        lockRecursive(showId, sorted, 0, userId, ttl);
    }

    private void lockRecursive(String showId, List<String> ids, int idx, String userId, Duration ttl) {
        if (idx == ids.size()) {
            Instant exp = Instant.now().plus(ttl);
            for (String s : ids) {
                SeatLock cur = locks.get(showId + ":" + s);
                if (cur != null && !cur.isExpired() && !cur.userId().equals(userId))
                    throw new IllegalStateException("Seat unavailable: " + s);
            }
            for (String s : ids) locks.put(showId + ":" + s, new SeatLock(s, userId, exp));
            return;
        }
        Object monitor = seatMonitors.computeIfAbsent(showId + ":" + ids.get(idx), k -> new Object());
        synchronized (monitor) { lockRecursive(showId, ids, idx + 1, userId, ttl); }
    }
}`,
          python: `from dataclasses import dataclass
from threading import Lock
import time

@dataclass
class SeatLock:
    user_id: str
    expires_at: float

class SeatLockManager:
    def __init__(self):
        self._global = Lock()
        self._locks: dict[tuple[str, str], SeatLock] = {}

    def lock_seats(self, show_id: str, seat_ids: list[str], user_id: str, ttl_sec: int = 600):
        now = time.time()
        with self._global:
            for sid in sorted(set(seat_ids)):
                cur = self._locks.get((show_id, sid))
                if cur and cur.expires_at > now and cur.user_id != user_id:
                    raise RuntimeError(f"Seat {sid} locked by another user")
            for sid in sorted(set(seat_ids)):
                self._locks[(show_id, sid)] = SeatLock(user_id, now + ttl_sec)`,
        },
      },
    },

    {
      id: 'lld-splitwise',
      title: 'LLD: Splitwise Expense Sharing',
      subtitle: 'Strategy for Equal / Exact / Percentage splits, integer cents precision, and Min-Heap Minimum Cash Flow graph simplification.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
      tags: ['splitwise', 'strategy', 'minimum cash flow', 'greedy heap', 'ledger', 'expense'],
      objectives: [
        'Validate Equal, Exact, and Percentage splits using pluggable SplitStrategy classes',
        'Avoid floating-point penny drift using integer cents + deterministic remainder distribution',
        'Simplify N×N group debts into at most N−1 transfers using a Greedy Dual-Heap algorithm',
      ],
      steps: [
        {
          shortLabel: 'Split Strategy',
          stage: 'SETUP',
          title: 'Extensible SplitStrategy + Exact Integer Cents Arithmetic',
          body: [
            'Splitting \$10.00 equally among 3 friends in `double` produces `3.33 + 3.33 + 3.33 = 9.99` (1 cent vanished!). Store **cents (`1000`)**, give `1000 / 3 = 333` to each, and distribute the `1000 % 3 = 1` remainder cent deterministically to the first `R` participants (`334, 333, 333`)!',
            'Encapsulate `EqualSplit`, `ExactSplit`, and `PercentSplit` behind `SplitStrategy` so adding `SharesSplit` later requires zero edits to `ExpenseService`.',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Always assert `sum(splits) == totalAmountCents` inside `SplitStrategy.validate()` before mutating any group balances!',
          },
          scene: {
            hud: [
              { label: 'PRECISION', value: 'Integer Cents ✓', status: 'good' },
              { label: 'SPLIT MODES', value: 'Strategy Pattern', status: 'good' },
              { label: 'SIMPLIFY', value: 'Dual Max-Heap', status: 'good' },
              { label: 'TRANSFERS', value: '≤ N − 1 Payments', status: 'good' },
            ],
            nodes: [
              { id: 'exp', type: 'uml', x: 165, y: 215, label: 'ExpenseService', tone: 'blue', umlFields: ['- ledger: BalanceSheet', '- strat: SplitStrategy'], umlMethods: ['+ addExpense(cmd)', '+ simplifyGroup(gid)'] },
              { id: 'st', type: 'uml', x: 545, y: 120, label: '«interface» SplitStrategy', tone: 'green', umlFields: ['Equal | Exact | Percent'], umlMethods: ['+ compute(amt, meta)'] },
              { id: 'simp', type: 'uml', x: 545, y: 315, label: 'DebtSimplifier', sublabel: 'O(N log N) Heaps', tone: 'purple', umlFields: ['- creditors: MaxHeap', '- debtors: MaxHeap'], umlMethods: ['+ minimizeTransfers()'] },
            ],
            edges: [
              { from: 'exp', to: 'st', label: 'validate cents', packetColor: 'green', speed: 1.7 },
              { from: 'exp', to: 'simp', label: 'net balances', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'exact cent split + debt graph', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Min Cash Flow',
          stage: 'TECHNIQUE',
          title: 'Debt Simplification: Match Largest Creditor with Largest Debtor',
          body: [
            '1) Compute each user’s **net balance** (`totalPaid - totalOwed`). Discard anyone with net `0`.',
            '2) Push positive nets into a **Creditor Max-Heap** and negative nets into a **Debtor Max-Heap**. Repeatedly pop the largest creditor `C` and largest debtor `D`, settle `min(C, D)`, and push any leftover remainder back! Guarantees at most **`N − 1` transactions** in `O(N log N)` time!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Note that finding the *absolute mathematical minimum* number of transfers (exact subset-sum zero partitions) is NP-Complete — the Greedy Max-Heap approach is O(N log N) and standard in production Splitwise!',
          },
          scene: {
            hud: [
              { label: 'BEFORE', value: 'A→B $10 · B→C $10', status: 'warn' },
              { label: 'NET BALANCES', value: 'A:-10 · B:0 · C:+10', status: 'info' },
              { label: 'SIMPLIFIED', value: 'A → C $10 (1 tx!)', status: 'good' },
              { label: 'COMPLEXITY', value: 'O(N log N)', status: 'good' },
            ],
            nodes: [
              { id: 'a', type: 'users', x: 140, y: 215, label: 'Alice (-$10)', sublabel: 'Debtor Heap', tone: 'coral' },
              { id: 'b', type: 'users', x: 390, y: 115, label: 'Bob ($0)', sublabel: 'Eliminated!', tone: 'slate', dim: true },
              { id: 'c', type: 'users', x: 640, y: 215, label: 'Carol (+$10)', sublabel: 'Creditor Heap', tone: 'green' },
            ],
            edges: [
              { from: 'a', to: 'c', label: '1 direct payment: $10', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'simplified direct settlement', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Splitwise Greedy Debt Simplifier (Java & Python)',
        codeSnippets: {
          java: `record Transfer(String from, String to, long cents) {}

public List<Transfer> simplifyDebts(Map<String, Long> netCents) {
    PriorityQueue<Map.Entry<String, Long>> pos = new PriorityQueue<>((a, b) -> Long.compare(b.getValue(), a.getValue()));
    PriorityQueue<Map.Entry<String, Long>> neg = new PriorityQueue<>((a, b) -> Long.compare(b.getValue(), a.getValue()));
    for (var e : netCents.entrySet()) {
        if (e.getValue() > 0) pos.add(Map.entry(e.getKey(), e.getValue()));
        else if (e.getValue() < 0) neg.add(Map.entry(e.getKey(), -e.getValue()));
    }
    List<Transfer> result = new ArrayList<>();
    while (!pos.isEmpty() && !neg.isEmpty()) {
        var c = pos.poll(); var d = neg.poll();
        long settled = Math.min(c.getValue(), d.getValue());
        result.add(new Transfer(d.getKey(), c.getKey(), settled));
        if (c.getValue() > settled) pos.add(Map.entry(c.getKey(), c.getValue() - settled));
        if (d.getValue() > settled) neg.add(Map.entry(d.getKey(), d.getValue() - settled));
    }
    return result;
}`,
          python: `import heapq

def simplify_debts(net_cents: dict[str, int]) -> list[tuple[str, str, int]]:
    pos = [(-v, u) for u, v in net_cents.items() if v > 0]
    neg = [(v, u) for u, v in net_cents.items() if v < 0]
    heapq.heapify(pos); heapq.heapify(neg)
    transfers = []
    while pos and neg:
        c_amt, c_user = heapq.heappop(pos); c_amt = -c_amt
        d_amt, d_user = heapq.heappop(neg); d_amt = -d_amt
        paid = min(c_amt, d_amt)
        transfers.append((d_user, c_user, paid))
        if c_amt > paid: heapq.heappush(pos, (-(c_amt - paid), c_user))
        if d_amt > paid: heapq.heappush(neg, (-(d_amt - paid), d_user))
    return transfers`,
        },
      },
    },

    {
      id: 'lld-cache',
      title: 'LLD: Thread-Safe In-Memory Cache (LRU/LFU + TTL)',
      subtitle: 'Generic Cache<K,V>, O(1) Doubly-Linked List + HashMap, swappable EvictionPolicy, Striped Locking & TTL expiration.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Google', 'Amazon', 'Meta'],
      tags: ['lru cache', 'lfu cache', 'ttl', 'striped lock', 'doubly linked list', 'strategy'],
      objectives: [
        'Decouple Storage from EvictionPolicy<K> (LRU / LFU / FIFO) using Strategy',
        'Implement O(1) get/put with HashMap + Doubly-Linked List + Lazy & Active TTL expiry',
        'Avoid a single global bottleneck on reads via Lock Striping (`N` independent shards)',
      ],
      steps: [
        {
          shortLabel: 'O(1) LRU + TTL',
          stage: 'SOLUTION',
          title: 'Clean Separation: Cache<K,V> = Storage + EvictionPolicy + TTL',
          body: [
            'A LeetCode `LRUCache` hardcodes everything into one class. In a **Big Tech LLD round**, decouple `Cache<K,V>` into: 1) **`Storage<K,V>`**, 2) **`EvictionPolicy<K>`** (`LRUEvictionPolicy` using a Doubly-Linked List in O(1), or `LFUEvictionPolicy` using frequency buckets in O(1)), and 3) **`ExpiryTracker`** (lazy check on `get()` + background scheduled cleanup of expired keys!).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Watch out for `ReadWriteLock` on LRU! Even a `get(k)` **mutates** the LRU Doubly-Linked List (moving `k` to head), so `get()` requires a write lock on its shard unless you use **Lock Striping (e.g., 16 shards)** or a **Ring-Buffer async LRU touch queue** (like Java Caffeine)!',
          },
          scene: {
            hud: [
              { label: 'GET / PUT', value: 'O(1) Exact', status: 'good' },
              { label: 'EVICTION', value: 'Pluggable LRU/LFU', status: 'good' },
              { label: 'CONCURRENCY', value: '16 Striped Shards', status: 'good' },
              { label: 'TTL EXPIRY', value: 'Lazy + Reaper', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'uml', x: 165, y: 215, label: 'StripedCache<K,V>', tone: 'blue', umlFields: ['- shards: Shard[16]'], umlMethods: ['+ get(K): Optional<V>', '+ put(K, V, ttl)'] },
              { id: 'ev', type: 'uml', x: 545, y: 120, label: '«interface» Eviction<K>', tone: 'green', umlFields: ['LRU | LFU | FIFO'], umlMethods: ['+ onAccess(K)', '+ evictKey(): K'] },
              { id: 'dll', type: 'uml', x: 545, y: 315, label: 'Node<K,V>', tone: 'purple', umlFields: ['key, val, expiresAt', 'prev, next pointers'], umlMethods: ['+ isExpired(): bool'] },
            ],
            edges: [
              { from: 'c', to: 'ev', label: 'shard lock + touch', packetColor: 'green', speed: 1.6 },
              { from: 'ev', to: 'dll', label: 'O(1) moveToHead', packetColor: 'purple', speed: 1.6 },
            ],
            legend: [{ label: 'striped O(1) LRU + TTL', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Striping Scale',
          stage: 'TECHNIQUE',
          title: 'Sharding 1 giant cache into 16 Striped Segments boosts throughput 12×',
          body: [
            'Instead of 1 global lock across 1,000,000 keys, create 16 independent `CacheShard` instances (`shard = shards[Math.abs(k.hashCode()) % 16]`), each with its own `ReentrantLock`, HashMap, and LRU list. Contention drops by 16× immediately!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Pointing out that `get()` mutates the LRU list (breaking naive `ReadWriteLock` assumptions!) and solving it with **Shard Striping** or **Buffered Ring Access (Caffeine)** is pure L63/L6 Staff brilliance.',
          },
          scene: {
            hud: [
              { label: 'SHARDS', value: '16 Independent', status: 'good' },
              { label: 'CONTENTION', value: '-94% Lock Wait', status: 'good' },
              { label: 'CAP PER SHARD', value: 'Total / 16', status: 'info' },
              { label: 'INSPIRATION', value: 'Caffeine / Guava', status: 'info' },
            ],
            nodes: [
              { id: 'r', type: 'hex', x: 145, y: 215, label: 'hash(key) % 16', sublabel: 'Route to Stripe', tone: 'blue' },
              { id: 's0', type: 'cache', x: 525, y: 115, label: 'Shard 0', sublabel: 'Lock0 + LRU0', tone: 'green' },
              { id: 's1', type: 'cache', x: 525, y: 215, label: 'Shard 1', sublabel: 'Lock1 + LRU1', tone: 'green' },
              { id: 's2', type: 'cache', x: 525, y: 320, label: 'Shard 2..15', sublabel: 'LockN + LRUN', tone: 'green' },
            ],
            edges: [
              { from: 'r', to: 's0', label: 'parallel', packetColor: 'green', speed: 1.5 },
              { from: 'r', to: 's1', label: 'parallel', packetColor: 'green', speed: 1.6 },
              { from: 'r', to: 's2', label: 'parallel', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'lock-striped parallel cache', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Thread-Safe Generic LRU + TTL Cache (Java & TypeScript)',
        codeSnippets: {
          java: `class LruTtlCache<K, V> {
    private record Entry<V>(V value, long expiresAtMs) {
        boolean expired() { return System.currentTimeMillis() > expiresAtMs; }
    }
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final LinkedHashMap<K, Entry<V>> map;

    LruTtlCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(capacity, 0.75f, true) { // accessOrder = true (LRU!)
            protected boolean removeEldestEntry(Map.Entry<K, Entry<V>> e) {
                return size() > LruTtlCache.this.capacity;
            }
        };
    }

    public Optional<V> get(K key) {
        lock.lock();
        try {
            Entry<V> e = map.get(key);
            if (e == null || e.expired()) { map.remove(key); return Optional.empty(); }
            return Optional.of(e.value());
        } finally { lock.unlock(); }
    }

    public void put(K key, V value, long ttlMs) {
        lock.lock();
        try { map.put(key, new Entry<>(value, System.currentTimeMillis() + ttlMs)); }
        finally { lock.unlock(); }
    }
}`,
          typescript: `class LruTtlCache<K, V> {
  private map = new Map<K, { value: V; exp: number }>();
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.exp) { this.map.delete(key); return undefined; }
    this.map.delete(key);
    this.map.set(key, entry); // Refresh to MRU tail in O(1)
    return entry.value;
  }

  put(key: K, value: V, ttlMs: number): void {
    this.map.delete(key);
    this.map.set(key, { value, exp: Date.now() + ttlMs });
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
  }
}`,
        },
      },
    },

    {
      id: 'lld-rate-limiter',
      title: 'LLD: Rate Limiter SDK Library',
      subtitle: 'Pluggable RateLimiter Strategy (Token Bucket / Sliding Window Counter), lazy timestamp refill (zero background thread!), and per-client Factory.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Stripe', 'Microsoft', 'Amazon', 'Cloudflare'],
      tags: ['rate limiter lld', 'token bucket', 'sliding window', 'lazy refill', 'strategy', 'factory'],
      objectives: [
        'Implement Lazy Timestamp Refill — zero background timer threads per user!',
        'Swap TokenBucket vs SlidingWindowCounter cleanly via RateLimiter Strategy',
        'Make per-user buckets thread-safe using `ConcurrentHashMap` + per-bucket lock',
      ],
      steps: [
        {
          shortLabel: 'Lazy Refill',
          stage: 'SOLUTION',
          title: 'Never spawn 1M timer threads — compute refilled tokens lazily on `allow()`!',
          body: [
            'Junior mistake: spawning a background thread per user to drip tokens every second! That crashes at 10,000 users.',
            '**Staff LLD Trick (Lazy Refill)**: Store `(tokens, lastRefillNanos)` per bucket. Inside `allowRequest()`, calculate `elapsedSec = (now - lastRefill) / 1e9`, add `elapsedSec * refillRate` capped at `capacity`, then consume 1 token if `tokens >= 1`! Zero background threads, **O(1) time and space**!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Use `System.nanoTime()` (monotonic clock), NEVER `System.currentTimeMillis()` — NTP wall-clock adjustments backwards would freeze token refills!',
          },
          scene: {
            hud: [
              { label: 'THREADS', value: '0 Background Timers', status: 'good' },
              { label: 'CLOCK', value: 'Monotonic nanoTime()', status: 'good' },
              { label: 'PER-KEY LOCK', value: 'Fine-Grained Mutex', status: 'good' },
              { label: 'MEMORY', value: 'O(Active Users)', status: 'good' },
            ],
            nodes: [
              { id: 'mgr', type: 'uml', x: 165, y: 215, label: 'RateLimiterService', tone: 'blue', umlFields: ['- buckets: ConcurrentMap'], umlMethods: ['+ allow(clientId): bool'] },
              { id: 'tb', type: 'uml', x: 545, y: 120, label: 'TokenBucketLimiter', sublabel: 'Lazy Refill O(1)', tone: 'green', umlFields: ['- tokens: double', '- lastNanos: long'], umlMethods: ['+ tryAcquire(): bool'] },
              { id: 'sw', type: 'uml', x: 545, y: 315, label: 'SlidingWindowLimiter', tone: 'purple', umlFields: ['- prevCount, curCount'], umlMethods: ['+ tryAcquire(): bool'] },
            ],
            edges: [
              { from: 'mgr', to: 'tb', label: 'Strategy A', packetColor: 'green', speed: 1.7 },
              { from: 'mgr', to: 'sw', label: 'Strategy B', packetColor: 'purple', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'pluggable lazy rate limiter', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Evicting Idle',
          stage: 'TECHNIQUE',
          title: 'Prevent OOM from millions of 1-time IPs with TTL Eviction',
          body: [
            'If bots hit your API from 50 million unique IPs, an unbounded `ConcurrentHashMap<String, Bucket>` leaks memory until OOM! Back your bucket registry with a **bounded LRU/TTL cache** (evict any bucket untouched for `2 × windowDuration`)!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Catching the unbounded-map memory leak for one-time IP addresses is one of interviewers’ favorite LLD follow-up probes!',
          },
          scene: {
            hud: [
              { label: 'IDLE BUCKET', value: 'Auto-Evicted', status: 'good' },
              { label: 'OOM RISK', value: 'Eliminated ✓', status: 'good' },
              { label: 'TIERS', value: 'Free / Pro / Ent', status: 'info' },
              { label: 'METRICS', value: 'Decorator Wrapper', status: 'info' },
            ],
            nodes: [
              { id: 'req', type: 'users', x: 135, y: 215, label: 'Client IP', sublabel: 'Tier: PRO', tone: 'slate' },
              { id: 'c', type: 'cache', x: 400, y: 215, label: 'Bounded Bucket Cache', sublabel: 'TTL Auto-Evict', tone: 'green' },
              { id: 'ok', type: 'hex', x: 645, y: 215, label: 'Allow / 429', sublabel: '+ Remaining Header', tone: 'blue' },
            ],
            edges: [
              { from: 'req', to: 'c', label: 'getOrCreate', packetColor: 'green', speed: 1.6 },
              { from: 'c', to: 'ok', label: 'tryAcquire()', packetColor: 'blue', speed: 1.6 },
            ],
            legend: [{ label: 'bounded O(1) token check', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Thread-Safe Lazy Token Bucket (Java & Python)',
        codeSnippets: {
          java: `interface RateLimiter { boolean allowRequest(String key); }

class TokenBucketRateLimiter implements RateLimiter {
    private static class Bucket {
        double tokens; long lastRefillNanos;
        Bucket(double cap) { this.tokens = cap; this.lastRefillNanos = System.nanoTime(); }
    }
    private final double capacity, refillPerSec;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    TokenBucketRateLimiter(double capacity, double refillPerSec) {
        this.capacity = capacity; this.refillPerSec = refillPerSec;
    }

    public boolean allowRequest(String key) {
        Bucket b = buckets.computeIfAbsent(key, k -> new Bucket(capacity));
        synchronized (b) {
            long now = System.nanoTime();
            double added = ((now - b.lastRefillNanos) / 1e9) * refillPerSec;
            b.tokens = Math.min(capacity, b.tokens + added);
            b.lastRefillNanos = now;
            if (b.tokens >= 1.0) { b.tokens -= 1.0; return true; }
            return false;
        }
    }
}`,
          python: `import time
from threading import Lock

class TokenBucket:
    def __init__(self, capacity: float, refill_per_sec: float):
        self.capacity = capacity
        self.rate = refill_per_sec
        self.tokens = capacity
        self.last = time.monotonic()
        self._lock = Lock()

    def allow(self) -> bool:
        with self._lock:
            now = time.monotonic()
            self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
            self.last = now
            if self.tokens >= 1.0:
                self.tokens -= 1.0
                return True
            return False`,
        },
      },
    },

    {
      id: 'lld-logger',
      title: 'LLD: Asynchronous Logging Framework (Log4j)',
      subtitle: 'Chain of Responsibility for log levels, Strategy Appenders (Console/File/Kafka), Singleton LogManager & Non-Blocking Async Queue.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Microsoft', 'Google', 'Datadog'],
      tags: ['logger', 'log4j', 'chain of responsibility', 'appender', 'async queue', 'singleton'],
      objectives: [
        'Filter log levels cleanly (DEBUG < INFO < WARN < ERROR < FATAL) with Chain of Responsibility',
        'Decouple log formatting (JSON / Plain) and sinks (Console, Rotating File, Kafka) via Strategy',
        'Prevent slow disk I/O from blocking request threads using a Bounded Async Producer-Consumer Queue',
      ],
      steps: [
        {
          shortLabel: 'Chain & Sinks',
          stage: 'SOLUTION',
          title: 'Loggers + Level Threshold + Formatter + Pluggable Appenders',
          body: [
            'Calling `logger.error("Payment failed", ctx)` flows through: 1) **Level Filter** (skip immediately if below configured threshold — zero string allocation!), 2) **LogFormatter** (JSON with `timestamp, level, traceId, thread`), and 3) **Appenders** (`ConsoleAppender`, `RollingFileAppender`, `KafkaAppender`).',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Synchronous file `fsync()` inside `logger.info()` can freeze your entire HTTP server when disk IOPS spike! Production Log4j2 uses a **Lock-Free Async Ring Buffer (LMAX Disruptor)** so request threads enqueue in nanoseconds and a background worker flushes in batches!',
          },
          scene: {
            hud: [
              { label: 'FILTERING', value: 'Chain / Threshold', status: 'good' },
              { label: 'SINKS', value: 'Pluggable Appenders', status: 'good' },
              { label: 'APP LATENCY', value: 'Non-Blocking Async', status: 'good' },
              { label: 'OVERFLOW', value: 'Drop DEBUG, Keep ERR', status: 'info' },
            ],
            nodes: [
              { id: 'lg', type: 'uml', x: 155, y: 215, label: 'Logger «Singleton»', tone: 'blue', umlFields: ['- minLevel: LogLevel', '- queue: BlockingQ'], umlMethods: ['+ log(level, msg)', '+ addAppender(a)'] },
              { id: 'q', type: 'queue', x: 385, y: 215, label: 'Async Buffer', sublabel: 'Bounded Ring Q', tone: 'amber', badge: 'non-blocking', badgeTone: 'green' },
              { id: 'ap', type: 'uml', x: 625, y: 215, label: '«interface» Appender', tone: 'green', umlFields: ['Console | File | Kafka'], umlMethods: ['+ append(LogRecord)'] },
            ],
            edges: [
              { from: 'lg', to: 'q', label: 'offer() ns', packetColor: 'amber', speed: 1.5 },
              { from: 'q', to: 'ap', label: 'batch flush', packetColor: 'green', speed: 1.9 },
            ],
            legend: [{ label: 'non-blocking async log pipeline', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Backpressure',
          stage: 'TECHNIQUE',
          title: 'Graceful Shutdown Flush & Queue-Full Backpressure Policy',
          body: [
            'What if the bounded async queue (10,000 events) fills up during an error storm? Define an explicit **Overflow Policy**: drop `DEBUG/INFO` logs immediately, NEVER block request threads indefinitely, and register a JVM/Process **Shutdown Hook** to flush pending ERROR logs cleanly before exit!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Mentioning **Shutdown Hook draining** + **Drop-DEBUG-keep-ERROR backpressure** shows real production logging battle scars!',
          },
          scene: {
            hud: [
              { label: 'QUEUE FULL', value: 'Drop DEBUG Only', status: 'warn' },
              { label: 'SHUTDOWN', value: 'Graceful Flush Hook', status: 'good' },
              { label: 'ROTATION', value: '100 MB + Gzip', status: 'info' },
              { label: 'TRACE LINK', value: 'MDC trace_id', status: 'good' },
            ],
            nodes: [
              { id: 't', type: 'hex', x: 165, y: 215, label: 'Worker Thread', sublabel: 'drains Async Q', tone: 'green' },
              { id: 'f', type: 'db', x: 525, y: 125, label: 'Rolling File', sublabel: '100MB Rotate', tone: 'purple' },
              { id: 'k', type: 'queue', x: 525, y: 305, label: 'ELK / Kafka', sublabel: 'Central Search', tone: 'amber' },
            ],
            edges: [
              { from: 't', to: 'f', label: 'buffered write', packetColor: 'purple', speed: 1.8 },
              { from: 't', to: 'k', label: 'batch JSON', packetColor: 'amber', speed: 1.8 },
            ],
            legend: [{ label: 'async background log sinks', tone: 'purple' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Async Multi-Appender Logger (Java)',
        codeSnippets: {
          java: `enum LogLevel { DEBUG(1), INFO(2), WARN(3), ERROR(4); final int rank; LogLevel(int r) { rank = r; } }
record LogEvent(Instant ts, LogLevel level, String msg) {}
interface LogAppender { void append(LogEvent e); }

class AsyncLogger {
    private final LogLevel minLevel;
    private final List<LogAppender> appenders = new CopyOnWriteArrayList<>();
    private final BlockingQueue<LogEvent> queue = new ArrayBlockingQueue<>(10_000);

    AsyncLogger(LogLevel minLevel) {
        this.minLevel = minLevel;
        Thread worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    LogEvent e = queue.take();
                    for (LogAppender a : appenders) a.append(e);
                } catch (InterruptedException ex) { Thread.currentThread().interrupt(); }
            }
        }, "async-logger");
        worker.setDaemon(true); worker.start();
    }

    public void log(LogLevel lvl, String msg) {
        if (lvl.rank < minLevel.rank) return;
        queue.offer(new LogEvent(Instant.now(), lvl, msg)); // Non-blocking!
    }
}`,
        },
      },
    },

    {
      id: 'lld-vending-machine',
      title: 'LLD: Vending Machine & ATM',
      subtitle: 'Classic State Design Pattern (Idle → HasMoney → Dispensing → SoldOut) + Chain of Responsibility Cash Dispenser.',
      duration: '9 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Google'],
      tags: ['vending machine', 'atm', 'state pattern', 'chain of responsibility', 'finite state machine'],
      objectives: [
        'Eliminate fragile nested if/switch blocks using the State Design Pattern',
        'Enforce strict legal state transitions and exact change/refund calculation',
        'Dispense optimal currency bills ($100 → $50 → $20 → $10) using Chain of Responsibility',
      ],
      steps: [
        {
          shortLabel: 'State Machine',
          stage: 'SOLUTION',
          title: 'Each lifecycle state is its own clean class implementing VendingState',
          body: [
            'A Vending Machine moves through **4 strict states**: `IdleState` → (`insertCoin`) → `HasMoneyState` → (`selectItem`) → `DispensingState` → (`dispense + returnChange`) → `IdleState` (or `SoldOutState`).',
            'Calling `dispense()` while `Idle` or `insertCoin()` while `Dispensing` is cleanly rejected by that state’s own method — zero giant `switch (currentState)` spaghetti!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'For **ATM / Change Return**, chain denomination handlers (`HundredHandler → FiftyHandler → TwentyHandler → TenHandler`) using **Chain of Responsibility** — verify exact change is available *before* committing the dispense!',
          },
          scene: {
            hud: [
              { label: 'CORE PATTERN', value: 'State Pattern', status: 'good' },
              { label: 'CHANGE / ATM', value: 'Chain of Resp.', status: 'good' },
              { label: 'INVALID OPS', value: 'Blocked Per State', status: 'good' },
              { label: 'ROLLBACK', value: 'Cancel Refunds All', status: 'info' },
            ],
            nodes: [
              { id: 's1', type: 'hex', x: 115, y: 215, label: 'IdleState', sublabel: 'Await Coin', tone: 'blue' },
              { id: 's2', type: 'hex', x: 315, y: 120, label: 'HasMoney', sublabel: 'Select / Refund', tone: 'green' },
              { id: 's3', type: 'hex', x: 540, y: 120, label: 'Dispensing', sublabel: 'Drop + Change', tone: 'purple' },
              { id: 's4', type: 'hex', x: 540, y: 315, label: 'Cash Chain', sublabel: '$100→$50→$20', tone: 'amber' },
            ],
            edges: [
              { from: 's1', to: 's2', label: 'insertCoin()', packetColor: 'green', speed: 1.7 },
              { from: 's2', to: 's3', label: 'select(code)', packetColor: 'purple', speed: 1.7 },
              { from: 's3', to: 's4', label: 'returnChange', packetColor: 'amber', speed: 1.8 },
              { from: 's3', to: 's1', label: 'done → Idle', packetColor: 'blue', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'finite state transitions', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Cash Rollback',
          stage: 'TECHNIQUE',
          title: 'Two-Phase Change Check prevents getting stuck mid-dispense',
          body: [
            'What if the user inserts \$20 for a \$3 soda, and the machine has zero \$1/\$5 bills left? Check `cashInventory.canMakeChange(17)` BEFORE deducting stock or dispensing — otherwise fail cleanly and refund the \$20 bill!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Checking **change availability atomically before dispense** (classic transaction rollback thinking inside an LLD prompt!) impresses senior interviewers.',
          },
          scene: {
            hud: [
              { label: 'PRE-CHECK', value: 'Stock + Change OK?', status: 'good' },
              { label: 'IF SHORT', value: 'Refund Full Coin', status: 'warn' },
              { label: 'INVENTORY', value: 'Atomic Decrement', status: 'good' },
              { label: 'EXTENSIBLE', value: 'NFC / UPI Payment', status: 'info' },
            ],
            nodes: [
              { id: 'v', type: 'hex', x: 165, y: 215, label: 'Validate', sublabel: 'Stock + Change?', tone: 'blue' },
              { id: 'ok', type: 'hex', x: 525, y: 125, label: 'Dispense ✓', sublabel: 'Item + Exact Coins', tone: 'green' },
              { id: 'no', type: 'hex', x: 525, y: 305, label: 'Cancel & Refund', sublabel: 'Zero State Corruption', tone: 'amber' },
            ],
            edges: [
              { from: 'v', to: 'ok', label: 'valid', packetColor: 'green', speed: 1.7 },
              { from: 'v', to: 'no', label: 'insufficient change', packetColor: 'amber', dashed: true, speed: 2.2 },
            ],
            legend: [{ label: 'atomic pre-validation', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Vending Machine State Pattern (Java)',
        codeSnippets: {
          java: `interface VendingState {
    void insertCoin(VendingMachine m, int cents);
    void selectItem(VendingMachine m, String code);
    void cancel(VendingMachine m);
}

class HasMoneyState implements VendingState {
    public void insertCoin(VendingMachine m, int c) { m.addBalance(c); }
    public void selectItem(VendingMachine m, String code) {
        Item item = m.inventory().get(code);
        if (item == null || item.qty() <= 0) throw new IllegalStateException("Sold out");
        if (m.balance() < item.priceCents()) throw new IllegalStateException("Insufficient funds");
        m.setState(m.dispensingState());
        m.dispenseAndReturnChange(item);
        m.setState(m.idleState());
    }
    public void cancel(VendingMachine m) { m.refundAll(); m.setState(m.idleState()); }
}`,
        },
      },
    },

    {
      id: 'lld-chess',
      title: 'LLD: Chess / Board Game Engine',
      subtitle: 'Command pattern for Undo/Redo move history, Strategy for Piece move validation, State for Check/Checkmate & Factory setup.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Microsoft', 'Amazon', 'Google'],
      tags: ['chess', 'tic tac toe', 'command pattern', 'undo redo', 'strategy', 'game engine'],
      objectives: [
        'Keep Board pure data while delegating piece-specific movement rules via Strategy/Polymorphism',
        'Support infinite Undo/Redo & PGN replay cleanly using the Command pattern',
        'Verify king safety (self-check rejection) and detect Checkmate/Stalemate',
      ],
      steps: [
        {
          shortLabel: 'Game UML',
          stage: 'SOLUTION',
          title: 'Clean Game Loop: GameController + Board + Piece Moves + Command History',
          body: [
            'Separate **Board** (`Cell[8][8]`) from **MoveValidator** (each `Piece` subclass or `MoveStrategy` knows its geometry — Knight L-jump, Bishop diagonals, Pawn en-passant) and **Command Stack** (`MoveCommand` stores `from, to, movedPiece, capturedPiece` so `undo()` restores the exact board in O(1)!).',
            'Crucial validation rule: simulate the move on the board (or check king pin), verify `isKingInCheck(currentPlayer)` is `false`, and only then commit!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'For **Tic-Tac-Toe (`N×N`)**, optimize win detection from O(N²) full-board scan to **O(1)** using `rowCount[N]`, `colCount[N]`, `diag`, and `antiDiag` integer counters!',
          },
          scene: {
            hud: [
              { label: 'UNDO / REDO', value: 'Command Stack O(1)', status: 'good' },
              { label: 'PIECE RULES', value: 'Polymorphic Strategy', status: 'good' },
              { label: 'GAME STATE', value: 'Active · Check · Mate', status: 'info' },
              { label: 'PLAYERS', value: 'Human or AI Bot', status: 'good' },
            ],
            nodes: [
              { id: 'g', type: 'uml', x: 165, y: 215, label: 'ChessGame', sublabel: '«Controller»', tone: 'blue', umlFields: ['- board: Board', '- history: Stack<MoveCmd>'], umlMethods: ['+ makeMove(from, to)', '+ undo()'] },
              { id: 'p', type: 'uml', x: 545, y: 120, label: '«abstract» Piece', tone: 'green', umlFields: ['King | Queen | Knight'], umlMethods: ['+ canMove(board, m)'] },
              { id: 'cmd', type: 'uml', x: 545, y: 315, label: 'MoveCommand', sublabel: '«Command»', tone: 'purple', umlFields: ['from, to, captured'], umlMethods: ['+ execute()', '+ undo()'] },
            ],
            edges: [
              { from: 'g', to: 'p', label: 'validate move', packetColor: 'green', speed: 1.7 },
              { from: 'g', to: 'cmd', label: 'execute + push', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [{ label: 'command-driven game engine', tone: 'purple' }],
          },
        },
        {
          shortLabel: 'Special Moves',
          stage: 'TECHNIQUE',
          title: 'Extensibility: Castling, Promotion, Time Clocks & AI Player',
          body: [
            'Because `Player` is an interface (`HumanPlayer` vs `MinimaxBotPlayer`), plugging in an AI opponent or network WebSocket player requires zero changes to `ChessGame`. Special moves (Castling, En-Passant, Pawn Promotion) become specialized `Command` subclasses with clean `undo()` support!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'In `undo()` of Pawn Promotion, `MoveCommand` restores the original `Pawn` rather than leaving a `Queen` behind — another reason Command objects shine!',
          },
          scene: {
            hud: [
              { label: 'PLAYER IFACE', value: 'Human / Bot / WS', status: 'good' },
              { label: 'SPECIAL MOVES', value: 'Command Subclasses', status: 'good' },
              { label: 'REPLAY', value: 'Stream History', status: 'info' },
              { label: 'TESTING', value: 'FEN Board Loader', status: 'good' },
            ],
            nodes: [
              { id: 'p1', type: 'users', x: 135, y: 130, label: 'Human Player', sublabel: 'UI / WS Move', tone: 'blue' },
              { id: 'p2', type: 'hex', x: 135, y: 300, label: 'AI Bot Player', sublabel: 'Minimax Move', tone: 'purple' },
              { id: 'eng', type: 'hex', x: 500, y: 215, label: 'Chess Engine', sublabel: 'Same Interface!', tone: 'green', badge: 'decoupled ✓', badgeTone: 'green' },
            ],
            edges: [
              { from: 'p1', to: 'eng', label: 'nextMove()', packetColor: 'blue', speed: 1.8 },
              { from: 'p2', to: 'eng', label: 'nextMove()', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'uniform Player abstraction', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Command-Based Undoable Chess Move (Java)',
        codeSnippets: {
          java: `class MoveCommand {
    private final Board board;
    private final Pos from, to;
    private final Piece moved;
    private Piece captured;

    MoveCommand(Board b, Pos from, Pos to) {
        this.board = b; this.from = from; this.to = to;
        this.moved = b.get(from);
    }

    public void execute() {
        captured = board.get(to);
        board.set(to, moved);
        board.set(from, null);
    }

    public void undo() {
        board.set(from, moved);
        board.set(to, captured);
    }
}`,
        },
      },
    },

    {
      id: 'lld-task-scheduler',
      title: 'LLD: Multi-Threaded Task Scheduler & Cron',
      subtitle: 'Min-Heap Delay Queue + Worker ThreadPool, `Condition.awaitNanos()` zero busy-wait, Fixed-Rate vs Fixed-Delay & Retry Backoff.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Microsoft', 'Google', 'Amazon', 'Uber'],
      tags: ['task scheduler', 'cron', 'delay queue', 'priority queue', 'condition variable', 'thread pool'],
      objectives: [
        'Schedule one-shot, fixed-rate, and fixed-delay jobs using a Min-Heap ordered by `nextRunTime`',
        'Avoid 100% CPU busy-spinning with `Condition.awaitNanos(delay)` + early wakeup when a sooner task arrives',
        'Decouple the lightweight Dispatcher thread from the Worker ThreadPool so slow tasks never delay others',
      ],
      steps: [
        {
          shortLabel: 'Min-Heap + Cond',
          stage: 'SOLUTION',
          title: '1 Dispatcher Thread + Min-Heap + Condition Variable + N Worker Threads',
          body: [
            'Store scheduled tasks in a **Min-Heap (`PriorityQueue`)** sorted by `nextRunNanos`. The single **Dispatcher thread** peeks the earliest task: if `now < task.nextRunNanos`, it parks silently via **`condition.awaitNanos(remaining)`** (0% CPU usage!).',
            'When a brand-new task arrives with an *earlier* deadline than the current heap head, `schedule()` calls **`condition.signal()`** to wake the dispatcher immediately! When due, Dispatcher hands the task off to a **Worker ThreadPool** so a slow 10-second job never blocks the next 100 ms cron job!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Distinguish **Fixed-Rate** (`next = prevScheduled + period`, stays aligned to wall-clock ticks) vs **Fixed-Delay** (`next = completionTime + delay`, guarantees cooldown gap after long jobs finish)!',
          },
          scene: {
            hud: [
              { label: 'DATA STRUCT', value: 'Min-Heap O(log N)', status: 'good' },
              { label: 'IDLE CPU', value: '0% (awaitNanos)', status: 'good' },
              { label: 'EXECUTION', value: 'Worker ThreadPool', status: 'good' },
              { label: 'MODES', value: 'Once · Rate · Delay', status: 'info' },
            ],
            nodes: [
              { id: 'c', type: 'users', x: 100, y: 215, label: 'Callers', sublabel: 'schedule(task, t)', tone: 'slate' },
              { id: 'pq', type: 'queue', x: 315, y: 215, label: 'Min-Heap + Cond', sublabel: 'Earliest Deadline', tone: 'purple', badge: '0% spin wait', badgeTone: 'green' },
              { id: 'd', type: 'hex', x: 500, y: 120, label: 'Dispatcher', sublabel: 'Pops Due Tasks', tone: 'blue' },
              { id: 'wp', type: 'hex', x: 660, y: 270, label: 'Worker Pool', sublabel: 'N Threads + Retry', tone: 'green', load: 42 },
            ],
            edges: [
              { from: 'c', to: 'pq', label: 'push + signal()', packetColor: 'purple', speed: 1.6 },
              { from: 'pq', to: 'd', label: 'wake @ due', packetColor: 'blue', speed: 1.6 },
              { from: 'd', to: 'wp', label: 'submit(job)', packetColor: 'green', speed: 1.5 },
              { from: 'wp', to: 'pq', label: 'reschedule recurring', packetColor: 'amber', dashed: true, speed: 2.3 },
            ],
            legend: [
              { label: 'non-blocking dispatch', tone: 'green' },
              { label: 'recurring reschedule', tone: 'amber' },
            ],
          },
        },
        {
          shortLabel: 'Retries & Scale',
          stage: 'TECHNIQUE',
          title: 'Exception Isolation, Retry Backoff & Distributed Cron Scaling',
          body: [
            'Wrap every worker execution in `try/catch` so one throwing task never kills a worker thread! On failure, re-enqueue with exponential backoff (`retryCount < maxRetries`) or route to a Dead-Letter listener.',
            'To scale from single-machine LLD to distributed HLD (1M cron jobs): shard jobs in Postgres/Cassandra by time-bucket (`minute_bucket`), lease partitions via etcd/DB `SKIP LOCKED`, and execute idempotently across stateless workers!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Bridging your clean single-machine LLD Task Scheduler smoothly into distributed **`SELECT ... FOR UPDATE SKIP LOCKED`** multi-node cron execution at the end of the interview is a legendary Microsoft/Google close!',
          },
          scene: {
            hud: [
              { label: 'CRASH GUARD', value: 'Isolated try/catch', status: 'good' },
              { label: 'FAILURE', value: 'Backoff → DLQ', status: 'warn' },
              { label: 'DISTRIBUTED', value: 'FOR UPDATE SKIP LOCK', status: 'good' },
              { label: 'SHUTDOWN', value: 'Drain Gracefully', status: 'info' },
            ],
            nodes: [
              { id: 'w', type: 'hex', x: 165, y: 215, label: 'Worker Catch', sublabel: 'Isolated Fault', tone: 'blue' },
              { id: 'rt', type: 'queue', x: 485, y: 125, label: 'Backoff Heap', sublabel: '2s → 4s → 8s', tone: 'amber' },
              { id: 'dlq', type: 'db', x: 485, y: 305, label: 'Failed Job DLQ', sublabel: 'Alert Owner', tone: 'coral' },
            ],
            edges: [
              { from: 'w', to: 'rt', label: 'retry < 3', packetColor: 'amber', speed: 1.8 },
              { from: 'w', to: 'dlq', label: 'exhausted', packetColor: 'coral', dashed: true, speed: 2.3 },
            ],
            legend: [{ label: 'resilient retry pipeline', tone: 'amber' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Zero-Busy-Wait Multi-Threaded Task Scheduler (Java & Python)',
        codeSnippets: {
          java: `class TaskScheduler {
    private static class ScheduledTask implements Comparable<ScheduledTask> {
        final Runnable job; long runAtNanos; final long intervalNanos; // 0 = one-shot
        ScheduledTask(Runnable j, long runAt, long interval) {
            this.job = j; this.runAtNanos = runAt; this.intervalNanos = interval;
        }
        public int compareTo(ScheduledTask o) { return Long.compare(this.runAtNanos, o.runAtNanos); }
    }

    private final PriorityQueue<ScheduledTask> pq = new PriorityQueue<>();
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition wakeup = lock.newCondition();
    private final ExecutorService workers;
    private volatile boolean running = true;

    TaskScheduler(int threads) {
        this.workers = Executors.newFixedThreadPool(threads);
        Thread dispatcher = new Thread(this::dispatchLoop, "scheduler-dispatcher");
        dispatcher.start();
    }

    public void schedule(Runnable job, long delayMs, long intervalMs) {
        lock.lock();
        try {
            long runAt = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(delayMs);
            pq.offer(new ScheduledTask(job, runAt, TimeUnit.MILLISECONDS.toNanos(intervalMs)));
            wakeup.signal(); // Wake dispatcher in case new task is sooner!
        } finally { lock.unlock(); }
    }

    private void dispatchLoop() {
        while (running) {
            lock.lock();
            try {
                while (pq.isEmpty() && running) wakeup.await();
                if (!running) break;
                long waitNanos = pq.peek().runAtNanos - System.nanoTime();
                if (waitNanos > 0) { wakeup.awaitNanos(waitNanos); continue; }
                ScheduledTask due = pq.poll();
                if (due.intervalNanos > 0) {
                    pq.offer(new ScheduledTask(due.job, due.runAtNanos + due.intervalNanos, due.intervalNanos));
                }
                workers.submit(() -> { try { due.job.run(); } catch (Throwable ignored) {} });
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            finally { lock.unlock(); }
        }
    }
}`,
          python: `import heapq, time, threading
from concurrent.futures import ThreadPoolExecutor

class TaskScheduler:
    def __init__(self, max_workers: int = 4):
        self._heap = []
        self._cond = threading.Condition()
        self._pool = ThreadPoolExecutor(max_workers=max_workers)
        self._running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def schedule(self, fn, delay_sec: float, interval_sec: float = 0.0):
        with self._cond:
            heapq.heappush(self._heap, (time.monotonic() + delay_sec, interval_sec, fn))
            self._cond.notify()

    def _loop(self):
        while self._running:
            with self._cond:
                while not self._heap and self._running:
                    self._cond.wait()
                run_at, interval, fn = self._heap[0]
                wait = run_at - time.monotonic()
                if wait > 0:
                    self._cond.wait(timeout=wait)
                    continue
                heapq.heappop(self._heap)
                if interval > 0:
                    heapq.heappush(self._heap, (run_at + interval, interval, fn))
            self._pool.submit(fn)`,
        },
      },
    },

    {
      id: 'lld-amazon-locker',
      title: 'LLD: Amazon Locker / Package Pickup',
      subtitle: 'Amazon’s #1 asked LLD: Best-Fit compartment allocation, secure OTP with 3-day TTL, expiration sweeper & return drop-off.',
      duration: '11 min',
      level: 'Intermediate',
      companies: ['Amazon', 'Microsoft', 'Flipkart'],
      tags: ['amazon locker', 'best fit', 'strategy', 'otp', 'ttl', 'state machine', 'machine coding'],
      objectives: [
        'Allocate the smallest available compartment fitting a package via Best-Fit Strategy',
        'Generate cryptographically random single-use 6-digit OTPs with 72-hour TTL expiry',
        'Handle concurrent courier deposits, customer pickups, expired package sweeps & returns cleanly',
      ],
      steps: [
        {
          shortLabel: 'Best-Fit UML',
          stage: 'SOLUTION',
          title: 'Smallest-Fitting Compartment Strategy + Atomic Claim + OTP Token',
          body: [
            'Never put an envelope inside an `XL` compartment when an `S` compartment is free! Order compartment sizes (`S < M < L < XL`) and use **`BestFitAllocationStrategy`**: check free queues in ascending size order starting from `package.size`, claiming atomically with `AtomicBoolean.compareAndSet(false, true)`.',
            'Generate a secure `AccessCode(otp, compartmentId, expiresAt = now + 72h)` and notify the customer via `NotificationObserver`!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'In Amazon LLD interviews, proactively ask about **Customer Returns** (reusing the exact same `deposit()` flow with a Return Code!) and **Expired Package Sweeps** (freeing compartments after 3 days when a courier collects unclaimed packages)!',
          },
          scene: {
            hud: [
              { label: 'ALLOCATION', value: 'Best-Fit S→M→L→XL', status: 'good' },
              { label: 'SECURITY', value: 'SecureRandom OTP', status: 'good' },
              { label: 'TTL EXPIRY', value: '72 Hours Auto-Sweep', status: 'info' },
              { label: 'CONCURRENCY', value: 'Per-Compartment CAS', status: 'good' },
            ],
            nodes: [
              { id: 'loc', type: 'uml', x: 165, y: 215, label: 'LockerService', sublabel: '«Facade»', tone: 'blue', umlFields: ['- strat: BestFitStrategy', '- tokens: Map<OTP, Token>'], umlMethods: ['+ deposit(pkg): OTP', '+ pickup(otp): Package'] },
              { id: 'comp', type: 'uml', x: 545, y: 120, label: 'Compartment', tone: 'green', umlFields: ['size: S|M|L|XL', 'state: FREE|OCC|EXP'], umlMethods: ['+ tryClaim(): bool', '+ openAndRelease()'] },
              { id: 'tok', type: 'uml', x: 545, y: 315, label: 'AccessToken', tone: 'purple', umlFields: ['otpHash, compId', 'expiresAt: Instant'], umlMethods: ['+ isValid(otp): bool'] },
            ],
            edges: [
              { from: 'loc', to: 'comp', label: 'best-fit CAS', packetColor: 'green', speed: 1.6 },
              { from: 'loc', to: 'tok', label: 'mint 72h OTP', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [{ label: 'best-fit compartment + OTP', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Pickup & Sweep',
          stage: 'TECHNIQUE',
          title: 'Single-Use OTP Invalidation & Scheduled Expired-Package Cleanup',
          body: [
            'When the customer enters their 6-digit OTP on the locker kiosk, `pickup(otp)` atomically removes the token (preventing replay!), validates `now < expiresAt`, opens the hardware latch, and resets the compartment to `AVAILABLE`. A background sweeper flags expired compartments `EXPIRED_PENDING_PICKUP` for the next courier!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'Guard the kiosk keypad with **OTP Brute-Force Rate Limiting** (lock code after 5 wrong guesses) and store only hashed OTPs in memory/DB!',
          },
          scene: {
            hud: [
              { label: 'OTP REPLAY', value: 'Single-Use Removed', status: 'good' },
              { label: 'BRUTE FORCE', value: 'Max 5 Tries Lock', status: 'good' },
              { label: 'RETURNS', value: 'Same Deposit Flow', status: 'info' },
              { label: 'HARDWARE', value: 'DoorController Port', status: 'info' },
            ],
            nodes: [
              { id: 'k', type: 'users', x: 120, y: 215, label: 'Locker Kiosk', sublabel: 'PIN: 482-910', tone: 'slate' },
              { id: 'v', type: 'hex', x: 390, y: 215, label: 'Token Verifier', sublabel: 'Atomic Pop + TTL', tone: 'green' },
              { id: 'd', type: 'hex', x: 645, y: 215, label: 'Hardware Latch', sublabel: 'Pop Door #14 ✓', tone: 'purple' },
            ],
            edges: [
              { from: 'k', to: 'v', label: 'enter OTP', packetColor: 'green', bidirectional: true, speed: 1.6 },
              { from: 'v', to: 'd', label: 'unlock & free', packetColor: 'purple', speed: 1.6 },
            ],
            legend: [{ label: 'atomic pickup verification', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Amazon Locker Best-Fit + Atomic OTP Service (Java & Python)',
        codeSnippets: {
          java: `enum Size { SMALL, MEDIUM, LARGE, XL }

class Compartment {
    final String id; final Size size;
    private final AtomicBoolean occupied = new AtomicBoolean(false);
    private volatile String packageId;
    Compartment(String id, Size size) { this.id = id; this.size = size; }
    boolean tryDeposit(String pkgId) {
        if (occupied.compareAndSet(false, true)) { this.packageId = pkgId; return true; }
        return false;
    }
    String release() { String p = packageId; packageId = null; occupied.set(false); return p; }
}

class LockerService {
    private final EnumMap<Size, List<Compartment>> bySize = new EnumMap<>(Size.class);
    private final ConcurrentHashMap<String, AccessToken> tokens = new ConcurrentHashMap<>();
    private final SecureRandom rng = new SecureRandom();

    public String deposit(String pkgId, Size pkgSize) {
        for (Size s : Size.values()) {
            if (s.ordinal() < pkgSize.ordinal()) continue; // Best-Fit ascending!
            for (Compartment c : bySize.getOrDefault(s, List.of())) {
                if (c.tryDeposit(pkgId)) {
                    String otp = String.format("%06d", rng.nextInt(1_000_000));
                    tokens.put(otp, new AccessToken(otp, c, Instant.now().plus(Duration.ofDays(3))));
                    return otp;
                }
            }
        }
        throw new IllegalStateException("No fitting compartment free");
    }

    public String pickup(String otp) {
        AccessToken t = tokens.remove(otp); // Single-use atomic pop!
        if (t == null || Instant.now().isAfter(t.expiresAt())) throw new IllegalArgumentException("Invalid/Expired OTP");
        return t.compartment().release();
    }
}`,
          python: `import secrets, time
from threading import Lock

SIZES = ["S", "M", "L", "XL"]

class LockerHub:
    def __init__(self, compartments):
        self._lock = Lock()
        self._compartments = compartments
        self._tokens = {}

    def deposit(self, pkg_id: str, pkg_size: str) -> str:
        min_idx = SIZES.index(pkg_size)
        with self._lock:
            for size in SIZES[min_idx:]:
                for c in self._compartments:
                    if c.size == size and not c.occupied:
                        c.occupied, c.pkg_id = True, pkg_id
                        otp = f"{secrets.randbelow(1_000_000):06d}"
                        self._tokens[otp] = (c, time.time() + 72 * 3600)
                        return otp
        raise RuntimeError("Locker full")`,
        },
      },
    },

    {
      id: 'lld-uber-matching',
      title: 'LLD: Ride-Sharing / Uber Cab Dispatch',
      subtitle: 'Pluggable DriverMatchingStrategy, Surge/Coupon Pricing Decorator, Trip State Machine & Observer Rider Alerts.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Uber', 'Lyft', 'Ola', 'Microsoft'],
      tags: ['uber lld', 'ride sharing', 'matching strategy', 'decorator pricing', 'state machine', 'observer'],
      objectives: [
        'Separate Rider/Driver entities from TripManager orchestration and MatchingStrategy',
        'Compose Base Fare + Surge Multiplier + Promo Coupon cleanly using the Decorator pattern',
        'Prevent double-assigning a driver using per-driver `AtomicReference<DriverStatus>` CAS',
      ],
      steps: [
        {
          shortLabel: 'Dispatch & Surge',
          stage: 'SOLUTION',
          title: 'Matching Strategy + Composable Pricing Decorator + Atomic Driver Claim',
          body: [
            '**Matching**: `DriverMatchingStrategy` swaps cleanly between `NearestDriverStrategy` and `HighestRatedDriverStrategy`. Claiming a driver uses **`driver.status.compareAndSet(AVAILABLE, ON_TRIP)`** so two concurrent ride requests never grab the same cab!',
            '**Pricing**: Wrap `BaseFareCalculator` with **`SurgeDecorator(1.5x)`** and **`PromoDiscountDecorator(-$5)`** — dynamically stacking any combination of tolls, airport fees, surge, and promos!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Use **Observer** (`TripListener`) so every Trip State transition (`REQUESTED → ASSIGNED → STARTED → COMPLETED`) automatically pushes live SMS/App alerts, triggers receipt invoicing, and updates driver rating eligibility!',
          },
          scene: {
            hud: [
              { label: 'MATCHING', value: 'Strategy Pluggable', status: 'good' },
              { label: 'PRICING', value: 'Decorator Stack', status: 'good' },
              { label: 'DRIVER CLAIM', value: 'Atomic CAS ✓', status: 'good' },
              { label: 'TRIP LIFECYCLE', value: 'State + Observer', status: 'info' },
            ],
            nodes: [
              { id: 'tm', type: 'uml', x: 165, y: 215, label: 'TripManager', sublabel: '«Facade»', tone: 'blue', umlFields: ['- matcher: MatchStrategy', '- pricing: FareCalculator'], umlMethods: ['+ requestRide(r, dst)', '+ completeTrip(id)'] },
              { id: 'm', type: 'uml', x: 545, y: 120, label: '«interface» MatchStrategy', tone: 'green', umlFields: ['Nearest | TopRated'], umlMethods: ['+ findDriver(loc): Driver'] },
              { id: 'p', type: 'uml', x: 545, y: 315, label: 'FareDecorator', sublabel: 'Surge + Promo + Base', tone: 'purple', umlFields: ['- wrapped: FareCalc'], umlMethods: ['+ computeCents(trip)'] },
            ],
            edges: [
              { from: 'tm', to: 'm', label: 'CAS claim cab', packetColor: 'green', speed: 1.6 },
              { from: 'tm', to: 'p', label: 'compute fare', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [{ label: 'strategy + decorator ride engine', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Trip Lifecycle',
          stage: 'TECHNIQUE',
          title: 'Guarding Illegal State Transitions & Driver Cancellation Re-Dispatch',
          body: [
            'Enforce strict `TripStatus` transitions (`REQUESTED → DRIVER_ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`). If the driver cancels before pickup, release `driver.status → AVAILABLE`, apply cancellation policy, and automatically loop `TripManager.reDispatch()` excluding the declining driver ID!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Passing an `excludedDriverIds` set into `findDriver()` cleanly prevents immediately re-offering a canceled ride back to the exact same driver!',
          },
          scene: {
            hud: [
              { label: 'CANCEL RETRY', value: 'Excludes Decliner', status: 'good' },
              { label: 'ILLEGAL OPS', value: 'Rejected by State', status: 'good' },
              { label: 'RECEIPTS', value: 'Observer Triggered', status: 'info' },
              { label: 'CONCURRENCY', value: 'Zero Double-Match', status: 'good' },
            ],
            nodes: [
              { id: 's1', type: 'hex', x: 120, y: 215, label: 'REQUESTED', sublabel: 'Find Cab', tone: 'amber' },
              { id: 's2', type: 'hex', x: 325, y: 215, label: 'ASSIGNED', sublabel: 'CAS Driver ✓', tone: 'blue' },
              { id: 's3', type: 'hex', x: 525, y: 215, label: 'IN_PROGRESS', sublabel: 'GPS Track', tone: 'purple' },
              { id: 's4', type: 'hex', x: 685, y: 215, label: 'COMPLETED', sublabel: 'Charge + Rate', tone: 'green' },
            ],
            edges: [
              { from: 's1', to: 's2', label: 'accept', packetColor: 'blue', speed: 1.7 },
              { from: 's2', to: 's3', label: 'OTP start', packetColor: 'purple', speed: 1.7 },
              { from: 's3', to: 's4', label: 'drop-off', packetColor: 'green', speed: 1.7 },
            ],
            legend: [{ label: 'trip state machine', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Uber Dispatch CAS + Decorator Pricing (Java)',
        codeSnippets: {
          java: `interface FareCalculator { long calculateCents(double km, double mins); }

class BaseFare implements FareCalculator {
    public long calculateCents(double km, double mins) { return Math.round(250 + km * 120 + mins * 25); }
}

class SurgeDecorator implements FareCalculator {
    private final FareCalculator next; private final double multiplier;
    SurgeDecorator(FareCalculator next, double m) { this.next = next; this.multiplier = m; }
    public long calculateCents(double km, double mins) { return Math.round(next.calculateCents(km, mins) * multiplier); }
}

class Driver {
    final String id; final AtomicReference<String> status = new AtomicReference<>("AVAILABLE");
    Driver(String id) { this.id = id; }
    boolean tryClaim() { return status.compareAndSet("AVAILABLE", "ON_TRIP"); }
    void release() { status.set("AVAILABLE"); }
}`,
        },
      },
    },

    {
      id: 'lld-pubsub-broker',
      title: 'LLD: In-Memory Kafka / Pub-Sub Broker',
      subtitle: 'Multi-topic append-only log, independent per-subscriber offsets, `Condition` non-blocking wakeup & offset replay.',
      duration: '11 min',
      level: 'Advanced',
      companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Confluent'],
      tags: ['pubsub lld', 'kafka lld', 'message broker', 'offset', 'replay', 'condition variable', 'concurrency'],
      objectives: [
        'Model Topics as append-only immutable message logs (so multiple subscribers read independently!)',
        'Give each Subscriber its own `AtomicInteger offset` and dedicated non-blocking worker loop',
        'Support `resetOffset(topic, subscriber, newOffset)` to replay historical events seamlessly',
      ],
      steps: [
        {
          shortLabel: 'Log & Offsets',
          stage: 'SOLUTION',
          title: 'Append-Only Topic Log + Independent Subscriber Offset Workers',
          body: [
            'Unlike a destructive queue, an in-memory Kafka broker stores messages in an **append-only `List<Message>`** inside each `Topic`. Each `TopicSubscriber` owns an **`AtomicInteger offset`** and a **`SubscriberWorker`** thread!',
            'When a producer calls `publish(topic, msg)`, the topic appends the message and calls **`worker.wakeUp()`** (`notify()`/`Condition.signal()`) on every subscriber — zero busy-waiting! Calling **`resetOffset(sub, 0)`** sets `offset = 0` and wakes the worker to replay from message #0!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Slow Consumer Isolation: Because every subscriber has its own worker thread + offset, a slow Analytics subscriber taking 500 ms/msg NEVER stalls a fast Real-Time Alert subscriber!',
          },
          scene: {
            hud: [
              { label: 'STORAGE', value: 'Append-Only Log', status: 'good' },
              { label: 'OFFSETS', value: 'Per-Subscriber Atomic', status: 'good' },
              { label: 'REPLAY', value: 'resetOffset(0) ✓', status: 'good' },
              { label: 'IDLE CPU', value: '0% (wait/notify)', status: 'good' },
            ],
            nodes: [
              { id: 'pub', type: 'hex', x: 110, y: 215, label: 'Publisher', sublabel: 'publish(topic, m)', tone: 'blue' },
              { id: 'top', type: 'queue', x: 350, y: 215, label: 'Topic Log', sublabel: '[m0, m1, m2, m3]', tone: 'amber', badge: 'immutable log', badgeTone: 'amber' },
              { id: 'w1', type: 'hex', x: 635, y: 120, label: 'SubWorker A', sublabel: 'offset = 3 (Fast)', tone: 'green' },
              { id: 'w2', type: 'hex', x: 635, y: 315, label: 'SubWorker B', sublabel: 'offset = 1 (Replay)', tone: 'purple' },
            ],
            edges: [
              { from: 'pub', to: 'top', label: 'append + signalAll', packetColor: 'blue', speed: 1.6 },
              { from: 'top', to: 'w1', label: 'read[3]', packetColor: 'green', speed: 1.5 },
              { from: 'top', to: 'w2', label: 'read[1]', packetColor: 'purple', speed: 2.1 },
            ],
            legend: [{ label: 'independent offset consumption', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Groups & Threading',
          stage: 'TECHNIQUE',
          title: 'Scaling to Partitioned Consumer Groups with Sticky Key Hashing',
          body: [
            'Follow-up extension: "How do you add Consumer Groups?" Partition each `Topic` into `P` independent `Partition` logs routed by `hash(key) % P`, and assign each partition to at most 1 worker inside a Consumer Group — preserving strict per-key ordering with `P`-way concurrency!',
          ],
          callout: {
            type: 'GOOD TO KNOW',
            text: 'Always use a `while (offset >= log.size()) wait()` loop (never `if`) to guard against **spurious wakeups** in Java/C++ condition variables!',
          },
          scene: {
            hud: [
              { label: 'SPURIOUS GUARD', value: 'while() Loop Wait', status: 'good' },
              { label: 'KEY ORDERING', value: 'hash(key) % P', status: 'good' },
              { label: 'ISOLATION', value: 'Slow Sub Safe ✓', status: 'good' },
              { label: 'SHUTDOWN', value: 'Interrupt Cleanly', status: 'info' },
            ],
            nodes: [
              { id: 'k', type: 'hex', x: 165, y: 215, label: 'Partition Router', sublabel: 'hash(orderId) % 4', tone: 'blue' },
              { id: 'p0', type: 'queue', x: 525, y: 125, label: 'Partition 0', sublabel: 'Consumer #1', tone: 'green' },
              { id: 'p1', type: 'queue', x: 525, y: 305, label: 'Partition 1', sublabel: 'Consumer #2', tone: 'purple' },
            ],
            edges: [
              { from: 'k', to: 'p0', label: 'ordered key A', packetColor: 'green', speed: 1.7 },
              { from: 'k', to: 'p1', label: 'ordered key B', packetColor: 'purple', speed: 1.7 },
            ],
            legend: [{ label: 'partitioned consumer group', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'In-Memory Kafka Topic & Replayable Offset Worker (Java)',
        codeSnippets: {
          java: `record Message(String id, String payload) {}
interface Subscriber { String id(); void consume(Message m); }

class TopicSubscriberWorker implements Runnable {
    private final List<Message> log;
    private final Subscriber sub;
    private final AtomicInteger offset = new AtomicInteger(0);

    TopicSubscriberWorker(List<Message> log, Subscriber sub) { this.log = log; this.sub = sub; }

    public synchronized void wakeUp() { notify(); }
    public synchronized void resetOffset(int newOffset) { offset.set(newOffset); notify(); }

    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            Message msg;
            synchronized (this) {
                while (offset.get() >= log.size()) {
                    try { wait(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                }
                msg = log.get(offset.getAndIncrement());
            }
            sub.consume(msg); // Run outside lock so slow consumers never block producers!
        }
    }
}`,
        },
      },
    },

    {
      id: 'lld-auction-system',
      title: 'LLD: Thread-Safe Online Auction System',
      subtitle: 'Per-auction ReentrantLock bid guard, Proxy Auto-Bidding Strategy, Observer outbid alerts & scheduled closing.',
      duration: '10 min',
      level: 'Intermediate',
      companies: ['Amazon', 'eBay', 'Microsoft', 'Flipkart'],
      tags: ['auction lld', 'bidding', 'observer', 'reentrantlock', 'proxy bid', 'concurrency'],
      objectives: [
        'Serialize bids per auction using fine-grained per-auction `ReentrantLock` (parallel across auctions!)',
        'Validate active status, `bid > currentHigh + minIncrement`, and reject self-outbidding',
        'Notify outbid participants cleanly via Observer + auto-close via `ScheduledExecutorService`',
      ],
      steps: [
        {
          shortLabel: 'Per-Auction Lock',
          stage: 'SOLUTION',
          title: 'Fine-Grained Auction Lock + Outbid Observer + Scheduled Closer',
          body: [
            'Never lock the entire `AuctionService`! Give every `Auction` object its own **`ReentrantLock`**. Inside `placeBid(userId, cents)`: verify `status == OPEN && Instant.now().isBefore(endTime)` and `cents >= currentHigh + minIncrement`, record the bid in `bidHistory`, update `highestBid`, and notify the previous leader via **`BidObserver.onOutbid()`** *after* releasing the lock!',
          ],
          callout: {
            type: 'WATCH OUT',
            text: 'ALWAYS fire `Observer` callbacks (email/push notifications) **OUTSIDE the `ReentrantLock`** — otherwise a slow notification client holds the auction lock and stalls all incoming bids!',
          },
          scene: {
            hud: [
              { label: 'LOCK SCOPE', value: 'Per-Auction Mutex', status: 'good' },
              { label: 'OBSERVERS', value: 'Fired Outside Lock ✓', status: 'good' },
              { label: 'AUTO-CLOSE', value: 'ScheduledExecutor', status: 'good' },
              { label: 'EXTENSION', value: 'Proxy Auto-Bid', status: 'info' },
            ],
            nodes: [
              { id: 'svc', type: 'uml', x: 165, y: 215, label: 'AuctionService', tone: 'blue', umlFields: ['- auctions: ConcurrentMap', '- scheduler: ScheduledPool'], umlMethods: ['+ createAuction(cfg)', '+ placeBid(aid, u, amt)'] },
              { id: 'auc', type: 'uml', x: 545, y: 120, label: 'Auction', sublabel: 'Per-Item Lock', tone: 'green', umlFields: ['- lock: ReentrantLock', '- highestBid: Bid'], umlMethods: ['+ tryBid(u, amt): BidRes', '+ close(): Winner'] },
              { id: 'obs', type: 'uml', x: 545, y: 315, label: '«interface» AuctionObs', tone: 'purple', umlFields: ['Outbid | Winner Alerts'], umlMethods: ['+ onOutbid(prevUser)'] },
            ],
            edges: [
              { from: 'svc', to: 'auc', label: 'lock + validate', packetColor: 'green', speed: 1.6 },
              { from: 'svc', to: 'obs', label: 'async notify', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'fine-grained lock + async observer', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Proxy Bidding',
          stage: 'TECHNIQUE',
          title: 'Adding Automatic Proxy Bidding Without Breaking Existing Bid Flow',
          body: [
            'Encapsulate bid resolution inside a `BidEvaluationStrategy` (`ManualBidStrategy` vs `ProxyAutoBidStrategy`). When Alice sets secret max `$500` and Bob bids `$300`, `ProxyAutoBidStrategy` atomically resolves the high bid to Alice at `$310` inside the same per-auction critical section!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Separating **Bid Validation & Resolution (Strategy)** from **Auction Storage** lets you add Reserve Prices, Soft-Close Extensions, and Proxy Bidding cleanly (Open/Closed Principle!).',
          },
          scene: {
            hud: [
              { label: 'ALICE MAX', value: '$500 (Secret)', status: 'info' },
              { label: 'BOB BIDS', value: '$300', status: 'warn' },
              { label: 'AUTO-RESOLVE', value: 'Alice Leads @ $310', status: 'good' },
              { label: 'DEADLOCKS', value: 'Zero (1 Lock)', status: 'good' },
            ],
            nodes: [
              { id: 'b', type: 'users', x: 135, y: 215, label: 'Bob ($300)', sublabel: 'Manual Bid', tone: 'amber' },
              { id: 'st', type: 'hex', x: 400, y: 215, label: 'ProxyBidStrategy', sublabel: 'Alice Max=$500 → $310', tone: 'green' },
              { id: 'ob', type: 'users', x: 655, y: 215, label: 'Outbid Alert', sublabel: 'Notify Bob Instant!', tone: 'purple' },
            ],
            edges: [
              { from: 'b', to: 'st', label: 'bid $300', packetColor: 'amber', speed: 1.7 },
              { from: 'st', to: 'ob', label: 'outbid @ $310', packetColor: 'purple', speed: 1.6 },
            ],
            legend: [{ label: 'atomic proxy bid resolution', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Thread-Safe Auction with Async Outbid Observer (Java)',
        codeSnippets: {
          java: `class Auction {
    final String id; final long minIncrement; final Instant endTime;
    private final ReentrantLock lock = new ReentrantLock();
    private volatile boolean closed = false;
    private Bid highestBid;

    public Optional<String> placeBid(String userId, long cents) {
        String outbidUser = null;
        lock.lock();
        try {
            if (closed || Instant.now().isAfter(endTime)) throw new IllegalStateException("Auction ended");
            long minAllowed = highestBid == null ? minIncrement : highestBid.cents() + minIncrement;
            if (cents < minAllowed) throw new IllegalArgumentException("Bid too low; need >= " + minAllowed);
            if (highestBid != null && !highestBid.userId().equals(userId)) outbidUser = highestBid.userId();
            highestBid = new Bid(userId, cents, Instant.now());
        } finally { lock.unlock(); }
        return Optional.ofNullable(outbidUser); // Caller notifies OUTSIDE lock!
    }
}`,
        },
      },
    },

    {
      id: 'lld-file-system',
      title: 'LLD: In-Memory File System & Composable `find`',
      subtitle: 'Amazon & Microsoft classic: Composite Pattern tree (`File`/`Directory`) + Specification Pattern composable search filters (`AND`/`OR`/`NOT`).',
      duration: '10 min',
      level: 'Beginner',
      companies: ['Amazon', 'Microsoft', 'Google', 'Dropbox'],
      tags: ['file system', 'unix find', 'composite pattern', 'specification pattern', 'trie', 'machine coding'],
      objectives: [
        'Model hierarchical folders & files uniformly via the Composite Pattern (`FsNode`)',
        'Build an infinitely extensible Unix `find` API using the Specification Pattern (`AndFilter`, `OrFilter`, `NotFilter`)',
        'Support O(path_depth) path traversal, symlink cycle protection, and recursive directory size calculation',
      ],
      steps: [
        {
          shortLabel: 'Composite + Spec',
          stage: 'SOLUTION',
          title: 'Composite Tree + Specification Pattern = Zero-Edit Extensible `find()`',
          body: [
            '**Amazon’s famous "Design Linux `find` command" LLD question**: Requirements start simple ("find all `.xml` files > 5 MB"), then the interviewer adds: "Now find files matching `(ext == .log OR size > 10MB) AND NOT hidden`!"',
            '**Winning Design**: 1) **Composite Pattern** (`FsNode` implemented by `FileNode` and `DirectoryNode`) so directories nest arbitrarily, 2) **Specification Pattern** (`FileFilter.matches(FileNode)`) with composable boolean combinators **`AndFilter`**, **`OrFilter`**, and **`NotFilter`**!',
          ],
          callout: {
            type: 'INTERVIEW SIGNAL',
            text: 'Using **Composite + Specification Pattern** turns a messy multi-parameter `find(ext, minSize, maxSize, nameRegex...)` method into crystal-clear OCP-compliant composable predicates!',
          },
          scene: {
            hud: [
              { label: 'TREE PATTERN', value: 'Composite (FsNode)', status: 'good' },
              { label: 'QUERY PATTERN', value: 'Specification (AND/OR)', status: 'good' },
              { label: 'CYCLE GUARD', value: 'Visited Set (Symlink)', status: 'info' },
              { label: 'OCP EXTEND', value: '1 Class per New Rule', status: 'good' },
            ],
            nodes: [
              { id: 'fs', type: 'uml', x: 160, y: 215, label: '«interface» FsNode', sublabel: 'Composite', tone: 'blue', umlFields: ['FileNode | DirectoryNode'], umlMethods: ['+ name(): String', '+ sizeBytes(): long'] },
              { id: 'sp', type: 'uml', x: 545, y: 120, label: '«interface» FileSpec', sublabel: 'Specification', tone: 'green', umlFields: ['ExtSpec · MinSizeSpec'], umlMethods: ['+ matches(File): bool'] },
              { id: 'comb', type: 'uml', x: 545, y: 315, label: 'AndSpec / OrSpec / Not', tone: 'purple', umlFields: ['- specs: List<FileSpec>'], umlMethods: ['+ matches(File): bool'] },
            ],
            edges: [
              { from: 'fs', to: 'sp', label: 'DFS visit files', packetColor: 'green', speed: 1.7 },
              { from: 'sp', to: 'comb', label: 'compose trees', packetColor: 'purple', speed: 1.8 },
            ],
            legend: [{ label: 'Composite + Specification search', tone: 'green' }],
          },
        },
        {
          shortLabel: 'Scale & Symlinks',
          stage: 'TECHNIQUE',
          title: 'Streaming Lazy Iterator, Symlink Cycle Prevention & Permissions',
          body: [
            'What if `/var` holds 10 Million files? Don’t return a giant `List<FileNode>` that OOMs RAM — return a lazy **`Iterator<FileNode>` / Stream** (BFS/DFS generator)! Track visited `inode` IDs in a `Set` to avoid infinite loops on circular symlinks, and wrap nodes with a **Permission Proxy** (`rwx`)!',
          ],
          callout: {
            type: 'KEY IDEA',
            text: 'Combining **Composite + Specification + Lazy Iterator + Symlink Visited Set** answers EVERY follow-up an Amazon L5/L6 or Microsoft L62 interviewer can throw at this problem!',
          },
          scene: {
            hud: [
              { label: '10M FILES RAM', value: 'O(Depth) Iterator', status: 'good' },
              { label: 'SYMLINK LOOPS', value: 'Visited Inode Set', status: 'good' },
              { label: 'PERMISSIONS', value: 'rwx Proxy Check', status: 'info' },
              { label: 'CONCURRENCY', value: 'ReadWriteLock/Dir', status: 'good' },
            ],
            nodes: [
              { id: 'd', type: 'hex', x: 145, y: 215, label: 'Lazy DFS Iterator', sublabel: 'Yields 1 File / Step', tone: 'green' },
              { id: 'in', type: 'cache', x: 415, y: 215, label: 'Visited Inodes', sublabel: 'Blocks Symlink Loops', tone: 'amber' },
              { id: 'out', type: 'users', x: 660, y: 215, label: 'Matched Stream', sublabel: 'O(1) Memory Output', tone: 'purple' },
            ],
            edges: [
              { from: 'd', to: 'in', label: 'check inode', packetColor: 'amber', speed: 1.6 },
              { from: 'in', to: 'out', label: 'yield match', packetColor: 'purple', speed: 1.6 },
            ],
            legend: [{ label: 'streaming cycle-safe traversal', tone: 'green' }],
          },
        },
      ],
      deepDive: {
        codeTitle: 'Composite FileSystem + Specification Pattern `find()` (Java & Python)',
        codeSnippets: {
          java: `interface FileSpec {
    boolean matches(FileNode file);
    default FileSpec and(FileSpec other) { return f -> this.matches(f) && other.matches(f); }
    default FileSpec or(FileSpec other)  { return f -> this.matches(f) || other.matches(f); }
    default FileSpec not()               { return f -> !this.matches(f); }
}

record MinSizeSpec(long minBytes) implements FileSpec {
    public boolean matches(FileNode f) { return f.sizeBytes() >= minBytes; }
}
record ExtensionSpec(String ext) implements FileSpec {
    public boolean matches(FileNode f) { return f.name().endsWith(ext); }
}

// Usage — infinitely extensible without modifying DirectoryNode!
FileSpec query = new ExtensionSpec(".log").and(new MinSizeSpec(5_000_000));
List<FileNode> results = FileFinder.find(rootDir, query);`,
          python: `from abc import ABC, abstractmethod

class FileSpec(ABC):
    @abstractmethod
    def matches(self, f) -> bool: ...
    def __and__(self, other): return AndSpec(self, other)
    def __or__(self, other):  return OrSpec(self, other)

class AndSpec(FileSpec):
    def __init__(self, a, b): self.a, self.b = a, b
    def matches(self, f): return self.a.matches(f) and self.b.matches(f)

class MinSizeSpec(FileSpec):
    def __init__(self, min_bytes: int): self.min_bytes = min_bytes
    def matches(self, f): return f.size >= self.min_bytes

class ExtSpec(FileSpec):
    def __init__(self, ext: str): self.ext = ext
    def matches(self, f): return f.name.endswith(self.ext)

# Lazy generator find() — O(depth) RAM even on 10M files!
def find(directory, spec: FileSpec):
    for node in directory.children.values():
        if node.is_dir: yield from find(node, spec)
        elif spec.matches(node): yield node`,
        },
      },
    },
  ],
};
