# JSON Resume Editor

A lightweight React + TypeScript + Vite app for editing a JSON Resume document through a structured UI.

The editor is currently focused on core sections:
- `basics`
- `work`
- `education`
- `skills`
- `projects`

Schema reference: [jsonresume.org/schema](https://jsonresume.org/schema)

## Goals

- Keep the implementation simple and easy to maintain.
- Allow section-based editing with modal forms.
- Support array item management (add, edit, delete, reorder).
- Support JSON import and export with basic validation and user-friendly errors.

## Tech stack

- React 19
- TypeScript
- Vite
- ESLint

No heavy form or drag-and-drop libraries are used. Reordering is implemented with native drag events plus Up/Down controls.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Deploy to GitHub Pages

This project is configured to deploy automatically with GitHub Actions.

1. Push this repo to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch (or run the workflow manually from the Actions tab).

The workflow builds the app and deploys the `dist` folder to GitHub Pages.

Notes:
- Vite `base` is set automatically in CI using your repository name.
- A `404.html` copy of `index.html` is generated so SPA route refreshes still load the app.

## Project structure

```text
src/
  App.tsx                          # Main state + orchestration
  App.css                          # Global app styles
  data/defaultResume.ts            # Default typed resume template
  types/resume.ts                  # Core domain types
  utils/importExport.ts            # Import parse/validate + export download
  components/
    Sidebar.tsx                    # Left navigation
    SectionCard.tsx                # Reusable section card shell
    modals/
      BasicsModal.tsx              # Dedicated basics editor modal
      ArrayItemModal.tsx           # Generic array item editor modal
```

## How the app works

### 1) Single source of truth

`App.tsx` keeps the whole resume in one state object:
- `resume: ResumeData`

All operations (edit, add, delete, reorder, import) update this state immutably.

### 2) Section rendering model

The UI is driven by a static section list:
- `['basics', 'work', 'education', 'skills', 'projects']`

For each section, a `SectionCard` is rendered with:
- section title
- short subtitle/count
- row list preview
- primary action button (`Edit` for basics, `Add` for array sections)

### 3) Editing flow

- **Basics**: opens `BasicsModal`, edits top-level basics fields, saves back into `resume.basics`.
- **Array sections**: each row has:
  - `Edit item` (opens `ArrayItemModal`)
  - `Delete` (opens confirmation modal)
  - `Up` / `Down` reorder controls
  - drag-and-drop reorder

When `Add` is clicked for array sections:
1. a blank typed object is appended
2. the new entry is immediately opened in `ArrayItemModal`

### 4) Delete confirmation

Delete uses an in-app confirmation modal (not browser `confirm`):
- `pendingDelete` stores `{ section, index }`
- confirming deletes the item and closes the dialog

### 5) Import and export

Import/export logic lives in `src/utils/importExport.ts`.

- `parseResumeJson(text)`:
  - parses JSON
  - validates root and key section shapes
  - sanitizes/normalizes known core fields into `ResumeData`
  - returns `{ ok: true, data }` or `{ ok: false, error }`

- `downloadResumeJson(resume)`:
  - serializes state with 2-space indentation
  - downloads as `resume.json`

Import errors are shown in an inline error banner in `App.tsx`.

## Known scope and limitations

- Only core sections are currently implemented in the UI.
- Validation is intentionally lightweight and focused on practical safety for the current feature set.
- Unknown JSON Resume sections are not yet editable in the interface.

## Extending the editor

If you want to add more sections:
1. Extend `ResumeData` in `src/types/resume.ts`.
2. Add defaults in `src/data/defaultResume.ts`.
3. Add parse normalization in `src/utils/importExport.ts`.
4. Add new section row rendering and actions in `App.tsx`.
5. Reuse `ArrayItemModal` for array-of-object sections when possible.
