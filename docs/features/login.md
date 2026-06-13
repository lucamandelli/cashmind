---
type: feature
status: current
updated: 2026-06-13
summary: Themed sign-in screen at "/login" — tokenized card, inline-SVG brand header, light/dark/system toggle. Auth wiring (react-hook-form + Zod + Better Auth) unchanged.
tags: [feature, frontend, login, auth, theme]
---

# Login screen

## What it is

The sign-in form at `/login`. Renders inside `AuthLayout`, which provides the
full themed shell (background, grain, emerald glow, brand header, tagline,
footnote, and the `ThemeToggle`). `Login.tsx` contributes only the card wrapper
and heading; `LoginForm` owns all auth logic.

## Flow

1. User lands on `/login` (from the Welcome screen Sign-in CTA or direct URL).
2. `login.tsx`'s `beforeLoad` guard calls `authClient.getSession()`.
   - **Authenticated:** `redirect({ to: "/accounts" })` before the form renders.
   - **Not authenticated:** Login screen renders normally.
3. User submits email + password → `authClient.signIn.email()`.
   - **Success:** navigate to `/accounts`.
   - **Error:** root error block renders below the password field.

## Files

- Shell: `apps/web/src/layouts/AuthLayout.tsx`
- Page (card + heading): `apps/web/src/pages/Login.tsx`
- Form (fields + auth logic): `apps/web/src/features/auth/components/LoginForm.tsx`
- Route + auth guard: `apps/web/src/routes/login.tsx`
- Schema (Zod + inferred types): `apps/web/src/features/auth/loginForm.schema.ts`
- Public barrel: `apps/web/src/features/auth/index.ts`

## Theme

Both screens in the unauthenticated shell (`/` and `/login`) share `AuthLayout`
and the same grain / glow / toggle treatment. The toggle and persistence
mechanism are documented in [[0009-theme-toggle]].

The brand mark in `AuthLayout` is an **inline SVG** (not the `<Logo>` component)
so the ring stroke and `$` fill resolve from `--primary` and `--text` CSS
variables at runtime, switching instantly on theme change.

## Auth wiring

- `react-hook-form` + `@hookform/resolvers/zod` for client-side validation.
- `LoginSchema` (Zod) is the form schema; it lives alongside the form, not in
  `packages/shared` (form-only concern, not an API contract).
- `authClient.signIn.email()` from Better Auth's client SDK handles the HTTP
  request; credentials are sent as a `POST` to the API.
- Error from Better Auth's `onError` callback is surfaced via `setError("root", ...)`.
- On success, TanStack Router's `navigate` drives the transition — no full page
  reload.

## Rules

- **Authenticated users never see the form.** The `beforeLoad` guard in
  `routes/login.tsx` always checks the session first.
- **Password visibility toggle** is stateful but purely presentational — it does
  not affect the registered field value.
- **Inputs use native `<input>` elements**, not shadcn's `<Input>`, so styles
  are fully controlled by design tokens without shadcn's utility overrides.

## Uses

[[welcome]] · [[0005-design-token-system]] · [[0009-theme-toggle]]
