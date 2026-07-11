# .NET Core / Modern .NET — Complete Course with Interview Prep

.NET Core (since .NET 5, just ".NET") is the cross-platform, open-source successor to the .NET Framework — dramatically faster, container-friendly, and where every new feature lands. This course covers the platform, ASP.NET Core, EF Core and the operational topics (hosting, configuration, deployment) that separate juniors from seniors — ending with a full interview module.

**Prerequisite:** C# language basics (covered in the .NET Framework course Modules 1–3 — the language is the same).

## 1. The Modern .NET Platform

### 1.1 What changed from the Framework — and why it matters

- **Cross-platform:** Windows, Linux, macOS — which is why .NET now runs in Docker containers and on cheap Linux cloud instances.
- **Side-by-side deployment:** apps carry their own runtime version (self-contained) or target an installed one (framework-dependent); no machine-wide runtime that upgrading breaks.
- **Open source & fast release cadence:** yearly releases; even-numbered versions (6, 8) are **LTS** (3-year support), odd (7, 9) are STS (18 months) — a detail interviewers use to check you actually operate this stuff.
- **Performance:** Kestrel + runtime work put ASP.NET Core near the top of the TechEmpower benchmarks — orders of magnitude beyond classic ASP.NET.
- **The CLI:** `dotnet new`, `dotnet build`, `dotnet run`, `dotnet test`, `dotnet publish` — everything scriptable, no Visual Studio required.
- **Gone or replaced:** Web Forms (no successor), WCF *hosting* (→ gRPC / CoreWCF), AppDomains (→ processes/containers), .config XML (→ appsettings.json + the configuration system).

### 1.2 Project structure and the host

Modern csproj files are minimal (SDK-style); `Program.cs` builds a **host** — the container for configuration, logging, DI and the app itself:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();          // register services (DI)
var app = builder.Build();
app.UseAuthentication();                     // compose the middleware pipeline
app.UseAuthorization();
app.MapControllers();                        // map endpoints
app.Run();
```

Those three phases — **register services → compose pipeline → map endpoints** — are the mental model for every ASP.NET Core app.

## 2. ASP.NET Core Fundamentals

### 2.1 Middleware — the request pipeline

Every request flows through an ordered chain of **middleware**; each component can act before and after the rest of the pipeline (`await next()`), or short-circuit (return early — how auth failures and static files work).

**Order matters and is interview gold:** exception handling first, then HTTPS redirection, static files, routing, CORS, authentication (*who are you*), authorization (*are you allowed*), endpoints. Put authorization before authentication and nothing works — a classic debugging question.

Custom middleware is just a class with an `InvokeAsync(HttpContext, RequestDelegate)` — logging, correlation IDs, tenant resolution all live here.

### 2.2 Dependency injection — built in, everywhere

ASP.NET Core is built *around* constructor injection. You register services with a **lifetime** and the container resolves object graphs:

- **Transient** — new instance every resolution. Stateless, cheap services.
- **Scoped** — one instance per HTTP request. The default for `DbContext` — one unit of work per request.
- **Singleton** — one instance for the app's lifetime. Caches, configuration wrappers. Must be thread-safe.

The classic failure: injecting a **scoped** service into a **singleton** — the singleton captures one instance forever (the "captive dependency"); the runtime's scope validation throws in Development to catch it. Resolve scoped services inside a created scope (`IServiceScopeFactory`) from singletons/background services.

### 2.3 Web APIs: controllers, binding, validation

- `[ApiController]` controllers with attribute routing (`[Route("api/orders")]`, `[HttpGet("{id:int}")]`).
- **Model binding** fills parameters from route, query and JSON body; `[FromBody]`, `[FromQuery]` disambiguate.
- **Validation** via data annotations (`[Required]`, `[Range]`) — `[ApiController]` auto-returns 400 with problem details when `ModelState` is invalid.
- Return types: `ActionResult<T>` lets you mix `Ok(dto)`, `NotFound()`, `CreatedAtAction(...)` with typed results.
- **Minimal APIs** (`app.MapGet("/orders/{id}", ...)`) skip controllers for small services — know both styles and that they share the same pipeline underneath.

### 2.4 Configuration, options and environments

Configuration is a layered key-value system: appsettings.json → appsettings.{Environment}.json → user secrets (dev) → **environment variables** → command line, later layers overriding earlier. `ASPNETCORE_ENVIRONMENT` selects Development/Staging/Production behavior.

The **Options pattern** binds config sections to typed classes (`services.Configure<JwtOptions>(config.GetSection("Jwt"))`, inject `IOptions<JwtOptions>`). Secrets never go in appsettings.json — user secrets locally, environment variables or a vault (Azure Key Vault) in production.

### 2.5 Authentication & authorization in practice

- **JWT bearer** for APIs: client sends `Authorization: Bearer <token>`; the middleware validates signature, issuer, audience, expiry and populates `HttpContext.User`.
- **Authorization**: `[Authorize]`, role checks (`[Authorize(Roles = "Admin")]`), and **policy-based** authorization (requirements + handlers) for anything nontrivial.
- Cookie auth for server-rendered apps; ASP.NET Core Identity when you need the full user-management story.

## 3. Entity Framework Core

### 3.1 DbContext, change tracking and the unit of work

`DbContext` tracks every entity it loads; `SaveChanges()` computes the diff and writes it in one transaction — that's the unit-of-work pattern built in. Register per-request (scoped); never share a context across threads or requests.

Reads that don't need tracking should say so: `AsNoTracking()` skips snapshot bookkeeping and is measurably faster for list endpoints.

### 3.2 Loading related data — and the N+1 trap

- **Eager:** `.Include(o => o.Lines).ThenInclude(l => l.Product)` — one (or a few, with `AsSplitQuery()`) queries up front.
- **Explicit:** load on demand via `context.Entry(...)`.
- **Lazy** (opt-in via proxies): tempting, and the source of the N+1 problem — a navigation touched in a loop fires a query per row.
- The senior answer to most read-path questions: **project to DTOs** (`Select(o => new OrderDto{...})`) — fetch exactly the columns the endpoint returns, nothing else, no tracking.

### 3.3 Migrations and schema evolution

Code-first schema lives in migrations: `dotnet ef migrations add AddOrderStatus`, `dotnet ef database update`. Migrations are code — review them, especially destructive ones. Production strategy: generate idempotent SQL scripts (`dotnet ef migrations script --idempotent`) and run them in deployment, rather than auto-migrating at startup from multiple instances. `EnsureCreated()` is for prototypes/tests only — it bypasses migrations entirely.

### 3.4 When EF is the wrong tool

Bulk updates/deletes (row-at-a-time tracking is slow — use `ExecuteUpdate`/`ExecuteDelete` in EF7+, or SQL), hot aggregate-heavy reads (a hand-written query with Dapper is simpler and faster), and reporting. Mixing EF for writes/object graphs with Dapper for flat reads is a normal, defensible architecture — say exactly that in interviews.

## 4. Async, Hosting & Production Concerns

### 4.1 Async all the way

ASP.NET Core has no SynchronizationContext, so the classic deadlock disappears — but blocking (`.Result`, `.Wait()`) still burns thread-pool threads and destroys scalability under load. Rules: async endpoints call async I/O end-to-end; `Task.WhenAll` for independent calls; `CancellationToken` parameters flow from the request so abandoned requests stop doing work; CPU-bound work goes to `Task.Run`, not I/O-bound work.

### 4.2 Background work and hosted services

`IHostedService` / `BackgroundService` run long-lived work inside the app host — queue processors, schedulers, cache warmers. They're singletons: create a scope to use scoped services (DbContext) inside. For serious queues, the answer is an external broker (Azure Service Bus, RabbitMQ) with a hosted consumer.

### 4.3 Logging, health and observability

Structured logging via `ILogger<T>` (`_logger.LogWarning("Order {OrderId} failed", id)` — templates, not string interpolation, so log systems can index the values). Serilog is the common provider. Health checks (`AddHealthChecks().AddDbContextCheck<...>()` + `/health`) feed load balancers and Kubernetes probes.

### 4.4 Deployment shapes

- **Kestrel** is the web server; in production it sits behind a reverse proxy (nginx, IIS) or a cloud load balancer.
- **Docker:** multi-stage build — SDK image builds, tiny ASP.NET runtime image runs. .NET's container story is first-class.
- **Publish modes:** framework-dependent (small, needs runtime) vs self-contained (bigger, zero machine prerequisites); trimming and AOT for size/startup-critical services.

## 5. Interview Preparation — Questions & Answers

### 5.1 Basic level Q&A

**Q1. .NET Core vs .NET Framework — give the decision rules.**
New development → modern .NET: cross-platform, containers, performance, active feature development, side-by-side versioning. Stay on Framework only for Web Forms, WCF server hosting, or Windows-only dependencies that can't be ported. Framework is feature-frozen at 4.8.

**Q2. What is Kestrel?**
The cross-platform, high-performance web server built into ASP.NET Core — every request ultimately hits Kestrel. In production it typically sits behind a reverse proxy (IIS/nginx/load balancer) which handles TLS termination, static caching and hardening.

**Q3. What is middleware and why does its order matter?**
Components chained into the request pipeline; each runs code before/after calling the next, or short-circuits. Order defines semantics: exception handling wraps everything so it must be first; authentication must precede authorization; routing must precede endpoints. Wrong order = auth that never runs or exceptions that never get caught.

**Q4. Explain the three DI lifetimes with a real example of each.**
Transient — new every time (a stateless email formatter). Scoped — one per request (DbContext: one unit of work per request). Singleton — one for the app (an in-memory cache). Follow-up they want: a singleton must never capture a scoped service (captive dependency).

**Q5. How does configuration work in ASP.NET Core?**
Layered providers — appsettings.json, per-environment JSON, user secrets, environment variables, command line — later sources override earlier. Bind sections to typed options classes (Options pattern). Secrets live outside source control: user secrets in dev, env vars/Key Vault in production.

**Q6. What are minimal APIs and when would you choose them?**
Endpoint definitions directly on the app (`app.MapGet(...)`) without controllers — less ceremony, great for microservices and small APIs. Same pipeline, DI, auth underneath. Choose controllers when you want filters, conventions and organization for a large surface.

**Q7. What is the difference between `IEnumerable`, `IQueryable` and `List` in an EF Core query chain?**
`IQueryable` composes an expression tree translated to SQL — filters run in the database. Once you call `AsEnumerable()`/`ToList()`, you have in-memory data; further `Where` runs in memory. Materialize (`ToList`) once, as late as possible, after all filtering/paging.

**Q8. How do you return proper HTTP status codes from a Web API?**
`ActionResult<T>` with helpers: `Ok(dto)` 200, `CreatedAtAction` 201, `NoContent()` 204, `BadRequest` 400, `Unauthorized()` 401, `NotFound()` 404, `Conflict()` 409. `[ApiController]` turns model-validation failures into 400 ProblemDetails automatically.

### 5.2 Intermediate level Q&A

**Q9. Walk through what happens when a request hits an ASP.NET Core API.**
Kestrel accepts it → middleware pipeline runs in order (exception handler, HTTPS, static files, routing selects an endpoint, CORS, authentication populates User, authorization checks policy) → endpoint executes: DI constructs the controller, model binding + validation build parameters, filters run, the action executes (typically async EF/HTTP calls), the result serializes to JSON → response travels back out through the middleware.

**Q10. What is the captive dependency problem?**
A singleton constructor-injecting a scoped/transient service holds that single instance forever — a DbContext captured by a singleton is shared across requests and threads (crashes, data corruption). Fix: inject `IServiceScopeFactory`, create a scope per operation, resolve the scoped service inside. ASP.NET Core's scope validation catches this in Development.

**Q11. `AddDbContext` registers DbContext as scoped. Why scoped, and what breaks if you make it singleton?**
Scoped gives one context — one change tracker, one implicit unit of work — per request, matching web semantics. As a singleton it would be shared across concurrent requests: DbContext is not thread-safe, tracked entities accumulate forever (memory leak), and one request's failure poisons everyone. Transient works but loses identity-map benefits within a request and complicates transactions.

**Q12. How do you handle errors globally in a Web API?**
Exception-handling middleware at the top of the pipeline (`UseExceptionHandler` or custom) that logs and maps exceptions to ProblemDetails responses — domain-specific exceptions to 4xx, unknown to 500 without leaking internals. .NET 8+: `IExceptionHandler`. Filters (`IExceptionFilter`) can do MVC-local handling, but pipeline-level catches everything including non-MVC middleware.

**Q13. JWT authentication — how does it actually work end to end?**
Login endpoint verifies credentials and issues a signed token (claims + expiry, HMAC or RSA signature). The client sends it as a Bearer header on every call. JwtBearer middleware validates signature/issuer/audience/lifetime, builds a `ClaimsPrincipal`, and `[Authorize]` checks it. The server stays stateless — nothing stored per session. Trade-offs to mention: tokens can't be revoked before expiry (hence short lifetimes + refresh tokens), and claims are readable (signed, not encrypted) so no secrets inside.

**Q14. `async/await` in ASP.NET Core — why is it about scalability, not speed?**
An awaited I/O call releases the thread back to the pool; the same thread count can serve far more concurrent requests. The individual request isn't faster — the server survives load. Blocking (`.Result`) holds threads through I/O waits and collapses throughput under concurrency. There's no SynchronizationContext, so continuations resume on any pool thread — the classic deadlock is gone but thread starvation isn't.

**Q15. How do migrations work in a team and in production?**
Each schema change = a migration committed with the code that needs it. Team: merge conflicts in the model snapshot are resolved by re-scaffolding; migrations apply in order. Production: generate an idempotent script and run it as a deployment step (or a dedicated migration job) — not `Database.Migrate()` racing from multiple app instances. Destructive migrations get reviewed like any dangerous code.

**Q16. What's the difference between `IOptions<T>`, `IOptionsSnapshot<T>` and `IOptionsMonitor<T>`?**
`IOptions<T>`: computed once, singleton-safe, no reload. `IOptionsSnapshot<T>`: scoped, re-evaluated per request — picks up config changes between requests, can't be injected into singletons. `IOptionsMonitor<T>`: singleton-safe with change notifications (`OnChange`) — for long-lived services reacting to config reloads.

### 5.3 Advanced & scenario Q&A

**Q17. Scenario: an API endpoint is slow under load but fast alone. Where do you look?**
Classic signatures: (1) blocking async (`.Result`) causing thread-pool starvation — check thread counts; (2) connection exhaustion — DbContexts/HttpClients not disposed or `new HttpClient()` per call (socket exhaustion → use `IHttpClientFactory`); (3) N+1 queries amplifying under concurrency; (4) missing `AsNoTracking` + huge result sets; (5) lock contention on a singleton. Measure first: Application Insights/dotnet-counters, then a trace (dotnet-trace) — say *measure, then fix*, not a list of guesses applied blindly.

**Q18. How would you design resilience for outbound HTTP calls?**
`IHttpClientFactory` (pooled handlers, no socket exhaustion) + Polly policies: timeout per try, retry with exponential backoff and jitter *only for idempotent/transient failures*, circuit breaker so a dead dependency fails fast instead of queueing threads, and a fallback where the product allows. Set an overall budget (outer timeout/cancellation) so retries never exceed the caller's patience.

**Q19. `BackgroundService` needs a DbContext. Show the pattern and explain why.**
BackgroundService is a singleton; DbContext is scoped. Inject `IServiceScopeFactory`, and per iteration: `using var scope = _scopeFactory.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();` — a fresh unit of work each loop, disposed deterministically. Also: respect the `stoppingToken`, catch-and-log inside the loop so one failure doesn't kill the service.

**Q20. How do you make an ASP.NET Core app horizontally scalable (multiple instances)?**
Remove instance state: no in-memory session (use Redis/distributed cache), data protection keys shared (blob/Redis) so auth cookies/antiforgery work across instances, background jobs coordinated (leader election or an external queue) so they don't run N times, database migrations run once in deployment — plus health checks for the load balancer and structured centralized logging with correlation IDs.

**Q21. gRPC vs REST in the .NET world — when each?**
gRPC: contract-first (protobuf), binary, HTTP/2 streaming, ~an order of magnitude less overhead — ideal service-to-service inside your perimeter, or high-throughput streaming. REST/JSON: universal clients, browsers, human-debuggable, caching/CDN friendly — the public API default. Common architecture: REST at the edge, gRPC between services. (Also the honest note: browser gRPC needs gRPC-Web.)

**Q22. What do records, `IAsyncEnumerable`, and spans buy you? (modern C# fluency check)**
`record` — value-semantic immutable DTOs with generated equality (`with` expressions for copies): perfect for API contracts and CQRS messages. `IAsyncEnumerable<T>` — streaming results item-by-item with backpressure (`await foreach`), e.g., streaming rows without buffering the whole set. `Span<T>/Memory<T>` — allocation-free slices over buffers for hot parsing paths. Knowing *where they help* matters more than reciting syntax.

**Q23. Scenario: after deploying v2, some users still hit v1 behavior for minutes. Why, and is it a bug?**
Rolling deployments run both versions simultaneously behind the balancer until old instances drain — that's by design. It becomes a bug when v2 changes shared state (schema, cache shapes, message contracts) incompatibly. The discipline: backward-compatible migrations (expand → migrate → contract), versioned message/API contracts, and feature flags to decouple deploy from release.
