using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using RulesRegulation.Services;

namespace RulesRegulation.Controllers
{
    [Authorize(Roles = "Admin,Editor")]
    public class ReportsController : Controller
    {
        private readonly string _connectionString;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IConfiguration configuration, ILogger<ReportsController> logger)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") ?? 
                              throw new ArgumentNullException("OracleConnection string not found");
            _logger = logger;
        }

        /// <summary>
        /// Main Report Page - Displays comprehensive analytics dashboard
        /// </summary>
        public async Task<IActionResult> ReportPage()
        {
            try
            {
                var reportData = await GetReportDataAsync();
                return View(reportData);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error loading report data: {ex.Message}. Please try again.";
                return RedirectToAction("AdminPage", "Admin");
            }
        }

        /// <summary>
        /// Get comprehensive report data from database
        /// </summary>
        private async Task<ReportViewModel> GetReportDataAsync()
        {
            var reportData = new ReportViewModel();

            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                // Get total statistics
                reportData.TotalDocuments = await GetTotalDocumentsAsync(connection);
                reportData.TotalUsers = await GetTotalUsersAsync(connection);
                reportData.TotalDownloads = await GetTotalDownloadsAsync(connection);
                reportData.TotalViews = await GetTotalViewsAsync(connection);

                // Get document statistics
                reportData.DocumentStats = await GetDocumentStatsAsync(connection);
                reportData.TopDownloaded = await GetTopDocumentsAsync(connection, "DOWNLOAD");
                reportData.TopViewed = await GetTopDocumentsAsync(connection, "VIEW");
                reportData.MostDetailsShown = await GetTopDocumentsAsync(connection, "SHOW_DETAILS");

                // Get user activity stats
                reportData.UserActivityStats = await GetUserActivityStatsAsync(connection);
                reportData.MonthlyStats = await GetMonthlyStatsAsync(connection);
                reportData.DocumentTypeDistribution = await GetDocumentTypeDistributionAsync(connection);

                // Get chart data
                reportData.MonthlyChartData = await GetMonthlyChartDataAsync(connection);
                reportData.TopRecordsChartData = await GetTopRecordsChartDataAsync(connection);
                reportData.TopDownloadsChartData = await GetTopDownloadsChartDataAsync(connection);
            }
            catch (Exception)
            {
                throw;
            }

            return reportData;
        }

        /// <summary>
        /// Get total number of documents
        /// </summary>
        private async Task<int> GetTotalDocumentsAsync(OracleConnection connection)
        {
            const string sql = "SELECT COUNT(*) FROM RECORDS";
            using var command = new OracleCommand(sql, connection);
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result ?? 0);
        }

        /// <summary>
        /// Get total number of users (distinct users from history)
        /// </summary>
        private async Task<int> GetTotalUsersAsync(OracleConnection connection)
        {
            const string sql = "SELECT COUNT(DISTINCT USER_ID) FROM USER_HISTORY";
            using var command = new OracleCommand(sql, connection);
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result ?? 0);
        }

        /// <summary>
        /// Get total downloads from history
        /// </summary>
        private async Task<int> GetTotalDownloadsAsync(OracleConnection connection)
        {
            const string sql = "SELECT COUNT(*) FROM USER_HISTORY WHERE UPPER(ACTION) = 'DOWNLOAD'";
            using var command = new OracleCommand(sql, connection);
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result ?? 0);
        }

        /// <summary>
        /// Get total views from history
        /// </summary>
        private async Task<int> GetTotalViewsAsync(OracleConnection connection)
        {
            const string sql = "SELECT COUNT(*) FROM USER_HISTORY WHERE UPPER(ACTION) = 'VIEW'";
            using var command = new OracleCommand(sql, connection);
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result ?? 0);
        }

        /// <summary>
        /// Get comprehensive document statistics
        /// </summary>
        private async Task<List<DocumentStat>> GetDocumentStatsAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT 
                    R.RECORD_ID as RECORD_ID,
                    R.REGULATION_NAME,
                    R.REGULATION_NAME_AR,
                    R.DOCUMENT_TYPE,
                    R.DEPARTMENT,
                    NVL(downloads.download_count, 0) as DOWNLOAD_COUNT,
                    NVL(views.view_count, 0) as VIEW_COUNT,
                    NVL(details.details_count, 0) as DETAILS_COUNT,
                    (NVL(downloads.download_count, 0) + NVL(views.view_count, 0) + NVL(details.details_count, 0)) as TOTAL_INTERACTIONS
                FROM RECORDS R
                LEFT JOIN (
                    SELECT RECORD_ID, COUNT(*) as download_count 
                    FROM USER_HISTORY 
                    WHERE UPPER(ACTION) = 'DOWNLOAD' 
                    GROUP BY RECORD_ID
                ) downloads ON R.RECORD_ID = downloads.RECORD_ID
                LEFT JOIN (
                    SELECT RECORD_ID, COUNT(*) as view_count 
                    FROM USER_HISTORY 
                    WHERE UPPER(ACTION) = 'VIEW' 
                    GROUP BY RECORD_ID
                ) views ON R.RECORD_ID = views.RECORD_ID
                LEFT JOIN (
                    SELECT RECORD_ID, COUNT(*) as details_count 
                    FROM USER_HISTORY 
                    WHERE UPPER(ACTION) = 'SHOW_DETAILS' 
                    GROUP BY RECORD_ID
                ) details ON R.RECORD_ID = details.RECORD_ID
                ORDER BY TOTAL_INTERACTIONS DESC";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var stats = new List<DocumentStat>();
            while (await reader.ReadAsync())
            {
                stats.Add(new DocumentStat
                {
                    RecordId = reader.GetInt32("RECORD_ID"),
                    RegulationName = reader.GetString("REGULATION_NAME"),
                    RegulationNameAr = reader.IsDBNull("REGULATION_NAME_AR") ? "" : reader.GetString("REGULATION_NAME_AR"),
                    DocumentType = reader.IsDBNull("DOCUMENT_TYPE") ? "" : reader.GetString("DOCUMENT_TYPE"),
                    Department = reader.IsDBNull("DEPARTMENT") ? "" : reader.GetString("DEPARTMENT"),
                    DownloadCount = reader.GetInt32("DOWNLOAD_COUNT"),
                    ViewCount = reader.GetInt32("VIEW_COUNT"),
                    DetailsCount = reader.GetInt32("DETAILS_COUNT"),
                    TotalInteractions = reader.GetInt32("TOTAL_INTERACTIONS")
                });
            }
            
            return stats;
        }

        /// <summary>
        /// Get top documents by action type
        /// </summary>
        private async Task<List<TopDocumentStat>> GetTopDocumentsAsync(OracleConnection connection, string actionType)
        {
            string sql = $@"
                SELECT * FROM (
                    SELECT 
                        R.REGULATION_NAME,
                        R.REGULATION_NAME_AR,
                        COUNT(*) as ACTION_COUNT
                    FROM USER_HISTORY H
                    JOIN RECORDS R ON H.RECORD_ID = R.RECORD_ID
                    WHERE UPPER(H.ACTION) = '{actionType.ToUpper()}'
                    GROUP BY R.REGULATION_NAME, R.REGULATION_NAME_AR
                    ORDER BY COUNT(*) DESC
                ) WHERE ROWNUM <= 5";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var topDocs = new List<TopDocumentStat>();
            while (await reader.ReadAsync())
            {
                topDocs.Add(new TopDocumentStat
                {
                    RegulationName = reader.GetString("REGULATION_NAME"),
                    RegulationNameAr = reader.IsDBNull("REGULATION_NAME_AR") ? "" : reader.GetString("REGULATION_NAME_AR"),
                    Count = reader.GetInt32("ACTION_COUNT"),
                    ActionType = actionType
                });
            }
            
            return topDocs;
        }

        /// <summary>
        /// Get user activity statistics
        /// </summary>
        private async Task<List<UserActivityStat>> GetUserActivityStatsAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT 
                    USER_ID,
                    COUNT(*) as TOTAL_ACTIONS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'DOWNLOAD' THEN 1 END) as DOWNLOADS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'VIEW' THEN 1 END) as VIEWS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'SHOW_DETAILS' THEN 1 END) as DETAILS_SHOWN,
                    MAX(ACTION_DATE) as LAST_ACTIVITY
                FROM USER_HISTORY
                GROUP BY USER_ID
                ORDER BY TOTAL_ACTIONS DESC";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var userStats = new List<UserActivityStat>();
            while (await reader.ReadAsync())
            {
                userStats.Add(new UserActivityStat
                {
                    UserId = reader.GetString("USER_ID"),
                    TotalActions = reader.GetInt32("TOTAL_ACTIONS"),
                    Downloads = reader.GetInt32("DOWNLOADS"),
                    Views = reader.GetInt32("VIEWS"),
                    DetailsShown = reader.GetInt32("DETAILS_SHOWN"),
                    LastActivity = reader.GetDateTime("LAST_ACTIVITY")
                });
            }
            
            return userStats;
        }

        /// <summary>
        /// Get monthly statistics for the last 12 months
        /// </summary>
        private async Task<List<MonthlyStat>> GetMonthlyStatsAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT 
                    TO_CHAR(ACTION_DATE, 'YYYY-MM') as MONTH_YEAR,
                    COUNT(*) as TOTAL_ACTIONS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'DOWNLOAD' THEN 1 END) as DOWNLOADS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'VIEW' THEN 1 END) as VIEWS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'SHOW_DETAILS' THEN 1 END) as DETAILS_SHOWN,
                    COUNT(DISTINCT USER_ID) as UNIQUE_USERS
                FROM USER_HISTORY
                WHERE ACTION_DATE >= ADD_MONTHS(SYSDATE, -12)
                GROUP BY TO_CHAR(ACTION_DATE, 'YYYY-MM')
                ORDER BY MONTH_YEAR";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var monthlyStats = new List<MonthlyStat>();
            while (await reader.ReadAsync())
            {
                monthlyStats.Add(new MonthlyStat
                {
                    MonthYear = reader.GetString("MONTH_YEAR"),
                    TotalActions = reader.GetInt32("TOTAL_ACTIONS"),
                    Downloads = reader.GetInt32("DOWNLOADS"),
                    Views = reader.GetInt32("VIEWS"),
                    DetailsShown = reader.GetInt32("DETAILS_SHOWN"),
                    UniqueUsers = reader.GetInt32("UNIQUE_USERS")
                });
            }
            
            return monthlyStats;
        }

        /// <summary>
        /// Get document type distribution
        /// </summary>
        private async Task<List<DocumentTypeDistribution>> GetDocumentTypeDistributionAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT 
                    DOCUMENT_TYPE,
                    COUNT(*) as DOCUMENT_COUNT,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM RECORDS)), 2) as PERCENTAGE
                FROM RECORDS
                WHERE DOCUMENT_TYPE IS NOT NULL
                GROUP BY DOCUMENT_TYPE
                ORDER BY DOCUMENT_COUNT DESC";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var distribution = new List<DocumentTypeDistribution>();
            while (await reader.ReadAsync())
            {
                distribution.Add(new DocumentTypeDistribution
                {
                    DocumentType = reader.GetString("DOCUMENT_TYPE"),
                    Count = reader.GetInt32("DOCUMENT_COUNT"),
                    Percentage = reader.GetDecimal("PERCENTAGE")
                });
            }
            
            return distribution;
        }

        /// <summary>
        /// Get monthly activity data for line chart
        /// </summary>
        private async Task<List<MonthlyChartData>> GetMonthlyChartDataAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT 
                    TO_CHAR(ACTION_DATE, 'YYYY-MM') as MONTH_YEAR,
                    COUNT(CASE WHEN UPPER(ACTION) = 'VIEW' THEN 1 END) as VIEWS,
                    COUNT(CASE WHEN UPPER(ACTION) = 'DOWNLOAD' THEN 1 END) as DOWNLOADS
                FROM USER_HISTORY
                WHERE ACTION_DATE >= ADD_MONTHS(SYSDATE, -6)
                GROUP BY TO_CHAR(ACTION_DATE, 'YYYY-MM')
                ORDER BY MONTH_YEAR";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var monthlyData = new List<MonthlyChartData>();
            while (await reader.ReadAsync())
            {
                monthlyData.Add(new MonthlyChartData
                {
                    MonthYear = reader.IsDBNull("MONTH_YEAR") ? DateTime.Now.ToString("yyyy-MM") : reader.GetString("MONTH_YEAR"),
                    Views = reader.GetInt32("VIEWS"),
                    Downloads = reader.GetInt32("DOWNLOADS")
                });
            }
            
            return monthlyData;
        }

        /// <summary>
        /// Get top 5 most viewed records for bar chart
        /// </summary>
        private async Task<List<TopRecordChartData>> GetTopRecordsChartDataAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT * FROM (
                    SELECT 
                        R.RECORD_ID as RECORD_ID,
                        R.REGULATION_NAME,
                        R.REGULATION_NAME_AR,
                        COUNT(CASE WHEN UPPER(H.ACTION) = 'VIEW' THEN 1 END) as VIEW_COUNT
                    FROM RECORDS R
                    LEFT JOIN USER_HISTORY H ON R.RECORD_ID = H.RECORD_ID
                    GROUP BY R.RECORD_ID, R.REGULATION_NAME, R.REGULATION_NAME_AR
                    ORDER BY VIEW_COUNT DESC
                ) WHERE ROWNUM <= 5";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var topRecords = new List<TopRecordChartData>();
            while (await reader.ReadAsync())
            {
                topRecords.Add(new TopRecordChartData
                {
                    RecordId = reader.GetInt32("RECORD_ID"),
                    Title = reader.IsDBNull("REGULATION_NAME") ? "Unknown" : reader.GetString("REGULATION_NAME"),
                    TitleAr = reader.IsDBNull("REGULATION_NAME_AR") ? "" : reader.GetString("REGULATION_NAME_AR"),
                    ViewCount = reader.GetInt32("VIEW_COUNT")
                });
            }
            
            return topRecords;
        }

        /// <summary>
        /// Get top 5 most downloaded records for bar chart
        /// </summary>
        private async Task<List<TopDownloadChartData>> GetTopDownloadsChartDataAsync(OracleConnection connection)
        {
            const string sql = @"
                SELECT * FROM (
                    SELECT 
                        R.RECORD_ID as RECORD_ID,
                        R.REGULATION_NAME,
                        R.REGULATION_NAME_AR,
                        COUNT(CASE WHEN UPPER(H.ACTION) = 'DOWNLOAD' THEN 1 END) as DOWNLOAD_COUNT
                    FROM RECORDS R
                    LEFT JOIN USER_HISTORY H ON R.RECORD_ID = H.RECORD_ID
                    GROUP BY R.RECORD_ID, R.REGULATION_NAME, R.REGULATION_NAME_AR
                    ORDER BY DOWNLOAD_COUNT DESC
                ) WHERE ROWNUM <= 5";

            using var command = new OracleCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var topDownloads = new List<TopDownloadChartData>();
            while (await reader.ReadAsync())
            {
                topDownloads.Add(new TopDownloadChartData
                {
                    RecordId = reader.GetInt32("RECORD_ID"),
                    Title = reader.IsDBNull("REGULATION_NAME") ? "Unknown" : reader.GetString("REGULATION_NAME"),
                    TitleAr = reader.IsDBNull("REGULATION_NAME_AR") ? "" : reader.GetString("REGULATION_NAME_AR"),
                    DownloadCount = reader.GetInt32("DOWNLOAD_COUNT")
                });
            }
            
            return topDownloads;
        }
    }

    // View Models for the report data
    public class ReportViewModel
    {
        public int TotalDocuments { get; set; }
        public int TotalUsers { get; set; }
        public int TotalDownloads { get; set; }
        public int TotalViews { get; set; }
        public List<DocumentStat> DocumentStats { get; set; } = new();
        public List<TopDocumentStat> TopDownloaded { get; set; } = new();
        public List<TopDocumentStat> TopViewed { get; set; } = new();
        public List<TopDocumentStat> MostDetailsShown { get; set; } = new();
        public List<UserActivityStat> UserActivityStats { get; set; } = new();
        public List<MonthlyStat> MonthlyStats { get; set; } = new();
        public List<DocumentTypeDistribution> DocumentTypeDistribution { get; set; } = new();
        public List<MonthlyChartData> MonthlyChartData { get; set; } = new();
        public List<TopRecordChartData> TopRecordsChartData { get; set; } = new();
        public List<TopDownloadChartData> TopDownloadsChartData { get; set; } = new();
    }

    public class DocumentStat
    {
        public int RecordId { get; set; }
        public string RegulationName { get; set; } = "";
        public string RegulationNameAr { get; set; } = "";
        public string DocumentType { get; set; } = "";
        public string Department { get; set; } = "";
        public int DownloadCount { get; set; }
        public int ViewCount { get; set; }
        public int DetailsCount { get; set; }
        public int TotalInteractions { get; set; }
    }

    public class TopDocumentStat
    {
        public string RegulationName { get; set; } = "";
        public string RegulationNameAr { get; set; } = "";
        public int Count { get; set; }
        public string ActionType { get; set; } = "";
    }

    public class UserActivityStat
    {
        public string UserId { get; set; } = "";
        public int TotalActions { get; set; }
        public int Downloads { get; set; }
        public int Views { get; set; }
        public int DetailsShown { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class MonthlyStat
    {
        public string MonthYear { get; set; } = "";
        public int TotalActions { get; set; }
        public int Downloads { get; set; }
        public int Views { get; set; }
        public int DetailsShown { get; set; }
        public int UniqueUsers { get; set; }
    }

    public class DocumentTypeDistribution
    {
        public string DocumentType { get; set; } = "";
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class MonthlyChartData
    {
        public string MonthYear { get; set; } = "";
        public int Views { get; set; }
        public int Downloads { get; set; }
    }

    public class TopRecordChartData
    {
        public int RecordId { get; set; }
        public string Title { get; set; } = "";
        public string TitleAr { get; set; } = "";
        public int ViewCount { get; set; }
    }

    public class TopDownloadChartData
    {
        public int RecordId { get; set; }
        public string Title { get; set; } = "";
        public string TitleAr { get; set; } = "";
        public int DownloadCount { get; set; }
    }
}
