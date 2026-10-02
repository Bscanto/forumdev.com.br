import { Client } from "pg";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    return await client.query(queryObject);
  } catch (error) {
    console.error("[database] query failed:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function getNewClient() {
  const client = new Client(getConnectionConfig());
  await client.connect();
  return client;
}

function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ssl: getSSLValue(),
    };
  }

  return {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT
      ? Number(process.env.POSTGRES_PORT)
      : undefined,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValue(),
  };
}

function getSSLValue() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA.replace(/\\n/g, "\n"),
      rejectUnauthorized: true,
    };
  }

  if (
    process.env.DATABASE_URL?.includes("sslmode=require") ||
    process.env.NODE_ENV === "production"
  ) {
    return { rejectUnauthorized: false };
  }

  return false;
}

export default {
  query,
  getNewClient,
};
