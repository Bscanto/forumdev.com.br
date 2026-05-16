const { spawn, execSync } = require("child_process");
const fs = require("fs");
const net = require("net");
const path = require("path");
const { Client } = require("pg");

const workspaceDir = path.resolve(__dirname, "../");
const pidFile = path.join(__dirname, ".next-server.pid");

function waitForPort(host, port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = new net.Socket();

      socket.setTimeout(1000);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
      socket.once("timeout", () => {
        socket.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
      socket.connect(port, host);
    };

    tryConnect();
  });
}

async function waitForPostgres(timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const client = new Client({
      host: process.env.POSTGRES_HOST || "127.0.0.1",
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });

    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      return;
    } catch (error) {
      await client.end().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error("Timed out waiting for Postgres to become ready");
}

module.exports = async () => {
  console.log("[jestGlobalSetup] Starting Docker services...");
  execSync("docker compose -f infra/compose.yaml up -d", {
    cwd: workspaceDir,
    stdio: "inherit",
  });

  console.log(
    "[jestGlobalSetup] Waiting for Postgres to accept connections...",
  );
  await waitForPort("127.0.0.1", 5432);
  await waitForPostgres();

  console.log("[jestGlobalSetup] Starting Next.js server...");
  const nextBin = path.join(
    workspaceDir,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  const nextProcess = spawn(
    process.execPath,
    [nextBin, "dev", "-H", "127.0.0.1", "-p", "3000"],
    {
      cwd: workspaceDir,
      env: { ...process.env, NODE_ENV: "development" },
      stdio: "ignore",
      detached: true,
    },
  );

  nextProcess.unref();
  fs.writeFileSync(pidFile, String(nextProcess.pid));

  await waitForPort("127.0.0.1", 3000);
  console.log(
    "[jestGlobalSetup] Next.js server is ready on http://127.0.0.1:3000",
  );
};
