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

**Persistence (Phase 2):** All projects will be stored in `localStorage` under a single key (`nathan-ide`) as JSON. Autosave on edit (debounced).

**Layout:**
- `TopBar` — Run button, language selector
- `PanelGroup` — resizable split: `Editor` (Monaco) | `Output` (stdout/stderr or iframe)
- Narrow screens (<768px): `PanelGroup direction="vertical"` via `useWindowWidth` hook

**Key files:**
- `src/types.ts` — `Language` type + `LANGUAGE_CONFIG` (Monaco language id, Piston runtime id, hello-world template per language)
- `src/hooks/useCodeRunner.ts` — Judge0 CE API calls with 15s `AbortController` timeout; exposes `run(code, language)` and `clear()`
- `src/components/TopBar.tsx` — Run button (Ctrl/Cmd+Enter shortcut), language selector with template-swap confirm
- `src/components/Editor.tsx` — Monaco wrapper with loading skeleton
- `src/components/Output.tsx` — stdout/stderr panel or `<iframe>` for HTML
- `src/App.tsx` — layout shell, owns all state

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
