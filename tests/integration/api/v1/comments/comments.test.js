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

test("POST /api/v1/comments should create a comment when authorized", async () => {
  const registerResponse = await fetch(
    "http://localhost:3000/api/v1/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Comentador",
        email: "comentador@example.com",
        password: "Senha12345",
      }),
    },
  );
  expect(registerResponse.status).toBe(201);
  const registerBody = await registerResponse.json();

  const postResponse = await fetch("http://localhost:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Post para comment",
      content: "Conteúdo do post para comentário.",
      author: "Autor Teste",
    }),
  });

  expect(postResponse.status).toBe(201);
  const createdPost = await postResponse.json();

  const commentResponse = await fetch("http://localhost:3000/api/v1/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${registerBody.token}`,
    },
    body: JSON.stringify({
      postId: createdPost.id,
      content: "Comentário de teste.",
    }),
  });

  expect(commentResponse.status).toBe(201);
  const commentBody = await commentResponse.json();
  expect(commentBody.post_id).toBe(createdPost.id);
  expect(commentBody.content).toBe("Comentário de teste.");
});
