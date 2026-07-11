using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<DapperContext>();

var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
        };
    });
builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Create the database and seed course content from the markdown docs on first run.
// Retries handle cloud DB cold-starts (e.g. Neon free tier spins up in ~5 s).
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    const int MaxRetries = 6;
    for (var attempt = 1; attempt <= MaxRetries; attempt++)
    {
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
            var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
            ContentSeeder.Seed(db, app.Environment.ContentRootPath, hasher, logger, app.Configuration);
            logger.LogInformation("Database ready (attempt {Attempt}).", attempt);
            break;
        }
        catch (Exception ex) when (attempt < MaxRetries)
        {
            var wait = attempt * 5;
            logger.LogWarning(ex, "DB setup attempt {Attempt}/{Max} failed — retrying in {Wait}s.", attempt, MaxRetries, wait);
            Thread.Sleep(wait * 1000);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "DB setup failed after {Max} attempts — app starting without DB init.", MaxRetries);
        }
    }
}

// Ensure uploads directory exists for lesson attachments.
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "uploads"));

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
