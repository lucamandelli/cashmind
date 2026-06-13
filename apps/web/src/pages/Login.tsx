import { LoginForm } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";

export function Login() {
  return (
    <AuthLayout>
      <div className="w-full rounded-[20px] border border-border bg-surface px-7 pb-8 pt-[30px] shadow-(--shadow-card) transition-[background-color,border-color,box-shadow] duration-300">
        <h1 className="mb-6 text-[20px] font-bold tracking-[-0.02em] text-text transition-colors duration-300">
          Sign in to your account
        </h1>
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
