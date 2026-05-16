import { getUserFromHeaders, userHasRole } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  const { id } = request.query;
  if (request.method !== "PATCH") {
    return response.status(405).end();
  }

  const requester = await getUserFromHeaders(request.headers);
  if (!requester || !userHasRole(requester, "admin")) {
    return response
      .status(403)
      .json({ error: "Apenas administradores podem alterar roles." });
  }

  const { role } = request.body;
  if (!role || !["user", "moderator", "admin"].includes(role)) {
    return response.status(400).json({ error: "Role inválida." });
  }

  try {
    const result = await database.query({
      text: "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role;",
      values: [role, id],
    });

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Usuário não encontrado." });
    }

    return response.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao alterar role." });
  }
}
