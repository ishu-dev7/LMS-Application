using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonAttachment> LessonAttachments => Set<LessonAttachment>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<LessonProgress> LessonProgress => Set<LessonProgress>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(u => u.Email).IsUnique();
        b.Entity<Course>().HasIndex(c => c.Slug).IsUnique();

        b.Entity<Module>()
            .HasOne(m => m.Course).WithMany(c => c.Modules)
            .HasForeignKey(m => m.CourseId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Lesson>()
            .HasOne(l => l.Module).WithMany(m => m.Lessons)
            .HasForeignKey(l => l.ModuleId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<LessonAttachment>()
            .HasOne(a => a.Lesson).WithMany(l => l.Attachments)
            .HasForeignKey(a => a.LessonId).OnDelete(DeleteBehavior.Cascade);

        // Quiz is optional (ModuleId nullable). ON DELETE SET NULL so that deleting a
        // module returns its quiz to the unassigned pool rather than destroying it.
        b.Entity<Quiz>()
            .HasOne(q => q.Module).WithOne(m => m.Quiz)
            .HasForeignKey<Quiz>(q => q.ModuleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Question>()
            .HasOne(q => q.Quiz).WithMany(z => z.Questions)
            .HasForeignKey(q => q.QuizId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<LessonProgress>()
            .HasIndex(p => new { p.UserId, p.LessonId }).IsUnique();
        b.Entity<LessonProgress>()
            .HasOne(p => p.Lesson).WithMany(l => l.Progress)
            .HasForeignKey(p => p.LessonId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<LessonProgress>()
            .HasOne(p => p.User).WithMany(u => u.LessonProgress)
            .HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<QuizAttempt>()
            .HasOne(a => a.Quiz).WithMany(q => q.Attempts)
            .HasForeignKey(a => a.QuizId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<QuizAttempt>()
            .HasOne(a => a.User).WithMany(u => u.QuizAttempts)
            .HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.ClientCascade);

        b.Entity<CourseEnrollment>()
            .HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
        b.Entity<CourseEnrollment>()
            .HasOne(e => e.User).WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<CourseEnrollment>()
            .HasOne(e => e.Course).WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<JournalEntry>()
            .HasIndex(j => new { j.UserId, j.EntryDate }).IsUnique();
        b.Entity<JournalEntry>()
            .HasOne(j => j.User).WithMany(u => u.JournalEntries)
            .HasForeignKey(j => j.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
