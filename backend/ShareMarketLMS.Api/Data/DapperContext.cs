using System.Data;
using Npgsql;

namespace ShareMarketLMS.Api.Data;

/// <summary>
/// Connection factory for Dapper. Used for flat read queries where EF's change tracking
/// and object graph add nothing; EF Core remains the path for writes, relationships and schema.
/// </summary>
public class DapperContext(IConfiguration config)
{
    private readonly string _connectionString = config.GetConnectionString("Default")!;

    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}
