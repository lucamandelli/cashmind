import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "@tanstack/react-router";

export function Welcome() {
  const { pref, setPref } = useTheme();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-bg px-6 py-8 transition-colors duration-300">
      <ThemeToggle value={pref} onChange={setPref} />

      {/* Paper grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
        aria-hidden="true"
      />

      {/* Emerald glow — fades in with cm-glow keyframe */}
      <div
        className="cm-glow pointer-events-none absolute left-1/2 top-[42%] h-170 w-170 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(22,201,138,.06) 0%, rgba(22,201,138,0) 60%)",
        }}
        aria-hidden="true"
      />

      <div className="cm-welcome relative z-10 flex flex-col items-center text-center">
        {/* Lockup — inline SVG so the ring can be stroke-animated.
            Geometry is identical to assets/brand/cashmind-symbol.svg. */}
        <div className="flex items-center gap-4.5" role="img" aria-label="CashMind">
          <svg
            className="cm-symbol block shrink-0"
            style={{
              width: "clamp(46px, 12vw, 58px)",
              height: "clamp(46px, 12vw, 58px)",
            }}
            viewBox="0 0 80 80"
            aria-hidden="true"
          >
            <circle
              className="cm-ring [transition:stroke_.35s_ease]"
              cx="40"
              cy="40"
              r="33"
              transform="rotate(120 40 40)"
              fill="none"
              stroke="var(--primary)"
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeDasharray="158 49"
            />
            <path
              className="cm-dollar [transition:fill_.35s_ease]"
              style={{ fill: "var(--text)", transformOrigin: "40px 40px" }}
              d="M42.70 63.63L38.70 63.63L38.70 59.08Q34.20 58.48 30.90 55.73Q27.60 52.98 26.30 48.98L26.30 48.98L31.25 46.88Q32.35 49.67 34.28 51.42Q36.20 53.17 38.70 53.77L38.70 53.77L38.70 42.38L36.35 41.63Q32.15 40.33 29.95 37.65Q27.75 34.97 27.75 31.38L27.75 31.38Q27.75 28.42 29.15 26.13Q30.55 23.82 33 22.42Q35.45 21.02 38.70 20.82L38.70 20.82L38.70 16.38L42.70 16.38L42.70 21.02Q46.65 21.73 49.48 24.13Q52.30 26.52 53.50 29.92L53.50 29.92L48.60 32.08Q46.90 27.63 42.70 26.38L42.70 26.38L42.70 37.77L44.75 38.42Q53.70 41.22 53.70 48.58L53.70 48.58Q53.70 51.48 52.30 53.75Q50.90 56.02 48.45 57.42Q46 58.83 42.70 59.13L42.70 59.13L42.70 63.63ZM38.25 36.38L38.25 36.38L38.70 36.52L38.70 26.02Q36.35 26.27 34.98 27.63Q33.60 28.97 33.60 31.07L33.60 31.07Q33.60 32.88 34.75 34.27Q35.90 35.67 38.25 36.38ZM43.35 43.83L43.35 43.83L42.70 43.67L42.70 53.98Q45.05 53.63 46.48 52.30Q47.90 50.98 47.90 48.98L47.90 48.98Q47.90 46.92 46.73 45.73Q45.55 44.52 43.35 43.83Z"
            />
          </svg>

          <div
            className="cm-wordmark font-bold leading-none tracking-[-0.028em] whitespace-nowrap"
            style={{ fontSize: "clamp(34px, 9.5vw, 46px)" }}
          >
            <span className="text-text [transition:color_.35s_ease]">Cash</span>
            <span className="font-normal text-primary [transition:color_.35s_ease]">Mind</span>
          </div>
        </div>

        <p
          className="cm-tagline mt-6.5 font-medium text-text-2 [transition:color_.35s_ease]"
          style={{ fontSize: "clamp(15px, 3.6vw, 17px)" }}
        >
          Personal finance, precisely.
        </p>

        <Link
          to="/login"
          className="cm-cta mt-9.5 inline-flex items-center justify-center gap-2.25 rounded-[14px] bg-primary px-7.5 py-3.5 text-[15.5px] font-semibold tracking-[0.005em] text-text-on-primary no-underline shadow-(--shadow) transition-[background-color,box-shadow,transform] duration-180 ease-in-out hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-(--focus)"
        >
          Sign in
          <svg
            className="h-4.25 w-4.25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <p className="cm-footnote mt-5.5 text-[13px] font-medium tracking-[0.004em] text-text-3 [transition:color_.35s_ease]">
          Access is restricted to invited accounts.
        </p>
      </div>
    </main>
  );
}
