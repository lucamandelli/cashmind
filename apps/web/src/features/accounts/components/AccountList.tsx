import type { Account } from "@cashmind/shared";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountRow } from "./AccountRow";

interface AccountListProps {
  accounts: Account[];
  isArchived?: boolean;
  onAdd?: () => void;
  onEdit: (account: Account) => void;
  onArchiveToggle: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

function GridHeader({ label }: { label: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        Initial balance
      </span>
      <span className="sr-only">Actions</span>
    </div>
  );
}

export function AccountList({
  accounts,
  isArchived = false,
  onAdd,
  onEdit,
  onArchiveToggle,
  onDelete,
}: AccountListProps) {
  if (!isArchived && accounts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-zinc-600">No accounts yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          Add your first account to start tracking balances.
        </p>
        {onAdd && (
          <Button
            onClick={onAdd}
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 border-zinc-300"
          >
            <Plus size={14} strokeWidth={2} />
            Add account
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        "overflow-hidden rounded-lg border border-zinc-200",
        isArchived ? "bg-zinc-50/50" : "bg-white",
      ].join(" ")}
    >
      <GridHeader label={isArchived ? "Archived account" : "Account"} />
      <ul className="divide-y divide-zinc-100">
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            isArchived={isArchived}
            onEdit={() => onEdit(account)}
            onArchiveToggle={() => onArchiveToggle(account)}
            onDelete={onDelete ? () => onDelete(account) : undefined}
          />
        ))}
      </ul>
    </div>
  );
}
