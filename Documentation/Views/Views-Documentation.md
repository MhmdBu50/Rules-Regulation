# Views Documentation

## 📝 Overview

The Views in the Rules & Regulations System provide the user interface layer built with ASP.NET Core MVC Razor views. The system supports a responsive, multilingual interface with RTL/LTR support for Arabic and English languages.

## 🎯 View Architecture

### Layout System
- **Master Layout**: `_Layout.cshtml` - Main application layout
- **View Start**: `_ViewStart.cshtml` - Sets default layout
- **View Imports**: `_ViewImports.cshtml` - Global using statements and tag helpers

### Responsive Design
- **Bootstrap 5**: Primary CSS framework
- **Custom CSS**: University-specific styling
- **RTL Support**: Right-to-left layout for Arabic
- **Mobile-First**: Responsive design approach

## 🗂️ View Organization

### View Folders Structure
```
Views/
├── Account/           # Authentication views
├── Admin/            # Administrative interface
├── History/          # User activity views
├── Home/             # Public interface views
├── Reports/          # Reporting views
├── Service/          # Data service views
├── Shared/           # Shared components and layouts
├── _ViewImports.cshtml
└── _ViewStart.cshtml
```

## 🏠 Home Views

### Core Public Interface Views

#### `Index.cshtml` - Homepage
**Purpose**: Main landing page for the university rules system  
**Features**:
- University branding and identity
- Navigation to different sections
- Language selection interface
- Responsive hero section
- Quick access to popular documents

**Key Components**:
```html
@{
    ViewData["Title"] = "جامعة الإمام عبدالرحمن بن فيصل - اللوائح والأنظمة";
}

<div class="hero-section">
    <div class="university-logo">
        <img src="~/imgs/B&W IAU Logo (Horizontal).png" alt="جامعة الإمام عبدالرحمن بن فيصل" />
    </div>
    <h1 class="main-title">@Localizer["UniversityTitle"]</h1>
    <p class="subtitle">@Localizer["SystemDescription"]</p>
</div>
```

#### `homePage.cshtml` - Document Browser
**Purpose**: Main document browsing interface for authenticated users  
**Features**:
- Advanced filtering system
- Document grid display
- Pagination controls
- Search functionality
- Category filters

**Filter Components**:
```html
<div class="filter-section">
    <select id="departmentFilter" class="form-select">
        <option value="">@Localizer["AllDepartments"]</option>
        @foreach(var dept in ViewBag.Departments)
        {
            <option value="@dept.Value">@dept.Text</option>
        }
    </select>
</div>
```

#### `Privacy.cshtml` - Privacy Policy
**Purpose**: Privacy policy and data protection information  
**Features**:
- Legal compliance content
- Data usage policies
- Contact information for data protection

## 🔐 Account Views

### Authentication Interface

#### `LoginPage.cshtml` - User Authentication
**Purpose**: Primary login interface for system access  
**Features**:
- University-branded login form
- Language toggle functionality
- Remember me option
- Forgot password link
- Responsive design

**Login Form Structure**:
```html
<form asp-controller="Account" asp-action="Login" method="post" class="login-form">
    <div class="form-group">
        <label asp-for="Username">@Localizer["Username"]</label>
        <input asp-for="Username" class="form-control" />
        <span asp-validation-for="Username" class="text-danger"></span>
    </div>
    
    <div class="form-group">
        <label asp-for="Password">@Localizer["Password"]</label>
        <input asp-for="Password" type="password" class="form-control" />
        <span asp-validation-for="Password" class="text-danger"></span>
    </div>
    
    <button type="submit" class="btn btn-primary">@Localizer["Login"]</button>
</form>
```

**Language Toggle Integration**:
```html
<div class="language-toggle">
    <form asp-controller="Language" asp-action="SetLanguage" method="post">
        <input type="hidden" name="returnUrl" value="@Context.Request.Path" />
        <select name="culture" onchange="this.form.submit()" class="form-select">
            <option value="en-US" selected="@(currentCulture == "en-US")">English</option>
            <option value="ar-SA" selected="@(currentCulture == "ar-SA")">العربية</option>
        </select>
    </form>
</div>
```

## 👨‍💼 Admin Views

### Administrative Interface

#### `AdminPage.cshtml` - Administrative Dashboard
**Purpose**: Main administrative control panel  
**Features**:
- Dashboard statistics
- Quick action buttons
- Recent activity feed
- System status indicators
- Navigation to management functions

**Dashboard Components**:
```html
<div class="dashboard-stats">
    <div class="stat-card">
        <h3 id="totalRecords">@ViewBag.TotalRecords</h3>
        <p>@Localizer["TotalRecords"]</p>
    </div>
    <div class="stat-card">
        <h3 id="todayViews">@ViewBag.TodayViews</h3>
        <p>@Localizer["TodayViews"]</p>
    </div>
</div>
```

#### `AddNewRecord.cshtml` - Record Creation
**Purpose**: Form for adding new regulation records  
**Features**:
- Multi-step form wizard
- File upload handling
- Input validation
- Preview functionality
- Draft saving

**File Upload Section**:
```html
<div class="file-upload-section">
    <label asp-for="PdfFile">@Localizer["PDFDocument"]</label>
    <input asp-for="PdfFile" type="file" class="form-control" accept=".pdf" />
    <span asp-validation-for="PdfFile" class="text-danger"></span>
    
    <label asp-for="WordFile">@Localizer["WordDocument"]</label>
    <input asp-for="WordFile" type="file" class="form-control" accept=".doc,.docx" />
    <span asp-validation-for="WordFile" class="text-danger"></span>
</div>
```

#### `ManageContactInfo.cshtml` - Contact Management
**Purpose**: Manage department contact information  
**Features**:
- Contact list display
- Add/Edit/Delete operations
- Department filtering
- Contact validation

## 🔍 Service Views

#### `ShowData.cshtml` - Data Display
**Purpose**: Display query results and contact information  
**Features**:
- Dynamic table generation
- Export functionality
- Sorting capabilities
- Search within results

**Dynamic Table Generation**:
```html
<table class="table table-striped">
    <thead>
        <tr>
            @foreach (DataColumn column in Model.Columns)
            {
                <th>@column.ColumnName</th>
            }
        </tr>
    </thead>
    <tbody>
        @foreach (DataRow row in Model.Rows)
        {
            <tr>
                @foreach (var cell in row.ItemArray)
                {
                    <td>@cell</td>
                }
            </tr>
        }
    </tbody>
</table>
```

## 🔄 History Views

#### User Activity Tracking
**Purpose**: Display user activity and interaction history  
**Features**:
- Activity timeline
- Document access history
- Search history
- Usage statistics

## 📊 Reports Views

#### Analytical Reporting
**Purpose**: System reports and analytics display  
**Features**:
- Statistical charts
- Usage reports
- Export capabilities
- Date range filtering

## 🛠️ Shared Components

### Layout Components

#### `_Layout.cshtml` - Master Layout
**Purpose**: Main application layout template  
**Features**:
- Responsive navigation
- Footer integration
- Language support
- Meta tags and SEO

**Navigation Structure**:
```html
<nav class="navbar navbar-expand-lg">
    <div class="container">
        <a class="navbar-brand" href="@Url.Action("Index", "Home")">
            <img src="~/imgs/B&W IAU Logo (Horizontal).png" alt="جامعة الإمام عبدالرحمن بن فيصل" />
        </a>
        
        <div class="navbar-nav">
            <a class="nav-link" href="@Url.Action("homePage", "Home")">
                @Localizer["Documents"]
            </a>
            <a class="nav-link" href="@Url.Action("ShowData", "Home")">
                @Localizer["Contacts"]
            </a>
        </div>
    </div>
</nav>
```

**Footer Integration**:
```html
<footer class="site-footer">
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <h5>@Localizer["QuickLinks"]</h5>
                <ul class="footer-links">
                    <li><a href="@Url.Action("Index", "Home")">@Localizer["Home"]</a></li>
                    <li><a href="@Url.Action("Privacy", "Home")">@Localizer["Privacy"]</a></li>
                </ul>
            </div>
            <div class="col-md-4">
                <h5>@Localizer["ContactUs"]</h5>
                <p>@Localizer["UniversityAddress"]</p>
                <p>@Localizer["ContactPhone"]</p>
            </div>
            <div class="col-md-4">
                <h5>@Localizer["FollowUs"]</h5>
                <div class="social-links">
                    <a href="#" class="social-link">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="social-link">
                        <i class="fab fa-youtube"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</footer>
```

### Partial Views

#### `_RecordDetails.cshtml` - Record Detail Modal
**Purpose**: Display detailed record information in modal  
**Features**:
- Document preview
- Download links
- Metadata display
- Related documents

#### `_ValidationScriptsPartial.cshtml` - Validation Scripts
**Purpose**: Client-side validation script includes  
**Features**:
- jQuery validation
- Unobtrusive validation
- Custom validation rules

## 🎨 Styling & Theming

### CSS Architecture
- **Bootstrap 5**: Core framework
- **Custom Variables**: University branding colors
- **RTL Support**: Arabic language layout
- **Component Styles**: Modular CSS organization

### Theme Variables
```css
:root {
    --iau-primary: #1e3a8a;
    --iau-secondary: #dc2626;
    --iau-gold: #d97706;
    --iau-light: #f8fafc;
    --iau-dark: #1f2937;
}
```

### RTL Styling
```css
html[dir="rtl"] {
    direction: rtl;
    text-align: right;
}

html[dir="rtl"] .navbar-nav {
    margin-right: auto;
    margin-left: 0;
}

html[dir="rtl"] .float-start {
    float: right !important;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 1200px
- **Large Desktop**: > 1200px

### Mobile Optimizations
```css
@media (max-width: 576px) {
    .hero-section h1 {
        font-size: 1.5rem;
    }
    
    .filter-section {
        flex-direction: column;
    }
    
    .document-grid {
        grid-template-columns: 1fr;
    }
}
```

## 🌐 Internationalization Features

### Resource File Integration
```html
@using Microsoft.AspNetCore.Mvc.Localization
@inject IViewLocalizer Localizer

<h1>@Localizer["PageTitle"]</h1>
<p>@Localizer["PageDescription"]</p>
```

### Cultural Adaptations
- **Date Formats**: Culture-specific date display
- **Number Formats**: Localized number formatting
- **Currency**: Regional currency display
- **Text Direction**: RTL/LTR based on language

## 🔒 Security in Views

### Anti-Forgery Protection
```html
<form asp-controller="Admin" asp-action="AddRecord" method="post">
    @Html.AntiForgeryToken()
    <!-- Form fields -->
</form>
```

### XSS Prevention
```html
<!-- Safe: Razor automatically HTML encodes -->
<p>@Model.UserInput</p>

<!-- Unsafe: Raw HTML output -->
<p>@Html.Raw(Model.TrustedHtml)</p>
```

### Input Validation Display
```html
<div asp-validation-summary="All" class="text-danger"></div>
<span asp-validation-for="PropertyName" class="text-danger"></span>
```

## 📈 Performance Optimization

### Script and Style Optimization
```html
<!-- Bundled and minified in production -->
<link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" 
      asp-append-version="true" />
<script src="~/lib/jquery/dist/jquery.min.js" 
        asp-append-version="true"></script>
```

### Image Optimization
```html
<!-- Responsive images -->
<img src="~/images/hero-bg.jpg" 
     srcset="~/images/hero-bg-small.jpg 576w, 
             ~/images/hero-bg-medium.jpg 768w,
             ~/images/hero-bg-large.jpg 1200w"
     alt="@Localizer["HeroImageAlt"]" 
     class="img-fluid" />
```

### Lazy Loading
```html
<!-- Native lazy loading -->
<img src="~/images/document-thumb.jpg" 
     loading="lazy" 
     alt="@Localizer["DocumentThumbnail"]" />
```

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Component Count**: 15+ views across 7 categories  
**Maintenance Priority**: High
