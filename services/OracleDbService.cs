using System.Data;
using Oracle.ManagedDataAccess.Client;


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
        using (OracleConnection conn = new OracleConnection(_connectionString))
        {
            using (OracleCommand cmd = new OracleCommand(query, conn))
            {
                using (OracleDataAdapter adapter = new OracleDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    conn.Open();
                    adapter.Fill(dt);
                    return dt;
                }
            }
        }
    }
}
