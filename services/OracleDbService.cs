using System.Data;
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
                    
                    string query = @"INSERT INTO CONTACT_INFORMATION (DEPARTMENT, NAME, EMAIL, MOBILE, TELEPHONE) 
                                    VALUES (:department, :name, :email, :mobile, :telephone)";
                    
                    using (var cmd = new OracleCommand(query, conn))
                    {
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
            catch
            {
                return false;
            }
        }

        // Method to check if department already exists
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
                        return Convert.ToInt32(result) > 0;
                    }
                }
            }
            catch
            {
                return false;
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
    }
}
