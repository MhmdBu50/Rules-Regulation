# AdminController Documentation

## 📝 Overview

The `AdminController` is the core administrative controller that manages all administrative operations for the Rules & Regulations System. It provides comprehensive CRUD operations for records, contact management, file handling, and dashboard statistics.

## 🎯 Key Responsibilities

- **Record Management**: Create, read, update, delete regulation records
- **Contact Information Management**: Manage department contact information
- **File Operations**: Handle PDF and Word document uploads and attachments
- **Dashboard Analytics**: Provide statistical data and charts
- **User Interface**: Serve administrative views and pages

## 🔐 Security & Authorization

```csharp
[Authorize(Roles = "Admin")]
[SecurePage]
[NoCache]
```

- **Authorization**: Admin role required for all actions
- **Security**: Custom `SecurePage` filter applied
- **Caching**: No-cache policy for security

## 🏗️ Architecture & Dependencies

### Constructor Dependencies
- `ILogger<AdminController>`: Logging and debugging
- `IConfiguration`: Database connection configuration
- `IWebHostEnvironment`: File operations and path management
- `IMemoryCache`: Thumbnail and data caching

### Service Dependencies
- `OracleDbService`: Business logic database operations
- `DatabaseConnection`: Direct SQL operations
- Connection String: Oracle database connectivity

## 📊 Core Methods Documentation

### Dashboard & Statistics

#### `AdminPage()` - GET
**Purpose**: Main administrative dashboard  
**Route**: `/Admin/AdminPage`  
**Returns**: Admin dashboard view with statistics  

**Features**:
- User statistics overview
- Record management interface
- Quick access navigation

#### `GetDashboardStats()` - GET
**Purpose**: API endpoint for dashboard statistics  
**Route**: `/Admin/GetDashboardStats`  
**Returns**: JSON with dashboard data  

**Response Structure**:
```json
{
    "totalPolicies": 150,
    "mostViewedPolicy": {
        "name": "Student Guidelines",
        "views": 1245
    },
    "donutData": [
        { "documentType": "Policy", "count": 75, "percentage": 50.0 }
    ],
    "barData": [
        { "department": "Academic Affairs", "count": 25 }
    ]
}
```

### Record Management

#### `AddNewRecord()` - GET
**Purpose**: Display form for adding new regulation record  
**Route**: `/Admin/AddNewRecord`  
**Returns**: Add record form view  

#### `AddNewRecord(AddNewRecordViewModel model)` - POST
**Purpose**: Process new record creation  
**Parameters**: 
- `model`: Complete record data including files

**Process Flow**:
1. Input validation
2. File upload handling (PDF/Word)
3. Database record creation
4. Attachment processing
5. Success/error response

#### `EditRecord(int id)` - GET
**Purpose**: Display edit form for existing record  
**Route**: `/Admin/EditRecord/{id}`  
**Parameters**: `id` - Record ID to edit  

#### `EditRecord(int id, AddNewRecordViewModel model)` - POST
**Purpose**: Process record updates  
**Features**:
- File replacement handling
- Partial updates support
- Validation and error handling

#### `DeleteRecord(int id)` - POST
**Purpose**: Delete regulation record  
**Route**: `/Admin/DeleteRecord/{id}`  
**Process**:
1. Soft delete implementation
2. File cleanup
3. Database relationship maintenance

### Contact Information Management

#### `ManageContactInfo()` - GET
**Purpose**: Display all contact information  
**Route**: `/Admin/ManageContactInfo`  
**Returns**: List of all department contacts  

#### `AddNewContactInfo()` - GET/POST
**Purpose**: Add new department contact  
**Features**:
- Form validation
- Department selection
- Multiple contact methods

#### `EditContactInfo(int id)` - GET/POST
**Purpose**: Edit existing contact information  
**Parameters**: `id` - Contact ID to edit  

#### `DeleteContactInfo(int id)` - POST
**Purpose**: Remove contact information  
**Security**: Confirmation required  

### File Management

#### `GetThumbnail(int recordId)` - GET
**Purpose**: Generate PDF thumbnail images  
**Route**: `/Admin/GetThumbnail/{recordId}`  
**Returns**: Thumbnail image (JPEG)  

**Features**:
- PDF to image conversion
- Memory caching
- Error handling for invalid PDFs

#### `DownloadAttachment(int attachmentId)` - GET
**Purpose**: Secure file download  
**Route**: `/Admin/DownloadAttachment/{attachmentId}`  
**Security**: 
- File existence validation
- Authorized access only
- MIME type detection

### Data Export

#### `ExportToExcel()` - GET
**Purpose**: Export records to Excel format  
**Route**: `/Admin/ExportToExcel`  
**Returns**: Excel file download  

**Features**:
- EPPlus library integration
- Formatted spreadsheet
- All record data export

## 🗄️ Database Operations

### Primary Tables
- **RECORDS**: Main regulation records
- **ATTACHMENTS**: File attachments
- **CONTACT_INFORMATION**: Department contacts  
- **USER_HISTORY**: Activity tracking
- **DEPARTMENTS**: Department information

### Complex Queries

#### Most Viewed Records
```sql
SELECT r.REGULATION_NAME, COUNT(*) AS views
FROM USER_HISTORY h
LEFT JOIN RECORDS r ON h.RECORD_ID = r.RECORD_ID
WHERE h.ACTION = 'view'
GROUP BY r.REGULATION_NAME
ORDER BY views DESC
```

#### Document Type Statistics
```sql
SELECT DOCUMENT_TYPE, COUNT(*) AS Count
FROM RECORDS
GROUP BY DOCUMENT_TYPE
```

## 📁 File Handling

### Upload Process
1. **Validation**: File type and size checks
2. **Storage**: Organized folder structure
3. **Database**: File metadata storage
4. **Security**: Path traversal prevention

### Supported Formats
- **PDF**: Primary document format
- **Word**: Alternative document format
- **Images**: Thumbnail generation

### File Organization
```
wwwroot/
├── uploads/
│   ├── pdfs/
│   └── word/
└── thumbnails/
    └── cached/
```

## 🎨 View Integration

### Associated Views
- `AdminPage.cshtml`: Main dashboard
- `AddNewRecord.cshtml`: Record creation form
- `EditRecord.cshtml`: Record editing form
- `ManageContactInfo.cshtml`: Contact management
- `AddNewContactInfo.cshtml`: Contact creation
- `EditContactInfo.cshtml`: Contact editing

### JavaScript Integration
- `AdminTable.js`: Table management
- `StatisticsInAdmin.js`: Dashboard charts
- `recordDetailsModal.js`: Modal interactions

## 🔒 Security Measures

### Input Validation
- File type restrictions
- Size limitations
- Path traversal prevention
- SQL injection protection

### Error Handling
```csharp
try
{
    // Operation code
}
catch (OracleException ex)
{
    _logger.LogError(ex, "Database operation failed");
    return Json(new { success = false, message = "Database error" });
}
```

### File Security
- Authorized access only
- Secure file paths
- MIME type validation
- Virus scanning (recommended)

## 📈 Performance Optimization

### Caching Strategy
- **Thumbnails**: Memory cached images
- **Statistics**: Cached dashboard data
- **File Metadata**: Cached file information

### Database Optimization
- Indexed queries
- Efficient joins
- Parameterized queries
- Connection pooling

## 🐛 Error Handling

### Common Error Scenarios
1. **File Upload Errors**: Size, type, corruption
2. **Database Errors**: Connection, constraint violations
3. **Permission Errors**: Access denied scenarios
4. **Validation Errors**: Input validation failures

### Logging Strategy
```csharp
_logger.LogError(ex, "Operation failed for user {UserId}", userId);
_logger.LogInformation("Record created successfully: {RecordId}", recordId);
```

## 🧪 Testing Considerations

### Unit Tests
- Record CRUD operations
- File upload/download
- Input validation
- Error handling

### Integration Tests
- Database operations
- File system operations
- Authentication/authorization
- View rendering

### Security Tests
- Authorization bypass attempts
- File upload vulnerabilities
- SQL injection testing
- XSS prevention

## 📊 Monitoring & Analytics

### Key Metrics
- Record creation/modification rates
- File upload success rates
- User activity patterns
- Error frequency

### Performance Metrics
- Response times
- Database query performance
- File operation speed
- Cache hit rates

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: High  
**Maintenance Priority**: Critical
