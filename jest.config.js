const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  globalSetup: "<rootDir>/tests/jestGlobalSetup.js",
  globalTeardown: "<rootDir>/tests/jestGlobalTeardown.js",
});

module.exports = jestConfig;
