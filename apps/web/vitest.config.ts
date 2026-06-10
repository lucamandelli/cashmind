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
    // Pure unit tests only — no DOM tests in this project yet.
    // Switch to "jsdom" (+ install jsdom) when component tests are added.
    environment: "node",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
});
