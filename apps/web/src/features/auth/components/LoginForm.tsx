import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { LoginSchema, type LoginFormValues } from "@/features/auth/loginForm.schema";
import { authClient } from "@/services/authClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      { email: values.email, password: values.password },
      {
        onSuccess: () => navigate({ to: "/accounts" }),
        onError: (ctx) =>
          setError("root", {
            message: ctx.error.message ?? "Sign in failed. Check your credentials.",
          }),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-[12px] font-medium uppercase tracking-wider text-zinc-500"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          className="h-10 border-zinc-200 bg-zinc-50 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-[12px] text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-[12px] font-medium uppercase tracking-wider text-zinc-500"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10 border-zinc-200 bg-zinc-50 pr-10 text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={15} strokeWidth={1.75} />
            ) : (
              <Eye size={15} strokeWidth={1.75} />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[12px] text-red-600">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <div className="rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        className="mt-2 h-10 w-full bg-zinc-900 text-[13px] font-medium text-white hover:bg-zinc-700 active:bg-zinc-800 transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
            />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
