using System.Text.Json;
using ShareMarketLMS.Api.Models;
using ShareMarketLMS.Api.Services;

namespace ShareMarketLMS.Api.Data;

/// <summary>
/// Seeds courses from markdown documents listed in Content/courses.json, the checkpoint quiz bank
/// (Content/quizzes.json), and the default admin account. Runs once — skipped when courses already exist.
/// </summary>
public static class ContentSeeder
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public static void Seed(AppDbContext db, string contentRootPath, PasswordHasher hasher, ILogger logger)
    {
        var contentDir = Path.Combine(contentRootPath, "Content");
        SeedAdmin(db, Path.Combine(contentDir, "courses.json"), hasher, logger);

        if (db.Courses.Any())
        {
            logger.LogInformation("Content already seeded — skipping.");
            return;
        }

        var manifest = ReadManifest(Path.Combine(contentDir, "courses.json"));
        foreach (var entry in manifest.Courses.OrderBy(c => c.Order))
        {
            var file = Path.Combine(contentDir, entry.File);
            if (!File.Exists(file))
            {
                logger.LogWarning("Course file {File} not found — '{Title}' skipped.", entry.File, entry.Title);
                continue;
            }
            var md = File.ReadAllText(file);
            var course = new Course
            {
                Slug = entry.Slug, Title = entry.Title, Description = entry.Description,
                Category = entry.Category, Order = entry.Order,
            };
            switch (entry.Parser)
            {
                case "courseStart": ParseCourseStart(md, course); break;
                case "fieldGuide": ParseFieldGuide(md, course); break;
                default: ParseGeneric(md, course); break;
            }
            db.Courses.Add(course);
        }
        db.SaveChanges();

        SeedQuizzes(db, Path.Combine(contentDir, "quizzes.json"), logger);
        logger.LogInformation("Seeded {Courses} courses, {Modules} modules, {Lessons} lessons, {Quizzes} quizzes.",
            db.Courses.Count(), db.Modules.Count(), db.Lessons.Count(), db.Quizzes.Count());
    }

    // ---------- manifest & admin ----------

    private record Manifest(AdminSeed? AdminUser, List<ManifestCourse> Courses);
    private record AdminSeed(string Email, string DisplayName, string Password);
    private record ManifestCourse(string Slug, string Title, string Description, string Category,
        int Order, string File, string Parser);

    private static Manifest ReadManifest(string path) =>
        JsonSerializer.Deserialize<Manifest>(File.ReadAllText(path), JsonOpts) ?? new Manifest(null, []);

    private static void SeedAdmin(AppDbContext db, string manifestPath, PasswordHasher hasher, ILogger logger)
    {
        if (!File.Exists(manifestPath)) return;
        var admin = ReadManifest(manifestPath).AdminUser;
        if (admin is null) return;
        if (db.Users.Any(u => u.Email == admin.Email)) return;

        db.Users.Add(new User
        {
            Email = admin.Email,
            DisplayName = admin.DisplayName,
            PasswordHash = hasher.Hash(admin.Password),
            Role = "Admin",
        });
        db.SaveChanges();
        logger.LogInformation("Seeded admin account {Email}.", admin.Email);
    }

    // ---------- generic parser: "## " modules, "### " lessons ----------

    private static void ParseGeneric(string md, Course course)
    {
        var lines = Normalize(md);
        var moduleOrder = 0;

        var preamble = TakeUntil(lines, 0, i => lines[i].StartsWith("## "), out var idx);
        var stripped = StripTopTitle(preamble);
        if (!string.IsNullOrWhiteSpace(StripRules(stripped)))
        {
            var intro = new Module { Order = moduleOrder++, Title = "Introduction", Phase = "Getting Started" };
            intro.Lessons.Add(MakeLesson(0, "About this course", stripped));
            course.Modules.Add(intro);
        }

        while (idx < lines.Count)
        {
            if (lines[idx].StartsWith("## "))
            {
                var title = lines[idx][3..].Trim();
                var body = TakeUntil(lines, idx + 1, i => lines[i].StartsWith("## "), out idx);
                var module = new Module
                {
                    Order = moduleOrder++,
                    Title = title,
                    Phase = title.Contains("Interview", StringComparison.OrdinalIgnoreCase) ? "Interview Prep" : "Core Content",
                    TopicType = title.Contains("Interview", StringComparison.OrdinalIgnoreCase) ? "InterviewReady" : "Regular",
                };
                AddLessonsSplitBy(module, body, "### ");
                course.Modules.Add(module);
            }
            else idx++;
        }
    }

    // ---------- course_start.md: "# PHASE" phases, "## Module" modules ----------

    private static void ParseCourseStart(string md, Course course)
    {
        var lines = Normalize(md);
        string currentPhase = "Introduction";
        var moduleOrder = 0;

        var preamble = TakeUntil(lines, 0, i => lines[i].StartsWith("# PHASE"), out var idx);
        var startHere = new Module { Order = moduleOrder++, Title = "Start Here", Phase = "Introduction" };
        startHere.Lessons.Add(MakeLesson(0, "Course Overview & Golden Rules", StripTopTitle(preamble)));
        course.Modules.Add(startHere);

        while (idx < lines.Count)
        {
            var line = lines[idx];
            if (line.StartsWith("# PHASE"))
            {
                currentPhase = line.TrimStart('#', ' ').Trim();
                idx++;
            }
            else if (line.StartsWith("## Module"))
            {
                var title = line[3..].Trim();
                var body = TakeUntil(lines, idx + 1,
                    i => lines[i].StartsWith("# PHASE") || lines[i].StartsWith("## Module") || lines[i].StartsWith("# APPENDIX"),
                    out idx);
                var module = new Module { Order = moduleOrder++, Title = title, Phase = currentPhase };
                AddLessonsSplitBy(module, body, "### ");
                course.Modules.Add(module);
            }
            else if (line.StartsWith("# APPENDIX"))
            {
                var appendixModule = new Module { Order = moduleOrder++, Title = "Appendices — Resources, Reading List & Tracker", Phase = "Reference" };
                var lessonOrder = 0;
                while (idx < lines.Count && lines[idx].StartsWith("# APPENDIX"))
                {
                    var title = lines[idx][2..].Trim();
                    var body = TakeUntil(lines, idx + 1, i => lines[i].StartsWith("# APPENDIX"), out idx);
                    appendixModule.Lessons.Add(MakeLesson(lessonOrder++, title, body));
                }
                course.Modules.Add(appendixModule);
            }
            else
            {
                idx++;
            }
        }
    }

    // ---------- graph_market_reading.md: "# PART" modules, "## " lessons ----------

    private static void ParseFieldGuide(string md, Course course)
    {
        var lines = Normalize(md);
        var moduleOrder = 0;

        var preamble = TakeUntil(lines, 0, i => lines[i].StartsWith("# PART"), out var idx);
        var intro = new Module { Order = moduleOrder++, Title = "Orientation", Phase = "Introduction" };
        intro.Lessons.Add(MakeLesson(0, "How This Guide Works — Tide First, Boat Second", StripTopTitle(preamble)));
        course.Modules.Add(intro);

        while (idx < lines.Count)
        {
            if (lines[idx].StartsWith("# PART"))
            {
                var rawTitle = lines[idx][2..].Trim();
                var title = ToTitleCasePart(rawTitle);
                var body = TakeUntil(lines, idx + 1, i => lines[i].StartsWith("# PART"), out idx);
                var module = new Module
                {
                    Order = moduleOrder++,
                    Title = title,
                    Phase = title.Contains("Graph", StringComparison.OrdinalIgnoreCase) ? "Chart Skills" : "Market Skills",
                };
                AddLessonsSplitBy(module, body, "## ");
                course.Modules.Add(module);
            }
            else idx++;
        }
    }

    // ---------- quiz bank ----------

    private record QuizSeedFile(List<QuizSeed> Quizzes);
    private record QuizSeed(string CourseSlug, string ModuleMatch, string Title, int PassPercent, List<QuestionSeed> Questions);
    private record QuestionSeed(string Text, List<string> Options, int CorrectIndex, string Explanation);

    private static void SeedQuizzes(AppDbContext db, string quizzesPath, ILogger logger)
    {
        if (!File.Exists(quizzesPath))
        {
            logger.LogWarning("quizzes.json not found at {Path} — skipping quiz seed.", quizzesPath);
            return;
        }

        var seed = JsonSerializer.Deserialize<QuizSeedFile>(File.ReadAllText(quizzesPath), JsonOpts);
        if (seed is null) return;

        var courses = db.Courses.ToDictionary(c => c.Slug, c => c.Id);

        foreach (var q in seed.Quizzes)
        {
            if (!courses.TryGetValue(q.CourseSlug, out var courseId)) continue;
            var module = db.Modules
                .Where(m => m.CourseId == courseId && m.Title.Contains(q.ModuleMatch))
                .OrderBy(m => m.Order)
                .FirstOrDefault();
            if (module is null)
            {
                logger.LogWarning("No module matching '{Match}' in course '{Slug}' — quiz skipped.", q.ModuleMatch, q.CourseSlug);
                continue;
            }

            var quiz = new Quiz { ModuleId = module.Id, Title = q.Title, PassPercent = q.PassPercent };
            var order = 0;
            foreach (var question in q.Questions)
            {
                quiz.Questions.Add(new Question
                {
                    Order = order++,
                    Text = question.Text,
                    OptionsJson = JsonSerializer.Serialize(question.Options),
                    CorrectIndex = question.CorrectIndex,
                    Explanation = question.Explanation,
                });
            }
            db.Quizzes.Add(quiz);
        }
        db.SaveChanges();
    }

    // ---------- helpers ----------

    private static List<string> Normalize(string md) =>
        md.Replace("\r\n", "\n").Split('\n').ToList();

    /// <summary>Collects lines from <paramref name="start"/> until the predicate matches; returns the block and the stop index.</summary>
    private static string TakeUntil(List<string> lines, int start, Func<int, bool> stop, out int stoppedAt)
    {
        var i = start;
        var block = new List<string>();
        while (i < lines.Count && !stop(i))
        {
            block.Add(lines[i]);
            i++;
        }
        stoppedAt = i;
        return string.Join('\n', block).Trim('\n', ' ');
    }

    /// <summary>Splits a module body into lessons on a heading prefix ("### " or "## "). Pre-heading text becomes an Overview lesson.</summary>
    private static void AddLessonsSplitBy(Module module, string body, string headingPrefix)
    {
        var lines = Normalize(body);
        var order = 0;

        var pre = TakeUntil(lines, 0, i => lines[i].StartsWith(headingPrefix), out var idx);
        if (!string.IsNullOrWhiteSpace(StripRules(pre)))
            module.Lessons.Add(MakeLesson(order++, "Overview & Reading", pre));

        while (idx < lines.Count)
        {
            if (lines[idx].StartsWith(headingPrefix))
            {
                var title = lines[idx][headingPrefix.Length..].Trim();
                var lessonBody = TakeUntil(lines, idx + 1, i => lines[i].StartsWith(headingPrefix), out idx);
                module.Lessons.Add(MakeLesson(order++, title, lessonBody));
            }
            else idx++;
        }

        // A module with no sub-headings becomes a single lesson.
        if (module.Lessons.Count == 0 && !string.IsNullOrWhiteSpace(body))
            module.Lessons.Add(MakeLesson(0, module.Title, body));
    }

    private static Lesson MakeLesson(int order, string title, string content)
    {
        var words = content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
        return new Lesson
        {
            Order = order,
            Title = title,
            ContentMarkdown = content,
            EstimatedMinutes = Math.Clamp((int)Math.Ceiling(words / 180.0), 2, 30),
        };
    }

    /// <summary>Drops the document's own H1 title line from a preamble block.</summary>
    private static string StripTopTitle(string block)
    {
        var lines = Normalize(block);
        if (lines.Count > 0 && lines[0].StartsWith("# ") && !lines[0].StartsWith("## "))
            lines.RemoveAt(0);
        return string.Join('\n', lines).Trim('\n', ' ');
    }

    private static string StripRules(string s) => s.Replace("---", "").Trim();

    private static string ToTitleCasePart(string raw)
    {
        // "PART I — GRAPH READING" -> "Part I — Graph Reading"
        var ti = System.Globalization.CultureInfo.InvariantCulture.TextInfo;
        return ti.ToTitleCase(raw.ToLowerInvariant()).Replace("Ii", "II");
    }
}
