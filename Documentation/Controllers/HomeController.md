# HomeController Documentation

## 📝 Overview

The `HomeController` is the main public-facing controller that manages the homepage, document display, and basic user interactions. It serves as the primary entry point for users accessing the Rules & Regulations System and handles public document browsing functionality.

## 🎯 Key Responsibilities

- **Homepage Management**: Main landing page and navigation
- **Document Browsing**: Public access to regulation documents
- **Search & Filtering**: Document filtering and search functionality
- **Record Display**: Individual record details and modal views
- **Public Interface**: Non-authenticated user interactions
- **Contact Information**: Public contact data display

## 🔐 Security & Authorization

```csharp
[SecurePage] // Applied to authenticated pages only
[NoCache]    // Prevents caching of sensitive data
```

- **Mixed Access**: Both public and authenticated endpoints
- **Selective Security**: `SecurePage` filter on protected actions
- **No-Cache Policy**: Applied to authenticated content

## 🏗️ Architecture & Dependencies

### Constructor Dependencies
- `ILogger<HomeController>`: Logging and error tracking
- `IConfiguration`: Database connection configuration
- `OracleDbService`: Business logic and data operations

### Service Integration
- `DatabaseConnection`: Direct SQL query operations
- `OracleDbService`: Filtered record operations
- Connection String: Oracle database connectivity

## 📊 Core Methods Documentation

### Public Pages

#### `Index()` - GET
**Purpose**: Main landing page  
**Route**: `/` or `/Home/Index`  
**Access**: Public  
**Returns**: Homepage view  

**Features**:
- University branding display
- Public information access
- Language selection interface
> NOTE: Navigation by legacy 'sections' removed; filtering now relies on department, type, text search.

#### `Privacy()` - GET
**Purpose**: Privacy policy page  
**Route**: `/Home/Privacy`  
**Access**: Public  
**Returns**: Privacy policy view  

#### `LoginPage()` - GET
**Purpose**: Redirect to login interface  
**Route**: `/Home/LoginPage`  
**Access**: Public  
**Returns**: Account login view  

**Implementation**:
```csharp
public IActionResult LoginPage()
{
    return View("~/Views/Account/LoginPage.cshtml");
}
```

### Document Management

#### `homePage()` - GET
**Purpose**: Main document browsing interface  
**Route**: `/Home/homePage`  
**Access**: Authenticated users only  
**Security**: `[SecurePage]`, `[NoCache]`  

**Parameters**:
- `department`: Filter by department
- `documentTypes`: Filter by document type
- `alphabetical`: Alphabetical sorting
- `dateSort`: Date-based sorting
- `fromDate`: Date range start
- `toDate`: Date range end

> Removed: `sections` parameter (DB column & UI eliminated).

**Features**:
- Advanced filtering system
- Real-time search capabilities
- Pagination support
- Responsive document grid

#### `GetRecordDetails(int id)` - GET
**Purpose**: Retrieve individual record details  
**Route**: `/Home/GetRecordDetails/{id}`  
**Access**: Public  
**Returns**: Partial view with record data  

**Process Flow**:
1. Validate record ID
2. Fetch record from database
3. Handle not found scenarios
4. Return formatted partial view

**Error Handling**:
```csharp
if (record == null)
{
    Response.StatusCode = 404;
    return View("Error404");
}
```

### Data Services

#### `ShowData()` - GET
**Purpose**: Display contact information data  
**Route**: `/Home/ShowData`  
**Access**: Public  
**Returns**: Service view with contact data  

**Implementation**:
```csharp
string query = "SELECT * FROM CONTACT_INFORMATION";
var dataTable = await _db.ExecuteQueryAsync(query);
return View("~/Views/Service/ShowData.cshtml", dataTable);
```

### Error Handling

#### `Error()` - GET
**Purpose**: Global error page  
**Route**: `/Home/Error`  
**Access**: Public  
**Caching**: No cache policy applied  

**Features**:
- Request ID tracking
- Error context preservation
- User-friendly error display

## 🗄️ Database Operations

### Primary Data Sources
- **RECORDS**: Main regulation documents
- **CONTACT_INFORMATION**: Department contact details
- **DEPARTMENTS**: Department information
- **USER_HISTORY**: View tracking (for authenticated users)

### Query Operations

#### Filtered Records Query
```sql
SELECT r.*, d.DEPARTMENT_NAME
FROM RECORDS r
LEFT JOIN DEPARTMENTS d ON r.DEPARTMENT_ID = d.DEPARTMENT_ID
WHERE (@department IS NULL OR d.DEPARTMENT_NAME = @department)
  AND (@documentType IS NULL OR r.DOCUMENT_TYPE = @documentType)
ORDER BY r.CREATED_DATE DESC
```

#### Contact Information Query
```sql
SELECT ci.*, d.DEPARTMENT_NAME
FROM CONTACT_INFORMATION ci
LEFT JOIN DEPARTMENTS d ON ci.DEPARTMENT_ID = d.DEPARTMENT_ID
ORDER BY d.DEPARTMENT_NAME, ci.POSITION
```

## 🎨 View Integration

### Associated Views
- `Index.cshtml`: Homepage layout
- `Privacy.cshtml`: Privacy policy content
- `Error.cshtml`: Error display page
- `homePage.cshtml`: Main document browsing interface
- `_RecordDetails.cshtml`: Record detail partial view

### External Views
- `~/Views/Account/LoginPage.cshtml`: Login interface
- `~/Views/Service/ShowData.cshtml`: Contact data display

### JavaScript Integration
- `homepage.js`: Document filtering and search
- `recordModal.js`: Record detail modal functionality
- `languageToggle.js`: Language switching on public pages

## 🔍 Search & Filtering Features

### Filter Categories
1. **Department Filter**: Filter by university departments
2. **Section Filter**: Filter by document sections
3. **Document Type**: Policy, procedure, guideline, etc.
4. **Alphabetical Sort**: A-Z or Z-A ordering
5. **Date Sort**: Newest/oldest first
6. **Date Range**: Custom date range filtering

### Search Implementation
```csharp
var records = _oracleDbService.GetFilteredRecords(
    department, sections, documentTypes,
    alphabetical, dateSort, fromDate, toDate
);
```

## 🌐 Internationalization Support

### Multilingual Features
- Arabic/English interface switching
- RTL/LTR layout adaptation
- Localized content display
- Cultural date formatting

### Language Integration
```csharp
// Culture-aware date formatting
var formattedDate = record.CreatedDate.ToString("dd/MM/yyyy", currentCulture);
```

## 🔒 Security Measures

### Access Control
- Public endpoints: No authentication required
- Protected endpoints: `SecurePage` filter applied
- Selective authorization based on functionality

### Data Protection
- No-cache headers for sensitive content
- SQL injection prevention
- XSS protection in views
- Secure error handling

### Input Validation
```csharp
// Date validation
if (DateTime.TryParse(fromDate, out var startDate) && 
    DateTime.TryParse(toDate, out var endDate))
{
    // Process date range
}
```

## 📈 Performance Optimization

### Caching Strategy
- Static content caching
- Database query optimization
- Efficient filtering algorithms

### Database Performance
- Indexed search queries
- Optimized JOIN operations
- Parameterized queries
- Connection pooling

## 🐛 Error Handling

### Error Categories
1. **Database Errors**: Connection failures, query errors
2. **Not Found**: Missing records or pages
3. **Validation Errors**: Invalid input parameters
4. **System Errors**: Unexpected exceptions

### Error Responses
```csharp
try
{
    var records = _oracleDbService.GetFilteredRecords(/* parameters */);
    return View(records);
}
catch (Exception)
{
    // Return empty list if there's an error
    return View(new List<dynamic>());
}
```

## 🧪 Testing Considerations

### Unit Tests
- Filter parameter validation
- Record retrieval operations
- Error handling scenarios
- View model binding

### Integration Tests
- Database connectivity
- Service integration
- View rendering
- Search functionality

### UI Tests
- Homepage navigation
- Document filtering
- Modal interactions
- Responsive design

## 📊 Analytics & Monitoring

### User Behavior Tracking
- Page view statistics
- Search term analysis
- Filter usage patterns
- Error frequency monitoring

### Performance Metrics
- Page load times
- Search response times
- Database query performance
- Cache hit rates

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: Mixed (Public/Protected)  
**Maintenance Priority**: High
