using System.Diagnostics;
using System.Data;
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
        // Added null-coalescing operator and exception throw to handle missing connection string
        _connectionString = configuration.GetConnectionString("OracleConnection") ?? throw new InvalidOperationException("Oracle connection string not found");
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

    public IActionResult homePage(string? department, string? sections, string? documentTypes,
        string? alphabetical, string? dateSort, string? fromDate, string? toDate)
    {
        try
        {
            var records = _oracleDbService.GetFilteredRecords(department, sections, documentTypes,
                alphabetical, dateSort, fromDate, toDate);
            return View(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading records for homepage");
            // Return empty list if there's an error
            return View(new List<dynamic>());
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAttachmentId(int recordId)
    {
        try
        {
            string query = @"
            SELECT ATTACHMENT_ID FROM ATTACHMENTS 
            WHERE RECORD_ID = :recordId 
            AND (UPPER(FILE_TYPE) LIKE '%PDF%' OR UPPER(FILE_PATH) LIKE '%.PDF')
            ORDER BY UPLOAD_DATE DESC
            FETCH FIRST 1 ROWS ONLY";

            var parameter = DatabaseConnection.CreateParameter(":recordId", recordId);
            var dataTable = await _db.ExecuteQueryAsync(query, parameter);

            if (dataTable.Rows.Count > 0)
            {
                var attachmentId = Convert.ToInt32(dataTable.Rows[0]["ATTACHMENT_ID"]);
                return Json(new { success = true, attachmentId = attachmentId });
            }

            return Json(new { success = false, message = "No PDF attachment found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting attachment ID for record: {RecordId}", recordId);
            return Json(new { success = false, message = $"Error retrieving attachment: {ex.Message}" });
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
    
    [HttpGet]
public async Task<IActionResult> TestAttachmentQuery(int recordId = 1)
{
    try
    {
        // Test if we have any attachments for this record
        string query = @"
            SELECT ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, UPLOAD_DATE 
            FROM ATTACHMENTS 
            WHERE RECORD_ID = :recordId";

        var parameter = DatabaseConnection.CreateParameter(":recordId", recordId);
        var dataTable = await _db.ExecuteQueryAsync(query, parameter);

        var results = new List<object>();
        foreach (DataRow row in dataTable.Rows)
        {
            results.Add(new
            {
                ATTACHMENT_ID = row["ATTACHMENT_ID"],
                RECORD_ID = row["RECORD_ID"],
                FILE_TYPE = row["FILE_TYPE"]?.ToString(),
                FILE_PATH = row["FILE_PATH"]?.ToString(),
                UPLOAD_DATE = row["UPLOAD_DATE"],
                IsPDF = (row["FILE_TYPE"]?.ToString()?.ToUpper().Contains("PDF") ?? false) || 
                        (row["FILE_PATH"]?.ToString()?.ToUpper().EndsWith(".PDF") ?? false)
            });
        }

        return Json(new { 
            success = true, 
            recordId = recordId,
            attachments = results,
            count = results.Count
        });
    }
    catch (Exception ex)
    {
        return Json(new { 
            success = false, 
            error = ex.Message 
        });
    }
}

 

}
