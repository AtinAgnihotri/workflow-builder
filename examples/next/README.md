# Next.js Example (Client-Side V1)

Client-only Next.js App Router example. Workflow evaluation runs in the browser;
Next handles navigation after `evaluateNext`.

## Run

```bash
pnpm install
pnpm --filter @workflow-builder/core build
pnpm --filter example-next dev
```

Open `http://localhost:3001`.

## Scope

V1 intentionally avoids server actions or RSC evaluation complexity. The same
workflow JSON and context mapping pattern applies on the server later if needed.
