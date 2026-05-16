import { getUserFromHeaders, userHasRole } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).end();
  }

  const requester = await getUserFromHeaders(request.headers);
  if (!requester || !userHasRole(requester, "admin")) {
    return response
      .status(403)
      .json({ error: "Apenas administradores podem acessar." });
  }

  try {
    const result = await database.query({
      text: "SELECT id, name, email, role FROM users ORDER BY created_at DESC;",
    });
    response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao listar usuários." });
  }
}
