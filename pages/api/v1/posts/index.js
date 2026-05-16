import { getUserFromHeaders } from "infra/auth.js";
import database from "infra/database.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    return listPosts(request, response);
  }
  if (request.method === "POST") {
    return createPost(request, response);
  }
  return response.status(405).end();
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
             p.user_id as owner_id,
             c.name AS category
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    const values = [];

    if (category) {
      values.push(category);
      queryText += ` WHERE c.name = $${values.length}`;
    }

    if (q) {
      const term = `%${q}%`;
      values.push(term);
      queryText += values.length === 1 ? ` WHERE (p.title ILIKE $${values.length} OR p.content ILIKE $${values.length})` : ` AND (p.title ILIKE $${values.length} OR p.content ILIKE $${values.length})`;
    }

    queryText += " ORDER BY p.created_at DESC;";

    const result = await database.query({ text: queryText, values });
    response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch posts" });
  }
}

async function createPost(request, response) {
  const user = await getUserFromHeaders(request.headers);
  const { title, content, author, categoryId } = request.body;

  if (!title || !content) {
    return response.status(400).json({
      error: "Missing required fields: title and content",
    });
  }

  const effectiveAuthor = author || user?.name || "Anônimo";
  const userId = user?.id || null;

  try {
    const result = await database.query({
      text: `
        INSERT INTO posts (title, content, author, category_id, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, content, author, created_at, updated_at, category_id;
      `,
      values: [title, content, effectiveAuthor, categoryId || null, userId],
    });

    const post = result.rows[0];

    if (post.category_id) {
      const categoryResult = await database.query({
        text: "SELECT name FROM categories WHERE id = $1 LIMIT 1;",
        values: [post.category_id],
      });
      post.category = categoryResult.rows[0]?.name || null;
    }

    response.status(201).json(post);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to create post" });
  }
}
