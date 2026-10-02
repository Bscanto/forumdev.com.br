// Script de seed para criar/atualizar usuário admin inicial
// Uso: node infra/seeds/create_admin.js

require("dotenv").config({ path: ".env.development" });
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

function getConnectionConfig() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("$")) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes("sslmode=require") ||
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  return {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  };
}

async function run() {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Defina SEED_ADMIN_NAME, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD antes de executar o seed.",
    );
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
  }

  const client = new Client(getConnectionConfig());

  await client.connect();

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;

      await client.query(
        "UPDATE users SET name = $1, password_hash = $2, role = $3, updated_at = now() WHERE id = $4",
        [name, passwordHash, "admin", id],
      );

      console.log(`Usuário existente atualizado para admin: ${email}`);
      return;
    }

    const insert = await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, passwordHash, "admin"],
    );

    console.log(`Usuário admin criado: ${email} (id=${insert.rows[0].id})`);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Erro ao criar/atualizar admin:", error.message);
    process.exit(1);
  });
}
