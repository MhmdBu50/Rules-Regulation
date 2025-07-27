using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Services;
using RulesRegulation.Data;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using Oracle.ManagedDataAccess.Types;

namespace RulesRegulation.Controllers;

public class AdminController : Controller
{
    private readonly ILogger<AdminController> _logger;
    private readonly OracleDbService _oracleDbService;
    private readonly DatabaseConnection _db;
    private readonly string _connectionString;

    public AdminController(ILogger<AdminController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _connectionString = configuration.GetConnectionString("OracleConnection");
        _db = new DatabaseConnection(_connectionString);
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
    public async Task<IActionResult> AddNewRecordAsync(AddNewRecordViewModel model)
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
            new("Description", model.BriefDescription),
            new("DocumentType", model.DocumentType),
            new("Sections", sectionString),
            new("Notes", model.Notes),
            insertedIdParam // important
            };

            // Run insert
            await _db.ExecuteNonQueryAsync(insertSql, parameters);

            // Get the inserted record ID
            int newId = ((OracleDecimal)insertedIdParam.Value).ToInt32();

            // Step 2: Insert attachments
            if (!string.IsNullOrEmpty(wordPath))
            {
                var insertWordSql = "INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH) VALUES (:id, 'WORD', :path)";
                await _db.ExecuteNonQueryAsync(insertWordSql,
                    new OracleParameter("id", newId),
                    new OracleParameter("path", wordPath));
            }

            if (!string.IsNullOrEmpty(pdfPath))
            {
                var insertPdfSql = "INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH) VALUES (:id, 'PDF', :path)";
                await _db.ExecuteNonQueryAsync(insertPdfSql,
                    new OracleParameter("id", newId),
                    new OracleParameter("path", pdfPath));
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
                return NotFound("Record not found");
            }

            // Return partial view with record details for admin
            return PartialView("_AdminRecordDetails", record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
            return StatusCode(500, "Error loading record details");
        }
    }
}