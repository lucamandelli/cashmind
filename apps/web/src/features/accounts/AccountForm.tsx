/**
 * AccountForm — create or edit a financial account.
 *
 * Rendered inside a Dialog (desktop, ≥768 px) or a Drawer (mobile) via the
 * useIsDesktop hook. Caller controls open state and provides an onSuccess
 * callback to invalidate the accounts query.
 *
 * Money wiring (the ONE piece of real UI logic):
 *   - The "Initial balance" input is typed in BRL major units (reais),
 *     e.g. "1.234,56" or "-500". A raw number input works for pt-BR when
 *     the user types digits with a period as thousands separator and a comma
 *     (or period) as decimal. We accept any JS-parseable number string so the
 *     field stays flexible; conversion to integer cents (toMinor) happens
 *     exclusively at submit.
 *   - When editing an existing account, the field pre-fills with toMajor()
 *     which returns a JS number (e.g. 9.99 for 999 cents).
 *   - initialBalance may be negative — no min(0) applied.
 *   - currency has no input; defaults to BRL.
 */

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toMinor, toMajor, parseReais } from "@cashmind/shared";
import type { Account } from "@cashmind/shared";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

// ---------------------------------------------------------------------------
// Form schema (local to the form — amounts are typed in reais as strings,
// so we use a local schema that coerces the input before the shared schema).
// The shared CreateAccountSchema / UpdateAccountSchema operate on integer cents
// and are applied server-side; here we validate the user's text input and then
// convert at submit.
// ---------------------------------------------------------------------------

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(100, "Name must be 100 characters or fewer"),
  /** Amount typed by the user in BRL major units (reais). May be negative. */
  amountReais: z
    .string()
    .transform((v) => {
      // Delegate to the shared money helper — single source of truth for
      // parsing user-typed reais strings (pt-BR and English formats).
      // Throws on empty, ambiguous, or non-numeric input so RHF surfaces
      // a clean field error.
      return parseReais(v);
    })
    .pipe(z.number().finite("Enter a valid amount")),
});

type FormValues = z.input<typeof FormSchema>; // raw string values the input sees

export interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the form is in edit mode for this account. */
  account?: Account;
  /** Called after a successful create or edit. Use to invalidate queries. */
  onSuccess: () => void;
}

export function AccountForm({
  open,
  onOpenChange,
  account,
  onSuccess,
}: AccountFormProps) {
  const isDesktop = useIsDesktop();
  const isEditing = Boolean(account);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // zodResolver with a transform schema: cast to Resolver<FormValues> because
    // the input type (string fields) is what RHF deals with; the schema's
    // output type (transformed) is used only in onSubmit via FormSchema.parse().
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: account?.name ?? "",
      amountReais: account
        ? toMajor(account.initialBalance).toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false })
        : "0",
    },
  });

  // Reset form values when the target account changes (e.g. user opens edit
  // for a different account while the form is already mounted).
  useEffect(() => {
    reset({
      name: account?.name ?? "",
      amountReais: account
        ? toMajor(account.initialBalance).toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false })
        : "0",
    });
  }, [account, reset]);

  const onSubmit = async (raw: FormValues) => {
    // zodResolver already ran the Zod transform before calling this callback,
    // so amountReais is already a number at runtime (not the original string).
    // Re-parsing through FormSchema would reject the number via z.string() — so
    // we cast and use the value directly.
    const initialBalance = toMinor(raw.amountReais as unknown as number);

    const url = isEditing ? `/api/accounts/${account?.id}` : "/api/accounts";
    const method = isEditing ? "PATCH" : "POST";

    const body = isEditing
      ? JSON.stringify({ name: raw.name, initialBalance })
      : JSON.stringify({ name: raw.name, initialBalance, currency: "BRL" });

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      let message = isEditing ? "Failed to update account" : "Failed to create account";
      try {
        const json = (await res.json()) as { error?: string };
        if (json.error) message = json.error;
      } catch {
        // ignore parse error — keep the default message
      }
      setError("root", { message });
      return;
    }

    onSuccess();
    onOpenChange(false);
    reset({ name: "", amountReais: "0" });
  };

  const title = isEditing ? "Edit account" : "New account";

  const formBody = (
    <form
      id="account-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 px-4 py-2 sm:px-0"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="account-name"
          className="text-[12px] font-medium uppercase tracking-wider text-zinc-500"
        >
          Account name
        </Label>
        <Input
          id="account-name"
          type="text"
          autoComplete="off"
          placeholder="e.g. Checking account"
          className="h-10 border-zinc-200 bg-zinc-50 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-[12px] text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Initial balance — typed in reais */}
      <div className="space-y-1.5">
        <Label
          htmlFor="account-balance"
          className="text-[12px] font-medium uppercase tracking-wider text-zinc-500"
        >
          Initial balance (R$)
        </Label>
        <Input
          id="account-balance"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className="h-10 border-zinc-200 bg-zinc-50 font-mono text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
          {...register("amountReais")}
        />
        <p className="text-[11px] text-zinc-400">
          Enter in reais. Negative values are allowed (e.g. credit card debt).
        </p>
        {errors.amountReais && (
          <p className="text-[12px] text-red-600">
            {errors.amountReais.message}
          </p>
        )}
      </div>

      {/* Server / root error */}
      {errors.root && (
        <div className="rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
          {errors.root.message}
        </div>
      )}
    </form>
  );

  const footer = (
    <div className="flex gap-2 sm:justify-end">
      <Button
        type="button"
        variant="outline"
        className="flex-1 sm:flex-none"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="account-form"
        className="flex-1 bg-zinc-900 text-white hover:bg-zinc-700 sm:flex-none"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
            />
            {isEditing ? "Saving…" : "Creating…"}
          </span>
        ) : isEditing ? (
          "Save changes"
        ) : (
          "Create account"
        )}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-zinc-200 bg-white">
          <DialogHeader className="px-0 pb-2">
            <DialogTitle className="text-base font-semibold text-zinc-900">
              {title}
            </DialogTitle>
          </DialogHeader>
          {formBody}
          <DialogFooter className="pt-2">{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base font-semibold text-zinc-900">
            {title}
          </DrawerTitle>
        </DrawerHeader>
        {formBody}
        <DrawerFooter>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
