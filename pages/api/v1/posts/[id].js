import { getUserFromHeaders, userHasRole } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === "GET") {
    return getPost(id, response);
  }
  if (request.method === "PUT") {
    return updatePost(id, request, response);
  }
  if (request.method === "DELETE") {
    return deletePost(id, request, response);
  }

  response.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return response.status(405).json({ error: "Método não permitido." });
}

async function getPost(id, response) {
  try {
    const result = await database.query({
      text: `
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
         WHERE p.id = $1;
      `,
      values: [id],
    });

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Post não encontrado." });
    }

    return response.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao buscar post." });
  }
}

async function updatePost(id, request, response) {
  const user = await getUserFromHeaders(request.headers);

  if (!user) {
    return response.status(401).json({ error: "Não autorizado." });
  }

  const { title, content, categoryId } = request.body || {};

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 5)) {
    return response
      .status(400)
      .json({ error: "Título deve ter ao menos 5 caracteres." });
  }

  if (
    content !== undefined &&
    (typeof content !== "string" || content.trim().length < 20)
  ) {
    return response
      .status(400)
      .json({ error: "Conteúdo deve ter ao menos 20 caracteres." });
  }

  try {
    const existing = await database.query({
      text: "SELECT user_id FROM posts WHERE id = $1 LIMIT 1;",
      values: [id],
    });

    if (existing.rows.length === 0) {
      return response.status(404).json({ error: "Post não encontrado." });
    }

    const ownerId = existing.rows[0].user_id;
    if (
      user.id !== ownerId &&
      !userHasRole(user, ["admin", "moderator"])
    ) {
      return response.status(403).json({ error: "Não autorizado." });
    }

    if (categoryId) {
      const category = await database.query({
        text: "SELECT id FROM categories WHERE id = $1 LIMIT 1;",
        values: [categoryId],
      });

      if (category.rows.length === 0) {
        return response.status(400).json({ error: "Categoria não encontrada." });
      }
    }

    const result = await database.query({
      text: `
        UPDATE posts
           SET title = COALESCE($2, title),
               content = COALESCE($3, content),
               category_id = CASE WHEN $4::boolean THEN $5::uuid ELSE category_id END,
               updated_at = NOW()
         WHERE id = $1
         RETURNING id, title, content, author, created_at, updated_at, category_id, user_id AS owner_id;
      `,
      values: [
        id,
        title !== undefined ? title.trim() : null,
        content !== undefined ? content.trim() : null,
        Object.prototype.hasOwnProperty.call(request.body || {}, "categoryId"),
        categoryId || null,
      ],
    });

    const post = result.rows[0];

    if (post.category_id) {
      const categoryResult = await database.query({
        text: "SELECT name FROM categories WHERE id = $1 LIMIT 1;",
        values: [post.category_id],
      });
      post.category = categoryResult.rows[0]?.name || null;
    } else {
      post.category = null;
    }

    return response.status(200).json(post);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao atualizar post." });
  }
}

async function deletePost(id, request, response) {
  const user = await getUserFromHeaders(request.headers);

  if (!user) {
    return response.status(401).json({ error: "Não autorizado." });
  }

  try {
    const existing = await database.query({
      text: "SELECT user_id FROM posts WHERE id = $1 LIMIT 1;",
      values: [id],
    });

    if (existing.rows.length === 0) {
      return response.status(404).json({ error: "Post não encontrado." });
    }

    const ownerId = existing.rows[0].user_id;
    if (
      user.id !== ownerId &&
      !userHasRole(user, ["admin", "moderator"])
    ) {
      return response.status(403).json({ error: "Não autorizado." });
    }

    await database.query({
      text: "DELETE FROM posts WHERE id = $1;",
      values: [id],
    });

    return response.status(204).end();
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Falha ao excluir post." });
  }
}
