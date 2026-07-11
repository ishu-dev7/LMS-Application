# .NET Framework — Complete Course with Interview Prep

The .NET Framework is Microsoft's classic Windows application platform (versions 1.0 → 4.8.x). Even with modern .NET taking over new development, an enormous amount of enterprise code runs on the Framework, and interviews still probe its fundamentals — CLR, memory, and the C# language itself — because they carry over to .NET Core unchanged.

**Who this course is for:** developers preparing for .NET roles, or anyone maintaining legacy Windows applications. Modern cross-platform development is covered in the companion **.NET Core / Modern .NET** course.

## 1. Platform Foundations — CLR, IL & Assemblies

### 1.1 What the CLR actually does

The **Common Language Runtime (CLR)** is the virtual machine that runs all .NET code. When you build a C# project, the compiler does *not* produce machine code — it produces **IL (Intermediate Language)** packaged into an **assembly** (.dll or .exe). At runtime the CLR's **JIT (Just-In-Time) compiler** translates IL into native machine code, method by method, the first time each method is called.

What the CLR provides on top of execution:

- **Memory management** — automatic allocation and garbage collection (Module 3)
- **Type safety** — code can't reinterpret memory arbitrarily; casts are checked
- **Exception handling** — a unified try/catch/finally model across languages
- **Security & isolation** — AppDomains (Framework-era isolation boundaries)
- **Interop** — P/Invoke and COM interop to call native code

Because every .NET language (C#, VB.NET, F#) compiles to the same IL and shares the **CTS (Common Type System)**, a VB.NET class can inherit from a C# class without either knowing the difference.

### 1.2 Assemblies, the GAC and versioning

An **assembly** is the unit of deployment and versioning: IL code + **metadata** (full descriptions of every type, usable via Reflection) + a **manifest** (name, version, culture, referenced assemblies).

- **Private assemblies** live in the application folder.
- **Shared assemblies** go in the **GAC (Global Assembly Cache)** and must be **strong-named** (signed with a key pair so the full name includes name + version + culture + public key token).
- **Version conflicts** ("DLL hell") are managed via binding redirects in app.config — a classic maintenance pain interviewers like to ask about.

### 1.3 Value types vs reference types — the model everything rests on

- **Value types** (int, double, bool, struct, enum) hold their data directly, typically live on the **stack** (or inline in their containing object), and copy by value.
- **Reference types** (class, string, arrays, delegates) live on the **heap**; variables hold references. Copying a variable copies the reference — both point at the same object.
- **Boxing** wraps a value type into a heap object (`object o = 42;`); **unboxing** extracts it back with a checked cast. Boxing in hot loops is a real performance bug — a favourite interview question because it tests whether you understand the memory model rather than syntax.
- `string` is a reference type but **immutable** — every "modification" makes a new string. This is why `StringBuilder` exists for concatenation loops.

## 2. C# Language Essentials

### 2.1 OOP the C# way

- **Encapsulation:** private fields, public properties (`get; set;` auto-properties compile to a backing field + methods).
- **Inheritance:** single class inheritance, multiple interface implementation. `sealed` blocks further derivation.
- **Polymorphism:** `virtual` on the base method, `override` in the derived class → the runtime picks the derived version via the object's actual type (dynamic dispatch). `new` merely *hides* — the base-typed variable still calls the base method. The virtual/new distinction is one of the most common interview traps.
- **Abstract classes vs interfaces:** an abstract class can hold state and implementation and expresses an *is-a* relationship; an interface (Framework-era: no implementations) expresses a *can-do* capability. If you need shared fields or constructor logic — abstract class; if unrelated types must share a contract — interface.

### 2.2 Delegates, events and lambdas

A **delegate** is a type-safe function pointer — a type describing a method signature; instances reference actual methods, and one delegate can chain several (multicast).

- `Action<T>` (returns void) and `Func<T, TResult>` (returns a value) cover most needs without declaring custom delegate types.
- An **event** is a delegate the outside world can only subscribe to (`+=`/`-=`), not invoke or overwrite — the publisher stays in control. Standard pattern: `event EventHandler<TEventArgs>`.
- **Lambdas** (`x => x * 2`) are inline anonymous methods that make delegates practical. They **close over** outer variables (closures) — capturing the *variable*, not its value at creation time, which is the root of the classic "loop variable in a lambda" bug.

### 2.3 Generics and collections

Generics (`List<T>`, `Dictionary<TKey,TValue>`) give type safety *without* boxing and *without* code duplication — unlike the old non-generic `ArrayList` which stored `object` and boxed every value type it held.

Know the core collections and their complexity: `List<T>` (indexed, O(1) access, O(n) insert-in-middle), `Dictionary<TKey,TValue>` (hash-based, ~O(1) lookup), `HashSet<T>` (membership tests), `Queue<T>`/`Stack<T>`. Constraints (`where T : class, new()`) let generic code actually *do* things with T.

### 2.4 LINQ — querying anything

LINQ (Language Integrated Query) unifies querying over in-memory objects, XML and databases:

```csharp
var topTraders = traders
    .Where(t => t.PnL > 0)
    .OrderByDescending(t => t.PnL)
    .Select(t => new { t.Name, t.PnL })
    .Take(10)
    .ToList();
```

Two things interviewers probe:
- **Deferred execution** — the query above doesn't run until enumerated (`ToList`, `foreach`). Chaining more operators before enumeration composes one pipeline; enumerating twice runs it twice.
- **IEnumerable vs IQueryable** — `IEnumerable<T>` runs in memory; `IQueryable<T>` builds an **expression tree** a provider (like Entity Framework) translates to SQL. Filtering with IEnumerable after loading a whole table = fetching everything then discarding; with IQueryable the WHERE happens in the database.

## 3. Memory, Garbage Collection & Exceptions

### 3.1 How the garbage collector works

The GC automatically frees heap objects no longer reachable from any **root** (stack variables, static fields, CPU registers). The Framework GC is **generational**:

- **Gen 0** — new objects; collected frequently and cheaply. Most objects die young ("generational hypothesis").
- **Gen 1** — survivors of Gen 0; a buffer generation.
- **Gen 2** — long-lived objects; collected rarely, expensively (full GC).
- **LOH (Large Object Heap)** — objects ≥ 85 KB; collected with Gen 2 and historically not compacted → fragmentation.

Collections pause managed threads (workstation vs server GC modes tune this trade-off). You rarely manage memory manually — but you must understand this model to explain memory leaks in a "garbage collected" runtime: leaks in .NET are almost always **reachable-but-unwanted** objects, classically *event handlers never unsubscribed* (the publisher keeps every subscriber alive).

### 3.2 IDisposable and using

The GC handles *memory*, not **unmanaged resources** (file handles, DB connections, sockets). Those need deterministic cleanup:

- Implement `IDisposable.Dispose()`; consumers wrap usage in `using (var conn = new SqlConnection(...)) { ... }` which guarantees `Dispose()` even on exceptions.
- **Finalizers** (`~Class`) are a GC-driven safety net — nondeterministic, costly (the object survives an extra GC cycle), and almost never what you want directly. The full **dispose pattern** (`Dispose(bool disposing)` + `GC.SuppressFinalize`) exists to combine both correctly.
- Forgetting to dispose `SqlConnection` exhausts the connection pool — a production outage every senior .NET interviewer has war stories about.

### 3.3 Exceptions done right

- Catch **specific** exception types; a bare `catch (Exception)` that swallows silently is the cardinal sin.
- `throw;` rethrows preserving the stack trace; `throw ex;` **resets** it — a subtle bug and a stock interview question.
- `finally` always runs — cleanup belongs there or in `using`.
- Exceptions are for *exceptional* flow — not control flow; they're expensive to throw.
- Custom exceptions: derive from `Exception`, add context, keep them serializable (Framework habit).

## 4. ASP.NET & Data Access

### 4.1 ASP.NET Web Forms vs MVC

- **Web Forms** (legacy): page/control model with **ViewState** (page state serialized into a hidden field) and a complex **page lifecycle** (Init → Load → PostBack events → PreRender → Render). Fast to build, hard to test, HTML output you don't fully control. You'll meet it in maintenance work.
- **ASP.NET MVC** separates **Model** (data + logic), **View** (Razor templates), **Controller** (handles requests, returns `ActionResult`). Routing maps URLs to controller actions (`{controller}/{action}/{id}`). Testable, clean HTML, and conceptually the direct ancestor of ASP.NET Core MVC — learn it once, use it in both.
- Request pipeline: **HTTP Modules** (cross-cutting, every request) and **HTTP Handlers** (endpoint for a request type) — the Framework-era ancestors of ASP.NET Core middleware.

### 4.2 State management & the classic web questions

HTTP is stateless; the Framework offers: **Session** (server-side, per user), **Cache** (server-side, shared), **Cookies** (client-side), ViewState (Web Forms, per page), Query strings/hidden fields. Interview staple: *Session vs ViewState vs Cache — where does each live and when do you use it?*

### 4.3 ADO.NET — the metal

Everything data in .NET sits on ADO.NET: `SqlConnection` (pooled — open late, close early), `SqlCommand` (**always parameterized** — string-concatenated SQL is an injection hole and an instant interview fail), `SqlDataReader` (fast, forward-only, connected) vs `DataSet`/`DataAdapter` (in-memory, disconnected). Transactions via `SqlTransaction` or `TransactionScope`.

### 4.4 Entity Framework 6 — the classic ORM

EF6 maps classes to tables so you query with LINQ instead of SQL strings. Key concepts that carry into EF Core: `DbContext` (unit of work) and `DbSet<T>`; change tracking + `SaveChanges()`; **lazy loading** (navigation properties load on first touch — convenient, and the source of the **N+1 query problem**) vs **eager loading** (`Include(...)`); Code First with migrations vs Database First. Know when the ORM is the wrong tool: bulk operations and hot read paths often drop to raw SQL or Dapper.

## 5. Interview Preparation — Questions & Answers

### 5.1 Basic level Q&A

**Q1. What is the difference between .NET Framework and .NET Core?**
.NET Framework is Windows-only, machine-wide installed, and feature-frozen at 4.8 (security fixes only). .NET Core (now just ".NET") is cross-platform, open source, ships side-by-side per app, is significantly faster, and is where all new features go. New development should target modern .NET; the Framework remains for legacy Windows apps, Web Forms, WCF server hosting and full-trust Windows features.

**Q2. What is the CLR and what does it do?**
The Common Language Runtime is .NET's execution engine. It JIT-compiles IL to native code, manages memory via the garbage collector, enforces type safety, handles exceptions, and provides services like reflection and interop. All .NET languages compile to IL and run on the same CLR.

**Q3. What is the difference between value types and reference types?**
Value types (int, struct, enum) contain their data directly and copy by value; reference types (class, string, arrays) live on the heap, and variables hold references — copying a variable gives two references to one object. Assigning a value type to `object` boxes it onto the heap; unboxing casts it back.

**Q4. Why is string immutable, and what is StringBuilder for?**
Every string "change" creates a new string object — immutability makes strings thread-safe, hashable and safely shareable (string interning). Concatenating in a loop therefore allocates O(n²) garbage; `StringBuilder` mutates an internal buffer and builds the final string once.

**Q5. Explain the difference between `==` and `.Equals()`.**
For value types both compare values. For reference types `==` defaults to reference equality (same object), while `.Equals()` can be overridden for value semantics. `string` overloads `==` to compare content — which is why the same operator behaves differently across types. `Object.ReferenceEquals` always checks identity.

**Q6. What are constructors, and what is a static constructor?**
Constructors initialize new instances; they can chain (`: this(...)`, `: base(...)`). A static constructor runs **once per type**, before first use, to initialize static state — it takes no parameters and you never call it directly.

**Q7. What is the difference between `const` and `readonly`?**
`const` is a compile-time constant baked into the caller's IL (change the library, callers keep the old value until recompiled — a classic gotcha). `readonly` is set at declaration or in a constructor and resolved at runtime; `static readonly` is the safe choice for shared constants that might ever change.

**Q8. What is boxing/unboxing and why does it matter?**
Boxing wraps a value type in a heap object; unboxing extracts it. Each box is a heap allocation plus later GC work — in hot paths or large loops (e.g., non-generic collections like ArrayList) it destroys performance. Generics exist largely to eliminate it.

### 5.2 Intermediate level Q&A

**Q9. Explain `virtual`, `override` and `new` on methods.**
`virtual` allows derivation to replace a method; `override` replaces it with dynamic dispatch — a base-typed reference calls the derived version. `new` *hides* instead: which method runs depends on the compile-time type of the reference. If `Animal a = new Dog()` and `Speak()` is virtual/overridden, the dog barks; if hidden with `new`, the animal speaks.

**Q10. Abstract class vs interface — how do you choose?**
Abstract class: shared state, shared implementation, constructor logic, an *is-a* hierarchy — but you spend your single inheritance slot. Interface: a capability contract multiple unrelated types can implement, and a type can implement many. Practical rule: model the noun with an (abstract) class, model capabilities (IDisposable, IComparable) with interfaces.

**Q11. What are delegates and events, and how do they differ?**
A delegate is a type-safe reference to methods (possibly multicast). An event is a delegate exposed with restricted access — outside code can only `+=`/`-=`, not invoke or reassign it. Events implement the publisher/subscriber pattern safely; forgetting to unsubscribe handlers is the classic .NET memory leak because the publisher's delegate keeps subscribers reachable.

**Q12. Explain how the generational garbage collector works.**
New objects allocate in Gen 0, which is collected often and cheaply; survivors promote to Gen 1, then Gen 2 which is collected rarely and expensively. Large objects (≥85 KB) go on the Large Object Heap, collected with Gen 2. The design exploits the fact that most objects die young. Memory "leaks" in .NET are reachable-but-unwanted objects — event subscriptions, static caches, undisposed contexts.

**Q13. What does IDisposable solve if the GC frees memory anyway?**
The GC frees *managed memory* at an unpredictable time. File handles, sockets and DB connections are *unmanaged, scarce* resources needing deterministic release — `Dispose()` (usually via `using`) releases them immediately. Finalizers are only a nondeterministic safety net and delay collection by a GC cycle.

**Q14. What is the difference between `throw` and `throw ex` in a catch block?**
`throw;` rethrows the current exception preserving its original stack trace. `throw ex;` throws it *as if from here*, resetting the stack trace and destroying the debugging trail. Use `throw;`, or wrap in a new exception with the original as `InnerException`.

**Q15. Explain deferred execution in LINQ.**
Query operators build a pipeline but don't execute until enumeration (`foreach`, `ToList`, `Count`). Consequences: the query sees data as it is *at enumeration time*; enumerating twice executes twice (materialize with `ToList` if you need a snapshot); and with IQueryable, the full pipeline composes into one SQL statement instead of many.

**Q16. IEnumerable vs IQueryable — when does the difference bite?**
`IQueryable` carries an expression tree that a provider translates (e.g., to SQL) — filters/sorts/pages run in the database. `IEnumerable` executes in memory — calling `.Where()` after `.AsEnumerable()`/`.ToList()` pulls all rows first. On a 10-million-row table, that's the difference between an index seek and hauling the table over the network.

**Q17. What are generics and what problems do they solve?**
Compile-time type parameters (`List<T>`) give type safety (no casting), performance (no boxing of value types) and reuse (one implementation for all T). Constraints (`where T : IComparable<T>, new()`) let the generic code call members on T. Contrast with pre-generic collections storing `object` — runtime cast errors and boxing everywhere.

### 5.3 Advanced & scenario Q&A

**Q18. How does `async/await` work under the hood (Framework 4.5+)?**
The compiler rewrites an async method into a state machine. At `await`, if the awaited task isn't complete, the method returns to its caller and registers a continuation; when the task completes, the continuation resumes — by default on the captured `SynchronizationContext` (the UI thread in desktop apps, the request context in classic ASP.NET). No thread is blocked while awaiting. `ConfigureAwait(false)` skips context capture in library code for performance and to avoid deadlocks.

**Q19. Why does `task.Result` deadlock in classic ASP.NET or WinForms?**
The blocked thread owns the SynchronizationContext; the awaited task's continuation is queued to run *on that same context*, which can't process it because the thread is blocked waiting for `Result`. Both wait for each other — deadlock. Fixes: async all the way up, or `ConfigureAwait(false)` inside the library code.

**Q20. `lock` — what does it do and what are the rules?**
`lock (obj)` compiles to `Monitor.Enter/Exit` in a try/finally, ensuring one thread at a time in the section. Rules: lock on a **private readonly object**, never on `this`, a `Type`, or a string (all reachable by other code → accidental cross-locking or deadlocks); keep sections small; take multiple locks in a consistent order. Alternatives: `Interlocked` for counters, `SemaphoreSlim` for async code (you can't `await` inside `lock`), `ConcurrentDictionary` and friends for shared collections.

**Q21. What is reflection and what are its costs?**
Reflection reads assembly metadata at runtime — inspect types, discover attributes, invoke members dynamically (`Type.GetType`, `GetMethod`, `Invoke`). It powers serializers, DI containers and ORMs. Costs: much slower than direct calls, no compile-time safety, and it can bypass encapsulation. In hot paths, cache `MethodInfo`/compiled delegates or use compiled expression trees.

**Q22. Describe the ASP.NET MVC request lifecycle.**
Request → URL Routing matches a route → `ControllerFactory` creates the controller (with DI in mature apps) → action selection → **model binding** builds parameters from route/query/form → action filters (`OnActionExecuting`) → the action runs, returns an `ActionResult` → result filters → view rendering (Razor) → response. Cross-cutting concerns live in filters (authorization, logging, exception handling) — the interview follow-up is "where would you put X?"

**Q23. How do you prevent SQL injection and what else is non-negotiable for web security?**
Parameterized queries or an ORM — never string-concatenated SQL (parameters are sent as data, not parsed as SQL). Additionally: encode output to prevent XSS (Razor encodes by default), use anti-forgery tokens for state-changing POSTs (CSRF), store passwords hashed with a slow salted algorithm, and never expose stack traces in production (`customErrors`).

**Q24. Scenario: a legacy Framework web app's memory grows until IIS recycles it. How do you investigate?**
Capture a memory dump (or use PerfView/dotMemory) and look at what's keeping objects alive: typical culprits are static caches without eviction, event handlers never unsubscribed, Session bloat, or undisposed contexts/connections. Compare two dumps over time and diff the object counts by type; the growing type's **GC roots** tell you the leak path. The answer interviewers want: *measure with a dump and root analysis* — not "add GC.Collect()", which treats the symptom and hurts performance.

**Q25. Scenario: an EF6 page issues hundreds of queries for one screen. Diagnose and fix.**
That's the N+1 problem: a lazy-loaded navigation property accessed inside a loop fires one query per row. Confirm with SQL profiling or EF logging. Fixes: eager-load what the screen needs (`Include`), project directly to a DTO (`Select(new {...})`) so only needed columns are fetched in one query, or disable lazy loading for the context. Also check for querying inside loops generally, and add `AsNoTracking()` for read-only lists.
