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
  const response = await fetch("http://127.0.0.1:3000/api/v1/migrations", {
    method: "POST",
  });

  if (![200, 201].includes(response.status)) {
    const body = await response.text();
    throw new Error(`Failed to run migrations: ${response.status} ${body}`);
  }
}

async function registerUser(email) {
  const response = await fetch("http://127.0.0.1:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Post Tester",
      email,
      password: "SenhaSegura123",
    }),
  });

  expect(response.status).toBe(201);
  return response.json();
}

test("GET /api/v1/posts should return empty array initially", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/posts");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBe(0);
});

test("POST /api/v1/posts should create a new post", async () => {
  const auth = await registerUser("post-create@example.com");
  const newPost = {
    title: "Introduction to JavaScript",
    content: "Learn the basics of JavaScript programming",
  };

  const response = await fetch("http://127.0.0.1:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(newPost),
  });

  expect(response.status).toBe(201);
  const responseBody = await response.json();

  expect(responseBody.id).toBeDefined();
  expect(responseBody.title).toBe(newPost.title);
  expect(responseBody.content).toBe(newPost.content);
  expect(responseBody.author).toBe(auth.user.name);
  expect(responseBody.created_at).toBeDefined();
  expect(responseBody.updated_at).toBeDefined();
});

test("GET /api/v1/posts should return posts", async () => {
  const auth = await registerUser("post-list@example.com");
  const newPost = {
    title: "Advanced React",
    content: "Deep dive into React hooks and performance",
  };

  await fetch("http://127.0.0.1:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(newPost),
  });

  const response = await fetch("http://127.0.0.1:3000/api/v1/posts");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});

test("POST /api/v1/posts should return 400 for missing fields", async () => {
  const auth = await registerUser("post-invalid@example.com");
  const invalidPost = {
    title: "Missing Content",
  };

  const response = await fetch("http://127.0.0.1:3000/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(invalidPost),
  });

  expect(response.status).toBe(400);
});
