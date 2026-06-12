import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
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
        <div className="mb-10 flex flex-col items-center gap-3">
          <Logo variant="lockup" height={36} />
          <p className="text-[13px] text-zinc-500 tracking-wide">
            Personal finance, precisely.
          </p>
        </div>
        {children}
        <p className="mt-6 text-center text-[11px] text-zinc-400">
          Access is restricted to invited accounts.
        </p>
      </div>
    </main>
  );
}
