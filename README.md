# JSON Resume Editor

A lightweight React + TypeScript + Vite app for editing a [JSON Resume](https://jsonresume.org/) document through a structured UI instead of raw JSON.

Schema reference: [jsonresume.org/schema](https://jsonresume.org/schema)

## What you can edit

The UI covers every section defined in the app’s typed model (`ResumeData`):

- **basics** — identity, contact, location, profiles, summary
- **skills**, **languages**, **interests**
- **work**, **volunteer**, **education**
- **certificates**, **projects**
- **publications**, **awards**
- **references**

Each array section supports add, edit, delete, reorder (Up/Down and native drag-and-drop). Basics uses a dedicated modal; array items use a shared modal with fields per section type.

## Goals

- Keep the implementation simple and easy to maintain.
- Section-based editing with modal forms and a scrollable main column.
- Sidebar navigation with anchor links; the active section updates as you scroll (`IntersectionObserver`).
- JSON import and export with parsing, normalization, and clear inline errors.
- **Draft autosave** — the in-progress resume is stored in `localStorage` (with a timestamp in the header). **Reset draft** clears storage and restores the default template.
- **Light/dark theme** — persisted in `localStorage`, with a one-time default from `prefers-color-scheme`.

## Tech stack

- React 19
- TypeScript
- Vite 8
- ESLint 9 (flat config)

No heavy form or drag-and-drop libraries. Reordering uses native drag events plus Up/Down buttons.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Sample JSON files for import testing live under [`resumes/`](resumes/).

## Deploy to GitHub Pages

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys on pushes to `main` (or manual **Run workflow**).

1. Push this repo to GitHub.
2. In GitHub: **Settings → Pages** → set **Source** to **GitHub Actions**.
3. Push to `main` or trigger the workflow from the **Actions** tab.

The build step copies `dist/index.html` to `dist/404.html` so hard refreshes on deep paths still load the SPA.

**Base URL:** In CI, Vite’s `base` is set from `GITHUB_REPOSITORY` so assets resolve under `https://<user>.github.io/<repo>/`. Local dev uses `/`.

## Project structure

```text
src/
  App.tsx                          # State, sections, toolbar, persistence, theme
  App.css                          # Global styles (including theme tokens)
  main.tsx                         # App entry
  data/defaultResume.ts            # Default typed resume template
  types/resume.ts                  # Domain types (ResumeData and section item shapes)
  utils/importExport.ts            # parseResumeJson + downloadResumeJson
  components/
    Sidebar.tsx                    # Section nav (#anchors, active section)
    SectionCard.tsx                # Section shell + preview rows + primary action
    modals/
      BasicsModal.tsx              # Basics editor
      ArrayItemModal.tsx           # Generic array-item editor (per-section fields)
resumes/                           # Example JSON files (optional import tests)
.github/workflows/deploy.yml       # GitHub Pages deploy
```

## How the app works

### Single source of truth

`App.tsx` holds `resume: ResumeData`. Edits, import, reorder, and delete update that state immutably. A `useEffect` writes the full resume to `localStorage` whenever it changes (failures such as quota or private mode are ignored so the app stays usable).

### Section list

The visible order is fixed in code: basics, skills, work, education, certificates, projects, references, languages, interests, volunteer, publications, awards (see `sections` in `App.tsx`). Each block has an `id` matching the section key for sidebar hash links.

### Import and export

Logic lives in `src/utils/importExport.ts`.

- **`parseResumeJson(text)`** — parses JSON, checks that modeled array sections are arrays when present, merges with defaults, normalizes string fields and nested `basics` / profiles, and returns `{ ok: true, data }` or `{ ok: false, error }`.
- **`downloadResumeJson(resume, filename?)`** — downloads pretty-printed JSON (default filename `resume.json`).

Import errors show in a dismissible banner. Successful import replaces editor state and closes open modals.

### Delete confirmation

Deleting an array entry opens an in-app dialog (not `window.confirm`). Confirming removes the item and adjusts open-editor indices when needed.

## Scope and limitations

- Validation is practical rather than a full JSON Schema pass; bad shapes are normalized or rejected with a short message.
- The typed model matches the main JSON Resume sections above. Anything outside `ResumeData` is not a first-class part of the editor UI (focus is on the sections listed).

## Extending the editor

To add or change sections:

1. Update `ResumeData` and related item types in `src/types/resume.ts`.
2. Add defaults in `src/data/defaultResume.ts`.
3. Extend normalization in `src/utils/importExport.ts`.
4. Wire the section into `App.tsx` (ordering, display meta, row UI, `createEmptyArrayItem`, and `ArrayItemModal` field handling if needed).
5. Reuse `ArrayItemModal` for new array-of-object sections when the pattern fits.
