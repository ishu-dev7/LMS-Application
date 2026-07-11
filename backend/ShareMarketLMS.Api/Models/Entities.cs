using System.ComponentModel.DataAnnotations;

namespace ShareMarketLMS.Api.Models;

public class User
{
    public int Id { get; set; }
    [MaxLength(256)] public string Email { get; set; } = "";
    [MaxLength(100)] public string DisplayName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    [MaxLength(20)] public string Role { get; set; } = "Learner";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<LessonProgress> LessonProgress { get; set; } = [];
    public List<QuizAttempt> QuizAttempts { get; set; } = [];
    public List<JournalEntry> JournalEntries { get; set; } = [];
    public List<CourseEnrollment> Enrollments { get; set; } = [];
}

public class Course
{
    public int Id { get; set; }
    [MaxLength(100)] public string Slug { get; set; } = "";
    [MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    public int Order { get; set; }

    public List<Module> Modules { get; set; } = [];
    public List<CourseEnrollment> Enrollments { get; set; } = [];
}

public class Module
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course? Course { get; set; }
    public int Order { get; set; }
    [MaxLength(300)] public string Title { get; set; } = "";
    [MaxLength(200)] public string Phase { get; set; } = "";
    /// <summary>Regular | InterviewReady</summary>
    [MaxLength(50)] public string TopicType { get; set; } = "Regular";

    public List<Lesson> Lessons { get; set; } = [];
    public Quiz? Quiz { get; set; }
}

public class Lesson
{
    public int Id { get; set; }
    public int ModuleId { get; set; }
    public Module? Module { get; set; }
    public int Order { get; set; }
    [MaxLength(300)] public string Title { get; set; } = "";
    public string ContentMarkdown { get; set; } = "";
    public int EstimatedMinutes { get; set; }

    public List<LessonProgress> Progress { get; set; } = [];
    public List<LessonAttachment> Attachments { get; set; } = [];
}

public class LessonAttachment
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    [MaxLength(300)] public string FileName { get; set; } = "";
    [MaxLength(500)] public string StoredPath { get; set; } = "";
    [MaxLength(200)] public string ContentType { get; set; } = "";
    public long FileSize { get; set; }
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}

public class Quiz
{
    public int Id { get; set; }
    /// <summary>null = in pool (unassigned); set = attached to this topic/module.</summary>
    public int? ModuleId { get; set; }
    public Module? Module { get; set; }
    [MaxLength(300)] public string Title { get; set; } = "";
    public int PassPercent { get; set; } = 70;
    /// <summary>Exercise | Evaluation</summary>
    [MaxLength(50)] public string QuizType { get; set; } = "Exercise";

    public List<Question> Questions { get; set; } = [];
    public List<QuizAttempt> Attempts { get; set; } = [];
}

public class Question
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    public Quiz? Quiz { get; set; }
    public int Order { get; set; }
    public string Text { get; set; } = "";
    public string OptionsJson { get; set; } = "[]";
    public int CorrectIndex { get; set; }
    public string Explanation { get; set; } = "";
}

public class LessonProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    public DateTime CompletedAtUtc { get; set; } = DateTime.UtcNow;
}

public class QuizAttempt
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int QuizId { get; set; }
    public Quiz? Quiz { get; set; }
    public int ScorePercent { get; set; }
    public bool Passed { get; set; }
    public DateTime AttemptedAtUtc { get; set; } = DateTime.UtcNow;
}

public class CourseEnrollment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int CourseId { get; set; }
    public Course? Course { get; set; }
    public DateTime EnrolledAtUtc { get; set; } = DateTime.UtcNow;
}

public class JournalEntry
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateOnly EntryDate { get; set; }
    [MaxLength(500)] public string NiftyMove { get; set; } = "";
    [MaxLength(1000)] public string WhyGuess { get; set; } = "";
    [MaxLength(500)] public string FiiDii { get; set; } = "";
    [MaxLength(500)] public string Sectors { get; set; } = "";
    [MaxLength(1000)] public string Surprise { get; set; } = "";
    [MaxLength(50)] public string MarketState { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
