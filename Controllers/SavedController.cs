using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RulesRegulation.Models;

[ApiController]
[Route("Saved")]
public class SavedController : Controller
{
    private readonly RRdbContext _context;

    public SavedController(RRdbContext context)
    {
        _context = context;
    }

   [HttpPost("Toggle")]
public IActionResult Toggle([FromBody] SaveRequest request)
{
    // ✅ 1. Ensure session contains UserId
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
    if (userId == 0)
        return Unauthorized(); // User not logged in or session expired

    // ✅ 2. Check if record already saved
    var existing = _context.SavedRecords
        .FirstOrDefault(s => s.UserId == userId && s.RecordId == request.RecordId);

    if (existing != null)
    {
        _context.SavedRecords.Remove(existing);
        _context.SaveChanges();
        return Ok(new { removed = true });
    }

    // ✅ 3. Generate next SavedId (stored as string)
    int nextSavedId = _context.SavedRecords
    .Where(s => s.UserId == userId)
    .AsEnumerable() 
    .Select(s => int.TryParse(s.SavedId, out var id) ? id : 0)
    .DefaultIfEmpty(0)
    .Max() + 1;

    // ✅ 4. Save new record
    var newRecord = new SavedRecord
    {
        SavedId = nextSavedId.ToString(),
        UserId = userId,
        RecordId = request.RecordId,
        SavedTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
    };

    _context.SavedRecords.Add(newRecord);
    _context.SaveChanges();

    return Ok(new { removed = false });
}

[HttpGet("List")]
[HttpGet("ListIds")]
public IActionResult ListIds()
{
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;

    var ids = _context.SavedRecords
        .Where(r => r.UserId == userId)
        .Select(r => r.RecordId)
        .ToList();

    return Ok(ids);
}
}

public class SaveRequest
{
    public int RecordId { get; set; }
}

