import type { ThemePref } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const OPTIONS: { key: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    key: "light",
    label: "Light theme",
    icon: (
      <svg
        className="h-[17px] w-[17px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    key: "system",
    label: "System theme",
    icon: (
      <svg
        className="h-[17px] w-[17px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    key: "dark",
    label: "Dark theme",
    icon: (
      <svg
        className="h-[17px] w-[17px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

interface ThemeToggleProps {
  value: ThemePref;
  onChange: (v: ThemePref) => void;
}

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  return (
    <div
      aria-label="Color theme"
      className="fixed right-[18px] top-[18px] z-30 inline-flex items-center gap-[2px] rounded-full border border-border bg-surface p-1 shadow-[var(--shadow)] transition-colors duration-300"
    >
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            aria-label={o.label}
            title={o.label.replace(" theme", "")}
            onClick={() => onChange(o.key)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
              active ? "bg-primary-subtle text-primary" : "text-text-3 hover:text-text",
            )}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}
