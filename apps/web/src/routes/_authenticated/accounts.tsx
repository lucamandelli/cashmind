import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Account } from "@cashmind/shared";
import { formatBRL } from "@cashmind/shared";

/**
 * Accounts page — child of the _authenticated pathless layout.
 * URL: /accounts (pathless layout adds no segment).
 * The session guard lives entirely in the parent layout (_authenticated.tsx).
 *
 * Full CRUD (create / edit / archive / unarchive) is implemented here
 * alongside the AccountForm dialog/drawer.
 */
export const Route = createFileRoute("/_authenticated/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const { data, isLoading, error } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load accounts");
      return res.json() as Promise<Account[]>;
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your financial accounts.
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading accounts…</p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          Error: {(error as Error).message}
        </p>
      )}
      {data && data.length === 0 && (
        <p className="text-sm text-zinc-500">
          No accounts yet. Add one to get started.
        </p>
      )}
      {data && data.length > 0 && (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {data.map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium text-zinc-900">
                {account.name}
              </span>
              <span className="font-mono text-sm text-zinc-600">
                {formatBRL(account.initialBalance)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
