# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Replit-style coding playground built for a 10–13 year old (Nathan). Single-page static web app — no backend, no database, no login. Runs in any browser (iPad + Windows). Supports Python, C++, Java, and HTML.

**GitHub:** https://github.com/TaxMan999/nathan-ide

**Do not add any dependency not listed in the stack below without asking first.**

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.ts` needed)
- `@monaco-editor/react` — editor with autocomplete and syntax highlighting
- `react-resizable-panels` — split-pane layout
- `@supabase/supabase-js` — auth + cloud sync (optional; app works without it)

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

Deploy by dropping `dist/` on Netlify or Vercel (free tier, drag-and-drop or GitHub connect).

## Architecture

**Code execution:** POST source to **Judge0 CE** (`https://ce.judge0.com/submissions?base64_encoded=false&wait=true`), display returned stdout/stderr. The original spec called for Piston, but the public Piston API (emkc.org) shut down to new users on 2/15/2026 — Judge0 CE is the free public replacement. HTML is special — render live in a sandboxed `<iframe srcdoc>` on every keystroke (debounced 300ms). No server required.

**Persistence:** Projects stored in `localStorage` (offline fallback) and synced to Supabase when env vars are present. Autosave on edit — code changes debounce 1.5 s before hitting Supabase; create/rename/delete are immediate.

**Auth:** Email magic link via Supabase Auth. Gated only when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set. Without them the app runs fully offline (no login prompt). First login auto-migrates existing localStorage projects to Supabase.

**Layout:**
- `TopBar` — Run button, language selector
- `PanelGroup` — resizable split: `Editor` (Monaco) | `Output` (stdout/stderr or iframe)
- Narrow screens (<768px): `PanelGroup direction="vertical"` via `useWindowWidth` hook

**Key files:**
- `src/types.ts` — `Language` type + `LANGUAGE_CONFIG`
- `src/lib/supabase.ts` — Supabase client + `isConfigured` flag
- `src/hooks/useAuth.ts` — session state, magic-link sign-in, sign-out
- `src/hooks/useCodeRunner.ts` — Judge0 CE API calls with 15s `AbortController` timeout
- `src/hooks/useProjects.ts` — project CRUD; takes optional `userId`; uses localStorage when offline, Supabase when logged in
- `src/components/LoginScreen.tsx` — magic-link email form + "check your email" confirmation
- `src/components/TopBar.tsx` — Run button, language selector, optional user email + sign-out
- `src/components/Editor.tsx` — Monaco wrapper with loading skeleton
- `src/components/Output.tsx` — stdout/stderr panel or `<iframe>` for HTML
- `src/App.tsx` — auth gate + layout shell

**Language config:**

| Language | Monaco mode | Runtime |
|---|---|---|
| Python | `python` | Piston `python` 3.x |
| C++ | `cpp` | Piston `c++` (gcc) |
| Java | `java` | Piston `java` |
| HTML | `html` | `<iframe srcdoc>` — no API call |

## Guardrails

- Never use `eval` or run code locally — always send to Piston.
- Keep the HTML preview iframe `sandbox`ed (`sandbox="allow-scripts"`).
- Rely on Piston's execution timeout; the client also enforces a 10s `AbortController` limit.
