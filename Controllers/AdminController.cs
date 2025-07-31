// Required using statements for MVC, Oracle database, file handling, and dependency injection
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
    public AdminController(ILogger<AdminController> logger, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
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
        // Check if TempData messages exist and log them for debugging
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
            // Get all records from the database using Oracle service
            var records = _oracleDbService.GetAllRecords();
            
            // Enhance records with additional information for the admin dashboard
            // This creates an anonymous object with all record data plus contact info and attachments
            var enhancedRecords = records.Select(record => new
            {
                // Basic record information
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
                // Additional enhanced information
                ContactInformation = _oracleDbService.GetContactsByDepartment(record.Department ?? ""),
                Attachments = _oracleDbService.GetAttachmentsByRecordId(int.Parse(record.Id))
            }).ToList();
            
            return View(enhancedRecords);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during record loading
            _logger.LogError(ex, "Error loading records for admin page");
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
public IActionResult AddNewContactInfo(string Department, string Name, string? Email, string? Mobile, string? Telephone)
{
    try
    {
        // Step 1: Validate required fields - Department and Name are mandatory
        if (string.IsNullOrWhiteSpace(Department) || string.IsNullOrWhiteSpace(Name))
        {
            TempData["ErrorMessage"] = "Department and Name are required fields.";
            return View();
        }

        // Step 2: Check if department already has maximum allowed contacts (5 per department)
        int contactCount = _oracleDbService.GetContactCountInDepartment(Department);
        if (contactCount >= 5)
        {
            TempData["ErrorMessage"] = $"Department '{Department}' already has {contactCount} contact(s). Maximum 5 allowed.";
            return View();
        }

        // Step 3: Attempt to insert contact information into database
        bool success = _oracleDbService.AddContactInfo(Department, Name, Email, Mobile, Telephone);

        if (success)
        {
            // Success: Set success message and redirect to clear form
            TempData["SuccessMessage"] = $"Contact information for '{Department}' was added successfully.";
            return RedirectToAction("AddNewContactInfo");
        }
        else
        {
            // Database operation failed: Log warning and show error message
            _logger.LogWarning("AddContactInfo returned false for Department={Department}, Name={Name}, Email={Email}, Mobile={Mobile}, Telephone={Telephone}", Department, Name, Email, Mobile, Telephone);
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
        _logger.LogError(ex, "Oracle DB error while adding contact info: {ErrorDetails}", errorDetails);
        TempData["ErrorMessage"] = errorDetails;
        return View();
    }
    catch (Exception ex)
    {
        // Handle any other unexpected errors
        _logger.LogError(ex, "Unexpected error while adding contact info: {Message}", ex.Message);
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
            _logger.LogInformation("Attempting to retrieve contact information");

            // First test the database connection to ensure it's working
            using (var conn = new OracleConnection(_connectionString))
            {
                conn.Open();
                _logger.LogInformation("Database connection successful");
            }

            // Retrieve all contacts from database using Oracle service
            var contacts = _oracleDbService.GetAllContacts();
            _logger.LogInformation($"Retrieved {contacts.Count} contacts successfully");
            return View(contacts);
        }
        catch (Exception ex)
        {
            // Log database errors and provide fallback mock data for testing
            _logger.LogError(ex, "Error retrieving contact information: {Message}", ex.Message);
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
        catch (Exception ex)
        {
            // Handle database or other errors during contact retrieval
            _logger.LogError(ex, "Error retrieving contact information for editing");
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
     * @param Email - Optional email address
     * @param Mobile - Optional mobile phone number
     * @param Telephone - Optional telephone number
     * 
     * @return View on error, RedirectToAction on success
     */
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult EditContactInfo(int id, string Department, string Name, string? Email, string? Mobile, string? Telephone)
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

            // Attempt to update contact information in database
            bool success = _oracleDbService.UpdateContact(id, Department, Name, Email, Mobile, Telephone);

            if (success)
            {
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
        catch (Exception ex)
        {
            // Handle any errors during update process
            _logger.LogError(ex, "Error updating contact information");
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
            // Attempt to delete contact from database
            bool success = _oracleDbService.DeleteContact(id);

            if (success)
            {
                // Deletion successful: set success message
                TempData["SuccessMessage"] = "Contact information has been deleted successfully!";
            }
            else
            {
                // Deletion failed: set error message
                TempData["ErrorMessage"] = "Failed to delete contact information. Please try again.";
            }
        }
        catch (Exception ex)
        {
            // Handle any errors during deletion process
            _logger.LogError(ex, "Error deleting contact information");
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

            // Success: set success message and redirect to form
            TempData["SuccessMessage"] = "Record saved successfully (without attachments).";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            // Handle any errors during simple record insertion
            _logger.LogError(ex, "Simple insert failed: {ErrorMessage}", ex.Message);
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
        System.Console.WriteLine("AddNewRecord hit");

        try
        {
            // Step 1: Setup file upload directory
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
                wordPath = "/uploads/" + wordFileName;
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
                pdfPath = "/uploads/" + pdfFileName;
            }

            // Debug logging for file upload tracking
            Console.WriteLine($"Word file saved: {wordPath ?? "null"}");
            Console.WriteLine($"PDF file saved: {pdfPath ?? "null"}");

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
                    RECORD_ID, USER_ID, REGULATION_NAME, DEPARTMENT, VERSION, VERSION_DATE,
                    APPROVING_ENTITY, APPROVAL_DATE, DESCRIPTION, DOCUMENT_TYPE,
                    SECTIONS, NOTES
                )
                VALUES (
                    RECORDS_SEQ.NEXTVAL, :UserId, :RegulationName, :Department, :Version, :VersionDate,
                    :ApprovingEntity, :ApprovalDate, :Description, :DocumentType,
                    :Sections, :Notes
                )
                RETURNING RECORD_ID INTO :NewRecordId;
            END;";

            // Prepare parameters for SQL execution with proper data types
            var parameters = new List<OracleParameter>
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

            // Output param for getting the new ID
            var outputIdParam = new OracleParameter("NewRecordId", OracleDbType.Int32)
            {
                Direction = ParameterDirection.Output
            };
            parameters.Add(outputIdParam);

            // Execute SQL insert with debug logging
            int newId = 0;
            try
            {
                Console.WriteLine($"About to execute SQL with UserId: {userId}, DocumentType: {documentType}");
                await _db.ExecuteNonQueryAsync(insertSql, parameters.ToArray());
                newId = ((OracleDecimal)outputIdParam.Value).ToInt32();
                Console.WriteLine("SQL executed successfully with new RECORD_ID: " + newId);
            }
            catch (Exception sqlEx)
            {
                Console.WriteLine($"SQL Error: {sqlEx.Message}");
                throw; // Re-throw to be caught by outer catch block
            }

            // Step 8: Insert file attachments (no silent failure - all errors are logged)
            Console.WriteLine($"Attempting to insert attachments for RECORD_ID = {newId}");
            Console.WriteLine($"WordPath = {wordPath}, HasWordAttachment = {model.WordAttachment != null}");
            Console.WriteLine($"PdfPath = {pdfPath}, HasPdfAttachment = {model.PdfAttachment != null}");

            if (newId > 0)
            {
                // Insert Word file attachment if present
                if (!string.IsNullOrEmpty(wordPath) && model.WordAttachment != null)
                {
                    try
                    {
                        Console.WriteLine("Preparing to insert Word attachment...");

                        // SQL to insert Word attachment metadata
                        var insertWordSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) " +
                                            "VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME)";

                        // Execute attachment insert with proper parameters
                        await _db.ExecuteNonQueryAsync(insertWordSql,
                            new OracleParameter("id", newId),
                            new OracleParameter("fileType", "DOCX"),
                            new OracleParameter("path", wordPath),
                            new OracleParameter("ORIGINAL_NAME", model.WordAttachment.FileName));

                        Console.WriteLine("Word attachment inserted successfully.");
                    }
                    catch (Exception ex)
                    {
                        // Log detailed error information for Word attachment insertion
                        Console.WriteLine($"Error inserting Word attachment: {ex.Message}");
                        Console.WriteLine($"Details — ID: {newId}, Path: {wordPath}, FileName: {model.WordAttachment?.FileName ?? "null"}");
                        throw; // Re-throw to be handled by outer catch
                    }
                }

                // Insert PDF file attachment if present
                if (!string.IsNullOrEmpty(pdfPath) && model.PdfAttachment != null)
                {
                    try
                    {
                        Console.WriteLine("Preparing to insert PDF attachment...");

                        // SQL to insert PDF attachment metadata
                        var insertPdfSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME) " +
                                        "VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME)";

                        // Execute attachment insert with proper parameters
                        await _db.ExecuteNonQueryAsync(insertPdfSql,
                            new OracleParameter("id", newId),
                            new OracleParameter("fileType", "PDF"),
                            new OracleParameter("path", pdfPath),
                            new OracleParameter("ORIGINAL_NAME", model.PdfAttachment.FileName));

                        Console.WriteLine("PDF attachment inserted successfully.");
                    }
                    catch (Exception ex)
                    {
                        // Log detailed error information for PDF attachment insertion
                        Console.WriteLine($"Error inserting PDF: {ex.Message}");
                        Console.WriteLine($"Details — ID: {newId}, Path: {pdfPath}, FileName: {model.PdfAttachment?.FileName ?? "null"}");
                        throw; // Re-throw to be handled by outer catch
                    }
                }
                else
                {
                    Console.WriteLine("No PDF attachment to insert.");
                }
            }
            else
            {
                Console.WriteLine("No attachments inserted due to missing RECORD_ID.");
            }

            // Step 10: Success - Set success message and redirect
            TempData["SuccessMessage"] = "Record and attachments saved.";
            return RedirectToAction("AddNewRecord");
        }
        catch (Exception ex)
        {
            // Handle any errors during the entire record creation process
            _logger.LogError(ex, "Insert failed: {ErrorMessage}", ex.Message);

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
        catch (Exception ex)
        {
            // Handle errors during record retrieval
            _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
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
            // Attempt to update record using Oracle service
            bool success = _oracleDbService.UpdateRecord(
                recordId, regulationName, department, version, versionDate,
                approvalDate, approvingEntity, description, documentType, sections, notes);

            if (success)
            {
                // Update successful: set success message
                TempData["SuccessMessage"] = $"Record #{recordId} has been updated successfully!";
            }
            else
            {
                // Update failed: set error message
                TempData["ErrorMessage"] = "Failed to update record. Please try again.";
            }
        }
        catch (Exception ex)
        {
            // Handle any errors during update process
            _logger.LogError(ex, "Error updating record");
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
            // Attempt to delete record (cascades to remove attachments)
            bool success = _oracleDbService.DeleteRecord(recordId);

            if (success)
            {
                // Deletion successful: set success message
                TempData["SuccessMessage"] = "Record deleted successfully!";
            }
            else
            {
                // Deletion failed: set error message
                TempData["ErrorMessage"] = "Failed to delete record. Please try again.";
            }
        }
        catch (Exception ex)
        {
            // Handle any errors during deletion process
            _logger.LogError(ex, "Error deleting record");
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

            // Attempt to delete each record individually
            foreach (int recordId in recordIds)
            {
                bool success = _oracleDbService.DeleteRecord(recordId);
                if (success)
                {
                    successCount++;
                }
            }

            // Provide detailed feedback based on results
            if (successCount == totalCount)
            {
                // All deletions successful
                TempData["SuccessMessage"] = $"Successfully deleted {successCount} record(s)!";
            }
            else if (successCount > 0)
            {
                // Partial success: some deletions failed
                TempData["SuccessMessage"] = $"Successfully deleted {successCount} out of {totalCount} record(s).";
                TempData["ErrorMessage"] = $"Failed to delete {totalCount - successCount} record(s).";
            }
            else
            {
                // All deletions failed
                TempData["ErrorMessage"] = "Failed to delete any records. Please try again.";
            }
        }
        catch (Exception ex)
        {
            // Handle any errors during bulk deletion process
            _logger.LogError(ex, "Error deleting multiple records");
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
            // Log the update attempt for debugging
            _logger.LogInformation($"UpdateAttachment called for recordId: {recordId}, fileType: {fileType}, fileName: {file?.FileName}");
            
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

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename to prevent conflicts
            var fileName = $"{recordId}_{fileType}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file to server asynchronously
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update database with new file information (stores original filename for user display)
            var relativePath = $"uploads/{fileName}";
            bool success = _oracleDbService.UpdateAttachment(recordId, fileType, relativePath, file.FileName);

            if (success)
            {
                // Success: return positive JSON response with original filename
                return Json(new { 
                    success = true, 
                    message = "File updated successfully.", 
                    fileName = file.FileName 
                });
            }
            else
            {
                // Database update failed: clean up uploaded file and return error
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                return Json(new { success = false, message = "Failed to update file in database." });
            }
        }
        catch (Exception ex)
        {
            // Handle any errors during file update process
            _logger.LogError(ex, "Error updating attachment for record {RecordId}", recordId);
            return Json(new { success = false, message = "An error occurred while updating the file." });
        }
    }

} // End of AdminController class