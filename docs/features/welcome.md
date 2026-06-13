---
type: feature
status: current
updated: 2026-06-13
summary: Branded public front door at "/" — animated CashMind lockup, tagline, and a single Sign-in CTA routing to /login. Light/dark/system theme toggle present.
tags: [feature, frontend, welcome, auth]
---

# Welcome screen

## What it is

A full-viewport splash page at `/` that serves as the public entry point for the
app. Shows the animated CashMind lockup and a single **Sign in** CTA. Visible to
everyone — authenticated users are not redirected away; they click Sign in and
are bounced to `/accounts` by the `/login` guard (see Rules).

## Flow

1. Any user opens `/` → `Welcome` page renders, entrance animation plays once.
2. User clicks **Sign in** → navigates to `/login` (TanStack Router `<Link>`).
3. **If already authenticated**, `/login`'s `beforeLoad` guard detects the session
   and issues `redirect({ to: "/accounts" })` before the login form renders.
4. **If not authenticated**, the login form renders normally; post-login navigates
   to `/accounts` (see `LoginForm.tsx`).

## Files

- Page component: `apps/web/src/pages/Welcome.tsx`
- Route entry: `apps/web/src/routes/index.tsx`
- `/login` auth guard (new): `apps/web/src/routes/login.tsx`
- Keyframe animation + `--color-primary-hover` token: `apps/web/src/index.css`
- Design source: `design-system/CashMind Welcome.html`

The entrance animation uses five `@keyframes` blocks (`cm-ring`, `cm-pop`,
`cm-wipe`, `cm-up`, `cm-glow`) scoped under `.cm-welcome` / `.cm-glow` in
`index.css`. The inline SVG mark in `Welcome.tsx` is geometry-identical to
`apps/web/src/assets/brand/cashmind-symbol.svg` — kept inline so the ring can
be stroke-animated via CSS.

## Theme

The screen is fully theme-aware (light / dark / system). The `ThemeToggle`
component is fixed top-right; `useTheme` resolves the pref (defaulting to
`system`), persists it, and applies `.dark` to `<html>`. A no-flash inline
script in `index.html` sets the theme before first paint. See [[0009-theme-toggle]].

The grain overlay uses `dark:opacity-[0.03]` (vs. `opacity-[0.018]` in light) to
match the design reference. All colours (`bg-bg`, `text-text`, `text-text-2`,
`text-text-3`, `text-primary`, `bg-primary`, `hover:bg-primary-hover`) resolve
from CSS variables, switching instantly on theme change.

## Rules

- **`/login` redirects authenticated users to `/accounts`.**
  A session check (`authClient.getSession()`) in `login.tsx`'s `beforeLoad` guard
  prevents a logged-in user from landing on the login form — they go straight to
  the app. Mirrors the `_authenticated` guard pattern (inverted).
- **`/` is always public.** No session check on the root route; the splash is
  shown to everyone.
- **`prefers-reduced-motion` is respected.** All `.cm-welcome .cm-*` animations
  are suppressed; elements render in their resting (visible) state.

## Uses

Uses the design-token vocabulary from [[0005-design-token-system]]. Shares the
`AuthLayout` grain/glow/brand technique with [[login]]. Theme toggle and
persistence: [[0009-theme-toggle]].
