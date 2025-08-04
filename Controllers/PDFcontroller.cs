using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using Oracle.ManagedDataAccess.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using PDFtoImage;
using SkiaSharp;
using System.Data;
using PDFThumbnailGenerator.Web.Services;
using PDFThumbnailGenerator.Web.Data;

namespace PDFThumbnailGenerator.Web.Services
{
    /// <summary>
    /// PDF to Image converter service for web applications
    /// Converts second page of PDFs to 1200x1273 resolution images
    /// </summary>
    public interface IPdfImageService
    {
        Task<string> ConvertSecondPageToImageAsync(string pdfFilePath);
        Task<byte[]> ConvertSecondPageToImageBytesAsync(string pdfFilePath);
        bool ValidatePdfPageCount(string pdfFilePath);
        int GetPdfPageCount(string pdfFilePath);
    }

    public class PdfImageService : IPdfImageService
    {
        private readonly string _outputDirectory;

        public PdfImageService(string outputDirectory = null)
        {
            _outputDirectory = outputDirectory ?? Path.Combine(Path.GetTempPath(), "PDFImages");
            Directory.CreateDirectory(_outputDirectory);
        }

        public async Task<string> ConvertSecondPageToImageAsync(string pdfFilePath)
        {
            if (!File.Exists(pdfFilePath))
                throw new FileNotFoundException($"PDF file not found: {pdfFilePath}");

            var fileName = Path.GetFileNameWithoutExtension(pdfFilePath);
            var outputPath = Path.Combine(_outputDirectory, $"{fileName}_page_2_{DateTime.Now:yyyyMMdd_HHmmss}.png");

            await GenerateSecondPageImageAsync(pdfFilePath, outputPath, 1200, 1273);
            return outputPath;
        }

        public async Task<byte[]> ConvertSecondPageToImageBytesAsync(string pdfFilePath)
        {
            if (!File.Exists(pdfFilePath))
                throw new FileNotFoundException($"PDF file not found: {pdfFilePath}");

            return await GenerateSecondPageImageBytesAsync(pdfFilePath, 1200, 1273);
        }

        public bool ValidatePdfPageCount(string pdfFilePath)
        {
            try
            {
                if (!File.Exists(pdfFilePath)) return false;

                using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
                var pageCount = Conversion.GetPageCount(fileStream);
                return pageCount >= 2;
            }
            catch
            {
                return false;
            }
        }

        public int GetPdfPageCount(string pdfFilePath)
        {
            try
            {
                if (!File.Exists(pdfFilePath)) return 0;

                using var fileStream = new FileStream(pdfFilePath, FileMode.Open, FileAccess.Read);
                return Conversion.GetPageCount(fileStream);
            }
            catch
            {
                return 0;
            }
        }

        private async Task GenerateSecondPageImageAsync(string pdfPath, string outputPath, int targetWidth, int targetHeight)
        {
            await Task.Run(() =>
            {
                try
                {
                    using var fileStream = new FileStream(pdfPath, FileMode.Open, FileAccess.Read);
                    using var originalBitmap = Conversion.ToImage(fileStream, page: 1); // Page index 1 = second page
                    
                    using var surface = SKSurface.Create(new SKImageInfo(targetWidth, targetHeight));
                    var canvas = surface.Canvas;
                    canvas.Clear(SKColors.White);
                    
                    // Calculate scaling to fit within target dimensions while maintaining aspect ratio
                    float scaleX = (float)targetWidth / originalBitmap.Width;
                    float scaleY = (float)targetHeight / originalBitmap.Height;
                    float scale = Math.Min(scaleX, scaleY);
                    
                    int scaledWidth = (int)(originalBitmap.Width * scale);
                    int scaledHeight = (int)(originalBitmap.Height * scale);
                    
                    // Center the image
                    int offsetX = (targetWidth - scaledWidth) / 2;
                    int offsetY = (targetHeight - scaledHeight) / 2;
                    
                    // Draw the scaled image centered on the canvas
                    var destRect = new SKRect(offsetX, offsetY, offsetX + scaledWidth, offsetY + scaledHeight);
                    canvas.DrawBitmap(originalBitmap, destRect, new SKPaint
                    {
                        FilterQuality = SKFilterQuality.High,
                        IsAntialias = true
                    });
                    
                    // Save the final image
                    using var finalImage = surface.Snapshot();
                    using var data = finalImage.Encode(SKEncodedImageFormat.Png, 95);
                    using var stream = File.OpenWrite(outputPath);
                    data.SaveTo(stream);
                }
                catch (Exception ex)
                {
                    CreateErrorImage(outputPath, Path.GetFileNameWithoutExtension(pdfPath), ex.Message, targetWidth, targetHeight);
                }
            });
        }

        private async Task<byte[]> GenerateSecondPageImageBytesAsync(string pdfPath, int targetWidth, int targetHeight)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using var fileStream = new FileStream(pdfPath, FileMode.Open, FileAccess.Read);
                    using var originalBitmap = Conversion.ToImage(fileStream, page: 1);
                    
                    using var surface = SKSurface.Create(new SKImageInfo(targetWidth, targetHeight));
                    var canvas = surface.Canvas;
                    canvas.Clear(SKColors.White);
                    
                    float scaleX = (float)targetWidth / originalBitmap.Width;
                    float scaleY = (float)targetHeight / originalBitmap.Height;
                    float scale = Math.Min(scaleX, scaleY);
                    
                    int scaledWidth = (int)(originalBitmap.Width * scale);
                    int scaledHeight = (int)(originalBitmap.Height * scale);
                    
                    int offsetX = (targetWidth - scaledWidth) / 2;
                    int offsetY = (targetHeight - scaledHeight) / 2;
                    
                    var destRect = new SKRect(offsetX, offsetY, offsetX + scaledWidth, offsetY + scaledHeight);
                    canvas.DrawBitmap(originalBitmap, destRect, new SKPaint
                    {
                        FilterQuality = SKFilterQuality.High,
                        IsAntialias = true
                    });
                    
                    using var finalImage = surface.Snapshot();
                    using var data = finalImage.Encode(SKEncodedImageFormat.Png, 95);
                    return data.ToArray();
                }
                catch
                {
                    return CreateErrorImageBytes(targetWidth, targetHeight);
                }
            });
        }

        private void CreateErrorImage(string outputPath, string fileName, string errorMessage, int width, int height)
        {
            using var surface = SKSurface.Create(new SKImageInfo(width, height));
            var canvas = surface.Canvas;
            canvas.Clear(SKColors.White);
            
            using var borderPaint = new SKPaint { Color = SKColors.Red, Style = SKPaintStyle.Stroke, StrokeWidth = 4 };
            canvas.DrawRect(4, 4, width - 8, height - 8, borderPaint);
            
            using var textPaint = new SKPaint { Color = SKColors.Black, TextSize = 24, IsAntialias = true };
            canvas.DrawText("PDF Rendering Error", 40, 80, textPaint);
            canvas.DrawText($"File: {fileName}", 40, 120, textPaint);
            
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 90);
            using var stream = File.OpenWrite(outputPath);
            data.SaveTo(stream);
        }

        private byte[] CreateErrorImageBytes(int width, int height)
        {
            using var surface = SKSurface.Create(new SKImageInfo(width, height));
            var canvas = surface.Canvas;
            canvas.Clear(SKColors.White);
            
            using var borderPaint = new SKPaint { Color = SKColors.Red, Style = SKPaintStyle.Stroke, StrokeWidth = 4 };
            canvas.DrawRect(4, 4, width - 8, height - 8, borderPaint);
            
            using var textPaint = new SKPaint { Color = SKColors.Black, TextSize = 24, IsAntialias = true };
            canvas.DrawText("PDF Rendering Error", 40, 80, textPaint);
            
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 90);
            return data.ToArray();
        }
    }
}

namespace PDFThumbnailGenerator.Web.Data
{
    /// <summary>
    /// Data access layer for PDF file operations
    /// </summary>
    public interface IPdfDataService
    {
        Task<List<string>> GetPdfFilePathsAsync();
        Task<string> GetPdfFilePathByRecordIdAsync(int recordId);
        Task<string> GetPdfFilePathByFileNameAsync(string fileName);
        Task<List<PdfFileInfo>> GetPdfFileInfosAsync();
    }

    public class PdfFileInfo
    {
        public int AttachmentId { get; set; }
        public int RecordId { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public DateTime CreatedDate { get; set; }
        public long FileSize { get; set; }
    }

    public class PdfDataService : IPdfDataService
    {
        private readonly string _connectionString;

        public PdfDataService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<List<string>> GetPdfFilePathsAsync()
        {
            var filePaths = new List<string>();
            
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = "SELECT FilePath FROM ATTACHMENTS WHERE UPPER(FileName) LIKE '%.PDF'";
            using var command = new OracleCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                var filePath = reader.GetString("FilePath");
                if (!string.IsNullOrEmpty(filePath))
                    filePaths.Add(filePath);
            }
            
            return filePaths;
        }

        public async Task<string> GetPdfFilePathByRecordIdAsync(int recordId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = "SELECT FilePath FROM ATTACHMENTS WHERE ATTACHMENT_ID = :recordId AND UPPER(FileName) LIKE '%.PDF'";
            using var command = new OracleCommand(query, connection);
            command.Parameters.Add(new OracleParameter("recordId", OracleDbType.Int32, recordId, System.Data.ParameterDirection.Input));
            
            var result = await command.ExecuteScalarAsync();
            return result?.ToString() ?? "";
        }

        public async Task<string> GetPdfFilePathByFileNameAsync(string fileName)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = "SELECT FilePath FROM ATTACHMENTS WHERE FileName = :fileName AND UPPER(FileName) LIKE '%.PDF' AND ROWNUM = 1";
            using var command = new OracleCommand(query, connection);
            command.Parameters.Add(new OracleParameter("fileName", OracleDbType.Varchar2, fileName, System.Data.ParameterDirection.Input));
            
            var result = await command.ExecuteScalarAsync();
            return result?.ToString() ?? "";
        }

        public async Task<List<PdfFileInfo>> GetPdfFileInfosAsync()
        {
            var fileInfos = new List<PdfFileInfo>();
            
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"SELECT ATTACHMENT_ID, RECORD_ID, FilePath, FileName, CreatedDate, FileSize 
                         FROM ATTACHMENTS 
                         WHERE UPPER(FileName) LIKE '%.PDF' 
                         ORDER BY CreatedDate DESC";
            
            using var command = new OracleCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                fileInfos.Add(new PdfFileInfo
                {
                    AttachmentId = reader.GetInt32("ATTACHMENT_ID"),
                    RecordId = reader.GetInt32("RECORD_ID"),
                    FilePath = reader.GetString("FilePath"),
                    FileName = reader.GetString("FileName"),
                    CreatedDate = reader.GetDateTime("CreatedDate"),
                    FileSize = reader.GetInt64("FileSize")
                });
            }
            
            return fileInfos;
        }
    }
}

namespace PDFThumbnailGenerator.Web.Controllers
{
    /// <summary>
    /// API Controller for PDF to Image conversion operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PDFController : ControllerBase
    {
        private readonly IPdfImageService _pdfImageService;
        private readonly IPdfDataService _pdfDataService;

        public PDFController(IPdfImageService pdfImageService, IPdfDataService pdfDataService)
        {
            _pdfImageService = pdfImageService;
            _pdfDataService = pdfDataService;
        }

        /// <summary>
        /// Convert all PDFs from ATTACHMENTS table to images
        /// GET: api/pdf/convert
        /// </summary>
        [HttpGet("convert")]
        public async Task<IActionResult> ConvertPdfsToImages()
        {
            try
            {
                var pdfFilePaths = await _pdfDataService.GetPdfFilePathsAsync();
                var imageResults = new List<object>();

                foreach (var filePath in pdfFilePaths)
                {
                    try
                    {
                        if (_pdfImageService.ValidatePdfPageCount(filePath))
                        {
                            var imagePath = await _pdfImageService.ConvertSecondPageToImageAsync(filePath);
                            imageResults.Add(new
                            {
                                OriginalPath = filePath,
                                ImagePath = imagePath,
                                FileName = Path.GetFileNameWithoutExtension(filePath),
                                Success = true,
                                PageCount = _pdfImageService.GetPdfPageCount(filePath)
                            });
                        }
                        else
                        {
                            imageResults.Add(new
                            {
                                OriginalPath = filePath,
                                ImagePath = "",
                                FileName = Path.GetFileNameWithoutExtension(filePath),
                                Success = false,
                                Error = "PDF has less than 2 pages",
                                PageCount = _pdfImageService.GetPdfPageCount(filePath)
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        imageResults.Add(new
                        {
                            OriginalPath = filePath,
                            ImagePath = "",
                            FileName = Path.GetFileNameWithoutExtension(filePath),
                            Success = false,
                            Error = ex.Message,
                            PageCount = 0
                        });
                    }
                }

                return Ok(imageResults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Get image as byte array for direct display by RECORD_ID
        /// GET: api/pdf/{recordId}
        /// </summary>
        [HttpGet("{recordId:int}")]
        public async Task<IActionResult> GetImageByRecordId(int recordId)
        {
            try
            {
                var pdfFilePath = await _pdfDataService.GetPdfFilePathByRecordIdAsync(recordId);
                if (string.IsNullOrEmpty(pdfFilePath) || !System.IO.File.Exists(pdfFilePath))
                    return NotFound("PDF file not found");

                var imageBytes = await _pdfImageService.ConvertSecondPageToImageBytesAsync(pdfFilePath);
                return File(imageBytes, "image/png", $"page_2_record_{recordId}.png");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Get image by filename
        /// GET: api/pdf/byname/{fileName}
        /// </summary>
        [HttpGet("byname/{fileName}")]
        public async Task<IActionResult> GetImageByFileName(string fileName)
        {
            try
            {
                var pdfFilePath = await _pdfDataService.GetPdfFilePathByFileNameAsync(fileName);
                if (string.IsNullOrEmpty(pdfFilePath) || !System.IO.File.Exists(pdfFilePath))
                    return NotFound("PDF file not found");

                var imageBytes = await _pdfImageService.ConvertSecondPageToImageBytesAsync(pdfFilePath);
                return File(imageBytes, "image/png", $"{fileName}_page_2.png");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Get all PDF file information from ATTACHMENTS table
        /// GET: api/pdf/files
        /// </summary>
        [HttpGet("files")]
        public async Task<IActionResult> GetPdfFiles()
        {
            try
            {
                var pdfFiles = await _pdfDataService.GetPdfFileInfosAsync();
                
                var result = pdfFiles.Select(pdf => new
                {
                    pdf.AttachmentId,
                    pdf.RecordId,
                    pdf.FileName,
                    pdf.CreatedDate,
                    pdf.FileSize,
                    PageCount = _pdfImageService.GetPdfPageCount(pdf.FilePath),
                    HasSecondPage = _pdfImageService.ValidatePdfPageCount(pdf.FilePath),
                    ImageUrl = $"/api/pdf/{pdf.RecordId}"
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Batch convert specific RECORD_IDs
        /// POST: api/pdf/batch
        /// </summary>
        [HttpPost("batch")]
        public async Task<IActionResult> BatchConvertPdfs([FromBody] List<int> recordIds)
        {
            try
            {
                var results = new List<object>();

                foreach (var recordId in recordIds)
                {
                    try
                    {
                        var pdfFilePath = await _pdfDataService.GetPdfFilePathByRecordIdAsync(recordId);
                        if (string.IsNullOrEmpty(pdfFilePath) || !System.IO.File.Exists(pdfFilePath))
                        {
                            results.Add(new { RecordId = recordId, Success = false, Error = "PDF file not found" });
                            continue;
                        }

                        if (_pdfImageService.ValidatePdfPageCount(pdfFilePath))
                        {
                            var imagePath = await _pdfImageService.ConvertSecondPageToImageAsync(pdfFilePath);
                            results.Add(new
                            {
                                RecordId = recordId,
                                Success = true,
                                ImagePath = imagePath,
                                FileName = Path.GetFileNameWithoutExtension(pdfFilePath)
                            });
                        }
                        else
                        {
                            results.Add(new { RecordId = recordId, Success = false, Error = "PDF has less than 2 pages" });
                        }
                    }
                    catch (Exception ex)
                    {
                        results.Add(new { RecordId = recordId, Success = false, Error = ex.Message });
                    }
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}

namespace PDFThumbnailGenerator.Web.Configuration
{
    /// <summary>
    /// Dependency injection configuration
    /// </summary>
    public static class ServiceConfiguration
    {
        public static void ConfigurePdfServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register services
            services.AddScoped<IPdfImageService>(provider => 
                new PdfImageService(configuration.GetValue<string>("PdfImageOutputPath")));
            
            services.AddScoped<IPdfDataService, PdfDataService>();
            
            // Configure output directory
            var outputPath = configuration.GetValue<string>("PdfImageOutputPath") 
                ?? Path.Combine(Path.GetTempPath(), "PDFImages");
            Directory.CreateDirectory(outputPath);
        }
    }

    /// <summary>
    /// Oracle-specific database helper methods
    /// </summary>
    public static class OracleDbHelper
    {
        /// <summary>
        /// Execute a scalar query with Oracle parameters
        /// </summary>
        public static async Task<T> ExecuteScalarAsync<T>(string connectionString, string query, params OracleParameter[] parameters)
        {
            using var connection = new OracleConnection(connectionString);
            await connection.OpenAsync();
            
            using var command = new OracleCommand(query, connection);
            if (parameters != null)
                command.Parameters.AddRange(parameters);
            
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? default(T) : (T)result;
        }

        /// <summary>
        /// Execute a reader query with Oracle parameters
        /// </summary>
        public static async Task<List<T>> ExecuteReaderAsync<T>(string connectionString, string query, 
            Func<OracleDataReader, T> mapper, params OracleParameter[] parameters)
        {
            var results = new List<T>();
            
            using var connection = new OracleConnection(connectionString);
            await connection.OpenAsync();
            
            using var command = new OracleCommand(query, connection);
            if (parameters != null)
                command.Parameters.AddRange(parameters);
            
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(mapper(reader));
            }
            
            return results;
        }

        /// <summary>
        /// Create Oracle parameter with proper type mapping
        /// </summary>
        public static OracleParameter CreateParameter(string name, object value)
        {
            return value switch
            {
                int intValue => new OracleParameter(name, OracleDbType.Int32, intValue, System.Data.ParameterDirection.Input),
                string stringValue => new OracleParameter(name, OracleDbType.Varchar2, stringValue, System.Data.ParameterDirection.Input),
                DateTime dateValue => new OracleParameter(name, OracleDbType.Date, dateValue, System.Data.ParameterDirection.Input),
                long longValue => new OracleParameter(name, OracleDbType.Int64, longValue, System.Data.ParameterDirection.Input),
                _ => new OracleParameter(name, value)
            };
        }
    }
}