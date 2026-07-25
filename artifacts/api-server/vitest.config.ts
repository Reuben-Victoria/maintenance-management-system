import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      SESSION_SECRET: "test-secret-do-not-use-in-prod",
    },
  },
});
