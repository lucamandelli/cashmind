import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "@/services/api";
import {
  listAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
} from "./accountsApi";

const apiFetchMock = vi.spyOn(api, "apiFetch");

function fakeRes(body: unknown): Response {
  return { ok: true, json: () => Promise.resolve(body) } as unknown as Response;
}

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("listAccounts", () => {
  it("calls /api/accounts without query when includeArchived=false", async () => {
    apiFetchMock.mockResolvedValue(fakeRes([]));
    await listAccounts(false);
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts");
  });

  it("calls /api/accounts?includeArchived=true when true", async () => {
    apiFetchMock.mockResolvedValue(fakeRes([]));
    await listAccounts(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts?includeArchived=true");
  });
});

describe("createAccount", () => {
  it("POSTs to /api/accounts with the correct body", async () => {
    apiFetchMock.mockResolvedValue(fakeRes({ id: "1" }));
    await createAccount({ name: "Savings", initialBalance: 10000, currency: "BRL" });
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "Savings", initialBalance: 10000, currency: "BRL" }),
    });
  });
});

describe("updateAccount", () => {
  it("PATCHes /api/accounts/:id with name and initialBalance", async () => {
    apiFetchMock.mockResolvedValue(fakeRes({ id: "1" }));
    await updateAccount("abc", { name: "Checking", initialBalance: -500 });
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts/abc", {
      method: "PATCH",
      body: JSON.stringify({ name: "Checking", initialBalance: -500 }),
    });
  });
});

describe("archiveAccount", () => {
  it("POSTs to /api/accounts/:id/archive", async () => {
    apiFetchMock.mockResolvedValue(fakeRes({}));
    await archiveAccount("xyz");
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts/xyz/archive", { method: "POST" });
  });
});

describe("unarchiveAccount", () => {
  it("POSTs to /api/accounts/:id/unarchive", async () => {
    apiFetchMock.mockResolvedValue(fakeRes({}));
    await unarchiveAccount("xyz");
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts/xyz/unarchive", { method: "POST" });
  });
});

describe("deleteAccount", () => {
  it("DELETEs /api/accounts/:id", async () => {
    apiFetchMock.mockResolvedValue(fakeRes({}));
    await deleteAccount("xyz");
    expect(apiFetchMock).toHaveBeenCalledWith("/api/accounts/xyz", { method: "DELETE" });
  });
});
