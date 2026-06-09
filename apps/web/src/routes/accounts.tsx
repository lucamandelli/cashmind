import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import type { Account } from "@cashmind/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/accounts")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/login" });
  },
  component: AccountsPage,
});

function AccountsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load accounts");
      return res.json() as Promise<Account[]>;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setCreateError("Failed to create account");
      return;
    }
    setName("");
    await queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/login" }) },
    });
  };

  return (
    <main className="p-8 font-sans max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <Input
          placeholder="Account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit">Add</Button>
      </form>
      {createError && <p className="text-sm text-red-500 mb-4">{createError}</p>}

      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && data.length === 0 && (
        <p className="text-gray-500">No accounts yet. Add one above.</p>
      )}
      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((account) => (
            <li key={account.id} className="rounded border p-3">
              {account.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
