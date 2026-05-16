import { hashPassword, signToken } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).end();
  }

  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response
      .status(400)
      .json({ error: "Campos obrigatórios ausentes." });
  }

  if (typeof name !== "string" || name.trim().length < 3) {
    return response
      .status(400)
      .json({ error: "Nome deve ter pelo menos 3 caracteres." });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return response.status(400).json({ error: "E-mail inválido." });
  }

  if (typeof password !== "string" || password.length < 6) {
    return response
      .status(400)
      .json({ error: "Senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const emailLower = email.toLowerCase();
    const existingResult = await database.query({
      text: "SELECT id FROM users WHERE email = $1 LIMIT 1;",
      values: [emailLower],
    });

    if (existingResult.rows.length > 0) {
      return response.status(409).json({ error: "E-mail já cadastrado." });
    }

    const passwordHash = await hashPassword(password);
    const result = await database.query({
      text: "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role;",
      values: [name, emailLower, passwordHash, "user"],
    });

    const user = result.rows[0];
    const token = signToken({ userId: user.id, role: user.role });

    response.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao criar usuário." });
  }
}
