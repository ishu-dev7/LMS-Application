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
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        // Additive migration: create CourseEnrollments if it doesn't exist yet.
        db.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS "CourseEnrollments" (
                "Id"            SERIAL PRIMARY KEY,
                "UserId"        INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "CourseId"      INT NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
                "EnrolledAtUtc" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT "UQ_CourseEnrollment" UNIQUE ("UserId", "CourseId")
            )
            """);
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        ContentSeeder.Seed(db, app.Environment.ContentRootPath, hasher, logger, app.Configuration);
    }
    catch (Exception ex)
    {
        logger.LogError(ex,
            "Database setup failed. Check the 'ConnectionStrings:Default' value in appsettings.json — " +
            "the default expects SQL Server LocalDB ((localdb)\\MSSQLLocalDB). " +
            "Point it at your SQL Server instance if LocalDB is not installed.");
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
