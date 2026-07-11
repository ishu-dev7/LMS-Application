using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;
using ShareMarketLMS.Api.Services;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUserManagementController(AppDbContext db, PasswordHasher hasher) : ControllerBase
{
    // GET /api/admin/users
    [HttpGet]
    public async Task<ActionResult<List<AdminUserDto>>> List()
    {
        var users = await db.Users
            .Include(u => u.Enrollments)
            .OrderBy(u => u.CreatedAtUtc)
            .ToListAsync();
        return users.Select(u => new AdminUserDto(
            u.Id, u.Email, u.DisplayName, u.Role,
            u.CreatedAtUtc.ToString("yyyy-MM-dd"),
            u.Enrollments.Count)).ToList();
    }

    // POST /api/admin/users
    [HttpPost]
    public async Task<ActionResult<AdminUserDto>> Create(CreateUserRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already in use." });

        var user = new User
        {
            Email = req.Email.Trim().ToLower(),
            DisplayName = req.DisplayName.Trim(),
            PasswordHash = hasher.Hash(req.Password),
            Role = req.Role is "Admin" or "Learner" ? req.Role : "Learner",
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return new AdminUserDto(user.Id, user.Email, user.DisplayName, user.Role,
            user.CreatedAtUtc.ToString("yyyy-MM-dd"), 0);
    }

    // PUT /api/admin/users/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateUserRequest req)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.DisplayName = req.DisplayName.Trim();
        user.Role = req.Role is "Admin" or "Learner" ? req.Role : user.Role;
        if (!string.IsNullOrWhiteSpace(req.NewPassword))
            user.PasswordHash = hasher.Hash(req.NewPassword);

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        if (user.Role == "Admin" && await db.Users.CountAsync(u => u.Role == "Admin") == 1)
            return BadRequest(new { message = "Cannot delete the last admin account." });

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/admin/users/{id}/enrollments
    // Returns all courses with an "enrolled" flag for each.
    [HttpGet("{id:int}/enrollments")]
    public async Task<ActionResult<List<CourseEnrollmentDto>>> GetEnrollments(int id)
    {
        if (!await db.Users.AnyAsync(u => u.Id == id)) return NotFound();

        var enrolled = await db.CourseEnrollments
            .Where(e => e.UserId == id)
            .Select(e => e.CourseId)
            .ToHashSetAsync();

        var courses = await db.Courses
            .OrderBy(c => c.Order)
            .Select(c => new CourseEnrollmentDto(c.Id, c.Slug, c.Title, c.Category,
                enrolled.Contains(c.Id)))
            .ToListAsync();

        return courses;
    }

    // POST /api/admin/users/{id}/enrollments/{courseId}
    [HttpPost("{id:int}/enrollments/{courseId:int}")]
    public async Task<IActionResult> Enroll(int id, int courseId)
    {
        if (!await db.Users.AnyAsync(u => u.Id == id)) return NotFound();
        if (!await db.Courses.AnyAsync(c => c.Id == courseId)) return NotFound();
        if (await db.CourseEnrollments.AnyAsync(e => e.UserId == id && e.CourseId == courseId))
            return Conflict(new { message = "Already enrolled." });

        db.CourseEnrollments.Add(new CourseEnrollment { UserId = id, CourseId = courseId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/users/{id}/enrollments/{courseId}
    [HttpDelete("{id:int}/enrollments/{courseId:int}")]
    public async Task<IActionResult> Unenroll(int id, int courseId)
    {
        var enrollment = await db.CourseEnrollments
            .FirstOrDefaultAsync(e => e.UserId == id && e.CourseId == courseId);
        if (enrollment is null) return NotFound();

        db.CourseEnrollments.Remove(enrollment);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
