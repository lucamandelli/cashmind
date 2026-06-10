/**
 * Integration tests for GET/POST /accounts and PATCH/archive/unarchive endpoints.
 * Uses a real Postgres instance started by the Vitest globalSetup (Testcontainers).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../test/buildApp.js";
import { testAuth, testDb } from "../test/authForTest.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the Set-Cookie header from a better-auth login result and format it
 *  as a Cookie request header value. */
async function getCookieHeader(userId: string): Promise<string> {
  const ctx = await testAuth.$context;
  const { cookies } = await ctx.test.login({ userId });
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await testDb.$disconnect();
});

afterEach(async () => {
  // Clean financial accounts between tests (cascade via FK keeps user/session clean).
  await testDb.account.deleteMany();
  await testDb.session.deleteMany();
  await testDb.user.deleteMany();
});

// ---------------------------------------------------------------------------
// Auth gate — every endpoint must require a session
// ---------------------------------------------------------------------------

describe("auth gate", () => {
  it("GET /accounts returns 401 without a session", async () => {
    const res = await app.inject({ method: "GET", url: "/accounts" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /accounts returns 401 without a session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      payload: { name: "Nubank" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("PATCH /accounts/:id returns 401 without a session", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/accounts/fake-id",
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /accounts/:id/archive returns 401 without a session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/accounts/fake-id/archive",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /accounts/:id/unarchive returns 401 without a session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/accounts/fake-id/unarchive",
    });
    expect(res.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// CREATE — POST /accounts
// ---------------------------------------------------------------------------

describe("POST /accounts", () => {
  it("creates an account and round-trips all new fields", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Nubank", initialBalance: 5000, currency: "BRL" },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.name).toBe("Nubank");
    expect(body.initialBalance).toBe(5000);
    expect(body.currency).toBe("BRL");
    expect(body.archivedAt).toBeNull();
    expect(body.userId).toBe(user.id);
  });

  it("defaults currency to BRL when omitted", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Cash" },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().currency).toBe("BRL");
  });

  it("accepts a negative initialBalance (credit-card / debt accounts)", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Credit Card", initialBalance: -150000 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().initialBalance).toBe(-150000);
  });

  it("defaults initialBalance to 0 when omitted", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Savings" },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().initialBalance).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// LIST — GET /accounts
// ---------------------------------------------------------------------------

describe("GET /accounts", () => {
  it("returns only active accounts by default", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    // Create two accounts
    await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Active" },
    });
    const archiveRes = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "ToArchive" },
    });
    const toArchiveId = archiveRes.json().id;

    // Archive the second account
    await app.inject({
      method: "POST",
      url: `/accounts/${toArchiveId}/archive`,
      headers: { cookie },
    });

    const res = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: { cookie },
    });

    expect(res.statusCode).toBe(200);
    const list = res.json();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Active");
  });

  it("includes archived accounts when ?includeArchived=true", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const a1 = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Active" },
    });
    const a2 = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Archived" },
    });
    await app.inject({
      method: "POST",
      url: `/accounts/${a2.json().id}/archive`,
      headers: { cookie },
    });

    const res = await app.inject({
      method: "GET",
      url: "/accounts?includeArchived=true",
      headers: { cookie },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// PATCH — PATCH /accounts/:id
// ---------------------------------------------------------------------------

describe("PATCH /accounts/:id", () => {
  it("updates editable fields (name, initialBalance)", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Old Name", initialBalance: 1000 },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie },
      payload: { name: "New Name", initialBalance: 2000 },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.name).toBe("New Name");
    expect(body.initialBalance).toBe(2000);
  });

  it("does not write archivedAt even if sent in the body", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Account" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie },
      // Attempt to smuggle archivedAt through PATCH
      payload: {
        name: "Hacked",
        archivedAt: new Date().toISOString(),
      } as Record<string, unknown>,
    });

    // PATCH should succeed but archivedAt must remain null
    expect(res.statusCode).toBe(200);
    expect(res.json().archivedAt).toBeNull();
    expect(res.json().name).toBe("Hacked");
  });

  it("returns 404 for another user's account (isolation)", async () => {
    const ctx = await testAuth.$context;
    const owner = ctx.test.createUser();
    const attacker = ctx.test.createUser();
    await ctx.test.saveUser(owner);
    await ctx.test.saveUser(attacker);
    const ownerCookie = await getCookieHeader(owner.id);
    const attackerCookie = await getCookieHeader(attacker.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie: ownerCookie },
      payload: { name: "Owner Account" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie: attackerCookie },
      payload: { name: "Stolen" },
    });

    expect(res.statusCode).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// ARCHIVE / UNARCHIVE
// ---------------------------------------------------------------------------

describe("archive / unarchive", () => {
  it("archive sets archivedAt; unarchive clears it; both are idempotent", async () => {
    const ctx = await testAuth.$context;
    const user = ctx.test.createUser();
    await ctx.test.saveUser(user);
    const cookie = await getCookieHeader(user.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "MyAccount" },
    });
    const { id } = created.json();

    // Archive
    const archiveRes = await app.inject({
      method: "POST",
      url: `/accounts/${id}/archive`,
      headers: { cookie },
    });
    expect(archiveRes.statusCode).toBe(200);
    expect(archiveRes.json().archivedAt).not.toBeNull();

    // Archive again (idempotent — must not change archivedAt timestamp)
    const secondArchiveRes = await app.inject({
      method: "POST",
      url: `/accounts/${id}/archive`,
      headers: { cookie },
    });
    expect(secondArchiveRes.statusCode).toBe(200);
    expect(secondArchiveRes.json().archivedAt).toBe(archiveRes.json().archivedAt);

    // Archived account is hidden from default list
    const listRes = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: { cookie },
    });
    expect(listRes.json()).toHaveLength(0);

    // But visible with ?includeArchived=true
    const listArchivedRes = await app.inject({
      method: "GET",
      url: "/accounts?includeArchived=true",
      headers: { cookie },
    });
    expect(listArchivedRes.json()).toHaveLength(1);

    // Unarchive
    const unarchiveRes = await app.inject({
      method: "POST",
      url: `/accounts/${id}/unarchive`,
      headers: { cookie },
    });
    expect(unarchiveRes.statusCode).toBe(200);
    expect(unarchiveRes.json().archivedAt).toBeNull();

    // Unarchive again (idempotent)
    const secondUnarchiveRes = await app.inject({
      method: "POST",
      url: `/accounts/${id}/unarchive`,
      headers: { cookie },
    });
    expect(secondUnarchiveRes.statusCode).toBe(200);
    expect(secondUnarchiveRes.json().archivedAt).toBeNull();

    // Restored account appears in default list
    const restoredListRes = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: { cookie },
    });
    expect(restoredListRes.json()).toHaveLength(1);
  });

  it("archive on another user's account returns 404 (isolation)", async () => {
    const ctx = await testAuth.$context;
    const owner = ctx.test.createUser();
    const attacker = ctx.test.createUser();
    await ctx.test.saveUser(owner);
    await ctx.test.saveUser(attacker);
    const ownerCookie = await getCookieHeader(owner.id);
    const attackerCookie = await getCookieHeader(attacker.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie: ownerCookie },
      payload: { name: "Owner Account" },
    });
    const { id } = created.json();

    const res = await app.inject({
      method: "POST",
      url: `/accounts/${id}/archive`,
      headers: { cookie: attackerCookie },
    });

    expect(res.statusCode).toBe(404);
  });

  it("unarchive on another user's account returns 404 (isolation)", async () => {
    const ctx = await testAuth.$context;
    const owner = ctx.test.createUser();
    const attacker = ctx.test.createUser();
    await ctx.test.saveUser(owner);
    await ctx.test.saveUser(attacker);
    const ownerCookie = await getCookieHeader(owner.id);
    const attackerCookie = await getCookieHeader(attacker.id);

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie: ownerCookie },
      payload: { name: "Owner Account" },
    });
    const { id } = created.json();
    // Archive it first
    await app.inject({
      method: "POST",
      url: `/accounts/${id}/archive`,
      headers: { cookie: ownerCookie },
    });

    const res = await app.inject({
      method: "POST",
      url: `/accounts/${id}/unarchive`,
      headers: { cookie: attackerCookie },
    });

    expect(res.statusCode).toBe(404);
  });
});
