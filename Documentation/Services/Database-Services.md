# Database Services Documentation

## 📝 Overview

The database services layer provides abstraction and business logic for all database operations in the Rules & Regulations System. It consists of two main services that handle Oracle database interactions and general database connectivity.

## 🏗️ Service Architecture

### Service Components
1. **OracleDbService**: Business logic and data operations
2. **DatabaseConnection**: Direct database connectivity
3. **Entity Framework Context**: ORM-based data access

## 🔧 OracleDbService

### Purpose
Primary business logic service that handles all Oracle database operations with Arabic language support and client-side validation.

### Key Features
- **Multilingual Support**: Arabic and English field validation
- **Business Logic**: Encapsulated data operations
- **Error Handling**: Comprehensive exception management
- **Validation**: Server-side and client-side validation

### Core Methods

#### Data Retrieval
```csharp
public DataTable GetData(string query)
```
**Purpose**: Execute SELECT queries and return results  
**Parameters**: SQL query string  
**Returns**: DataTable with query results  
**Security**: Uses parameterized queries to prevent SQL injection

#### Contact Information Management

##### `AddContactInfo()`
```csharp
public bool AddContactInfo(string department, string name, string? nameAr, 
                          string? email, string? mobile, string? telephone)
```
**Features**:
- Automatic ID generation from sequence
- Arabic name support
- Email/phone validation
- Transaction management

##### `UpdateContactInfo()`
**Purpose**: Modify existing contact information  
**Validation**: Ensures data integrity and format validation  
**Returns**: Boolean success indicator

##### `DeleteContactInfo(int contactId)`
**Purpose**: Remove contact information  
**Security**: Validates existence before deletion  
**Cleanup**: Handles related data dependencies

#### Record Management

##### `GetAllRecords()`
```csharp
public List<Record> GetAllRecords()
```
**Purpose**: Retrieve all regulation records  
**Features**:
- Includes attachment information
- Department categorization
- Status filtering support

##### `AddNewRecord()`
**Purpose**: Create new regulation record  
**Process**:
1. Validate input data
2. Generate unique record ID
3. Insert record into database
4. Handle file attachments
5. Log creation activity

##### `UpdateRecord()`
**Features**:
- Partial updates supported
- File replacement handling
- Change tracking
- Audit logging

#### File Attachment Operations

##### `AddAttachment()`
```csharp
public bool AddAttachment(int recordId, string fileName, string filePath, string fileType)
```
**Process**:
1. Validate file existence
2. Check file type restrictions
3. Generate attachment ID
4. Store file metadata
5. Update record relations

##### `GetAttachments(int recordId)`
**Returns**: List of file attachments for a record  
**Security**: Access control validation  
**Features**: MIME type detection and file size tracking

#### Search and Filtering

##### `SearchRecords(string searchTerm, string? department)`
**Features**:
- Full-text search capability
- Department filtering
- Arabic text search support
- Relevance ranking

##### `GetRecordsByDepartment(string department)`
**Purpose**: Department-specific record retrieval  
**Optimization**: Indexed queries for performance

### Database Connection Management

#### Connection Handling
```csharp
using (var conn = new OracleConnection(_connectionString))
{
    conn.Open();
    // Database operations
}
```
**Features**:
- Automatic connection disposal
- Connection pooling support
- Timeout management
- Error recovery

#### Transaction Management
```csharp
public bool ExecuteInTransaction(List<Func<OracleConnection, bool>> operations)
{
    using (var conn = new OracleConnection(_connectionString))
    {
        conn.Open();
        using (var transaction = conn.BeginTransaction())
        {
            try
            {
                foreach (var operation in operations)
                {
                    if (!operation(conn))
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
```

## 🗄️ DatabaseConnection Service

### Purpose
Direct database connectivity service for complex SQL operations and administrative tasks.

### Key Features
- **Raw SQL Execution**: Complex query support
- **Stored Procedure Calls**: Database procedure execution
- **Bulk Operations**: Efficient bulk data handling
- **Administrative Operations**: Database maintenance tasks

### Core Methods

#### `ExecuteQuery(string query, params OracleParameter[] parameters)`
**Purpose**: Execute parameterized queries safely  
**Security**: SQL injection prevention  
**Returns**: Affected row count or result set

#### `ExecuteScalar(string query, params OracleParameter[] parameters)`
**Purpose**: Execute queries that return single values  
**Use Cases**: ID generation, count operations, existence checks

#### `GetDataTable(string query, params OracleParameter[] parameters)`
**Purpose**: Execute SELECT queries returning DataTable  
**Features**: Automatic column mapping and type conversion

## 🔒 Security Implementation

### SQL Injection Prevention
```csharp
using (var cmd = new OracleCommand(query, conn))
{
    cmd.Parameters.Add(new OracleParameter("parameter", value));
    // Execute command
}
```

### Input Validation
```csharp
public bool ValidateArabicText(string text)
{
    if (string.IsNullOrEmpty(text)) return true;
    return System.Text.RegularExpressions.Regex.IsMatch(text, @"^[\u0600-\u06FF\s]+$");
}
```

### Connection Security
- **Encrypted Connections**: SSL/TLS for database communication
- **Credential Management**: Secure connection string storage
- **Access Control**: Role-based database permissions

## 📊 Performance Optimization

### Query Optimization
- **Indexed Queries**: Proper index utilization
- **Parameterized Queries**: Query plan reuse
- **Batch Operations**: Reduced round trips

### Connection Pooling
```csharp
// Connection string configuration
"Data Source=server;User Id=user;Password=pass;Pooling=true;Max Pool Size=100;"
```

### Caching Strategy
- **Result Caching**: Frequently accessed data
- **Metadata Caching**: Schema information
- **Query Plan Caching**: Execution plan reuse

## 🧪 Error Handling

### Exception Management
```csharp
try
{
    // Database operation
}
catch (OracleException ex)
{
    _logger.LogError(ex, "Oracle database error: {Message}", ex.Message);
    
    switch (ex.Number)
    {
        case 1: // Unique constraint violation
            throw new BusinessException("Record already exists");
        case 2291: // Foreign key constraint
            throw new BusinessException("Referenced record not found");
        default:
            throw new DataAccessException("Database operation failed");
    }
}
```

### Logging Strategy
```csharp
_logger.LogInformation("Executing query: {Query} with parameters: {Parameters}", 
                      query, string.Join(", ", parameters.Select(p => $"{p.ParameterName}={p.Value}")));
```

## 🌐 Internationalization Support

### Arabic Text Handling
```csharp
public bool IsArabicText(string text)
{
    return text.Any(c => c >= 0x0600 && c <= 0x06FF);
}

public string NormalizeArabicText(string text)
{
    // Remove diacritics and normalize text
    return text.Normalize(NormalizationForm.FormC);
}
```

### Collation Support
```sql
-- Arabic collation for proper sorting
ORDER BY NLSSORT(column_name, 'NLS_SORT=ARABIC')
```

## 📈 Monitoring & Diagnostics

### Performance Metrics
- Query execution times
- Connection pool utilization
- Error rates and patterns
- Resource consumption

### Health Checks
```csharp
public async Task<bool> CheckDatabaseHealth()
{
    try
    {
        using (var conn = new OracleConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (var cmd = new OracleCommand("SELECT 1 FROM DUAL", conn))
            {
                await cmd.ExecuteScalarAsync();
            }
        }
        return true;
    }
    catch
    {
        return false;
    }
}
```

## 🔧 Configuration

### Connection String Configuration
```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=server:1521/service;User Id=user;Password=password;Pooling=true;Connection Timeout=30;"
  }
}
```

### Service Registration
```csharp
services.AddScoped<OracleDbService>();
services.AddScoped<DatabaseConnection>();
```

## 📋 Best Practices

### Code Guidelines
1. **Always use parameterized queries**
2. **Implement proper connection disposal**
3. **Handle exceptions appropriately**
4. **Log important operations**
5. **Validate input data**

### Performance Tips
1. **Use connection pooling**
2. **Implement query result caching**
3. **Optimize frequently used queries**
4. **Monitor query performance**
5. **Use bulk operations for large data sets**

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Database**: Oracle Database 19c+  
**Security Level**: High
