using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;

namespace ShareMarketLMS.Api.Controllers;

public static class ControllerExtensions
{
    // ── identity helpers ────────────────────────────────────────────────────

    /// <summary>userId from the JWT token.</summary>
    public static int UserId(this ControllerBase c) =>
        int.Parse(c.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Role string from the JWT token ("Admin" | "Learner").</summary>
    public static string UserRole(this ControllerBase c) =>
        c.User.FindFirstValue(ClaimTypes.Role) ?? "Learner";

    /// <summary>True when the token carries the Admin role.</summary>
    public static bool IsAdmin(this ControllerBase c) =>
        c.User.IsInRole("Admin");

    // ── effective-user resolution ────────────────────────────────────────────

    /// <summary>
    /// Returns the userId to use for data queries.
    /// - Admins may pass an explicit <paramref name="forUserId"/> to impersonate / view-as that user.
    /// - Learners always get their own token userId (the <paramref name="forUserId"/> is ignored).
    /// </summary>
    public static int ResolveUserId(this ControllerBase c, int? forUserId = null) =>
        c.IsAdmin() && forUserId.HasValue ? forUserId.Value : c.UserId();

    // ── enrollment access check ──────────────────────────────────────────────

    /// <summary>
    /// Checks whether <paramref name="userId"/> may access <paramref name="courseId"/>.
    /// Admins always can. Learners must have a CourseEnrollment row.
    /// </summary>
    public static async Task<bool> CanAccessCourse(
        this ControllerBase c, AppDbContext db, int courseId, int? forUserId = null)
    {
        if (c.IsAdmin()) return true;
        var uid = c.ResolveUserId(forUserId);
        return await db.CourseEnrollments
            .AnyAsync(e => e.UserId == uid && e.CourseId == courseId);
    }

    /// <summary>
    /// Convenience: resolve the course that contains <paramref name="lessonId"/> and
    /// call <see cref="CanAccessCourse"/>.
    /// </summary>
    public static async Task<bool> CanAccessLesson(
        this ControllerBase c, AppDbContext db, int lessonId, int? forUserId = null)
    {
        if (c.IsAdmin()) return true;
        var courseId = await db.Lessons
            .Where(l => l.Id == lessonId)
            .Select(l => (int?)l.Module!.CourseId)
            .FirstOrDefaultAsync();
        if (courseId is null) return false;
        return await c.CanAccessCourse(db, courseId.Value, forUserId);
    }

    /// <summary>
    /// Convenience: resolve the course that owns the quiz's module and
    /// call <see cref="CanAccessCourse"/>. Unassigned (pool) quizzes are not accessible to learners.
    /// </summary>
    public static async Task<bool> CanAccessQuiz(
        this ControllerBase c, AppDbContext db, int quizId, int? forUserId = null)
    {
        if (c.IsAdmin()) return true;
        var courseId = await db.Quizzes
            .Where(q => q.Id == quizId && q.Module != null)
            .Select(q => (int?)q.Module!.CourseId)
            .FirstOrDefaultAsync();
        if (courseId is null) return false;
        return await c.CanAccessCourse(db, courseId.Value, forUserId);
    }
}
