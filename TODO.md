# Share Market LMS — Project TODO / Build Tracker

**Goal:** A Learning Management System (LMS) web application for completing the two courses in this repo
([course_start.md](course_start.md) and [graph_market_reading.md](graph_market_reading.md)) with progress
tracking, checkpoint quizzes, and the daily trading journal built in.

**Stack:** ASP.NET Core 9 Web API · React 18 (Vite + TypeScript) · SQL Server (EF Core 9) · JWT auth
**Later phase:** Mobile app (React Native — shares the same REST API)

---

## Phase 1 — Web Application (current)

### 1. Project setup
- [x] Environment check: .NET 9 SDK, Node 20+
- [x] `TODO.md` (this file)
- [x] Solution structure: `backend/ShareMarketLMS.Api` + `frontend/`
- [x] README with run instructions

### 2. Backend — ASP.NET Core 9 API
- [x] Project scaffold + NuGet packages (EF Core SqlServer, JWT Bearer)
- [x] **Entities:** User, Course, Module, Lesson, Quiz, Question, LessonProgress, QuizAttempt, JournalEntry
- [x] `AppDbContext` + SQL Server connection (localdb default, configurable in appsettings)
- [x] **Content seeder:** parses the two markdown docs into Course → Module → Lesson rows at first run
- [x] **Quiz bank:** hand-authored checkpoint MCQs per module (Content/quizzes.json), seeded with courses
- [x] **Auth:** register/login endpoints, password hashing, JWT issuance, `[Authorize]` on user data
- [x] **API endpoints:**
  - [x] `POST /api/auth/register`, `POST /api/auth/login`
  - [x] `GET /api/courses` (with per-user progress %), `GET /api/courses/{slug}` (modules + lessons + quiz meta)
  - [x] `GET /api/lessons/{id}` (markdown content), `POST/DELETE /api/lessons/{id}/complete`
  - [x] `GET /api/quizzes/{quizId}` (questions without answers), `POST /api/quizzes/{quizId}/submit` (score + explanations)
  - [x] `GET/POST /api/journal` (upsert by date), `DELETE /api/journal/{id}`
  - [x] `GET /api/progress/summary` (dashboard stats)
- [x] CORS for the Vite dev server (+ Vite proxy)
- [x] `dotnet build` passes

### 3. Frontend — React (Vite + TypeScript)
- [x] Scaffold + deps: react-router-dom, react-markdown, remark-gfm
- [x] Auth pages: Login / Register (JWT stored, auth context, protected routes)
- [x] **Dashboard:** course cards with progress rings, journal streak, stats, golden-rules card
- [x] **Course page:** phase/module accordion with lesson list, completion ticks, quiz status
- [x] **Lesson reader:** rendered markdown (tables, quotes), prev/next nav, "Complete & continue"
- [x] **Quiz page:** MCQ list, submit → score banner, pass/fail vs checkpoint threshold, per-question explanations, retake
- [x] **Journal page:** daily 5-line entry form (NIFTY move / why / FII-DII / sectors / surprise) + market-state tag + history with edit/delete
- [x] **Progress page:** per-module tracker mirroring course Appendix D
- [x] Clean finance-dark theme, responsive layout
- [x] `npm run build` passes

### 4. Verification
- [x] Backend builds and starts; DB auto-creates and seeds: 2 courses, 18 modules, 86 lessons, 14 quizzes
- [x] End-to-end API flow verified: register → login → course detail → lesson read/complete → quiz submit (scored) → journal upsert → progress summary/streak

## Phase 1.5 — Multi-category catalog + Admin (done)
- [x] Course categories: Share Market, .NET, Frontend, Database (dashboard grouped)
- [x] 5 new courses with full content: .NET Framework, .NET Core, React, Angular, SQL Server
- [x] Interview Preparation module with Q&A (basic/intermediate/advanced) in every tech course
- [x] Checkpoint quizzes for all tech courses (19 quizzes total, ~75 questions)
- [x] Manifest-driven seeding (`Content/courses.json`) — add a doc + manifest entry = new course
- [x] User roles (Learner/Admin) with role claims in JWT; seeded admin account
- [x] **Admin Course Setup UI**: course/module/lesson CRUD with markdown editor — content saved in DB
- [x] Dapper for flat read queries (course list aggregation, journal history); EF Core for writes/schema

## Phase 2 — Hardening (next)
- [ ] Switch `EnsureCreated` → EF Core migrations for production
- [ ] Refresh tokens, password reset, email confirmation; change seeded admin password flow
- [ ] Admin quiz editing UI (quizzes currently seed from quizzes.json only)
- [ ] Certificates on course completion
- [ ] Deployment (IIS / Azure App Service + Azure SQL)

## Phase 3 — Mobile app (planned)
- [ ] React Native (Expo) app reusing the same REST API
- [ ] Screens: login, dashboard, lesson reader, quiz, journal
- [ ] Offline lesson caching, push reminder for the daily journal
