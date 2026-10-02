import { getUserFromHeaders } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    return listPosts(request, response);
  }
  if (request.method === "POST") {
    return createPost(request, response);
  }

  response.setHeader("Allow", ["GET", "POST"]);
  return response.status(405).json({ error: "Método não permitido." });
}

async function listPosts(request, response) {
  const { category, q } = request.query;

  try {
    let queryText = `
      SELECT p.id,
             p.title,
             p.content,
             p.author,
             p.created_at,
             p.updated_at,
             p.category_id,
             p.user_id AS owner_id,
             c.name AS category
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    const values = [];
    const conditions = [];

    if (category) {
      values.push(String(category));
      conditions.push(`c.name = $${values.length}`);
    }

    if (q) {
      values.push(`%${String(q).trim()}%`);
      conditions.push(
        `(p.title ILIKE $${values.length} OR p.content ILIKE $${values.length})`,
      );
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryText += " ORDER BY p.created_at DESC;";

    const result = await database.query({ text: queryText, values });
    return response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao buscar posts." });
  }
}

async function createPost(request, response) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return response
      .status(401)
      .json({ error: "É necessário estar logado para publicar." });
  }

  const { title, content, categoryId } = request.body || {};

  if (typeof title !== "string" || title.trim().length < 5) {
    return response
      .status(400)
      .json({ error: "Título deve ter ao menos 5 caracteres." });
  }

  if (typeof content !== "string" || content.trim().length < 20) {
    return response
      .status(400)
      .json({ error: "Conteúdo deve ter ao menos 20 caracteres." });
  }

  if (
    categoryId !== undefined &&
    categoryId !== null &&
    typeof categoryId !== "string"
  ) {
    return response.status(400).json({ error: "categoryId inválido." });
  }

  try {
    if (categoryId) {
      const categoryCheck = await database.query({
        text: "SELECT id FROM categories WHERE id = $1 LIMIT 1;",
        values: [categoryId],
      });

      if (categoryCheck.rows.length === 0) {
        return response.status(400).json({ error: "Categoria não encontrada." });
      }
    }

    const result = await database.query({
      text: `
        INSERT INTO posts (title, content, author, category_id, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, content, author, created_at, updated_at, category_id, user_id AS owner_id;
      `,
      values: [
        title.trim(),
        content.trim(),
        user.name,
        categoryId || null,
        user.id,
      ],
    });

    const post = result.rows[0];

    if (post.category_id) {
      const categoryResult = await database.query({
        text: "SELECT name FROM categories WHERE id = $1 LIMIT 1;",
        values: [post.category_id],
      });
      post.category = categoryResult.rows[0]?.name || null;
    }

    return response.status(201).json(post);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao criar post." });
  }
}
