# Nathan's IDE — Simple Build Spec

A Replit-style coding playground for a 10–13 year old. One static web app — **no backend, no database, no login.** Runs in any browser (iPad + Windows). Supports C++, Java, Python, HTML. Save / rename / delete / switch between multiple projects. Split-pane: code left, output right.

> **For Claude Code:** Build this as a single front-end app. No server. Ask me before adding any dependency not listed here.

---

## How it works (kept deliberately simple)

1. **Running code** — POST the source to the **public Piston API** (`https://emkc.org/api/v2/piston/execute`) and show the returned stdout/stderr. One fetch call, no setup, no server to host. HTML is special: render it live in a sandboxed `<iframe srcdoc=...>` — no API call.
2. **Saving projects** — store everything in the browser's **localStorage** as JSON. No database, no account. (Trade-off: projects live per-device and don't sync across the iPad and PC. That's the price of "no backend." Sync can be bolted on later — see appendix.)

---

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- `@monaco-editor/react` (the real VS Code editor — autocomplete + highlighting)
- `react-resizable-panels` (the split view)

That's the whole dependency list. No Supabase, no auth library, no state manager.

---

## Language config

| Language | Monaco mode | Run path | Piston runtime |
|---|---|---|---|
| Python | `python` | Piston | `python` 3.x |
| C++ | `cpp` | Piston | `c++` (gcc) |
| Java | `java` | Piston | `java` |
| HTML | `html` | live `<iframe srcdoc>` | — |

HTML re-renders on keystroke (debounced ~300ms). The other three run only when Nathan clicks **Run** (or presses Ctrl/Cmd+Enter).

---

## Data shape (just localStorage)

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "My First Game",
      "language": "python",
      "code": "print('hello')",
      "updatedAt": 1719600000000
    }
  ],
  "lastOpenId": "uuid"
}
```

Save under one localStorage key (e.g. `nathan-ide`). Autosave on edit (debounced). Reload restores the last open project.

---

## UI layout

```
┌─────────────────────────────────────────────┐
│  Top bar: [Project name ▾] [Run ▶] [Lang ▾]  │
├──────────────┬──────────────────────────────┤
│  Sidebar     │   ┌──────────┬──────────┐     │
│  - Projects  │   │  Editor  │  Output  │     │
│  - + New     │   │ (Monaco) │ (stdout/ │     │
│  - rename    │   │          │  iframe) │     │
│  - delete    │   └──────────┴──────────┘     │
└──────────────┴──────────────────────────────┘
```

- Resizable divider between editor and output.
- **iPad / narrow screens (<768px):** stack vertically (editor top, output bottom) with a toggle.
- Big friendly Run button, clear "Running…" state, errors in red plain language.

---

## Build phases

**Phase 1 — Core.** Single project, Monaco + split-pane + language switcher, Run wired to public Piston, HTML iframe preview. Prove the run loop works.

**Phase 2 — Projects.** Sidebar: create / rename / delete / switch. Persist to localStorage. Autosave. Confirm before delete.

**Phase 3 — Polish.** Multiple projects open as tabs, kid-friendly theme, "Clear output" and "Stop" buttons, keyboard shortcuts.

---

## Acceptance criteria

- [ ] "Hello World" runs in Python, C++, Java; output shows on the right.
- [ ] HTML renders live as he types.
- [ ] Create / rename / delete / switch projects works.
- [ ] Edits autosave; nothing lost on refresh.
- [ ] Usable on an iPad in both orientations.
- [ ] Same site URL opens fine on iPad and Windows.

---

## Guardrails (it's for a kid)

- Never use `eval` or run code locally — always the sandboxed Piston runner.
- Keep the HTML preview iframe `sandbox`ed.
- Rely on Piston's execution timeout so infinite loops can't hang the page.

---

## Deploy

`npm run build`, then drop the `dist/` folder on **Netlify** or **Vercel** (free, drag-and-drop or GitHub connect). You get one URL Nathan opens on either device. Done.

---

## Appendix — adding cross-device sync later (only if he misses it)

The simplest upgrade that preserves everything above: add **Supabase** (free tier).
1. Add one login screen (Supabase Auth — email magic link).
2. Create one `projects` table mirroring the JSON shape above; turn on Row Level Security.
3. Swap the localStorage read/write calls for Supabase read/write.

Nothing else in the app changes. This is a clean bolt-on, not a rebuild — which is exactly why it's safe to skip for now.
