// Script de seed para criar/atualizar usuário admin inicial
// Uso: node infra/seeds/create_admin.js

require("dotenv").config({ path: ".env.development" });
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

async function run() {
  const name = process.env.SEED_ADMIN_NAME || "canto";
  const email = (process.env.SEED_ADMIN_EMAIL || "bruno_scanto@hotmail.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "123456";

  const client = new Client({
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || "local_user",
    database: process.env.POSTGRES_DB || "local_db",
    password: process.env.POSTGRES_PASSWORD || "12345",
  });

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
    } else {
      const insert = await client.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, email, passwordHash, "admin"],
      );
      console.log(`Usuário admin criado: ${email} (id=${insert.rows[0].id})`);
    }
  } catch (err) {
    console.error("Erro ao criar/atualizar admin:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
