# Page Number Integration with PDF Thumbnail Generation

## Overview
The page number field in the AddNewRecord form is now fully integrated with the PDF thumbnail generation system through the PDFController's GetThumbnail method.

## How It Works

### 1. Form Input
- **Field**: Thumbnail Page Number
- **Type**: Number input (1-999)
- **Default**: 2 (following existing PDFController logic)
- **Validation**: JavaScript validates the input is between 1-999
- **Description**: Specifies which page of the PDF to use for thumbnail generation

### 2. Data Flow
1. User enters page number in the AddNewRecord form
2. Form validates the page number client-side (1-999 range)
3. On form submission, the `PageNumber` value is captured in the `AddNewRecordViewModel`
4. AdminController saves the page number to the `ATTACHMENTS.TN_PAGE_NO` field when inserting PDF attachments
5. When thumbnails are requested via `/api/pdf/thumbnail?recordId={id}`, the PDFController retrieves the stored page number
6. PDFController generates thumbnail from the specified page

### 3. Database Schema
The page number is stored in the `ATTACHMENTS` table:
- Column: `TN_PAGE_NO` (NUMBER)
- Default: 2 (if not specified or invalid)
- Used by: PDFController.GetThumbnail method

### 4. API Integration
**Endpoint**: `GET /api/pdf/thumbnail?recordId={recordId}`
- Retrieves the `TN_PAGE_NO` from the database for the given record
- Validates the page exists in the PDF
- Generates thumbnail from the specified page
- Caches result with page-specific cache key: `thumbnail_{recordId}_page_{pageNumber}`

### 5. Error Handling
- If page number is out of range, uses the closest valid page (1 or max pages)
- If page number is invalid or missing, defaults to page 2
- Generates error images for missing files or conversion failures

### 6. Caching Strategy
- Cache keys include page numbers: `thumbnail_{recordId}_page_{pageNumber}`
- Multiple pages per record can be cached independently
- 30-minute cache expiration
- Clear cache endpoint supports page-specific clearing

## Code Changes Made

### 1. AddNewRecordViewModel.cs
```csharp
// Added property
public int PageNumber { get; set; } = 2;
```

### 2. AdminController.cs
```csharp
// Updated PDF attachment insertion to include page number
var insertPdfSql = "INSERT INTO ATTACHMENTS (ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, ORIGINAL_NAME, TN_PAGE_NO) " +
                  "VALUES (ATTACHMENTS_SEQ.NEXTVAL, :id, :fileType, :path, :ORIGINAL_NAME, :pageNumber)";
```

### 3. AddNewRecord.cshtml
```html
<!-- Updated field with proper binding and validation -->
<input type="number" class="form-control" name="PageNumber"
       min="1" max="999" value="2"
       title="Please enter the page number to use for PDF thumbnail (1-999)" 
       id="pageNumber" placeholder="2" required>
```

### 4. addnewrecord.js
```javascript
// Added page number validation function and event listeners
function validatePageNumber(input) {
  // Validates page number is between 1-999
}
```

## Usage Examples

### Creating a Record with Custom Thumbnail Page
1. User uploads a PDF with 10 pages
2. User wants thumbnail from page 5
3. User enters "5" in the "Thumbnail Page Number" field
4. System stores `TN_PAGE_NO = 5` in the database
5. Thumbnail API generates image from page 5

### API Usage
```
GET /api/pdf/thumbnail?recordId=123
// Returns thumbnail from the page number stored in the database for record 123
```

### Cache Management
```
POST /api/pdf/clear-cache?recordId=123&pageNumber=5
// Clears cache for specific page of specific record
```

## Benefits
1. **Flexibility**: Admins can choose the most representative page for thumbnails
2. **Consistency**: Page numbers are persistently stored and reused
3. **Performance**: Page-specific caching reduces redundant generation
4. **User Experience**: Clear interface with validation and helpful text
5. **API Compatibility**: Maintains backward compatibility with existing GetThumbnail API

## Future Enhancements
1. Preview thumbnail while selecting page number
2. Automatic suggestion of best page for thumbnail
3. Support for multiple thumbnail pages per record
4. Bulk page number updates for existing records
