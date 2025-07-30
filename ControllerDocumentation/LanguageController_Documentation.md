# LanguageController Documentation

## Overview

The `LanguageController` is responsible for managing internationalization and localization features in the Rules and Regulations management system. It handles language switching functionality, allowing users to change the application's display language dynamically through cookie-based culture management.

## Table of Contents

1. [Controller Structure](#controller-structure)
2. [Localization Features](#localization-features)
3. [Action Methods](#action-methods)
4. [Cookie Management](#cookie-management)
5. [Culture Handling](#culture-handling)
6. [Integration Points](#integration-points)
7. [Security Features](#security-features)
8. [Best Practices](#best-practices)

## Controller Structure

### Class Definition

```csharp
public class LanguageController : Controller
```

### Namespace

```csharp
namespace RulesRegulation.Controllers
```

### Dependencies

- **Microsoft.AspNetCore.Localization**: Localization framework
- **Microsoft.AspNetCore.Mvc**: MVC framework for controller functionality

### No Constructor Required

The controller uses built-in ASP.NET Core services without additional dependencies.

## Localization Features

### 1. Dynamic Language Switching

- **Runtime Language Change**: Users can switch languages without restarting the application
- **Cookie Persistence**: Language preference stored in browser cookies
- **Culture Management**: Proper culture and UI culture handling

### 2. Culture Support

- **Multiple Cultures**: Support for various language and regional settings
- **Culture Cookie**: Persistent culture preference storage
- **Culture Validation**: Proper culture format handling

### 3. URL Redirection

- **Return URL Support**: Redirects users back to their original page
- **Local Redirect**: Secure redirection within the application
- **Context Preservation**: Maintains user navigation context

## Action Methods

### Language Setting

#### `SetLanguage()` - POST

**Purpose**: Set user's preferred language and culture through cookie storage

**Parameters**:

- `string culture`: The culture code to set (e.g., "en-US", "ar-SA")
- `string returnUrl`: The URL to redirect back to after setting language

**Security**: Uses `[HttpPost]` to prevent CSRF attacks on language switching

**Process Flow**:

1. **Culture Processing**: Processes the provided culture string
2. **Cookie Creation**: Creates culture cookie using ASP.NET Core's standard format
3. **Cookie Storage**: Stores cookie with long-term expiration
4. **Redirection**: Safely redirects user back to original page

```csharp
[HttpPost]
public IActionResult SetLanguage(string culture, string returnUrl)
{
    Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
    );

    return LocalRedirect(returnUrl);
}
```

**Features**:

- **Standard Implementation**: Uses ASP.NET Core's built-in localization providers
- **Long-term Storage**: Cookie expires after 1 year
- **Security**: Local redirect prevents open redirect attacks
- **Culture Format**: Proper RequestCulture object creation

## Cookie Management

### Cookie Creation Process

```csharp
Response.Cookies.Append(
    CookieRequestCultureProvider.DefaultCookieName,
    CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
    new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
);
```

### Cookie Configuration

- **Cookie Name**: Uses `CookieRequestCultureProvider.DefaultCookieName`
- **Cookie Value**: Generated using `CookieRequestCultureProvider.MakeCookieValue()`
- **Expiration**: Set to 1 year from current UTC time
- **Format**: Standard ASP.NET Core culture cookie format

### Cookie Benefits

1. **Persistence**: Survives browser sessions and restarts
2. **Automatic Loading**: ASP.NET Core automatically reads culture from cookie
3. **Standard Format**: Compatible with ASP.NET Core localization middleware
4. **Cross-Request**: Available across all application requests

## Culture Handling

### RequestCulture Object

```csharp
new RequestCulture(culture)
```

**Purpose**: Creates properly formatted culture object for ASP.NET Core

### Culture Types Supported

- **Language Codes**: "en", "ar", "es", etc.
- **Language-Region Codes**: "en-US", "ar-SA", "es-ES", etc.
- **Neutral Cultures**: Language without specific region
- **Specific Cultures**: Language with specific regional settings

### Culture Examples

```csharp
// English (United States)
new RequestCulture("en-US")

// Arabic (Saudi Arabia)
new RequestCulture("ar-SA")

// Spanish (Spain)
new RequestCulture("es-ES")

// Generic English
new RequestCulture("en")
```

## Integration Points

### ASP.NET Core Localization

- **CookieRequestCultureProvider**: Standard culture cookie provider
- **RequestCulture**: Culture information container
- **Localization Middleware**: Automatic culture detection and application

### Application Integration

- **Resource Files**: Works with .resx resource files
- **View Localization**: Supports localized views and partial views
- **Data Annotation Localization**: Localizes validation messages

### Middleware Dependencies

The controller relies on ASP.NET Core localization middleware being configured:

```csharp
// In Program.cs or Startup.cs
app.UseRequestLocalization(options =>
{
    var supportedCultures = new[] { "en-US", "ar-SA" };
    options.SetDefaultCulture(supportedCultures[0])
           .AddSupportedCultures(supportedCultures)
           .AddSupportedUICultures(supportedCultures);
});
```

## Security Features

### CSRF Protection

- **POST Method**: Uses POST to prevent CSRF attacks through GET requests
- **Form Token**: Should be used with anti-forgery tokens in forms

### Open Redirect Prevention

```csharp
return LocalRedirect(returnUrl);
```

**Security Benefits**:

- **Local Redirect Only**: Prevents redirection to external malicious sites
- **URL Validation**: Validates return URL is within the application
- **Attack Prevention**: Blocks open redirect vulnerability exploitation

### Input Validation

- **Culture Validation**: ASP.NET Core validates culture format
- **Return URL Validation**: LocalRedirect validates URL format
- **Exception Handling**: Invalid cultures handled gracefully

## Best Practices

### Implementation Best Practices

1. **Standard Providers**: Uses ASP.NET Core's built-in localization providers
2. **Long-term Storage**: 1-year cookie expiration for user convenience
3. **Security**: POST method and local redirect for security
4. **Standard Naming**: Uses default cookie names for compatibility

### Localization Best Practices

1. **Culture Fallback**: Application should have fallback culture configuration
2. **Resource Organization**: Organize resource files by controller/view
3. **Validation Messages**: Localize all user-facing messages
4. **Date/Number Formatting**: Respect culture-specific formatting

## Usage Examples

### Language Switcher Form

```html
<form asp-controller="Language" asp-action="SetLanguage" method="post">
  <input type="hidden" name="returnUrl" value="@Context.Request.Path" />
  <select name="culture" onchange="this.form.submit()">
    <option value="en-US">English</option>
    <option value="ar-SA">العربية</option>
  </select>
</form>
```

### Programmatic Language Setting

```csharp
// In a view or another controller
var currentUrl = HttpContext.Request.Path;
// User would POST to /Language/SetLanguage with culture="ar-SA" and returnUrl=currentUrl
```

### Integration with Views

```html
<!-- In _Layout.cshtml or shared component -->
@using Microsoft.AspNetCore.Localization
@{
    var requestCulture = Context.Features.Get<IRequestCultureFeature>();
    var currentCulture = requestCulture?.RequestCulture.Culture.Name ?? "en-US";
}

<div class="language-switcher">
    <form asp-controller="Language" asp-action="SetLanguage" method="post">
        <input type="hidden" name="returnUrl" value="@Context.Request.Path" />
        <select name="culture" class="form-control" onchange="this.form.submit()">
            <option value="en-US" @(currentCulture == "en-US" ? "selected" : "")>English</option>
            <option value="ar-SA" @(currentCulture == "ar-SA" ? "selected" : "")>العربية</option>
        </select>
    </form>
</div>
```

## Configuration Requirements

### Localization Middleware Setup

```csharp
// In Program.cs (ASP.NET Core 6+)
var supportedCultures = new[] { "en-US", "ar-SA" };

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture("en-US");
    options.SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();
    options.SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();

    options.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider());
});

app.UseRequestLocalization();
```

### Resource File Structure

```
Resources/
├── Views.Home.Index.en-US.resx
├── Views.Home.Index.ar-SA.resx
├── Views.Shared._Layout.en-US.resx
└── Views.Shared._Layout.ar-SA.resx
```

## Error Handling

### Culture Validation Errors

- **Invalid Culture**: ASP.NET Core handles invalid culture codes gracefully
- **Fallback Behavior**: Falls back to default culture if invalid culture provided
- **Exception Handling**: Framework handles culture parsing exceptions

### Redirect Errors

- **Invalid Return URL**: LocalRedirect validates URL format
- **Missing Return URL**: Should provide fallback URL in implementation
- **Malformed URLs**: Framework handles URL validation

## Performance Considerations

1. **Cookie Size**: Culture cookies are small and efficient
2. **Processing Speed**: Minimal processing overhead for culture setting
3. **Memory Usage**: No significant memory impact
4. **Request Impact**: Culture determination happens early in request pipeline

## Maintenance Notes

### Regular Maintenance Tasks

1. **Culture Support Review**: Periodically review supported cultures
2. **Resource File Updates**: Keep localization resources current
3. **User Preference Analysis**: Monitor language usage patterns
4. **Performance Monitoring**: Track localization impact on performance

### Configuration Monitoring

- **Supported Cultures**: Ensure all used cultures are properly configured
- **Default Culture**: Verify appropriate default culture setting
- **Cookie Functionality**: Test cookie persistence across sessions
- **Middleware Order**: Ensure localization middleware is properly positioned

---

_This documentation is current as of the latest codebase update. Please update when making significant changes to the LanguageController._
