import { comparePassword, signToken } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).end();
  }

  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const emailLower = email.toLowerCase();
    const result = await database.query({
      text: "SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1;",
      values: [emailLower],
    });

    if (result.rows.length === 0) {
      return response.status(401).json({ error: "Credenciais inválidas." });
    }

    const user = result.rows[0];
    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return response.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = signToken({ userId: user.id, role: user.role });
    response.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao autenticar." });
  }
}
