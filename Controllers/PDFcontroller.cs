using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using PDFtoImage;
using SkiaSharp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RulesRegulation.Controllers
{
    /// <summary>
    /// PDF Thumbnail Controller for Rules-Regulation Project
    /// Converts second page of PDF attachments to 1200x1273 thumbnails
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PDFController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public PDFController(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("OracleConnection");
        }

        /// <summary>
        /// Get PDF thumbnail for a specific record
        /// GET: /api/pdf/thumbnail?recordId=123
        /// </summary>
        /// <param name="recordId">The record ID to get PDF thumbnail for</param>
        /// <returns>PNG image of the second page thumbnail</returns>
        [HttpGet("thumbnail")]
        public async Task<IActionResult> GetThumbnail([FromQuery] int recordId)
        {
            try
            {
                // Get PDF file path from database
                var pdfFilePath = await GetPdfFilePathFromDatabase(recordId);
                
                if (string.IsNullOrEmpty(pdfFilePath))
                {
                    return File(CreateErrorImageBytes("PDF not found for this record"), "image/png", $"error_{recordId}.png");
                }

                // Check if file exists on server
                if (!System.IO.File.Exists(pdfFilePath))
                {
                    return File(CreateErrorImageBytes("PDF file not found on server"), "image/png", $"error_{recordId}.png");
                }

                // Check if PDF has at least 2 pages
                if (!ValidatePdfHasSecondPage(pdfFilePath))
                {
                    return File(CreateErrorImageBytes("PDF has less than 2 pages"), "image/png", $"error_{recordId}.png");
                }

                // Convert second page to thumbnail
                var thumbnailBytes = await ConvertSecondPageToThumbnail(pdfFilePath);
                
                return File(thumbnailBytes, "image/png", $"thumbnail_{recordId}.png");
            }
            catch (Exception ex)
            {
                // Log the error (you can inject ILogger if needed)
                // _logger.LogError(ex, "Error generating thumbnail for recordId: {RecordId}", recordId);
                
                return File(CreateErrorImageBytes($"Error: {ex.Message}"), "image/png", $"error_{recordId}.png");
            }
        }

        /// <summary>
        /// Get PDF file path from ATTACHMENTS table using record ID
        /// </summary>
        private async Task<string> GetPdfFilePathFromDatabase(int recordId)
        {
            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var query = "SELECT FILE_PATH FROM ATTACHMENTS WHERE RECORD_ID = :recordId AND (UPPER(FILE_TYPE) LIKE '%PDF%' OR UPPER(FILE_PATH) LIKE '%.PDF')";
                using var command = new OracleCommand(query, connection);
                command.Parameters.Add(new OracleParameter("recordId", OracleDbType.Int32, recordId, System.Data.ParameterDirection.Input));

                var result = await command.ExecuteScalarAsync();
                var filePath = result?.ToString() ?? "";
                
                // If the path is relative, make it absolute
                if (!string.IsNullOrEmpty(filePath) && !Path.IsPathRooted(filePath))
                {
                    // Adjust this path based on where your PDFs are stored
                    filePath = Path.Combine("wwwroot", filePath.TrimStart('~', '/', '\\'));
                }
                
                return filePath;
            }
            catch (Exception ex)
            {
                // Consider logging the exception
                return "";
            }
        }

        /// <summary>
        /// Validate if PDF has at least 2 pages
        /// </summary>
        private bool ValidatePdfHasSecondPage(string pdfFilePath)
        {
            try
            {
                using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
                var pageCount = Conversion.GetPageCount(fileStream);
                return pageCount >= 2;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Convert second page of PDF to 1200x1273 thumbnail
        /// </summary>
        private async Task<byte[]> ConvertSecondPageToThumbnail(string pdfFilePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
                    using var originalBitmap = Conversion.ToImage(fileStream, page: 1); // Page index 1 = second page
                    
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
                    canvas.DrawBitmap(originalBitmap, destRect, new SKPaint
                    {
                        FilterQuality = SKFilterQuality.High,
                        IsAntialias = true
                    });
                    
                    // Convert to PNG bytes with high quality
                    using var finalImage = surface.Snapshot();
                    using var data = finalImage.Encode(SKEncodedImageFormat.Png, 95);
                    return data.ToArray();
                }
                catch
                {
                    return CreateErrorImageBytes("PDF conversion failed");
                }
            });
        }

        /// <summary>
        /// Create error image bytes for various error scenarios
        /// </summary>
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
            
            // Draw main error icon and text
            using var titlePaint = new SKPaint 
            { 
                Color = SKColors.DarkGray, 
                TextSize = 48, 
                IsAntialias = true,
                Typeface = SKTypeface.Default
            };
            
            using var messagePaint = new SKPaint 
            { 
                Color = SKColors.Gray, 
                TextSize = 24, 
                IsAntialias = true,
                Typeface = SKTypeface.Default
            };
            
            // Center the content
            canvas.DrawText("📄", 570, 400, titlePaint); // PDF icon
            canvas.DrawText("PDF Thumbnail", 450, 500, titlePaint);
            canvas.DrawText("Not Available", 480, 560, titlePaint);
            
            // Error message
            var wrappedMessage = WrapText(errorMessage, 50);
            var lines = wrappedMessage.Split('\n');
            float startY = 650;
            
            foreach (var line in lines)
            {
                canvas.DrawText(line, 100, startY, messagePaint);
                startY += 35;
            }
            
            // Footer
            using var footerPaint = new SKPaint 
            { 
                Color = SKColors.LightGray, 
                TextSize = 18, 
                IsAntialias = true 
            };
            canvas.DrawText("Rules & Regulation System", 450, 1200, footerPaint);
            
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 90);
            return data.ToArray();
        }

        /// <summary>
        /// Wrap text to fit within specified character limit
        /// </summary>
        private string WrapText(string text, int maxCharsPerLine)
        {
            if (string.IsNullOrEmpty(text) || text.Length <= maxCharsPerLine)
                return text;

            var words = text.Split(' ');
            var lines = new System.Collections.Generic.List<string>();
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

// Extension method for Startup.cs or Program.cs
namespace RulesRegulation.Extensions
{
    public static class ServiceExtensions
    {
        /// <summary>
        /// Configure PDF services and required dependencies
        /// Add this to your Startup.cs ConfigureServices method
        /// </summary>
        public static void AddPdfServices(this IServiceCollection services)
        {
            // No additional services needed for this implementation
            // PDFtoImage and Oracle.ManagedDataAccess are used directly in controller
        }
    }
}