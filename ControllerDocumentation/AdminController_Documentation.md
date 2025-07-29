# AdminController Documentation

## Overview
The `AdminController` is the main controller responsible for handling all administrative operations in the Rules and Regulations management system. It provides comprehensive functionality for managing records, attachments, and contact information with full CRUD (Create, Read, Update, Delete) operations.

## Table of Contents
1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Main Features](#main-features)
4. [Action Methods](#action-methods)
5. [File Management](#file-management)
6. [Error Handling](#error-handling)
7. [Security Features](#security-features)
8. [Database Operations](#database-operations)

## Controller Structure

### Class Definition
```csharp
public class AdminController : Controller
```

### Dependencies
- **ILogger<AdminController>**: For logging operations and debugging
- **OracleDbService**: Custom service for Oracle database operations
- **DatabaseConnection**: Database connection management
- **IWebHostEnvironment**: Web hosting environment for file operations
- **IConfiguration**: Configuration management for connection strings

### Constructor
```csharp
public AdminController(ILogger<AdminController> logger, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
```
Initializes all dependencies and establishes database connections.

## Main Features

### 1. Record Management
- **Create**: Add new rules and regulations records
- **Read**: View and display records with detailed information
- **Update**: Edit existing records and their properties
- **Delete**: Remove single or multiple records

### 2. Contact Information Management
- **Add**: Create new contact information for departments
- **View**: Display all contact information
- **Edit**: Update existing contact details
- **Delete**: Remove contact information

### 3. File Attachment Management
- **Upload**: Handle Word (.doc, .docx) and PDF file uploads
- **Update**: Replace existing attachments
- **Download**: Serve files for download
- **View**: Display PDF files inline in browser

## Action Methods

### Main Administrative Pages

#### `AdminPage()` - GET
**Purpose**: Main dashboard displaying all records with enhanced information

**Features**:
- Loads all records from database
- Enhances records with contact information and attachments
- Displays success/error messages from TempData
- Handles exceptions gracefully

**Returns**: View with enhanced records list

```csharp
public IActionResult AdminPage()
```

#### `AddNewRecord()` - GET
**Purpose**: Display form for creating new records

**Returns**: Empty form view for record creation

#### `AddNewRecord()` - POST
**Purpose**: Process new record creation with file attachments

**Parameters**:
- `AddNewRecordViewModel model`: Form data
- `IFormFile wordAttachment`: Word file attachment
- `IFormFile pdfAttachment`: PDF file attachment

**Process**:
1. Validates input data
2. Saves uploaded files to server
3. Inserts record into database
4. Associates attachments with record
5. Returns success/error feedback

### Contact Information Management

#### `AddNewContactInfo()` - GET/POST
**Purpose**: Add new contact information for departments

**Validation**:
- Department and Name are required
- Maximum 5 contacts per department
- Handles Oracle database exceptions

#### `ManageContactInfo()` - GET
**Purpose**: Display all contact information with management options

**Features**:
- Retrieves all contacts from database
- Provides mock data fallback for testing
- Comprehensive error handling

#### `EditContactInfo()` - GET/POST
**Purpose**: Edit existing contact information

**Features**:
- Loads contact by ID
- Validates required fields
- Updates contact information
- Provides user feedback

#### `DeleteContactInfo()` - POST
**Purpose**: Remove contact information

**Security**: CSRF protection with ValidateAntiForgeryToken

### Record Operations

#### `UpdateRecord()` - POST
**Purpose**: Update existing record information

**Parameters**:
- `int recordId`: Record identifier
- Various record fields (name, department, version, etc.)

**Security**: CSRF protection enabled

#### `DeleteRecord()` - POST
**Purpose**: Delete single record

**Features**:
- Cascades to remove associated attachments
- Provides user feedback
- Error handling

#### `DeleteMultipleRecords()` - POST
**Purpose**: Bulk delete multiple records

**Features**:
- Processes list of record IDs
- Tracks success/failure count
- Provides detailed feedback

### File Operations

#### `UpdateAttachment()` - POST
**Purpose**: Update file attachments for records

**Features**:
- File type validation (.doc, .docx, .pdf)
- Unique filename generation
- Database record updates
- Cleanup on failure

**Security**: CSRF protection

#### `DownloadPdf()` - GET
**Purpose**: Download PDF files

**Features**:
- Serves files with original filenames
- Proper MIME type handling
- File existence validation

#### `ViewPdf()` - GET
**Purpose**: Display PDF files inline in browser

**Features**:
- Inline content disposition
- UTF-8 filename encoding
- Browser PDF viewer integration

## File Management

### Upload Process
1. **Validation**: Check file types and extensions
2. **Storage**: Save files to `wwwroot/uploads` directory
3. **Database**: Store file metadata with original names
4. **Cleanup**: Remove files if database operations fail

### File Naming Convention
```
{recordId}_{fileType}_{GUID}{extension}
```
Example: `123_word_a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx`

### Supported File Types
- **Word Documents**: .doc, .docx
- **PDF Documents**: .pdf

## Error Handling

### Exception Types Handled
- **OracleException**: Database-specific errors
- **IOException**: File operation errors
- **General Exceptions**: Unexpected errors

### Error Response Strategy
1. **Logging**: All errors logged with detailed information
2. **User Feedback**: User-friendly error messages via TempData
3. **Graceful Degradation**: Mock data for testing when database unavailable
4. **Cleanup**: File cleanup on failed operations

### TempData Messages
- **SuccessMessage**: Green alerts for successful operations
- **ErrorMessage**: Red alerts for errors and failures

## Security Features

### CSRF Protection
All state-changing operations protected with `[ValidateAntiForgeryToken]`

### File Validation
- Extension validation
- File type verification
- Size limitations (implicit through IFormFile)

### Input Validation
- Required field validation
- Business rule enforcement (max contacts per department)
- SQL injection prevention through parameterized queries

## Database Operations

### Connection Management
- Connection string from configuration
- Automatic connection disposal
- Connection testing and validation

### Transaction Handling
- Atomic operations for record creation
- Rollback on failures
- Sequence management for IDs

### Query Types
- **Parameterized Queries**: Prevent SQL injection
- **Stored Procedures**: Through OracleDbService
- **Sequence Operations**: For auto-incrementing IDs

## Code Examples

### Creating a New Record
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> AddNewRecord(AddNewRecordViewModel model, IFormFile wordAttachment, IFormFile pdfAttachment)
{
    // File upload handling
    // Database insertion
    // Attachment processing
    // Error handling
}
```

### File Upload Validation
```csharp
var allowedExtensions = fileType.ToLower() == "word" 
    ? new[] { ".doc", ".docx" } 
    : new[] { ".pdf" };

var fileExtension = Path.GetExtension(file.FileName).ToLower();
if (!allowedExtensions.Contains(fileExtension))
{
    return Json(new { success = false, message = "Invalid file type" });
}
```

## Best Practices Implemented

1. **Dependency Injection**: Proper DI container usage
2. **Async/Await**: Asynchronous file operations
3. **Exception Handling**: Comprehensive error management
4. **Logging**: Detailed operation logging
5. **Validation**: Input and business rule validation
6. **Security**: CSRF protection and input sanitization
7. **Resource Management**: Proper disposal of resources
8. **User Experience**: Clear feedback and error messages

## Integration Points

### Services Used
- **OracleDbService**: Database operations
- **DatabaseConnection**: Raw database access
- **IWebHostEnvironment**: File system operations

### Views Rendered
- **AdminPage**: Main dashboard
- **AddNewRecord**: Record creation form
- **AddNewContactInfo**: Contact creation form
- **ManageContactInfo**: Contact management
- **EditContactInfo**: Contact editing form

## Performance Considerations

1. **Async Operations**: File uploads and database operations
2. **Connection Pooling**: Efficient database connection usage
3. **File Streaming**: Efficient file handling
4. **Memory Management**: Proper resource disposal
5. **Query Optimization**: Parameterized and optimized queries

## Maintenance Notes

### Regular Maintenance Tasks
1. **Log Review**: Monitor error logs for issues
2. **File Cleanup**: Periodic cleanup of orphaned files
3. **Database Monitoring**: Track performance and errors
4. **Security Updates**: Keep dependencies updated

### Configuration Requirements
- Oracle connection string in appsettings.json
- Proper file system permissions for uploads folder
- Adequate disk space for file uploads

---

*This documentation is current as of the latest codebase update. Please update when making significant changes to the AdminController.*
