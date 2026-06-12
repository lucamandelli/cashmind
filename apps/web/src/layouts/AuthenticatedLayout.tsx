import { Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/services/authClient";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export function AuthenticatedLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/login" }),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo variant="symbol" height={28} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-sm font-normal"
          >
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
