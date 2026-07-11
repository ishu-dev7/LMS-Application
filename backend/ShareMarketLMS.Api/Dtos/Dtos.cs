namespace ShareMarketLMS.Api.Dtos;

// ---- Auth ----
public record RegisterRequest(string Email, string DisplayName, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, int UserId, string Email, string DisplayName, string Role);

// ---- Courses ----
public record CourseSummaryDto(int Id, string Slug, string Title, string Description, string Category,
    int TotalLessons, int CompletedLessons, int PercentComplete);

public record CourseDetailDto(int Id, string Slug, string Title, string Description, List<ModuleDto> Modules);

public record ModuleDto(int Id, int Order, string Title, string Phase, string TopicType,
    List<LessonSummaryDto> Lessons, QuizMetaDto? Quiz);

public record LessonSummaryDto(int Id, int Order, string Title, int EstimatedMinutes, bool Completed);

public record QuizMetaDto(int QuizId, string Title, string QuizType, int QuestionCount, int PassPercent,
    int? BestScorePercent, bool Passed);

// ---- Lessons ----
public record LessonAttachmentDto(int Id, string FileName, string ContentType, long FileSize);

public record LessonDetailDto(int Id, string Title, string ContentMarkdown, int EstimatedMinutes,
    bool Completed, int ModuleId, string ModuleTitle, string CourseSlug, string CourseTitle,
    int? PrevLessonId, int? NextLessonId, List<LessonAttachmentDto> Attachments);

// ---- Quizzes ----
public record QuizDto(int Id, string Title, int PassPercent, string ModuleTitle, List<QuizQuestionDto> Questions);
public record QuizQuestionDto(int Id, int Order, string Text, List<string> Options);

public record QuizSubmission(List<QuizAnswer> Answers);
public record QuizAnswer(int QuestionId, int SelectedIndex);

public record QuizResultDto(int ScorePercent, bool Passed, int Correct, int Total, List<QuestionResultDto> Questions);
public record QuestionResultDto(int QuestionId, bool Correct, int CorrectIndex, int SelectedIndex, string Explanation);

// ---- Journal ----
public record JournalEntryDto(int Id, string EntryDate, string NiftyMove, string WhyGuess,
    string FiiDii, string Sectors, string Surprise, string MarketState);
public record JournalUpsertRequest(string EntryDate, string NiftyMove, string WhyGuess,
    string FiiDii, string Sectors, string Surprise, string MarketState);

// ---- Admin course setup ----
public record CourseUpsertRequest(string Slug, string Title, string Description, string Category, int Order);
public record ModuleUpsertRequest(int CourseId, string Title, string Phase, int Order, string TopicType);
public record LessonUpsertRequest(int ModuleId, string Title, string ContentMarkdown, int Order);
public record AdminIdDto(int Id);

// ---- Admin quiz master ----
public record QuizMasterSummaryDto(int Id, string Title, string QuizType, int PassPercent,
    int QuestionCount, int? AssignedTopicId, string? AssignedTopicTitle, string? AssignedCourseTitle);

public record QuizMasterDetailDto(int Id, string Title, string QuizType, int PassPercent,
    int? AssignedTopicId, string? AssignedTopicTitle, string? AssignedCourseTitle,
    List<QuizQuestionDetailDto> Questions);

public record QuizQuestionDetailDto(int Id, int Order, string Text, List<string> Options,
    int CorrectIndex, string Explanation);

public record QuizMasterUpsertRequest(string Title, string QuizType, int PassPercent);

public record QuestionUpsertRequest(string Text, string OptionA, string OptionB, string OptionC, string OptionD,
    int CorrectIndex, string Explanation);

public record QuizAssignRequest(int TopicId);

public record TopicPickerDto(int Id, string Title, string TopicType, string CourseTitle, int CourseId);

// ---- Admin user management ----
public record AdminUserDto(int Id, string Email, string DisplayName, string Role,
    string CreatedAt, int EnrollmentCount);

public record CreateUserRequest(string Email, string DisplayName, string Password, string Role);

public record UpdateUserRequest(string DisplayName, string Role, string? NewPassword);

public record CourseEnrollmentDto(int CourseId, string Slug, string Title, string Category, bool Enrolled);

// ---- Progress ----
public record ProgressSummaryDto(List<CourseSummaryDto> Courses, int LessonsCompleted, int TotalLessons,
    int QuizzesPassed, int TotalQuizzes, int JournalEntries, int JournalStreakDays,
    List<ModuleProgressDto> ModuleTracker);
public record ModuleProgressDto(string CourseTitle, string Module, string Phase,
    int LessonsDone, int LessonsTotal, bool QuizPassed, bool HasQuiz);
