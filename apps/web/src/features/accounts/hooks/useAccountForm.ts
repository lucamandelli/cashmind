import { useEffect, useState } from "react";
import { useForm, useController, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toMajor, toMinor } from "@cashmind/shared";
import type { Account } from "@cashmind/shared";
import { FormSchema, type FormValues } from "@/features/accounts/accountForm.schema";
import { useSaveAccount } from "@/features/accounts/hooks/useAccounts";

export function useAccountForm(
  account: Account | undefined,
  onSuccess: () => void,
) {
  const isEditing = Boolean(account);
  const [isBlurred, setIsBlurred] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: account?.name ?? "",
      amountReais: account ? String(toMajor(account.initialBalance)) : "0",
    },
  });

  const { field: amountField } = useController({ name: "amountReais", control });

  useEffect(() => {
    setIsBlurred(false);
    reset({
      name: account?.name ?? "",
      amountReais: account ? String(toMajor(account.initialBalance)) : "0",
    });
  }, [account, reset]);

  const saveAccount = useSaveAccount();

  const onSubmit = async (raw: FormValues) => {
    const initialBalance = toMinor(raw.amountReais as unknown as number);
    try {
      if (isEditing && account) {
        await saveAccount.mutateAsync({ mode: "edit", id: account.id, name: raw.name, initialBalance });
      } else {
        await saveAccount.mutateAsync({ mode: "create", name: raw.name, initialBalance });
      }
      onSuccess();
      reset({ name: "", amountReais: "0" });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Unexpected error" });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isBlurred,
    setIsBlurred,
    amountField,
    onSubmit,
    isEditing,
  };
}
