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

test("POST /api/v1/auth/register and /api/v1/auth/login should authenticate a user", async () => {
  const registration = await fetch(
    "http://localhost:3000/api/v1/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Teste Usuario",
        email: "teste@example.com",
        password: "SenhaSegura123",
      }),
    },
  );

  expect(registration.status).toBe(201);
  const registrationBody = await registration.json();
  expect(registrationBody.user).toBeDefined();
  expect(registrationBody.token).toBeDefined();

  const login = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "teste@example.com",
      password: "SenhaSegura123",
    }),
  });

  expect(login.status).toBe(200);
  const loginBody = await login.json();
  expect(loginBody.token).toBeDefined();
  expect(loginBody.user.email).toBe("teste@example.com");
});
