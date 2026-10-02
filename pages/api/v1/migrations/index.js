import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migration(request, response) {
  if (process.env.NODE_ENV === "production") {
    return response.status(404).json({ error: "Not found." });
  }

  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", ["GET", "POST"]);
    return response.status(405).json({ error: "Método não permitido." });
  }

  const dbClient = await database.getNewClient();

  try {
    const defaultMigrationsOptions = {
      dbClient,
      dryRun: request.method === "GET",
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: false,
      migrationsTable: "mpmigrations",
    };

    const migrations = await migrationRunner(defaultMigrationsOptions);

    if (request.method === "POST" && migrations.length > 0) {
      return response.status(201).json(migrations);
    }

    return response.status(200).json(migrations);
  } catch (error) {
    console.error("[migrations] failed:", error.message);
    return response
      .status(500)
      .json({ error: "Falha ao executar migrations." });
  } finally {
    await dbClient.end();
  }
}
