using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using PDFtoImage;
using SkiaSharp;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;

namespace RulesRegulation.Controllers
{
    [ApiController]
    [Route("api/pdf")] 
    public class PDFController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private readonly ILogger<PDFController> _logger;
        private readonly string _connectionString; // This will be initialized in constructor

        public PDFController(IConfiguration configuration, IMemoryCache cache, ILogger<PDFController> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Fix the null reference warning
            _connectionString = _configuration.GetConnectionString("OracleConnection")
                ?? throw new InvalidOperationException("Oracle connection string not found.");
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            _logger.LogInformation("PDF Controller test endpoint called");
            return Ok(new
            {
                message = "PDF Controller is working",
                timestamp = DateTime.Now,
                connectionStringExists = !string.IsNullOrEmpty(_connectionString)
            });
        }

        [HttpGet("thumbnail")]
        public async Task<IActionResult> GetThumbnail([FromQuery] int recordId)
        {
            try
            {
                _logger.LogInformation($"=== PDF Thumbnail Request Started for recordId: {recordId} ===");

                if (recordId <= 0)
                {
                    _logger.LogWarning($"Invalid recordId: {recordId}");
                    return File(CreateErrorImageBytes("Invalid record ID"), "image/png", $"error_{recordId}.png");
                }

                // Get PDF file path and page number from database
                var (pdfFilePath, pageNumber) = await GetPdfFilePathAndPageFromDatabase(recordId);

                if (string.IsNullOrEmpty(pdfFilePath))
                {
                    _logger.LogWarning($"No PDF found in database for recordId: {recordId}");
                    return File(CreateErrorImageBytes("PDF not found for this record"), "image/png", $"error_{recordId}.png");
                }

                _logger.LogInformation($"PDF file path for recordId {recordId}: {pdfFilePath}, Page: {pageNumber}");

                // Check cache first (include page number in cache key)
                var cacheKey = $"thumbnail_{recordId}_page_{pageNumber}";
                if (_cache.TryGetValue(cacheKey, out byte[]? cachedThumbnail) && cachedThumbnail != null)
                {
                    _logger.LogInformation($"Returning cached thumbnail for recordId: {recordId}, page: {pageNumber}");
                    return File(cachedThumbnail, "image/png", $"thumbnail_{recordId}_page_{pageNumber}.png");
                }

                // Check if file exists on server
                if (!System.IO.File.Exists(pdfFilePath))
                {
                    _logger.LogWarning($"PDF file does not exist: {pdfFilePath}");
                    return File(CreateErrorImageBytes("PDF file not found on server"), "image/png", $"error_{recordId}.png");
                }

                // Validate that the PDF has the requested page
                var totalPages = GetPdfPageCount(pdfFilePath);
                if (totalPages == 0)
                {
                    _logger.LogWarning($"Unable to read PDF or PDF has no pages: {pdfFilePath}");
                    return File(CreateErrorImageBytes("Unable to read PDF file"), "image/png", $"error_{recordId}.png");
                }

                // Adjust page number if it's out of range
                var targetPage = Math.Max(1, Math.Min(pageNumber, totalPages));
                if (targetPage != pageNumber)
                {
                    _logger.LogWarning($"Requested page {pageNumber} is out of range for PDF with {totalPages} pages. Using page {targetPage}.");
                }

                // Convert specified page to thumbnail (convert to 0-based index for PDFtoImage library)
                var thumbnailBytes = await ConvertPageToThumbnail(pdfFilePath, targetPage - 1);

                // Cache for 30 minutes (include page number in cache key)
                _cache.Set(cacheKey, thumbnailBytes, TimeSpan.FromMinutes(30));

                _logger.LogInformation($"Successfully generated thumbnail for recordId: {recordId}, page: {targetPage}");
                return File(thumbnailBytes, "image/png", $"thumbnail_{recordId}_page_{targetPage}.png");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating thumbnail for recordId: {recordId}");
                return File(CreateErrorImageBytes($"Error: {ex.Message}"), "image/png", $"error_{recordId}.png");
            }
        }

        [HttpPost("clear-cache")]
        public IActionResult ClearThumbnailCache([FromQuery] int recordId, [FromQuery] int? pageNumber = null)
        {
            try
            {
                if (pageNumber.HasValue)
                {
                    // Clear cache for specific page
                    var cacheKey = $"thumbnail_{recordId}_page_{pageNumber.Value}";
                    _cache.Remove(cacheKey);
                    _logger.LogInformation($"Cleared thumbnail cache for recordId: {recordId}, page: {pageNumber.Value}");
                    return Ok(new { success = true, message = $"Cache cleared for record {recordId}, page {pageNumber.Value}" });
                }
                else
                {
                    // Clear cache for all pages of this record (this is more complex, would require tracking all cached pages)
                    // For now, we'll just clear the old cache key format for backward compatibility
                    var oldCacheKey = $"thumbnail_{recordId}";
                    _cache.Remove(oldCacheKey);
                    _logger.LogInformation($"Cleared thumbnail cache for recordId: {recordId} (old format)");
                    return Ok(new { success = true, message = $"Cache cleared for record {recordId}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error clearing cache for recordId: {recordId}");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private async Task<(string filePath, int pageNumber)> GetPdfFilePathAndPageFromDatabase(int recordId)
        {
            try
            {
                _logger.LogInformation($"Querying database for recordId: {recordId}");
                
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var query = @"SELECT FILE_PATH, 
                                    COALESCE(TN_PAGE_NO, 2) as TN_PAGE_NO 
                             FROM ATTACHMENTS 
                             WHERE RECORD_ID = :recordId 
                             AND (UPPER(FILE_TYPE) LIKE '%PDF%' OR UPPER(FILE_PATH) LIKE '%.PDF')";
                
                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter("recordId", OracleDbType.Int32, recordId, System.Data.ParameterDirection.Input));

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var filePath = reader["FILE_PATH"]?.ToString() ?? "";
                    var pageNumber = Convert.ToInt32(reader["TN_PAGE_NO"]);
                    
                    _logger.LogInformation($"Raw file path from database: '{filePath}', Page: {pageNumber}");
                    
                    if (string.IsNullOrEmpty(filePath))
                    {
                        return ("", 1);
                    }
                    
                    // Fix the path resolution
                    string finalPath = "";
                    
                    if (Path.IsPathRooted(filePath))
                    {
                        // It's an absolute path, use as-is
                        finalPath = filePath;
                    }
                    else
                    {
                        // It's a relative path, combine with wwwroot
                        // First, normalize the path separators and remove leading slashes/tildes
                        var cleanPath = filePath.Replace('/', Path.DirectorySeparatorChar)
                                              .Replace('\\', Path.DirectorySeparatorChar)
                                              .TrimStart('~', '/', '\\');
                        
                        var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                        finalPath = Path.Combine(webRootPath, cleanPath);
                    }
                    
                    _logger.LogInformation($"Final file path: '{finalPath}' - Exists: {System.IO.File.Exists(finalPath)}, Page: {pageNumber}");
                    return (finalPath, pageNumber);
                }
                
                return ("", 1);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error querying database for recordId: {recordId}");
                return ("", 1);
            }
        }

        private int GetPdfPageCount(string pdfFilePath)
        {
            try
            {
                using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
#pragma warning disable CA1416 // Validate platform compatibility
                var pageCount = Conversion.GetPageCount(fileStream);
#pragma warning restore CA1416 // Validate platform compatibility
                _logger.LogInformation($"PDF {pdfFilePath} has {pageCount} pages");
                return pageCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking page count for: {pdfFilePath}");
                return 0;
            }
        }

        private async Task<byte[]> ConvertPageToThumbnail(string pdfFilePath, int pageIndex)
        {
            return await Task.Run(() =>
            {
                try
                {
                    _logger.LogInformation($"Converting page {pageIndex + 1} of PDF to thumbnail: {pdfFilePath}");

                    using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
                    using var originalBitmap = Conversion.ToImage(fileStream, page: pageIndex);

                    return CreateThumbnailFromBitmap(originalBitmap);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error converting page {pageIndex + 1} of PDF: {pdfFilePath}");
                    return CreateErrorImageBytes($"PDF conversion failed for page {pageIndex + 1}");
                }
            });
        }

        // Keep these methods for backward compatibility
        private bool ValidatePdfHasSecondPage(string pdfFilePath)
        {
            return GetPdfPageCount(pdfFilePath) >= 2;
        }

        private async Task<byte[]> ConvertFirstPageToThumbnail(string pdfFilePath)
        {
            return await ConvertPageToThumbnail(pdfFilePath, 0);
        }

        private async Task<byte[]> ConvertSecondPageToThumbnail(string pdfFilePath)
        {
            return await ConvertPageToThumbnail(pdfFilePath, 1);
        }

        // Helper method to reduce code duplication
        private byte[] CreateThumbnailFromBitmap(SKBitmap originalBitmap)
        {
            // Create 1200x1273 canvas
            using var surface = SKSurface.Create(new SKImageInfo(1200, 1273));
            var canvas = surface.Canvas;
            canvas.Clear(SKColors.White);

            // Calculate scaling to fit within 1200x1273 while maintaining aspect ratio
            float scaleX = 1200f / originalBitmap.Width;
            float scaleY = 1273f / originalBitmap.Height;
            float scale = Math.Min(scaleX, scaleY);

            int scaledWidth = (int)(originalBitmap.Width * scale);
            int scaledHeight = (int)(originalBitmap.Height * scale);

            // Center the image
            int offsetX = (1200 - scaledWidth) / 2;
            int offsetY = (1273 - scaledHeight) / 2;

            // Draw the scaled image centered on the canvas
            var destRect = new SKRect(offsetX, offsetY, offsetX + scaledWidth, offsetY + scaledHeight);

            // Use modern SkiaSharp methods
            using var paint = new SKPaint
            {
                IsAntialias = true
            };

            canvas.DrawBitmap(originalBitmap, destRect, paint);

            // Convert to PNG bytes with high quality
            using var finalImage = surface.Snapshot();
            using var data = finalImage.Encode(SKEncodedImageFormat.Png, 95);

            return data.ToArray();
        }

        private byte[] CreateErrorImageBytes(string errorMessage)
        {
            using var surface = SKSurface.Create(new SKImageInfo(1200, 1273));
            var canvas = surface.Canvas;

            // Create professional error image
            canvas.Clear(SKColors.White);

            // Draw border
            using var borderPaint = new SKPaint
            {
                Color = SKColors.LightGray,
                Style = SKPaintStyle.Stroke,
                StrokeWidth = 3
            };
            canvas.DrawRect(10, 10, 1190, 1263, borderPaint);

            // Use modern SkiaSharp font methods
            using var titleFont = new SKFont(SKTypeface.Default, 48);
            using var titlePaint = new SKPaint
            {
                Color = SKColors.DarkGray,
                IsAntialias = true
            };

            using var messageFont = new SKFont(SKTypeface.Default, 24);
            using var messagePaint = new SKPaint
            {
                Color = SKColors.Gray,
                IsAntialias = true
            };

            // Center the content
            canvas.DrawText("📄", 570, 400, titleFont, titlePaint);
            canvas.DrawText("PDF Thumbnail", 450, 500, titleFont, titlePaint);
            canvas.DrawText("Not Available", 480, 560, titleFont, titlePaint);

            // Error message
            var wrappedMessage = WrapText(errorMessage, 50);
            var lines = wrappedMessage.Split('\n');
            float startY = 650;

            foreach (var line in lines)
            {
                canvas.DrawText(line, 100, startY, messageFont, messagePaint);
                startY += 35;
            }

            // Footer
            using var footerFont = new SKFont(SKTypeface.Default, 18);
            using var footerPaint = new SKPaint
            {
                Color = SKColors.LightGray,
                IsAntialias = true
            };
            canvas.DrawText("Rules & Regulation System", 450, 1200, footerFont, footerPaint);

            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 90);
            return data.ToArray();
        }

        private string WrapText(string text, int maxCharsPerLine)
        {
            if (string.IsNullOrEmpty(text) || text.Length <= maxCharsPerLine)
                return text;

            var words = text.Split(' ');
            var lines = new List<string>();
            var currentLine = "";

            foreach (var word in words)
            {
                if ((currentLine + word).Length <= maxCharsPerLine)
                {
                    currentLine += (currentLine.Length > 0 ? " " : "") + word;
                }
                else
                {
                    if (!string.IsNullOrEmpty(currentLine))
                        lines.Add(currentLine);
                    currentLine = word;
                }
            }

            if (!string.IsNullOrEmpty(currentLine))
                lines.Add(currentLine);

            return string.Join("\n", lines);
        }
    }
}