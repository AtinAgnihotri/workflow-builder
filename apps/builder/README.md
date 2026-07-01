# Workflow Builder UI

Local browser-based visual editor for Workflow Builder JSON. The app imports
validation and evaluation from `@workflow-builder/core` and does not duplicate
schema logic.

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter @workflow-builder/core build
pnpm --filter builder dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

## Scripts

```bash
pnpm --filter builder dev
pnpm --filter builder build
pnpm --filter builder typecheck
pnpm --filter builder test
```

## Dependencies

- **Vite + React + TypeScript** — app shell and UI
- **@xyflow/react** — graph canvas for nodes and edges
- **@workflow-builder/core** — types, validation, parse/serialize, evaluation

## Manual QA checklist

- [ ] Add three nodes and connect them with conditional edges
- [ ] Edit node label, type, description, and data JSON
- [ ] Edit edge priority and condition groups (`always`, `all`, `any`, `not`)
- [ ] Import invalid JSON and confirm the current draft is unchanged
- [ ] Export/copy JSON and validate it with core
- [ ] Enter sample context JSON and preview matched next node
- [ ] Advance preview state and confirm previous/current node display

## Test coverage note

Vitest covers import failure preservation, export validity, and preview
evaluation. Full browser interaction tests are deferred to manual QA for V1.
