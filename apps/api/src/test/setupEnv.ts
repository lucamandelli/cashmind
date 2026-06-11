/**
 * Vitest setupFiles — runs inside each test worker before test modules load.
 * Injects the Testcontainer DATABASE_URL (provided by globalSetup) into
 * process.env so that env.ts validates successfully and PrismaClient connects
 * to the test database.
 */
import { inject } from "vitest";

const testDatabaseUrl = inject("TEST_DATABASE_URL");
if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL was not provided by globalSetup. Is the Testcontainer running?",
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.BETTER_AUTH_SECRET = "test-secret-32-chars-long-enough!!";
process.env.BETTER_AUTH_URL = "http://localhost:3001";
process.env.WEB_ORIGIN = "http://localhost:5173";
process.env.NODE_ENV = "test";
