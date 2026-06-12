import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteAccountDialogProps {
  accountName: string;
  onConfirm: () => void;
}

export function DeleteAccountDialog({ accountName, onConfirm }: DeleteAccountDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="rounded p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label={`Delete ${accountName}`}
          title="Delete permanently"
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white border-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-900">
            Delete this account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500">
            This permanently deletes the account and its transaction history. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
            onClick={onConfirm}
          >
            Delete permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
