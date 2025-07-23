using System;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using RulesRegulation.Data;

namespace RulesRegulation.Data
{
    public sealed class DatabaseConnection
    {
        private static readonly Lazy<DatabaseConnection> _instance = new(() => new DatabaseConnection());
        private readonly string _connectionString;

        // Singleton instance
        public static DatabaseConnection Instance => _instance.Value;

        private DatabaseConnection()
        {
            // Get connection string from configuration
            _connectionString = GetConnectionString();
        }

        // Alternative constructor for dependency injection
        public DatabaseConnection(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        private string GetConnectionString()
        {
            // Priority order: Environment variable -> appsettings.json -> default
            return Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
                ?? "Server=localhost:1521;Database=23ai;User Id=system;Password=root;TrustServerCertificate=true;";
        }

        // Execute parameterized query (INSERT, UPDATE, DELETE)
        public async Task<int> ExecuteNonQueryAsync(string query, params SqlParameter[] parameters)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand(query, connection);
            
            if (parameters != null)
                command.Parameters.AddRange(parameters);

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync();
        }

        // Execute SELECT query and return DataTable
        public async Task<DataTable> ExecuteQueryAsync(string query, params SqlParameter[] parameters)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand(query, connection);
            
            if (parameters != null)
                command.Parameters.AddRange(parameters);

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            
            var dataTable = new DataTable();
            dataTable.Load(reader);
            return dataTable;
        }

        // Execute scalar query (COUNT, MAX, etc.)
        public async Task<T?> ExecuteScalarAsync<T>(string query, params SqlParameter[] parameters)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand(query, connection);
            
            if (parameters != null)
                command.Parameters.AddRange(parameters);

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            
            return result == null || result == DBNull.Value ? default(T) : (T)result;
        }

        // Test database connection
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                return connection.State == ConnectionState.Open;
            }
            catch
            {
                return false;
            }
        }

        // Helper method to create SqlParameter
        public static SqlParameter CreateParameter(string name, object value)
        {
            return new SqlParameter(name, value ?? DBNull.Value);
        }
    }
}

// Example usage in other files:

// File: UserService.cs
// namespace RulesRegulation.Services
// {
//     public class UserService
//     {
//         private readonly DatabaseConnection _db = DatabaseConnection.Instance;

//         public async Task<int> CreateUserAsync(string name, int age)
//         {
//             return await _db.ExecuteNonQueryAsync(
//                 "INSERT INTO Users (Name, Age) VALUES (@Name, @Age)",
//                 DatabaseConnection.CreateParameter("@Name", name),
//                 DatabaseConnection.CreateParameter("@Age", age)
//             );
//         }

//         public async Task<DataTable> GetUsersAsync(int minAge)
//         {
//             return await _db.ExecuteQueryAsync(
//                 "SELECT * FROM Users WHERE Age >= @MinAge",
//                 DatabaseConnection.CreateParameter("@MinAge", minAge)
//             );
//         }

//         public async Task<int> GetUserCountAsync()
//         {
//             return await _db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Users");
//         }
//     }
// }
// Mohammad Almarshad
// // File: ProductService.cs
// namespace RulesRegulation.Services
// {
//     public class ProductService
//     {
//         private readonly DatabaseConnection _db = DatabaseConnection.Instance;

//         public async Task<DataTable> GetProductsAsync()
//         {
//             return await _db.ExecuteQueryAsync("SELECT * FROM Products WHERE IsActive = 1");
//         }

//         public async Task<bool> UpdateProductPriceAsync(int productId, decimal price)
//         {
//             var rowsAffected = await _db.ExecuteNonQueryAsync(
//                 "UPDATE Products SET Price = @Price WHERE Id = @Id",
//                 DatabaseConnection.CreateParameter("@Price", price),
//                 DatabaseConnection.CreateParameter("@Id", productId)
//             );
            
//             return rowsAffected > 0;
//         }
//     }
// }