using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Services;

namespace RulesRegulation.Controllers;

public class AdminController : Controller
{
    private readonly ILogger<AdminController> _logger;
    private readonly OracleDbService _oracleDbService;

    public AdminController(ILogger<AdminController> logger, OracleDbService oracleDbService)
    {
        _logger = logger;
        _oracleDbService = oracleDbService;
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
    public async Task<IActionResult> AddNewRecord(
        string regulationName,
        string relevantDepartment,
        string versionNumber,
        DateTime versionDate,
        DateTime approvalDate,
        string approvalEntity,
        string description,
        string doctype,
        string[] sections,
        string notes,
        IFormFile wordAttachment,
        IFormFile pdfAttachment)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(regulationName) || string.IsNullOrWhiteSpace(relevantDepartment))
            {
                TempData["ErrorMessage"] = "Regulation Name and Department are required fields.";
                return View();
            }

            string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            string? wordPath = null;
            string? pdfPath = null;

            if (wordAttachment != null && wordAttachment.Length > 0)
            {
                string fileName = Guid.NewGuid() + Path.GetExtension(wordAttachment.FileName);
                wordPath = $"/uploads/{fileName}";
                var fullWordPath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(fullWordPath, FileMode.Create))
                {
                    await wordAttachment.CopyToAsync(stream);
                }
            }
            if (pdfAttachment != null && pdfAttachment.Length > 0)
            {
                string fileName = Guid.NewGuid() + Path.GetExtension(pdfAttachment.FileName);
                pdfPath = $"/uploads/{fileName}";
                var fullPdfPath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(fullPdfPath, FileMode.Create))
                {
                    await pdfAttachment.CopyToAsync(stream);
                }
            }

            // Save record to database
            bool success = _oracleDbService.AddNewRecord(
                regulationName,
                relevantDepartment,
                versionNumber,
                versionDate,
                approvalDate,
                approvalEntity,
                description,
                doctype,
                sections != null ? string.Join(",", sections) : "",
                notes,
                wordPath,
                pdfPath);

            _logger.LogInformation($"Record insertion result: {success}");

            if (success)
            {
                _logger.LogInformation("Setting success message and staying on AddNewRecord page");
                TempData["SuccessMessage"] = "A new record has been added successfully.";
                return View(); // Stay on the same page instead of redirecting
            }
            else
            {
                _logger.LogWarning("Record insertion failed");
                TempData["ErrorMessage"] = "Failed to add record. Please try again.";
                return View();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding new record");
            TempData["ErrorMessage"] = $"An error occurred while adding the record: {ex.Message}";
            return View();
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
