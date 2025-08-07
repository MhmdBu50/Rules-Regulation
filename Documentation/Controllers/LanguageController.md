# LanguageController Documentation

## 📝 Overview

The `LanguageController` manages internationalization and localization for the Rules & Regulations System. It handles language switching between Arabic and English, cultural settings, and maintains user language preferences through cookies.

## 🎯 Key Responsibilities

- **Language Switching**: Toggle between Arabic (ar-SA) and English (en-US)
- **Culture Management**: Set and maintain cultural preferences
- **Cookie Management**: Persist language preferences across sessions
- **RTL/LTR Support**: Enable right-to-left and left-to-right text rendering
- **User Experience**: Seamless language switching without data loss

## 🔐 Security & Validation

- **Local Redirect**: Uses `LocalRedirect` to prevent open redirect attacks
- **Cookie Security**: Secure cookie handling with appropriate expiration
- **Input Validation**: Culture parameter validation (implicit through framework)

## 🏗️ Architecture & Dependencies

### Framework Dependencies
- `Microsoft.AspNetCore.Localization`: Culture and localization services
- `CookieRequestCultureProvider`: Cookie-based culture storage
- `RequestCulture`: Culture representation and validation

### No Constructor Dependencies
- Lightweight controller with minimal dependencies
- Relies on built-in ASP.NET Core localization framework

## 📊 Core Methods Documentation

### Language Management

#### `SetLanguage(string culture, string returnUrl)` - POST
**Purpose**: Set user's preferred language and culture  
**Route**: `/Language/SetLanguage`  
**Method**: POST (prevents accidental language changes)  
**Parameters**:
- `culture`: Language/culture code (e.g., "ar-SA", "en-US")
- `returnUrl`: URL to redirect back to after language change

**Implementation**:
```csharp
[HttpPost]
public IActionResult SetLanguage(string culture, string returnUrl)
{
    // Set culture cookie
    Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
    );

    return LocalRedirect(returnUrl);
}
```

**Process Flow**:
1. Receive culture and return URL parameters
2. Create RequestCulture object with specified culture
3. Generate culture cookie value
4. Set cookie with 1-year expiration
5. Redirect user back to original page

## 🌐 Internationalization Features

### Supported Cultures
- **Arabic (ar-SA)**:
  - Right-to-left text direction
  - Arabic number formatting
  - Islamic calendar support
  - Arabic date/time formatting

- **English (en-US)**:
  - Left-to-right text direction
  - Western number formatting
  - Gregorian calendar
  - English date/time formatting

### Culture Configuration
```csharp
// Application startup configuration
services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "en-US", "ar-SA" };
    options.SetDefaultCulture(supportedCultures[0])
        .AddSupportedCultures(supportedCultures)
        .AddSupportedUICultures(supportedCultures);
});
```

## 🍪 Cookie Management

### Cookie Configuration
```csharp
new CookieOptions 
{ 
    Expires = DateTimeOffset.UtcNow.AddYears(1),
    HttpOnly = true,        // Recommended: Prevent XSS
    Secure = true,          // Recommended: HTTPS only
    SameSite = SameSiteMode.Lax  // Recommended: CSRF protection
}
```

### Cookie Structure
- **Name**: `.AspNetCore.Culture`
- **Value**: `c=CULTURE|uic=UI_CULTURE` format
- **Expiration**: 1 year from setting
- **Scope**: Application-wide

## 🎨 Frontend Integration

### Language Toggle Implementation
```html
<!-- Language toggle form -->
<form asp-controller="Language" asp-action="SetLanguage" method="post">
    <input type="hidden" name="returnUrl" value="@Context.Request.Path" />
    <select name="culture" onchange="this.form.submit()">
        <option value="en-US">English</option>
        <option value="ar-SA">العربية</option>
    </select>
</form>
```

### JavaScript Integration
```javascript
// Language toggle with AJAX
function switchLanguage(culture) {
    const form = new FormData();
    form.append('culture', culture);
    form.append('returnUrl', window.location.pathname);
    
    fetch('/Language/SetLanguage', {
        method: 'POST',
        body: form
    }).then(() => {
        window.location.reload();
    });
}
```

### CSS RTL Support
```css
/* RTL layout support */
html[dir="rtl"] {
    direction: rtl;
    text-align: right;
}

html[dir="rtl"] .navbar-nav {
    flex-direction: row-reverse;
}

html[dir="rtl"] .float-left {
    float: right !important;
}

html[dir="rtl"] .float-right {
    float: left !important;
}
```

## 🔒 Security Considerations

### Current Security Measures
- **LocalRedirect**: Prevents open redirect vulnerabilities
- **POST Method**: Prevents accidental language changes via GET
- **Framework Validation**: Built-in culture validation

### Recommended Enhancements
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult SetLanguage(string culture, string returnUrl)
{
    // Validate culture parameter
    var supportedCultures = new[] { "en-US", "ar-SA" };
    if (!supportedCultures.Contains(culture))
    {
        culture = "en-US"; // Default fallback
    }

    // Validate return URL
    if (!Url.IsLocalUrl(returnUrl))
    {
        returnUrl = "/"; // Safe fallback
    }

    // Enhanced cookie security
    Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions 
        { 
            Expires = DateTimeOffset.UtcNow.AddYears(1),
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax
        }
    );

    return LocalRedirect(returnUrl);
}
```

## 📱 User Experience Features

### Seamless Language Switching
- **State Preservation**: User remains on the same page
- **Form Data Retention**: No data loss during language switch
- **Visual Feedback**: Immediate UI language change
- **Persistent Preference**: Language choice remembered across sessions

### Responsive Design Integration
```html
<!-- Bootstrap RTL support -->
<link href="~/lib/bootstrap/dist/css/bootstrap.rtl.min.css" rel="stylesheet" 
      asp-append-version="true" asp-condition="@(ViewContext.HttpContext.Features.Get<IRequestCultureFeature>()?.RequestCulture.Culture.Name == "ar-SA")" />
```

## 🔧 Localization Implementation

### Resource Files
- `Views.Home.Index.en-US.resx`: English resources
- `Views.Home.Index.ar-SA.resx`: Arabic resources
- `Views.Shared._Layout.en-US.resx`: Layout English resources
- `Views.Shared._Layout.ar-SA.resx`: Layout Arabic resources

### View Localization
```html
@using Microsoft.AspNetCore.Mvc.Localization
@inject IViewLocalizer Localizer

<h1>@Localizer["Welcome"]</h1>
<p>@Localizer["PageDescription"]</p>
```

### Model Validation Localization
```csharp
[Display(Name = "UserName", ResourceType = typeof(Resources.Account))]
[Required(ErrorMessageResourceType = typeof(Resources.Validation), 
          ErrorMessageResourceName = "Required")]
public string UserName { get; set; }
```

## 📊 Analytics & Monitoring

### Language Usage Tracking
```csharp
// Add analytics in SetLanguage method
public IActionResult SetLanguage(string culture, string returnUrl)
{
    // Track language preference changes
    _analytics.TrackEvent("LanguageChanged", new { 
        FromCulture = Thread.CurrentThread.CurrentUICulture.Name,
        ToCulture = culture,
        UserAgent = Request.Headers["User-Agent"].ToString()
    });

    // Existing implementation...
}
```

### Key Metrics
- **Language Distribution**: Percentage of Arabic vs English users
- **Language Switch Frequency**: How often users change languages
- **Regional Preferences**: Geographic language patterns
- **Page Performance**: Load times for different languages

## 🧪 Testing Considerations

### Unit Tests
```csharp
[Test]
public void SetLanguage_ValidCulture_SetsCookie()
{
    // Arrange
    var controller = new LanguageController();
    var culture = "ar-SA";
    var returnUrl = "/Home/Index";

    // Act
    var result = controller.SetLanguage(culture, returnUrl);

    // Assert
    Assert.IsInstanceOf<LocalRedirectResult>(result);
    // Verify cookie was set
}

[Test]
public void SetLanguage_InvalidReturnUrl_UsesSafeRedirect()
{
    // Test open redirect protection
}
```

### Integration Tests
- Language switching end-to-end
- Cookie persistence across requests
- RTL/LTR layout changes
- Resource loading validation

## 🌍 Cultural Considerations

### Arabic Language Support
- **Text Direction**: Right-to-left reading
- **Number Systems**: Arabic-Indic numerals option
- **Calendar**: Hijri calendar support
- **Typography**: Arabic font rendering

### English Language Support
- **Text Direction**: Left-to-right reading
- **Number Systems**: Western Arabic numerals
- **Calendar**: Gregorian calendar
- **Typography**: Latin font rendering

## 🔄 Browser Compatibility

### Modern Browsers
- **Chrome/Edge**: Full RTL and font support
- **Firefox**: Excellent internationalization support
- **Safari**: Good RTL layout support

### Legacy Browser Considerations
- **IE 11**: Basic RTL support with CSS fallbacks
- **Older Mobile Browsers**: Progressive enhancement approach

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: Medium  
**Maintenance Priority**: Medium
