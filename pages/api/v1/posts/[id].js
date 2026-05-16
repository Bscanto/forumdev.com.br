import database from "infra/database.js";

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === "GET") {
    return getPost(id, request, response);
  }
  if (request.method === "PUT") {
    return updatePost(id, request, response);
  }
  if (request.method === "DELETE") {
    return deletePost(id, request, response);
  }
  return response.status(405).end();
}

async function getPost(id, request, response) {
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
               c.name AS category
          FROM posts p
          LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1;
      `,
      values: [id],
    });

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Post not found" });
    }

    response.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to fetch post" });
  }
}

async function updatePost(id, request, response) {
  const { title, content, author, categoryId } = request.body;

  try {
    const result = await database.query({
      text: `
        UPDATE posts
           SET title = COALESCE($2, title),
               content = COALESCE($3, content),
               author = COALESCE($4, author),
               category_id = COALESCE($5, category_id),
               updated_at = NOW()
         WHERE id = $1
         RETURNING id, title, content, author, created_at, updated_at, category_id;
      `,
      values: [
        id,
        title || null,
        content || null,
        author || null,
        categoryId || null,
      ],
    });

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Post not found" });
    }

    const post = result.rows[0];
    if (post.category_id) {
      const categoryResult = await database.query({
        text: "SELECT name FROM categories WHERE id = $1 LIMIT 1;",
        values: [post.category_id],
      });
      post.category = categoryResult.rows[0]?.name || null;
    }

    response.status(200).json(post);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to update post" });
  }
}

async function deletePost(id, request, response) {
  try {
    const result = await database.query({
      text: "DELETE FROM posts WHERE id = $1 RETURNING id;",
      values: [id],
    });

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Post not found" });
    }

    response.status(204).end();
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to delete post" });
  }
}
