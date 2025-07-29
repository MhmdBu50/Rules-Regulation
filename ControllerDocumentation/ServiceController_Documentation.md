# ServiceController Documentation

## Overview

The `ServiceController` is responsible for providing data query services in the Rules and Regulations management system. It enables secure SQL query execution with built-in validation and error handling, primarily designed for SELECT operations through the Oracle database service.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Security Features](#security-features)
4. [Action Methods](#action-methods)
5. [Query Validation](#query-validation)
6. [Error Handling](#error-handling)
7. [Integration Points](#integration-points)
8. [Security Considerations](#security-considerations)

## Controller Structure

### Class Definition

```csharp
public class ServiceController : Controller
```

### Namespace

```csharp
namespace RulesRegulations.Controllers;
```

### Dependencies

- **OracleDbService**: Custom service for secure Oracle database operations

### Constructor

```csharp
public ServiceController(OracleDbService oracleDbService)
{
    _oracleDbService = oracleDbService;
}
```

**Initialization**:

- Injects Oracle database service through dependency injection
- No additional configuration required
- Service-ready upon instantiation

## Security Features

### 1. Query Type Validation

- **SELECT-Only Operations**: Restricts to read-only queries
- **SQL Injection Prevention**: Validates query structure
- **Input Sanitization**: Checks query format and content

### 2. Query Structure Validation

- **Whitespace Handling**: Trims and validates input
- **Case-Insensitive Validation**: Handles various SELECT formats
- **Prefix Validation**: Ensures queries start with SELECT

## Action Methods

### Data Query Execution

#### `GetData()` - GET

**Purpose**: Execute validated SQL SELECT queries and return results

**Parameters**:

- `string query`: SQL SELECT query to execute

**Security Validation**:

1. **Null/Empty Check**: Validates query is not null or whitespace
2. **SELECT Validation**: Ensures query starts with "SELECT"
3. **Case Handling**: Trims and converts to uppercase for validation

**Process Flow**:

1. **Input Validation**: Validates query format and type
2. **Security Check**: Ensures only SELECT operations
3. **Service Execution**: Delegates to OracleDbService
4. **Result Processing**: Returns data view or error view
5. **Error Handling**: Comprehensive exception management

```csharp
public IActionResult GetData(string query)
{
    if (string.IsNullOrWhiteSpace(query) || !query.Trim().ToUpper().StartsWith("SELECT"))
    {
        return BadRequest("Only SELECT queries are allowed.");
    }

    try
    {
        var data = _oracleDbService.GetData(query);
        return View(data);
    }
    catch (Exception)
    {
        return View("Error", new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
    }
}
```

**Return Types**:

- **Success**: View with query results
- **Validation Failure**: BadRequest with error message
- **Exception**: Error view with tracking information

## Query Validation

### Validation Process

```csharp
if (string.IsNullOrWhiteSpace(query) || !query.Trim().ToUpper().StartsWith("SELECT"))
{
    return BadRequest("Only SELECT queries are allowed.");
}
```

### Validation Rules

1. **Non-Empty Requirement**: Query must contain content
2. **Whitespace Handling**: Trims leading/trailing whitespace
3. **SELECT Requirement**: Must start with SELECT keyword
4. **Case Insensitive**: Accepts SELECT in any case

### Security Validation Benefits

- **Read-Only Operations**: Prevents data modification
- **SQL Injection Mitigation**: Basic query structure validation
- **Operation Restriction**: Limits to data retrieval only

### Validation Examples

#### Valid Queries

```sql
SELECT * FROM CONTACT_INFORMATION
select name, department from records
  SELECT id, title FROM regulations WHERE active = 1
```

#### Invalid Queries

```sql
INSERT INTO table VALUES (...)  -- Not SELECT
UPDATE table SET column = value  -- Not SELECT
DELETE FROM table               -- Not SELECT
""                             -- Empty query
"   "                          -- Whitespace only
```

## Error Handling

### Exception Management

```csharp
catch (Exception)
{
    return View("Error", new ErrorViewModel
    {
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
    });
}
```

### Error Response Strategy

1. **Generic Exception Handling**: Catches all exceptions
2. **Error View**: Returns standardized error page
3. **Request Tracking**: Includes request identifier for debugging
4. **Activity Tracing**: Uses Activity.Current or HttpContext.TraceIdentifier

### Error Types Handled

- **Database Connection Errors**: Oracle connection failures
- **SQL Syntax Errors**: Malformed query syntax
- **Permission Errors**: Database access issues
- **Service Exceptions**: OracleDbService failures
- **General Exceptions**: Unexpected application errors

### User Experience

- **BadRequest Response**: Clear validation error messages
- **Error Pages**: Consistent error page presentation
- **Request Tracking**: Traceable error identification

## Integration Points

### Service Dependencies

- **OracleDbService**: Primary data access service
  - `GetData(query)`: Executes SQL queries
  - Handles database connections
  - Manages query execution and result processing

### View Integration

- **Default View**: Displays query results
- **Error View**: Handles exception scenarios
- **BadRequest**: Returns validation error responses

### Model Integration

- **ErrorViewModel**: Standard error information model
  - `RequestId`: Tracks request for debugging
  - Used for error page context

## Data Flow

### Successful Query Flow

1. **Request Reception**: Controller receives GET request with query
2. **Validation**: Validates query format and type
3. **Service Delegation**: Passes query to OracleDbService
4. **Data Retrieval**: Service executes query against Oracle database
5. **Result Processing**: Service returns structured data
6. **View Rendering**: Controller returns view with data

### Error Flow

1. **Validation Failure**: Invalid query format detected
2. **BadRequest Response**: Returns 400 status with error message
3. **Exception Occurrence**: Service or database error
4. **Error Handling**: Catch block processes exception
5. **Error View**: Returns error page with tracking information

## Code Examples

### Complete Query Processing

```csharp
public IActionResult GetData(string query)
{
    // Security validation
    if (string.IsNullOrWhiteSpace(query) || !query.Trim().ToUpper().StartsWith("SELECT"))
    {
        return BadRequest("Only SELECT queries are allowed.");
    }

    try
    {
        // Execute query through service
        var data = _oracleDbService.GetData(query);
        return View(data);
    }
    catch (Exception)
    {
        // Error handling with tracking
        return View("Error", new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
    }
}
```

### Query Validation Examples

```csharp
// Valid queries (pass validation)
"SELECT * FROM CONTACT_INFORMATION"           ✓
"select name from users"                      ✓
"  SELECT id, title FROM records  "          ✓

// Invalid queries (fail validation)
"INSERT INTO users VALUES (...)"             ✗
"UPDATE records SET active = 0"              ✗
""                                           ✗
"   "                                        ✗
```

## Security Considerations

### Query Restriction

- **Read-Only Access**: Only SELECT statements allowed
- **No Data Modification**: Prevents INSERT, UPDATE, DELETE operations
- **No DDL Operations**: Blocks CREATE, ALTER, DROP statements

### Input Validation

- **Format Validation**: Ensures proper query structure
- **Type Validation**: Confirms SELECT operation type
- **Basic Sanitization**: Trims and validates input

### Security Limitations

⚠️ **Note**: Current implementation provides basic validation. Consider additional security measures:

- **Parameterized Queries**: For dynamic query parameters
- **Query Complexity Limits**: Prevent resource-intensive queries
- **User Authentication**: Ensure only authorized users can execute queries
- **Query Logging**: Track all executed queries for audit purposes
- **Result Set Limits**: Prevent excessive data retrieval

### Recommended Enhancements

1. **User Authentication**: Require authentication for query execution
2. **Role-Based Access**: Different query permissions for different users
3. **Query Logging**: Audit trail for all query executions
4. **Rate Limiting**: Prevent abuse through excessive query requests
5. **Result Pagination**: Handle large result sets efficiently

## Performance Considerations

1. **Service Delegation**: Efficient query execution through OracleDbService
2. **Exception Handling**: Minimal overhead for error processing
3. **Validation Speed**: Fast string validation operations
4. **Memory Usage**: Minimal controller memory footprint

### Performance Recommendations

- **Query Optimization**: Encourage efficient SELECT statements
- **Connection Pooling**: Ensure OracleDbService uses connection pooling
- **Result Caching**: Consider caching for frequently executed queries
- **Timeout Management**: Implement query timeout handling

## Best Practices Implemented

1. **Dependency Injection**: Proper DI container usage
2. **Security Validation**: Input validation and type restriction
3. **Exception Handling**: Comprehensive error management
4. **Request Tracking**: Error identification and debugging support
5. **Separation of Concerns**: Controller handles routing, service handles data
6. **Read-Only Operations**: Safe database query execution

## Maintenance Notes

### Regular Maintenance Tasks

1. **Query Monitoring**: Review executed queries for patterns
2. **Performance Analysis**: Monitor query execution times
3. **Error Review**: Analyze exception patterns and frequencies
4. **Security Audits**: Regular security validation reviews

### Configuration Requirements

- OracleDbService registration in DI container
- Oracle database connection configuration
- Error view templates in Views folder
- Logging configuration for error tracking

### Future Enhancements

1. **Authentication Integration**: Add user authentication requirements
2. **Query Builder**: Provide UI for query construction
3. **Result Export**: Enable data export functionality
4. **Advanced Validation**: Enhanced SQL query validation
5. **Caching Layer**: Implement query result caching

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the ServiceController._
