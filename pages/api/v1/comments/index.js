import { getUserFromHeaders } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    return listComments(request, response);
  }

  if (request.method === "POST") {
    return createComment(request, response);
  }

  return response.status(405).end();
}

async function listComments(request, response) {
  const { postId } = request.query;
  if (!postId) {
    return response.status(400).json({ error: "postId é obrigatório." });
  }

  try {
    const result = await database.query({
      text: `
        SELECT c.id, c.post_id, c.content, c.created_at, c.updated_at,
               u.name AS author
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC;
      `,
      values: [postId],
    });

    response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao buscar comentários." });
  }
}

async function createComment(request, response) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return response
      .status(401)
      .json({ error: "É necessário estar logado para comentar." });
  }

  const { postId, content } = request.body;
  if (!postId || !content) {
    return response
      .status(400)
      .json({ error: "postId e content são obrigatórios." });
  }

  try {
    const result = await database.query({
      text: `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, post_id, content, created_at, updated_at;
      `,
      values: [postId, user.id, content],
    });

    response.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Falha ao criar comentário." });
  }
}
