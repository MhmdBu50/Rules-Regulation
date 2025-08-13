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
        public string? EntityNameAr { get; set; } // Arabic version of entity name
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserNameAr { get; set; } // Arabic version of user name
        public string UserRole { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? ChangesSummary { get; set; }
        public string? ChangesSummaryAr { get; set; } // Arabic version of changes summary
        public DateTime ActionTimestamp { get; set; }
        public string? IpAddress { get; set; }
        public string? Details { get; set; }
        public string? DetailsAr { get; set; } // Arabic version of details
        
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
        
        // Language-aware display helpers
        public string GetDisplayUserName(bool isArabic = false)
        {
            if (isArabic && !string.IsNullOrEmpty(UserNameAr))
                return UserNameAr;
            return UserName;
        }
        
        public string GetDisplayEntityName(bool isArabic = false)
        {
            if (isArabic && !string.IsNullOrEmpty(EntityNameAr))
                return EntityNameAr;
            return EntityName ?? "Unknown";
        }
        
        public string GetDisplayDetails(bool isArabic = false)
        {
            if (isArabic && !string.IsNullOrEmpty(DetailsAr))
                return DetailsAr;
            return Details ?? "";
        }
        
        public string GetDisplayChangesSummary(bool isArabic = false)
        {
            // If we have an Arabic-specific summary, use it
            if (isArabic && !string.IsNullOrEmpty(ChangesSummaryAr))
                return ChangesSummaryAr;
            
            // Generate dynamic summary using appropriate language
            if (!string.IsNullOrEmpty(ActionType) && !string.IsNullOrEmpty(EntityType))
            {
                var entityName = GetDisplayEntityName(isArabic);
                var summary = GenerateDynamicSummary(ActionType, EntityType, entityName, isArabic);
                if (!string.IsNullOrEmpty(summary))
                    return summary;
            }
            
            // Fall back to existing summary and translate if in Arabic
            var existingSummary = ChangesSummary;
            if (!string.IsNullOrEmpty(existingSummary))
            {
                if (isArabic)
                {
                    return TranslateSummaryToArabic(existingSummary);
                }
                return existingSummary;
            }
            
            // Fall back to details if available
            if (!string.IsNullOrEmpty(Details) && ActionType == "Edit") 
                return GetDisplayDetails(isArabic);
                
            return isArabic ? "لا توجد تفاصيل تغييرات متاحة" : "No changes details available";
        }
        
        private string GenerateDynamicSummary(string actionType, string entityType, string entityName, bool isArabic)
        {
            if (isArabic)
            {
                // Generate Arabic summary directly
                return actionType.ToLower() switch
                {
                    "add" or "create" => $"تم إنشاء {GetEntityTypeInArabic(entityType)}: {entityName}",
                    "edit" or "update" => $"تم تحديث {GetEntityTypeInArabic(entityType)}: {entityName}",
                    "delete" or "remove" => $"تم حذف {GetEntityTypeInArabic(entityType)}: {entityName}",
                    "view" or "read" => $"تم عرض {GetEntityTypeInArabic(entityType)}: {entityName}",
                    "approve" => $"تم اعتماد {GetEntityTypeInArabic(entityType)}: {entityName}",
                    "reject" => $"تم رفض {GetEntityTypeInArabic(entityType)}: {entityName}",
                    _ => $"تم تنفيذ {actionType} على {GetEntityTypeInArabic(entityType)}: {entityName}"
                };
            }
            else
            {
                // Generate English summary
                return actionType.ToLower() switch
                {
                    "add" or "create" => $"{entityType} created: {entityName}",
                    "edit" or "update" => $"{entityType} updated: {entityName}",
                    "delete" or "remove" => $"{entityType} deleted: {entityName}",
                    "view" or "read" => $"{entityType} viewed: {entityName}",
                    "approve" => $"{entityType} approved: {entityName}",
                    "reject" => $"{entityType} rejected: {entityName}",
                    _ => $"{actionType} performed on {entityType}: {entityName}"
                };
            }
        }
        
        private string GetEntityTypeInArabic(string entityType)
        {
            return entityType.ToLower() switch
            {
                "record" => "السجل",
                "contact" => "جهة الاتصال",
                "user" => "المستخدم",
                "admin" => "المدير",
                "document" => "المستند",
                "file" => "الملف",
                "attachment" => "المرفق",
                "regulation" => "اللائحة",
                "policy" => "السياسة",
                "guideline" => "الدليل الإرشادي",
                _ => entityType
            };
        }
        
        private string TranslateSummaryToArabic(string englishSummary)
        {
            if (string.IsNullOrEmpty(englishSummary))
                return englishSummary;
                
            // Common patterns translation - more comprehensive
            var translations = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                // Basic CRUD operations
                { "Record created", "تم إنشاء السجل" },
                { "Record updated", "تم تحديث السجل" },
                { "Record deleted", "تم حذف السجل" },
                { "User created", "تم إنشاء المستخدم" },
                { "User updated", "تم تحديث المستخدم" },
                { "User deleted", "تم حذف المستخدم" },
                { "Contact created", "تم إنشاء جهة الاتصال" },
                { "Contact updated", "تم تحديث جهة الاتصال" },
                { "Contact deleted", "تم حذف جهة الاتصال" },
                
                // Authentication related
                { "Login successful", "تم تسجيل الدخول بنجاح" },
                { "Login failed", "فشل تسجيل الدخول" },
                { "Logout", "تم تسجيل الخروج" },
                { "Password changed", "تم تغيير كلمة المرور" },
                { "Profile updated", "تم تحديث الملف الشخصي" },
                
                // File operations
                { "File uploaded", "تم رفع الملف" },
                { "File deleted", "تم حذف الملف" },
                { "Document attached", "تم إرفاق المستند" },
                { "Attachment removed", "تم إزالة المرفق" },
                
                // System operations
                { "Settings updated", "تم تحديث الإعدادات" },
                { "Configuration changed", "تم تغيير التكوين" },
                { "System backup created", "تم إنشاء نسخة احتياطية" },
                
                // Common verbs and actions
                { "created", "تم إنشاؤه" },
                { "updated", "تم تحديثه" },
                { "deleted", "تم حذفه" },
                { "modified", "تم تعديله" },
                { "added", "تم إضافته" },
                { "removed", "تم إزالته" },
                { "changed", "تم تغييره" },
                { "edited", "تم تحريره" },
                
                // Entity types
                { "regulation", "اللائحة" },
                { "policy", "السياسة" },
                { "guideline", "الدليل الإرشادي" },
                { "document", "المستند" },
                { "attachment", "المرفق" },
                { "file", "الملف" },
                
                // Common phrases
                { "successfully", "بنجاح" },
                { "failed", "فشل" },
                { "completed", "اكتمل" },
                { "in progress", "قيد التنفيذ" },
                { "pending", "في الانتظار" },
                { "approved", "معتمد" },
                { "rejected", "مرفوض" }
            };
            
            // Check for exact matches first
            if (translations.ContainsKey(englishSummary))
            {
                return translations[englishSummary];
            }
            
            // Check for partial matches and replace
            var result = englishSummary;
            foreach (var translation in translations.OrderByDescending(t => t.Key.Length))
            {
                if (result.Contains(translation.Key, StringComparison.OrdinalIgnoreCase))
                {
                    result = result.Replace(translation.Key, translation.Value, StringComparison.OrdinalIgnoreCase);
                }
            }
            
            return result;
        }
        
        public bool IsAdminAction => UserRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        public bool HasChanges => !string.IsNullOrEmpty(ChangesSummary) || (!string.IsNullOrEmpty(Details) && ActionType == "Edit");
        public bool HasDetails => !string.IsNullOrEmpty(Details);
        /// <summary>
        /// Returns the display name for the entity, using contact.NameAr if entity is Contact, otherwise EntityNameAr/EntityName
        /// </summary>
        /// <param name="contactNameAr">Arabic name for contact (if available)</param>
        /// <param name="isArabic">Whether to return Arabic name</param>
        public string GetDisplayEntityNameSmart(string? contactNameAr = null, bool isArabic = false)
        {
            if (EntityType.Equals("Contact", StringComparison.OrdinalIgnoreCase))
            {
                if (isArabic && !string.IsNullOrEmpty(contactNameAr))
                    return contactNameAr;
                // fallback to EntityNameAr if available
                if (isArabic && !string.IsNullOrEmpty(EntityNameAr))
                    return EntityNameAr;
                // fallback to EntityName
                return EntityName ?? "Unknown";
            }
            else
            {
                if (isArabic && !string.IsNullOrEmpty(EntityNameAr))
                    return EntityNameAr;
                return EntityName ?? "Unknown";
            }
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
