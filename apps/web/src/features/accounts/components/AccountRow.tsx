import { formatBRL } from "@cashmind/shared";
import type { Account } from "@cashmind/shared";
import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface AccountRowProps {
  account: Account;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete?: () => void;
  isArchived?: boolean;
}

export function AccountRow({
  account,
  onEdit,
  onArchiveToggle,
  onDelete,
  isArchived = false,
}: AccountRowProps) {
  const balanceIsNegative = account.initialBalance < 0;

  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors group">
      <span
        className={[
          "truncate text-sm font-medium",
          isArchived ? "text-zinc-400 line-through" : "text-zinc-900",
        ].join(" ")}
        title={account.name}
      >
        {account.name}
      </span>

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
          aria-label={isArchived ? `Unarchive ${account.name}` : `Archive ${account.name}`}
          title={isArchived ? "Unarchive" : "Archive"}
        >
          {isArchived ? (
            <ArchiveRestore size={13} strokeWidth={1.75} />
          ) : (
            <Archive size={13} strokeWidth={1.75} />
          )}
        </button>
        {isArchived && onDelete && (
          <DeleteAccountDialog accountName={account.name} onConfirm={onDelete} />
        )}
      </div>
    </li>
  );
}
