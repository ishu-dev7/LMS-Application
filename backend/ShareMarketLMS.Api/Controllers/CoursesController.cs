using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize]
public class CoursesController(AppDbContext db, DapperContext dapper) : ControllerBase
{
    private record CourseRow(int Id, string Slug, string Title, string Description, string Category,
        int TotalLessons, int CompletedLessons);

    [HttpGet]
    public async Task<ActionResult<List<CourseSummaryDto>>> List([FromQuery] int? userId = null)
    {
        var uid = this.ResolveUserId(userId);

        // Admin with no ?userId → sees all courses (admin dashboard).
        // Admin with ?userId=X → sees X's enrolled courses (view-as-user).
        // Learner → always own enrolled courses only.
        var showAll = this.IsAdmin() && !userId.HasValue;

        const string sql = """
            SELECT c."Id", c."Slug", c."Title", c."Description", c."Category",
                   COUNT(l."Id")::int AS "TotalLessons",
                   COUNT(lp."Id")::int AS "CompletedLessons"
            FROM "Courses" c
            LEFT JOIN "Modules" m ON m."CourseId" = c."Id"
            LEFT JOIN "Lessons" l ON l."ModuleId" = m."Id"
            LEFT JOIN "LessonProgress" lp ON lp."LessonId" = l."Id" AND lp."UserId" = @Uid
            WHERE @ShowAll = 1 OR EXISTS (
                SELECT 1 FROM "CourseEnrollments" e WHERE e."UserId" = @Uid AND e."CourseId" = c."Id"
            )
            GROUP BY c."Id", c."Slug", c."Title", c."Description", c."Category", c."Order"
            ORDER BY c."Order"
            """;

        using var conn = dapper.CreateConnection();
        var rows = await conn.QueryAsync<CourseRow>(sql, new { Uid = uid, ShowAll = showAll ? 1 : 0 });

        return rows.Select(c => new CourseSummaryDto(
            c.Id, c.Slug, c.Title, c.Description, c.Category, c.TotalLessons, c.CompletedLessons,
            c.TotalLessons == 0 ? 0 : (int)Math.Round(100.0 * c.CompletedLessons / c.TotalLessons)
        )).ToList();
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CourseDetailDto>> Detail(string slug, [FromQuery] int? userId = null)
    {
        var uid = this.ResolveUserId(userId);

        var course = await db.Courses
            .Include(c => c.Modules.OrderBy(m => m.Order)).ThenInclude(m => m.Lessons.OrderBy(l => l.Order))
            .Include(c => c.Modules).ThenInclude(m => m.Quiz).ThenInclude(q => q!.Questions)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Slug == slug);
        if (course is null) return NotFound();

        if (!await this.CanAccessCourse(db, course.Id, uid)) return Forbid();

        var completed = await db.LessonProgress
            .Where(p => p.UserId == uid).Select(p => p.LessonId).ToHashSetAsync();
        var attempts = await db.QuizAttempts
            .Where(a => a.UserId == uid).ToListAsync();

        var modules = course.Modules.Select(m =>
        {
            QuizMetaDto? quizMeta = null;
            if (m.Quiz is not null)
            {
                var quizAttempts = attempts.Where(a => a.QuizId == m.Quiz.Id).ToList();
                quizMeta = new QuizMetaDto(
                    m.Quiz.Id, m.Quiz.Title, m.Quiz.QuizType, m.Quiz.Questions.Count, m.Quiz.PassPercent,
                    quizAttempts.Count > 0 ? quizAttempts.Max(a => a.ScorePercent) : null,
                    quizAttempts.Any(a => a.Passed));
            }
            return new ModuleDto(m.Id, m.Order, m.Title, m.Phase, m.TopicType,
                m.Lessons.Select(l => new LessonSummaryDto(l.Id, l.Order, l.Title, l.EstimatedMinutes,
                    completed.Contains(l.Id))).ToList(),
                quizMeta);
        }).ToList();

        return new CourseDetailDto(course.Id, course.Slug, course.Title, course.Description, modules);
    }
}
