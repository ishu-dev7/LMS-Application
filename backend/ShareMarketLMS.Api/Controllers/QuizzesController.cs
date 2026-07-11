using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
[Authorize]
public class QuizzesController(AppDbContext db) : ControllerBase
{
    [HttpGet("{quizId:int}")]
    public async Task<ActionResult<QuizDto>> Get(int quizId, [FromQuery] int? userId = null)
    {
        var uid = this.ResolveUserId(userId);
        if (!await this.CanAccessQuiz(db, quizId, uid)) return Forbid();

        var quiz = await db.Quizzes
            .Include(q => q.Module)
            .Include(q => q.Questions.OrderBy(x => x.Order))
            .FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz is null) return NotFound();

        return new QuizDto(quiz.Id, quiz.Title, quiz.PassPercent, quiz.Module?.Title ?? "",
            quiz.Questions.Select(q => new QuizQuestionDto(q.Id, q.Order, q.Text,
                JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? [])).ToList());
    }

    [HttpPost("{quizId:int}/submit")]
    public async Task<ActionResult<QuizResultDto>> Submit(int quizId, QuizSubmission submission)
    {
        var userId = this.UserId(); // submit always uses the caller's own identity
        if (!await this.CanAccessQuiz(db, quizId, userId)) return Forbid();

        var quiz = await db.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz is null) return NotFound();

        var answers = submission.Answers.ToDictionary(a => a.QuestionId, a => a.SelectedIndex);
        var results = quiz.Questions.OrderBy(q => q.Order).Select(q =>
        {
            var selected = answers.GetValueOrDefault(q.Id, -1);
            return new QuestionResultDto(q.Id, selected == q.CorrectIndex, q.CorrectIndex, selected, q.Explanation);
        }).ToList();

        var correct = results.Count(r => r.Correct);
        var score = quiz.Questions.Count == 0 ? 0 : (int)Math.Round(100.0 * correct / quiz.Questions.Count);
        var passed = score >= quiz.PassPercent;

        db.QuizAttempts.Add(new QuizAttempt
        {
            UserId = userId, QuizId = quizId, ScorePercent = score, Passed = passed,
        });
        await db.SaveChangesAsync();

        return new QuizResultDto(score, passed, correct, quiz.Questions.Count, results);
    }
}
