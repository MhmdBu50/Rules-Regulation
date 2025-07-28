using System.Data;
using System.IO;
using Oracle.ManagedDataAccess.Client;

namespace RulesRegulation.Services
{
    public class OracleDbService
    {
        private readonly string _connectionString;

        public OracleDbService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Method to retrieve data from a specified table
        public DataTable GetData(string query)
        {
            using (var conn = new OracleConnection(_connectionString))
            {
                using (var cmd = new OracleCommand(query, conn))
                {
                    using (var adapter = new OracleDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        conn.Open();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        // Method to add contact information
        public bool AddContactInfo(string department, string name, string? email, string? mobile, string? telephone)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    int contactId = GetNextContactId(); // 🔹 Fetch the next ID from the sequence

                    string query = @"INSERT INTO CONTACT_INFORMATION 
                                    (CONTACT_ID, DEPARTMENT, NAME, EMAIL, MOBILE, TELEPHONE) 
                                    VALUES (:contactId, :department, :name, :email, :mobile, :telephone)";
                                    
                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":contactId", contactId);
                        cmd.Parameters.Add(":department", department);
                        cmd.Parameters.Add(":name", name);
                        cmd.Parameters.Add(":email", email ?? (object)DBNull.Value);
                        cmd.Parameters.Add(":mobile", mobile ?? (object)DBNull.Value);
                        cmd.Parameters.Add(":telephone", telephone ?? (object)DBNull.Value);
                        int result = cmd.ExecuteNonQuery();
                        return result > 0;
                    }
                }
            }
            catch (Oracle.ManagedDataAccess.Client.OracleException ex)
            {
                Console.WriteLine($"[OracleException] AddContactInfo failed. Department: {department}, Name: {name}, Email: {email}, Mobile: {mobile}, Telephone: {telephone}");
                Console.WriteLine($"Oracle Error {ex.Number}: {ex.Message}\nStackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Exception] AddContactInfo failed. Department: {department}, Name: {name}, Email: {email}, Mobile: {mobile}, Telephone: {telephone}");
                Console.WriteLine($"Exception: {ex.Message}\nStackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                throw;
            }
        }

        // Method to check if department already has maximum contacts (5)
        public bool DepartmentExists(string department)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = "SELECT COUNT(*) FROM CONTACT_INFORMATION WHERE UPPER(DEPARTMENT) = UPPER(:department)";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":department", department);

                        var result = cmd.ExecuteScalar();
                        return Convert.ToInt32(result) >= 5;
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        // Method to get the count of contacts in a department
        public int GetContactCountInDepartment(string department)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = "SELECT COUNT(*) FROM CONTACT_INFORMATION WHERE UPPER(DEPARTMENT) = UPPER(:department)";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":department", department);

                        var result = cmd.ExecuteScalar();
                        return Convert.ToInt32(result);
                    }
                }
            }
            catch
            {
                return 0;
            }
        }

        // Method to get existing contact name for a department
        public string? GetExistingContactInDepartment(string department)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = "SELECT NAME FROM CONTACT_INFORMATION WHERE UPPER(DEPARTMENT) = UPPER(:department) AND ROWNUM = 1";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":department", department);

                        var result = cmd.ExecuteScalar();
                        return result?.ToString();
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        // Method to get all records for homepage/admin cards
        public List<dynamic> GetAllRecords()
        {
            var records = new List<dynamic>();
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    string query = @"SELECT 
                        RECORD_ID, REGULATION_NAME, SECTIONS, VERSION, APPROVAL_DATE, APPROVING_ENTITY,
                        DEPARTMENT, DOCUMENT_TYPE, DESCRIPTION, VERSION_DATE, NOTES, CREATED_AT
                        FROM RECORDS 
                        ORDER BY CREATED_AT DESC";

                    using (var cmd = new OracleCommand(query, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            records.Add(new
                            {
                                Id = reader["RECORD_ID"]?.ToString(),
                                RegulationName = reader["REGULATION_NAME"]?.ToString(),
                                Sections = reader["SECTIONS"]?.ToString(),
                                Version = reader["VERSION"]?.ToString(),
                                ApprovalDate = reader["APPROVAL_DATE"] != DBNull.Value ?
                                    Convert.ToDateTime(reader["APPROVAL_DATE"]).ToString("yyyy-MM-dd") : "",
                                ApprovingEntity = reader["APPROVING_ENTITY"]?.ToString(),
                                Department = reader["DEPARTMENT"]?.ToString(),
                                DocumentType = reader["DOCUMENT_TYPE"]?.ToString(),
                                Description = reader["DESCRIPTION"]?.ToString(),
                                VersionDate = reader["VERSION_DATE"] != DBNull.Value ?
                                    Convert.ToDateTime(reader["VERSION_DATE"]).ToString("yyyy-MM-dd") : "",
                                Notes = reader["NOTES"]?.ToString(),
                                CreatedAt = reader["CREATED_AT"] != DBNull.Value ?
                                    Convert.ToDateTime(reader["CREATED_AT"]).ToString("yyyy-MM-dd") : ""
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting records: {ex.Message}");
            }
            return records;
        }

        // Method to get single record with full details (for accordion expansion)
        public dynamic? GetRecordById(int recordId)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    string query = @"SELECT r.*, a.FILE_PATH, a.FILE_TYPE 
                        FROM RECORDS r 
                        LEFT JOIN ATTACHMENTS a ON r.RECORD_ID = a.RECORD_ID 
                        WHERE r.RECORD_ID = :recordId";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":recordId", recordId);
                        using (var reader = cmd.ExecuteReader())
                        {
                            var attachments = new List<dynamic>();
                            dynamic? record = null;

                            while (reader.Read())
                            {
                                if (record == null)
                                {
                                    record = new
                                    {
                                        Id = reader["RECORD_ID"]?.ToString(),
                                        RegulationName = reader["REGULATION_NAME"]?.ToString(),
                                        Sections = reader["SECTIONS"]?.ToString(),
                                        Version = reader["VERSION"]?.ToString(),
                                        ApprovalDate = reader["APPROVAL_DATE"] != DBNull.Value ?
                                            Convert.ToDateTime(reader["APPROVAL_DATE"]).ToString("yyyy-MM-dd") : "",
                                        ApprovingEntity = reader["APPROVING_ENTITY"]?.ToString(),
                                        Department = reader["DEPARTMENT"]?.ToString(),
                                        DocumentType = reader["DOCUMENT_TYPE"]?.ToString(),
                                        Description = reader["DESCRIPTION"]?.ToString(),
                                        VersionDate = reader["VERSION_DATE"] != DBNull.Value ?
                                            Convert.ToDateTime(reader["VERSION_DATE"]).ToString("yyyy-MM-dd") : "",
                                        Notes = reader["NOTES"]?.ToString(),
                                        CreatedAt = reader["CREATED_AT"] != DBNull.Value ?
                                            Convert.ToDateTime(reader["CREATED_AT"]).ToString("yyyy-MM-dd") : "",
                                        UserId = reader["USER_ID"]?.ToString(),
                                        Attachments = attachments
                                    };
                                }

                                if (reader["FILE_PATH"] != DBNull.Value)
                                {
                                    var filePath = reader["FILE_PATH"]?.ToString();
                                    var fileName = !string.IsNullOrEmpty(filePath) ? Path.GetFileName(filePath) : "";

                                    attachments.Add(new
                                    {
                                        FileName = fileName,
                                        OriginalFileName = fileName, // For now, same as filename
                                        FileType = reader["FILE_TYPE"]?.ToString()?.ToLower()
                                    });
                                }
                            }

                            // Add contact information for the department if record exists
                            if (record != null)
                            {
                                var department = record.Department?.ToString();
                                if (!string.IsNullOrEmpty(department))
                                {
                                    var contacts = GetContactsByDepartment(department);

                                    // Create a new record object with contact information
                                    record = new
                                    {
                                        Id = record.Id,
                                        RegulationName = record.RegulationName,
                                        Sections = record.Sections,
                                        Version = record.Version,
                                        ApprovalDate = record.ApprovalDate,
                                        ApprovingEntity = record.ApprovingEntity,
                                        Department = record.Department,
                                        DocumentType = record.DocumentType,
                                        Description = record.Description,
                                        VersionDate = record.VersionDate,
                                        Notes = record.Notes,
                                        CreatedAt = record.CreatedAt,
                                        UserId = record.UserId,
                                        Attachments = record.Attachments,
                                        ContactInformation = contacts
                                    };
                                }
                                else
                                {
                                    // Add empty contact information if no department
                                    record = new
                                    {
                                        Id = record.Id,
                                        RegulationName = record.RegulationName,
                                        Sections = record.Sections,
                                        Version = record.Version,
                                        ApprovalDate = record.ApprovalDate,
                                        ApprovingEntity = record.ApprovingEntity,
                                        Department = record.Department,
                                        DocumentType = record.DocumentType,
                                        Description = record.Description,
                                        VersionDate = record.VersionDate,
                                        Notes = record.Notes,
                                        CreatedAt = record.CreatedAt,
                                        UserId = record.UserId,
                                        Attachments = record.Attachments,
                                        ContactInformation = new List<dynamic>()
                                    };
                                }
                            }

                            return record;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting record by ID: {ex.Message}");
                return null;
            }
        }

        // Method to add a new record and its attachments
        public bool AddNewRecord(
            string regulationName,
            string relevantDepartment,
            string versionNumber,
            DateTime versionDate,
            DateTime approvalDate,
            string approvalEntity,
            string description,
            string doctype,
            string sections,
            string notes,
            string? wordPath,
            string? pdfPath)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();
                    // Insert record
                    string recordQuery = @"INSERT INTO RECORDS (
                        USER_ID, REGULATION_NAME, DEPARTMENT, VERSION, VERSION_DATE, APPROVAL_DATE, APPROVING_ENTITY,
                        DESCRIPTION, DOCUMENT_TYPE, SECTIONS, NOTES, CREATED_AT)
                        VALUES (
                        :userId, :regulationName, :relevantDepartment, :versionNumber, :versionDate, :approvalDate, :approvalEntity,
                        :description, :doctype, :sections, :notes, SYSTIMESTAMP)
                        RETURNING RECORD_ID INTO :newRecordId";
                    using (var cmd = new OracleCommand(recordQuery, conn))
                    {
                        cmd.Parameters.Add(":userId", 1); // Default user ID
                        cmd.Parameters.Add(":regulationName", regulationName);
                        cmd.Parameters.Add(":relevantDepartment", relevantDepartment);
                        cmd.Parameters.Add(":versionNumber", versionNumber);
                        cmd.Parameters.Add(":versionDate", versionDate);
                        cmd.Parameters.Add(":approvalDate", approvalDate);
                        cmd.Parameters.Add(":approvalEntity", approvalEntity);
                        cmd.Parameters.Add(":description", description);
                        cmd.Parameters.Add(":doctype", doctype);
                        cmd.Parameters.Add(":sections", sections);
                        cmd.Parameters.Add(":notes", notes);
                        var newRecordIdParam = new OracleParameter(":newRecordId", OracleDbType.Int32) { Direction = ParameterDirection.Output };
                        cmd.Parameters.Add(newRecordIdParam);
                        int result = cmd.ExecuteNonQuery();
                        if (result == 0) return false;
                        int newRecordId = Convert.ToInt32(newRecordIdParam.Value);
                        // Insert attachments
                        if (!string.IsNullOrEmpty(wordPath))
                        {
                            string attachQuery = @"INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH, UPLOAD_DATE)
                                VALUES (:recordId, 'word', :filePath, SYSTIMESTAMP)";
                            using (var attachCmd = new OracleCommand(attachQuery, conn))
                            {
                                attachCmd.Parameters.Add(":recordId", newRecordId);
                                attachCmd.Parameters.Add(":filePath", wordPath);
                                attachCmd.ExecuteNonQuery();
                            }
                        }
                        if (!string.IsNullOrEmpty(pdfPath))
                        {
                            string attachQuery = @"INSERT INTO ATTACHMENTS (RECORD_ID, FILE_TYPE, FILE_PATH, UPLOAD_DATE)
                                VALUES (:recordId, 'pdf', :filePath, SYSTIMESTAMP)";
                            using (var attachCmd = new OracleCommand(attachQuery, conn))
                            {
                                attachCmd.Parameters.Add(":recordId", newRecordId);
                                attachCmd.Parameters.Add(":filePath", pdfPath);
                                attachCmd.ExecuteNonQuery();
                            }
                        }
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the actual error for debugging
                Console.WriteLine($"Database error: {ex.Message}");
                return false;
            }
        }

        // Method to update an existing record
        public bool UpdateRecord(
            int recordId,
            string regulationName,
            string department,
            string version,
            DateTime versionDate,
            DateTime approvalDate,
            string approvingEntity,
            string description,
            string documentType,
            string sections,
            string notes)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = @"UPDATE RECORDS 
                                    SET REGULATION_NAME = :regulationName,
                                        DEPARTMENT = :department,
                                        VERSION = :version,
                                        VERSION_DATE = :versionDate,
                                        APPROVAL_DATE = :approvalDate,
                                        APPROVING_ENTITY = :approvingEntity,
                                        DESCRIPTION = :description,
                                        DOCUMENT_TYPE = :documentType,
                                        SECTIONS = :sections,
                                        NOTES = :notes
                                    WHERE RECORD_ID = :recordId";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":regulationName", regulationName);
                        cmd.Parameters.Add(":department", department);
                        cmd.Parameters.Add(":version", version);
                        cmd.Parameters.Add(":versionDate", versionDate);
                        cmd.Parameters.Add(":approvalDate", approvalDate);
                        cmd.Parameters.Add(":approvingEntity", approvingEntity);
                        cmd.Parameters.Add(":description", description);
                        cmd.Parameters.Add(":documentType", documentType);
                        cmd.Parameters.Add(":sections", sections);
                        cmd.Parameters.Add(":notes", notes);
                        cmd.Parameters.Add(":recordId", recordId);

                        int result = cmd.ExecuteNonQuery();
                        return result > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating record: {ex.Message}");
                return false;
            }
        }

        // Method to delete a record
        public bool DeleteRecord(int recordId)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    // First delete attachments
                    string deleteAttachmentsQuery = "DELETE FROM ATTACHMENTS WHERE RECORD_ID = :recordId";
                    using (var cmd = new OracleCommand(deleteAttachmentsQuery, conn))
                    {
                        cmd.Parameters.Add(":recordId", recordId);
                        cmd.ExecuteNonQuery();
                    }

                    // Then delete the record
                    string deleteRecordQuery = "DELETE FROM RECORDS WHERE RECORD_ID = :recordId";
                    using (var cmd = new OracleCommand(deleteRecordQuery, conn))
                    {
                        cmd.Parameters.Add(":recordId", recordId);

                        int result = cmd.ExecuteNonQuery();
                        return result > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting record: {ex.Message}");
                return false;
            }
        }

        // Method to get all contacts
        public List<dynamic> GetAllContacts()
        {
            var contacts = new List<dynamic>();
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = @"SELECT CONTACT_ID, DEPARTMENT, NAME, EMAIL, MOBILE, TELEPHONE 
                                    FROM CONTACT_INFORMATION 
                                    ORDER BY DEPARTMENT, NAME";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.CommandTimeout = 10; // Reduced timeout to 10 seconds
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                contacts.Add(new
                                {
                                    ContactId = reader.GetInt32("CONTACT_ID"),
                                    Department = reader.GetString("DEPARTMENT"),
                                    Name = reader.GetString("NAME"),
                                    Email = reader.IsDBNull(reader.GetOrdinal("EMAIL")) ? null : reader.GetString("EMAIL"),
                                    Mobile = reader.IsDBNull(reader.GetOrdinal("MOBILE")) ? null : reader.GetString("MOBILE"),
                                    Telephone = reader.IsDBNull(reader.GetOrdinal("TELEPHONE")) ? null : reader.GetString("TELEPHONE")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contacts: {ex.Message}");
                throw; // Re-throw to let controller handle it
            }
            return contacts;
        }

        // Method to get a contact by ID
        public dynamic? GetContactById(int id)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = @"SELECT CONTACT_ID, DEPARTMENT, NAME, EMAIL, MOBILE, TELEPHONE 
                                    FROM CONTACT_INFORMATION 
                                    WHERE CONTACT_ID = :id";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":id", id);

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new
                                {
                                    ContactId = reader.GetInt32("CONTACT_ID"),
                                    Department = reader.GetString("DEPARTMENT"),
                                    Name = reader.GetString("NAME"),
                                    Email = reader.IsDBNull(reader.GetOrdinal("EMAIL")) ? null : reader.GetString("EMAIL"),
                                    Mobile = reader.IsDBNull(reader.GetOrdinal("MOBILE")) ? null : reader.GetString("MOBILE"),
                                    Telephone = reader.IsDBNull(reader.GetOrdinal("TELEPHONE")) ? null : reader.GetString("TELEPHONE")
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contact by ID: {ex.Message}");
            }
            return null;
        }

        // Method to update a contact
        public bool UpdateContact(int id, string department, string name, string? email, string? mobile, string? telephone)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = @"UPDATE CONTACT_INFORMATION 
                                    SET DEPARTMENT = :department, NAME = :name, EMAIL = :email, 
                                        MOBILE = :mobile, TELEPHONE = :telephone 
                                    WHERE CONTACT_ID = :id";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":department", department);
                        cmd.Parameters.Add(":name", name);
                        cmd.Parameters.Add(":email", email ?? (object)DBNull.Value);
                        cmd.Parameters.Add(":mobile", mobile ?? (object)DBNull.Value);
                        cmd.Parameters.Add(":telephone", telephone ?? (object)DBNull.Value);
                        cmd.Parameters.Add(":id", id);

                        int result = cmd.ExecuteNonQuery();
                        return result > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating contact: {ex.Message}");
                return false;
            }
        }

        // Method to delete a contact
        public bool DeleteContact(int id)
        {
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = "DELETE FROM CONTACT_INFORMATION WHERE CONTACT_ID = :id";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":id", id);

                        int result = cmd.ExecuteNonQuery();
                        return result > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting contact: {ex.Message}");
                return false;
            }
        }

        // Method to get contact information by department
        public List<dynamic> GetContactsByDepartment(string department)
        {
            var contacts = new List<dynamic>();
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    string query = @"SELECT CONTACT_ID, DEPARTMENT, NAME, EMAIL, MOBILE, TELEPHONE 
                                    FROM CONTACT_INFORMATION 
                                    WHERE UPPER(DEPARTMENT) = UPPER(:department)
                                    ORDER BY NAME";

                    using (var cmd = new OracleCommand(query, conn))
                    {
                        cmd.Parameters.Add(":department", department);
                        cmd.CommandTimeout = 10;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                contacts.Add(new
                                {
                                    ContactId = reader.GetInt32("CONTACT_ID"),
                                    Department = reader.GetString("DEPARTMENT"),
                                    Name = reader.GetString("NAME"),
                                    Email = reader.IsDBNull(reader.GetOrdinal("EMAIL")) ? null : reader.GetString("EMAIL"),
                                    Mobile = reader.IsDBNull(reader.GetOrdinal("MOBILE")) ? null : reader.GetString("MOBILE"),
                                    Telephone = reader.IsDBNull(reader.GetOrdinal("TELEPHONE")) ? null : reader.GetString("TELEPHONE")
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contacts by department: {ex.Message}");
            }
            return contacts;
        }

        // Method to get filtered records based on filter parameters
        public List<dynamic> GetFilteredRecords(string? department, string? sections, string? documentTypes,
            string? alphabetical, string? dateSort, string? fromDate, string? toDate)
        {
            var records = new List<dynamic>();
            try
            {
                using (var conn = new OracleConnection(_connectionString))
                {
                    conn.Open();

                    // Build dynamic query based on filters
                    var queryBuilder = new System.Text.StringBuilder(@"SELECT 
                        RECORD_ID, REGULATION_NAME, SECTIONS, VERSION, APPROVAL_DATE, APPROVING_ENTITY,
                        DEPARTMENT, DOCUMENT_TYPE, DESCRIPTION, VERSION_DATE, NOTES, CREATED_AT
                        FROM RECORDS WHERE 1=1");

                    var parameters = new List<OracleParameter>();

                    // Add department filter
                    if (!string.IsNullOrEmpty(department))
                    {
                        queryBuilder.Append(" AND UPPER(DEPARTMENT) = UPPER(:department)");
                        parameters.Add(new OracleParameter(":department", department));
                    }

                    // Add sections filter
                    if (!string.IsNullOrEmpty(sections))
                    {
                        var sectionList = sections.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList();
                        if (sectionList.Any())
                        {
                            var sectionConditions = new List<string>();
                            for (int i = 0; i < sectionList.Count; i++)
                            {
                                var section = sectionList[i];

                                // Handle specific section mappings
                                if (section.Equals("Enrolled Programs", StringComparison.OrdinalIgnoreCase))
                                {
                                    // Check for "Program" in database
                                    sectionConditions.Add($"(UPPER(SECTIONS) LIKE '%PROGRAM%')");
                                }
                                else if (section.Equals("Students", StringComparison.OrdinalIgnoreCase))
                                {
                                    // Check for both "Student" and "Students"
                                    sectionConditions.Add($"(UPPER(SECTIONS) LIKE '%STUDENT%')");
                                }
                                else if (section.Equals("Members", StringComparison.OrdinalIgnoreCase))
                                {
                                    // Check for both "Member" and "Members" 
                                    sectionConditions.Add($"(UPPER(SECTIONS) LIKE '%MEMBER%')");
                                }
                                else
                                {
                                    // Use simple matching for other sections
                                    sectionConditions.Add($"UPPER(SECTIONS) LIKE UPPER(:section{i})");
                                    parameters.Add(new OracleParameter($":section{i}", $"%{section}%"));
                                }
                            }
                            queryBuilder.Append($" AND ({string.Join(" OR ", sectionConditions)})");
                        }
                    }

                    // Add document types filter
                    if (!string.IsNullOrEmpty(documentTypes))
                    {
                        var typeList = documentTypes.Split(',').Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList();
                        if (typeList.Any())
                        {
                            var typeConditions = new List<string>();
                            for (int i = 0; i < typeList.Count; i++)
                            {
                                // Handle both singular and plural forms
                                var type = typeList[i];
                                if (type.Equals("Regulation", StringComparison.OrdinalIgnoreCase))
                                {
                                    typeConditions.Add($"(UPPER(DOCUMENT_TYPE) = 'REGULATION' OR UPPER(DOCUMENT_TYPE) = 'REGULATIONS')");
                                }
                                else if (type.Equals("Guidelines", StringComparison.OrdinalIgnoreCase) || type.Equals("Guideline", StringComparison.OrdinalIgnoreCase))
                                {
                                    typeConditions.Add($"(UPPER(DOCUMENT_TYPE) = 'GUIDELINES' OR UPPER(DOCUMENT_TYPE) = 'GUIDELINE')");
                                }
                                else if (type.Equals("Policies", StringComparison.OrdinalIgnoreCase) || type.Equals("Policy", StringComparison.OrdinalIgnoreCase))
                                {
                                    typeConditions.Add($"(UPPER(DOCUMENT_TYPE) = 'POLICIES' OR UPPER(DOCUMENT_TYPE) = 'POLICY')");
                                }
                                else
                                {
                                    typeConditions.Add($"UPPER(DOCUMENT_TYPE) LIKE UPPER(:docType{i})");
                                    parameters.Add(new OracleParameter($":docType{i}", $"%{type}%"));
                                }
                            }
                            queryBuilder.Append($" AND ({string.Join(" OR ", typeConditions)})");
                        }
                    }

                    // Add date range filter
                    if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var fromDateTime))
                    {
                        queryBuilder.Append(" AND (APPROVAL_DATE >= :fromDate OR (APPROVAL_DATE IS NULL AND CREATED_AT >= :fromDateAlt))");
                        parameters.Add(new OracleParameter(":fromDate", fromDateTime));
                        parameters.Add(new OracleParameter(":fromDateAlt", fromDateTime));
                    }

                    if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var toDateTime))
                    {
                        // Add one day to include the full end date
                        var endDate = toDateTime.AddDays(1);
                        queryBuilder.Append(" AND (APPROVAL_DATE < :toDate OR (APPROVAL_DATE IS NULL AND CREATED_AT < :toDateAlt))");
                        parameters.Add(new OracleParameter(":toDate", endDate));
                        parameters.Add(new OracleParameter(":toDateAlt", endDate));
                    }

                    // Add sorting
                    if (!string.IsNullOrEmpty(alphabetical))
                    {
                        if (alphabetical == "A-Z")
                            queryBuilder.Append(" ORDER BY UPPER(REGULATION_NAME) ASC");
                        else if (alphabetical == "Z-A")
                            queryBuilder.Append(" ORDER BY UPPER(REGULATION_NAME) DESC");
                    }
                    else if (!string.IsNullOrEmpty(dateSort))
                    {
                        if (dateSort == "newest" || dateSort == "Newest-Oldest")
                            queryBuilder.Append(" ORDER BY APPROVAL_DATE DESC NULLS LAST");
                        else if (dateSort == "oldest" || dateSort == "Oldest-Newest")
                            queryBuilder.Append(" ORDER BY APPROVAL_DATE ASC NULLS LAST");
                        else if (dateSort == "range")
                            queryBuilder.Append(" ORDER BY APPROVAL_DATE DESC NULLS LAST");
                        else
                            queryBuilder.Append(" ORDER BY CREATED_AT DESC NULLS LAST");
                    }
                    else
                    {
                        queryBuilder.Append(" ORDER BY CREATED_AT DESC NULLS LAST");
                    }

                    using (var cmd = new OracleCommand(queryBuilder.ToString(), conn))
                    {
                        cmd.Parameters.AddRange(parameters.ToArray());

                        // Debug logging
                        Console.WriteLine($"Filter Query: {queryBuilder.ToString()}");
                        Console.WriteLine($"Parameters: {string.Join(", ", parameters.Select(p => $"{p.ParameterName}={p.Value}"))}");

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                records.Add(new
                                {
                                    Id = reader["RECORD_ID"]?.ToString(),
                                    RegulationName = reader["REGULATION_NAME"]?.ToString(),
                                    Sections = reader["SECTIONS"]?.ToString(),
                                    Version = reader["VERSION"]?.ToString(),
                                    ApprovalDate = reader["APPROVAL_DATE"] != DBNull.Value ?
                                        Convert.ToDateTime(reader["APPROVAL_DATE"]).ToString("yyyy-MM-dd") : "",
                                    ApprovingEntity = reader["APPROVING_ENTITY"]?.ToString(),
                                    Department = reader["DEPARTMENT"]?.ToString(),
                                    DocumentType = reader["DOCUMENT_TYPE"]?.ToString(),
                                    Description = reader["DESCRIPTION"]?.ToString(),
                                    VersionDate = reader["VERSION_DATE"] != DBNull.Value ?
                                        Convert.ToDateTime(reader["VERSION_DATE"]).ToString("yyyy-MM-dd") : "",
                                    Notes = reader["NOTES"]?.ToString(),
                                    CreatedAt = reader["CREATED_AT"] != DBNull.Value ?
                                        Convert.ToDateTime(reader["CREATED_AT"]).ToString("yyyy-MM-dd") : ""
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting filtered records: {ex.Message}");
                // Fallback to all records if filtering fails
                return GetAllRecords();
            }
            return records;
        }


        public int GetNextContactId()
        {
            using (var conn = new OracleConnection(_connectionString))
            {
                conn.Open();
                using (var cmd = new OracleCommand("SELECT CONTACT_ID_SEQ.NEXTVAL FROM DUAL", conn))
                {
                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

    }
}
