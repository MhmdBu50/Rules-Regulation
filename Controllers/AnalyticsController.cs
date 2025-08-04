using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RulesRegulation.Models;
using RulesRegulation.Services;

namespace Rules_Regulation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly RRdbContext _context;

        public AnalyticsController(RRdbContext context)
        {
            _context = context;
        }

        [HttpGet("monthly-visits")]
        public async Task<IActionResult> GetMonthlyVisits()
        {
            // this should include the current month and the previous five months
            var now = DateTime.UtcNow;
            var startMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-5);

            // Step 1: Get actual visit counts grouped by Year + Month
            var rawVisits = await _context.Visits
                .Where(v => v.VisitTimestamp >= startMonth)
                .GroupBy(v => new { v.VisitTimestamp.Year, v.VisitTimestamp.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

            // Step 2: Build a list of the 6 most recent months (including current)
            var months = Enumerable.Range(0, 6)
                .Select(i => startMonth.AddMonths(i))
                .ToList();

            // Step 3: Create output with full labels and fill in 0 for missing months
            var labels = months.Select(m => m.ToString("MMMM")).ToList(); // e.g. "March", "April"
            var data = months.Select(m =>
                rawVisits.FirstOrDefault(rv => rv.Year == m.Year && rv.Month == m.Month)?.Count ?? 0
            ).ToList();

            // Step 4: Return as JSON
            return Ok(new
            {
                labels,
                data
            });
        }

        [HttpGet("unique-monthly-visits")]
        public async Task<IActionResult> GetUniqueMonthlyVisits()
        {
            // this should include the current month and the previous five months
            var now = DateTime.UtcNow;
            var startMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-5);

            // Step 1: Get unique user visits grouped by Year + Month
            var groupedVisits = await _context.Visits
                .Where(v => v.VisitTimestamp >= startMonth)
                .GroupBy(v => new { v.VisitTimestamp.Year, v.VisitTimestamp.Month, v.UserId }) // group by user to count unique visits
                .Select(g => new { g.Key.Year, g.Key.Month })
                .GroupBy(g => new { g.Year, g.Month }) // regroup to count unique users per month
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

            // Step 2: Build a list of the 6 most recent months (including current)
            var months = Enumerable.Range(0, 6)
                .Select(i => startMonth.AddMonths(i))
                .ToList();

            // Step 3: Create output with full month names and fill in 0 for missing months
            var labels = months.Select(m => m.ToString("MMMM")).ToList(); // e.g. "March", "April"
            var data = months.Select(m =>
                groupedVisits.FirstOrDefault(v => v.Year == m.Year && v.Month == m.Month)?.Count ?? 0
            ).ToList();

            // Step 4: Return as JSON
            return Ok(new
            {
                labels,
                data
            });
        }
    }
}
