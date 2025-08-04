using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using RulesRegulation.Data;
using PDFiumSharp;

using System.Drawing;
using System.Drawing.Imaging;
using System.Data;
using Oracle.ManagedDataAccess.Client;

namespace Rules_Regulation.Controllers
{
    [ApiController]
    [Route("api/pdf")]
    public class PdfController : ControllerBase
    {
        private readonly DatabaseConnection _context;
        private readonly IMemoryCache _memoryCache;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<PdfController> _logger;

        public PdfController(
            DatabaseConnection context, 
            IMemoryCache memoryCache, 
            IWebHostEnvironment environment,
            ILogger<PdfController> logger)
        {
            _context = context;
            _memoryCache = memoryCache;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet("thumbnail/{id}")]
        public async Task<IActionResult> GetThumbnail(int id)
        {
            // Input validation
            if (id <= 0)
                return BadRequest("Invalid ID");

            // Check cache first
            string cacheKey = $"pdf_thumbnail_{id}";
            if (_memoryCache.TryGetValue(cacheKey, out byte[]? cachedThumbnail) && cachedThumbnail != null)
            {
                return File(cachedThumbnail, "image/jpeg");
            }

            try
            {
                // Get attachment record from database using SQL query
                var attachment = await GetAttachmentByIdAsync(id);
                if (attachment == null)
                {
                    _logger?.LogWarning($"Attachment with ID {id} not found");
                    return File(CreatePlaceholderThumbnail(), "image/jpeg");
                }

                // Validate file type
#pragma warning disable CS8604 // Possible null reference argument.
                if (!IsPdfFile(attachment.FileType, attachment.FilePath))
                {
                    _logger?.LogWarning($"File {attachment.FilePath} is not a PDF");
                    return File(CreatePlaceholderThumbnail(), "image/jpeg");
                }
#pragma warning restore CS8604 // Possible null reference argument.

                // Get full file path and validate existence
                string fullPath = GetFullFilePath(attachment.FilePath);
                if (!System.IO.File.Exists(fullPath))
                {
                    _logger?.LogWarning($"PDF file not found at path: {fullPath}");
                    return File(CreatePlaceholderThumbnail(), "image/jpeg");
                }

                // Generate thumbnail
                byte[] thumbnailBytes = await GeneratePdfThumbnailAsync(fullPath);
                
                // Cache for 1 hour
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1),
                    Priority = CacheItemPriority.Normal
                };
                _memoryCache.Set(cacheKey, thumbnailBytes, cacheOptions);
                
                return File(thumbnailBytes, "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error generating thumbnail for attachment ID {id}");
                return File(CreatePlaceholderThumbnail(), "image/jpeg");
            }
        }

        private async Task<AttachmentModel?> GetAttachmentByIdAsync(int id)
{
    try
    {
        string query = @"
            SELECT ATTACHMENT_ID, RECORD_ID, FILE_TYPE, FILE_PATH, UPLOAD_DATE 
            FROM ATTACHMENTS 
            WHERE ATTACHMENT_ID = :id";

        var parameter = DatabaseConnection.CreateParameter(":id", id);
        var dataTable = await _context.ExecuteQueryAsync(query, parameter);

        if (dataTable.Rows.Count == 0)
            return null;

        var row = dataTable.Rows[0];
        return new AttachmentModel
        {
            ID = Convert.ToInt32(row["ATTACHMENT_ID"]),
            AddnewrecordID = Convert.ToInt32(row["RECORD_ID"]),
            FileType = row["FILE_TYPE"]?.ToString(),
            FilePath = row["FILE_PATH"]?.ToString(),
            UploadDate = Convert.ToDateTime(row["UPLOAD_DATE"])
        };
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, $"Error fetching attachment with ID {id}");
        return null;
    }
}
private async Task<byte[]> GeneratePdfThumbnailAsync(string filePath)
{
    try
    {
        if (!System.IO.File.Exists(filePath))
        {
            _logger?.LogWarning($"PDF file does not exist: {filePath}");
            return CreatePlaceholderThumbnail();
        }

        return await Task.Run(() => GeneratePdfThumbnailFromFile(filePath));
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, $"Error accessing PDF file: {filePath}");
        return CreatePlaceholderThumbnail();
    }
}

private byte[] GeneratePdfThumbnailFromFile(string filePath)
{
    try
    {
        // Use PdfDocument constructor - PDFiumSharpV2
        using var document = new PdfDocument(filePath);
        
        // Check if document has pages using Pages collection
        if (document.Pages.Count == 0)
        {
            _logger?.LogWarning("PDF document has no pages");
            return CreatePlaceholderThumbnail();
        }

        // Get first page using indexer
        var page = document.Pages[0];
        if (page == null)
        {
            _logger?.LogWarning("Could not get first page of PDF");
            return CreatePlaceholderThumbnail();
        }

        // Calculate dimensions maintaining aspect ratio
        int thumbnailWidth = 200;
        int thumbnailHeight = (int)(thumbnailWidth * page.Height / page.Width);
        
        // Limit height to reasonable size
        if (thumbnailHeight > 300)
        {
            thumbnailHeight = 300;
            thumbnailWidth = (int)(thumbnailHeight * page.Width / page.Height);
        }

        // Render page to bitmap
        using var pdfBitmap = new PDFiumBitmap(thumbnailWidth, thumbnailHeight, true);
        page.Render(pdfBitmap);
        
        // Convert PDFiumBitmap to System.Drawing.Bitmap
        var bitmap = PDFiumBitmapToBitmap(pdfBitmap, thumbnailWidth, thumbnailHeight);
        
        if (bitmap == null)
        {
            _logger?.LogWarning("Failed to render PDF page to bitmap");
            return CreatePlaceholderThumbnail();
        }

        // Convert bitmap to byte array
        using var stream = new MemoryStream();
        bitmap.Save(stream, ImageFormat.Jpeg);
        bitmap.Dispose();
        return stream.ToArray();
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "Error generating PDF thumbnail: " + ex.Message);
        return CreatePlaceholderThumbnail();
    }
}

        private Bitmap? PDFiumBitmapToBitmap(PDFiumBitmap pdfBitmap, int width, int height)
        {
            try
            {
                var bitmap = new Bitmap(width, height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
                
                var bitmapData = bitmap.LockBits(
                    new Rectangle(0, 0, width, height),
                    ImageLockMode.WriteOnly,
                    System.Drawing.Imaging.PixelFormat.Format32bppArgb);

                try
                {
                    // Copy data from PDFiumBitmap to System.Drawing.Bitmap
                    var sourcePtr = pdfBitmap.Scan0;
                    var destPtr = bitmapData.Scan0;
                    var bytes = Math.Abs(bitmapData.Stride) * height;
                    
                    unsafe
                    {
                        System.Buffer.MemoryCopy(sourcePtr.ToPointer(), destPtr.ToPointer(), bytes, bytes);
                    }
                }
                finally
                {
                    bitmap.UnlockBits(bitmapData);
                }

                return bitmap;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error converting PDFiumBitmap to Bitmap");
                return null;
            }
        }

        private byte[] CreatePlaceholderThumbnail()
        {
            Bitmap? bitmap = null;
            Graphics? graphics = null;
            
            try
            {
                bitmap = new Bitmap(200, 250);
                graphics = Graphics.FromImage(bitmap);
                
                graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                
                graphics.Clear(Color.FromArgb(245, 245, 245));
                
                using var borderPen = new Pen(Color.FromArgb(200, 200, 200), 2);
                graphics.DrawRectangle(borderPen, 1, 1, bitmap.Width - 2, bitmap.Height - 2);
                
                using var font = new Font("Arial", 14, FontStyle.Bold);
                using var brush = new SolidBrush(Color.FromArgb(100, 100, 100));
                
                string text = "PDF";
                var textSize = graphics.MeasureString(text, font);
                float x = (bitmap.Width - textSize.Width) / 2;
                float y = (bitmap.Height - textSize.Height) / 2;
                
                graphics.DrawString(text, font, brush, x, y);
                
                using var stream = new MemoryStream();
                bitmap.Save(stream, ImageFormat.Jpeg);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating placeholder thumbnail");
                return new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46 };
            }
            finally
            {
                graphics?.Dispose();
                bitmap?.Dispose();
            }
        }

        private bool IsPdfFile(string? fileType, string filePath)
        {
            if (!string.IsNullOrEmpty(fileType) && fileType.ToLower().Contains("pdf"))
                return true;
                
            return !string.IsNullOrEmpty(filePath) && 
                   Path.GetExtension(filePath).ToLower() == ".pdf";
        }

        private string GetFullFilePath(string relativePath)
        {
            string cleanPath = relativePath.TrimStart('~', '/', '\\');
            
            string fullPath = Path.Combine(_environment.WebRootPath, cleanPath);
            if (System.IO.File.Exists(fullPath))
                return fullPath;
            
            fullPath = Path.Combine(_environment.ContentRootPath, cleanPath);
            if (System.IO.File.Exists(fullPath))
                return fullPath;
            
            return Path.Combine(_environment.WebRootPath, cleanPath);
        }
    }

    public class AttachmentModel
    {
        public int ID { get; set; }
        public int AddnewrecordID { get; set; }
        public string? FileType { get; set; }
        public string? FilePath { get; set; }
        public DateTime UploadDate { get; set; }
    }
}