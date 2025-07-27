using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Data;
using RulesRegulation.Services;
using Oracle.ManagedDataAccess.Client;

namespace RulesRegulation.Controllers;

public class HomeController : Controller
{
    private readonly DatabaseConnection _db;
    private readonly OracleDbService _oracleDbService;
    private readonly ILogger<HomeController> _logger;
    private readonly string _connectionString;


    public HomeController(ILogger<HomeController> logger, IConfiguration configuration, OracleDbService oracleDbService)
    {
        _logger = logger;
        _oracleDbService = oracleDbService;

        // use DI-style constructor
        _connectionString = configuration.GetConnectionString("OracleConnection");
        _db = new DatabaseConnection(_connectionString);
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
        try
        {
            var records = _oracleDbService.GetAllRecords();
            return View(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading records for homepage");
            // Return empty list if there's an error
            return View(new List<dynamic>());
        }
    }

    //the get the data to ShowData.cshtml form ExecuteQueryAsync method
    public async Task<IActionResult> ShowData()
    {
        string query = "SELECT * FROM CONTACT_INFORMATION";
        var dataTable = await _db.ExecuteQueryAsync(query);
        return View("~/Views/Service/ShowData.cshtml", dataTable);
    }

    [HttpGet]
    public IActionResult GetRecordDetails(int id)
    {
        try
        {
            var record = _oracleDbService.GetRecordById(id);
            if (record == null)
            {
                Response.StatusCode = 404;
                return View("Error404");
            }

            // Return partial view with record details
            return PartialView("_RecordDetails", record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
            Response.StatusCode = 500;
            return View("Error500");
        }
    }
}
