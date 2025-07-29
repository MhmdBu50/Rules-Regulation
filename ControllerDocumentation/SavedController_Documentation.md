# SavedController Documentation

## Overview

The `SavedController` is an API controller responsible for managing user's saved records functionality in the Rules and Regulations management system. It provides endpoints for saving/unsaving records and retrieving user's saved record lists with session-based user authentication.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Authentication](#authentication)
4. [Action Methods](#action-methods)
5. [Database Operations](#database-operations)
6. [Session Management](#session-management)
7. [API Responses](#api-responses)
8. [Security Features](#security-features)

## Controller Structure

### Class Definition

```csharp
[ApiController]
[Route("Saved")]
public class SavedController : Controller
```

### Routing

- **Base Route**: `/Saved`
- **Controller Type**: API Controller with JSON responses
- **RESTful Design**: Follows REST conventions for saved records management

### Dependencies

- **RRdbContext**: Entity Framework database context for saved records operations

### Constructor

```csharp
public SavedController(RRdbContext context)
{
    _context = context;
}
```

## Authentication

### Session-Based Authentication

```csharp
int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
if (userId == 0) return Unauthorized();
```

**Authentication Flow**:

1. **Session Check**: Retrieves user ID from session
2. **User Validation**: Checks if user ID exists and is valid
3. **Unauthorized Response**: Returns 401 if no valid session
4. **Operation Continuation**: Proceeds with operation if authenticated

### Session Integration

- **Session Key**: "UserId"
- **Session Type**: Integer user identifier
- **Fallback Value**: 0 (indicates no authenticated user)
- **Security**: All operations require valid user session

## Action Methods

### Toggle Saved Status

#### `Toggle()` - POST

**Purpose**: Add or remove a record from user's saved list

**Route**: `POST /Saved/Toggle`
**Content-Type**: `application/json`

**Parameters**:

- `SaveRequest request`: JSON request body containing record ID

**Request Model**:

```csharp
public class SaveRequest
{
    public int RecordId { get; set; }
}
```

**Process Flow**:

1. **Authentication Check**: Validates user session
2. **Existing Record Check**: Searches for existing saved record
3. **Toggle Logic**: Removes if exists, adds if doesn't exist
4. **ID Generation**: Generates next sequential saved ID for new records
5. **Database Update**: Saves changes to database
6. **Response**: Returns toggle result

```csharp
[HttpPost("Toggle")]
public IActionResult Toggle([FromBody] SaveRequest request)
{
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
    if (userId == 0) return Unauthorized();

    var existing = _context.SavedRecords
        .FirstOrDefault(s => s.UserId == userId && s.RecordId == request.RecordId);

    if (existing != null)
    {
        _context.SavedRecords.Remove(existing);
        _context.SaveChanges();
        return Ok(new { removed = true });
    }

    int nextSavedId = (_context.SavedRecords
        .Where(s => s.UserId == userId)
        .Select(s => (int?)s.SavedId)
        .Max() ?? 0) + 1;

    var newRecord = new SavedRecord
    {
        SavedId = nextSavedId,
        UserId = userId,
        RecordId = request.RecordId,
        SavedTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
    };

    _context.SavedRecords.Add(newRecord);
    _context.SaveChanges();

    return Ok(new { removed = false });
}
```

**Response Types**:

- **Remove Operation**: `{ "removed": true }`
- **Add Operation**: `{ "removed": false }`
- **Unauthorized**: HTTP 401 status code

### Retrieve Saved Records

#### `ListIds()` - GET

**Purpose**: Get list of record IDs that user has saved

**Routes**:

- `GET /Saved/List`
- `GET /Saved/ListIds`

**Features**:

- **Multiple Routes**: Supports both `/List` and `/ListIds` endpoints
- **JSON Response**: Returns array of record IDs
- **User-Specific**: Only returns current user's saved records

```csharp
[HttpGet("List")]
[HttpGet("ListIds")]
public IActionResult ListIds()
{
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;

    var ids = _context.SavedRecords
        .Where(r => r.UserId == userId)
        .Select(r => r.RecordId)
        .ToList();

    return Ok(ids);
}
```

**Process Flow**:

1. **User Identification**: Gets user ID from session (no auth check)
2. **Query Execution**: Retrieves saved record IDs for user
3. **Data Projection**: Selects only RecordId values
4. **Response**: Returns JSON array of integers

**Response Format**: `[1, 5, 12, 23]` (array of record IDs)

## Database Operations

### SavedRecord Entity Structure

```csharp
var newRecord = new SavedRecord
{
    SavedId = nextSavedId,        // Sequential ID within user's saved records
    UserId = userId,              // User who saved the record
    RecordId = request.RecordId,  // ID of the saved regulation record
    SavedTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")  // When saved
};
```

### ID Generation Strategy

```csharp
int nextSavedId = (_context.SavedRecords
    .Where(s => s.UserId == userId)
    .Select(s => (int?)s.SavedId)
    .Max() ?? 0) + 1;
```

**ID Generation Process**:

1. **User-Scoped**: IDs are unique within each user's saved records
2. **Sequential**: Incremental ID generation starting from 1
3. **Null Handling**: Uses null-conditional operator and null coalescing
4. **Max Calculation**: Finds highest existing ID and adds 1

### Database Queries

#### Toggle Operation Queries

```csharp
// Check for existing saved record
var existing = _context.SavedRecords
    .FirstOrDefault(s => s.UserId == userId && s.RecordId == request.RecordId);

// Remove existing record
_context.SavedRecords.Remove(existing);

// Add new record
_context.SavedRecords.Add(newRecord);
```

#### List Operation Query

```csharp
var ids = _context.SavedRecords
    .Where(r => r.UserId == userId)
    .Select(r => r.RecordId)
    .ToList();
```

## Session Management

### Session Requirements

- **User Authentication**: Must have valid "UserId" in session
- **Session Persistence**: Maintains user state across requests
- **Authentication Integration**: Works with AccountController login system

### Session Usage Patterns

```csharp
// Standard authentication check
int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
if (userId == 0) return Unauthorized();

// Permissive check (no authentication required)
int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
// Continues with userId = 0 for anonymous users
```

### Session Dependencies

- **AccountController**: Sets "UserId" session value during login
- **Session Middleware**: Must be configured in application startup
- **Cookie/Session Storage**: Requires session storage configuration

## API Responses

### Success Responses

#### Toggle Response - Record Removed

```json
{
  "removed": true
}
```

#### Toggle Response - Record Added

```json
{
  "removed": false
}
```

#### List Response

```json
[1, 5, 12, 23, 45]
```

### Error Responses

#### Unauthorized Response

- **Status Code**: 401 Unauthorized
- **Body**: Empty or standard unauthorized message
- **Trigger**: No valid user session

### Content Types

- **Request**: `application/json` for POST operations
- **Response**: `application/json` for all responses
- **API Controller**: Automatic JSON serialization

## Security Features

### Authentication Security

- **Session-Based**: Uses server-side session storage
- **User Isolation**: Each user can only access their own saved records
- **Unauthorized Protection**: Blocks operations without valid session

### Data Security

- **User Scoping**: All queries filtered by UserId
- **Input Validation**: RecordId validation through model binding
- **SQL Injection Prevention**: Uses Entity Framework parameterized queries

### API Security

- **HTTP Methods**: Proper HTTP verb usage (POST for toggle, GET for list)
- **Route Protection**: API controller with proper routing
- **JSON Only**: Structured JSON request/response format

## Integration Points

### Controller Dependencies

- **AccountController**: Provides user authentication and session management
- **HomeController**: May consume saved record information for display
- **AdminController**: May reference saved records for administrative purposes

### Database Integration

- **SavedRecords Table**: Primary data storage
- **Users Table**: Referenced through UserId foreign key
- **Records Table**: Referenced through RecordId foreign key

### Frontend Integration

- **JavaScript AJAX**: Designed for AJAX API calls
- **UI Components**: Save/unsave buttons and saved record lists
- **Session Integration**: Requires authenticated user sessions

## Code Examples

### Complete Toggle Implementation

```csharp
[HttpPost("Toggle")]
public IActionResult Toggle([FromBody] SaveRequest request)
{
    // Authentication
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
    if (userId == 0) return Unauthorized();

    // Check existing
    var existing = _context.SavedRecords
        .FirstOrDefault(s => s.UserId == userId && s.RecordId == request.RecordId);

    if (existing != null)
    {
        // Remove existing
        _context.SavedRecords.Remove(existing);
        _context.SaveChanges();
        return Ok(new { removed = true });
    }

    // Add new
    int nextSavedId = (_context.SavedRecords
        .Where(s => s.UserId == userId)
        .Select(s => (int?)s.SavedId)
        .Max() ?? 0) + 1;

    var newRecord = new SavedRecord
    {
        SavedId = nextSavedId,
        UserId = userId,
        RecordId = request.RecordId,
        SavedTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
    };

    _context.SavedRecords.Add(newRecord);
    _context.SaveChanges();

    return Ok(new { removed = false });
}
```

### Frontend Integration Example

```javascript
// Toggle save status
async function toggleSave(recordId) {
  try {
    const response = await fetch("/Saved/Toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recordId: recordId }),
    });

    if (response.status === 401) {
      // Redirect to login
      window.location.href = "/Account/LoginPage";
      return;
    }

    const result = await response.json();
    updateSaveButton(recordId, result.removed);
  } catch (error) {
    console.error("Error toggling save:", error);
  }
}

// Get saved record IDs
async function getSavedIds() {
  try {
    const response = await fetch("/Saved/ListIds");
    const savedIds = await response.json();
    return savedIds;
  } catch (error) {
    console.error("Error getting saved IDs:", error);
    return [];
  }
}
```

## Best Practices Implemented

1. **RESTful API Design**: Proper HTTP methods and resource-based URLs
2. **Session Security**: User authentication for all operations
3. **Data Isolation**: User-scoped data access
4. **Entity Framework**: ORM for database operations
5. **JSON API**: Structured API responses
6. **Error Handling**: Appropriate HTTP status codes
7. **ID Generation**: Safe sequential ID creation

## Performance Considerations

1. **Efficient Queries**: Targeted database queries with proper filtering
2. **Minimal Data Transfer**: Returns only necessary data (IDs only)
3. **Session Efficiency**: Fast session-based authentication
4. **Database Indexing**: Should have indexes on UserId and RecordId
5. **Entity Framework**: Optimized ORM operations

## Maintenance Notes

### Regular Maintenance Tasks

1. **Session Monitoring**: Track session usage and expiration
2. **Database Cleanup**: Monitor saved records table size
3. **Performance Analysis**: Review query performance
4. **User Activity**: Analyze saved record usage patterns

### Configuration Requirements

- Entity Framework DbContext registration
- Session middleware configuration
- Database connection string
- SavedRecords table schema

### Future Enhancements

1. **Bulk Operations**: Save/unsave multiple records at once
2. **Saved Record Details**: Return full record information instead of just IDs
3. **Sorting Options**: Sort saved records by date, title, etc.
4. **Export Functionality**: Export saved records list
5. **Sharing Features**: Share saved record lists with other users

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the SavedController._
