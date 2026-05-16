import database from "infra/database.js";

beforeAll(async () => {
  await cleanDatabase();
  await runMigrations();
});

async function cleanDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function runMigrations() {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  if (![200, 201].includes(response.status)) {
    const body = await response.text();
    throw new Error(`Failed to run migrations: ${response.status} ${body}`);
  }
}

test("PUT /api/v1/posts/:id should update an existing post", async () => {
  const createResponse = await fetch("http://localhost:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Original Title",
      content: "Original content.",
      author: "Original Author",
    }),
  });

  expect(createResponse.status).toBe(201);
  const createdPost = await createResponse.json();

  const updateResponse = await fetch(
    `http://localhost:3000/api/v1/posts/${createdPost.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Updated Title",
        content: "Updated content.",
      }),
    },
  );

  expect(updateResponse.status).toBe(200);
  const updatedPost = await updateResponse.json();

  expect(updatedPost.id).toBe(createdPost.id);
  expect(updatedPost.title).toBe("Updated Title");
  expect(updatedPost.content).toBe("Updated content.");
  expect(updatedPost.author).toBe("Original Author");
  expect(new Date(updatedPost.updated_at).getTime()).toBeGreaterThan(
    new Date(updatedPost.created_at).getTime() - 1,
  );
});

test("DELETE /api/v1/posts/:id should remove a post", async () => {
  const createResponse = await fetch("http://localhost:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Post to delete",
      content: "This post will be removed.",
      author: "Remover",
    }),
  });

  expect(createResponse.status).toBe(201);
  const createdPost = await createResponse.json();

  const deleteResponse = await fetch(
    `http://localhost:3000/api/v1/posts/${createdPost.id}`,
    {
      method: "DELETE",
    },
  );

  expect(deleteResponse.status).toBe(204);

  const getResponse = await fetch(
    `http://localhost:3000/api/v1/posts/${createdPost.id}`,
  );
  expect(getResponse.status).toBe(404);
});
