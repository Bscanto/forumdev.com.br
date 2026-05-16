const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const workspaceDir = path.resolve(__dirname, "../");
const pidFile = path.join(__dirname, ".next-server.pid");

module.exports = async () => {
  if (fs.existsSync(pidFile)) {
    try {
      const pid = parseInt(fs.readFileSync(pidFile, "utf8"), 10);
      if (!Number.isNaN(pid)) {
        process.kill(pid);
        console.log(`[jestGlobalTeardown] Stopped Next.js server (pid=${pid})`);
      }
    } catch (error) {
      console.error(
        "[jestGlobalTeardown] Error stopping Next.js server:",
        error,
      );
    }
    fs.unlinkSync(pidFile);
  }

  try {
    console.log("[jestGlobalTeardown] Stopping Docker services...");
    execSync("docker compose -f infra/compose.yaml down", {
      cwd: workspaceDir,
      stdio: "inherit",
    });
  } catch (error) {
    console.error(
      "[jestGlobalTeardown] Error stopping Docker services:",
      error,
    );
  }
};
