import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof LoginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (values: LoginForm) => {
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7] px-4">
      {/* Background texture — subtle noise overlay for premium feel */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[340px]">
        {/* Brand lockup */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <Logo variant="lockup" height={36} />
          <p className="text-[13px] text-zinc-500 tracking-wide">
            Personal finance, precisely.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-zinc-200 bg-white px-7 py-8 shadow-sm">
          <h1 className="mb-6 text-[15px] font-semibold text-zinc-800">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
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
                <p className="text-[12px] text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
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
                <p className="text-[12px] text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Root / server error */}
            {errors.root && (
              <div className="rounded-md bg-red-50 px-3 py-2.5 text-[12px] text-red-700 border border-red-100">
                {errors.root.message}
              </div>
            )}

            {/* Submit */}
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
        </div>

        {/* Footer note — single user, no public sign-up */}
        <p className="mt-6 text-center text-[11px] text-zinc-400">
          Access is restricted to invited accounts.
        </p>
      </div>
    </main>
  );
}
