import database from "infra/database.js";


async function status(request, response) {
  const updateAt = new Date(). toISOString();

  const dataBaseVersionResult = await database.query(
    "SHOW server_version;");
  const databaseVersionValue = dataBaseVersionResult.rows[0].server_version;


  const databaseMaxConnectonsResult = await database.query("SHOW max_connections;");
  const databaseMaxConnectionsValue = databaseMaxConnectonsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenndConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName]
  });
  const databaseOpennedConnectionsValue = databaseOpenndConnectionsResult.rows[0].count;
  

  response.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpennedConnectionsValue,
      },
    },
  });
}

export default status; 