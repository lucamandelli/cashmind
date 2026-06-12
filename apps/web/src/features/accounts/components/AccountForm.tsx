import { NumericFormat } from "react-number-format";
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
import { useAccountForm } from "@/features/accounts/hooks/useAccountForm";

export interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
  onSuccess: () => void;
}

export function AccountForm({ open, onOpenChange, account, onSuccess }: AccountFormProps) {
  const isDesktop = useIsDesktop();

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isBlurred,
    setIsBlurred,
    amountField,
    onSubmit,
    isEditing,
  } = useAccountForm(account, () => {
    onSuccess();
    onOpenChange(false);
  });

  const title = isEditing ? "Edit account" : "New account";

  const formBody = (
    <form
      id="account-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 px-4 py-2 sm:px-0"
    >
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

      <div className="space-y-1.5">
        <Label
          htmlFor="account-balance"
          className="text-[12px] font-medium uppercase tracking-wider text-zinc-500"
        >
          Initial balance (R$)
        </Label>
        <NumericFormat
          id="account-balance"
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale={isBlurred}
          allowNegative={true}
          customInput={Input}
          value={amountField.value}
          onValueChange={(values) => amountField.onChange(values.value)}
          onFocus={() => setIsBlurred(false)}
          onBlur={() => {
            setIsBlurred(true);
            amountField.onBlur();
          }}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className="h-10 border-zinc-200 bg-zinc-50 font-mono text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
        />
        <p className="text-[11px] text-zinc-400">
          Enter in reais. Negative values are allowed (e.g. credit card debt).
        </p>
        {errors.amountReais && (
          <p className="text-[12px] text-red-600">{errors.amountReais.message}</p>
        )}
      </div>

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
