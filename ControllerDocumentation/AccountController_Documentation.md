# AccountController Documentation

## Overview

The `AccountController` is responsible for managing user authentication operations in the Rules and Regulations management system. It handles user login functionality with session management.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Dependencies](#dependencies)
3. [Authentication Features](#authentication-features)
4. [Action Methods](#action-methods)
5. [Session Management](#session-management)
6. [Security Features](#security-features)
7. [Error Handling](#error-handling)

## Controller Structure

### Class Definition

```csharp
public class AccountController : Controller
```

### Dependencies

- **ILogger<AccountController>**: For logging authentication operations
- **RRdbContext**: Entity Framework database context for user operations

### Constructor

```csharp
public AccountController(ILogger<AccountController> logger, RRdbContext dbContext)
```

Initializes logging and database context dependencies.

## Authentication Features

### 1. User Login

- **Form-based Authentication**: Standard username/password login
- **Session Management**: Creates user sessions upon successful login
- **Validation**: Validates credentials against database
- **Redirection**: Redirects authenticated users to homepage

### 2. Session Handling

- **User ID Storage**: Stores authenticated user ID in session
- **Session Security**: Manages user state across requests

## Action Methods

### Login Page Display

#### `LoginPage()` - GET

**Purpose**: Display the login form to users

**Route**: Default controller/action routing
**Returns**: Login page view
**View Path**: `~/Views/Account/LoginPage.cshtml`

```csharp
[HttpGet]
public IActionResult LoginPage()
```

**Features**:

- Renders login form
- No authentication required
- Clean form presentation

### Login Processing

#### `LoginPage()` - POST

**Purpose**: Process user login credentials and authenticate users

**Parameters**:

- `string Name`: Username for authentication
- `string password`: Password for authentication

**Process Flow**:

1. **Credential Validation**: Checks username and password against database
2. **User Lookup**: Searches for matching user in Users table
3. **Session Creation**: Creates session with User ID upon success
4. **Redirection**: Redirects to homepage on successful login
5. **Error Handling**: Returns login form with error message on failure

```csharp
[HttpPost]
public IActionResult LoginPage(string Name, string password)
```

**Authentication Logic**:

```csharp
var user = _dbContext.Users.FirstOrDefault(u => u.Name == Name && u.Password == password);

if (user != null)
{
    // Set user session
    HttpContext.Session.SetInt32("UserId", user.UserId);
    return RedirectToAction("HomePage", "Home");
}
```

**Success Flow**:

- User credentials validated
- Session established with `UserId`
- Redirect to `Home/HomePage`

**Failure Flow**:

- Invalid credentials detected
- Error message added to ModelState
- Login form redisplayed with error

### User Logout

#### `Logout()` - GET/POST

**Purpose**: Securely logout user and clear all authentication data

**Route**: Both GET and POST methods supported at `/Account/Logout`
**Returns**: Redirect to login page

**Process Flow**:

1. **Session Clearing**: Removes all session data including `UserId`
2. **Authentication Sign-out**: Clears cookie authentication
3. **Logging**: Records logout action with timestamp
4. **Redirection**: Redirects to login page

```csharp
[HttpPost, HttpGet]
public async Task<IActionResult> Logout()
```

**Logout Logic**:

```csharp
// Clear session data
HttpContext.Session.Clear();

// Sign out from cookie authentication
await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

// Redirect to login
return RedirectToAction("LoginPage", "Account");
```

**Security Features**:

- **Complete Session Clearing**: Removes all user session data
- **Cookie Authentication Logout**: Properly signs out authenticated user
- **Error Handling**: Graceful fallback even if logout process fails
- **Logging**: Records logout events for security auditing

**HTTP Methods**:

- **POST**: Recommended for logout buttons (more secure)
- **GET**: Supported for direct URL access convenience
- Error message added to ModelState
- Login form redisplayed with error

## Session Management

### Session Creation

- **Key**: "UserId"
- **Value**: Integer user ID from database
- **Storage**: Server-side session storage
- **Lifetime**: Session-based (browser session)

### Session Usage

```csharp
HttpContext.Session.SetInt32("UserId", user.UserId);
```

### Integration Points

- Used by other controllers to identify current user
- Required for saved records functionality
- Enables user-specific operations

## Security Features

### Authentication Security

- **Password Validation**: Direct database credential verification
- **Session Management**: Secure session token generation
- **User Identification**: Unique user ID storage

### Security Considerations

⚠️ **Note**: Current implementation uses plain text password comparison. Consider implementing:

- Password hashing (bcrypt, Argon2)
- Salt generation for passwords
- Account lockout mechanisms
- HTTPS enforcement
- CSRF protection for login forms

## Error Handling

### Login Failure Handling

```csharp
ModelState.AddModelError("", "Invalid username or password");
return View("~/Views/Account/LoginPage.cshtml");
```

### Error Types

- **Invalid Credentials**: Wrong username or password
- **Database Errors**: Connection or query failures
- **Session Errors**: Session creation failures

### User Feedback

- **Error Messages**: Clear feedback for invalid credentials
- **ModelState**: ASP.NET Core model validation integration
- **Form Persistence**: Maintains form state during errors

## Database Operations

### User Authentication Query

```csharp
var user = _dbContext.Users.FirstOrDefault(u => u.Name == Name && u.Password == password);
```

### Database Dependencies

- **Users Table**: Stores user credentials and information
- **Entity Framework**: ORM for database operations
- **LINQ Queries**: Type-safe database queries

## Integration Points

### Controllers Integration

- **HomeController**: Target for successful login redirects
- **SavedController**: Requires session for user identification
- **AdminController**: May require authentication checks

### Views Integration

- **LoginPage.cshtml**: Login form rendering
- **Layout Views**: May check authentication status
- **Shared Components**: Authentication-aware components

## Code Examples

### Complete Login Process

```csharp
[HttpPost]
public IActionResult LoginPage(string Name, string password)
{
    // Authenticate user
    var user = _dbContext.Users.FirstOrDefault(u => u.Name == Name && u.Password == password);

    if (user != null)
    {
        // Create session
        HttpContext.Session.SetInt32("UserId", user.UserId);

        // Redirect to secure area
        return RedirectToAction("HomePage", "Home");
    }

    // Handle login failure
    ModelState.AddModelError("", "Invalid username or password");
    return View("~/Views/Account/LoginPage.cshtml");
}
```

## Best Practices Implemented

1. **Dependency Injection**: Proper DI container usage
2. **Entity Framework**: ORM for database operations
3. **Session Management**: Secure user state management
4. **Error Handling**: User-friendly error messages
5. **MVC Pattern**: Proper separation of concerns
6. **Logging**: Authentication event logging

## Security Recommendations

### Immediate Improvements

1. **Password Hashing**: Implement secure password storage
2. **HTTPS**: Enforce SSL/TLS for authentication
3. **CSRF Protection**: Add anti-forgery tokens
4. **Input Validation**: Enhanced input sanitization

### Long-term Enhancements

1. **Multi-factor Authentication**: Add 2FA support
2. **Account Lockout**: Prevent brute force attacks
3. **Password Policies**: Enforce strong passwords
4. **Audit Logging**: Track authentication events

## Performance Considerations

1. **Database Queries**: Efficient user lookup operations
2. **Session Storage**: Optimal session data management
3. **Memory Usage**: Minimal controller memory footprint
4. **Response Time**: Fast authentication processing

## Maintenance Notes

### Regular Maintenance Tasks

1. **Security Audits**: Regular security reviews
2. **Performance Monitoring**: Track authentication performance
3. **Session Cleanup**: Monitor session storage usage
4. **Error Analysis**: Review authentication failures

### Configuration Requirements

- Entity Framework connection string
- Session storage configuration
- Authentication middleware setup

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the AccountController._
