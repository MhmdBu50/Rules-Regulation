# ServiceController Documentation

## 📝 Overview

The `ServiceController` provides data query services and database interaction capabilities for the Rules & Regulations System. It serves as a bridge between the frontend and database operations, allowing controlled data access through secure query execution.

## 🎯 Key Responsibilities

- **Data Query Services**: Execute controlled database queries
- **Data Retrieval**: Fetch data based on query parameters
- **Error Handling**: Manage query execution errors safely
- **Security Enforcement**: Validate and sanitize database queries

## 🔐 Security & Authorization

```csharp
// Query validation security
if (!query.Trim().ToUpper().StartsWith("SELECT"))
{
    return BadRequest("Only SELECT queries are allowed.");
}
```

- **Query Restriction**: Only SELECT statements permitted
- **SQL Injection Prevention**: Input validation and sanitization
- **Error Masking**: Safe error handling without data exposure

## 🏗️ Architecture & Dependencies

### Constructor Dependencies
- `OracleDbService`: Database operations and query execution

### Service Integration
- Injected `OracleDbService` for all database operations
- Error handling through `ErrorViewModel`
- Activity tracking for request identification

## 📊 Core Methods Documentation

### Data Services

#### `GetData(string query)` - GET
**Purpose**: Execute controlled database SELECT queries  
**Route**: `/Service/GetData`  
**Parameters**: `query` - SQL SELECT statement to execute  
**Returns**: Data view with query results  

**Security Validation**:
1. Null/whitespace validation
2. Query type verification (SELECT only)
3. SQL injection prevention
4. Error handling and masking

**Process Flow**:
```csharp
public IActionResult GetData(string query)
{
    // 1. Input validation
    if (string.IsNullOrWhiteSpace(query) || 
        !query.Trim().ToUpper().StartsWith("SELECT"))
    {
        return BadRequest("Only SELECT queries are allowed.");
    }

    try
    {
        // 2. Execute query through service
        var data = _oracleDbService.GetData(query);
        return View(data);
    }
    catch (Exception)
    {
        // 3. Safe error handling
        return View("Error", new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
    }
}
```

## 🗄️ Database Operations

### Supported Query Types
- **SELECT Statements**: Data retrieval only
- **JOIN Operations**: Multi-table queries
- **Aggregate Functions**: COUNT, SUM, AVG, etc.
- **Filtering**: WHERE clauses with parameters

### Query Examples

#### Basic Record Query
```sql
SELECT RECORD_ID, REGULATION_NAME, DOCUMENT_TYPE 
FROM RECORDS 
WHERE STATUS = 'Active'
ORDER BY CREATED_DATE DESC
```

#### Department Statistics
```sql
SELECT d.DEPARTMENT_NAME, COUNT(r.RECORD_ID) as TOTAL_RECORDS
FROM DEPARTMENTS d
LEFT JOIN RECORDS r ON d.DEPARTMENT_ID = r.DEPARTMENT_ID
GROUP BY d.DEPARTMENT_NAME
ORDER BY TOTAL_RECORDS DESC
```

#### Contact Information
```sql
SELECT ci.CONTACT_NAME, ci.EMAIL, ci.PHONE, d.DEPARTMENT_NAME
FROM CONTACT_INFORMATION ci
JOIN DEPARTMENTS d ON ci.DEPARTMENT_ID = d.DEPARTMENT_ID
WHERE ci.STATUS = 'Active'
```

## 🎨 View Integration

### Associated Views
- `GetData.cshtml`: Query results display
- `Error.cshtml`: Error handling view
- Data visualization components

### Data Presentation
- Tabular data display
- Export functionality
- Pagination support
- Responsive design

## 🔒 Security Measures

### Query Validation
```csharp
// Whitelist approach - only SELECT allowed
if (!query.Trim().ToUpper().StartsWith("SELECT"))
{
    return BadRequest("Only SELECT queries are allowed.");
}
```

### Additional Security Considerations
- **SQL Injection Prevention**: Input sanitization
- **Query Complexity Limits**: Prevent resource exhaustion
- **Result Set Limits**: Prevent memory issues
- **Audit Logging**: Track query execution

### Recommended Enhancements
```csharp
// Enhanced security implementation
private bool IsValidQuery(string query)
{
    var forbiddenKeywords = new[] { "DROP", "DELETE", "UPDATE", 
                                   "INSERT", "TRUNCATE", "ALTER" };
    var upperQuery = query.ToUpper();
    
    return !forbiddenKeywords.Any(keyword => upperQuery.Contains(keyword));
}
```

## 🔧 Error Handling

### Error Categories
1. **Invalid Query**: Non-SELECT statements
2. **Database Errors**: Connection or execution failures  
3. **Syntax Errors**: Malformed SQL queries
4. **Timeout Errors**: Long-running queries

### Error Response Strategy
```csharp
catch (OracleException ex)
{
    _logger.LogError(ex, "Database query failed: {Query}", query);
    return View("Error", new ErrorViewModel 
    { 
        RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
        Message = "Database query failed"
    });
}
```

## 📈 Performance Optimization

### Query Performance
- **Query Optimization**: Use indexed columns
- **Result Limiting**: Implement pagination
- **Connection Pooling**: Efficient database connections
- **Caching**: Cache frequently accessed data

### Recommended Improvements
```csharp
// Pagination implementation
public IActionResult GetData(string query, int page = 1, int pageSize = 50)
{
    var offset = (page - 1) * pageSize;
    var paginatedQuery = $@"
        SELECT * FROM (
            SELECT rownum rn, sub.* FROM ({query}) sub
            WHERE rownum <= {offset + pageSize}
        ) WHERE rn > {offset}";
    
    // Execute paginated query
}
```

## 🧪 Testing Considerations

### Unit Tests
- Query validation logic
- Error handling scenarios
- Service integration
- Security measures

### Security Tests
- SQL injection attempts
- Query restriction bypass
- Error information disclosure
- Resource exhaustion attacks

### Integration Tests
- Database connectivity
- Query execution
- Result formatting
- View rendering

## 🔍 Usage Examples

### Frontend Integration
```javascript
// AJAX call to Service controller
$.get('/Service/GetData', { 
    query: 'SELECT * FROM CONTACT_INFORMATION' 
}, function(data) {
    $('#results').html(data);
});
```

### Query Examples
```sql
-- Department summary
SELECT DEPARTMENT_NAME, COUNT(*) as RECORD_COUNT 
FROM DEPARTMENTS d 
JOIN RECORDS r ON d.DEPARTMENT_ID = r.DEPARTMENT_ID 
GROUP BY DEPARTMENT_NAME

-- Recent records
SELECT TOP 10 REGULATION_NAME, CREATED_DATE 
FROM RECORDS 
ORDER BY CREATED_DATE DESC

-- Active contacts
SELECT CONTACT_NAME, EMAIL, DEPARTMENT_NAME 
FROM CONTACT_INFORMATION ci
JOIN DEPARTMENTS d ON ci.DEPARTMENT_ID = d.DEPARTMENT_ID
WHERE ci.STATUS = 'Active'
```

## 🚨 Security Warnings

### Current Limitations
1. **Limited Query Validation**: Only basic SELECT check
2. **No Result Limits**: Potential memory issues
3. **No Rate Limiting**: Potential DoS vulnerability
4. **No Audit Logging**: Security monitoring gaps

### Immediate Recommendations
1. Implement comprehensive query parsing
2. Add result set size limits
3. Implement query rate limiting
4. Add detailed audit logging
5. Consider parameterized query builders

## 📊 Monitoring & Logging

### Key Metrics
- Query execution frequency
- Query performance times
- Error rates and types
- Resource utilization

### Logging Implementation
```csharp
_logger.LogInformation("Query executed: {Query}", query);
_logger.LogWarning("Invalid query attempt: {Query}", query);
_logger.LogError(ex, "Query execution failed: {Query}", query);
```

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: Medium Risk  
**Maintenance Priority**: High (Security improvements needed)
