import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function Login() {
  return (
    <AuthLayout>
      <div className="rounded-xl border border-zinc-200 bg-white px-7 py-8 shadow-sm">
        <h1 className="mb-6 text-[15px] font-semibold text-zinc-800">
          Sign in to your account
        </h1>
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
