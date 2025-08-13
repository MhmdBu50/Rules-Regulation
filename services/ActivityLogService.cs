using Oracle.ManagedDataAccess.Client;
using RulesRegulation.Models.Entities;
using RulesRegulation.Models.ViewModels;
using System.Data;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace RulesRegulation.Services
{
    /// <summary>
    /// Service for managing activity logs in Oracle database
    /// </summary>
    public class ActivityLogService
    {
        private readonly string _connectionString;
        private readonly ILogger _logger;

        public ActivityLogService(string connectionString, ILogger logger)
        {
            _connectionString = connectionString;
            _logger = logger;
        }

        /// <summary>
        /// Log an activity performed by a privileged user
        /// </summary>
        public async Task<bool> LogActivityAsync(string actionType, string entityType, int? entityId, 
            string? entityName, int userId, string userName, string userRole, 
            object? oldValues = null, object? newValues = null, string? changesSummary = null, 
            string? ipAddress = null, string? details = null)
        {
            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();
                async Task<int> InsertNewSchema()
                {
                    var sql = @"
                        INSERT INTO ACTIVITY_LOGS (
                            USER_ID, USER_NAME, USER_ROLE, ACTION_TYPE, ENTITY_TYPE, 
                            ENTITY_ID, ENTITY_NAME, ACTION_TIMESTAMP, OLD_VALUES, NEW_VALUES, DETAILS
                        ) VALUES (
                            :userId, :userName, :userRole, :actionType, :entityType,
                            :entityId, :entityName, :ts, :oldVals, :newVals, :details
                        )";
                    using var cmd = new OracleCommand(sql, connection);
                    cmd.BindByName = true;
                    cmd.Parameters.Add(":userId", userId);
                    cmd.Parameters.Add(":userName", userName);
                    cmd.Parameters.Add(":userRole", userRole);
                    cmd.Parameters.Add(":actionType", actionType);
                    cmd.Parameters.Add(":entityType", entityType);
                    cmd.Parameters.Add(":entityId", entityId ?? 0);
                    cmd.Parameters.Add(":entityName", string.IsNullOrWhiteSpace(entityName) ? (object)DBNull.Value : entityName);
                    cmd.Parameters.Add(":ts", DateTime.UtcNow);
                    cmd.Parameters.Add(":oldVals", oldValues != null ? JsonSerializer.Serialize(oldValues) : (object)DBNull.Value);
                    cmd.Parameters.Add(":newVals", newValues != null ? JsonSerializer.Serialize(newValues) : (object)DBNull.Value);
                    cmd.Parameters.Add(":details", changesSummary ?? details ?? (object)DBNull.Value);
                    return await cmd.ExecuteNonQueryAsync();
                }

                async Task<int> InsertOldSchema()
                {
                    var sql = @"
                        INSERT INTO ACTIVITY_LOGS (
                            USER_ID, USER_NAME, USER_ROLE, ACTION_TYPE, ENTITY_TYPE, 
                            ENTITY_ID, ENTITY_NAME, TIMESTAMP, BEFORE_DATA, AFTER_DATA, DETAILS
                        ) VALUES (
                            :userId, :userName, :userRole, :actionType, :entityType,
                            :entityId, :entityName, :ts, :oldVals, :newVals, :details
                        )";
                    using var cmd = new OracleCommand(sql, connection);
                    cmd.BindByName = true;
                    cmd.Parameters.Add(":userId", userId);
                    cmd.Parameters.Add(":userName", userName);
                    cmd.Parameters.Add(":userRole", userRole);
                    cmd.Parameters.Add(":actionType", actionType);
                    cmd.Parameters.Add(":entityType", entityType);
                    cmd.Parameters.Add(":entityId", entityId ?? 0);
                    cmd.Parameters.Add(":entityName", string.IsNullOrWhiteSpace(entityName) ? (object)DBNull.Value : entityName);
                    cmd.Parameters.Add(":ts", DateTime.UtcNow);
                    cmd.Parameters.Add(":oldVals", oldValues != null ? JsonSerializer.Serialize(oldValues) : (object)DBNull.Value);
                    cmd.Parameters.Add(":newVals", newValues != null ? JsonSerializer.Serialize(newValues) : (object)DBNull.Value);
                    cmd.Parameters.Add(":details", changesSummary ?? details ?? (object)DBNull.Value);
                    return await cmd.ExecuteNonQueryAsync();
                }

                try
                {
                    var res = await InsertNewSchema();
                    return res > 0;
                }
                catch (OracleException oex) when (oex.Number == 904) // ORA-00904 invalid identifier
                {
                    _logger.LogWarning(oex, "LogActivityAsync: Falling back to old schema columns for insert");
                    var res = await InsertOldSchema();
                    return res > 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging activity for user {UserId} - {ActionType} {EntityType}", userId, actionType, entityType);
                return false;
            }
        }

        /// <summary>
        /// Get filtered activity logs with pagination
        /// </summary>
        public async Task<(IEnumerable<ActivityLogEntry> logs, int totalCount)> GetActivityLogsAsync(
            string? actionTypeFilter = null, string? entityTypeFilter = null, string? userRoleFilter = null,
            DateTime? startDate = null, DateTime? endDate = null, string? searchTerm = null,
            int page = 1, int pageSize = 20)
        {
            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var whereConditions = new List<string>();
                var parameters = new List<OracleParameter>();

                // Note: use typed getters for numeric columns to avoid OracleDecimal cast issues

                // Build WHERE clause based on filters
                if (!string.IsNullOrEmpty(actionTypeFilter))
                {
                    whereConditions.Add("UPPER(ACTION_TYPE) = UPPER(:actionType)");
                    parameters.Add(new OracleParameter(":actionType", actionTypeFilter));
                }

                if (!string.IsNullOrEmpty(entityTypeFilter))
                {
                    whereConditions.Add("UPPER(ENTITY_TYPE) = UPPER(:entityType)");
                    parameters.Add(new OracleParameter(":entityType", entityTypeFilter));
                }

                if (!string.IsNullOrEmpty(userRoleFilter))
                {
                    whereConditions.Add("UPPER(USER_ROLE) = UPPER(:userRole)");
                    parameters.Add(new OracleParameter(":userRole", userRoleFilter));
                }

                if (startDate.HasValue)
                {
                    // Use ACTION_TIMESTAMP by default; we'll also try TIMESTAMP as a fallback
                    whereConditions.Add("ACTION_TIMESTAMP >= :startDate");
                    parameters.Add(new OracleParameter(":startDate", startDate.Value));
                }

                if (endDate.HasValue)
                {
                    whereConditions.Add("ACTION_TIMESTAMP <= :endDate");
                    parameters.Add(new OracleParameter(":endDate", endDate.Value.AddDays(1).AddSeconds(-1)));
                }

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    whereConditions.Add("(UPPER(ENTITY_NAME) LIKE UPPER(:searchTerm) OR UPPER(USER_NAME) LIKE UPPER(:searchTerm) OR UPPER(DETAILS) LIKE UPPER(:searchTerm))");
                    parameters.Add(new OracleParameter(":searchTerm", $"%{searchTerm}%"));
                }

                var whereClause = whereConditions.Count > 0 ? "WHERE " + string.Join(" AND ", whereConditions) : string.Empty;
                var whereClauseOld = whereClause.Replace("ACTION_TIMESTAMP", "TIMESTAMP");

                async Task<(IEnumerable<ActivityLogEntry> logs, int totalCount)> ExecuteAsync(bool useNewSchema)
                {
                    var wc = useNewSchema ? whereClause : whereClauseOld;
                    var tsCol = useNewSchema ? "ACTION_TIMESTAMP" : "TIMESTAMP";
                    var oldCol = useNewSchema ? "OLD_VALUES" : "BEFORE_DATA";
                    var newCol = useNewSchema ? "NEW_VALUES" : "AFTER_DATA";

                    // Count
                    var countSqlLocal = $"SELECT COUNT(*) FROM ACTIVITY_LOGS {wc}";
                    int totalCountLocal;
                    using (var countCommand = new OracleCommand(countSqlLocal, connection))
                    {
                        countCommand.BindByName = true;
                        foreach (var param in parameters)
                        {
                            countCommand.Parameters.Add(new OracleParameter(param.ParameterName, param.Value));
                        }
                        totalCountLocal = Convert.ToInt32(await countCommand.ExecuteScalarAsync());
                    }

                    // Data
                    var offset = (page - 1) * pageSize;
                    var dataSqlLocal = $@"
                        SELECT * FROM (
                            SELECT LOG_ID, USER_ID, USER_NAME, USER_ROLE, ACTION_TYPE, ENTITY_TYPE,
                                   ENTITY_ID, ENTITY_NAME, {tsCol} AS ACTION_TIMESTAMP, {oldCol} AS OLD_VALUES, {newCol} AS NEW_VALUES, DETAILS,
                                   ROW_NUMBER() OVER (ORDER BY {tsCol} DESC) as rn
                            FROM ACTIVITY_LOGS 
                            {wc}
                        ) WHERE rn > :offset AND rn <= :limit";

                    var logsLocal = new List<ActivityLogEntry>();
                    using (var dataCommand = new OracleCommand(dataSqlLocal, connection))
                    {
                        dataCommand.BindByName = true;
                        foreach (var param in parameters)
                        {
                            dataCommand.Parameters.Add(new OracleParameter(param.ParameterName, param.Value));
                        }
                        dataCommand.Parameters.Add(new OracleParameter(":offset", offset));
                        dataCommand.Parameters.Add(new OracleParameter(":limit", offset + pageSize));

                        using var reader = await dataCommand.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            // Read numeric columns using typed getters to avoid OracleDecimal -> 0 fallbacks
                            int? entityId = null;
                            if (!reader.IsDBNull("ENTITY_ID"))
                            {
                                try { entityId = reader.GetInt32("ENTITY_ID"); }
                                catch { entityId = Convert.ToInt32(reader["ENTITY_ID"].ToString()); }
                            }

                            var logEntry = new ActivityLogEntry
                            {
                                LogId = reader.IsDBNull("LOG_ID") ? 0 : reader.GetInt32("LOG_ID"),
                                UserId = reader.IsDBNull("USER_ID") ? 0 : reader.GetInt32("USER_ID"),
                                UserName = reader.IsDBNull("USER_NAME") ? string.Empty : reader.GetString("USER_NAME"),
                                UserRole = reader.IsDBNull("USER_ROLE") ? string.Empty : reader.GetString("USER_ROLE"),
                                ActionType = reader.IsDBNull("ACTION_TYPE") ? string.Empty : reader.GetString("ACTION_TYPE"),
                                EntityType = reader.IsDBNull("ENTITY_TYPE") ? string.Empty : reader.GetString("ENTITY_TYPE"),
                                EntityId = entityId,
                                EntityName = reader.IsDBNull("ENTITY_NAME") ? null : reader.GetString("ENTITY_NAME"),
                                ActionTimestamp = reader.GetDateTime("ACTION_TIMESTAMP"),
                                OldValues = reader.IsDBNull("OLD_VALUES") ? null : reader.GetString("OLD_VALUES"),
                                NewValues = reader.IsDBNull("NEW_VALUES") ? null : reader.GetString("NEW_VALUES"),
                                Details = reader.IsDBNull("DETAILS") ? null : reader.GetString("DETAILS")
                            };

                            // Note: ChangesSummary will be generated dynamically in the view model
                            // based on the current language context

                            logsLocal.Add(logEntry);
                        }
                    }

                    // Enrich with Arabic data after fetching the logs
                    await EnrichWithArabicDataAsync(connection, logsLocal);

                    return (logsLocal, totalCountLocal);
                }

                try
                {
                    return await ExecuteAsync(true);
                }
                catch (OracleException ex) when (ex.Number == 904) // ORA-00904 invalid identifier
                {
                    _logger.LogWarning(ex, "ActivityLogService: Falling back to old schema columns");
                    return await ExecuteAsync(false);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity logs");
                return (Enumerable.Empty<ActivityLogEntry>(), 0);
            }
        }

        /// <summary>
        /// Get activity log statistics
        /// </summary>
        public async Task<(int totalActions, int adminActions, int editorActions, int recordActions, int contactActions)> GetActivityStatisticsAsync()
        {
            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
                    SELECT 
                        COUNT(*) as TotalActions,
                        SUM(CASE WHEN UPPER(USER_ROLE) = 'ADMIN' THEN 1 ELSE 0 END) as AdminActions,
                        SUM(CASE WHEN UPPER(USER_ROLE) = 'EDITOR' THEN 1 ELSE 0 END) as EditorActions,
                        SUM(CASE WHEN UPPER(ENTITY_TYPE) = 'RECORD' THEN 1 ELSE 0 END) as RecordActions,
                        SUM(CASE WHEN UPPER(ENTITY_TYPE) = 'CONTACT' THEN 1 ELSE 0 END) as ContactActions
                    FROM ACTIVITY_LOGS";

                using var command = new OracleCommand(sql, connection);
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return (
                        Convert.ToInt32(reader["TotalActions"]),
                        Convert.ToInt32(reader["AdminActions"]),
                        Convert.ToInt32(reader["EditorActions"]),
                        Convert.ToInt32(reader["RecordActions"]),
                        Convert.ToInt32(reader["ContactActions"])
                    );
                }

                return (0, 0, 0, 0, 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity statistics");
                return (0, 0, 0, 0, 0);
            }
        }

        /// <summary>
        /// Generate changes summary for record edits
        /// </summary>
        public static string GenerateRecordChangesSummary(object oldValues, object newValues)
        {
            var changes = new List<string>();
            
            try
            {
                var oldDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(oldValues));
                var newDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(newValues));

                if (oldDict != null && newDict != null)
                {
                    foreach (var key in newDict.Keys)
                    {
                        var oldVal = oldDict.ContainsKey(key) ? oldDict[key]?.ToString() : "";
                        var newVal = newDict[key]?.ToString() ?? "";

                        if (!string.Equals(oldVal, newVal, StringComparison.OrdinalIgnoreCase))
                        {
                            var fieldName = key switch
                            {
                                "regulationName" => "Regulation Name",
                                "regulationNameAr" => "Regulation Name (Arabic)",
                                "department" => "Department",
                                "version" => "Version",
                                "versionDate" => "Version Date",
                                "approvalDate" => "Approval Date",
                                "approvingEntity" => "Approving Entity",
                                "approvingEntityAr" => "Approving Entity (Arabic)",
                                "description" => "Description",
                                "descriptionAr" => "Description (Arabic)",
                                "documentType" => "Document Type",
                                "sections" => "Sections",
                                "notes" => "Notes",
                                "notesAr" => "Notes (Arabic)",
                                _ => key
                            };

                            changes.Add($"{fieldName}: '{oldVal}' → '{newVal}'");
                        }
                    }
                }
            }
            catch (Exception)
            {
                return "Changes detected but details unavailable";
            }

            return changes.Count > 0 ? string.Join("; ", changes) : "No changes detected";
        }

        /// <summary>
        /// Generate changes summary for contact edits
        /// </summary>
        public static string GenerateContactChangesSummary(object oldValues, object newValues)
        {
            var changes = new List<string>();
            
            try
            {
                var oldDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(oldValues));
                var newDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(newValues));

                if (oldDict != null && newDict != null)
                {
                    foreach (var key in newDict.Keys)
                    {
                        var oldVal = oldDict.ContainsKey(key) ? oldDict[key]?.ToString() : "";
                        var newVal = newDict[key]?.ToString() ?? "";

                        if (!string.Equals(oldVal, newVal, StringComparison.OrdinalIgnoreCase))
                        {
                            var fieldName = key switch
                            {
                                "department" => "Department",
                                "name" => "Name",
                                "nameAr" => "Name (Arabic)",
                                "email" => "Email",
                                "mobile" => "Mobile",
                                "telephone" => "Telephone",
                                _ => key
                            };

                            changes.Add($"{fieldName}: '{oldVal}' → '{newVal}'");
                        }
                    }
                }
            }
            catch (Exception)
            {
                return "Changes detected but details unavailable";
            }

            return changes.Count > 0 ? string.Join("; ", changes) : "No changes detected";
        }

        /// <summary>
        /// Enrich activity log entries with Arabic data by looking up related tables
        /// </summary>
        private async Task EnrichWithArabicDataAsync(OracleConnection connection, List<ActivityLogEntry> logs)
        {
            try
            {
                // Create dictionaries to cache lookups
                var userNameDict = new Dictionary<int, string>();
                var recordNameDict = new Dictionary<int, string>();
                var contactNameDict = new Dictionary<int, string>();
                
                // Get unique user IDs and entity IDs for batch lookup
                var userIds = logs.Select(l => l.UserId).Distinct().ToList();
                var recordIds = logs.Where(l => l.EntityType == "Record" && l.EntityId.HasValue)
                                   .Select(l => l.EntityId!.Value).Distinct().ToList();
                var contactIds = logs.Where(l => l.EntityType == "Contact" && l.EntityId.HasValue)
                                   .Select(l => l.EntityId!.Value).Distinct().ToList();
                // Batch lookup Arabic contact names
                if (contactIds.Any())
                {
                    var contactSql = "SELECT CONTACT_ID, NAME_AR FROM CONTACT_INFORMATION WHERE CONTACT_ID IN (" + string.Join(",", contactIds) + ")";
                    try
                    {
                        using var contactCmd = new OracleCommand(contactSql, connection);
                        using var contactReader = await contactCmd.ExecuteReaderAsync();
                        while (await contactReader.ReadAsync())
                        {
                            var contactId = contactReader.GetInt32("CONTACT_ID");
                            var nameAr = !contactReader.IsDBNull("NAME_AR") ? contactReader.GetString("NAME_AR") : null;
                            if (!string.IsNullOrEmpty(nameAr))
                            {
                                contactNameDict[contactId] = nameAr;
                            }
                        }
                    }
                    catch (OracleException ex) when (ex.Number == 904)
                    {
                        _logger.LogDebug("NAME_AR column not found, skipping contact name translation");
                    }
                }
                
                // Batch lookup Arabic user names (check if USER_NAME_AR column exists)
                if (userIds.Any())
                {
                    var userSql = "SELECT USER_ID, USER_NAME, USER_NAME_AR FROM USERS WHERE USER_ID IN (" + 
                                 string.Join(",", userIds) + ")";
                    
                    try
                    {
                        using var userCmd = new OracleCommand(userSql, connection);
                        using var userReader = await userCmd.ExecuteReaderAsync();
                        while (await userReader.ReadAsync())
                        {
                            var userId = userReader.GetInt32("USER_ID");
                            var userNameAr = !userReader.IsDBNull("USER_NAME_AR") ? 
                                           userReader.GetString("USER_NAME_AR") : null;
                            if (!string.IsNullOrEmpty(userNameAr))
                            {
                                userNameDict[userId] = userNameAr;
                            }
                        }
                    }
                    catch (OracleException ex) when (ex.Number == 904)
                    {
                        // USER_NAME_AR column doesn't exist, skip user name translation
                        _logger.LogDebug("USER_NAME_AR column not found, skipping user name translation");
                    }
                }
                
                // Batch lookup Arabic record names
                if (recordIds.Any())
                {
                    var recordSql = "SELECT RECORD_ID, REGULATION_NAME, REGULATION_NAME_AR FROM RECORDS WHERE RECORD_ID IN (" + 
                                   string.Join(",", recordIds) + ")";
                    
                    try
                    {
                        using var recordCmd = new OracleCommand(recordSql, connection);
                        using var recordReader = await recordCmd.ExecuteReaderAsync();
                        while (await recordReader.ReadAsync())
                        {
                            var recordId = recordReader.GetInt32("RECORD_ID");
                            var regulationNameAr = !recordReader.IsDBNull("REGULATION_NAME_AR") ? 
                                                 recordReader.GetString("REGULATION_NAME_AR") : null;
                            if (!string.IsNullOrEmpty(regulationNameAr))
                            {
                                recordNameDict[recordId] = regulationNameAr;
                            }
                        }
                    }
                    catch (OracleException ex) when (ex.Number == 904)
                    {
                        // REGULATION_NAME_AR column doesn't exist, skip record name translation
                        _logger.LogDebug("REGULATION_NAME_AR column not found, skipping record name translation");
                    }
                }
                
                // Apply the Arabic data to the logs
                foreach (var log in logs)
                {
                    // Set Arabic user name if available
                    if (userNameDict.TryGetValue(log.UserId, out var userNameAr))
                    {
                        log.UserNameAr = userNameAr;
                    }
                    // Set Arabic entity name for Record
                    if (log.EntityType == "Record" && log.EntityId.HasValue && 
                        recordNameDict.TryGetValue(log.EntityId.Value, out var entityNameAr))
                    {
                        log.EntityNameAr = entityNameAr;
                    }
                    // Set Arabic entity name for Contact
                    if (log.EntityType == "Contact" && log.EntityId.HasValue &&
                        contactNameDict.TryGetValue(log.EntityId.Value, out var contactNameAr))
                    {
                        log.EntityNameAr = contactNameAr;
                    }
                    // For now, we don't translate Details/ChangesSummary as they are dynamic content
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to enrich activity logs with Arabic data");
                // Continue without Arabic data if enrichment fails
            }
        }
    }
}
