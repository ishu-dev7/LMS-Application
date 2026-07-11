# Share Market LMS

A full-stack Learning Management System with **7 seeded courses across 4 categories**:

| Category | Courses |
|---|---|
| **Share Market** | Share Market Mastery ([course_start.md](course_start.md)) · Graph & Market Reading ([graph_market_reading.md](graph_market_reading.md)) |
| **.NET** | .NET Framework · .NET Core / Modern .NET |
| **Frontend** | React · Angular |
| **Database** | SQL Server |

Each tech course includes a full **Interview Preparation module** with proper Q&A (basic → intermediate → advanced/scenario), plus a checkpoint quiz.

Content lives **in the database** (`Lessons.ContentMarkdown`). The markdown docs (root + [courses/](courses/)) are only the *initial seed* — after seeding, admins create and edit content directly in the DB via the **Course Setup** UI.

## Features

- 🔐 Register / sign in (JWT auth) with **roles** — Learner and Admin
- ⚙️ **Admin Course Setup** — create/edit/delete courses, modules and lessons (markdown editor) straight into the database. Seeded admin: `admin@lms.local` / `Admin@123` (change it!)
- 📚 Category-grouped dashboard; course pages with phase/module accordion and completion ticks
- 📖 Lesson reader with rendered markdown + **visual teaching aids** (candle anatomy, S/R, payoff diagrams…)
- 📝 **Checkpoint quizzes** (19 quizzes, ~75 questions) with instant scoring, pass marks, per-answer explanations
- 🎤 **Interview prep Q&A** modules in every tech course
- 📓 **Daily trading journal** with market-state tagging and streak tracking
- 📊 Progress dashboard — completion rings, module-by-module tracker

## Tech stack

| Layer | Tech |
|---|---|
| Backend | ASP.NET Core 9 Web API, EF Core 9 (writes/schema) + **Dapper** (flat read queries) |
| Database | SQL Server (LocalDB by default — connection string configurable) |
| Frontend | React 18 + TypeScript (Vite), react-router, react-markdown |
| Auth | JWT bearer tokens with role claims, PBKDF2 password hashing |

## Project layout

```
share market/
├── course_start.md              ← course 1 content (source of truth)
├── graph_market_reading.md      ← course 2 content (source of truth)
├── TODO.md                      ← build tracker / roadmap
├── backend/
│   └── ShareMarketLMS.Api/
│       ├── Content/             ← copies of the docs + quizzes.json (seeded into DB)
│       ├── Controllers/         ← Auth, Courses, Lessons, Quizzes, Journal, Progress
│       ├── Data/                ← AppDbContext + ContentSeeder (markdown → DB)
│       ├── Models/              ← EF entities
│       └── Services/            ← TokenService, PasswordHasher
└── frontend/
    └── src/
        ├── pages/               ← Auth, Dashboard, Course, Lesson, Quiz, Journal, Progress
        ├── components/          ← Layout (sidebar), ProgressRing
        ├── api.ts / auth.tsx    ← fetch wrapper + auth context
        └── index.css            ← dark finance theme
```

## Running it

**Prerequisites:** .NET 9 SDK, Node 20+, SQL Server LocalDB (ships with Visual Studio; verify with `sqllocaldb info`).

**1. Backend** (terminal 1):

```powershell
cd "backend\ShareMarketLMS.Api"
dotnet run --launch-profile http
```

First run creates the `ShareMarketLMS` database and seeds it — look for
`Seeded 2 courses, 18 modules, 86 lessons, 14 quizzes.` It listens on **http://localhost:5199**.

**2. Frontend** (terminal 2):

```powershell
cd frontend
npm install   # first time only
npm run dev
```

Open **http://localhost:5173**, create an account, and start Module 0.

### Using a full SQL Server instead of LocalDB

Edit `backend/ShareMarketLMS.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "Default": "Server=localhost;Database=ShareMarketLMS;User Id=sa;Password=...;TrustServerCertificate=True"
}
```

### Re-seeding after editing the course docs

Content seeds only when the DB is empty. To refresh:

```powershell
# stop the backend, then:
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "DROP DATABASE ShareMarketLMS"
# copy updated docs into Content\ and run again:
Copy-Item ..\..\course_start.md, ..\..\graph_market_reading.md .\Content\
dotnet run --launch-profile http
```

(User accounts live in the same DB, so re-seeding resets progress — acceptable in this phase;
Phase 2 of [TODO.md](TODO.md) moves to EF migrations + content upsert.)

## API overview

All endpoints under `/api`, JWT required except auth:

| Endpoint | Purpose |
|---|---|
| `POST /auth/register`, `POST /auth/login` | Create account / sign in → JWT (with role) |
| `GET /courses` | Courses with category + per-user progress % (Dapper) |
| `GET /courses/{slug}` | Modules, lessons, quiz status |
| `GET /lessons/{id}` | Lesson markdown + prev/next ids |
| `POST /lessons/{id}/complete` · `DELETE …/complete` | Mark / unmark complete |
| `GET /quizzes/{id}` | Questions (answers withheld) |
| `POST /quizzes/{id}/submit` | Score, pass/fail, explanations |
| `GET/POST /journal` · `DELETE /journal/{id}` | Daily journal (upsert by date; list via Dapper) |
| `GET /progress/summary` | Dashboard stats + module tracker |
| `POST/PUT/DELETE /admin/courses[/{id}]` | **Admin:** course CRUD |
| `POST/PUT/DELETE /admin/modules[/{id}]` | **Admin:** module CRUD |
| `POST/PUT/DELETE /admin/lessons[/{id}]` | **Admin:** lesson CRUD (content saved to DB) |

Course seed manifest: `backend/ShareMarketLMS.Api/Content/courses.json` — add a markdown file + one manifest entry to seed another course.

## Roadmap

See [TODO.md](TODO.md) — Phase 2 (hardening: migrations, refresh tokens, admin content editing, certificates)
and Phase 3 (React Native mobile app reusing this same API).
