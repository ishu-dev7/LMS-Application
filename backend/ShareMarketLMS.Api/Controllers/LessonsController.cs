using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/lessons")]
[Authorize]
public class LessonsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LessonDetailDto>> Get(int id, [FromQuery] int? userId = null)
    {
        var uid = this.ResolveUserId(userId);

        if (!await this.CanAccessLesson(db, id, uid)) return Forbid();

        var lesson = await db.Lessons
            .Include(l => l.Module)!.ThenInclude(m => m!.Course)
            .Include(l => l.Attachments)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson?.Module?.Course is null) return NotFound();

        var courseLessonIds = await db.Lessons
            .Where(l => l.Module!.CourseId == lesson.Module!.CourseId)
            .OrderBy(l => l.Module!.Order).ThenBy(l => l.Order)
            .Select(l => l.Id)
            .ToListAsync();
        var pos = courseLessonIds.IndexOf(id);

        var completed = await db.LessonProgress.AnyAsync(p => p.UserId == uid && p.LessonId == id);

        return new LessonDetailDto(
            lesson.Id, lesson.Title, lesson.ContentMarkdown, lesson.EstimatedMinutes, completed,
            lesson.ModuleId, lesson.Module.Title, lesson.Module.Course.Slug, lesson.Module.Course.Title,
            pos > 0 ? courseLessonIds[pos - 1] : null,
            pos >= 0 && pos < courseLessonIds.Count - 1 ? courseLessonIds[pos + 1] : null,
            lesson.Attachments.Select(a => new LessonAttachmentDto(a.Id, a.FileName, a.ContentType, a.FileSize)).ToList()
        );
    }

    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var userId = this.UserId();
        if (!await db.Lessons.AnyAsync(l => l.Id == id)) return NotFound();
        if (!await db.LessonProgress.AnyAsync(p => p.UserId == userId && p.LessonId == id))
        {
            db.LessonProgress.Add(new LessonProgress { UserId = userId, LessonId = id });
            await db.SaveChangesAsync();
        }
        return NoContent();
    }

    [HttpDelete("{id:int}/complete")]
    public async Task<IActionResult> Uncomplete(int id)
    {
        var userId = this.UserId();
        var row = await db.LessonProgress.FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == id);
        if (row is not null)
        {
            db.LessonProgress.Remove(row);
            await db.SaveChangesAsync();
        }
        return NoContent();
    }
}
