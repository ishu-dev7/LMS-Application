using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController(AppDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<ProgressSummaryDto>> Summary([FromQuery] int? userId = null)
    {
        var uid = this.ResolveUserId(userId);

        var completedLessonIds = await db.LessonProgress
            .Where(p => p.UserId == uid).Select(p => p.LessonId).ToHashSetAsync();
        var passedQuizIds = await db.QuizAttempts
            .Where(a => a.UserId == uid && a.Passed).Select(a => a.QuizId).Distinct().ToHashSetAsync();

        // Admin viewing their own summary → all courses.
        // Admin viewing ?userId=X → X's enrolled courses (to see exactly what that user sees).
        // Learner → always own enrolled courses.
        var showAll = this.IsAdmin() && !userId.HasValue;
        HashSet<int>? enrolledIds = null;
        if (!showAll)
            enrolledIds = await db.CourseEnrollments
                .Where(e => e.UserId == uid).Select(e => e.CourseId).ToHashSetAsync();

        var courses = await db.Courses
            .Where(c => showAll || enrolledIds!.Contains(c.Id))
            .OrderBy(c => c.Order)
            .Include(c => c.Modules.OrderBy(m => m.Order)).ThenInclude(m => m.Lessons)
            .Include(c => c.Modules).ThenInclude(m => m.Quiz)
            .AsSplitQuery()
            .ToListAsync();

        var courseSummaries = new List<CourseSummaryDto>();
        var tracker = new List<ModuleProgressDto>();
        int totalLessons = 0, totalQuizzes = 0;

        foreach (var course in courses)
        {
            var lessonIds = course.Modules.SelectMany(m => m.Lessons.Select(l => l.Id)).ToList();
            var done = lessonIds.Count(completedLessonIds.Contains);
            totalLessons += lessonIds.Count;
            courseSummaries.Add(new CourseSummaryDto(course.Id, course.Slug, course.Title, course.Description,
                course.Category, lessonIds.Count, done,
                lessonIds.Count == 0 ? 0 : (int)Math.Round(100.0 * done / lessonIds.Count)));

            foreach (var module in course.Modules)
            {
                if (module.Quiz is not null) totalQuizzes++;
                tracker.Add(new ModuleProgressDto(
                    course.Title, module.Title, module.Phase,
                    module.Lessons.Count(l => completedLessonIds.Contains(l.Id)), module.Lessons.Count,
                    module.Quiz is not null && passedQuizIds.Contains(module.Quiz.Id),
                    module.Quiz is not null));
            }
        }

        var journalDates = await db.JournalEntries
            .Where(j => j.UserId == uid)
            .OrderByDescending(j => j.EntryDate)
            .Select(j => j.EntryDate)
            .ToListAsync();

        return new ProgressSummaryDto(
            courseSummaries,
            completedLessonIds.Count, totalLessons,
            passedQuizIds.Count, totalQuizzes,
            journalDates.Count, ComputeStreak(journalDates),
            tracker);
    }

    /// <summary>Consecutive journaled days counting back from today (or yesterday, so an evening entry isn't required to keep a live streak).</summary>
    private static int ComputeStreak(List<DateOnly> datesDesc)
    {
        if (datesDesc.Count == 0) return 0;
        var today = DateOnly.FromDateTime(DateTime.Now);
        var anchor = datesDesc[0] == today ? today
                   : datesDesc[0] == today.AddDays(-1) ? today.AddDays(-1)
                   : default;
        if (anchor == default) return 0;

        var streak = 0;
        var expected = anchor;
        foreach (var d in datesDesc)
        {
            if (d != expected) break;
            streak++;
            expected = expected.AddDays(-1);
        }
        return streak;
    }
}
