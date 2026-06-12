import { useState } from "react";
import type { Account } from "@cashmind/shared";
import { AccountList, AccountForm, useAccounts, useToggleArchive, useDeleteAccount } from "@/features/accounts";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";

export function Accounts() {
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  const { data, isLoading, error } = useAccounts(showArchived);
  const toggleArchive = useToggleArchive();
  const deleteAccount = useDeleteAccount();

  const handleAdd = () => {
    setEditingAccount(undefined);
    setFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleArchiveToggle = (account: Account) => {
    toggleArchive.mutate(account);
  };

  const handleDelete = (account: Account) => {
    deleteAccount.mutate(account.id);
  };

  const active = data?.filter((a) => !a.archivedAt) ?? [];
  const archived = data?.filter((a) => a.archivedAt) ?? [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Accounts</h1>
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

      {isLoading && <p className="text-sm text-zinc-500">Loading accounts…</p>}
      {error && (
        <p className="text-sm text-red-600">Error: {(error as Error).message}</p>
      )}
      {toggleArchive.error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
          {(toggleArchive.error as Error).message}
        </div>
      )}
      {deleteAccount.error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
          {(deleteAccount.error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <AccountList
            accounts={active}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onArchiveToggle={handleArchiveToggle}
          />

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
              <div className="mt-3">
                <AccountList
                  accounts={archived}
                  isArchived
                  onEdit={handleEdit}
                  onArchiveToggle={handleArchiveToggle}
                  onDelete={handleDelete}
                />
              </div>
            )}

            {showArchived && archived.length === 0 && (
              <p className="mt-3 text-sm text-zinc-400">No archived accounts.</p>
            )}
          </div>
        </>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editingAccount}
        onSuccess={() => {}}
      />
    </div>
  );
}
