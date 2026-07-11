using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    // ---- courses ----

    [HttpPost("courses")]
    public async Task<ActionResult<AdminIdDto>> CreateCourse(CourseUpsertRequest req)
    {
        var err = ValidateCourse(req);
        if (err is not null) return BadRequest(new { message = err });
        if (await db.Courses.AnyAsync(c => c.Slug == req.Slug))
            return Conflict(new { message = $"A course with slug '{req.Slug}' already exists." });

        var course = new Course
        {
            Slug = req.Slug.Trim(), Title = req.Title.Trim(),
            Description = req.Description?.Trim() ?? "", Category = req.Category?.Trim() ?? "General",
            Order = req.Order,
        };
        db.Courses.Add(course);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(course.Id));
    }

    [HttpPut("courses/{id:int}")]
    public async Task<IActionResult> UpdateCourse(int id, CourseUpsertRequest req)
    {
        var err = ValidateCourse(req);
        if (err is not null) return BadRequest(new { message = err });
        var course = await db.Courses.FindAsync(id);
        if (course is null) return NotFound();
        if (await db.Courses.AnyAsync(c => c.Slug == req.Slug && c.Id != id))
            return Conflict(new { message = $"Another course already uses slug '{req.Slug}'." });

        course.Slug = req.Slug.Trim();
        course.Title = req.Title.Trim();
        course.Description = req.Description?.Trim() ?? "";
        course.Category = req.Category?.Trim() ?? "General";
        course.Order = req.Order;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("courses/{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await db.Courses.FindAsync(id);
        if (course is null) return NotFound();

        // Collect quiz IDs before cascade deletes modules (SetNull on module FK would then lose the link).
        var quizIds = await db.Quizzes
            .Where(q => q.Module!.CourseId == id)
            .Select(q => q.Id)
            .ToListAsync();
        if (quizIds.Count > 0)
            await db.QuizAttempts.Where(a => quizIds.Contains(a.QuizId)).ExecuteDeleteAsync();

        db.Courses.Remove(course);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- topics (modules) ----

    [HttpPost("modules")]
    public async Task<ActionResult<AdminIdDto>> CreateModule(ModuleUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Topic title is required." });
        if (!await db.Courses.AnyAsync(c => c.Id == req.CourseId)) return NotFound(new { message = "Course not found." });

        var module = new Module
        {
            CourseId = req.CourseId, Title = req.Title.Trim(),
            Phase = req.Phase?.Trim() ?? "", Order = req.Order,
            TopicType = string.IsNullOrWhiteSpace(req.TopicType) ? "Regular" : req.TopicType,
        };
        db.Modules.Add(module);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(module.Id));
    }

    [HttpPut("modules/{id:int}")]
    public async Task<IActionResult> UpdateModule(int id, ModuleUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Topic title is required." });
        var module = await db.Modules.FindAsync(id);
        if (module is null) return NotFound();
        module.Title = req.Title.Trim();
        module.Phase = req.Phase?.Trim() ?? "";
        module.Order = req.Order;
        module.TopicType = string.IsNullOrWhiteSpace(req.TopicType) ? "Regular" : req.TopicType;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("modules/{id:int}")]
    public async Task<IActionResult> DeleteModule(int id)
    {
        // Load with quiz so we can delete its attempts before SetNull fires.
        var module = await db.Modules.Include(m => m.Quiz).FirstOrDefaultAsync(m => m.Id == id);
        if (module is null) return NotFound();
        if (module.Quiz is not null)
            await db.QuizAttempts.Where(a => a.QuizId == module.Quiz.Id).ExecuteDeleteAsync();

        db.Modules.Remove(module);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- lessons ----

    [HttpPost("lessons")]
    public async Task<ActionResult<AdminIdDto>> CreateLesson(LessonUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Lesson title is required." });
        if (!await db.Modules.AnyAsync(m => m.Id == req.ModuleId)) return NotFound(new { message = "Topic not found." });

        var lesson = new Lesson
        {
            ModuleId = req.ModuleId, Title = req.Title.Trim(),
            ContentMarkdown = req.ContentMarkdown ?? "", Order = req.Order,
            EstimatedMinutes = EstimateMinutes(req.ContentMarkdown),
        };
        db.Lessons.Add(lesson);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(lesson.Id));
    }

    [HttpPut("lessons/{id:int}")]
    public async Task<IActionResult> UpdateLesson(int id, LessonUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Lesson title is required." });
        var lesson = await db.Lessons.FindAsync(id);
        if (lesson is null) return NotFound();
        lesson.Title = req.Title.Trim();
        lesson.ContentMarkdown = req.ContentMarkdown ?? "";
        lesson.Order = req.Order;
        lesson.EstimatedMinutes = EstimateMinutes(req.ContentMarkdown);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("lessons/{id:int}")]
    public async Task<IActionResult> DeleteLesson(int id)
    {
        var lesson = await db.Lessons.Include(l => l.Attachments).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null) return NotFound();
        DeleteAttachmentFiles(lesson.Attachments);
        db.Lessons.Remove(lesson);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- lesson attachments ----

    [HttpPost("lessons/{id:int}/attachments")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(52_428_800)] // 50 MB
    public async Task<ActionResult<AdminIdDto>> UploadAttachment(int id, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file provided." });
        if (!await db.Lessons.AnyAsync(l => l.Id == id)) return NotFound(new { message = "Lesson not found." });

        var dir = Path.Combine(env.ContentRootPath, "uploads", "lessons", id.ToString());
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        var storedName = $"{Guid.NewGuid()}{ext}";
        var storedPath = Path.Combine(dir, storedName);

        await using (var stream = new FileStream(storedPath, FileMode.Create))
            await file.CopyToAsync(stream);

        var att = new LessonAttachment
        {
            LessonId = id, FileName = file.FileName,
            StoredPath = storedPath, ContentType = file.ContentType, FileSize = file.Length,
        };
        db.LessonAttachments.Add(att);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(att.Id));
    }

    [HttpDelete("lessons/{lessonId:int}/attachments/{attachmentId:int}")]
    public async Task<IActionResult> DeleteAttachment(int lessonId, int attachmentId)
    {
        var att = await db.LessonAttachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.LessonId == lessonId);
        if (att is null) return NotFound();
        DeleteAttachmentFiles([att]);
        db.LessonAttachments.Remove(att);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- helpers ----

    private static string? ValidateCourse(CourseUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return "Course title is required.";
        if (string.IsNullOrWhiteSpace(req.Slug)) return "Course slug is required.";
        if (!System.Text.RegularExpressions.Regex.IsMatch(req.Slug, "^[a-z0-9-]+$"))
            return "Slug must contain only lowercase letters, digits and hyphens.";
        return null;
    }

    private static int EstimateMinutes(string? content)
    {
        var words = (content ?? "").Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
        return Math.Clamp((int)Math.Ceiling(words / 180.0), 2, 30);
    }

    private static void DeleteAttachmentFiles(IEnumerable<LessonAttachment> attachments)
    {
        foreach (var a in attachments)
            if (!string.IsNullOrEmpty(a.StoredPath) && System.IO.File.Exists(a.StoredPath))
                System.IO.File.Delete(a.StoredPath);
    }
}
