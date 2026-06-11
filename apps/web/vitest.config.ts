import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cashmind/shared": path.resolve(
        __dirname,
        "../../packages/shared/src/index.ts",
      ),
    },
  },
  test: {
    // Pure unit tests only — no DOM/component tests in this project yet.
    // To add component/.tsx tests: run `npm install -D jsdom` (in apps/web)
    // and change environment to "jsdom".
    environment: "node",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
});
