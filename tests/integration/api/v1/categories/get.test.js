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

test("GET /api/v1/categories should return default categories", async () => {
  const response = await fetch("http://localhost:3000/api/v1/categories");
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThanOrEqual(4);
  expect(body.map((category) => category.name)).toEqual(
    expect.arrayContaining(["JavaScript", "Backend", "Frontend", "Carreira"]),
  );
});
