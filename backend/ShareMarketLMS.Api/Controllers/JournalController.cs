using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareMarketLMS.Api.Data;
using ShareMarketLMS.Api.Dtos;
using ShareMarketLMS.Api.Models;

namespace ShareMarketLMS.Api.Controllers;

[ApiController]
[Route("api/journal")]
[Authorize]
public class JournalController(AppDbContext db, DapperContext dapper) : ControllerBase
{
    private record JournalRow(int Id, DateTime EntryDate, string NiftyMove, string WhyGuess,
        string FiiDii, string Sectors, string Surprise, string MarketState);

    [HttpGet]
    public async Task<ActionResult<List<JournalEntryDto>>> List()
    {
        // Read-only flat list — Dapper; writes below stay on EF.
        const string sql = """
            SELECT Id, EntryDate, NiftyMove, WhyGuess, FiiDii, Sectors, Surprise, MarketState
            FROM JournalEntries
            WHERE UserId = @UserId
            ORDER BY EntryDate DESC
            """;
        using var conn = dapper.CreateConnection();
        var rows = await conn.QueryAsync<JournalRow>(sql, new { UserId = this.UserId() });
        return rows.Select(r => new JournalEntryDto(r.Id, r.EntryDate.ToString("yyyy-MM-dd"),
            r.NiftyMove, r.WhyGuess, r.FiiDii, r.Sectors, r.Surprise, r.MarketState)).ToList();
    }

    /// <summary>Creates or updates the entry for the given date (one entry per day).</summary>
    [HttpPost]
    public async Task<ActionResult<JournalEntryDto>> Upsert(JournalUpsertRequest req)
    {
        var userId = this.UserId();
        if (!DateOnly.TryParse(req.EntryDate, out var date))
            return BadRequest(new { message = "EntryDate must be a valid date (yyyy-MM-dd)." });

        var entry = await db.JournalEntries
            .FirstOrDefaultAsync(j => j.UserId == userId && j.EntryDate == date);
        if (entry is null)
        {
            entry = new JournalEntry { UserId = userId, EntryDate = date };
            db.JournalEntries.Add(entry);
        }

        entry.NiftyMove = req.NiftyMove ?? "";
        entry.WhyGuess = req.WhyGuess ?? "";
        entry.FiiDii = req.FiiDii ?? "";
        entry.Sectors = req.Sectors ?? "";
        entry.Surprise = req.Surprise ?? "";
        entry.MarketState = req.MarketState ?? "";
        await db.SaveChangesAsync();

        return Ok(ToDto(entry));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.UserId();
        var entry = await db.JournalEntries.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (entry is null) return NotFound();
        db.JournalEntries.Remove(entry);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static JournalEntryDto ToDto(JournalEntry j) =>
        new(j.Id, j.EntryDate.ToString("yyyy-MM-dd"), j.NiftyMove, j.WhyGuess,
            j.FiiDii, j.Sectors, j.Surprise, j.MarketState);
}
