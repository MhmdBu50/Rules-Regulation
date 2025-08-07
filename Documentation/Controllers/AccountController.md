# AccountController Documentation

## 📝 Overview

The `AccountController` handles all user authentication, authorization, and account management functionality in the Rules & Regulations System.

## 🎯 Responsibilities

- User login/logout operations
- Session management
- Authentication state validation
- Security logging and monitoring
- User activity tracking

## 🔧 Methods Documentation

### `LoginPage()` - GET
**Purpose**: Displays the login page  
**Route**: `/Account/LoginPage`  
**Access**: Public  
**Returns**: Login view  

**Features**:
- Multilingual support (English/Arabic)
- Language toggle functionality
- University branding
- CSRF protection

### `LoginPage(string Name, string password)` - POST
**Purpose**: Processes user login credentials  
**Route**: `/Account/LoginPage`  
**Access**: Public  
**Parameters**:
- `Name` (string): Username
- `password` (string): User password

**Process Flow**:
1. Input validation
2. User credential verification
3. Session creation
4. Visit logging
5. Redirect to homepage

**Security Features**:
- Oracle exception handling
- Session management
- IP address logging
- Timestamp tracking

**Error Handling**:
```csharp
catch (Oracle.ManagedDataAccess.Client.OracleException)
{
    ModelState.AddModelError("", "A database error occurred. Please try again later.");
    return View("~/Views/Account/LoginPage.cshtml");
}
```

### `Logout()` - GET/POST
**Purpose**: Logs out the current user  
**Route**: `/Account/Logout`  
**Access**: Authenticated users  
**Supports**: Both GET and POST requests  

**Process**:
1. Clear user session
2. Sign out from cookie authentication
3. Clear authentication cookies
4. Redirect to login page

**Security Cleanup**:
- Session data removal
- Authentication cookie clearing
- Security context cleanup

### `CheckAuth()`
**Purpose**: Validates user authentication status  
**Access**: Internal use  
**Returns**: Boolean authentication state  

**Validation Logic**:
- Checks session existence
- Validates UserId in session
- Returns authentication status

## 🔒 Security Implementation

### Authentication Flow
1. **Credential Validation**: Username/password verification
2. **Session Creation**: Secure session establishment
3. **Cookie Authentication**: ASP.NET Core authentication
4. **Activity Logging**: Visit and activity tracking

### Security Measures
- **Input Validation**: Username/password requirements
- **Error Handling**: Generic error messages
- **Session Security**: Secure session management
- **Activity Logging**: User visit tracking

## 🛡️ Security Concerns & Recommendations

### ⚠️ Current Issues
1. **Password Storage**: Plain text password comparison
2. **Session Fixation**: No session ID regeneration
3. **CSRF Protection**: Missing anti-forgery tokens
4. **Rate Limiting**: No brute force protection

### 🔧 Recommended Improvements
1. **Password Hashing**: Implement BCrypt or Argon2
2. **Session Security**: Regenerate session IDs after login
3. **CSRF Tokens**: Add `[ValidateAntiForgeryToken]`
4. **Rate Limiting**: Implement login attempt limits

## 📊 Database Operations

### Tables Involved
- **Users**: User authentication data
- **Visits**: User visit logging

### Visit Logging
```csharp
_dbContext.Visits.Add(new Visit
{
    UserId = user.UserId,
    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
    VisitTimestamp = DateTime.UtcNow
});
```

## 🌐 Localization Support

- **Language Toggle**: Login page language switching
- **Multilingual UI**: English/Arabic support
- **RTL Support**: Right-to-left text rendering
- **Culture Management**: URL-based culture parameters

## 📱 Frontend Integration

### Associated Views
- `LoginPage.cshtml`: Main login interface
- `_Layout.cshtml`: Master layout integration

### JavaScript Files
- `loginLanguageToggle.js`: Language switching
- `languageSwitcher.js`: General language management

### CSS Files
- `LoginPage.css`: Login-specific styling
- `footer.css`: Footer styling integration

## 🚀 Usage Examples

### Login Process
```csharp
// POST request to /Account/LoginPage
// Form data: Name="username", password="userpassword"
// Success: Redirects to /Home/HomePage
// Failure: Returns with error message
```

### Logout Process
```csharp
// GET/POST request to /Account/Logout
// Clears session and authentication
// Redirects to /Account/LoginPage
```

## 🔍 Testing Considerations

### Unit Tests
- Credential validation logic
- Session management
- Error handling scenarios

### Security Tests
- SQL injection prevention
- CSRF attack prevention
- Session security validation

### Integration Tests
- Login/logout flow
- Database interaction
- View rendering

## 📈 Performance Notes

- **Database Queries**: Single query for user verification
- **Session Management**: Efficient session handling
- **Memory Usage**: Minimal memory footprint
- **Response Time**: Fast authentication processing

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Review Required**: High Priority
