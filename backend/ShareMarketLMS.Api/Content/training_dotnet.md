## ASP.NET Core Fundamentals

### What is .NET and ASP.NET Core?
.NET is a cross-platform, open-source developer platform for building many types of applications. ASP.NET Core is the web framework for .NET — fast, lightweight, and cross-platform.

**Why ASP.NET Core?**
- Unified framework for web UI (Razor Pages/Blazor) and web APIs
- Runs on Windows, Linux, macOS
- Dependency injection built-in
- Top-tier performance (consistently in TechEmpower benchmarks)
- Used by Microsoft, Stack Overflow, and thousands of enterprises

**Typical project structure:**
```
MyApi/
  Controllers/
  Models/
  Services/
  Data/
  Program.cs         ← app entry point & DI registration
  appsettings.json   ← configuration
```

### Program.cs — The Modern Minimal API
Since .NET 6, all setup is in `Program.cs` — no `Startup.cs` needed:
```csharp
var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Building Web APIs — Controllers
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _svc;

    public ProductsController(IProductService svc)
    {
        _svc = svc;  // Injected by DI container
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var products = await _svc.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _svc.GetByIdAsync(id);
        if (product is null) return NotFound();
        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        var product = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var success = await _svc.UpdateAsync(id, dto);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _svc.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
```

### Minimal APIs (Alternative to Controllers)
```csharp
// Direct route declarations in Program.cs
app.MapGet("/api/products", async (IProductService svc) =>
    await svc.GetAllAsync());

app.MapGet("/api/products/{id}", async (int id, IProductService svc) =>
    await svc.GetByIdAsync(id) is Product p ? Results.Ok(p) : Results.NotFound());

app.MapPost("/api/products", async (CreateProductDto dto, IProductService svc) =>
{
    var p = await svc.CreateAsync(dto);
    return Results.CreatedAtRoute("GetProduct", new { id = p.Id }, p);
});

// Route groups (organized like controllers)
var products = app.MapGroup("/api/products").RequireAuthorization();
products.MapGet("/", GetAll);
products.MapPost("/", Create);
```

### Dependency Injection — Lifetimes
```csharp
// Registration in Program.cs
builder.Services.AddSingleton<ICache, MemoryCache>();      // one for entire app
builder.Services.AddScoped<IProductService, ProductService>(); // one per HTTP request
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>(); // new every time

// Constructor injection (most common)
public class OrderService
{
    private readonly IProductService _products;
    private readonly IEmailSender _email;

    public OrderService(IProductService products, IEmailSender email)
    {
        _products = products;
        _email = email;
    }
}

// Interface segregation for DI
public interface IProductService
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(CreateProductDto dto);
    Task<bool> UpdateAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);
}
```

### Middleware
Middleware is code that runs in the HTTP request pipeline:
```csharp
// Built-in middleware
app.UseHttpsRedirection();   // redirect HTTP to HTTPS
app.UseStaticFiles();        // serve wwwroot/
app.UseRouting();            // match routes
app.UseAuthentication();     // who are you?
app.UseAuthorization();      // what can you do?
app.UseCors();               // CORS headers
app.UseResponseCaching();    // cache responses

// Custom middleware — class style
public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestTimingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await _next(context);
        sw.Stop();
        Console.WriteLine($"{context.Request.Path} took {sw.ElapsedMilliseconds}ms");
    }
}

// Register it
app.UseMiddleware<RequestTimingMiddleware>();

// Lambda middleware
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Custom"] = "Nexora";
    await next(context);
});

// Short-circuit middleware (no next())
app.Run(async context =>
{
    await context.Response.WriteAsync("All requests handled here");
});
```

### Configuration
```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=mydb;Username=user;Password=pass"
  },
  "Jwt": {
    "Secret": "your-secret-key",
    "Issuer": "Nexora",
    "ExpiryHours": 24
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587
  }
}

// Reading config
var connStr = builder.Configuration.GetConnectionString("Default");
var jwtSecret = builder.Configuration["Jwt:Secret"];

// Typed configuration (Options pattern)
public class JwtSettings
{
    public string Secret { get; set; } = "";
    public string Issuer { get; set; } = "";
    public int ExpiryHours { get; set; } = 24;
}

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

// Use in a service
public class TokenService
{
    private readonly JwtSettings _settings;
    public TokenService(IOptions<JwtSettings> opts) => _settings = opts.Value;
}
```

## Entity Framework Core

### DbContext and Entities
```csharp
// Entity (maps to a DB table)
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;  // navigation property
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Product> Products { get; set; } = new();
}

// DbContext
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.HasIndex(p => p.Name);
        });

        modelBuilder.Entity<Category>()
            .HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId);
    }
}
```

### Migrations
```bash
# Add a migration
dotnet ef migrations add InitialCreate

# Apply migrations to database
dotnet ef database update

# Revert last migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script
```

### CRUD with EF Core
```csharp
public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    // Read — with navigation
    public async Task<IEnumerable<Product>> GetAllAsync() =>
        await _db.Products
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .ToListAsync();

    // Read by ID
    public async Task<Product?> GetByIdAsync(int id) =>
        await _db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

    // Create
    public async Task<Product> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Stock = dto.Stock,
            CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }

    // Update
    public async Task<bool> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return false;

        product.Name = dto.Name;
        product.Price = dto.Price;
        product.Stock = dto.Stock;

        await _db.SaveChangesAsync();
        return true;
    }

    // Delete
    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return false;

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return true;
    }

    // Complex queries
    public async Task<PagedResult<Product>> SearchAsync(string? term, int page, int size)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(term))
            query = query.Where(p => p.Name.Contains(term));

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return new PagedResult<Product>(items, total, page, size);
    }
}
```

### Repository Pattern with EF Core
```csharp
// Generic repository
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Remove(T entity);
    Task SaveChangesAsync();
}

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _db;
    protected readonly DbSet<T> _set;

    public Repository(AppDbContext db)
    {
        _db = db;
        _set = db.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id) => await _set.FindAsync(id);
    public async Task<IEnumerable<T>> GetAllAsync() => await _set.ToListAsync();
    public async Task AddAsync(T entity) => await _set.AddAsync(entity);
    public void Remove(T entity) => _set.Remove(entity);
    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}

// Unit of Work
public interface IUnitOfWork
{
    IRepository<Product> Products { get; }
    IRepository<Order> Orders { get; }
    Task<int> CommitAsync();
}
```

## Authentication & JWT

### JWT Authentication Setup
```csharp
// Install: dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "Nexora",
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();

// Token generation service
public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config) => _config = config;

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("displayName", user.DisplayName)
        };

        var token = new JwtSecurityToken(
            issuer: "Nexora",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### Protecting Endpoints
```csharp
// Require authentication on controller
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase { }

// Allow anonymous on specific action
[AllowAnonymous]
[HttpPost("login")]
public IActionResult Login([FromBody] LoginDto dto) { }

// Role-based
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public IActionResult Delete(int id) { }

// Get current user from JWT claims
[HttpGet("me")]
public IActionResult GetMe()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = User.FindFirstValue(ClaimTypes.Email);
    var role = User.FindFirstValue(ClaimTypes.Role);
    return Ok(new { userId, email, role });
}
```

## Advanced Topics

### Background Services
```csharp
// IHostedService for background tasks
public class EmailQueueWorker : BackgroundService
{
    private readonly ILogger<EmailQueueWorker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public EmailQueueWorker(ILogger<EmailQueueWorker> logger,
                            IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            await emailService.ProcessQueueAsync();
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}

// Register in Program.cs
builder.Services.AddHostedService<EmailQueueWorker>();
```

### Response Caching and Memory Cache
```csharp
// IMemoryCache
builder.Services.AddMemoryCache();

public class ProductService
{
    private readonly IMemoryCache _cache;
    private readonly AppDbContext _db;

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        const string key = "products:all";
        if (!_cache.TryGetValue(key, out IEnumerable<Product>? products))
        {
            products = await _db.Products.ToListAsync();
            _cache.Set(key, products, TimeSpan.FromMinutes(5));
        }
        return products!;
    }
}

// IDistributedCache (Redis)
builder.Services.AddStackExchangeRedisCache(opt =>
    opt.Configuration = "localhost:6379");
```

### Global Exception Handling
```csharp
// Custom exception handler middleware
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;

    public ExceptionHandlerMiddleware(RequestDelegate next,
        ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { errors = ex.Errors });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { error = "Internal server error" });
        }
    }
}
```

### Rate Limiting (ASP.NET Core 7+)
```csharp
builder.Services.AddRateLimiter(opt =>
{
    opt.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 100;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiter.QueueLimit = 10;
    });

    opt.AddSlidingWindowLimiter("auth", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(5);
        limiter.SegmentsPerWindow = 5;
        limiter.PermitLimit = 10;
    });
});

app.UseRateLimiter();

// Apply to controller
[EnableRateLimiting("api")]
public class ProductsController : ControllerBase { }
```

### Deployment — Docker and Azure
```dockerfile
# Dockerfile for .NET API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["MyApi.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ConnectionStrings__Default=Host=db;Database=mydb;...
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: mysecret
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## Interview Preparation

### .NET Interview Questions

**Q1. What is the difference between .NET Framework, .NET Core, and .NET 5+?**
- **.NET Framework**: Windows-only, mature but legacy
- **.NET Core**: Cross-platform open-source rewrite
- **.NET 5+**: Unified platform — .NET Core + .NET Framework features merged. No more "Core" branding.

**Q2. Explain the ASP.NET Core request pipeline.**
Request → HTTP Server (Kestrel/IIS) → Middleware chain (UseX calls, order matters) → Routing → Controller/Endpoint → Response back through middleware chain.

**Q3. What is the difference between `IActionResult` and `ActionResult<T>`?**
`ActionResult<T>` is generic — allows returning both `T` directly (auto-wrapped in 200 OK) and any `IActionResult` (NotFound, BadRequest, etc.). `IActionResult` loses the type information for Swagger.

**Q4. What is scoped vs transient vs singleton service lifetime?**
- **Singleton**: One per application. Good for stateless services (caches, config).
- **Scoped**: One per HTTP request. Default for DbContext — ensures one transaction per request.
- **Transient**: New instance each time. Good for lightweight, stateless services.

**Q5. What is EF Core migration and how does it work?**
Migrations are C# files that describe schema changes (`Up()` and `Down()` methods). `Add-Migration` compares current model to database snapshot and generates the diff. `Update-Database` applies pending migrations.

**Q6. What is the Repository pattern and why use it?**
Abstracts data access behind an interface. Decouples business logic from the ORM. Makes unit testing possible by mocking the repository. Can swap EF Core for Dapper without touching business logic.

**Q7. What is the Unit of Work pattern?**
Wraps multiple repository operations in a single transaction. Provides a `CommitAsync()` that saves all changes atomically. Prevents partial updates.

**Q8. How does JWT authentication work in ASP.NET Core?**
Client sends credentials → server validates and returns JWT → client sends JWT in `Authorization: Bearer <token>` header on subsequent requests → `[Authorize]` attribute triggers JWT validation middleware → claims extracted from token.

**Q9. What is CORS and how do you configure it?**
Cross-Origin Resource Sharing — browser security policy that blocks requests from different origins. Configure in ASP.NET Core:
```csharp
builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p => p.WithOrigins("https://myapp.com")
                               .AllowAnyMethod()
                               .AllowAnyHeader()));
app.UseCors();
```

**Q10. What is the difference between `AddSingleton` for `IMemoryCache` vs `AddDistributedCache`?**
`IMemoryCache` is in-process — lost on restart, not shared across instances. `IDistributedCache` (Redis, SQL Server) — persists across restarts, shared across all app instances. Use distributed for load-balanced deployments.

**Q11. How do you handle exceptions globally in ASP.NET Core?**
Options: Custom middleware, `app.UseExceptionHandler()`, `IExceptionFilter`, `ProblemDetails` middleware (ASP.NET Core 7+ `AddProblemDetails()`).

**Q12. What is IHostedService / BackgroundService?**
`IHostedService` is the interface for services that start/stop with the app. `BackgroundService` is a base class with `ExecuteAsync(CancellationToken)` — called at startup and runs until the app stops. Used for queues, scheduled tasks, etc.

**Q13. Explain `async`/`await` in the context of ASP.NET Core.**
ASP.NET Core uses a thread pool for requests. `async`/`await` releases the thread while waiting for I/O (DB, HTTP), letting it serve other requests. Without async, a thread is blocked during I/O — reducing throughput under load.

**Q14. What is the difference between `FromBody`, `FromQuery`, `FromRoute`?**
- `[FromBody]`: Deserialize JSON request body
- `[FromQuery]`: Read from URL query string (`?page=1`)
- `[FromRoute]`: Read from URL segment (`/api/products/{id}`)
- `[FromHeader]`: Read from HTTP header

**Q15. What is model validation and how does it work?**
Data annotations on DTOs (`[Required]`, `[MaxLength]`, `[Range]`). `[ApiController]` automatically returns 400 with `ModelState` errors if validation fails. Custom validators via `IValidatableObject` or FluentValidation.
