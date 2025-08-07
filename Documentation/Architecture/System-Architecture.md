# System Architecture Overview

## 📝 Executive Summary

The Rules & Regulations System is a comprehensive web application built on ASP.NET Core 9.0 MVC architecture, designed to manage and distribute university policies and regulations for Imam Abdulrahman Bin Faisal University. The system provides bilingual support, role-based access control, and comprehensive document management capabilities.

## 🏛️ High-Level Architecture

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Razor     │  │    CSS      │  │     JavaScript      │ │
│  │    Views    │  │  Styling    │  │    (Frontend)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Controllers │  │  Services   │  │     Middleware      │ │
│  │    (MVC)    │  │  (Business) │  │   (Authentication)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Entity      │  │   Oracle    │  │    File System      │ │
│  │ Framework   │  │  Database   │  │    (Documents)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architectural Patterns

### Model-View-Controller (MVC)
- **Models**: Data entities and business logic
- **Views**: User interface and presentation layer
- **Controllers**: Request handling and coordination

### Repository Pattern
- **Abstraction**: Database access layer abstraction
- **Testability**: Improved unit testing capabilities
- **Maintainability**: Centralized data access logic

### Dependency Injection
- **IoC Container**: Built-in ASP.NET Core DI container
- **Service Lifetime**: Scoped, Transient, and Singleton services
- **Testability**: Easy mocking for unit tests

## 🔧 Technology Stack

### Backend Technologies
- **Framework**: ASP.NET Core 9.0
- **Language**: C# 12.0
- **Database**: Oracle Database 19c+
- **ORM**: Entity Framework Core 9.0
- **Authentication**: Cookie-based Authentication
- **Caching**: In-Memory Caching

### Frontend Technologies
- **UI Framework**: Bootstrap 5.3
- **JavaScript**: Vanilla JS (ES6+)
- **CSS**: Custom CSS with CSS Grid/Flexbox
- **Icons**: Font Awesome 6.0
- **Charts**: Chart.js for analytics

### Development Tools
- **IDE**: Visual Studio 2022
- **Version Control**: Git
- **Package Manager**: NuGet
- **Build Tool**: MSBuild
- **Testing**: xUnit, Moq

## 🗄️ Database Architecture

### Database Schema
```sql
-- Core Tables
USERS (UserId, Name, Password, Role, IsActive, CreatedAt)
RECORDS (RecordId, RegulationName, Description, Department, DocumentType, Version, CreatedAt)
ATTACHMENTS (Id, RecordId, FileName, FilePath, FileType, FileSize, UploadedAt)
CONTACT_INFORMATION (Id, Department, Name, NameAr, Email, Mobile, Telephone)

-- Activity Tracking
VISITS (Id, UserId, IPAddress, VisitTimestamp)
USER_HISTORY (Id, UserId, RecordId, Action, ActionDate)
SEARCH_LOGS (Id, UserId, SearchTerm, ResultCount, SearchDate)

-- User Features
SAVED_RECORDS (UserId, RecordId, SavedAt)
CHATBOT_INTERACTIONS (Id, UserId, Question, Response, InteractionDate)
```

### Relationships
- **Users ↔ Records**: Many-to-Many (via SavedRecords)
- **Records → Attachments**: One-to-Many
- **Users → Visits**: One-to-Many
- **Users → History**: One-to-Many

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_records_department ON RECORDS(DEPARTMENT);
CREATE INDEX idx_records_document_type ON RECORDS(DOCUMENT_TYPE);
CREATE INDEX idx_history_user_action ON USER_HISTORY(USER_ID, ACTION);
CREATE INDEX idx_visits_timestamp ON VISITS(VISIT_TIMESTAMP);
```

## 🔐 Security Architecture

### Authentication Flow
```
User Request → Authentication Middleware → Cookie Validation → 
Authorization Check → Controller Action → Response
```

### Security Layers
1. **Transport Security**: HTTPS enforcement
2. **Authentication**: Cookie-based user authentication
3. **Authorization**: Role-based access control
4. **Input Validation**: Server-side validation
5. **Output Encoding**: XSS prevention
6. **CSRF Protection**: Anti-forgery tokens

### Security Measures
```csharp
// HTTPS Redirection
app.UseHttpsRedirection();

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    await next();
});

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();
```

## 🌐 Internationalization Architecture

### Localization Strategy
- **Supported Cultures**: English (en-US), Arabic (ar-SA)
- **Provider Chain**: Query String → Cookie → Accept-Language Header
- **Resource Management**: .resx files for localized content
- **RTL Support**: CSS-based right-to-left text direction

### Implementation
```csharp
services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "en-US", "ar-SA" };
    options.SetDefaultCulture("en-US");
    options.AddSupportedCultures(supportedCultures);
    options.AddSupportedUICultures(supportedCultures);
});
```

## 📁 File Management Architecture

### File Organization
```
wwwroot/
├── uploads/
│   ├── pdfs/          # PDF documents
│   ├── word/          # Word documents
│   └── temp/          # Temporary uploads
├── thumbnails/        # Generated PDF thumbnails
├── css/              # Stylesheets
├── js/               # JavaScript files
├── imgs/             # Static images
└── svgs/             # SVG icons
```

### File Processing Pipeline
1. **Upload**: File validation and temporary storage
2. **Processing**: Virus scanning (recommended)
3. **Storage**: Organized permanent storage
4. **Metadata**: Database record creation
5. **Thumbnails**: PDF preview generation

## 🚀 Performance Architecture

### Caching Strategy
```csharp
// Memory Caching
services.AddMemoryCache();

// Cache Usage
public async Task<List<Record>> GetRecordsAsync()
{
    const string cacheKey = "all_records";
    
    if (_cache.TryGetValue(cacheKey, out List<Record> cachedRecords))
        return cachedRecords;
    
    var records = await _repository.GetAllAsync();
    _cache.Set(cacheKey, records, TimeSpan.FromMinutes(15));
    
    return records;
}
```

### Database Optimization
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Indexed and parameterized queries
- **Lazy Loading**: On-demand data loading
- **Batch Operations**: Bulk data operations

### Frontend Optimization
- **Minification**: CSS/JS compression
- **Bundling**: Resource combination
- **Lazy Loading**: Deferred resource loading
- **CDN**: Content Delivery Network (recommended)

## 📊 Monitoring & Logging

### Logging Architecture
```csharp
// Structured Logging
_logger.LogInformation("User {UserId} accessed record {RecordId}", 
                      userId, recordId);

_logger.LogError(ex, "Database operation failed for user {UserId}", userId);
```

### Monitoring Points
- **Application Performance**: Response times, throughput
- **Database Performance**: Query execution times
- **Error Tracking**: Exception monitoring
- **User Analytics**: Usage patterns and features

### Health Checks
```csharp
services.AddHealthChecks()
    .AddOracle(connectionString)
    .AddCheck<FileSystemHealthCheck>("filesystem");

app.UseHealthChecks("/health");
```

## 🔄 Integration Architecture

### External Systems
- **University Directory**: User authentication integration (potential)
- **Document Management**: External document systems
- **Analytics**: Google Analytics or similar
- **Email Service**: Notification system (future enhancement)

### API Design
```csharp
[Route("api/[controller]")]
[ApiController]
public class DocumentsController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(int id)
    {
        // API implementation
    }
}
```

## 📱 Responsive Design Architecture

### Breakpoint Strategy
- **Mobile**: < 768px (Primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Component Responsiveness
```css
/* Mobile-first approach */
.container {
    padding: 1rem;
}

@media (min-width: 768px) {
    .container {
        padding: 2rem;
        max-width: 750px;
    }
}
```

## 🧪 Testing Architecture

### Testing Strategy
```
Unit Tests (70%) → Integration Tests (20%) → End-to-End Tests (10%)
```

### Test Coverage
- **Controllers**: Business logic and HTTP responses
- **Services**: Data operations and business rules
- **Models**: Validation and entity behavior
- **JavaScript**: Frontend functionality

## 🚀 Deployment Architecture

### Development Environment
- **Local Development**: IIS Express
- **Database**: Local Oracle instance
- **Configuration**: Development settings

### Production Environment
- **Web Server**: IIS or Apache
- **Database**: Oracle Database cluster
- **Load Balancer**: Application load balancing
- **SSL/TLS**: Security certificate management

### CI/CD Pipeline (Recommended)
```yaml
stages:
  - build
  - test
  - security-scan
  - deploy-staging
  - deploy-production
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple application instances
- **Session State**: Distributed session management
- **Database**: Read replicas and sharding

### Vertical Scaling
- **Resource Optimization**: CPU and memory tuning
- **Database Tuning**: Index optimization
- **Caching**: Aggressive caching strategies

## 🔮 Future Enhancements

### Planned Features
- **Mobile Application**: Native mobile apps
- **Advanced Search**: Elasticsearch integration
- **Workflow Management**: Approval workflows
- **Real-time Notifications**: SignalR implementation
- **Analytics Dashboard**: Advanced reporting

### Technical Improvements
- **Microservices**: Service decomposition
- **Cloud Migration**: Azure or AWS deployment
- **Container**: Docker containerization
- **GraphQL**: API enhancement

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Architecture Review**: Quarterly  
**Scalability**: Designed for 10,000+ concurrent users
