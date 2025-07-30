# ErrorController Documentation

## Overview

The `ErrorController` is responsible for handling all application errors and HTTP status codes in the Rules and Regulations management system. It provides centralized error management with detailed logging, user-friendly error messages, and appropriate HTTP responses.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Error Handling Features](#error-handling-features)
4. [Action Methods](#action-methods)
5. [Status Code Management](#status-code-management)
6. [Exception Handling](#exception-handling)
7. [Logging Strategy](#logging-strategy)
8. [Error Views](#error-views)

## Controller Structure

### Class Definition

```csharp
public class ErrorController : Controller
```

### Dependencies

- **ILogger<ErrorController>**: For comprehensive error logging and debugging

### Constructor

```csharp
public ErrorController(ILogger<ErrorController> logger)
{
    _logger = logger;
}
```

## Error Handling Features

### 1. HTTP Status Code Handling

- **404 Not Found**: Page or resource not found errors
- **500 Internal Server Error**: Server-side application errors
- **400 Bad Request**: Invalid request handling
- **403 Forbidden**: Access denied scenarios
- **Generic Errors**: Fallback for other status codes

### 2. Exception Management

- **Unhandled Exceptions**: Global exception catching
- **Specific Exception Types**: Targeted handling for common exceptions
- **Database Errors**: Oracle/database-specific error handling
- **Configuration Errors**: Application configuration problems

### 3. User Experience

- **User-Friendly Messages**: Clear, non-technical error descriptions
- **Context Information**: Original path and error details when appropriate
- **Consistent UI**: Standardized error page layouts

## Action Methods

### HTTP Status Code Handler

#### `HandleStatusCode()` - GET

**Purpose**: Handle specific HTTP status codes with appropriate responses

**Route**: `[Route("Error/{statusCode:int}")]`
**Parameters**:

- `int statusCode`: The HTTP status code to handle

**Features**:

- **Context Extraction**: Retrieves original request information
- **Detailed Logging**: Logs status code with original path
- **Dynamic Messaging**: Status-specific error messages
- **View Selection**: Routes to appropriate error views

```csharp
[Route("Error/{statusCode:int}")]
public IActionResult HandleStatusCode(int statusCode)
{
    var statusCodeResult = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();

    _logger.LogWarning("Status code {StatusCode} occurred. Original path: {OriginalPath}",
        statusCode, statusCodeResult?.OriginalPath);

    switch (statusCode)
    {
        case 404:
            ViewData["ErrorMessage"] = "The page or resource you requested could not be found.";
            ViewData["OriginalPath"] = statusCodeResult?.OriginalPath;
            return View("Error404");

        case 500:
            ViewData["ErrorMessage"] = "An internal server error occurred.";
            return View("Error500");

        case 400:
            ViewData["ErrorMessage"] = "The request was invalid.";
            return View("Error400");

        case 403:
            ViewData["ErrorMessage"] = "Access to this resource is forbidden.";
            return View("Error403");

        default:
            ViewData["ErrorMessage"] = $"An error occurred (Status Code: {statusCode}).";
            ViewData["StatusCode"] = statusCode;
            return View("Error");
    }
}
```

**Status Code Handling**:

| Status Code | Message                                                  | View     | Additional Data |
| ----------- | -------------------------------------------------------- | -------- | --------------- |
| 404         | "The page or resource you requested could not be found." | Error404 | Original path   |
| 500         | "An internal server error occurred."                     | Error500 | -               |
| 400         | "The request was invalid."                               | Error400 | -               |
| 403         | "Access to this resource is forbidden."                  | Error403 | -               |
| Other       | "An error occurred (Status Code: {code})."               | Error    | Status code     |

### Global Exception Handler

#### `Error()` - GET

**Purpose**: Handle unhandled exceptions with detailed analysis

**Route**: `[Route("Error")]`

**Features**:

- **Exception Analysis**: Detailed exception type detection
- **Contextual Messages**: Exception-specific user messages
- **Comprehensive Logging**: Full exception details logging
- **Error Model**: Returns structured error information

```csharp
[Route("Error")]
public IActionResult Error()
{
    var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();

    if (exceptionFeature != null)
    {
        var exception = exceptionFeature.Error;
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        // Exception-specific handling
        if (exception is InvalidOperationException)
        {
            ViewData["ErrorMessage"] = "A configuration or operation error occurred.";
        }
        else if (exception is TimeoutException)
        {
            ViewData["ErrorMessage"] = "The operation timed out. Please try again.";
        }
        else if (exception.Message.Contains("Oracle") || exception.Message.Contains("database"))
        {
            ViewData["ErrorMessage"] = "Database connection error. Please try again later.";
        }
        else
        {
            ViewData["ErrorMessage"] = "An unexpected error occurred.";
        }
    }

    return View(new ErrorViewModel
    {
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
    });
}
```

**Exception Type Handling**:

- **InvalidOperationException**: Configuration/operation errors
- **TimeoutException**: Timeout-related failures
- **Database Exceptions**: Oracle/database connectivity issues
- **Generic Exceptions**: Fallback error handling

### Specific Error Views

#### `Error403()` - GET

**Purpose**: Handle forbidden access scenarios

**Features**:

- **Access Control**: Dedicated forbidden access handling
- **Clean UI**: Specific view for access denied scenarios

```csharp
public IActionResult Error403()
{
    return View();
}
```

## Status Code Management

### Supported Status Codes

1. **404 Not Found**

   - Missing pages or resources
   - Broken links
   - Invalid URLs
   - Includes original path information

2. **500 Internal Server Error**

   - Application exceptions
   - Server-side failures
   - Unhandled code errors

3. **400 Bad Request**

   - Invalid request format
   - Malformed data
   - Parameter validation failures

4. **403 Forbidden**

   - Access control violations
   - Permission denied
   - Authentication failures

5. **Generic Status Codes**
   - Fallback for other HTTP status codes
   - Includes status code in message
   - Generic error view

### Status Code Processing

```csharp
var statusCodeResult = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();
_logger.LogWarning("Status code {StatusCode} occurred. Original path: {OriginalPath}",
    statusCode, statusCodeResult?.OriginalPath);
```

## Exception Handling

### Exception Analysis Process

1. **Feature Extraction**: Get exception details from HTTP context
2. **Exception Type Detection**: Identify specific exception types
3. **Message Generation**: Create user-friendly error messages
4. **Logging**: Record detailed exception information
5. **View Selection**: Return appropriate error view

### Exception Categories

#### Configuration Exceptions

```csharp
if (exception is InvalidOperationException)
{
    ViewData["ErrorMessage"] = "A configuration or operation error occurred.";
}
```

#### Timeout Exceptions

```csharp
else if (exception is TimeoutException)
{
    ViewData["ErrorMessage"] = "The operation timed out. Please try again.";
}
```

#### Database Exceptions

```csharp
else if (exception.Message.Contains("Oracle") || exception.Message.Contains("database"))
{
    ViewData["ErrorMessage"] = "Database connection error. Please try again later.";
}
```

#### Generic Exceptions

```csharp
else
{
    ViewData["ErrorMessage"] = "An unexpected error occurred.";
}
```

## Logging Strategy

### Warning Level Logging

```csharp
_logger.LogWarning("Status code {StatusCode} occurred. Original path: {OriginalPath}",
    statusCode, statusCodeResult?.OriginalPath);
```

**Purpose**: Track HTTP status code occurrences with context

### Error Level Logging

```csharp
_logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
```

**Purpose**: Comprehensive exception logging with full details

### Logging Context

- **Status Codes**: HTTP status code values
- **Original Paths**: Request paths that caused errors
- **Exception Details**: Full exception information
- **Error Messages**: User-facing error descriptions

## Error Views

### View Structure

The controller supports multiple error views:

1. **Error404.cshtml**: 404 Not Found pages
2. **Error500.cshtml**: Internal server errors
3. **Error400.cshtml**: Bad request errors
4. **Error403.cshtml**: Forbidden access errors
5. **Error.cshtml**: Generic error fallback

### ViewData Integration

```csharp
ViewData["ErrorMessage"] = "User-friendly error message";
ViewData["OriginalPath"] = statusCodeResult?.OriginalPath;
ViewData["StatusCode"] = statusCode;
```

### Error Model

```csharp
return View(new ErrorViewModel
{
    RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
});
```

## Integration Points

### ASP.NET Core Features

- **IStatusCodeReExecuteFeature**: Status code context information
- **IExceptionHandlerFeature**: Exception details extraction
- **Activity.Current**: Request tracking and tracing

### Application Integration

- **Global Error Handling**: Configured in startup/program
- **Status Code Pages**: Middleware integration
- **Exception Middleware**: Unhandled exception processing

### Logging Integration

- **ILogger**: Dependency injection logging service
- **Structured Logging**: Parameterized log messages
- **Log Levels**: Warning and Error level categorization

## Code Examples

### Complete Status Code Handling

```csharp
[Route("Error/{statusCode:int}")]
public IActionResult HandleStatusCode(int statusCode)
{
    var statusCodeResult = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();

    _logger.LogWarning("Status code {StatusCode} occurred. Original path: {OriginalPath}",
        statusCode, statusCodeResult?.OriginalPath);

    switch (statusCode)
    {
        case 404:
            ViewData["ErrorMessage"] = "The page or resource you requested could not be found.";
            ViewData["OriginalPath"] = statusCodeResult?.OriginalPath;
            return View("Error404");

        // Additional cases...

        default:
            ViewData["ErrorMessage"] = $"An error occurred (Status Code: {statusCode}).";
            ViewData["StatusCode"] = statusCode;
            return View("Error");
    }
}
```

### Exception Type Detection

```csharp
if (exception is InvalidOperationException)
{
    ViewData["ErrorMessage"] = "A configuration or operation error occurred.";
}
else if (exception is TimeoutException)
{
    ViewData["ErrorMessage"] = "The operation timed out. Please try again.";
}
else if (exception.Message.Contains("Oracle") || exception.Message.Contains("database"))
{
    ViewData["ErrorMessage"] = "Database connection error. Please try again later.";
}
```

## Best Practices Implemented

1. **Centralized Error Handling**: Single point for all error management
2. **Structured Logging**: Consistent, searchable log messages
3. **User-Friendly Messaging**: Non-technical error descriptions
4. **Context Preservation**: Original request information tracking
5. **Exception Type Handling**: Specific handling for common exceptions
6. **HTTP Standards**: Proper status code usage
7. **Security**: No sensitive information exposure in error messages

## Security Considerations

### Information Disclosure Prevention

- **Generic Messages**: User-friendly, non-technical error descriptions
- **Exception Details**: Logged but not displayed to users
- **Stack Traces**: Not exposed in production error pages
- **Path Information**: Carefully controlled original path display

### Error Page Security

- **CSRF Protection**: Not applicable for error pages
- **Input Validation**: Not required for error display
- **Authentication**: Error pages accessible without authentication

## Performance Considerations

1. **Minimal Processing**: Fast error page generation
2. **Efficient Logging**: Structured, parameterized logging
3. **View Caching**: Standard view caching for error pages
4. **Memory Usage**: Minimal controller memory footprint

## Maintenance Notes

### Regular Maintenance Tasks

1. **Log Analysis**: Review error patterns and frequencies
2. **Error Page Testing**: Verify error page functionality
3. **Message Updates**: Keep error messages current and helpful
4. **Performance Monitoring**: Track error handling performance

### Configuration Requirements

- Logging configuration in appsettings.json
- Error page middleware configuration
- Status code pages middleware setup
- Exception handling middleware registration

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the ErrorController._
