# Deployment Guide — Path A: Vercel + Render + Supabase

> **100% free** · GitHub push-to-deploy · ~45 min setup · 8 file changes

## Overview

Deploys the .NET backend to **Render**, the React frontend to **Vercel**, and the database to **Supabase PostgreSQL**. The EF Core model and all application logic stay the same — only the provider package, connection string format, and SQL identifiers were changed.

| Service | Role | Cost |
|---------|------|------|
| [Supabase](https://supabase.com) | Database (PostgreSQL) | Free — 500 MB |
| [Render](https://render.com) | Backend (.NET API) | Free — 750 hrs/mo |
| [Vercel](https://vercel.com) | Frontend (React) | Free — unlimited |

> **Render free tier sleeps after 15 minutes of inactivity.** The first request after sleep takes ~30 seconds (cold start). Fine for testing — upgrade to Render's $7/mo Starter plan to eliminate cold starts.

---

## Prerequisites

- [ ] Project pushed to a **GitHub repository**
- [ ] [Supabase](https://supabase.com) account (free, no credit card)
- [ ] [Render](https://render.com) account (free, GitHub login works)
- [ ] [Vercel](https://vercel.com) account (free, GitHub login works)
- [ ] .NET 9 SDK installed locally

---

## Code Changes (already applied)

All 8 changes below are already committed in the codebase. This section documents what was changed and why.

### 1. Swapped EF Core provider package

```bash
# Removed
dotnet remove package Microsoft.EntityFrameworkCore.SqlServer
dotnet remove package Microsoft.Data.SqlClient

# Added
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4
```

### 2. `Program.cs` — two changes

**a. Switch EF Core provider**

```csharp
// Before
o.UseSqlServer(builder.Configuration.GetConnectionString("Default"))

// After
o.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
```

**b. Fix raw SQL migration (T-SQL → PostgreSQL)**

```csharp
// Before (T-SQL)
db.Database.ExecuteSqlRaw("""
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CourseEnrollments')
    BEGIN
        CREATE TABLE CourseEnrollments (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            UserId INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
            CourseId INT NOT NULL REFERENCES Courses(Id) ON DELETE CASCADE,
            EnrolledAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            CONSTRAINT UQ_CourseEnrollment UNIQUE (UserId, CourseId)
        )
    END
    """);

// After (PostgreSQL)
db.Database.ExecuteSqlRaw("""
    CREATE TABLE IF NOT EXISTS "CourseEnrollments" (
        "Id"            SERIAL PRIMARY KEY,
        "UserId"        INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
        "CourseId"      INT NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
        "EnrolledAtUtc" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_CourseEnrollment" UNIQUE ("UserId", "CourseId")
    )
    """);
```

> **Why quoted identifiers?** EF Core's Npgsql provider creates tables with double-quoted PascalCase names (`"Users"`, `"Courses"`, etc.) to preserve casing. The raw migration SQL must use the same quoted names to match tables EF Core creates via `EnsureCreated()`.

### 3. `Data/DapperContext.cs` — switch to NpgsqlConnection

```csharp
// Before
using Microsoft.Data.SqlClient;
...
public IDbConnection CreateConnection() => new SqlConnection(_connectionString);

// After
using Npgsql;
...
public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
```

### 4. `Controllers/CoursesController.cs` — quote Dapper SQL identifiers

```csharp
// Before (unquoted — fails in PostgreSQL)
SELECT c.Id, c.Slug, c.Title, c.Description, c.Category, ...
FROM Courses c
LEFT JOIN Modules m ON m.CourseId = c.Id
...
GROUP BY c.Id, c.Slug, c.Title, c.Description, c.Category, c.[Order]
ORDER BY c.[Order]

// After (double-quoted PascalCase + "Order" instead of [Order])
SELECT c."Id", c."Slug", c."Title", c."Description", c."Category", ...
FROM "Courses" c
LEFT JOIN "Modules" m ON m."CourseId" = c."Id"
...
GROUP BY c."Id", c."Slug", c."Title", c."Description", c."Category", c."Order"
ORDER BY c."Order"
```

> **`Order` is a reserved word in PostgreSQL** — it must always be quoted as `"Order"`.

### 5. `appsettings.json` — update connection string format and CORS

```json
{
  "ConnectionStrings": {
    "Default": "Host=db.YOUR_PROJECT_REF.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SSL Mode=Require"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:8081",
      "https://YOUR_APP.vercel.app"
    ]
  }
}
```

> **Do not commit real credentials.** Set the production connection string as a `ConnectionStrings__Default` environment variable in Render. The placeholder in `appsettings.json` is overridden by the env var at runtime.

### 6. `backend/ShareMarketLMS.Api/Dockerfile` (new file)

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ShareMarketLMS.Api.csproj", "."]
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ShareMarketLMS.Api.dll"]
```

### 7. `frontend/vercel.json` (new file)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_RENDER_SERVICE.onrender.com/api/:path*"
    }
  ]
}
```

The React app uses relative `/api/...` paths (via Vite's dev proxy). In production, Vercel's edge network forwards those requests to Render. **No changes to `api.ts` are needed.**

### 8. `mobile/src/api.ts` — production URL with `__DEV__` guard

```typescript
// Before
const LAN_IP = '10.45.68.1'
const BASE =
  Platform.OS === 'android'
    ? (Constants.isDevice ? `http://${LAN_IP}:5199` : 'http://10.0.2.2:5199')
    : 'http://localhost:5199'

// After
const PROD_API = 'https://YOUR_RENDER_SERVICE.onrender.com'
const DEV_LAN  = '10.45.68.1'
const BASE = __DEV__
  ? (Platform.OS === 'android'
      ? (Constants.isDevice ? `http://${DEV_LAN}:5199` : 'http://10.0.2.2:5199')
      : 'http://localhost:5199')
  : PROD_API
```

`__DEV__` is `true` in development builds and `false` in production APK/IPA builds.

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com/dashboard/new](https://supabase.com/dashboard/new/_) → create a new project
   - Name: `sharemarketlms`
   - Set a strong database password — save it somewhere safe
   - Choose a region close to your users

2. Wait ~2 minutes for provisioning

3. Go to **Settings → Database → Connection string → .NET tab** → copy the string:
   ```
   Host=db.abcdefghijkl.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require
   ```

4. No extra configuration needed — EF Core's `EnsureCreated()` will create all tables on the first backend startup.

---

## Step 2 — Render (Backend)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New Web Service** → connect GitHub → select your repo

2. Set the following:

   | Setting | Value |
   |---------|-------|
   | Name | `sharemarketlms-api` |
   | Root Directory | `backend/ShareMarketLMS.Api` |
   | Runtime | Docker |
   | Branch | `main` |
   | Instance Type | Free |
   | Port | `8080` |

3. Before clicking **Create Web Service**, add these **Environment Variables**:

   | Key | Value | Note |
   |-----|-------|------|
   | `ConnectionStrings__Default` | `Host=db.xxx.supabase.co;...` | Full Supabase connection string |
   | `Jwt__Key` | your-production-secret-32chars+ | Use `openssl rand -hex 32` to generate |
   | `Jwt__Issuer` | `ShareMarketLMS` | |
   | `Jwt__Audience` | `ShareMarketLMS.Web` | |
   | `ASPNETCORE_ENVIRONMENT` | `Production` | Disables Swagger in production |

   > **Double underscores (`__`)** map to nested JSON config — `ConnectionStrings__Default` becomes `ConnectionStrings:Default` in ASP.NET Core.

4. Click **Create Web Service** — first deploy takes 3–5 minutes

5. Your API will be live at:
   ```
   https://sharemarketlms-api.onrender.com
   ```
   Copy this URL — you need it for the next two steps.

---

## Step 3 — Vercel (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select your repo

2. Configure:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` (auto-detected) |
   | Output Directory | `dist` (auto-detected) |

3. **No environment variables needed** — the `vercel.json` rewrite handles the API proxy.

4. Click **Deploy** — live in ~1 minute at `https://your-app.vercel.app`

5. Update the two placeholders with your actual Render URL:

   **`frontend/vercel.json`**
   ```json
   "destination": "https://sharemarketlms-api.onrender.com/api/:path*"
   ```

   **`mobile/src/api.ts`**
   ```typescript
   const PROD_API = 'https://sharemarketlms-api.onrender.com'
   ```

6. Update CORS — add your Vercel URL to `appsettings.json` (or set on Render as `Cors__AllowedOrigins__0`):
   ```json
   "https://your-app.vercel.app"
   ```

   Then redeploy the backend (Render auto-deploys on push to `main`).

---

## Environment Variables Reference

### Render (Backend)

| Variable | Example Value | Note |
|----------|---------------|------|
| `ConnectionStrings__Default` | `Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=pw;SSL Mode=Require` | Supabase connection string |
| `Jwt__Key` | `a-very-long-random-secret-key` | Min 32 chars · `openssl rand -hex 32` |
| `Jwt__Issuer` | `ShareMarketLMS` | |
| `Jwt__Audience` | `ShareMarketLMS.Web` | |
| `ASPNETCORE_ENVIRONMENT` | `Production` | |

### Vercel (Frontend)

No environment variables required — API routing is handled by `vercel.json` rewrites.

---

## Mobile App (Optional)

### Expo Go — test instantly, no build needed

1. Install **Expo Go** on your phone
2. Run `npx expo start` locally (update `DEV_LAN` in `api.ts` to your local machine's IP)
3. Scan the QR code

### EAS Build — shareable APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Free tier: 30 builds/month. Renders a download link you can share with testers.

> Before building, replace `YOUR_RENDER_SERVICE` in `mobile/src/api.ts` with the actual Render URL so the production APK talks to the live backend.

---

## Final Checklist

- [ ] All 8 code changes committed and pushed to `main`
- [ ] Supabase project provisioned — connection string copied
- [ ] Render deploy succeeded — check logs for `Application started`
- [ ] Database tables created — EF Core `EnsureCreated()` runs on first startup; check Render logs for errors
- [ ] Content seeded — courses appear in the app (ContentSeeder runs on startup)
- [ ] Vercel deploy succeeded — React app loads at your Vercel URL
- [ ] Login works end-to-end — test `ishu@gmail.com / Ishu@123` from the Vercel URL
- [ ] CORS configured — Vercel domain added to backend's allowed origins
- [ ] `vercel.json` placeholder replaced — `/api` requests return 200 in DevTools Network tab
- [ ] `mobile/src/api.ts` placeholder replaced — rebuild APK if testing mobile
