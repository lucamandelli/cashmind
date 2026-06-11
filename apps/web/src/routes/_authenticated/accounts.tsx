import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Account } from "@cashmind/shared";
import { formatBRL } from "@cashmind/shared";
import { AccountForm } from "@/features/accounts/AccountForm";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";

/**
 * Accounts page — child of the _authenticated pathless layout.
 * URL: /accounts (pathless layout adds no segment).
 * The session guard lives entirely in the parent layout (_authenticated.tsx).
 */
export const Route = createFileRoute("/_authenticated/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const queryClient = useQueryClient();

  // --- local state ---
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(
    undefined,
  );
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // --- query ---
  const { data, isLoading, error } = useQuery<Account[]>({
    queryKey: ["accounts", { includeArchived: showArchived }],
    queryFn: async () => {
      const url = showArchived
        ? "/api/accounts?includeArchived=true"
        : "/api/accounts";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load accounts");
      return res.json() as Promise<Account[]>;
    },
  });

  // --- helpers ---
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

  const handleAdd = () => {
    setEditingAccount(undefined);
    setFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleArchive = async (account: Account) => {
    setArchiveError(null);
    const action = account.archivedAt ? "unarchive" : "archive";
    const res = await fetch(`/api/accounts/${account.id}/${action}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      let message = `Failed to ${action} account`;
      try {
        const json = (await res.json()) as { error?: string };
        if (json.error) message = json.error;
      } catch {
        // ignore parse error — keep the default message
      }
      setArchiveError(message);
      return;
    }
    await invalidate();
  };

  // Separate active from archived for display
  const active = data?.filter((a) => !a.archivedAt) ?? [];
  const archived = data?.filter((a) => a.archivedAt) ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track your balances across all financial accounts.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="shrink-0 bg-zinc-900 text-white hover:bg-zinc-700 gap-1.5"
          size="sm"
        >
          <Plus size={14} strokeWidth={2} />
          Add account
        </Button>
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <p className="text-sm text-zinc-500">Loading accounts…</p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          Error: {(error as Error).message}
        </p>
      )}
      {archiveError && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
          {archiveError}
        </div>
      )}

      {/* Active accounts */}
      {!isLoading && !error && (
        <>
          {active.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center">
              <p className="text-sm font-medium text-zinc-600">
                No accounts yet
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Add your first account to start tracking balances.
              </p>
              <Button
                onClick={handleAdd}
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 border-zinc-300"
              >
                <Plus size={14} strokeWidth={2} />
                Add account
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Account
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Initial balance
                </span>
                <span className="sr-only">Actions</span>
              </div>

              {/* Rows */}
              <ul className="divide-y divide-zinc-100">
                {active.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onEdit={() => handleEdit(account)}
                    onArchiveToggle={() => handleArchive(account)}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Archived section */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <Archive size={13} strokeWidth={1.75} />
              {showArchived ? "Hide archived accounts" : "Show archived accounts"}
            </button>

            {showArchived && archived.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Archived account
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Initial balance
                  </span>
                  <span className="sr-only">Actions</span>
                </div>
                <ul className="divide-y divide-zinc-100">
                  {archived.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      onEdit={() => handleEdit(account)}
                      onArchiveToggle={() => handleArchive(account)}
                      isArchived
                    />
                  ))}
                </ul>
              </div>
            )}

            {showArchived && archived.length === 0 && (
              <p className="mt-3 text-sm text-zinc-400">
                No archived accounts.
              </p>
            )}
          </div>
        </>
      )}

      {/* Create / edit form (Dialog on desktop, Drawer on mobile) */}
      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editingAccount}
        onSuccess={invalidate}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AccountRow
// ---------------------------------------------------------------------------

interface AccountRowProps {
  account: Account;
  onEdit: () => void;
  onArchiveToggle: () => void;
  isArchived?: boolean;
}

function AccountRow({
  account,
  onEdit,
  onArchiveToggle,
  isArchived = false,
}: AccountRowProps) {
  const balanceIsNegative = account.initialBalance < 0;

  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors group">
      {/* Name */}
      <span
        className={[
          "truncate text-sm font-medium",
          isArchived ? "text-zinc-400 line-through" : "text-zinc-900",
        ].join(" ")}
        title={account.name}
      >
        {account.name}
      </span>

      {/* Balance */}
      <span
        className={[
          "font-mono text-sm tabular-nums",
          isArchived
            ? "text-zinc-400"
            : balanceIsNegative
              ? "text-rose-600"
              : "text-emerald-700",
        ].join(" ")}
      >
        {formatBRL(account.initialBalance)}
      </span>

      {/* Row actions */}
      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        {!isArchived && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label={`Edit ${account.name}`}
            title="Edit"
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
        )}
        <button
          type="button"
          onClick={onArchiveToggle}
          className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          aria-label={
            isArchived
              ? `Unarchive ${account.name}`
              : `Archive ${account.name}`
          }
          title={isArchived ? "Unarchive" : "Archive"}
        >
          {isArchived ? (
            <ArchiveRestore size={13} strokeWidth={1.75} />
          ) : (
            <Archive size={13} strokeWidth={1.75} />
          )}
        </button>
      </div>
    </li>
  );
}
