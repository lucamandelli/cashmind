/**
 * Vitest global setup — starts a PostgreSQL Testcontainer, runs Prisma
 * migrations against it, and provides the DATABASE_URL to all test workers
 * via Vitest's `provide` mechanism.
 *
 * Runs once for the whole suite in the main Vitest process.
 */
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import type { ProvidedContext } from "vitest";

// Vitest passes the Vitest instance as the first argument to setup().
type VitestLike = {
  provide: <T extends keyof ProvidedContext & string>(
    key: T,
    value: ProvidedContext[T],
  ) => void;
};

let stopContainer: (() => Promise<void>) | undefined;

export async function setup(vitest: VitestLike) {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("cashmind_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  // Run Prisma migrations against the test database.
  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "pipe",
  });

  // Provide the URL to test workers via Vitest's provide/inject mechanism.
  vitest.provide("TEST_DATABASE_URL", databaseUrl);

  stopContainer = async () => {
    await container.stop();
  };
}

export async function teardown() {
  await stopContainer?.();
}
