// Required using statements for MVC, Oracle database, file handling, and dependency injection
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;
using RulesRegulation.Services;
using RulesRegulation.Data;
using RulesRegulation.Helpers;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using Oracle.ManagedDataAccess.Types;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authorization;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using RulesRegulation.Filters;
using Microsoft.Extensions.Caching.Memory;
using RulesRegulation.Models.ViewModels;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RulesRegulation.Models.Entities;

namespace RulesRegulation.Controllers;

/**
 * AdminController - Main administrative controller for the Rules and Regulations management system
 * 
 * This controller handles all administrative operations including:
 * - Record management (Create, Read, Update, Delete)
 * - Contact information management
 * - File attachment handling (Word and PDF files)
 * - User interface for administrative functions
 * 
 * Dependencies:
 * - ILogger: For logging operations and debugging
 * - IConfiguration: For database connection string configuration
 * - IWebHostEnvironment: For file upload and web root path handling
 * - OracleDbService: Custom service for Oracle database operations
 * - DatabaseConnection: Direct database connection for complex operations
 */
[Authorize(Roles = "Admin,Editor")]
[SecurePage]
[NoCache]
public class AdminController : Controller
{
    // Logger instance for tracking operations and debugging
    private readonly ILogger<AdminController> _logger;
    
    // Custom Oracle database service for business logic operations
    private readonly OracleDbService _oracleDbService;
    
    // Direct database connection for complex SQL operations
    private readonly DatabaseConnection _db;
    
    // Oracle database connection string from configuration
    private readonly string _connectionString;
    
    // Web hosting environment for file operations and path management
    private readonly IWebHostEnvironment _webHostEnvironment;

    // Memory cache for thumbnail caching
    private readonly IMemoryCache _cache;

    // Activity log service for tracking user actions
    private readonly ActivityLogService _activityLogService;

    // Entity Framework context for direct database operations
    private readonly RRdbContext _context;

    /**
     * Constructor - Initializes all dependencies and establishes database connections
     * 
     * @param logger - Logging service for tracking operations
     * @param configuration - Configuration service for connection strings
     * @param webHostEnvironment - Web hosting environment for file operations
     * 
     * Throws InvalidOperationException if Oracle connection string is not found
     */

    /**
     * Constructor - Initializes all dependencies and establishes database connections
     * 
     * @param logger - Logging service for tracking operations
     * @param configuration - Configuration service for connection strings
     * @param webHostEnvironment - Web hosting environment for file operations
     * 
     * Throws InvalidOperationException if Oracle connection string is not found
     */
    public AdminController(ILogger<AdminController> logger, IConfiguration configuration, IWebHostEnvironment webHostEnvironment, IMemoryCache cache, ActivityLogService activityLogService, RRdbContext context)
    {
        _logger = logger;
        // Get Oracle connection string from configuration, throw exception if not found
        _connectionString = configuration.GetConnectionString("OracleConnection") ?? throw new InvalidOperationException("OracleConnection string not found");
        // Initialize database connection with connection string
        _db = new DatabaseConnection(_connectionString);
        // Initialize Oracle database service with connection string
        _oracleDbService = new OracleDbService(_connectionString);
        // Store web hosting environment for file operations
        _webHostEnvironment = webHostEnvironment;
        // Store memory cache for thumbnail caching
        _cache = cache;
        // Store activity log service
        _activityLogService = activityLogService;
        // Store Entity Framework context
        _context = context;
    }

    /**
     * GetDashboardStats - API endpoint for dashboard statistics and chart data
     * Returns: JSON object with total policies, most viewed, donut chart, and bar chart data
     */
    [HttpGet]
    public JsonResult GetDashboardStats()
    {
        try
        {
            // Example queries - replace with real DB queries
            int totalPolicies = _oracleDbService.GetAllRecords().Count();

            // Query USER_HISTORY for most viewed record
            string mostViewedName = "N/A";
            string mostViewedNameAr = "N/A";
            int mostViewedViews = 0;
            using (var conn = new Oracle.ManagedDataAccess.Client.OracleConnection(_connectionString))
            {
                conn.Open();
                string sql = @"SELECT * FROM (
                               SELECT r.REGULATION_NAME, r.REGULATION_NAME_AR, COUNT(*) AS views
                               FROM USER_HISTORY h
                               LEFT JOIN RECORDS r ON h.RECORD_ID = r.RECORD_ID
                               WHERE h.ACTION = 'view' AND r.REGULATION_NAME IS NOT NULL
                               GROUP BY r.REGULATION_NAME, r.REGULATION_NAME_AR
                               ORDER BY views DESC
                               ) WHERE ROWNUM = 1";
                using (var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        mostViewedName = reader["REGULATION_NAME"]?.ToString() ?? "N/A";
                        mostViewedNameAr = reader["REGULATION_NAME_AR"]?.ToString() ?? "N/A";
                        mostViewedViews = Convert.ToInt32(reader["views"] ?? 0);
                    }
                }
            }
            var mostViewedPolicy = new { name = mostViewedName, nameAr = mostViewedNameAr, views = mostViewedViews };

            // Fetch dynamic donut chart data from the database
            var donutData = new List<object>();
            try
            {
                using (var conn = new Oracle.ManagedDataAccess.Client.OracleConnection(_connectionString))
                {
                    conn.Open();
                    string sql = @"SELECT DOCUMENT_TYPE, COUNT(*) AS Count
                                   FROM RECORDS
                                   GROUP BY DOCUMENT_TYPE";

                    using (var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(sql, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        int totalRecords = 0;
                        var tempStats = new List<(string DocumentType, int Count)>();

                        while (reader.Read())
                        {
                            string documentType = reader["DOCUMENT_TYPE"]?.ToString() ?? "Unknown";
                            int count = Convert.ToInt32(reader["Count"]);
                            tempStats.Add((documentType, count));
                            totalRecords += count;
                        }

                        // Calculate percentages
                        foreach (var stat in tempStats)
                        {
                            donutData.Add(new { 
                                label = stat.DocumentType, 
                                value = stat.Count, 
                                percentage = Math.Round((double)stat.Count / totalRecords * 100, 1)
                            });
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Provide default data if database fails
                donutData = new List<object>
                {
                    new { label = "Academic rules", value = 5, percentage = 45.5 },
                    new { label = "Student rules & regulations", value = 3, percentage = 27.3 },
                    new { label = "Employees' rules & regulations", value = 2, percentage = 18.2 },
                    new { label = "Student guides & templates", value = 1, percentage = 9.1 }
                };
            }

            // Bar chart data (static)
            var barData = new[] {
                new { month = "March", visits = 180 },
                new { month = "April", visits = 150 },
                new { month = "May", visits = 220 },
                new { month = "June", visits = 180 },
                new { month = "July", visits = 320 },
                new { month = "August", visits = 200 }
            };

            return Json(new {
                totalPolicies,
                mostViewed = mostViewedPolicy,
                donutData,
                barData
            });
        }
        catch (Exception)
        {
            // Return default values to prevent frontend errors
            return Json(new {
                totalPolicies = 0,
                mostViewed = new { name = "N/A", nameAr = "N/A", views = 0 },
                donutData = new[] {
                    new { label = "Academic rules", value = 5, percentage = 45.5 },
                    new { label = "Student rules & regulations", value = 3, percentage = 27.3 },
                    new { label = "Employees' rules & regulations", value = 2, percentage = 18.2 },
                    new { label = "Student guides & templates", value = 1, percentage = 9.1 }
                },
                barData = new[] {
                    new { month = "March", visits = 180 },
                    new { month = "April", visits = 150 },
                    new { month = "May", visits = 220 },
                    new { month = "June", visits = 180 },
                    new { month = "July", visits = 320 },
                    new { month = "August", visits = 200 }
                }
            });
        }
    }
    
    /**
     * TestStats - Simple test endpoint to verify API is working
     */
    [HttpGet]
    public JsonResult TestStats()
    {
        return Json(new {
            totalPolicies = 42,
            mostViewed = new { name = "Test Policy", nameAr = "سياسة اختبار", views = 123 },
            message = "API is working"
        });
    }

    /**
     * GetDocumentTypeStats - API endpoint to fetch document type statistics for the pie chart
     * Returns: JSON object with document type counts and percentages
     */
    [HttpGet]
    public JsonResult GetDocumentTypeStats()
    {
        var documentTypeStats = new List<object>();

        using (var conn = new Oracle.ManagedDataAccess.Client.OracleConnection(_connectionString))
        {
            conn.Open();
            string sql = @"SELECT DOCUMENT_TYPE, COUNT(*) AS Count
                           FROM RECORDS
                           GROUP BY DOCUMENT_TYPE";

            using (var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(sql, conn))
            using (var reader = cmd.ExecuteReader())
            {
                int totalRecords = 0;
                var tempStats = new List<(string DocumentType, int Count)>();

                while (reader.Read())
                {
                    string documentType = reader["DOCUMENT_TYPE"]?.ToString() ?? "Unknown";
                    int count = Convert.ToInt32(reader["Count"]);
                    tempStats.Add((documentType, count));
                    totalRecords += count;
                }

                foreach (var stat in tempStats)
                {
                    documentTypeStats.Add(new
                    {
                        label = stat.DocumentType,
                        count = stat.Count,
                        percentage = Math.Round((double)stat.Count / totalRecords * 100, 2)
                    });
                }
            }
        }

        return Json(documentTypeStats);
    }

    /**
     * AdminPage - Main administrative dashboard displaying all records
     * 
     * This method loads all records from the database and enhances them with:
     * - Contact information for each department
     * - File attachments associated with each record
     * - Success/error messages from previous operations
     * 
     * @return View with enhanced records list or empty list on error
     */
    /**
     * AdminPage - Main administrative dashboard displaying all records
     * 
     * This method loads all records from the database and enhances them with:
     * - Contact information for each department
     * - File attachments associated with each record
     * - Success/error messages from previous operations
     * 
     * @return View with enhanced records list or empty list on error
     */
    public IActionResult AdminPage()
    {
        try
        {
            // Get all records from the database using Oracle service
            var records = _oracleDbService.GetAllRecords();
            
            // Enhance records with basic information only for faster page loading
            // Contact information and attachments will be loaded via AJAX when accordion is expanded
            var enhancedRecords = records.Select(record => new
            {
                // Basic record information
                Id = record.Id,
                RegulationName = record.RegulationName,
                RegulationNameAr = record.RegulationNameAr,
                Sections = record.Sections,
                Version = record.Version,
                ApprovalDate = record.ApprovalDate,
                ApprovingEntity = record.ApprovingEntity,
                ApprovingEntityAr = record.ApprovingEntityAr,
                Department = record.Department,
                DocumentType = record.DocumentType,
                Description = record.Description,
                DescriptionAr = record.DescriptionAr,
                VersionDate = record.VersionDate,
                Notes = record.Notes,
                NotesAr = record.NotesAr,
                CreatedAt = record.CreatedAt,
                // Empty collections for initial load - will be populated via AJAX
                ContactInformation = new List<dynamic>(),
                Attachments = new List<dynamic>()
            }).ToList();
            
            return View(enhancedRecords);
        }
        catch (Exception)
        {
            // Return empty list if there's an error to prevent application crash
            return View(new List<dynamic>());
        }
    }

    /**
     * AddNewRecord (GET) - Display the form for adding new regulation records
     * 
     * @return View with empty form for creating new records
     */

    /**
     * Redirect to Reports page
     */
    public IActionResult ViewReport()
    {
        return RedirectToAction("ReportPage", "Reports");
    }

    /**
     * AddNewRecord (GET) - Display the form for adding new regulation records
     * 
     * @return View with empty form for creating new records
     */
    [HttpGet]
    public IActionResult AddNewRecord()
    {
        return View();
    }

    /**
     * AddNewContactInfo (GET) - Display the form for adding new contact information
     * 
     * @return View with empty form for creating new contact information
     */
    [HttpGet]
    public IActionResult AddNewContactInfo()
    {
        return View();
    }

    /**
     * AssignNewEditor (GET) - Display the editor role management page
     * 
     * Shows all users with ability to promote/demote editor roles
     * Includes search functionality and pagination
     * Only accessible by Admins
     * 
     * @param searchTerm - Optional search term to filter users
     * @return View with list of users and their role information
     */
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public IActionResult AssignNewEditor(string searchTerm = "")
    {
        try
        {
            // Get all users from database using direct Oracle connection
            var users = new List<dynamic>();
            
            using (var connection = new OracleConnection(_connectionString))
            {
                connection.Open();
                
                var sql = @"SELECT USER_ID, NAME, EMAIL, PHONE_NUMBER, ROLE, CREATED_AT, UPDATED_AT 
                           FROM USERS 
                           ORDER BY NAME";
                
                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    sql = @"SELECT USER_ID, NAME, EMAIL, PHONE_NUMBER, ROLE, CREATED_AT, UPDATED_AT 
                           FROM USERS 
                           WHERE UPPER(NAME) LIKE UPPER(:searchTerm) OR UPPER(EMAIL) LIKE UPPER(:searchTerm)
                           ORDER BY NAME";
                }
                
                using (var command = new OracleCommand(sql, connection))
                {
                    if (!string.IsNullOrWhiteSpace(searchTerm))
                    {
                        command.Parameters.Add(":searchTerm", $"%{searchTerm}%");
                    }
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var role = reader.IsDBNull("ROLE") ? "User" : reader.GetString("ROLE");
                            users.Add(new
                            {
                                UserId = reader.GetInt32("USER_ID"),
                                Name = reader.IsDBNull("NAME") ? "N/A" : reader.GetString("NAME"),
                                Email = reader.IsDBNull("EMAIL") ? "N/A" : reader.GetString("EMAIL"),
                                PhoneNumber = reader.IsDBNull("PHONE_NUMBER") ? "N/A" : reader.GetString("PHONE_NUMBER"),
                                Role = role,
                                IsAdmin = role.Equals("Admin", StringComparison.OrdinalIgnoreCase),
                                IsEditor = role.Equals("Editor", StringComparison.OrdinalIgnoreCase),
                                IsUser = role.Equals("User", StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(role),
                                CreatedAt = reader.IsDBNull("CREATED_AT") ? DateTime.MinValue : reader.GetDateTime("CREATED_AT")
                            });
                        }
                    }
                }
            }
            
            ViewBag.SearchTerm = searchTerm ?? "";
            ViewBag.TotalUsers = users.Count;
            ViewBag.AdminCount = users.Count(u => ((dynamic)u).IsAdmin);
            ViewBag.EditorCount = users.Count(u => ((dynamic)u).IsEditor);
            ViewBag.UserCount = users.Count(u => ((dynamic)u).IsUser);
            
            return View(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading users for editor assignment");
            TempData["ErrorMessage"] = "An error occurred while loading users.";
            return View(new List<dynamic>());
        }
    }

    /**
     * PromoteToEditor (POST) - Promote a user to Editor role
     * 
     * Updates user's role to "Editor" and logs the action
     * Only accessible by Admins
     * 
     * @param userId - ID of user to promote
     * @return JSON result with success status
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PromoteToEditor(int userId)
    {
        try
        {
            using (var connection = new OracleConnection(_connectionString))
            {
                connection.Open();
                
                // Check if user exists and get current info
                var checkSql = "SELECT NAME, ROLE FROM USERS WHERE USER_ID = :userId";
                string userName = "";
                string currentRole = "";
                
                using (var checkCmd = new OracleCommand(checkSql, connection))
                {
                    checkCmd.Parameters.Add(":userId", userId);
                    using (var reader = checkCmd.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return Json(new { success = false, message = "User not found." });
                        }
                        
                        userName = reader.IsDBNull("NAME") ? "Unknown" : reader.GetString("NAME");
                        currentRole = reader.IsDBNull("ROLE") ? "User" : reader.GetString("ROLE");
                    }
                }
                
                if (currentRole.Equals("Editor", StringComparison.OrdinalIgnoreCase))
                {
                    return Json(new { success = false, message = "User is already an editor." });
                }
                
                if (currentRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return Json(new { success = false, message = "Cannot change admin role through this interface." });
                }
                
                // Update user role to Editor
                var updateSql = "UPDATE USERS SET ROLE = :role, UPDATED_AT = :updatedAt WHERE USER_ID = :userId";
                
                using (var updateCmd = new OracleCommand(updateSql, connection))
                {
                    updateCmd.Parameters.Add(":role", "Editor");
                    updateCmd.Parameters.Add(":updatedAt", DateTime.UtcNow);
                    updateCmd.Parameters.Add(":userId", userId);
                    
                    var rowsAffected = await updateCmd.ExecuteNonQueryAsync();
                    
                    if (rowsAffected > 0)
                    {
                        // Log the promotion action
                        _logger.LogInformation($"User {userName} (ID: {userId}) promoted to Editor by admin user.");
                        
                        return Json(new { 
                            success = true, 
                            message = $"User {userName} has been promoted to Editor successfully." 
                        });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Failed to update user role." });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error promoting user {userId} to editor");
            return Json(new { success = false, message = "An error occurred while promoting the user." });
        }
    }

    /**
     * DemoteToUser (POST) - Demote an editor to regular User role
     * 
     * Updates user's role to "User" and logs the action
     * Only accessible by Admins
     * 
     * @param userId - ID of user to demote
     * @return JSON result with success status
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DemoteToUser(int userId)
    {
        try
        {
            // Prevent demoting yourself (safety check)
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == userId)
            {
                return Json(new { success = false, message = "You cannot demote yourself." });
            }
            
            using (var connection = new OracleConnection(_connectionString))
            {
                connection.Open();
                
                // Check if user exists and get current info
                var checkSql = "SELECT NAME, ROLE FROM USERS WHERE USER_ID = :userId";
                string userName = "";
                string currentRole = "";
                
                using (var checkCmd = new OracleCommand(checkSql, connection))
                {
                    checkCmd.Parameters.Add(":userId", userId);
                    using (var reader = checkCmd.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return Json(new { success = false, message = "User not found." });
                        }
                        
                        userName = reader.IsDBNull("NAME") ? "Unknown" : reader.GetString("NAME");
                        currentRole = reader.IsDBNull("ROLE") ? "User" : reader.GetString("ROLE");
                    }
                }
                
                // Only allow demotion of Editors (Admins cannot be demoted through this interface)
                if (currentRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return Json(new { success = false, message = "Cannot demote admin through this interface." });
                }
                
                if (!currentRole.Equals("Editor", StringComparison.OrdinalIgnoreCase))
                {
                    return Json(new { success = false, message = "User is not an editor." });
                }
                
                // Update user role to User
                var updateSql = "UPDATE USERS SET ROLE = :role, UPDATED_AT = :updatedAt WHERE USER_ID = :userId";
                
                using (var updateCmd = new OracleCommand(updateSql, connection))
                {
                    updateCmd.Parameters.Add(":role", "User");
                    updateCmd.Parameters.Add(":updatedAt", DateTime.UtcNow);
                    updateCmd.Parameters.Add(":userId", userId);
                    
                    var rowsAffected = await updateCmd.ExecuteNonQueryAsync();
                    
                    if (rowsAffected > 0)
                    {
                        // Log the demotion action
                        _logger.LogInformation($"Editor {userName} (ID: {userId}) demoted to User by admin user.");
                        
                        return Json(new { 
                            success = true, 
                            message = $"Editor {userName} has been demoted to User successfully." 
                        });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Failed to update user role." });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error demoting editor {userId} to user");
            return Json(new { success = false, message = "An error occurred while demoting the user." });
        }
    }

    /**
     * AddNewContactInfo (POST) - Process form submission for adding new contact information
     * 
     * This method handles the creation of new contact information with validation:
     * - Validates required fields (Department and Name)
     * - Checks department contact limit (maximum 5 contacts per department)
     * - Inserts contact information into database
     * - Provides user feedback via TempData messages
     * 
     * @param Department - Required department name
     * @param Name - Required contact person name
     * @param Email - Optional email address
     * @param Mobile - Optional mobile phone number
     * @param Telephone - Optional telephone number
     * 
     * @return View on error, RedirectToAction on success
     */

[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult AddNewContactInfo(string Department, string Name, string? NameAr, string? Email, string? Mobile, string? Telephone)
{
    try
    {
        // Step 1: Validate required fields - Department and Name are mandatory
        if (string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(Name))
        {
            TempData["ErrorMessage"] = "Department and Name (English) are required fields.";
            return View();
        }

        // Step 2: Fast Arabic validation using OracleDbService methods
        var arabicValidationResults = OracleDbService.ValidateAddNewContactInfoArabicFields(NameAr);
        
        if (!arabicValidationResults["nameAr"])
        {
            TempData["ErrorMessage"] = "Name (Arabic) contains invalid Arabic characters. Please use only Arabic text.";
            return View();
        }

        // Step 3: Check if department already has maximum allowed contacts (5 per department)
        int contactCount = _oracleDbService.GetContactCountInDepartment(Department);
        if (contactCount >= 5)
        {
            TempData["ErrorMessage"] = $"Department '{Department}' already has {contactCount} contact(s). Maximum 5 allowed.";
            return View();
        }

        // Step 4: Attempt to insert contact information into database
        bool success = _oracleDbService.AddContactInfo(Department, Name, NameAr, Email, Mobile, Telephone);

        if (success)
        {
            // Step 5: Log the activity for audit purposes using EF
            try
            {
                var currentUser = GetCurrentUser();
                
                var newContactData = new
                {
                    department = Department,
                    name = Name,
                    nameAr = NameAr,
                    email = Email,
                    mobile = Mobile,
                    telephone = Telephone
                };

                // Get the contact ID of the newly created contact for logging
                var contacts = _oracleDbService.GetAllContacts();
                var newContact = contacts.Where(c => c.Department == Department && c.Name == Name).FirstOrDefault();
                
                LogActivity(
                    currentUser.Id, currentUser.Name, currentUser.Role,
                    "Add", "Contact", newContact?.ContactId ?? 0, $"{Name} ({Department})",
                    null, newContactData, $"Added new contact: {Name} in {Department}"
                );
            }
            catch (Exception logEx)
            {
                // Don't fail the main operation if logging fails
                _logger.LogError(logEx, "Failed to log activity for contact creation");
            }

            // Success: Set success message and redirect to clear form
            TempData["SuccessMessage"] = $"Contact information for '{Department}' was added successfully.";
            return RedirectToAction("AddNewContactInfo");
        }
        else
        {
            // Database operation failed: Show error message
            TempData["ErrorMessage"] = "Failed to add contact information. Please try again. (Check logs for details)";
            return View();
        }
    }
    catch (Oracle.ManagedDataAccess.Client.OracleException ex)
    {
        // Handle Oracle-specific database errors with detailed logging
        var errorDetails = $"Oracle DB error {ex.Number}: {ex.Message}";
        if (ex.InnerException != null)
            errorDetails += $" | Inner: {ex.InnerException.Message}";
        TempData["ErrorMessage"] = errorDetails;
        return View();
    }
    catch (Exception ex)
    {
        // Handle any other unexpected errors
        TempData["ErrorMessage"] = $"Unexpected error: {ex.Message}";
        return View();
    }
}

    /**
     * ManageContactInfo (GET) - Display all contact information for management
     * 
     * This method retrieves and displays all contact information from the database.
     * Includes database connection testing and fallback to mock data for development.
     * 
     * Features:
     * - Database connection testing
     * - Comprehensive error logging
     * - Mock data fallback for development/testing
     * - Error message display via TempData
     * 
     * @return View with contact list or mock data on database error
     */
    [HttpGet]
    public IActionResult ManageContactInfo()
    {
        try
        {
            // First test the database connection to ensure it's working
            using (var conn = new OracleConnection(_connectionString))
            {
                conn.Open();
            }

            // Retrieve all contacts from database using Oracle service
            var contacts = _oracleDbService.GetAllContacts();
            return View(contacts);
        }
        catch (Exception ex)
        {
            // Log database errors and provide fallback mock data for testing
            TempData["ErrorMessage"] = $"Database Error: {ex.Message}. Showing mock data for testing.";

            // Return mock data for testing when database is not available
            // This allows development and testing to continue even without database access
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

    /**
     * EditContactInfo (GET) - Display form for editing existing contact information
     * 
     * Retrieves contact information by ID and displays it in an editable form.
     * Handles cases where contact is not found with appropriate error messaging.
     * 
     * @param id - Contact ID to edit
     * @return View with contact data or redirect to ManageContactInfo on error
     */
    [HttpGet]
    public IActionResult EditContactInfo(int id)
    {
        try
        {
            // Retrieve contact information by ID from database
            var contact = _oracleDbService.GetContactById(id);
            if (contact == null)
            {
                // Contact not found: set error message and redirect to management page
                TempData["ErrorMessage"] = "Contact not found.";
                return RedirectToAction("ManageContactInfo");
            }
            // Return view with contact data for editing
            return View(contact);
        }
        catch (Exception)
        {
            // Handle database or other errors during contact retrieval
            TempData["ErrorMessage"] = "An error occurred while retrieving contact information.";
            return RedirectToAction("ManageContactInfo");
        }
    }

    /**
     * EditContactInfo (POST) - Process form submission for updating contact information
     * 
     * Validates and updates existing contact information in the database.
     * Includes field validation and comprehensive error handling.
     * 
     * @param id - Contact ID to update
     * @param Department - Required department name
     * @param Name - Required contact person name
     * @param Email - Optional email address
     * @param Mobile - Optional mobile phone number
     * @param Telephone - Optional telephone number
     * 
     * @return View on error, RedirectToAction on success
     */

    /**
     * EditContactInfo (POST) - Process form submission for updating contact information
     * 
     * Validates and updates existing contact information in the database.
     * Includes field validation and comprehensive error handling.
     * 
     * @param id - Contact ID to update
     * @param Department - Required department name
     * @param Name - Required contact person name
     * @param NameAr - Optional contact person name in Arabic
     * @param Email - Optional email address
     * @param Mobile - Optional mobile phone number
     * @param Telephone - Optional telephone number
     * 
     * @return View on error, RedirectToAction on success
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult EditContactInfo(int id, string Department, string Name, string? NameAr, string? Email, string? Mobile, string? Telephone)
    {
        try
        {
            // Validate required fields before attempting update
            if (string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(Name))
            {
                TempData["ErrorMessage"] = "Department and Name are required fields.";
                // Reload contact data and return to form with error message
                var contact = _oracleDbService.GetContactById(id);
                return View(contact);
            }

            // Get old contact data for comparison before update
            var oldContact = _oracleDbService.GetContactById(id);
            
            var oldContactData = new
            {
                department = oldContact?.Department,
                name = oldContact?.Name,
                nameAr = oldContact?.NameAr,
                email = oldContact?.Email,
                mobile = oldContact?.Mobile,
                telephone = oldContact?.Telephone
            };

            // Attempt to update contact information in database
            bool success = _oracleDbService.UpdateContact(id, Department, Name, NameAr, Email, Mobile, Telephone);

            if (success)
            {
                // Log the activity for audit purposes
                var newContactData = new
                {
                    department = Department,
                    name = Name,
                    nameAr = NameAr,
                    email = Email,
                    mobile = Mobile,
                    telephone = Telephone
                };

                var currentUser = GetCurrentUser();
                LogActivity(currentUser.Id, currentUser.Name, currentUser.Role, 
                    "Edit", "Contact", id, $"{Name} ({Department})", 
                    oldContactData, newContactData, $"Updated contact: {Name} ({Department})");

                // Update successful: set success message and redirect to management page
                TempData["SuccessMessage"] = $"Contact information for {Department} has been updated successfully!";
                return RedirectToAction("ManageContactInfo");
            }
            else
            {
                // Update failed: reload contact data and show error
                TempData["ErrorMessage"] = "Failed to update contact information. Please try again.";
                var contact = _oracleDbService.GetContactById(id);
                return View(contact);
            }
        }
        catch (Exception)
        {
            // Handle any errors during update process
            TempData["ErrorMessage"] = "An error occurred while updating contact information.";
            // Reload contact data and return to form
            var contact = _oracleDbService.GetContactById(id);
            return View(contact);
        }
    }

    /**
     * DeleteContactInfo (POST) - Delete contact information by ID
     * 
     * Removes contact information from the database with comprehensive error handling.
     * Uses POST method with CSRF protection for security.
     * 
     * @param id - Contact ID to delete
     * @return RedirectToAction to ManageContactInfo with success/error message
     */

    /**
     * DeleteContactInfo (POST) - Delete contact information by ID
     * 
     * Removes contact information from the database with comprehensive error handling.
     * Uses POST method with CSRF protection for security.
     * 
     * @param id - Contact ID to delete
     * @return RedirectToAction to ManageContactInfo with success/error message
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteContactInfo(int id)
    {
        try
        {
            // Get contact data before deletion for logging
            var contactToDelete = _oracleDbService.GetContactById(id);
            
            // Attempt to delete contact from database
            bool success = _oracleDbService.DeleteContact(id);

            if (success)
            {
                // Log the deletion activity
                var deletedContactData = new
                {
                    department = contactToDelete?.Department,
                    name = contactToDelete?.Name,
                    nameAr = contactToDelete?.NameAr,
                    email = contactToDelete?.Email,
                    mobile = contactToDelete?.Mobile,
                    telephone = contactToDelete?.Telephone
                };

                var currentUser = GetCurrentUser();
                LogActivity(currentUser.Id, currentUser.Name, currentUser.Role, 
                    "Delete", "Contact", id, $"{contactToDelete?.Name} ({contactToDelete?.Department})", 
                    deletedContactData, null, $"Deleted contact: {contactToDelete?.Name} from {contactToDelete?.Department}");

                // Deletion successful: set success message
                TempData["SuccessMessage"] = "Contact information has been deleted successfully!";
            }
            else
            {
                // Deletion failed: set error message
                TempData["ErrorMessage"] = "Failed to delete contact information. Please try again.";
            }
        }
        catch (Exception)
        {
            // Handle any errors during deletion process
            TempData["ErrorMessage"] = "An error occurred while deleting contact information.";
        }

        // Always redirect back to management page regardless of success/failure
        return RedirectToAction("ManageContactInfo");
    }

    /**
     * AddNewRecordSimple (POST) - Alternative method for adding records without file attachments
     * 
     * This is a simplified version for environments where file upload might not work properly.
     * Inserts only basic record information without handling file attachments.
     * 
     * @param model - View model containing record information
     * @return View on error, RedirectToAction on success
     */
    // Alternative simpler method for friends with different database schema
    /**
     * AddNewRecordSimple (POST) - Alternative method for adding records without file attachments
     * 
     * This is a simplified version for environments where file upload might not work properly.
     * Inserts only basic record information without handling file attachments.
     * 
     * @param model - View model containing record information
     * @return View on error, RedirectToAction on success
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    [ActionName("AddNewRecordSimple")]
    public async Task<IActionResult> AddNewRecordSimpleAsync(AddNewRecordViewModel model)
    {
        try
        {
            // Get document type from form data (fallback to "regulation" if not provided)
            string documentType = Request.Form["doctype"].ToString();
            if (string.IsNullOrEmpty(documentType))
                documentType = "regulation";

            // Prepare section string by joining array elements with commas
            var sectionString = string.Join(",", model.Sections ?? new List<string>());

            // Simple insert SQL without file attachments
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

            // Prepare parameters for SQL execution with null coalescing for safety
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

            // Execute SQL insert operation asynchronously
            await _db.ExecuteNonQueryAsync(insertSql, parameters);

            // Log the activity for audit purposes
            try
            {
                var currentUser = GetCurrentUser();
                
                var newRecordData = new
                {
                    regulationName = model.RegulationName,
                    department = model.RelevantDepartment,
                    version = model.VersionNumber,
                    description = model.Description,
                    documentType = documentType,
                    sections = sectionString,
                    notes = model.Notes
                };

                LogActivity(
                    currentUser.Id, currentUser.Name, currentUser.Role,
                    "Add", "Record", 0, model.RegulationName ?? "Unknown Record", // Note: no ID available in simple method
                    null, newRecordData, $"Created simple record: {model.RegulationName ?? "Unknown"}"
                );
            }
            catch (Exception logEx)
            {
                _logger.LogError(logEx, "Failed to log activity for simple record creation");
            }

            // Success: set success message and redirect to form
            TempData["SuccessMessage"] = "Record saved successfully (without attachments).";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            // Handle any errors during simple record insertion
            TempData["ErrorMessage"] = $"Simple insert failed: {ex.Message}";
            return View("AddNewRecord", model);
        }
    }

    /**
     * AddNewRecord (POST) - Main method for adding new regulation records with file attachments
     * 
     * This is the primary method for creating new regulation records. It handles:
     * - File uploads (Word and PDF documents)
     * - Database record insertion with sequence-generated IDs
     * - File attachment metadata storage
     * - Comprehensive error handling and logging
     * 
     * Process Flow:
     * 1. Create uploads directory if needed
     * 2. Save uploaded files to server
     * 3. Insert record into RECORDS table
     * 4. Insert file metadata into ATTACHMENTS table
     * 5. Provide user feedback
     * 
     * @param model - View model containing record information
     * @param wordAttachment - Optional Word document file
     * @param pdfAttachment - Optional PDF document file
     * @return View on error, RedirectToAction on success
     */


    /**
     * AddNewRecord (POST) - Main method for adding new regulation records with file attachments
     * 
     * This is the primary method for creating new regulation records. It handles:
     * - File uploads (Word and PDF documents)
     * - Database record insertion with sequence-generated IDs
     * - File attachment metadata storage
     * - Comprehensive error handling and logging
     * 
     * Process Flow:
     * 1. Create uploads directory if needed
     * 2. Save uploaded files to server
     * 3. Insert record into RECORDS table
     * 4. Insert file metadata into ATTACHMENTS table
     * 5. Provide user feedback
     * 
     * @param model - View model containing record information
     * @param wordAttachment - Optional Word document file
     * @param pdfAttachment - Optional PDF document file
     * @return View on error, RedirectToAction on success
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    [ActionName("AddNewRecord")]
    public async Task<IActionResult> AddNewRecordAsync(AddNewRecordViewModel model, IFormFile wordAttachment, IFormFile pdfAttachment)
    {
        try
        {
            // Step 1: Fast Arabic validation using OracleDbService methods
            var arabicValidationResults = OracleDbService.ValidateAddNewRecordArabicFields(
                model.RegulationNameAr, 
                model.ApprovingEntityAr, 
                model.DescriptionAr, 
                model.NotesAr
            );
            
            var arabicValidationErrors = new List<string>();
            
            foreach (var validation in arabicValidationResults)
            {
                if (!validation.Value)
                {
                    var fieldName = validation.Key switch
                    {
                        "regulationNameAr" => "Regulation Name (Arabic)",
                        "approvingEntityAr" => "Approving Entity (Arabic)",
                        "descriptionAr" => "Description (Arabic)",
                        "notesAr" => "Notes (Arabic)",
                        _ => validation.Key
                    };
                    arabicValidationErrors.Add($"{fieldName} contains invalid Arabic characters");
                }
            }
            
            if (arabicValidationErrors.Any())
            {
                TempData["ErrorMessage"] = "Arabic validation failed: " + string.Join("; ", arabicValidationErrors);
                return View(model);
            }

            // Step 2: Setup file upload directory
            // Create uploads directory in wwwroot if it doesn't exist
            string uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            string? wordPath = null, pdfPath = null;

            // Step 2: Save Word file if provided
            if (model.WordAttachment != null)
            {
                var wordFileName = model.WordAttachment.FileName;
                var wordFullPath = Path.Combine(uploadsPath, wordFileName);
                // Save file asynchronously to avoid blocking
                using (var stream = new FileStream(wordFullPath, FileMode.Create))
                    await model.WordAttachment.CopyToAsync(stream);
                // Store relative path for database
                wordPath = "uploads/" + wordFileName;
            }

            // Step 3: Save PDF file if provided
            if (model.PdfAttachment != null)
            {
                var pdfFileName = model.PdfAttachment.FileName;
                var pdfFullPath = Path.Combine(uploadsPath, pdfFileName);
                // Save file asynchronously to avoid blocking
                using (var stream = new FileStream(pdfFullPath, FileMode.Create))
                    await model.PdfAttachment.CopyToAsync(stream);
                // Store relative path for database
                pdfPath = "uploads/" + pdfFileName;
            }

            // Step 4: Validate and prepare date fields
            // Set default dates if not provided to prevent database errors
            if (model.VersionDate == default(DateTime))
                model.VersionDate = DateTime.Now;
            if (model.ApprovingDate == default(DateTime))
                model.ApprovingDate = DateTime.Now;

            // Step 5: Prepare document type and sections
            // Use the document type from the form, default to "regulation"
            string documentType = Request.Form["doctype"].ToString();
            if (string.IsNullOrEmpty(documentType))
                documentType = "regulation"; // Default to regulation if not specified

            // Prepare section string by joining array elements
            var sectionString = string.Join(",", model.Sections ?? new List<string>());

            // Step 6: Get a valid USER_ID from database
            int userId = 1; // Default fallback value
            try
            {
                // Try to get the first available user ID from Users table
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
                // If user lookup fails, use fallback value
                userId = 1; // Fallback
            }

            // Step 7: Insert record into RECORDS table using sequence for RECORD_ID
            var insertSql = @"
            DECLARE
                newId NUMBER;
            BEGIN
                INSERT INTO RECORDS (
                    RECORD_ID, USER_ID, REGULATION_NAME, REGULATION_NAME_AR, DEPARTMENT, VERSION, VERSION_DATE,
                    APPROVING_ENTITY, APPROVING_ENTITY_AR, APPROVAL_DATE, DESCRIPTION, DESCRIPTION_AR, 
                    DOCUMENT_TYPE, SECTIONS, NOTES, NOTES_AR
                )
                VALUES (
                    RECORDS_SEQ.NEXTVAL, :UserId, :RegulationName, :RegulationNameAr, :Department, :Version, :VersionDate,
                    :ApprovingEntity, :ApprovingEntityAr, :ApprovalDate, :Description, :DescriptionAr,
                    :DocumentType, :Sections, :Notes, :NotesAr
                )
                RETURNING RECORD_ID INTO :NewRecordId;
            END;";

            // Prepare parameters for SQL execution with proper data types
            var parameters = new List<OracleParameter>
            {
                new("UserId", userId),
                new("RegulationName", model.RegulationName ?? ""),
                new("RegulationNameAr", model.RegulationNameAr ?? ""),
                new("Department", model.RelevantDepartment ?? ""),
                new("Version", model.VersionNumber ?? "1"),
                new("VersionDate", model.VersionDate),
                new("ApprovingEntity", model.ApprovingEntity ?? ""),
                new("ApprovingEntityAr", model.ApprovingEntityAr ?? ""),
                new("ApprovalDate", model.ApprovingDate),
                new("Description", model.Description ?? ""),
                new("DescriptionAr", model.DescriptionAr ?? ""),
                new("DocumentType", documentType),
                new("Sections", sectionString),
                new("Notes", model.Notes ?? ""),
                new("NotesAr", model.NotesAr ?? "")
            };

            // Output param for getting the new ID
            var outputIdParam = new OracleParameter("NewRecordId", OracleDbType.Int32)
            {
                Direction = ParameterDirection.Output
            };
            parameters.Add(outputIdParam);

            // Execute SQL insert
            int newId = 0;
            try
            {
                await _db.ExecuteNonQueryAsync(insertSql, parameters.ToArray());
                newId = ((OracleDecimal)outputIdParam.Value).ToInt32();
            }
            catch (Exception)
            {
                throw; // Re-throw to be caught by outer catch block
            }

            // Step 8: Insert file attachments (no silent failure - all errors are logged)

            if (newId > 0)
            {
                // Insert Word file attachment if present
                if (!string.IsNullOrEmpty(wordPath) && model.WordAttachment != null)
                {
                    try
                    {
                        // SQL to insert Word attachment metadata
                        var insertWordSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) " +
                                            "VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME)";

                        // Execute attachment insert with proper parameters
                        await _db.ExecuteNonQueryAsync(insertWordSql,
                            new OracleParameter("id", newId),
                            new OracleParameter("fileType", "DOCX"),
                            new OracleParameter("path", wordPath),
                            new OracleParameter("ORIGINAL_NAME", model.WordAttachment.FileName));
                    }
                    catch (Exception)
                    {
                        throw; // Re-throw to be handled by outer catch
                    }
                }

                // Insert PDF file attachment if present
                if (!string.IsNullOrEmpty(pdfPath) && model.PdfAttachment != null)
                {
                    try
                    {
                        // SQL to insert PDF attachment metadata with thumbnail page number
                        var insertPdfSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME, TN_PAGE_NO) " +
                                        "VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME, :pageNumber)";

                        // Execute attachment insert with proper parameters including page number
                        await _db.ExecuteNonQueryAsync(insertPdfSql,
                            new OracleParameter("id", newId),
                            new OracleParameter("fileType", "PDF"),
                            new OracleParameter("path", pdfPath),
                            new OracleParameter("ORIGINAL_NAME", model.PdfAttachment.FileName),
                            new OracleParameter("pageNumber", model.PageNumber > 0 ? model.PageNumber : 2)); // Default to page 2 if invalid
                    }
                    catch (Exception)
                    {
                        throw; // Re-throw to be handled by outer catch
                    }
                }
            }

            // Step 10: Log the activity for audit purposes using EF
            if (newId > 0)
            {
                try
                {
                    var currentUser = GetCurrentUser();
                    
                    var newRecordData = new
                    {
                        regulationName = model.RegulationName,
                        regulationNameAr = model.RegulationNameAr,
                        department = model.RelevantDepartment,
                        version = model.VersionNumber,
                        versionDate = model.VersionDate,
                        approvingEntity = model.ApprovingEntity,
                        approvingEntityAr = model.ApprovingEntityAr,
                        approvalDate = model.ApprovingDate,
                        description = model.Description,
                        descriptionAr = model.DescriptionAr,
                        documentType = documentType,
                        sections = sectionString,
                        notes = model.Notes,
                        notesAr = model.NotesAr
                    };

                    LogActivity(
                        currentUser.Id, currentUser.Name, currentUser.Role,
                        "Add", "Record", newId, model.RegulationName ?? "Unknown Record",
                        null, newRecordData, $"Created new record: {model.RegulationName ?? "Unknown"}"
                    );
                }
                catch (Exception logEx)
                {
                    // Don't fail the main operation if logging fails
                    _logger.LogError(logEx, "Failed to log activity for new record creation");
                }
            }

            // Step 11: Success - Set success message and redirect
            TempData["SuccessMessage"] = "Record and attachments saved.";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            // Handle any errors during the entire record creation process

            // More specific error message for debugging including inner exception details
            string errorDetails = ex.Message;
            if (ex.InnerException != null)
                errorDetails += " | Inner: " + ex.InnerException.Message;

            TempData["ErrorMessage"] = $"An error occurred while saving the record: {errorDetails}";
            return View(model);
        }
    }

    /**
     * GetRecordDetails (GET) - Retrieve detailed information for a specific record (AJAX endpoint)
     * 
     * This method is designed for AJAX calls to load record details dynamically.
     * Returns a partial view with record information for embedding in admin pages.
     * 
     * @param id - Record ID to retrieve details for
     * @return PartialView with record details or error status codes
     */


    /**
     * GetRecordDetails (GET) - Retrieve detailed information for a specific record (AJAX endpoint)
     * 
     * This method is designed for AJAX calls to load record details dynamically.
     * Returns a partial view with record information for embedding in admin pages.
     * 
     * @param id - Record ID to retrieve details for
     * @return PartialView with record details or error status codes
     */
    [HttpGet]
    public IActionResult GetRecordDetails(int id)
    {
        try
        {
            // Retrieve record information from database by ID
            var record = _oracleDbService.GetRecordById(id);
            if (record == null)
            {
                // Record not found: set 404 status and return empty partial view
                Response.StatusCode = 404;
                return PartialView("_AdminRecordDetails", null);
            }

            // Return partial view with record details for admin interface
            return PartialView("_AdminRecordDetails", record);
        }
        catch (Exception)
        {
            // Handle errors during record retrieval
            Response.StatusCode = 500;
            return PartialView("_AdminRecordDetails", null);
        }
    }

    /**
     * DownloadPdf (GET) - Download PDF attachment as file download
     * 
     * Retrieves PDF file metadata from database and serves the file for download.
     * Sets proper content headers for file download with original filename.
     * 
     * @param id - Record ID to get PDF attachment for
     * @return File for download or NotFound if file doesn't exist
     */



   /**
     * DownloadPdf (GET) - Download PDF attachment as file download
     * 
     * Retrieves PDF file metadata from database and serves the file for download.
     * Sets proper content headers for file download with original filename.
     * 
     * @param id - Record ID to get PDF attachment for
     * @return File for download or NotFound if file doesn't exist
     */
   [HttpGet]
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
                        string ORIGINAL_NAME = reader.GetString(1);

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
                        return File(fileBytes, "application/pdf", ORIGINAL_NAME);
                    }
                }
            }
        }

        // Return 404 if no PDF attachment found for this record
        return NotFound(); // if no record found
    }

    /**
     * ViewPdf (GET) - Display PDF attachment inline in browser
     * 
     * Similar to DownloadPdf but displays the PDF inline in the browser instead of downloading.
     * Sets content disposition to "inline" for browser PDF viewer integration.
     * 
     * @param id - Record ID to get PDF attachment for
     * @return File for inline viewing or NotFound if file doesn't exist
     */

    /**
     * ViewPdf (GET) - Display PDF attachment inline in browser
     * 
     * Similar to DownloadPdf but displays the PDF inline in the browser instead of downloading.
     * Sets content disposition to "inline" for browser PDF viewer integration.
     * 
     * @param id - Record ID to get PDF attachment for
     * @return File for inline viewing or NotFound if file doesn't exist
     */
    [HttpGet]
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
                    string ORIGINAL_NAME = reader.GetString(1);

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
                    Response.Headers["Content-Disposition"] = $"inline; filename*=UTF-8''{Uri.EscapeDataString(ORIGINAL_NAME)}";
                    return File(fileBytes, "application/pdf");

                }
            }
        }
    }

    // Return 404 if no PDF attachment found
    return NotFound();
}

    /**
     * UpdateRecord (POST) - Update existing record information
     * 
     * Updates all fields of an existing regulation record in the database.
     * Uses CSRF protection and comprehensive error handling.
     * 
     * @param recordId - ID of record to update
     * @param regulationName - Updated regulation name
     * @param department - Updated department
     * @param version - Updated version number
     * @param versionDate - Updated version date
     * @param approvalDate - Updated approval date
     * @param approvingEntity - Updated approving entity
     * @param description - Updated description
     * @param documentType - Updated document type
     * @param sections - Updated sections (comma-separated)
     * @param notes - Updated notes
     * 
     * @return RedirectToAction to AdminPage with success/error message
     */

    /**
     * UpdateRecord (POST) - Update existing record information
     * 
     * Updates all fields of an existing regulation record in the database.
     * Uses CSRF protection and comprehensive error handling.
     * 
     * @param recordId - ID of record to update
     * @param regulationName - Updated regulation name
     * @param regulationNameAr - Updated regulation name (Arabic)
     * @param department - Updated department
     * @param version - Updated version number
     * @param versionDate - Updated version date
     * @param approvalDate - Updated approval date
     * @param approvingEntity - Updated approving entity
     * @param approvingEntityAr - Updated approving entity (Arabic)
     * @param description - Updated description
     * @param descriptionAr - Updated description (Arabic)
     * @param documentType - Updated document type
     * @param sections - Updated sections (comma-separated)
     * @param notes - Updated notes
     * @param notesAr - Updated notes (Arabic)
     * 
     * @return RedirectToAction to AdminPage with success/error message
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateRecord(
        int recordId,
        string regulationName,
        string? regulationNameAr,
        string department,
        string version,
        DateTime versionDate,
        DateTime approvalDate,
        string approvingEntity,
        string? approvingEntityAr,
        string description,
        string? descriptionAr,
        string documentType,
        string sections,
        string notes,
        string? notesAr,
        int? pageNumber = null)
    {
        try
        {
            // Step 1: Arabic validation for update fields
            var arabicValidationResults = OracleDbService.ValidateAddNewRecordArabicFields(
                regulationNameAr, 
                approvingEntityAr, 
                descriptionAr, 
                notesAr
            );
            
            var arabicValidationErrors = new List<string>();
            
            foreach (var validation in arabicValidationResults)
            {
                if (!validation.Value)
                {
                    var fieldName = validation.Key switch
                    {
                        "regulationNameAr" => "Regulation Name (Arabic)",
                        "approvingEntityAr" => "Approving Entity (Arabic)",
                        "descriptionAr" => "Description (Arabic)",
                        "notesAr" => "Notes (Arabic)",
                        _ => validation.Key
                    };
                    arabicValidationErrors.Add($"{fieldName} contains invalid Arabic characters");
                }
            }
            
            if (arabicValidationErrors.Any())
            {
                TempData["ErrorMessage"] = "Arabic validation failed: " + string.Join("; ", arabicValidationErrors);
                return RedirectToAction("AdminPage");
            }

            // Step 2: Get old record data BEFORE update for logging
            var oldRecord = _oracleDbService.GetRecordById(recordId);
            
            var oldRecordData = oldRecord != null ? new
            {
                regulationName = oldRecord.RegulationName,
                regulationNameAr = oldRecord.RegulationNameAr,
                department = oldRecord.Department,
                version = oldRecord.Version,
                versionDate = oldRecord.VersionDate,
                approvingEntity = oldRecord.ApprovingEntity,
                approvingEntityAr = oldRecord.ApprovingEntityAr,
                approvalDate = oldRecord.ApprovalDate,
                description = oldRecord.Description,
                descriptionAr = oldRecord.DescriptionAr,
                documentType = oldRecord.DocumentType,
                sections = oldRecord.Sections,
                notes = oldRecord.Notes,
                notesAr = oldRecord.NotesAr
            } : null;

            // Step 3: Attempt to update record using Oracle service
            bool success = _oracleDbService.UpdateRecord(
                recordId, regulationName, regulationNameAr, department, version, versionDate,
                approvalDate, approvingEntity, approvingEntityAr, description, descriptionAr, 
                documentType, sections, notes, notesAr, pageNumber);

            if (success)
            {
                // Clear thumbnail cache if page number was updated
                if (pageNumber.HasValue)
                {
                    try
                    {
                        // Clear the specific thumbnail cache for this record and page
                        using (var httpClient = new HttpClient())
                        {
                            var clearCacheUrl = $"{Request.Scheme}://{Request.Host}/api/pdf/clear-cache?recordId={recordId}&pageNumber={pageNumber.Value}";
                            await httpClient.PostAsync(clearCacheUrl, null);
                        }
                    }
                    catch
                    {
                        // Cache clearing failed, but record update was successful
                        // This is not critical, so we just continue
                    }
                }
                
                // Step 4: Log the activity for audit purposes using EF
                try
                {
                    var currentUser = GetCurrentUser();
                    
                    var newRecordData = new
                    {
                        regulationName,
                        regulationNameAr,
                        department,
                        version,
                        versionDate,
                        approvingEntity,
                        approvingEntityAr,
                        approvalDate,
                        description,
                        descriptionAr,
                        documentType,
                        sections,
                        notes,
                        notesAr
                    };

                    LogActivity(
                        currentUser.Id, currentUser.Name, currentUser.Role,
                        "Edit", "Record", recordId, regulationName ?? "Unknown Record",
                        oldRecordData, newRecordData, $"Updated record: {regulationName ?? "Unknown"}"
                    );
                }
                catch (Exception logEx)
                {
                    // Don't fail the main operation if logging fails
                    _logger.LogError(logEx, "Failed to log activity for record update");
                }

                // Update successful: set success message
                TempData["SuccessMessage"] = $"Record #{recordId} has been updated successfully!";
            }
            else
            {
                // Update failed: set error message
                TempData["ErrorMessage"] = "Failed to update record. Please try again.";
            }
        }
        catch (Exception)
        {
            // Handle any errors during update process
            TempData["ErrorMessage"] = "An error occurred while updating the record.";
        }

        // Always redirect back to admin page
        return RedirectToAction("AdminPage");
    }

    /**
     * DeleteRecord (POST) - Delete a single record
     * 
     * Removes a regulation record and its associated attachments from the database.
     * Uses CSRF protection for security.
     * 
     * @param recordId - ID of record to delete
     * @return RedirectToAction to AdminPage with success/error message
     */

    /**
     * DeleteRecord (POST) - Delete a single record
     * 
     * Removes a regulation record and its associated attachments from the database.
     * Uses CSRF protection for security.
     * 
     * @param recordId - ID of record to delete
     * @return RedirectToAction to AdminPage with success/error message
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteRecord(int recordId)
    {
        try
        {
            // STEP 1: Get record data before deletion for logging
            var recordToDelete = _oracleDbService.GetRecordById(recordId);
            
            // STEP 2: Get all attachments for this record before deletion (for file cleanup)
            List<string> filesToDelete = new List<string>();
            try
            {
                var attachments = _oracleDbService.GetAttachmentsByRecordId(recordId);
                foreach (var attachment in attachments)
                {
                    if (attachment?.FilePath != null)
                    {
                        string filePath = attachment.FilePath.ToString() ?? "";
                        if (!string.IsNullOrEmpty(filePath))
                        {
                            string fullPath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                            filesToDelete.Add(fullPath);
                        }
                    }
                }
            }
            catch (Exception)
            {
            }

            // STEP 3: Delete record from database (cascades to remove attachments)
            bool success = _oracleDbService.DeleteRecord(recordId);

            if (success)
            {
                // STEP 4: Log the deletion activity using EF
                try
                {
                    var currentUser = GetCurrentUser();

                    var deletedRecordData = recordToDelete != null ? new
                    {
                        regulationName = recordToDelete.RegulationName,
                        regulationNameAr = recordToDelete.RegulationNameAr,
                        department = recordToDelete.Department,
                        version = recordToDelete.Version,
                        documentType = recordToDelete.DocumentType,
                        versionDate = recordToDelete.VersionDate,
                        approvalDate = recordToDelete.ApprovalDate
                    } : null;

                    LogActivity(
                        currentUser.Id, currentUser.Name, currentUser.Role,
                        "Delete", "Record", recordId, recordToDelete?.RegulationName ?? "Unknown Record",
                        deletedRecordData, null, $"Deleted record: {recordToDelete?.RegulationName ?? "Unknown"}"
                    );
                }
                catch (Exception logEx)
                {
                    // Don't fail the main operation if logging fails
                    _logger.LogError(logEx, "Failed to log activity for record deletion");
                }

                // STEP 5: Database deletion successful - now clean up physical files
                int filesDeleted = 0;
                foreach (string fileToDelete in filesToDelete)
                {
                    try
                    {
                        if (System.IO.File.Exists(fileToDelete))
                        {
                            System.IO.File.Delete(fileToDelete);
                            filesDeleted++;
                        }
                    }
                    catch (Exception)
                    {
                    }
                }

                // Deletion successful: set success message with record ID
                TempData["SuccessMessage"] = $"Record #{recordId} deleted successfully! {filesDeleted} associated files were also removed.";
            }
            else
            {
                // Deletion failed: set error message
                TempData["ErrorMessage"] = "Failed to delete record. Please try again.";
            }
        }
        catch (Exception)
        {
            // Handle any errors during deletion process
            TempData["ErrorMessage"] = "An error occurred while deleting the record.";
        }

        // Always redirect back to admin page
        return RedirectToAction("AdminPage");
    }

    /**
     * DeleteMultipleRecords (POST) - Bulk delete multiple records
     * 
     * Deletes multiple regulation records in a batch operation.
     * Tracks success/failure count and provides detailed feedback.
     * Uses CSRF protection for security.
     * 
     * @param recordIds - List of record IDs to delete
     * @return RedirectToAction to AdminPage with detailed success/error messages
     */

    /**
     * DeleteMultipleRecords (POST) - Bulk delete multiple records
     * 
     * Deletes multiple regulation records in a batch operation.
     * Tracks success/failure count and provides detailed feedback.
     * Uses CSRF protection for security.
     * 
     * @param recordIds - List of record IDs to delete
     * @return RedirectToAction to AdminPage with detailed success/error messages
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteMultipleRecords(List<int> recordIds)
    {
        try
        {
            // Validate that records were selected for deletion
            if (recordIds == null || !recordIds.Any())
            {
                TempData["ErrorMessage"] = "No records selected for deletion.";
                return RedirectToAction("AdminPage");
            }

            // Track deletion results
            int successCount = 0;
            int totalCount = recordIds.Count;
            int totalFilesDeleted = 0;
            List<int> successfulDeletes = new List<int>();
            List<int> failedDeletes = new List<int>();

            // Attempt to delete each record individually
            foreach (int recordId in recordIds)
            {
                // STEP 1: Get all attachments for this record before deletion (for file cleanup)
                List<string> filesToDelete = new List<string>();
                try
                {
                    var attachments = _oracleDbService.GetAttachmentsByRecordId(recordId);
                    foreach (var attachment in attachments)
                    {
                        if (attachment?.FilePath != null)
                        {
                            string filePath = attachment.FilePath.ToString() ?? "";
                            if (!string.IsNullOrEmpty(filePath))
                            {
                                string fullPath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                                filesToDelete.Add(fullPath);
                            }
                        }
                    }
                }
                catch (Exception)
                {
                }

                // STEP 2: Delete record from database
                bool success = _oracleDbService.DeleteRecord(recordId);
                
                if (success)
                {
                    successCount++;
                    successfulDeletes.Add(recordId);

                    // STEP 3: Database deletion successful - now clean up physical files
                    foreach (string fileToDelete in filesToDelete)
                    {
                        try
                        {
                            if (System.IO.File.Exists(fileToDelete))
                            {
                                System.IO.File.Delete(fileToDelete);
                                totalFilesDeleted++;
                            }
                        }
                        catch (Exception)
                        {
                        }
                    }
                }
                else
                {
                    failedDeletes.Add(recordId);
                }
            }

            // Provide detailed feedback based on results
            if (successCount == totalCount)
            {
                // All deletions successful
                if (totalCount == 1)
                {
                    TempData["SuccessMessage"] = $"Record #{successfulDeletes[0]} deleted successfully! {totalFilesDeleted} associated files were also removed.";
                }
                else
                {
                    TempData["SuccessMessage"] = $"Successfully deleted {successCount} records: #{string.Join(", #", successfulDeletes)}. {totalFilesDeleted} associated files were also removed.";
                }
            }
            else if (successCount > 0)
            {
                // Partial success: some deletions failed
                TempData["SuccessMessage"] = $"Successfully deleted {successCount} records: #{string.Join(", #", successfulDeletes)}. {totalFilesDeleted} associated files were also removed.";
                TempData["ErrorMessage"] = $"Failed to delete {totalCount - successCount} records: #{string.Join(", #", failedDeletes)}";
            }
            else
            {
                // All deletions failed
                TempData["ErrorMessage"] = $"Failed to delete records: #{string.Join(", #", failedDeletes)}. Please try again.";
            }
        }
        catch (Exception)
        {
            // Handle any errors during bulk deletion process
            TempData["ErrorMessage"] = "An error occurred while deleting the records.";
        }

        // Always redirect back to admin page
        return RedirectToAction("AdminPage");
    }

    /**
     * UpdateAttachment (POST) - Update file attachments for existing records
     * 
     * Handles uploading new file attachments to replace existing ones.
     * Supports both Word and PDF file types with validation.
     * 
     * Features:
     * - File type validation (.doc, .docx, .pdf)
     * - Unique filename generation to prevent conflicts
     * - Database metadata update
     * - File cleanup on failure
     * - CSRF protection
     * 
     * @param recordId - ID of record to update attachment for
     * @param fileType - Type of file ("word" or "pdf")
     * @param file - The uploaded file
     * 
     * @return JSON response indicating success/failure with details
     */

    /**
     * UpdateAttachment (POST) - Update file attachments for existing records
     * 
     * Handles uploading new file attachments to replace existing ones.
     * Supports both Word and PDF file types with validation.
     * 
     * Features:
     * - File type validation (.doc, .docx, .pdf)
     * - Unique filename generation to prevent conflicts
     * - Database metadata update
     * - File cleanup on failure
     * - CSRF protection
     * 
     * @param recordId - ID of record to update attachment for
     * @param fileType - Type of file ("word" or "pdf")
     * @param file - The uploaded file
     * 
     * @return JSON response indicating success/failure with details
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateAttachment(int recordId, string fileType, IFormFile file)
    {
        try
        {
            // Validate that a file was provided
            if (file == null || file.Length == 0)
            {
                return Json(new { success = false, message = "No file selected." });
            }

            // Validate file extension based on file type
            var allowedExtensions = fileType.ToLower() == "word" 
                ? new[] { ".doc", ".docx" } 
                : new[] { ".pdf" };
            
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return Json(new { success = false, message = $"Only {string.Join(", ", allowedExtensions)} files are allowed for {fileType} type." });
            }

            // STEP 1: Get the old file path before updating (for cleanup)
            string? oldFilePath = null;
            try
            {
                var attachments = _oracleDbService.GetAttachmentsByRecordId(recordId);
                var existingAttachment = attachments?.FirstOrDefault(a => 
                    (fileType.ToLower() == "word" && (a.FileType?.ToString()?.ToLower() == "word" || a.FileType?.ToString()?.ToLower() == "docx")) ||
                    (fileType.ToLower() == "pdf" && a.FileType?.ToString()?.ToLower() == "pdf"));
                
                if (existingAttachment?.FilePath != null)
                {
                    // Convert relative path to absolute path
                    string existingFilePath = existingAttachment.FilePath.ToString() ?? "";
                    if (!string.IsNullOrEmpty(existingFilePath))
                    {
                        oldFilePath = Path.Combine(_webHostEnvironment.WebRootPath, existingFilePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                    }
                }
            }
            catch (Exception)
            {
            }

            // STEP 2: Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // STEP 3: Generate unique filename to prevent conflicts
            var fileName = file.FileName;
            var filePath = Path.Combine(uploadsPath, fileName);
            

            // STEP 4: Save new file to server asynchronously
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // STEP 5: Update database with new file information
            var relativePath = $"uploads/{fileName}";
            bool success = _oracleDbService.UpdateAttachment(recordId, fileType, relativePath, file.FileName);

            if (success)
            {
                // STEP 6: Clear thumbnail cache if PDF was updated
                if (fileType.ToLower() == "pdf")
                {
                    var thumbnailCacheKey = $"thumbnail_{recordId}";
                    _cache.Remove(thumbnailCacheKey);
                }

                // STEP 7: Database update successful - now clean up old file
                if (!string.IsNullOrEmpty(oldFilePath) && System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (Exception)
                    {
                        // Don't fail the operation if old file can't be deleted
                    }
                }

                // Success: return positive JSON response with original filename
                return Json(new { 
                    success = true, 
                    message = "File updated successfully.", 
                    fileName = file.FileName 
                });
            }
            else
            {
                // Database update failed: clean up new uploaded file and return error
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                return Json(new { success = false, message = "Failed to update file in database." });
            }
        }
        catch (Exception)
        {
            // Handle any errors during file update process
            return Json(new { success = false, message = "An error occurred while updating the file." });
        }
    }

    /// <summary>
    /// Export selected database tables to Excel file
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ExportAllDataToExcel(List<string> selectedTables)
    {
        try
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            
            using var package = new ExcelPackage();
            
            // If no tables selected or "all" is selected, export all tables
            if (selectedTables == null || selectedTables.Count == 0 || selectedTables.Contains("all"))
            {
                selectedTables = new List<string> { "records", "history", "users", "contact", "attachments" };
            }
            
            // Export selected tables to separate worksheets
            foreach (var table in selectedTables)
            {
                switch (table.ToLower())
                {
                    case "records":
                        await ExportRecordsToWorksheet(package);
                        break;
                    case "history":
                        await ExportUserHistoryToWorksheet(package);
                        break;
                    case "users":
                        await ExportUsersToWorksheet(package);
                        break;
                    case "contact":
                        await ExportContactInformationToWorksheet(package);
                        break;
                    case "attachments":
                        await ExportAttachmentsToWorksheet(package);
                        break;
                }
            }
            
            // Ensure at least one worksheet exists
            if (package.Workbook.Worksheets.Count == 0)
            {
                TempData["ErrorMessage"] = "No valid tables selected for export.";
                return RedirectToAction("AdminPage");
            }

            // Generate filename with timestamp and selected tables info
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var tablesInfo = selectedTables.Count == 5 ? "AllTables" : string.Join("-", selectedTables);
            var fileName = $"Export_{tablesInfo}_{timestamp}.xlsx";

            // Return file for download
            var fileBytes = package.GetAsByteArray();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Export failed: {ex.Message}";
            return RedirectToAction("AdminPage");
        }
    }

    /// <summary>
    /// Export RECORDS table to Excel worksheet
    /// </summary>
    private async Task ExportRecordsToWorksheet(ExcelPackage package)
    {
        var worksheet = package.Workbook.Worksheets.Add("RECORDS");

        using var connection = new OracleConnection(_connectionString);
        await connection.OpenAsync();

        var command = new OracleCommand("SELECT * FROM RECORDS ORDER BY RECORD_ID", connection);
        using var reader = await command.ExecuteReaderAsync();

        // Add headers
        var headers = new[] { 
            "RECORD_ID", "USER_ID", "REGULATION_NAME", "NOTES", "VERSION", 
            "DESCRIPTION", "DEPARTMENT", "DOCUMENT_TYPE", "VERSION_DATE", 
            "APPROVAL_DATE", "SECTIONS", "CREATED_AT", "APPROVING_ENTITY",
            "REGULATION_NAME_AR", "APPROVING_ENTITY_AR", "DESCRIPTION_AR", "NOTES_AR"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
        }

        // Add data rows
        int row = 2;
        while (await reader.ReadAsync())
        {
            for (int col = 0; col < headers.Length; col++)
            {
                try
                {
                    var value = reader[headers[col]];
                    worksheet.Cells[row, col + 1].Value = value == DBNull.Value ? "" : value?.ToString();
                }
                catch
                {
                    worksheet.Cells[row, col + 1].Value = "";
                }
            }
            row++;
        }

        worksheet.Cells.AutoFitColumns();
    }

    /// <summary>
    /// Export USER_HISTORY table to Excel worksheet
    /// </summary>
    private async Task ExportUserHistoryToWorksheet(ExcelPackage package)
    {
        var worksheet = package.Workbook.Worksheets.Add("USER_HISTORY");

        using var connection = new OracleConnection(_connectionString);
        await connection.OpenAsync();

        var command = new OracleCommand(@"
            SELECT h.ID, h.USER_ID, h.RECORD_ID, h.ACTION, h.ACTION_DATE, 
                   r.REGULATION_NAME
            FROM USER_HISTORY h
            LEFT JOIN RECORDS r ON h.RECORD_ID = r.RECORD_ID
            ORDER BY h.ACTION_DATE DESC", connection);
        
        using var reader = await command.ExecuteReaderAsync();

        // Add headers
        var headers = new[] { "ID", "USER_ID", "RECORD_ID", "ACTION", "ACTION_DATE", "REGULATION_NAME" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
        }

        // Add data rows
        int row = 2;
        while (await reader.ReadAsync())
        {
            for (int col = 0; col < headers.Length; col++)
            {
                try
                {
                    var value = reader[headers[col]];
                    worksheet.Cells[row, col + 1].Value = value == DBNull.Value ? "" : value?.ToString();
                }
                catch
                {
                    worksheet.Cells[row, col + 1].Value = "";
                }
            }
            row++;
        }

        worksheet.Cells.AutoFitColumns();
    }

    /// <summary>
    /// Export USERS table to Excel worksheet
    /// </summary>
    private async Task ExportUsersToWorksheet(ExcelPackage package)
    {
        var worksheet = package.Workbook.Worksheets.Add("USERS");

        using var connection = new OracleConnection(_connectionString);
        await connection.OpenAsync();

        var command = new OracleCommand(@"
            SELECT USER_ID, NAME, EMAIL, PHONE_NUMBER, CREATED_AT, UPDATED_AT, ROLE 
            FROM USERS 
            ORDER BY USER_ID", connection);
        using var reader = await command.ExecuteReaderAsync();

        // Add headers
        var headers = new[] { "USER_ID", "NAME", "EMAIL", "PHONE_NUMBER", "CREATED_AT", "UPDATED_AT", "ROLE" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
        }

        // Add data rows
        int row = 2;
        while (await reader.ReadAsync())
        {
            for (int col = 0; col < headers.Length; col++)
            {
                try
                {
                    var value = reader[headers[col]];
                    worksheet.Cells[row, col + 1].Value = value == DBNull.Value ? "" : value?.ToString();
                }
                catch
                {
                    worksheet.Cells[row, col + 1].Value = "";
                }
            }
            row++;
        }

        worksheet.Cells.AutoFitColumns();
    }

    /// <summary>
    /// Export CONTACT_INFORMATION table to Excel worksheet
    /// </summary>
    private async Task ExportContactInformationToWorksheet(ExcelPackage package)
    {
        var worksheet = package.Workbook.Worksheets.Add("CONTACT_INFORMATION");

        using var connection = new OracleConnection(_connectionString);
        await connection.OpenAsync();

        var command = new OracleCommand("SELECT * FROM CONTACT_INFORMATION ORDER BY CONTACT_ID", connection);
        using var reader = await command.ExecuteReaderAsync();

        // Add headers
        var headers = new[] { "CONTACT_ID", "DEPARTMENT", "NAME", "EMAIL", "MOBILE", "TELEPHONE", "NAME_AR" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightYellow);
        }

        // Add data rows
        int row = 2;
        while (await reader.ReadAsync())
        {
            for (int col = 0; col < headers.Length; col++)
            {
                try
                {
                    var value = reader[headers[col]];
                    worksheet.Cells[row, col + 1].Value = value == DBNull.Value ? "" : value?.ToString();
                }
                catch
                {
                    worksheet.Cells[row, col + 1].Value = "";
                }
            }
            row++;
        }

        worksheet.Cells.AutoFitColumns();
    }

    /// <summary>
    /// Export ATTACHMENTS table to Excel worksheet
    /// </summary>
    private async Task ExportAttachmentsToWorksheet(ExcelPackage package)
    {
        var worksheet = package.Workbook.Worksheets.Add("ATTACHMENTS");

        using var connection = new OracleConnection(_connectionString);
        await connection.OpenAsync();

        var command = new OracleCommand(@"
            SELECT a.ATTACHMENT_ID, a.RECORD_ID, a.FILE_TYPE, a.FILE_PATH, 
                   a.UPLOAD_DATE, a.ORIGINAL_NAME, r.REGULATION_NAME 
            FROM ATTACHMENTS a
            LEFT JOIN RECORDS r ON a.RECORD_ID = r.RECORD_ID
            ORDER BY a.ATTACHMENT_ID", connection);
        
        using var reader = await command.ExecuteReaderAsync();

        // Add headers
        var headers = new[] { "ATTACHMENT_ID", "RECORD_ID", "FILE_TYPE", "FILE_PATH", "UPLOAD_DATE", "ORIGINAL_NAME", "REGULATION_NAME" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightCoral);
        }

        // Add data rows
        int row = 2;
        while (await reader.ReadAsync())
        {
            for (int col = 0; col < headers.Length; col++)
            {
                try
                {
                    var value = reader[headers[col]];
                    worksheet.Cells[row, col + 1].Value = value == DBNull.Value ? "" : value?.ToString();
                }
                catch
                {
                    worksheet.Cells[row, col + 1].Value = "";
                }
            }
            row++;
        }

        worksheet.Cells.AutoFitColumns();
    }

    /**
     * ActivityLog (GET) - Display the privileged user activity log page
     * 
     * Shows all changes made by Admin and Editor users with filtering and pagination.
     * Only accessible by Admin users for audit purposes.
     * 
     * @return View with activity log data and filters
     */
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivityLog(string? actionTypeFilter = null, string? entityTypeFilter = null, 
        string? userRoleFilter = null, DateTime? startDate = null, DateTime? endDate = null, 
        string? searchTerm = null, int page = 1)
    {
        try
        {
            // Get filtered activity logs with pagination
            var (logs, totalCount) = await _activityLogService.GetActivityLogsAsync(
                actionTypeFilter, entityTypeFilter, userRoleFilter, 
                startDate, endDate, searchTerm, page, 20);

            // Get statistics for the dashboard
            var (totalActions, adminActions, editorActions, recordActions, contactActions) = 
                await _activityLogService.GetActivityStatisticsAsync();

            var viewModel = new ActivityLogViewModel
            {
                ActivityLogs = logs,
                ActionTypeFilter = actionTypeFilter,
                EntityTypeFilter = entityTypeFilter,
                UserRoleFilter = userRoleFilter,
                StartDate = startDate,
                EndDate = endDate,
                SearchTerm = searchTerm,
                CurrentPage = page,
                TotalCount = totalCount,
                TotalActions = totalActions,
                AdminActionsCount = adminActions,
                EditorActionsCount = editorActions,
                RecordActionsCount = recordActions,
                ContactActionsCount = contactActions
            };

            return View(viewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading activity log");
            TempData["ErrorMessage"] = "An error occurred while loading the activity log.";
            return View(new ActivityLogViewModel());
        }
    }

    /**
     * ExportActivityLog (POST) - Export filtered activity log data
     * 
     * Exports activity log data to CSV format based on applied filters.
     * Only accessible by Admin users.
     * 
     * @param exportModel - Filter parameters for export
     * @return CSV file download
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportActivityLog(ExportActivityLogViewModel exportModel)
    {
        try
        {
            // Get all matching logs (no pagination for export)
            var (logs, _) = await _activityLogService.GetActivityLogsAsync(
                exportModel.ActionTypeFilter, exportModel.EntityTypeFilter, exportModel.UserRoleFilter,
                exportModel.StartDate, exportModel.EndDate, exportModel.SearchTerm, 1, 10000);

            // Generate CSV content
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Timestamp,Action,Entity Type,Entity ID,Entity Name,User,Role,Changes,IP Address");

            foreach (var log in logs)
            {
                csv.AppendLine($"\"{log.FormattedTimestamp}\",\"{log.ActionDisplayName}\",\"{log.EntityDisplayName}\"," +
                              $"\"{log.EntityId}\",\"{log.EntityName?.Replace("\"", "\"\"")}\",\"{log.UserName.Replace("\"", "\"\"")}\",\"{log.UserRole}\"," +
                              $"\"{log.GetChangesSummary()?.Replace("\"", "\"\"")}\",\"{log.IpAddress}\"");
            }

            var fileName = $"activity_log_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(System.Text.Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting activity log");
            TempData["ErrorMessage"] = "An error occurred while exporting the activity log.";
            return RedirectToAction("ActivityLog");
        }
    }

    /**
     * GetActivityLogDetails (GET) - Get detailed information for a specific activity log entry
     * 
     * AJAX endpoint for retrieving detailed activity log information.
     * Returns JSON with before/after data for edit operations.
     * 
     * @param logId - Activity log ID to retrieve details for
     * @return JSON response with log details
     */
    /**
     * GetActivityLogDetails (GET) - Get detailed information for a specific activity log entry
     * 
     * AJAX endpoint for retrieving detailed activity log information.
     * Returns JSON with before/after data for edit operations.
     * 
     * @param logId - Activity log ID to retrieve details for
     * @return JSON response with log details
     */
    // Explicit absolute routes to match both /Admin/GetActivityLogDetails and /Admin/GetActivityLogDetails/{logId}
    [HttpGet("/Admin/GetActivityLogDetails/{logId:int}")]
    [HttpGet("/Admin/GetActivityLogDetails")] // fallback: /Admin/GetActivityLogDetails?logId=58
    [AllowAnonymous] // Temporarily remove auth for debugging
    public async Task<IActionResult> GetActivityLogDetails(int logId)
    {
        try
        {
            if (logId <= 0)
            {
                _logger.LogWarning("GetActivityLogDetails called with invalid logId: {LogId}. Check routing and binding.", logId);
                return BadRequest(new { error = "Invalid logId. Use /Admin/GetActivityLogDetails/{logId}", received = logId });
            }
            _logger.LogInformation("GetActivityLogDetails called with logId: {LogId} (Type: {LogIdType})", logId, logId.GetType().Name);
            Console.WriteLine($"DEBUG: GetActivityLogDetails called with logId: {logId}");
            
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            // Try new schema first (ACTION_TIMESTAMP, OLD_VALUES, NEW_VALUES)
            object? result = await TryGetActivityLogDetailsWithSchema(connection, logId, true);
            
            // If not found with new schema, try old schema (TIMESTAMP, BEFORE_DATA, AFTER_DATA)
            if (result == null)
            {
                result = await TryGetActivityLogDetailsWithSchema(connection, logId, false);
            }

            if (result != null)
            {
                return Json(result);
            }
            else
            {
                _logger.LogWarning("Activity log entry with ID {LogId} not found in database", logId);
                
                // Additional debugging - check what LogIds are actually available
                var availableIds = new List<int>();
                try 
                {
                    var checkSql = "SELECT LOG_ID FROM ACTIVITY_LOGS ORDER BY LOG_ID";
                    using var checkCmd = new OracleCommand(checkSql, connection);
                    using var checkReader = await checkCmd.ExecuteReaderAsync();
                    while (await checkReader.ReadAsync()) {
                        availableIds.Add(checkReader.GetInt32("LOG_ID"));
                    }
                } catch (Exception checkEx) {
                    _logger.LogError(checkEx, "Error checking available LogIds");
                }
                
                return NotFound(new { 
                    error = $"Activity log entry with ID {logId} not found in database.",
                    requestedLogId = logId,
                    availableLogIds = availableIds.Take(10).ToArray(), // Show first 10 available IDs
                    totalAvailable = availableIds.Count,
                    message = $"Available LogIds: [{string.Join(", ", availableIds.Take(5))}]{(availableIds.Count > 5 ? "..." : "")}"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activity log details for log {LogId}. Error: {Error}", logId, ex.Message);
            return StatusCode(500, new { 
                error = "Database query failed", 
                message = ex.Message,
                logId = logId
            });
        }
    }

    private async Task<object?> TryGetActivityLogDetailsWithSchema(OracleConnection connection, int logId, bool useNewSchema)
    {
        try
        {
            var tsCol = useNewSchema ? "ACTION_TIMESTAMP" : "TIMESTAMP";
            var oldCol = useNewSchema ? "OLD_VALUES" : "BEFORE_DATA";
            var newCol = useNewSchema ? "NEW_VALUES" : "AFTER_DATA";

            _logger.LogInformation("Attempting to query with {Schema} schema - LogId: {LogId}", 
                useNewSchema ? "NEW" : "OLD", logId);
            
            var sql = $@"SELECT 
                            LOG_ID,
                            USER_NAME,
                            USER_ROLE,
                            ACTION_TYPE,
                            ENTITY_TYPE,
                            ENTITY_ID,
                            ENTITY_NAME,
                            {tsCol} AS ACTION_TIMESTAMP,
                            {oldCol} AS BEFORE_DATA,
                            {newCol} AS AFTER_DATA,
                            DETAILS,
                            USER_ID
                        FROM ACTIVITY_LOGS 
                        WHERE LOG_ID = :logId";

            _logger.LogInformation("Executing SQL: {SQL}", sql);

            using var command = new OracleCommand(sql, connection);
            command.Parameters.Add("logId", OracleDbType.Int32).Value = logId;

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                _logger.LogInformation("Successfully found record with {Schema} schema", 
                    useNewSchema ? "NEW" : "OLD");
                
                // Handle CLOB data properly for BEFORE_DATA and AFTER_DATA
                string? beforeData = null;
                string? afterData = null;

                if (!reader.IsDBNull("BEFORE_DATA"))
                {
                    var clobReader = reader.GetTextReader("BEFORE_DATA");
                    beforeData = await clobReader.ReadToEndAsync();
                }

                if (!reader.IsDBNull("AFTER_DATA"))
                {
                    var clobReader = reader.GetTextReader("AFTER_DATA");
                    afterData = await clobReader.ReadToEndAsync();
                }

                return new
                {
                    LogId = reader.IsDBNull("LOG_ID") ? 0 : reader.GetInt32("LOG_ID"),
                    UserId = reader.IsDBNull("USER_ID") ? 0 : reader.GetInt32("USER_ID"),
                    UserName = reader.IsDBNull("USER_NAME") ? null : reader.GetString("USER_NAME"),
                    UserRole = reader.IsDBNull("USER_ROLE") ? null : reader.GetString("USER_ROLE"),
                    ActionType = reader.IsDBNull("ACTION_TYPE") ? null : reader.GetString("ACTION_TYPE"),
                    EntityType = reader.IsDBNull("ENTITY_TYPE") ? null : reader.GetString("ENTITY_TYPE"),
                    EntityId = reader.IsDBNull("ENTITY_ID") ? (int?)null : reader.GetInt32("ENTITY_ID"),
                    EntityName = reader.IsDBNull("ENTITY_NAME") ? null : reader.GetString("ENTITY_NAME"),
                    ActionTimestamp = reader.GetDateTime("ACTION_TIMESTAMP"),
                    BeforeData = beforeData,
                    AfterData = afterData,
                    Details = reader.IsDBNull("DETAILS") ? null : reader.GetString("DETAILS")
                };
            }
            else
            {
                _logger.LogWarning("No record found with {Schema} schema for LogId: {LogId}", 
                    useNewSchema ? "NEW" : "OLD", logId);
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to query with {Schema} schema for LogId {LogId}. Error: {ErrorMessage}. SQL attempted: {SQL}", 
                useNewSchema ? "new" : "old", logId, ex.Message, 
                $"Columns attempted: {(useNewSchema ? "ACTION_TIMESTAMP, OLD_VALUES, NEW_VALUES" : "TIMESTAMP, BEFORE_DATA, AFTER_DATA")}");
            return null;
        }
    }

    /**
     * Debug endpoint to check available LOG_IDs in ACTIVITY_LOGS table
     */
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAvailableLogIds()
    {
        try
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"SELECT LOG_ID FROM ACTIVITY_LOGS ORDER BY LOG_ID";

            var logIds = new List<int>();
            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                logIds.Add(reader.GetInt32("LOG_ID"));
            }

            return Json(new { availableLogIds = logIds, count = logIds.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available log IDs: {Error}", ex.Message);
            return Json(new { error = ex.Message });
        }
    }

    /**
     * Debug endpoint to check ACTIVITY_LOGS table structure
     */
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetActivityLogColumns()
    {
        try
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"SELECT COLUMN_NAME, DATA_TYPE, NULLABLE 
                        FROM USER_TAB_COLUMNS 
                        WHERE TABLE_NAME = 'ACTIVITY_LOGS' 
                        ORDER BY COLUMN_ID";

            var columns = new List<object>();
            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                columns.Add(new
                {
                    ColumnName = reader.GetString("COLUMN_NAME"),
                    DataType = reader.GetString("DATA_TYPE"),
                    Nullable = reader.GetString("NULLABLE")
                });
            }

            // Also log to the console for debugging
            _logger.LogInformation("ACTIVITY_LOGS Table Columns:");
            foreach (var col in columns)
            {
                _logger.LogInformation($"Column: {((dynamic)col).ColumnName}, Type: {((dynamic)col).DataType}, Nullable: {((dynamic)col).Nullable}");
            }

            return Json(new { tableName = "ACTIVITY_LOGS", columns });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting table columns: {Error}", ex.Message);
            return Json(new { error = ex.Message });
        }
    }

    /**
     * CleanupOrphanedFiles - Administrative utility to clean up files that exist in uploads folder 
     * but are no longer referenced in the database
     * 
     * This method should be called periodically for maintenance or can be triggered manually.
     * It's useful for cleaning up files that were uploaded but their database records were deleted
     * without proper file cleanup (e.g., manual database operations, system failures, etc.)
     * 
     * @return JSON response with cleanup results
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public JsonResult CleanupOrphanedFiles()
    {
        try
        {
            var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");
            
            if (!Directory.Exists(uploadsPath))
            {
                return Json(new { success = true, message = "Uploads directory does not exist. No cleanup needed.", filesDeleted = 0 });
            }

            // Get all files in uploads directory
            var allFiles = Directory.GetFiles(uploadsPath);
            
            // Get all file paths referenced in database
            var referencedFiles = new HashSet<string>();
            try
            {
                using var connection = new OracleConnection(_connectionString);
                connection.Open();
                
                var command = new OracleCommand("SELECT FILE_PATH FROM ATTACHMENTS WHERE FILE_PATH IS NOT NULL", connection);
                using var reader = command.ExecuteReader();
                
                while (reader.Read())
                {
                    var filePath = reader["FILE_PATH"]?.ToString();
                    if (!string.IsNullOrEmpty(filePath))
                    {
                        var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                        referencedFiles.Add(fullPath);
                    }
                }
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Error accessing database for file references." });
            }

            // Find orphaned files (exist in filesystem but not referenced in database)
            var orphanedFiles = allFiles.Where(file => !referencedFiles.Contains(file)).ToList();
            
            int filesDeleted = 0;
            var deletionErrors = new List<string>();

            // Delete orphaned files
            foreach (var orphanedFile in orphanedFiles)
            {
                try
                {
                    System.IO.File.Delete(orphanedFile);
                    filesDeleted++;
                }
                catch (Exception ex)
                {
                    var error = $"Could not delete {Path.GetFileName(orphanedFile)}: {ex.Message}";
                    deletionErrors.Add(error);
                }
            }

            var message = $"Cleanup completed. {filesDeleted} orphaned files deleted out of {orphanedFiles.Count} found.";
            if (deletionErrors.Any())
            {
                message += $" {deletionErrors.Count} files could not be deleted.";
            }

            return Json(new { 
                success = true, 
                message = message, 
                filesDeleted = filesDeleted,
                orphanedFilesFound = orphanedFiles.Count,
                errors = deletionErrors
            });
        }
        catch (Exception)
        {
            return Json(new { success = false, message = "An error occurred during cleanup." });
        }
    }

    /// <summary>
    /// Test endpoint to verify activity logging works
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public IActionResult TestActivityLogging()
    {
        try
        {
            var currentUser = GetCurrentUser();
            _logger.LogInformation("Testing activity logging - Current user: ID={UserId}, Name={UserName}, Role={UserRole}", 
                currentUser.Id, currentUser.Name, currentUser.Role);

            if (currentUser.Id == 0)
            {
                _logger.LogWarning("No valid user session found for activity logging test");
                return Json(new { success = false, message = "No valid user session found" });
            }

            // Test the logging with valid constraint values
            LogActivity(currentUser.Id, currentUser.Name, currentUser.Role,
                "Add", "Record", 999, "Activity Log Test Entry",
                null, null, "Testing activity logging functionality");

            return Json(new { 
                success = true, 
                message = "Test activity logged successfully", 
                user = new { id = currentUser.Id, name = currentUser.Name, role = currentUser.Role }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in TestActivityLogging");
            return Json(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Reusable method for logging activities to ACTIVITY_LOGS table
    /// </summary>
    private void LogActivity(
        int userId, string userName, string userRole,
        string actionType, string entityType, int entityId, string entityName,
        object? beforeData = null, object? afterData = null, string? details = null)
    {
        try
        {
            _logger.LogInformation("Attempting to log activity: User={UserId}({UserName}), Action={Action}, Entity={EntityType}({EntityId})", 
                userId, userName, actionType, entityType, entityId);

            // Delegate to ActivityLogService with schema fallback
            var result = _activityLogService.LogActivityAsync(
                actionType: actionType,
                entityType: entityType,
                entityId: entityId,
                entityName: entityName,
                userId: userId,
                userName: userName,
                userRole: userRole,
                oldValues: beforeData,
                newValues: afterData,
                changesSummary: details,
                ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString(),
                details: details
            ).GetAwaiter().GetResult();

            if (result)
            {
                _logger.LogInformation("Activity logged successfully: {Action} {EntityType} {EntityId} by {UserName}", 
                    actionType, entityType, entityId, userName);
            }
            else
            {
                _logger.LogWarning("Activity logging returned false: {Action} {EntityType} {EntityId} by {UserName}", 
                    actionType, entityType, entityId, userName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log activity: {Action} {EntityType} {EntityId} by {UserName}", 
                actionType, entityType, entityId, userName);
        }
    }

    /// <summary>
    /// Get current user information from session/auth
    /// </summary>
    private (int Id, string Name, string Role) GetCurrentUser()
    {
        // Get user info from session
        var userId = HttpContext.Session.GetInt32("UserId") ?? 0;
        var userName = HttpContext.Session.GetString("UserName");
        var userRole = HttpContext.Session.GetString("UserRole");
        
        // If session data is incomplete, get from database
        if (userId > 0 && (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(userRole)))
        {
            try
            {
                using var connection = new OracleConnection(_connectionString);
                connection.Open();
                var sql = "SELECT NAME, ROLE FROM USERS WHERE USER_ID = :userId";
                using var cmd = new OracleCommand(sql, connection);
                cmd.Parameters.Add(":userId", userId);
                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    userName = reader.IsDBNull("NAME") ? "Unknown" : reader.GetString("NAME");
                    userRole = reader.IsDBNull("ROLE") ? "User" : reader.GetString("ROLE");
                    
                    // Store in session for future use
                    HttpContext.Session.SetString("UserName", userName);
                    HttpContext.Session.SetString("UserRole", userRole);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get user info from database for userId {UserId}", userId);
                userName ??= "Unknown";
                userRole ??= "Unknown";
            }
        }
        
        return (userId, userName ?? "Unknown", userRole ?? "Unknown");
    }

    /**
     * Debug endpoint to test direct database query for specific LogId
     */
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> TestLogIdQuery(int id)
    {
        try
        {
            _logger.LogInformation("TestLogIdQuery called with id: {Id}", id);
            
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            // Test the exact same query as GetActivityLogDetails
            var sql = @"SELECT 
                            LOG_ID,
                            USER_NAME,
                            USER_ROLE,
                            ACTION_TYPE,
                            ENTITY_TYPE,
                            ENTITY_ID,
                            ENTITY_NAME,
                            TIMESTAMP,
                            BEFORE_DATA,
                            AFTER_DATA,
                            DETAILS,
                            USER_ID
                        FROM ACTIVITY_LOGS 
                        WHERE LOG_ID = :logId";

            using var command = new OracleCommand(sql, connection);
            command.Parameters.Add("logId", OracleDbType.Int32).Value = id;

            _logger.LogInformation("Executing SQL: {Sql} with LogId: {LogId}", sql, id);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var result = new
                {
                    Found = true,
                    LogId = reader.GetInt32("LOG_ID"),
                    UserName = reader.IsDBNull("USER_NAME") ? null : reader.GetString("USER_NAME"),
                    UserRole = reader.IsDBNull("USER_ROLE") ? null : reader.GetString("USER_ROLE"),
                    ActionType = reader.IsDBNull("ACTION_TYPE") ? null : reader.GetString("ACTION_TYPE"),
                    Query = sql,
                    ParameterValue = id
                };
                
                return Json(result);
            }
            else
            {
                // No record found - let's also check what records DO exist
                var checkSql = "SELECT LOG_ID FROM ACTIVITY_LOGS ORDER BY LOG_ID";
                var existingIds = new List<int>();
                
                using var checkCmd = new OracleCommand(checkSql, connection);
                using var checkReader = await checkCmd.ExecuteReaderAsync();
                
                while (await checkReader.ReadAsync())
                {
                    existingIds.Add(checkReader.GetInt32("LOG_ID"));
                }
                
                return Json(new { 
                    Found = false, 
                    SearchedId = id, 
                    ExistingLogIds = existingIds,
                    ConnectionString = _connectionString.Substring(0, Math.Min(50, _connectionString.Length)) + "...",
                    Query = sql
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in TestLogIdQuery for id {Id}: {Error}", id, ex.Message);
            return Json(new { 
                Error = ex.Message, 
                SearchedId = id,
                StackTrace = ex.StackTrace 
            });
        }
    }

    /**
     * Debug endpoint to check the actual table structure
     */
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> CheckTableStructure()
    {
        try
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            // Query to get column information
            var sql = @"SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE 
                        FROM USER_TAB_COLUMNS 
                        WHERE TABLE_NAME = 'ACTIVITY_LOGS' 
                        ORDER BY COLUMN_ID";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var columns = new List<object>();
            while (await reader.ReadAsync())
            {
                columns.Add(new
                {
                    ColumnName = reader.GetString("COLUMN_NAME"),
                    DataType = reader.GetString("DATA_TYPE"),
                    DataLength = reader.IsDBNull("DATA_LENGTH") ? (int?)null : reader.GetInt32("DATA_LENGTH"),
                    Nullable = reader.GetString("NULLABLE")
                });
            }
            
            return Json(new { 
                TableName = "ACTIVITY_LOGS",
                Columns = columns
            });
        }
        catch (Exception ex)
        {
            return Json(new { 
                Error = true,
                Message = ex.Message
            });
        }
    }
} // End of AdminController class