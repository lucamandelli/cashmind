import type { Account } from "@cashmind/shared";
import { apiFetch } from "@/services/api";

export async function listAccounts(includeArchived: boolean): Promise<Account[]> {
  const url = includeArchived ? "/api/accounts?includeArchived=true" : "/api/accounts";
  const res = await apiFetch(url);
  return res.json() as Promise<Account[]>;
}

export async function createAccount(data: {
  name: string;
  initialBalance: number;
  currency: string;
}): Promise<Account> {
  const res = await apiFetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json() as Promise<Account>;
}

export async function updateAccount(
  id: string,
  data: { name: string; initialBalance: number },
): Promise<Account> {
  const res = await apiFetch(`/api/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json() as Promise<Account>;
}

export async function archiveAccount(id: string): Promise<void> {
  await apiFetch(`/api/accounts/${id}/archive`, { method: "POST" });
}

export async function unarchiveAccount(id: string): Promise<void> {
  await apiFetch(`/api/accounts/${id}/unarchive`, { method: "POST" });
}

export async function deleteAccount(id: string): Promise<void> {
  await apiFetch(`/api/accounts/${id}`, { method: "DELETE" });
}
