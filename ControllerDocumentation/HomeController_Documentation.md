# HomeController Documentation

## Overview

The `HomeController` is the main entry point controller for the Rules and Regulations management system. It handles the homepage functionality, record filtering, data display, and serves as the primary user interface for browsing and searching regulations.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Main Features](#main-features)
4. [Action Methods](#action-methods)
5. [Record Management](#record-management)
6. [Data Services](#data-services)
7. [Error Handling](#error-handling)
8. [Performance Features](#performance-features)

## Controller Structure

### Class Definition

```csharp
public class HomeController : Controller
```

### Dependencies

- **ILogger<HomeController>**: For logging operations and debugging
- **IConfiguration**: Configuration management for connection strings
- **OracleDbService**: Custom service for Oracle database operations
- **DatabaseConnection**: Direct database connection management

### Constructor

```csharp
public HomeController(ILogger<HomeController> logger, IConfiguration configuration, OracleDbService oracleDbService)
```

**Initialization Process**:

- Configures logging service
- Initializes Oracle database service
- Establishes database connection with error handling
- Validates connection string configuration

```csharp
_connectionString = configuration.GetConnectionString("OracleConnection")
    ?? throw new InvalidOperationException("Oracle connection string not found");
_db = new DatabaseConnection(_connectionString);
```

## Main Features

### 1. Homepage Navigation

- **Landing Page**: Main entry point for users
- **Privacy Page**: Privacy policy and terms display
- **Error Handling**: Comprehensive error page management

### 2. Record Browsing and Filtering

- **Advanced Filtering**: Multiple filter criteria support
- **Search Functionality**: Department, section, and document type filtering
- **Sorting Options**: Alphabetical and date-based sorting
- **Date Range**: From/to date filtering capabilities

### 3. Record Details

- **Detail Views**: Comprehensive record information display
- **Partial Views**: AJAX-loaded record details
- **Error Handling**: Graceful handling of missing records

### 4. Data Services

- **Contact Information**: Database-driven contact data display
- **Service Integration**: Oracle database service integration

## Action Methods

### Basic Navigation

#### `Index()` - GET

**Purpose**: Default landing page for the application

**Returns**: Main index view
**Features**:

- Application entry point
- No authentication required
- Standard MVC routing

```csharp
public IActionResult Index()
{
    return View();
}
```

#### `Privacy()` - GET

**Purpose**: Display privacy policy and terms of use

**Returns**: Privacy policy view
**Features**:

- Static content display
- Legal information presentation

```csharp
public IActionResult Privacy()
{
    return View();
}
```

### Error Management

#### `Error()` - GET

**Purpose**: Handle application errors with caching disabled

**Features**:

- **Response Caching**: Disabled for error pages
- **Request Tracking**: Includes trace identifier
- **Activity Monitoring**: Current activity ID tracking

```csharp
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
public IActionResult Error()
{
    return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
```

### Authentication Integration

#### `LoginPage()` - GET

**Purpose**: Redirect to account login page

**Returns**: Account login view
**Integration**: Links to AccountController functionality

```csharp
public IActionResult LoginPage()
{
    return View("~/Views/Account/LoginPage.cshtml");
}
```

### Main Homepage Functionality

#### `homePage()` - GET

**Purpose**: Main homepage with advanced filtering and record display

**Parameters**:

- `string? department`: Filter by department
- `string? sections`: Filter by sections
- `string? documentTypes`: Filter by document types
- `string? alphabetical`: Alphabetical sorting option
- `string? dateSort`: Date-based sorting
- `string? fromDate`: Start date for date range filtering
- `string? toDate`: End date for date range filtering

**Process Flow**:

1. **Parameter Processing**: Handles optional filter parameters
2. **Service Integration**: Uses OracleDbService for data retrieval
3. **Record Filtering**: Applies multiple filter criteria
4. **Error Handling**: Returns empty list on errors
5. **View Rendering**: Displays filtered results

```csharp
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
        return View(new List<dynamic>());
    }
}
```

**Filter Capabilities**:

- **Department Filtering**: Specific department records
- **Section Filtering**: Organizational section filtering
- **Document Type**: Different regulation document types
- **Alphabetical Sorting**: A-Z or Z-A sorting
- **Date Sorting**: Chronological or reverse chronological
- **Date Range**: Specific date period filtering

### Data Service Integration

#### `ShowData()` - GET

**Purpose**: Display contact information data from database

**Features**:

- **Asynchronous Processing**: Uses async/await pattern
- **Direct Database Access**: Raw SQL query execution
- **Service View**: Dedicated service view rendering

```csharp
public async Task<IActionResult> ShowData()
{
    string query = "SELECT * FROM CONTACT_INFORMATION";
    var dataTable = await _db.ExecuteQueryAsync(query);
    return View("~/Views/Service/ShowData.cshtml", dataTable);
}
```

**Database Integration**:

- Direct SQL query execution
- Contact information retrieval
- Service-specific view rendering

### Record Detail Management

#### `GetRecordDetails()` - GET

**Purpose**: Retrieve detailed information for specific records via AJAX

**Parameters**:

- `int id`: Record identifier

**Features**:

- **AJAX Support**: Designed for asynchronous requests
- **Partial Views**: Returns partial view for embedding
- **Error Handling**: HTTP status code management
- **Record Validation**: Checks for record existence

```csharp
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

        return PartialView("_RecordDetails", record);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
        Response.StatusCode = 500;
        return View("Error500");
    }
}
```

**Error Handling**:

- **404 Errors**: Record not found handling
- **500 Errors**: Server error management
- **Logging**: Detailed error logging with record ID
- **Status Codes**: Proper HTTP status code setting

## Record Management

### Filtering System

The homepage implements a comprehensive filtering system:

```csharp
var records = _oracleDbService.GetFilteredRecords(department, sections, documentTypes,
    alphabetical, dateSort, fromDate, toDate);
```

### Filter Types

1. **Department Filter**: Organizational department classification
2. **Section Filter**: Sub-department or section filtering
3. **Document Type Filter**: Regulation type categorization
4. **Alphabetical Sort**: Name-based sorting options
5. **Date Sort**: Chronological ordering
6. **Date Range**: Temporal filtering capabilities

### Data Integration

- **OracleDbService**: Primary data service integration
- **DatabaseConnection**: Direct database access when needed
- **Dynamic Records**: Flexible record structure handling

## Data Services

### Contact Information Service

```csharp
string query = "SELECT * FROM CONTACT_INFORMATION";
var dataTable = await _db.ExecuteQueryAsync(query);
```

### Database Services

- **Asynchronous Operations**: Non-blocking database calls
- **Raw SQL Support**: Direct SQL query execution
- **DataTable Results**: Structured data return formats

### Service Integration Points

- **OracleDbService**: Primary service layer
- **DatabaseConnection**: Low-level database access
- **Configuration**: Connection string management

## Error Handling

### Exception Types Handled

1. **Database Exceptions**: Connection and query failures
2. **Configuration Exceptions**: Missing connection strings
3. **Record Not Found**: 404 error handling
4. **General Exceptions**: Unexpected error management

### Error Response Strategy

```csharp
catch (Exception ex)
{
    _logger.LogError(ex, "Error loading records for homepage");
    return View(new List<dynamic>());
}
```

### HTTP Status Management

- **404 Responses**: Record not found scenarios
- **500 Responses**: Server error conditions
- **Error Views**: Dedicated error page rendering

### Logging Strategy

- **Detailed Logging**: Exception details with context
- **Record ID Tracking**: Specific record error identification
- **Error Context**: Operational context preservation

## Performance Features

### Asynchronous Operations

```csharp
public async Task<IActionResult> ShowData()
{
    var dataTable = await _db.ExecuteQueryAsync(query);
    return View("~/Views/Service/ShowData.cshtml", dataTable);
}
```

### Caching Strategy

```csharp
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
```

### Performance Optimizations

1. **Async Database Calls**: Non-blocking operations
2. **Partial Views**: Efficient AJAX content loading
3. **Error Caching**: Disabled caching for error responses
4. **Service Layer**: Optimized data access patterns

## Integration Points

### Controller Dependencies

- **AccountController**: Login page integration
- **ServiceController**: Data service coordination
- **ErrorController**: Error handling delegation

### Service Dependencies

- **OracleDbService**: Primary data service
- **DatabaseConnection**: Direct database access
- **Configuration Service**: Settings management

### View Integration

- **Index.cshtml**: Main landing page
- **homePage.cshtml**: Primary homepage with filtering
- **Privacy.cshtml**: Privacy policy display
- **\_RecordDetails.cshtml**: Partial view for record details
- **~/Views/Service/ShowData.cshtml**: Contact information display

## Code Examples

### Complete Filtering Implementation

```csharp
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
        return View(new List<dynamic>());
    }
}
```

### AJAX Record Details

```csharp
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
        return PartialView("_RecordDetails", record);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting record details for ID: {Id}", id);
        Response.StatusCode = 500;
        return View("Error500");
    }
}
```

## Best Practices Implemented

1. **Dependency Injection**: Proper DI container usage
2. **Async/Await**: Asynchronous database operations
3. **Exception Handling**: Comprehensive error management
4. **Logging**: Detailed operation logging
5. **HTTP Status Codes**: Proper status code management
6. **Partial Views**: Efficient AJAX content delivery
7. **Configuration Management**: Secure connection string handling
8. **Service Layer Pattern**: Clean architecture implementation

## Maintenance Notes

### Regular Maintenance Tasks

1. **Performance Monitoring**: Track filtering performance
2. **Error Analysis**: Review homepage error logs
3. **Database Optimization**: Monitor query performance
4. **Service Health**: Check OracleDbService status

### Configuration Requirements

- Oracle connection string in appsettings.json
- Logging configuration for detailed tracking
- Error page view configurations
- Service registration in DI container

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the HomeController._
