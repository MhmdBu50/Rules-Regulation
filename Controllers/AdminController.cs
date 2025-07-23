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
        return View();
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
}
