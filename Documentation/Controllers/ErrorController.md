# ErrorController Documentation

## 📝 Overview

The `ErrorController` handles all application errors, HTTP status codes, and exception management for the Rules & Regulations System. It provides user-friendly error pages and proper error logging while maintaining security by not exposing sensitive system information.

## 🎯 Key Responsibilities

- **Error Page Management**: Handle various HTTP status codes
- **Exception Processing**: Process and categorize application exceptions
- **User Experience**: Provide informative, user-friendly error messages
- **Security**: Prevent sensitive information disclosure in errors
- **Logging**: Track errors for monitoring and debugging

## 🔐 Security & Error Handling

- **Information Hiding**: Generic error messages prevent information disclosure
- **Exception Filtering**: Specific exception types get appropriate handling
- **Request Tracking**: Maintains request IDs for debugging
- **Logging**: Secure error logging without exposing sensitive data

## 🏗️ Architecture & Dependencies

### Constructor Dependencies
- `ILogger<ErrorController>`: Error logging and debugging

### Framework Integration
- `IStatusCodeReExecuteFeature`: HTTP status code context
- `IExceptionHandlerFeature`: Exception details and context
- `Activity.Current`: Request tracing and identification

## 📊 Core Methods Documentation

### Status Code Handling

#### `HandleStatusCode(int statusCode)` - GET
**Purpose**: Handle specific HTTP status codes with custom error pages  
**Route**: `/Error/{statusCode}`  
**Parameters**: `statusCode` - HTTP status code to handle  
**Returns**: Appropriate error view  

**Supported Status Codes**:

##### 404 - Not Found
```csharp
case 404:
    ViewData["ErrorMessage"] = "The page or resource you requested could not be found.";
    ViewData["OriginalPath"] = statusCodeResult?.OriginalPath;
    return View("Error404");
```

- **Message**: User-friendly not found message
- **Context**: Original requested path for debugging
- **View**: Custom 404 error page

##### 500 - Internal Server Error
```csharp
case 500:
    ViewData["ErrorMessage"] = "An internal server error occurred.";
    return View("Error500");
```

- **Message**: Generic server error message
- **Security**: No technical details exposed
- **View**: Server error page with recovery options

##### 400 - Bad Request
```csharp
case 400:
    ViewData["ErrorMessage"] = "The request was invalid.";
    return View("Error400");
```

##### 403 - Forbidden
```csharp
case 403:
    ViewData["ErrorMessage"] = "Access to this resource is forbidden.";
    return View("Error403");
```

##### Default Handling
```csharp
default:
    ViewData["ErrorMessage"] = $"An error occurred (Status Code: {statusCode}).";
    ViewData["StatusCode"] = statusCode;
    return View("Error");
```

### Exception Handling

#### `Error()` - GET
**Purpose**: Handle unhandled application exceptions  
**Route**: `/Error`  
**Returns**: Generic error view with appropriate message  

**Exception Classification**:

##### Invalid Operation Exception
```csharp
if (exception is InvalidOperationException)
{
    ViewData["ErrorMessage"] = "A configuration or operation error occurred.";
}
```

##### Timeout Exception
```csharp
else if (exception is TimeoutException)
{
    ViewData["ErrorMessage"] = "The operation timed out. Please try again.";
}
```

##### Database Exceptions
```csharp
else if (exception.Message.Contains("Oracle") || exception.Message.Contains("database"))
{
    ViewData["ErrorMessage"] = "Database connection error. Please try again later.";
}
```

##### Generic Exception
```csharp
else
{
    ViewData["ErrorMessage"] = "An unexpected error occurred.";
}
```

#### `Error403()` - GET
**Purpose**: Handle forbidden access attempts  
**Route**: `/Error/Error403`  
**Returns**: Forbidden access error page  

## 🎨 View Integration

### Error Views
- `Error.cshtml`: Generic error display
- `Error400.cshtml`: Bad request error page
- `Error403.cshtml`: Forbidden access page
- `Error404.cshtml`: Not found error page  
- `Error500.cshtml`: Server error page

### View Data Structure
```csharp
ViewData["ErrorMessage"]  // User-friendly error message
ViewData["OriginalPath"]  // Original requested path (404 only)
ViewData["StatusCode"]    // HTTP status code
ViewData["RequestId"]     // Request identifier for tracking
```

### Error View Model
```csharp
public class ErrorViewModel
{
    public string? RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
```

## 🔒 Security Measures

### Information Security
- **Generic Messages**: No sensitive system information exposed
- **Exception Filtering**: Specific handling prevents information leakage
- **Request Tracking**: Secure request ID generation
- **Error Logging**: Separate detailed logging for developers

### Error Message Strategy
```csharp
// ✅ Good: Generic user message
ViewData["ErrorMessage"] = "Database connection error. Please try again later.";

// ❌ Bad: Exposes technical details
ViewData["ErrorMessage"] = exception.Message; // Could expose connection strings, paths
```

## 📝 Logging Strategy

### Error Logging Implementation
```csharp
// Recommended logging additions
private void LogError(Exception exception, int statusCode, string? path = null)
{
    _logger.LogError(exception, 
        "Error {StatusCode} occurred. Path: {Path}, RequestId: {RequestId}", 
        statusCode, path, Activity.Current?.Id);
}
```

### Log Levels
- **Error**: Actual application errors and exceptions
- **Warning**: 404 errors and user mistakes
- **Information**: Error page access for monitoring
- **Debug**: Detailed exception information (development only)

## 🔧 Configuration

### Error Handling Pipeline
```csharp
// In Program.cs
app.UseExceptionHandler("/Error");
app.UseStatusCodePagesWithReExecute("/Error/{0}");
```

### Development vs Production
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
```

## 📈 Error Monitoring

### Key Metrics
- **Error Frequency**: Track error occurrence rates
- **Status Code Distribution**: Monitor different error types
- **User Impact**: Track affected users and sessions
- **Recovery Rates**: Monitor user recovery from errors

### Monitoring Implementation
```csharp
public IActionResult HandleStatusCode(int statusCode)
{
    // Add metrics collection
    _logger.LogWarning("Status code {StatusCode} encountered for path {Path}", 
        statusCode, HttpContext.Request.Path);
    
    // Track error metrics
    // MetricsCollector.IncrementCounter($"http_errors_{statusCode}");
}
```

## 🧪 Testing Considerations

### Unit Tests
- Status code handling logic
- Exception classification
- View data population
- Request ID generation

### Integration Tests
- Error page rendering
- Status code redirects
- Exception handler pipeline
- View integration

### Error Scenarios
```csharp
[Test]
public void HandleStatusCode_404_ReturnsCorrectView()
{
    // Arrange
    var controller = new ErrorController(logger);
    
    // Act
    var result = controller.HandleStatusCode(404);
    
    // Assert
    Assert.IsInstanceOf<ViewResult>(result);
    Assert.AreEqual("Error404", ((ViewResult)result).ViewName);
}
```

## 🚨 Common Error Scenarios

### Database Connection Errors
- **Cause**: Oracle database unavailable
- **Response**: "Database connection error. Please try again later."
- **Action**: Automatic retry logic, fallback data sources

### Authentication Errors
- **Cause**: Session timeout, invalid credentials
- **Response**: Redirect to login with appropriate message
- **Action**: Clear session, prompt re-authentication

### File Not Found Errors
- **Cause**: Missing documents, invalid file paths
- **Response**: "The requested document could not be found."
- **Action**: Suggest alternative documents, report broken links

### Validation Errors
- **Cause**: Invalid form input, business rule violations
- **Response**: Specific field-level error messages
- **Action**: Return to form with correction guidance

## 📊 Error Recovery Strategies

### User Recovery Options
1. **Navigation Links**: Back to homepage, main sections
2. **Search Functionality**: Help users find content
3. **Contact Information**: Support contact details
4. **Retry Options**: For temporary errors

### Automatic Recovery
```csharp
// Circuit breaker pattern for database errors
if (exception.Message.Contains("database"))
{
    // Implement retry logic or fallback
    ViewData["RetryAfter"] = 30; // seconds
    ViewData["ShowRetry"] = true;
}
```

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: High  
**Maintenance Priority**: Critical
