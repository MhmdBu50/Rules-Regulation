namespace RulesRegulations.Controllers;

using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;

public class ServiceController : Controller
{
    private readonly OracleDbService _oracleDbService;

    public ServiceController(OracleDbService oracleDbService)
    {
        _oracleDbService = oracleDbService;
    }

    public IActionResult GetData(string query)
    {
        if (string.IsNullOrWhiteSpace(query) || !query.Trim().ToUpper().StartsWith("SELECT"))
        {
            return BadRequest("Only SELECT queries are allowed.");
        }

        try
        {
            // ✅ Use the injected service
            var data = _oracleDbService.GetData(query);
            return View(data);
        }
        catch (Exception ex)
        {
            return View("Error", new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }
    }
}
