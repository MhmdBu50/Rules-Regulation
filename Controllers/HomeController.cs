using System.Diagnostics;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Data;
using RulesRegulation.Services;
using Oracle.ManagedDataAccess.Client;
using RulesRegulation.Filters;
using Microsoft.AspNetCore.Hosting;

namespace RulesRegulation.Controllers;

public class HomeController : Controller
{
    private readonly DatabaseConnection _db;
    private readonly OracleDbService _oracleDbService;
    private readonly ILogger<HomeController> _logger;
    private readonly string _connectionString;
    private readonly IWebHostEnvironment _webHostEnvironment;


    public HomeController(ILogger<HomeController> logger, IConfiguration configuration, OracleDbService oracleDbService, IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _oracleDbService = oracleDbService;
        _webHostEnvironment = webHostEnvironment;

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

    [SecurePage]
    [NoCache]
    public IActionResult homePage(string? department, string? sections, string? documentTypes,
        string? alphabetical, string? dateSort, string? fromDate, string? toDate)
    {
        try
        {
            var records = _oracleDbService.GetFilteredRecords(department, sections, documentTypes,
                alphabetical, dateSort, fromDate, toDate);
            return View(records);
        }
        catch (Exception)
        {
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
        catch (Exception)
        {
            Response.StatusCode = 500;
            return View("Error500");
        }
    }

    /// <summary>
    /// Download PDF attachment for a record - accessible to all authenticated users
    /// </summary>
    /// <param name="id">Record ID to get PDF attachment for</param>
    /// <returns>PDF file for download or NotFound if file doesn't exist</returns>
    [HttpGet]
    [SecurePage]
    public async Task<IActionResult> DownloadPdf(int id)
    {
        // Connect to database to retrieve file information
        using (var conn = new OracleConnection(_connectionString))
        {
            await conn.OpenAsync();

            // SQL query to get PDF file path and original name from attachments table
            string sql = @"
            SELECT FILE_PATH, ORIGINAL_NAME 
            FROM ATTACHMENTS 
            WHERE RECORD_ID = :id AND FILE_TYPE = 'PDF'";

            using (var cmd = new OracleCommand(sql, conn))
            {
                // Add parameter to prevent SQL injection
                cmd.Parameters.Add(new OracleParameter("id", id));
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        // Extract file path and original filename from database
                        string filePath = reader.GetString(0);
                        string originalName = reader.GetString(1);

                        // Convert relative path to physical file system path
                        var physicalPath = Path.Combine(
                            _webHostEnvironment.WebRootPath,
                            filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                        );

                        // Check if file exists on file system
                        if (!System.IO.File.Exists(physicalPath))
                            return NotFound();

                        // Read file bytes and return as downloadable file
                        var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                        return File(fileBytes, "application/pdf", originalName);
                    }
                }
            }
        }

        // Return 404 if no PDF attachment found for this record
        return NotFound();
    }

    /// <summary>
    /// View PDF attachment inline in browser - accessible to all authenticated users
    /// </summary>
    /// <param name="id">Record ID to get PDF attachment for</param>
    /// <returns>PDF file for inline viewing or NotFound if file doesn't exist</returns>
    [HttpGet]
    [SecurePage]
    public async Task<IActionResult> ViewPdf(int id)
    {
        // Connect to database to retrieve file information
        using (var conn = new OracleConnection(_connectionString))
        {
            await conn.OpenAsync();

            // SQL query to get PDF file path and original name
            string sql = @"
            SELECT FILE_PATH, ORIGINAL_NAME 
            FROM ATTACHMENTS 
            WHERE RECORD_ID = :id AND FILE_TYPE = 'PDF'";

            using (var cmd = new OracleCommand(sql, conn))
            {
                // Add parameter to prevent SQL injection
                cmd.Parameters.Add(new OracleParameter("id", id));
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        // Extract file information from database
                        string filePath = reader.GetString(0);
                        string originalName = reader.GetString(1);

                        // Convert relative path to physical file system path
                        var physicalPath = Path.Combine(
                            _webHostEnvironment.WebRootPath,
                            filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                        );

                        // Check if file exists on file system
                        if (!System.IO.File.Exists(physicalPath))
                            return NotFound();

                        // Read file bytes for serving
                        var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);

                        // Set content disposition header for inline PDF viewing with UTF-8 encoded filename
                        Response.Headers["Content-Disposition"] = $"inline; filename*=UTF-8''{Uri.EscapeDataString(originalName)}";
                        return File(fileBytes, "application/pdf");
                    }
                }
            }
        }

        // Return 404 if no PDF attachment found
        return NotFound();
    }
    

}
