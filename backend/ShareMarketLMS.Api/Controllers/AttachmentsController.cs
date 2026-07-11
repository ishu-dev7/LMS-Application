using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;

namespace ShareMarketLMS.Api.Controllers;

/// <summary>Serves lesson attachment files to authenticated users.</summary>
[ApiController]
[Route("api/attachments")]
[Authorize]
public class AttachmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Download(int id)
    {
        var att = await db.LessonAttachments.FirstOrDefaultAsync(a => a.Id == id);
        if (att is null) return NotFound();
        if (!System.IO.File.Exists(att.StoredPath)) return NotFound();

        var stream = new FileStream(att.StoredPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(stream, att.ContentType, att.FileName);
    }
}
