import { type LoginFormValues, LoginSchema } from "@/features/auth/loginForm.schema";
import { authClient } from "@/services/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

  const inputClass =
    "w-full rounded-[12px] border border-border bg-surface-2 px-4 text-[15px] text-text outline-none placeholder:text-text-3 transition-[border-color,box-shadow,background-color,color] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_var(--focus)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]" noValidate>
      {/* Email */}
      <div className="flex flex-col gap-[9px]">
        <label
          htmlFor="email"
          className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-text-3 transition-colors duration-300"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`${inputClass} py-[14px]`}
          {...register("email")}
        />
        {errors.email && <p className="text-[12px] text-negative">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-[9px]">
        <label
          htmlFor="password"
          className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-text-3 transition-colors duration-300"
        >
          Password
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClass} py-[14px] pr-[50px]`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[9px] text-text-3 transition-colors duration-150 hover:bg-surface-3 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus)]"
          >
            {showPassword ? (
              <EyeOff size={19} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={19} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && <p className="text-[12px] text-negative">{errors.password.message}</p>}
      </div>

      {/* Root error */}
      {errors.root && (
        <div className="rounded-[10px] border border-negative/20 bg-negative-subtle px-3 py-2.5 text-[12px] text-negative transition-colors duration-300">
          {errors.root.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 inline-flex w-full items-center justify-center rounded-[14px] bg-primary px-6 py-[15px] text-[15.5px] font-semibold tracking-[0.005em] text-text-on-primary shadow-[var(--shadow)] transition-[background-color,box-shadow,transform] duration-[180ms] ease-in-out hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--focus)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="block h-3.5 w-3.5 rounded-full border-2 border-text-on-primary/30 border-t-text-on-primary animate-spin"
              aria-hidden="true"
            />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
