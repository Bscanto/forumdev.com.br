import { getUserFromHeaders } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    return listCategories(request, response);
  }

  if (request.method === "POST") {
    return createCategory(request, response);
  }

  return response.status(405).end();
}

async function listCategories(request, response) {
  try {
    const result = await database.query({
      text: "SELECT id, name, description FROM categories ORDER BY name ASC;",
    });
    response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao buscar categorias." });
  }
}

async function createCategory(request, response) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return response.status(401).json({ error: "Não autorizado." });
  }

  const { name, description } = request.body;
  if (!name || !description) {
    return response
      .status(400)
      .json({ error: "Nome e descrição são obrigatórios." });
  }

  if (typeof name !== "string" || name.trim().length < 3) {
    return response
      .status(400)
      .json({ error: "Nome de categoria deve ter pelo menos 3 caracteres." });
  }

  if (typeof description !== "string" || description.trim().length < 10) {
    return response
      .status(400)
      .json({ error: "Descrição deve ter pelo menos 10 caracteres." });
  }

  try {
    const existing = await database.query({
      text: "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1;",
      values: [name],
    });

    if (existing.rows.length > 0) {
      return response.status(409).json({ error: "Categoria já existe." });
    }

    const result = await database.query({
      text: "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id, name, description;",
      values: [name, description],
    });

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao criar categoria." });
  }
}
