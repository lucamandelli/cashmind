import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["src/test/globalSetup.ts"],
    setupFiles: ["src/test/setupEnv.ts"],
    // Run tests sequentially so they share one container lifecycle without races.
    singleFork: true,
  },
});
