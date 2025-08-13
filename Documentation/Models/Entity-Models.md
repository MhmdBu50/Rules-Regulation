# Models & Data Layer Documentation

## 📝 Overview

The Models layer defines the data structures, entities, and database context for the Rules & Regulations System. It implements Entity Framework Core with Oracle database integration and provides comprehensive data modeling for all system entities.

## 🏗️ Architecture Overview

### Data Layer Components
1. **Entity Models**: Database table representations
2. **View Models**: Data transfer objects for views
3. **Database Context**: Entity Framework configuration
4. **Validation Models**: Input validation and business rules

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management
- **Model-View-ViewModel**: Clean separation of concerns
- **Data Annotations**: Validation and metadata

## 🗄️ Database Context (RRdbContext)

### Purpose
Primary Entity Framework DbContext that configures all database entities and relationships.

### Entity Sets
```csharp
public class RRdbContext : DbContext
{
    public DbSet<ContactInformation> ContactInformations { get; set; }
    public DbSet<AddNewRecord> AddNewRecords { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<Users> Users { get; set; }
    public DbSet<SavedRecord> SavedRecords { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<History> Histories { get; set; }
    public DbSet<SearchLog> SearchLogs { get; set; }
    public DbSet<ChatbotInteraction> ChatbotInteractions { get; set; }
}
```

### Configuration Features
- **Oracle Database Integration**: Optimized for Oracle DB
- **Table Mapping**: Custom table and column names
- **Relationships**: Foreign key configurations
- **Constraints**: Database constraints and validations
- **Indexes**: Performance optimization indexes

## 📊 Core Entity Models

### ContactInformation
**Purpose**: Department contact information management  

```csharp
public class ContactInformation
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Department { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; }
    [MaxLength(200)]
    public string? NameAr { get; set; }
    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }
    [Phone, MaxLength(20)]
    public string? Mobile { get; set; }
    [Phone, MaxLength(20)]
    public string? Telephone { get; set; }
}
```

**Table Configuration**:
```csharp
entity.ToTable("CONTACT_INFORMATION");
entity.HasKey(e => e.Id);
entity.Property(e => e.Department).HasColumnName("DEPARTMENT").HasMaxLength(100).IsRequired();
```

### AddNewRecord (Records)
**Purpose**: Main regulation records entity  

**Key Properties**:
- `RegulationName`: Document title (English)
- `RegulationNameAr`: Document title (Arabic) ✅ (added for localization)
- `Description`: Document description (English)
- `DescriptionAr`: Document description (Arabic) ✅
- `Department`: Owning department
- `DocumentType`: Classification (Policy, Procedure, etc.)
- `Version`: Document version number
- `VersionDate`: Version creation date
- `ApprovingDate`: Official approval date
- `ApprovingEntity` / `ApprovingEntityAr`: Entity that approved (EN/AR) ✅
- `Notes` / `NotesAr`: Additional notes (EN/AR) ✅
- `CreatedAt`: Record creation timestamp

> NOTE: The legacy `Sections` property was removed from the data model and all logging/UI. Documentation updated accordingly.

**Relationships**:
- One-to-Many with `Attachments`
- One-to-Many with `History`
- Many-to-Many with `Users` (through SavedRecords)

### Attachment
**Purpose**: File attachment metadata and relationships  

```csharp
public class Attachment
{
    public int Id { get; set; }
    public int RecordId { get; set; }
    [Required, MaxLength(255)]
    public string FileName { get; set; }
    [Required, MaxLength(500)]
    public string FilePath { get; set; }
    [MaxLength(100)]
    public string FileType { get; set; }
    public long? FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    
    // Navigation properties
    public AddNewRecord Record { get; set; }
}
```

### Users
**Purpose**: System user management and authentication  

**Security Features**:
- Password hashing (recommended upgrade needed)
- Role-based access control
- Session management integration
- Activity tracking

```csharp
public class Users
{
    public int UserId { get; set; }
    [Required, MaxLength(50)]
    public string Name { get; set; }
    [Required, MaxLength(100)]
    public string Password { get; set; } // TODO: Hash passwords
    [MaxLength(50)]
    public string? Role { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
```

### SavedRecord
**Purpose**: User's bookmarked/saved documents  

**Features**:
- User-specific document collections
- Save/unsave functionality
- Quick access to favorite documents

### Visit
**Purpose**: User visit logging and analytics  

```csharp
public class Visit
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? IPAddress { get; set; }
    public DateTime VisitTimestamp { get; set; }
    
    // Navigation properties
    public Users User { get; set; }
}
```

### History
**Purpose**: User activity and document interaction tracking  

**Activity Types**:
- Document views
- Downloads
- Searches
- Administrative actions

## 📝 View Models

### AddNewRecordViewModel
**Purpose**: Data transfer object for record creation/editing  

```csharp
public class AddNewRecordViewModel
{
    [Required]
    public string RegulationName { get; set; }
    
    public string? Description { get; set; }
    
    [Required]
    public string Department { get; set; }
    
    public string? DocumentType { get; set; }
    
    public string? Version { get; set; }
    
    public DateTime? VersionDate { get; set; }
    
    public DateTime? ApprovingDate { get; set; }
    
    public string? Notes { get; set; }
    
    // File upload properties
    public IFormFile? PdfFile { get; set; }
    public IFormFile? WordFile { get; set; }
    
    // Validation methods
    public bool IsValidForCreation() { /* validation logic */ }
    public bool IsValidForUpdate() { /* validation logic */ }
}
```

### ErrorViewModel
**Purpose**: Error handling and display  

```csharp
public class ErrorViewModel
{
    public string? RequestId { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
```

## 🔧 Model Configuration

### Oracle Database Configuration
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Oracle-specific configurations
    modelBuilder.Entity<AddNewRecord>(entity =>
    {
        entity.ToTable("RECORDS");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("RECORD_ID");
        // Additional column mappings
    });
}
```

### Relationship Configuration
```csharp
// One-to-Many: Record -> Attachments
modelBuilder.Entity<Attachment>()
    .HasOne(a => a.Record)
    .WithMany(r => r.Attachments)
    .HasForeignKey(a => a.RecordId);

// Many-to-Many: Users <-> Records (via SavedRecords)
modelBuilder.Entity<SavedRecord>()
    .HasKey(sr => new { sr.UserId, sr.RecordId });
```

### Index Configuration
```csharp
// Performance indexes
modelBuilder.Entity<AddNewRecord>()
    .HasIndex(r => r.Department);

modelBuilder.Entity<AddNewRecord>()
    .HasIndex(r => r.DocumentType);

modelBuilder.Entity<History>()
    .HasIndex(h => new { h.UserId, h.ActionDate });
```

## ✅ Validation Framework

### Data Annotations
```csharp
public class ContactInformation
{
    [Required(ErrorMessage = "Department is required")]
    [StringLength(100, ErrorMessage = "Department name too long")]
    public string Department { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? Email { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? Mobile { get; set; }
}
```

### Custom Validation Attributes
```csharp
public class ArabicTextAttribute : ValidationAttribute
{
    public override bool IsValid(object value)
    {
        if (value == null) return true;
        var text = value.ToString();
        return Regex.IsMatch(text, @"^[\u0600-\u06FF\s\d\p{P}]*$");
    }
}
```

### Business Logic Validation
```csharp
public class AddNewRecordViewModel : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (VersionDate > DateTime.Now)
        {
            yield return new ValidationResult(
                "Version date cannot be in the future",
                new[] { nameof(VersionDate) });
        }
        
        if (ApprovingDate.HasValue && ApprovingDate < VersionDate)
        {
            yield return new ValidationResult(
                "Approval date cannot be before version date",
                new[] { nameof(ApprovingDate) });
        }
    }
}
```

## 🔒 Security Considerations

### Data Protection
```csharp
// Sensitive data attributes
public class Users
{
    [PersonalData]
    public string Name { get; set; }
    
    [DataType(DataType.Password)]
    public string Password { get; set; }
}
```

### Input Sanitization
```csharp
public static class ModelExtensions
{
    public static string SanitizeInput(this string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        
        // Remove potentially dangerous characters
        return Regex.Replace(input, @"[<>""']", "");
    }
}
```

## 📊 Performance Optimization

### Query Optimization
```csharp
// Efficient loading strategies
public IQueryable<AddNewRecord> GetRecordsWithAttachments()
{
    return _context.AddNewRecords
        .Include(r => r.Attachments)
        .Where(r => r.IsActive);
}

// Pagination support
public async Task<PagedResult<AddNewRecord>> GetPagedRecordsAsync(int page, int size)
{
    var query = _context.AddNewRecords.OrderBy(r => r.CreatedAt);
    var total = await query.CountAsync();
    var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();
    
    return new PagedResult<AddNewRecord>(items, total, page, size);
}
```

### Caching Integration
```csharp
public class CachedRepository<T> where T : class
{
    private readonly IMemoryCache _cache;
    private readonly DbContext _context;
    
    public async Task<T> GetByIdAsync(int id)
    {
        var cacheKey = $"{typeof(T).Name}_{id}";
        
        if (_cache.TryGetValue(cacheKey, out T cachedItem))
            return cachedItem;
        
        var item = await _context.Set<T>().FindAsync(id);
        
        if (item != null)
        {
            _cache.Set(cacheKey, item, TimeSpan.FromMinutes(15));
        }
        
        return item;
    }
}
```

## 🧪 Testing Support

### Test Data Builders
```csharp
public class AddNewRecordBuilder
{
    private AddNewRecord _record = new AddNewRecord();
    
    public AddNewRecordBuilder WithName(string name)
    {
        _record.RegulationName = name;
        return this;
    }
    
    public AddNewRecordBuilder WithDepartment(string department)
    {
        _record.Department = department;
        return this;
    }
    
    public AddNewRecord Build() => _record;
}
```

### In-Memory Database Setup
```csharp
public class TestDbContext : RRdbContext
{
    public TestDbContext() : base(new DbContextOptionsBuilder<RRdbContext>()
        .UseInMemoryDatabase("TestDb").Options)
    {
    }
}
```

## 📈 Migration Management

### Migration Commands
```bash
# Create new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Generate SQL script
dotnet ef migrations script
```

### Seed Data
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Seed initial data
    modelBuilder.Entity<Users>().HasData(
        new Users { UserId = 1, Name = "admin", Role = "Admin", IsActive = true }
    );
}
```

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Entity Framework**: Core 9.0  
**Database**: Oracle Database 19c+
