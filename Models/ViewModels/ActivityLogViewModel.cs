using RulesRegulation.Models.Entities;

namespace RulesRegulation.Models.ViewModels
{
    /// <summary>
    /// ViewModel for the Activity Log page with filtering and pagination
    /// </summary>
    public class ActivityLogViewModel
    {
        public IEnumerable<ActivityLogEntry> ActivityLogs { get; set; } = new List<ActivityLogEntry>();
        
        // Filtering properties
        public string? ActionTypeFilter { get; set; }
        public string? EntityTypeFilter { get; set; }
        public string? UserRoleFilter { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SearchTerm { get; set; }
        
        // Pagination properties
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        
        // Summary statistics
        public int TotalActions { get; set; }
        public int AdminActionsCount { get; set; }
        public int EditorActionsCount { get; set; }
        public int RecordActionsCount { get; set; }
        public int ContactActionsCount { get; set; }
    }

    /// <summary>
    /// Detailed activity log entry for display
    /// </summary>
    public class ActivityLogEntry
    {
        public int LogId { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string? EntityName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? ChangesSummary { get; set; }
        public DateTime ActionTimestamp { get; set; }
        public string? IpAddress { get; set; }
        public string? Details { get; set; }
        
        // Display helpers
        public string FormattedTimestamp => ActionTimestamp.ToString("yyyy-MM-dd HH:mm:ss");
        public string ActionDisplayName => ActionType switch
        {
            "Add" => "Added",
            "Edit" => "Edited", 
            "Delete" => "Deleted",
            _ => ActionType
        };
        public string EntityDisplayName => EntityType switch
        {
            "Record" => "Record",
            "Contact" => "Contact Info",
            _ => EntityType
        };
        public bool IsAdminAction => UserRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        public bool HasChanges => !string.IsNullOrEmpty(ChangesSummary) || (!string.IsNullOrEmpty(Details) && ActionType == "Edit");
        public bool HasDetails => !string.IsNullOrEmpty(Details);
        
        // Generate changes summary from the Details field for existing data or from old/new values
        public string GetChangesSummary()
        {
            if (!string.IsNullOrEmpty(ChangesSummary)) return ChangesSummary;
            if (!string.IsNullOrEmpty(Details) && ActionType == "Edit") return Details;
            return "No changes details available";
        }
    }

    /// <summary>
    /// ViewModel for exporting activity logs
    /// </summary>
    public class ExportActivityLogViewModel
    {
        public string? ActionTypeFilter { get; set; }
        public string? EntityTypeFilter { get; set; }
        public string? UserRoleFilter { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SearchTerm { get; set; }
        public string ExportFormat { get; set; } = "CSV"; // CSV, Excel
    }
}
