/**
 * Theme-aware CashMind brand mark.
 *
 * GOTCHA: the symbol's "$" path is drawn in ink (#14181c) and disappears on
 * dark surfaces. `cashmind-symbol-dark.svg` uses white for that path instead.
 * Logo picks the correct variant via a `dark:` Tailwind class swap so it is
 * ready for dark-mode without needing dark-mode itself to be wired up today.
 *
 * Variants:
 *   "symbol"  — the circular mark only (header, favicons, compact contexts)
 *   "lockup"  — symbol + full wordmark (login screen, wide contexts)
 */

import symbolLight from "@/assets/brand/cashmind-symbol.svg";
import symbolDark from "@/assets/brand/cashmind-symbol-dark.svg";
import lockup from "@/assets/brand/cashmind-lockup.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Visual variant: symbol only or full wordmark lockup. Default: "symbol". */
  variant?: "symbol" | "lockup";
  /** Additional classes for the wrapper element. */
  className?: string;
  /** Height in pixels for the rendered image. Default: 32. */
  height?: number;
}

export function Logo({ variant = "symbol", className, height = 32 }: LogoProps) {
  if (variant === "lockup") {
    // The lockup SVG has a light-mode symbol embedded (ink $ path).
    // We render it only on light backgrounds; on dark we fall back to
    // stacking symbol-dark + the wordmark text. For now, the app ships
    // light-only, so the lockup SVG is sufficient. The dark: hidden /
    // dark: flex classes are placeholders that become active if/when the
    // Tailwind dark class strategy is enabled.
    return (
      <span
        className={cn("inline-flex items-center", className)}
        aria-label="CashMind"
      >
        {/* Light mode: full lockup SVG */}
        <img
          src={lockup}
          alt="CashMind"
          height={height}
          style={{ height }}
          className="dark:hidden"
          aria-hidden="true"
        />
        {/* Dark mode: symbol-dark + wordmark text fallback */}
        <span className="hidden dark:inline-flex items-center gap-2">
          <img
            src={symbolDark}
            alt=""
            height={height}
            style={{ height, width: height }}
            aria-hidden="true"
          />
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: Math.round(height * 0.5) }}
          >
            Cash<span className="text-emerald-400">Mind</span>
          </span>
        </span>
      </span>
    );
  }

  // Symbol variant — swap light/dark via sibling images + Tailwind dark: classes.
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label="CashMind"
    >
      <img
        src={symbolLight}
        alt="CashMind"
        height={height}
        style={{ height, width: height }}
        className="dark:hidden"
      />
      <img
        src={symbolDark}
        alt="CashMind"
        height={height}
        style={{ height, width: height }}
        className="hidden dark:inline"
      />
    </span>
  );
}
