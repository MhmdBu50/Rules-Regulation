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
        _connectionString = configuration.GetConnectionString("OracleConnection") ?? throw new InvalidOperationException("OracleConnection string not found");
        _db = new DatabaseConnection(_connectionString);
        _oracleDbService = new OracleDbService(_connectionString);
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
            
            // Enhance records with contact information
            var enhancedRecords = records.Select(record => new
            {
                Id = record.Id,
                RegulationName = record.RegulationName,
                Sections = record.Sections,
                Version = record.Version,
                ApprovalDate = record.ApprovalDate,
                ApprovingEntity = record.ApprovingEntity,
                Department = record.Department,
                DocumentType = record.DocumentType,
                Description = record.Description,
                VersionDate = record.VersionDate,
                Notes = record.Notes,
                CreatedAt = record.CreatedAt,
                ContactInformation = _oracleDbService.GetContactsByDepartment(record.Department ?? "")
            }).ToList();
            
            return View(enhancedRecords);
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

            // Check if department already has maximum contacts (5)
            if (_oracleDbService.DepartmentExists(Department))
            {
                int contactCount = _oracleDbService.GetContactCountInDepartment(Department);
                TempData["ErrorMessage"] = $"Department '{Department}' already has {contactCount} contact information. Maximum 5 contacts allowed per department.";
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

    [HttpGet]
    public IActionResult ManageContactInfo()
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve contact information");

            // First test the database connection
            using (var conn = new OracleConnection(_connectionString))
            {
                conn.Open();
                _logger.LogInformation("Database connection successful");
            }

            var contacts = _oracleDbService.GetAllContacts();
            _logger.LogInformation($"Retrieved {contacts.Count} contacts successfully");
            return View(contacts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact information: {Message}", ex.Message);
            TempData["ErrorMessage"] = $"Database Error: {ex.Message}. Showing mock data for testing.";

            // Return mock data for testing when database is not available
            var mockContacts = new List<dynamic>
            {
                new {
                    ContactId = 1,
                    Department = "IT Department",
                    Name = "John Doe",
                    Email = "john.doe@example.com",
                    Mobile = "+1234567890",
                    Telephone = "+0987654321"
                },
                new {
                    ContactId = 2,
                    Department = "HR Department",
                    Name = "Jane Smith",
                    Email = "jane.smith@example.com",
                    Mobile = "+1111111111",
                    Telephone = "+2222222222"
                }
            };

            return View(mockContacts);
        }
    }

    [HttpGet]
    public IActionResult EditContactInfo(int id)
    {
        try
        {
            var contact = _oracleDbService.GetContactById(id);
            if (contact == null)
            {
                TempData["ErrorMessage"] = "Contact not found.";
                return RedirectToAction("ManageContactInfo");
            }
            return View(contact);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact information for editing");
            TempData["ErrorMessage"] = "An error occurred while retrieving contact information.";
            return RedirectToAction("ManageContactInfo");
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult EditContactInfo(int id, string Department, string Name, string? Email, string? Mobile, string? Telephone)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(Name))
            {
                TempData["ErrorMessage"] = "Department and Name are required fields.";
                var contact = _oracleDbService.GetContactById(id);
                return View(contact);
            }

            bool success = _oracleDbService.UpdateContact(id, Department, Name, Email, Mobile, Telephone);

            if (success)
            {
                TempData["SuccessMessage"] = $"Contact information for {Department} has been updated successfully!";
                return RedirectToAction("ManageContactInfo");
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to update contact information. Please try again.";
                var contact = _oracleDbService.GetContactById(id);
                return View(contact);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating contact information");
            TempData["ErrorMessage"] = "An error occurred while updating contact information.";
            var contact = _oracleDbService.GetContactById(id);
            return View(contact);
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteContactInfo(int id)
    {
        try
        {
            bool success = _oracleDbService.DeleteContact(id);

            if (success)
            {
                TempData["SuccessMessage"] = "Contact information has been deleted successfully!";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to delete contact information. Please try again.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting contact information");
            TempData["ErrorMessage"] = "An error occurred while deleting contact information.";
        }

        return RedirectToAction("ManageContactInfo");
    }

    // Alternative simpler method for friends with different database schema
    [HttpPost]
    [ValidateAntiForgeryToken]
    [ActionName("AddNewRecordSimple")]
    public async Task<IActionResult> AddNewRecordSimpleAsync(AddNewRecordViewModel model)
    {
        try
        {
            // Get document type from form
            string documentType = Request.Form["doctype"].ToString();
            if (string.IsNullOrEmpty(documentType))
                documentType = "regulation";

            // Prepare section string
            var sectionString = string.Join(",", model.Sections ?? new List<string>());

            // Simple insert without attachments first
            var insertSql = @"
            INSERT INTO RECORDS (
                USER_ID, REGULATION_NAME, DEPARTMENT, VERSION, VERSION_DATE,
                APPROVING_ENTITY, APPROVAL_DATE, DESCRIPTION, DOCUMENT_TYPE,
                SECTIONS, NOTES
            )
            VALUES (
                1, :RegulationName, :Department, :Version, :VersionDate,
                :ApprovingEntity, :ApprovalDate, :Description, :DocumentType,
                :Sections, :Notes
            )";

            var parameters = new OracleParameter[]
            {
                new("RegulationName", model.RegulationName ?? ""),
                new("Department", model.RelevantDepartment ?? ""),
                new("Version", model.VersionNumber ?? "1"),
                new("VersionDate", model.VersionDate),
                new("ApprovingEntity", model.ApprovingEntity ?? ""),
                new("ApprovalDate", model.ApprovingDate),
                new("Description", model.Description ?? ""),
                new("DocumentType", documentType),
                new("Sections", sectionString),
                new("Notes", model.Notes ?? "")
            };

            await _db.ExecuteNonQueryAsync(insertSql, parameters);

            TempData["SuccessMessage"] = "Record saved successfully (without attachments).";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Simple insert failed: {ErrorMessage}", ex.Message);
            TempData["ErrorMessage"] = $"Simple insert failed: {ex.Message}";
            return View("AddNewRecord", model);
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
                var wordFileName = model.WordAttachment.FileName;
                var wordFullPath = Path.Combine(uploadsPath, wordFileName);
                using (var stream = new FileStream(wordFullPath, FileMode.Create))
                    await model.WordAttachment.CopyToAsync(stream);
                wordPath = "/uploads/" + wordFileName;
            }

            // Save PDF file
            if (model.PdfAttachment != null)
            {
                var pdfFileName = model.PdfAttachment.FileName;
                var pdfFullPath = Path.Combine(uploadsPath, pdfFileName);
                using (var stream = new FileStream(pdfFullPath, FileMode.Create))
                    await model.PdfAttachment.CopyToAsync(stream);
                pdfPath = "/uploads/" + pdfFileName;
            }

            // Validate dates before proceeding
            if (model.VersionDate == default(DateTime))
                model.VersionDate = DateTime.Now;
            if (model.ApprovingDate == default(DateTime))
                model.ApprovingDate = DateTime.Now;

            // Use the document type from the form
            string documentType = Request.Form["doctype"].ToString();
            if (string.IsNullOrEmpty(documentType))
                documentType = "regulation"; // Default to regulation if not specified

            // Prepare section string
            var sectionString = string.Join(",", model.Sections ?? new List<string>());

            // Get a valid USER_ID (use the first available user)
            int userId = 1; // Default
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    var userCheckSql = "SELECT MIN(USER_ID) FROM USERS WHERE USER_ID IS NOT NULL";
                    using (var cmd = new OracleCommand(userCheckSql, conn))
                    {
                        var result = cmd.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                            userId = Convert.ToInt32(result);
                    }
                }
            }
            catch
            {
                userId = 1; // Fallback
            }

            // Step 1: Insert record using sequence for RECORD_ID
            var insertSql = @"
            INSERT INTO RECORDS (
                RECORD_ID, USER_ID, REGULATION_NAME, DEPARTMENT, VERSION, VERSION_DATE,
                APPROVING_ENTITY, APPROVAL_DATE, DESCRIPTION, DOCUMENT_TYPE,
                SECTIONS, NOTES
            )
            VALUES (
                RECORDS_SEQ.NEXTVAL, :UserId, :RegulationName, :Department, :Version, :VersionDate,
                :ApprovingEntity, :ApprovalDate, :Description, :DocumentType,
                :Sections, :Notes
            )";

            var parameters = new OracleParameter[]
            {
            new("UserId", userId),
            new("RegulationName", model.RegulationName ?? ""),
            new("Department", model.RelevantDepartment ?? ""),
            new("Version", model.VersionNumber ?? "1"),
            new("VersionDate", model.VersionDate),
            new("ApprovingEntity", model.ApprovingEntity ?? ""),
            new("ApprovalDate", model.ApprovingDate),
            new("Description", model.Description ?? ""),
            new("DocumentType", documentType),
            new("Sections", sectionString),
            new("Notes", model.Notes ?? "")
            };

            // Run insert with debug logging
            try
            {
                Console.WriteLine($"About to execute SQL with UserId: {userId}, DocumentType: {documentType}");
                await _db.ExecuteNonQueryAsync(insertSql, parameters);
                Console.WriteLine("SQL executed successfully");
            }
            catch (Exception sqlEx)
            {
                Console.WriteLine($"SQL Error: {sqlEx.Message}");
                throw; // Re-throw to be caught by outer catch
            }

            // Get the current sequence value for attachments
            int newId = 0;
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    var seqSql = "SELECT RECORDS_SEQ.CURRVAL FROM DUAL";
                    using (var cmd = new OracleCommand(seqSql, conn))
                    {
                        var result = cmd.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                            newId = Convert.ToInt32(result);
                    }
                }
            }
            catch
            {
                // If we can't get the sequence, skip attachments
                newId = 0;
            }

            // Step 2: Insert attachments (no silent failure)
            if (newId > 0)
            {
                // Word file
                if (!string.IsNullOrEmpty(wordPath) && model.WordAttachment != null)
                {
                var insertWordSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME)";
                await _db.ExecuteNonQueryAsync(insertWordSql,
                    new OracleParameter("id", newId),
                    new OracleParameter("fileType", "DOCX"),
                    new OracleParameter("path", wordPath),
                    new OracleParameter("ORIGINAL_NAME", model.WordAttachment.FileName));

                }

                // PDF file
                if (!string.IsNullOrEmpty(pdfPath) && model.PdfAttachment != null)
                {
                    var insertPdfSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :originalName)";
                    await _db.ExecuteNonQueryAsync(insertPdfSql,
                        new OracleParameter("id", newId),
                        new OracleParameter("fileType", "PDF"),
                        new OracleParameter("path", pdfPath),
                        new OracleParameter("ORIGINAL_NAME", model.PdfAttachment.FileName));
                }
            }


            TempData["SuccessMessage"] = "Record and attachments saved.";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Insert failed: {ErrorMessage}", ex.Message);
            
            // More specific error message for debugging
            string errorDetails = ex.Message;
            if (ex.InnerException != null)
                errorDetails += " | Inner: " + ex.InnerException.Message;
                
            TempData["ErrorMessage"] = $"An error occurred while saving the record: {errorDetails}";
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
                        string ORIGINAL_NAME = reader.GetString(1);

                        var physicalPath = Path.Combine(
                            _webHostEnvironment.WebRootPath,
                            filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                        );

                        if (!System.IO.File.Exists(physicalPath))
                            return NotFound();

                        var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                        return File(fileBytes, "application/pdf", ORIGINAL_NAME);
                    }
                }
            }
        }

        return NotFound(); // if no record found
    }

    [HttpGet]
public async Task<IActionResult> ViewPdf(int id)
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
                    string ORIGINAL_NAME = reader.GetString(1);

                    var physicalPath = Path.Combine(
                        _webHostEnvironment.WebRootPath,
                        filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
                    );

                    if (!System.IO.File.Exists(physicalPath))
                        return NotFound();

                    var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);

                    // This displays the PDF inline in the browser
                    Response.Headers.Add("Content-Disposition", $"inline; filename*=UTF-8''{Uri.EscapeDataString(ORIGINAL_NAME)}");
                    return File(fileBytes, "application/pdf");

                }
            }
        }
    }

    return NotFound();
}

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult UpdateRecord(
        int recordId,
        string regulationName,
        string department,
        string version,
        DateTime versionDate,
        DateTime approvalDate,
        string approvingEntity,
        string description,
        string documentType,
        string sections,
        string notes)
    {
        try
        {
            bool success = _oracleDbService.UpdateRecord(
                recordId, regulationName, department, version, versionDate,
                approvalDate, approvingEntity, description, documentType, sections, notes);

            if (success)
            {
                TempData["SuccessMessage"] = "Record updated successfully!";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to update record. Please try again.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating record");
            TempData["ErrorMessage"] = "An error occurred while updating the record.";
        }

        return RedirectToAction("AdminPage");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteRecord(int recordId)
    {
        try
        {
            bool success = _oracleDbService.DeleteRecord(recordId);

            if (success)
            {
                TempData["SuccessMessage"] = "Record deleted successfully!";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to delete record. Please try again.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting record");
            TempData["ErrorMessage"] = "An error occurred while deleting the record.";
        }

        return RedirectToAction("AdminPage");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteMultipleRecords(List<int> recordIds)
    {
        try
        {
            if (recordIds == null || !recordIds.Any())
            {
                TempData["ErrorMessage"] = "No records selected for deletion.";
                return RedirectToAction("AdminPage");
            }

            int successCount = 0;
            int totalCount = recordIds.Count;

            foreach (int recordId in recordIds)
            {
                bool success = _oracleDbService.DeleteRecord(recordId);
                if (success)
                {
                    successCount++;
                }
            }

            if (successCount == totalCount)
            {
                TempData["SuccessMessage"] = $"Successfully deleted {successCount} record(s)!";
            }
            else if (successCount > 0)
            {
                TempData["SuccessMessage"] = $"Successfully deleted {successCount} out of {totalCount} record(s).";
                TempData["ErrorMessage"] = $"Failed to delete {totalCount - successCount} record(s).";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to delete any records. Please try again.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting multiple records");
            TempData["ErrorMessage"] = "An error occurred while deleting the records.";
        }

        return RedirectToAction("AdminPage");
    }



}