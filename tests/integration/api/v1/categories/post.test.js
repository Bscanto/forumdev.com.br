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

test("POST /api/v1/categories should require authentication", async () => {
  const response = await fetch("http://localhost:3000/api/v1/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "DevOps",
      description: "Infraestrutura e automação.",
    }),
  });

  expect(response.status).toBe(401);
});

test("POST /api/v1/categories should create a category when authenticated", async () => {
  const registerResponse = await fetch(
    "http://localhost:3000/api/v1/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Tester",
        email: "category-test@example.com",
        password: "SenhaForte123",
      }),
    },
  );
  expect(registerResponse.status).toBe(201);
  const registerBody = await registerResponse.json();
  expect(registerBody.token).toBeDefined();

  const response = await fetch("http://localhost:3000/api/v1/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${registerBody.token}`,
    },
    body: JSON.stringify({
      name: "DevOps",
      description: "Infraestrutura e automação.",
    }),
  });

  expect(response.status).toBe(201);
  const output = await response.json();
  expect(output.name).toBe("DevOps");
  expect(output.description).toBe("Infraestrutura e automação.");
});
