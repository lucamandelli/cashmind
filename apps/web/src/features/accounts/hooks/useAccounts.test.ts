import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import * as accountsApi from "@/features/accounts/services/accountsApi";
import { useAccounts, useSaveAccount, useToggleArchive, useDeleteAccount, accountKeys } from "./useAccounts";
import type { Account } from "@cashmind/shared";

vi.mock("@/features/accounts/services/accountsApi");

const listMock = vi.mocked(accountsApi.listAccounts);
const createMock = vi.mocked(accountsApi.createAccount);
const updateMock = vi.mocked(accountsApi.updateAccount);
const archiveMock = vi.mocked(accountsApi.archiveAccount);
const unarchiveMock = vi.mocked(accountsApi.unarchiveAccount);
const deleteMock = vi.mocked(accountsApi.deleteAccount);

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "1",
    name: "Savings",
    initialBalance: 10000,
    currency: "BRL",
    archivedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "u1",
    ...overrides,
  } as Account;
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAccounts", () => {
  it("calls listAccounts with the includeArchived flag", async () => {
    listMock.mockResolvedValue([makeAccount()]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAccounts(false), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listMock).toHaveBeenCalledWith(false);
  });
});

describe("useSaveAccount", () => {
  it("calls createAccount and invalidates accountKeys on success", async () => {
    createMock.mockResolvedValue(makeAccount());
    const { queryClient, wrapper } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSaveAccount(), { wrapper });

    await result.current.mutateAsync({ mode: "create", name: "New", initialBalance: 5000 });

    expect(createMock).toHaveBeenCalledWith({ name: "New", initialBalance: 5000, currency: "BRL" });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: accountKeys.all });
  });

  it("calls updateAccount for edit mode", async () => {
    updateMock.mockResolvedValue(makeAccount({ name: "Updated" }));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSaveAccount(), { wrapper });

    await result.current.mutateAsync({ mode: "edit", id: "1", name: "Updated", initialBalance: 5000 });

    expect(updateMock).toHaveBeenCalledWith("1", { name: "Updated", initialBalance: 5000 });
  });

  it("surfaces error on mutation failure", async () => {
    createMock.mockRejectedValue(new Error("Server error"));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSaveAccount(), { wrapper });

    await expect(
      result.current.mutateAsync({ mode: "create", name: "X", initialBalance: 0 }),
    ).rejects.toThrow("Server error");
    await waitFor(() => expect(result.current.error).toBeTruthy());
  });
});

describe("useToggleArchive", () => {
  it("calls archiveAccount for active accounts", async () => {
    archiveMock.mockResolvedValue(undefined);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useToggleArchive(), { wrapper });
    const account = makeAccount({ archivedAt: null });

    await result.current.mutateAsync(account);
    expect(archiveMock).toHaveBeenCalledWith("1");
  });

  it("calls unarchiveAccount for archived accounts", async () => {
    unarchiveMock.mockResolvedValue(undefined);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useToggleArchive(), { wrapper });
    const account = makeAccount({ archivedAt: new Date().toISOString() });

    await result.current.mutateAsync(account);
    expect(unarchiveMock).toHaveBeenCalledWith("1");
  });
});

describe("useDeleteAccount", () => {
  it("calls deleteAccount and invalidates on success", async () => {
    deleteMock.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await result.current.mutateAsync("1");
    expect(deleteMock).toHaveBeenCalledWith("1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: accountKeys.all });
  });
});
