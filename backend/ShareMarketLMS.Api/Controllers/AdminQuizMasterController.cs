using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Controllers;

/// <summary>Standalone quiz + question management. Quizzes live in a pool (ModuleId = null)
/// until assigned to a topic. Deleting a topic returns its quiz to the pool (ON DELETE SET NULL).</summary>
[ApiController]
[Route("api/admin/quiz-master")]
[Authorize(Roles = "Admin")]
public class AdminQuizMasterController(AppDbContext db) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    // ---- quiz list & detail ----

    [HttpGet]
    public async Task<ActionResult<List<QuizMasterSummaryDto>>> List()
    {
        var quizzes = await db.Quizzes
            .Include(q => q.Module).ThenInclude(m => m!.Course)
            .Include(q => q.Questions)
            .OrderBy(q => q.Title)
            .ToListAsync();

        return quizzes.Select(q => new QuizMasterSummaryDto(
            q.Id, q.Title, q.QuizType, q.PassPercent,
            q.Questions.Count,
            q.ModuleId, q.Module?.Title, q.Module?.Course?.Title
        )).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuizMasterDetailDto>> Get(int id)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Module).ThenInclude(m => m!.Course)
            .Include(q => q.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz is null) return NotFound();

        return new QuizMasterDetailDto(
            quiz.Id, quiz.Title, quiz.QuizType, quiz.PassPercent,
            quiz.ModuleId, quiz.Module?.Title, quiz.Module?.Course?.Title,
            quiz.Questions.Select(q => new QuizQuestionDetailDto(
                q.Id, q.Order, q.Text,
                JsonSerializer.Deserialize<List<string>>(q.OptionsJson, JsonOpts) ?? [],
                q.CorrectIndex, q.Explanation
            )).ToList()
        );
    }

    // ---- quiz CRUD ----

    [HttpPost]
    public async Task<ActionResult<AdminIdDto>> Create(QuizMasterUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Quiz title is required." });
        var quiz = new Quiz
        {
            Title = req.Title.Trim(),
            QuizType = string.IsNullOrWhiteSpace(req.QuizType) ? "Exercise" : req.QuizType,
            PassPercent = Math.Clamp(req.PassPercent, 0, 100),
        };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(quiz.Id));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, QuizMasterUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Quiz title is required." });
        var quiz = await db.Quizzes.FindAsync(id);
        if (quiz is null) return NotFound();
        quiz.Title = req.Title.Trim();
        quiz.QuizType = string.IsNullOrWhiteSpace(req.QuizType) ? "Exercise" : req.QuizType;
        quiz.PassPercent = Math.Clamp(req.PassPercent, 0, 100);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var quiz = await db.Quizzes.FindAsync(id);
        if (quiz is null) return NotFound();
        await db.QuizAttempts.Where(a => a.QuizId == id).ExecuteDeleteAsync();
        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- question CRUD ----

    [HttpPost("{id:int}/questions")]
    public async Task<ActionResult<AdminIdDto>> AddQuestion(int id, QuestionUpsertRequest req)
    {
        if (!await db.Quizzes.AnyAsync(q => q.Id == id)) return NotFound(new { message = "Quiz not found." });
        var order = await db.Questions.CountAsync(q => q.QuizId == id);
        var question = BuildQuestion(id, order, req);
        db.Questions.Add(question);
        await db.SaveChangesAsync();
        return Ok(new AdminIdDto(question.Id));
    }

    [HttpPut("questions/{questionId:int}")]
    public async Task<IActionResult> UpdateQuestion(int questionId, QuestionUpsertRequest req)
    {
        var question = await db.Questions.FindAsync(questionId);
        if (question is null) return NotFound();
        question.Text = req.Text;
        question.OptionsJson = OptionsJson(req);
        question.CorrectIndex = Math.Clamp(req.CorrectIndex, 0, 3);
        question.Explanation = req.Explanation;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("questions/{questionId:int}")]
    public async Task<IActionResult> DeleteQuestion(int questionId)
    {
        var question = await db.Questions.FindAsync(questionId);
        if (question is null) return NotFound();
        db.Questions.Remove(question);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- topic picker & assignment ----

    /// <summary>Flat list of all topics across all courses — used by the assign modal.</summary>
    [HttpGet("topics")]
    public async Task<ActionResult<List<TopicPickerDto>>> GetTopics()
    {
        var topics = await db.Modules
            .Include(m => m.Course)
            .OrderBy(m => m.Course!.Order).ThenBy(m => m.Order)
            .Select(m => new TopicPickerDto(m.Id, m.Title, m.TopicType, m.Course!.Title, m.CourseId))
            .ToListAsync();
        return topics;
    }

    [HttpPost("{id:int}/assign")]
    public async Task<IActionResult> Assign(int id, QuizAssignRequest req)
    {
        var quiz = await db.Quizzes.FindAsync(id);
        if (quiz is null) return NotFound(new { message = "Quiz not found." });
        if (!await db.Modules.AnyAsync(m => m.Id == req.TopicId))
            return NotFound(new { message = "Topic not found." });
        if (await db.Quizzes.AnyAsync(q => q.ModuleId == req.TopicId && q.Id != id))
            return Conflict(new { message = "That topic already has a quiz assigned. Unassign it first." });

        quiz.ModuleId = req.TopicId;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/assign")]
    public async Task<IActionResult> Unassign(int id)
    {
        var quiz = await db.Quizzes.FindAsync(id);
        if (quiz is null) return NotFound();
        quiz.ModuleId = null;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- helpers ----

    private static Question BuildQuestion(int quizId, int order, QuestionUpsertRequest req) =>
        new()
        {
            QuizId = quizId, Order = order,
            Text = req.Text, OptionsJson = OptionsJson(req),
            CorrectIndex = Math.Clamp(req.CorrectIndex, 0, 3),
            Explanation = req.Explanation,
        };

    private static string OptionsJson(QuestionUpsertRequest req) =>
        JsonSerializer.Serialize(new[] { req.OptionA, req.OptionB, req.OptionC, req.OptionD });
}
