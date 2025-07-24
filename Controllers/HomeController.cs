using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Data;

namespace RulesRegulation.Controllers;

public class HomeController : Controller
{
    private readonly DatabaseConnection _db;
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
    {
        _logger = logger;

        // use DI-style constructor
        var connectionString = configuration.GetConnectionString("OracleConnection");
        _db = new DatabaseConnection(connectionString);
    }
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    public IActionResult LoginPage()
    {
        return View("~/Views/Account/LoginPage.cshtml");
    }

    public IActionResult homePage()
    {
        return View();
    }

    //the get the data to ShowData.cshtml form ExecuteQueryAsync method
    public async Task<IActionResult> ShowData()
    {
        string query = "SELECT * FROM CONTACT_INFORMATION";
        var dataTable = await _db.ExecuteQueryAsync(query);
        return View("~/Views/Service/ShowData.cshtml", dataTable);
    }

    
}
