import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account } from "@cashmind/shared";
import {
  listAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
} from "@/features/accounts/services/accountsApi";

export const accountKeys = {
  all: ["accounts"] as const,
  list: (includeArchived: boolean) =>
    ["accounts", { includeArchived }] as const,
};

export function useAccounts(includeArchived: boolean) {
  return useQuery<Account[]>({
    queryKey: accountKeys.list(includeArchived),
    queryFn: () => listAccounts(includeArchived),
  });
}

export function useSaveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      args:
        | { mode: "create"; name: string; initialBalance: number }
        | { mode: "edit"; id: string; name: string; initialBalance: number },
    ) => {
      if (args.mode === "create") {
        return createAccount({ name: args.name, initialBalance: args.initialBalance, currency: "BRL" });
      }
      return updateAccount(args.id, { name: args.name, initialBalance: args.initialBalance });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  });
}

export function useToggleArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: Account) =>
      account.archivedAt ? unarchiveAccount(account.id) : archiveAccount(account.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  });
}
