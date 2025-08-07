# SavedController Documentation

## 📝 Overview

The `SavedController` manages user bookmarks and saved documents in the Rules & Regulations System. It provides API endpoints for users to save, remove, and retrieve their bookmarked regulation documents, maintaining personal document collections.

## 🎯 Key Responsibilities

- **Bookmark Management**: Add/remove documents from user's saved list
- **Saved Document Retrieval**: Get user's saved document collections
- **Session Management**: Handle user authentication state
- **Data Persistence**: Manage saved records in database
- **API Services**: Provide REST API for bookmark operations

## 🔐 Security & Authorization

```csharp
int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
if (userId == 0)
    return Unauthorized(); // User not logged in or session expired
```

- **Session-Based Auth**: Validates user session for all operations
- **User Isolation**: Users can only access their own saved documents
- **Unauthorized Access**: Returns 401 for unauthenticated requests

## 🏗️ Architecture & Dependencies

### Constructor Dependencies
- `RRdbContext`: Entity Framework database context for saved records

### API Controller Configuration
```csharp
[ApiController]
[Route("Saved")]
```

- **API Controller**: RESTful endpoint design
- **Route Prefix**: All endpoints prefixed with `/Saved`
- **JSON Responses**: Returns JSON data for frontend consumption

## 📊 Core Methods Documentation

### Bookmark Management

#### `Toggle([FromBody] SaveRequest request)` - POST
**Purpose**: Toggle bookmark status for a document  
**Route**: `POST /Saved/Toggle`  
**Content-Type**: `application/json`  
**Authentication**: Required (session-based)

**Request Model**:
```csharp
public class SaveRequest
{
    public int RecordId { get; set; }
}
```

**Request Example**:
```json
{
    "recordId": 123
}
```

**Response Examples**:
```json
// Document added to saved list
{
    "removed": false
}

// Document removed from saved list
{
    "removed": true
}
```

**Process Flow**:
1. **Authentication Check**: Validate user session
2. **Existing Record Check**: Query for existing saved record
3. **Toggle Logic**: 
   - If exists: Remove from saved list
   - If not exists: Add to saved list
4. **Database Update**: Persist changes
5. **Response**: Return toggle status

**Implementation Details**:
```csharp
// Check for existing saved record
var existing = _context.SavedRecords
    .FirstOrDefault(s => s.UserId == userId && s.RecordId == request.RecordId);

if (existing != null)
{
    // Remove existing bookmark
    _context.SavedRecords.Remove(existing);
    _context.SaveChanges();
    return Ok(new { removed = true });
}

// Add new bookmark
var newRecord = new SavedRecord
{
    SavedId = Guid.NewGuid().ToString(),
    UserId = userId,
    RecordId = request.RecordId,
    SavedTimestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
};

_context.SavedRecords.Add(newRecord);
_context.SaveChanges();
return Ok(new { removed = false });
```

### Bookmark Retrieval

#### `ListIds()` - GET
**Purpose**: Retrieve list of saved document IDs for current user  
**Route**: `GET /Saved/ListIds`  
**Authentication**: Required (session-based)

**Response Format**:
```json
[123, 456, 789, 101112]
```

**Implementation**:
```csharp
int userId = HttpContext.Session.GetInt32("UserId") ?? 0;

var ids = _context.SavedRecords
    .Where(r => r.UserId == userId)
    .Select(r => r.RecordId)
    .ToList();

return Ok(ids);
```

**Use Cases**:
- Frontend bookmark state initialization
- Bulk operations on saved documents
- User interface synchronization

## 🗄️ Database Operations

### SavedRecords Table Structure
```sql
CREATE TABLE SavedRecords (
    SavedId NVARCHAR2(36) PRIMARY KEY,    -- GUID identifier
    UserId NUMBER(10) NOT NULL,           -- User reference
    RecordId NUMBER(10) NOT NULL,         -- Document reference
    SavedTimestamp NVARCHAR2(19) NOT NULL -- Save timestamp
);
```

### Key Relationships
- **Users**: `SavedRecords.UserId → Users.UserId`
- **Records**: `SavedRecords.RecordId → Records.RecordId`

### Indexing Strategy
```sql
-- Composite index for user bookmarks
CREATE INDEX IX_SavedRecords_UserId_RecordId ON SavedRecords(UserId, RecordId);

-- Index for timestamp queries
CREATE INDEX IX_SavedRecords_Timestamp ON SavedRecords(SavedTimestamp);
```

## 🎨 Frontend Integration

### JavaScript API Calls

#### Toggle Bookmark
```javascript
async function toggleBookmark(recordId) {
    try {
        const response = await fetch('/Saved/Toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recordId: recordId })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        updateBookmarkUI(recordId, !result.removed);
        
        return result;
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showNotification('Error updating bookmark', 'error');
    }
}
```

#### Load User Bookmarks
```javascript
async function loadUserBookmarks() {
    try {
        const response = await fetch('/Saved/ListIds');
        
        if (!response.ok) {
            if (response.status === 401) {
                // User not authenticated
                return [];
            }
            throw new Error('Failed to load bookmarks');
        }

        const bookmarkIds = await response.json();
        initializeBookmarkUI(bookmarkIds);
        
        return bookmarkIds;
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        return [];
    }
}
```

### UI Components

#### Bookmark Button
```html
<button class="bookmark-btn" 
        data-record-id="@Model.RecordId" 
        onclick="toggleBookmark(@Model.RecordId)">
    <i class="fas fa-bookmark" id="bookmark-icon-@Model.RecordId"></i>
    <span id="bookmark-text-@Model.RecordId">Save</span>
</button>
```

#### Bookmark Status Update
```javascript
function updateBookmarkUI(recordId, isBookmarked) {
    const icon = document.getElementById(`bookmark-icon-${recordId}`);
    const text = document.getElementById(`bookmark-text-${recordId}`);
    
    if (isBookmarked) {
        icon.classList.add('fas');
        icon.classList.remove('far');
        text.textContent = 'Saved';
    } else {
        icon.classList.add('far');
        icon.classList.remove('fas');
        text.textContent = 'Save';
    }
}
```

## 🔒 Security Measures

### Session Validation
```csharp
// Enhanced session validation
private int GetAuthenticatedUserId()
{
    int userId = HttpContext.Session.GetInt32("UserId") ?? 0;
    
    // Additional validation
    if (userId == 0 || !HttpContext.Session.Keys.Contains("UserRole"))
    {
        return 0; // Invalid session
    }
    
    return userId;
}
```

### Input Validation
```csharp
[HttpPost("Toggle")]
public IActionResult Toggle([FromBody] SaveRequest request)
{
    // Validate request
    if (request?.RecordId <= 0)
    {
        return BadRequest("Invalid record ID");
    }

    // Validate user session
    int userId = GetAuthenticatedUserId();
    if (userId == 0)
    {
        return Unauthorized();
    }

    // Validate record exists
    var recordExists = _context.Records.Any(r => r.RecordId == request.RecordId);
    if (!recordExists)
    {
        return NotFound("Record not found");
    }

    // Process toggle logic...
}
```

### SQL Injection Prevention
- **Entity Framework**: Parameterized queries by default
- **LINQ Queries**: Safe query construction
- **Input Validation**: Validated request parameters

## 📈 Performance Optimization

### Database Optimization
```csharp
// Efficient bookmark check
var existing = await _context.SavedRecords
    .AsNoTracking()
    .FirstOrDefaultAsync(s => s.UserId == userId && s.RecordId == request.RecordId);
```

### Caching Strategy
```csharp
// Cache user bookmarks for frequent access
private async Task<List<int>> GetCachedUserBookmarks(int userId)
{
    string cacheKey = $"user_bookmarks_{userId}";
    
    if (_cache.TryGetValue(cacheKey, out List<int> cachedBookmarks))
    {
        return cachedBookmarks;
    }

    var bookmarks = await _context.SavedRecords
        .Where(r => r.UserId == userId)
        .Select(r => r.RecordId)
        .ToListAsync();

    _cache.Set(cacheKey, bookmarks, TimeSpan.FromMinutes(10));
    return bookmarks;
}
```

## 🐛 Error Handling

### Error Scenarios
1. **Unauthenticated User**: Return 401 Unauthorized
2. **Invalid Record ID**: Return 400 Bad Request
3. **Database Connection**: Return 500 Internal Server Error
4. **Record Not Found**: Return 404 Not Found

### Error Response Format
```csharp
try
{
    // Bookmark operation
}
catch (DbUpdateException ex)
{
    _logger.LogError(ex, "Database error in SavedController");
    return StatusCode(500, new { error = "Database operation failed" });
}
catch (Exception ex)
{
    _logger.LogError(ex, "Unexpected error in SavedController");
    return StatusCode(500, new { error = "An unexpected error occurred" });
}
```

## 🧪 Testing Considerations

### Unit Tests
```csharp
[Test]
public async Task Toggle_ValidUser_AddsBookmark()
{
    // Arrange
    var context = GetTestContext();
    var controller = new SavedController(context);
    var request = new SaveRequest { RecordId = 123 };
    
    // Mock session
    SetupSession(controller, userId: 1);

    // Act
    var result = await controller.Toggle(request);

    // Assert
    var okResult = result as OkObjectResult;
    Assert.IsNotNull(okResult);
    
    var response = okResult.Value as dynamic;
    Assert.IsFalse(response.removed);
}
```

### Integration Tests
- API endpoint testing
- Database integration testing
- Session management testing
- Error handling validation

## 📊 Analytics & Monitoring

### Key Metrics
- **Bookmark Actions**: Add/remove frequency
- **Popular Documents**: Most bookmarked content
- **User Engagement**: Bookmark usage patterns
- **Performance**: API response times

### Logging Strategy
```csharp
[HttpPost("Toggle")]
public IActionResult Toggle([FromBody] SaveRequest request)
{
    _logger.LogInformation("Bookmark toggle requested for Record {RecordId} by User {UserId}", 
                          request.RecordId, userId);

    // Implementation...

    _logger.LogInformation("Bookmark {Action} for Record {RecordId} by User {UserId}", 
                          existing != null ? "removed" : "added", request.RecordId, userId);
}
```

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Security Level**: Medium  
**Maintenance Priority**: Medium
