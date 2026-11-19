// Complete Catalog of ALL 23 Gang of Four (GoF) Design Patterns + 5 SOLID Bad-vs-Good Code Refactors

export const SOLID_PRINCIPLES = [
  {
    letter: 'S',
    name: 'Single Responsibility Principle (SRP)',
    tagline: 'A class should have one, and only one, reason to change (one actor/stakeholder).',
    badCode: `class Invoice {
  calculateTotal() { /* tax math */ }
  saveToPostgres() { /* SQL query */ } // Coupling to DB!
  sendEmailReceipt() { /* SMTP call */ } // Coupling to Email!
}`,
    goodCode: `class Invoice { calculateTotal() { /* pure domain math */ } }
class InvoiceRepository { save(inv) { /* Postgres */ } }
class InvoiceNotifier { sendReceipt(inv) { /* Email/SES */ } }`,
    trap: 'SRP does NOT mean "1 method per class." Cohesive operations owned by the same business domain belong together!',
  },
  {
    letter: 'O',
    name: 'Open / Closed Principle (OCP)',
    tagline: 'Open for extension, closed for modification — add new behavior via polymorphism, not giant if/else chains.',
    badCode: `double discount(String tier, double amt) {
  if (tier.equals("GOLD")) return amt * 0.10;
  else if (tier.equals("PLATINUM")) return amt * 0.20;
  // Must edit & retest this method for every new tier!
  return 0;
}`,
    goodCode: `interface DiscountPolicy { double apply(double amt); }
class GoldDiscount implements DiscountPolicy {
  public double apply(double amt) { return amt * 0.10; }
}
// Adding CorporateDiscount touches ZERO existing code!`,
    trap: 'Use Strategy / Template Method / Decorator to achieve OCP without premature over-abstraction.',
  },
  {
    letter: 'L',
    name: 'Liskov Substitution Principle (LSP)',
    tagline: 'Subtypes must be drop-in replaceable for their base type without breaking caller invariants.',
    badCode: `class Bird { void fly() {} }
class Penguin extends Bird {
  void fly() { throw new UnsupportedOperationException(); } // Breaks callers!
}`,
    goodCode: `interface Bird { void eat(); }
interface FlyingBird extends Bird { void fly(); }
class Eagle implements FlyingBird { /* eat + fly */ }
class Penguin implements Bird { /* eat + swim — no broken fly()! */ }`,
    trap: 'Classic interview example: `Square extends Rectangle` breaks `setWidth(4); setHeight(5); assert(area == 20)`! Favor composition or separate interfaces.',
  },
  {
    letter: 'I',
    name: 'Interface Segregation Principle (ISP)',
    tagline: 'Clients should never be forced to implement fat interfaces with methods they do not use.',
    badCode: `interface PaymentProcessor {
  void processCard();
  void processUPI();
  void refundCrypto(); // Card-only gateway forced to stub!
}`,
    goodCode: `interface CardPayable { void chargeCard(Money amt); }
interface UpiPayable { void chargeUpi(String vpa, Money amt); }
interface Refundable { void refund(String txId); }`,
    trap: 'Keep interfaces lean and role-focused (e.g., Java `Comparable`, `Closeable`, Go `io.Reader` / `io.Writer`).',
  },
  {
    letter: 'D',
    name: 'Dependency Inversion Principle (DIP)',
    tagline: 'High-level business logic should depend on abstractions (interfaces), never concrete DB/HTTP drivers.',
    badCode: `class OrderService {
  private final MySqlOrderRepo repo = new MySqlOrderRepo(); // Hardwired!
  private final StripeClient stripe = new StripeClient();   // Untestable!
}`,
    goodCode: `class OrderService {
  private final OrderRepository repo;
  private final PaymentGateway gateway;
  // Constructor Injection — swap Postgres/Dynamo or Mock in unit tests!
  OrderService(OrderRepository r, PaymentGateway g) { this.repo = r; this.gateway = g; }
}`,
    trap: 'DIP is the foundation of Clean Architecture, Hexagonal Ports & Adapters, and effortless unit mocking.',
  },
];

export const GOF_PATTERNS_23 = [
  // CREATIONAL (5)
  {
    id: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    intent: 'Guarantee a class has exactly one instance and provide a global point of access.',
    realWorld: 'LogManager, ConfigRegistry, ConnectionPool, Spring @Bean singleton scope',
    whenToUse: 'Shared stateless/coordinated resource (Logger, Metrics Registry). Prefer Dependency Injection over global static calls when possible.',
    antiPattern: 'Hidden global mutable state makes unit tests flaky; always use Double-Checked Locking (`volatile`) or Bill Pugh Holder / Enum for thread safety!',
    code: `public final class LogManager {
  private LogManager() {}
  private static class Holder { // Thread-safe lazy init (Bill Pugh)
    static final LogManager INSTANCE = new LogManager();
  }
  public static LogManager getInstance() { return Holder.INSTANCE; }
}`,
  },
  {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    intent: 'Define an interface for creating an object, letting subclasses or registries decide which concrete class to instantiate.',
    realWorld: 'NotificationFactory (Email/SMS/Push), VehicleFactory in Parking Lot, `Calendar.getInstance()`',
    whenToUse: 'Decouple creation logic from callers when object type depends on runtime config or request payload.',
    antiPattern: 'Don’t leave a giant `switch` inside business services; register factories in a `Map<Type, Supplier<T>>`.',
    code: `interface Notifier { void send(String msg); }
class NotifierFactory {
  private static final Map<String, Supplier<Notifier>> REG = Map.of(
    "SMS", SmsNotifier::new, "EMAIL", EmailNotifier::new
  );
  static Notifier create(String ch) { return REG.get(ch).get(); }
}`,
  },
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    intent: 'Create families of related or dependent objects without specifying concrete classes.',
    realWorld: 'Multi-cloud SDK (AzureFactory vs AwsFactory → BlobStore + Queue + KMS), UI Light/Dark Theme kit',
    whenToUse: 'When products MUST match as a consistent family (e.g., AWS S3 + SQS + KMS together, never mismatched).',
    antiPattern: 'Adding a new product type requires updating every concrete factory interface.',
    code: `interface CloudFactory {
  BlobStore createBlobStore();
  MessageQueue createQueue();
}
class AzureCloudFactory implements CloudFactory {
  public BlobStore createBlobStore() { return new AzureBlobStore(); }
  public MessageQueue createQueue() { return new ServiceBusQueue(); }
}`,
  },
  {
    id: 'builder',
    name: 'Builder',
    category: 'Creational',
    intent: 'Construct complex immutable objects step-by-step with readable named parameters and validation.',
    realWorld: '`HttpRequest.newBuilder()`, `StringBuilder`, Lombok `@Builder`, SQL QueryBuilder',
    whenToUse: 'Constructors with 4+ optional parameters (eliminates telescoping constructors & boolean confusion).',
    antiPattern: 'Overkill for simple 2-field DTOs/records.',
    code: `final class HttpConfig {
  final int timeoutMs; final int retries; final boolean tls;
  private HttpConfig(Builder b) { timeoutMs = b.timeoutMs; retries = b.retries; tls = b.tls; }
  static class Builder {
    int timeoutMs = 2000, retries = 3; boolean tls = true;
    Builder timeout(int ms) { this.timeoutMs = ms; return this; }
    Builder retries(int r) { this.retries = r; return this; }
    HttpConfig build() { return new HttpConfig(this); }
  }
}`,
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    intent: 'Create new objects by cloning an existing pre-initialized prototype instance.',
    realWorld: 'Game entity templates (Chess board snapshot for AI minimax), Document templates, JS `Object.create`',
    whenToUse: 'Object creation is expensive (DB fetch, heavy parsing) and copies differ by minor tweaks.',
    antiPattern: 'Shallow copy bugs sharing mutable nested lists across clones — always implement explicit Deep Copy!',
    code: `interface CloneableDoc { CloneableDoc deepCopy(); }
class ReportTemplate implements CloneableDoc {
  List<String> sections;
  public ReportTemplate deepCopy() {
    return new ReportTemplate(new ArrayList<>(this.sections));
  }
}`,
  },

  // STRUCTURAL (7)
  {
    id: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    intent: 'Convert the interface of a third-party or legacy class into the interface your domain expects.',
    realWorld: 'StripePaymentAdapter implementing your `PaymentGateway`, `Arrays.asList()`, JDBC drivers',
    whenToUse: 'Integrating external SDKs (Stripe, Twilio, Razorpay) without leaking their proprietary types into core code.',
    antiPattern: 'Don’t hide massive slow network retries silently inside a thin adapter without clear timeout semantics.',
    code: `interface PaymentGateway { Receipt charge(long cents, String idemKey); }
class StripeAdapter implements PaymentGateway {
  private final StripeSdk sdk;
  public Receipt charge(long cents, String key) {
    var res = sdk.createCharge(cents / 100.0, key);
    return new Receipt(res.id(), res.ok());
  }
}`,
  },
  {
    id: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    intent: 'Decouple an abstraction from its implementation so both can vary independently (avoids N×M subclass explosion).',
    realWorld: 'NotificationType (Urgent/Digest) × Channel (Email/SMS/Push); Shapes × Renderers (OpenGL/DirectX)',
    whenToUse: 'When two orthogonal dimensions grow independently (N abstractions × M implementations → N + M classes!).',
    antiPattern: 'Unnecessary indirection if only one dimension varies.',
    code: `abstract class Notification {
  protected final DeliveryChannel channel; // Bridge!
  Notification(DeliveryChannel ch) { this.channel = ch; }
  abstract void send(String msg);
}
class UrgentAlert extends Notification {
  UrgentAlert(DeliveryChannel ch) { super(ch); }
  void send(String msg) { channel.deliver("[P0] " + msg); }
}`,
  },
  {
    id: 'composite',
    name: 'Composite',
    category: 'Structural',
    intent: 'Compose objects into tree structures so callers treat individual leaves and nested groups uniformly.',
    realWorld: 'File System (`File` & `Folder`), UI DOM Trees, Organization Charts, Permission Groups',
    whenToUse: 'Recursive part-whole hierarchies where `size()`, `render()`, or `cost()` propagates down trees.',
    antiPattern: 'Avoid forcing leaf nodes to throw exceptions on `addChild()` — keep child mutation on the Composite class.',
    code: `interface FsNode { long sizeBytes(); }
class FileLeaf implements FsNode {
  long bytes; public long sizeBytes() { return bytes; }
}
class Directory implements FsNode {
  List<FsNode> children = new ArrayList<>();
  public long sizeBytes() { return children.stream().mapToLong(FsNode::sizeBytes).sum(); }
}`,
  },
  {
    id: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    intent: 'Attach additional responsibilities to an object dynamically by wrapping it in layers implementing the same interface.',
    realWorld: 'Java `BufferedInputStream(GzipInputStream(FileInputStream))`, HTTP Middleware (Auth + Logging + Retry + Cache), Coffee/Pizza toppings',
    whenToUse: 'Stacking composable cross-cutting concerns dynamically at runtime instead of static subclass permutations.',
    antiPattern: 'Deeply nested 10-layer decorator chains can obscure stack traces; order of wrapping matters (Cache outside Auth = security bug!).',
    code: `interface DataSource { String read(String key); }
class CachingDecorator implements DataSource {
  private final DataSource next; private final Map<String, String> cache = new ConcurrentHashMap<>();
  CachingDecorator(DataSource next) { this.next = next; }
  public String read(String k) { return cache.computeIfAbsent(k, next::read); }
}`,
  },
  {
    id: 'facade',
    name: 'Facade',
    category: 'Structural',
    intent: 'Provide a clean, unified high-level entry point over a complex subsystem of collaborating classes.',
    realWorld: '`BookingFacade.bookTicket()` coordinating SeatLock + Payment + Ticket + Notification; `ParkingLotSystem`',
    whenToUse: 'Every LLD interview entry controller! Hides multi-step orchestration behind simple domain methods.',
    antiPattern: 'Don’t turn a Facade into a 2,000-line God Class — it should ONLY coordinate cohesive services, not own their logic.',
    code: `class CheckoutFacade {
  void placeOrder(Cart c) {
    inventory.reserve(c);
    payments.charge(c.total(), c.idemKey());
    notifications.sendConfirmation(c.userId());
  }
}`,
  },
  {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    intent: 'Minimize RAM usage by sharing immutable intrinsic state across millions of fine-grained objects.',
    realWorld: 'Text editor glyph fonts, Game map tree textures, Java `Integer.valueOf(-128..127)` & String Pool',
    whenToUse: 'Millions of objects causing OOM where 90% of fields (icon, font, color) are shared and read-only.',
    antiPattern: 'Shared intrinsic state MUST be strictly immutable — mutating it corrupts every referencing object!',
    code: `class PieceSpriteFactory {
  private static final Map<String, Sprite> POOL = new ConcurrentHashMap<>();
  static Sprite get(String kind) {
    return POOL.computeIfAbsent(kind, Sprite::loadHeavyMesh);
  }
}`,
  },
  {
    id: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    intent: 'Provide a surrogate placeholder controlling access to another object (lazy init, auth check, remote RPC, rate limit).',
    realWorld: 'Spring `@Transactional` dynamic proxy, gRPC client stub, Protection Proxy (RBAC), Virtual Lazy Image Proxy',
    whenToUse: 'Enforcing access control, lazy heavy loading, caching, or remote RPC marshaling transparently.',
    antiPattern: 'Distinguish Proxy (controls access to an object) vs Decorator (enhances/adds behavior).',
    code: `class AuthRepoProxy implements DocumentRepo {
  private final DocumentRepo real;
  public Doc get(User u, String id) {
    if (!u.canRead(id)) throw new SecurityException("403 Forbidden");
    return real.get(u, id);
  }
}`,
  },

  // BEHAVIORAL (11)
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    intent: 'Encapsulate a family of interchangeable algorithms behind an interface so they swap cleanly at runtime.',
    realWorld: 'Parking Pricing (Hourly/Weekend/EV), Cache Eviction (LRU/LFU), Elevator Dispatch (SCAN/LOOK), Rate Limiter algorithms',
    whenToUse: 'THE #1 most-used pattern in Big Tech LLD interviews! Anytime requirements say "we may add new pricing/matching/eviction rules later."',
    antiPattern: 'Don’t leak algorithm-specific internals back into the context class.',
    code: `interface PricingStrategy { long calculateCents(Duration d); }
class HourlyPricing implements PricingStrategy {
  public long calculateCents(Duration d) { return Math.max(1, d.toHours()) * 500; }
}
class FlatWeekendPricing implements PricingStrategy {
  public long calculateCents(Duration d) { return 1500; }
}`,
  },
  {
    id: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    intent: 'Define a one-to-many subscription so when a subject changes state, all registered listeners are notified automatically.',
    realWorld: 'Stock price alerts, Elevator floor displays, Kafka/EventEmitter Pub-Sub, Reactive UI hooks',
    whenToUse: 'Decoupling event producers from multiple independent reactors (Email + Analytics + Display boards).',
    antiPattern: 'Memory leaks if listeners forget to unsubscribe (lapsed listener problem) and slow synchronous observers blocking the publisher!',
    code: `interface PriceListener { void onPriceDrop(String sku, int cents); }
class Product {
  private final List<PriceListener> subs = new CopyOnWriteArrayList<>();
  void subscribe(PriceListener l) { subs.add(l); }
  void setPrice(int c) { subs.forEach(s -> s.onPriceDrop(sku, c)); }
}`,
  },
  {
    id: 'command',
    name: 'Command',
    category: 'Behavioral',
    intent: 'Encapsulate a request as an object, enabling Undo/Redo stacks, queuing, audit logging, and macro replay.',
    realWorld: 'Chess/Text Editor Undo-Redo, Transaction job queues, Smart Home remote buttons',
    whenToUse: 'Any LLD prompt mentioning **Undo/Redo**, **Move History**, or **Deferred/Queued Execution**.',
    antiPattern: 'Commands must capture enough pre-execution snapshot state to execute `undo()` cleanly.',
    code: `interface Command { void execute(); void undo(); }
class MovePieceCmd implements Command {
  private final Board b; private final Move m; private Piece captured;
  public void execute() { captured = b.apply(m); }
  public void undo() { b.revert(m, captured); }
}`,
  },
  {
    id: 'state',
    name: 'State',
    category: 'Behavioral',
    intent: 'Allow an object to alter its behavior completely when its internal state changes — replacing nested `switch(state)` blocks.',
    realWorld: 'Vending Machine (Idle→HasMoney→Dispensing), Order Lifecycle, Circuit Breaker (Closed→Open→HalfOpen), Elevator states',
    whenToUse: 'Entities with 3+ well-defined lifecycle states where illegal transitions must be rejected cleanly.',
    antiPattern: 'Keep state transitions explicit and documented so circular transitions are easy to audit.',
    code: `interface VendingState {
  void insertCoin(VendingMachine m, int cents);
  void selectItem(VendingMachine m, String code);
}
class IdleState implements VendingState {
  public void insertCoin(VendingMachine m, int c) { m.addBalance(c); m.setState(m.hasMoneyState); }
  public void selectItem(VendingMachine m, String code) { throw new IllegalStateException("Insert coin first"); }
}`,
  },
  {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    intent: 'Pass a request along a chain of handlers where each handler processes it, enriches it, or forwards it to the next.',
    realWorld: 'Log4j Level Filters (DEBUG→INFO→ERROR), ATM Cash Dispenser ($100→$50→$20), Express/Netty/Spring Servlet Middleware',
    whenToUse: 'Multi-stage validation pipelines, tiered approval workflows, or ATM denomination breakdown.',
    antiPattern: 'Always include a terminal fallback handler so unhandled requests never silently vanish.',
    code: `abstract class CashDispenser {
  protected CashDispenser next;
  CashDispenser link(CashDispenser n) { this.next = n; return n; }
  abstract void dispense(int amount);
}`,
  },
  {
    id: 'template-method',
    name: 'Template Method',
    category: 'Behavioral',
    intent: 'Define the invariant skeleton of an algorithm in a base class while subclasses override specific plug-in steps.',
    realWorld: 'ETL Data Parser (open→parse→validate→close), JUnit lifecycle hooks, React/Spring base controllers',
    whenToUse: 'Multiple flows share the exact same ordered sequence (validate → execute → audit) with custom middle steps.',
    antiPattern: 'Prefer Composition (Strategy) over inheritance if steps need to change dynamically at runtime.',
    code: `abstract class PaymentFlow {
  public final void execute(Order o) { // Fixed skeleton!
    validate(o); debit(o); recordLedger(o); notifyUser(o);
  }
  protected abstract void debit(Order o); // Hook overridden by UPI/Card
}`,
  },
  {
    id: 'iterator',
    name: 'Iterator',
    category: 'Behavioral',
    intent: 'Traverse elements of an aggregate collection sequentially without exposing its underlying array/tree/graph storage.',
    realWorld: 'Java `Iterator<T>`, Python generators (`yield`), Database Cursor / Paginated API Stream',
    whenToUse: 'Uniform traversal across custom collections (e.g., Paginated S3 Iterator, BST In-Order Iterator).',
    antiPattern: 'Watch out for `ConcurrentModificationException` when mutating collections mid-iteration.',
    code: `class PaginatedCursor<T> implements Iterator<T> {
  private Deque<T> buf = new ArrayDeque<>(); private String nextToken;
  public boolean hasNext() { if (buf.isEmpty() && nextToken != null) fetchPage(); return !buf.isEmpty(); }
  public T next() { return buf.poll(); }
}`,
  },
  {
    id: 'mediator',
    name: 'Mediator',
    category: 'Behavioral',
    intent: 'Centralize complex many-to-many communication between colleagues inside one coordinator object.',
    realWorld: 'Air Traffic Control Tower, Chat Room Server, Auction House, Elevator Dispatcher',
    whenToUse: 'Preventing O(N²) spaghetti coupling where every component holds references to every other component.',
    antiPattern: 'Guard against the Mediator bloating into a monolithic God Object.',
    code: `class ChatRoomMediator {
  private final Map<String, User> users = new ConcurrentHashMap<>();
  void broadcast(String from, String msg) {
    users.values().stream().filter(u -> !u.id.equals(from)).forEach(u -> u.receive(from, msg));
  }
}`,
  },
  {
    id: 'memento',
    name: 'Memento',
    category: 'Behavioral',
    intent: 'Capture and restore an object’s internal state snapshot cleanly without violating its encapsulation.',
    realWorld: 'Text Editor / IDE checkpoints, Game Save Files, Database Savepoints, Document Version History',
    whenToUse: 'Full-state rollback checkpoints where Command-level inverse math is too complex.',
    antiPattern: 'Cloning huge documents on every keystroke eats RAM — store diffs or bound history ring buffer size!',
    code: `record EditorMemento(String content, int cursor) {}
class TextEditor {
  private String content = ""; private int cursor = 0;
  EditorMemento save() { return new EditorMemento(content, cursor); }
  void restore(EditorMemento m) { content = m.content(); cursor = m.cursor(); }
}`,
  },
  {
    id: 'visitor',
    name: 'Visitor',
    category: 'Behavioral',
    intent: 'Add new operations across a stable hierarchy of element types via Double Dispatch without modifying the element classes.',
    realWorld: 'Compiler AST passes (TypeCheckVisitor, CodeGenVisitor), Tax/Shipping calculators on Cart items, JSON/XML Exporters',
    whenToUse: 'When the set of element types is stable (e.g., AST nodes) but you frequently add new operations over them.',
    antiPattern: 'Painful if you constantly add NEW element subclasses (every Visitor interface must change).',
    code: `interface Shape { void accept(ShapeVisitor v); }
class Circle implements Shape { public void accept(ShapeVisitor v) { v.visitCircle(this); } }
interface ShapeVisitor { void visitCircle(Circle c); void visitRect(Rect r); }`,
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioral',
    intent: 'Represent a domain grammar as an AST of expression objects and evaluate sentences recursively.',
    realWorld: 'Feature Flag Rule Engines (`country == "IN" AND tier == "PRO"`), SQL WHERE evaluators, Regex engines',
    whenToUse: 'Lightweight rule engines, search filter DSLs, and ABAC policy evaluators.',
    antiPattern: 'For large complex languages, use a proper parser generator (ANTLR) instead of hand-coded Interpreter trees.',
    code: `interface RuleExpr { boolean eval(Map<String, String> ctx); }
class AndExpr implements RuleExpr {
  RuleExpr left, right;
  public boolean eval(Map<String, String> c) { return left.eval(c) && right.eval(c); }
}`,
  },
];
