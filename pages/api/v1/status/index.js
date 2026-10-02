import database from "infra/database.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const [versionResult, maxConnectionsResult, databaseNameResult] =
      await Promise.all([
        database.query("SHOW server_version;"),
        database.query("SHOW max_connections;"),
        database.query("SELECT current_database() AS name;"),
      ]);

    const databaseVersionValue = versionResult.rows[0].server_version;
    const databaseMaxConnectionsValue =
      maxConnectionsResult.rows[0].max_connections;
    const databaseName = databaseNameResult.rows[0].name;

    const databaseOpenConnectionsResult = await database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });

    const databaseOpenConnectionsValue =
      databaseOpenConnectionsResult.rows[0].count;

    return response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          status: "healthy",
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue, 10),
          opened_connections: databaseOpenConnectionsValue,
        },
      },
    });
  } catch (error) {
    console.error("[status] database health check failed:", error.message);

    return response.status(503).json({
      updated_at: new Date().toISOString(),
      dependencies: {
        database: {
          status: "unhealthy",
        },
      },
    });
  }
}

export default status;
