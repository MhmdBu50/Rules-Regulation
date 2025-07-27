using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Services;
using RulesRegulation.Data;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using Oracle.ManagedDataAccess.Types;
using Microsoft.AspNetCore.Hosting;

namespace RulesRegulation.Controllers;

public class AdminController : Controller
{
    private readonly ILogger<AdminController> _logger;
    private readonly OracleDbService _oracleDbService;
    private readonly DatabaseConnection _db;
    private readonly string _connectionString;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public AdminController(ILogger<AdminController> logger, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _connectionString = configuration.GetConnectionString("OracleConnection");
        _db = new DatabaseConnection(_connectionString);
        _webHostEnvironment = webHostEnvironment;
    }
    public IActionResult AdminPage()
    {
        // Check if TempData messages exist and log them
        if (TempData["SuccessMessage"] != null)
        {
            _logger.LogInformation($"Success message found: {TempData["SuccessMessage"]}");
        }
        if (TempData["ErrorMessage"] != null)
        {
            _logger.LogInformation($"Error message found: {TempData["ErrorMessage"]}");
        }

        try
        {
            var records = _oracleDbService.GetAllRecords();
            return View(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading records for admin page");
            // Return empty list if there's an error
            return View(new List<dynamic>());
        }
    }

    [HttpGet]
    public IActionResult AddNewRecord()
    {
        return View();
    }

    [HttpGet]
    public IActionResult AddNewContactInfo()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult AddNewContactInfo(string Department, string Name, string? Email, string? Mobile, string? Telephone)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(Name))
            {
                TempData["ErrorMessage"] = "Department and Name are required fields.";
                return View();
            }

            // Check if department already exists
            if (_oracleDbService.DepartmentExists(Department))
            {
                string? existingContact = _oracleDbService.GetExistingContactInDepartment(Department);
                TempData["ErrorMessage"] = $"Department '{Department}' already has a contact person: {existingContact}. Each department can only have one contact.";
                return View();
            }

            bool success = _oracleDbService.AddContactInfo(Department, Name, Email, Mobile, Telephone);

            if (success)
            {
                TempData["SuccessMessage"] = $"Contact information for {Department} has been added successfully!";
                return RedirectToAction("AddNewContactInfo");
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to add contact information. Please try again.";
                return View();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding contact information");
            TempData["ErrorMessage"] = "An error occurred while adding contact information.";
            return View();
        }
    }


    [HttpPost]
    [ValidateAntiForgeryToken]
    [ActionName("AddNewRecord")]
    public async Task<IActionResult> AddNewRecordAsync(AddNewRecordViewModel model, IFormFile wordAttachment, IFormFile pdfAttachment)
    {
        System.Console.WriteLine("AddNewRecord hit");

        try
        {
            string uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            string? wordPath = null, pdfPath = null;

            // Save Word file
            if (model.WordAttachment != null)
            {
                var wordFileName = Guid.NewGuid() + Path.GetExtension(model.WordAttachment.FileName);
                var wordFullPath = Path.Combine(uploadsPath, wordFileName);
                using (var stream = new FileStream(wordFullPath, FileMode.Create))
                    await model.WordAttachment.CopyToAsync(stream);
                wordPath = "/uploads/" + wordFileName;
            }

            // Save PDF file
            if (model.PdfAttachment != null)
            {
                var pdfFileName = Guid.NewGuid() + Path.GetExtension(model.PdfAttachment.FileName);
                var pdfFullPath = Path.Combine(uploadsPath, pdfFileName);
                using (var stream = new FileStream(pdfFullPath, FileMode.Create))
                    await model.PdfAttachment.CopyToAsync(stream);
                pdfPath = "/uploads/" + pdfFileName;
            }

            string documentType = "";

            if (model.WordAttachment != null && model.WordAttachment.Length > 0)
                documentType += "word";

            if (model.PdfAttachment != null && model.PdfAttachment.Length > 0)
            {
                if (!string.IsNullOrEmpty(documentType))
                    documentType += ",";

                documentType += "pdf";
            }

            // Optional fallback
            if (string.IsNullOrEmpty(documentType))
                documentType = "none"; // Or return error if both files are required

            // Prepare section string
            var sectionString = string.Join(",", model.Sections ?? new List<string>());

            // Step 1: Insert record and get inserted ID
            var insertSql = @"
            INSERT INTO RECORDS (
                REGULATION_NAME, DEPARTMENT, VERSION, VERSION_DATE,
                APPROVING_ENTITY, APPROVAL_DATE, DESCRIPTION, DOCUMENT_TYPE,
                SECTIONS, NOTES
            )
            VALUES (
                :RegulationName, :Department, :Version, :VersionDate,
                :ApprovingEntity, :ApprovalDate, :Description, :DocumentType,
                :Sections, :Notes
            )
            RETURNING RECORD_ID INTO :InsertedId";

            var insertedIdParam = new OracleParameter("InsertedId", OracleDbType.Int32)
            {
                Direction = ParameterDirection.Output
            };

            var parameters = new OracleParameter[]
            {
            new("RegulationName", model.RegulationName),
            new("Department", model.RelevantDepartment),
            new("Version", model.VersionNumber),
            new("VersionDate", model.VersionDate),
            new("ApprovingEntity", model.ApprovingEntity),
            new("ApprovalDate", model.ApprovingDate),
            new("Description", model.Description),
            new("DocumentType",documentType),
            new("Sections", sectionString),
            new("Notes", model.Notes),
            insertedIdParam // important
            };

            // Run insert
            await _db.ExecuteNonQueryAsync(insertSql, parameters);

            // Get the inserted record ID
            int newId = ((OracleDecimal)insertedIdParam.Value).ToInt32();

            // Step 2: Insert attachments
            //for word files
            if (!string.IsNullOrEmpty(wordPath))
            {
                var insertPdfSql = "INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) VALUES (:id, 'PDF', :path, :original)";
                await _db.ExecuteNonQueryAsync(insertPdfSql,
                new OracleParameter("id", newId),
                new OracleParameter("path", pdfPath),
                new OracleParameter("original", model.PdfAttachment.FileName));
            }
            //for pdf files
            if (!string.IsNullOrEmpty(pdfPath))
            {
                var insertWordSql = "INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) VALUES (:id, 'WORD', :path, :original)";
                await _db.ExecuteNonQueryAsync(insertWordSql,
                new OracleParameter("id", newId),
                new OracleParameter("path", wordPath),
                new OracleParameter("original", model.WordAttachment.FileName));
            }

            TempData["SuccessMessage"] = "Record and attachments saved.";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Insert failed");
            TempData["ErrorMessage"] = "An error occurred while saving the record.";
            return View(model);
        }
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
                return PartialView("_AdminRecordDetails", null);
            }

            // Return partial view with record details for admin
            return PartialView("_AdminRecordDetails", record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
            Response.StatusCode = 500;
            return PartialView("_AdminRecordDetails", null);
        }
    }


 [HttpGet]
public async Task<IActionResult> DownloadPdf(int id)
{
    using (var conn = new OracleConnection(_connectionString))
    {
        await conn.OpenAsync();

        string sql = @"
            SELECT FILE_PATH, ORIGINAL_NAME 
            FROM ATTACHMENTS 
            WHERE RECORD_ID = :id AND FILE_TYPE = 'PDF'";

        using (var cmd = new OracleCommand(sql, conn))
        {
            cmd.Parameters.Add(new OracleParameter("id", id));
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    string filePath = reader.GetString(0);
                    string originalName = reader.GetString(1);

                    var physicalPath = Path.Combine(
                        _webHostEnvironment.WebRootPath,
                        filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                    );

                    if (!System.IO.File.Exists(physicalPath))
                        return NotFound();

                    var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                    return File(fileBytes, "application/pdf", originalName);
                }
            }
        }
    }

    return NotFound(); // if no record found
}

}