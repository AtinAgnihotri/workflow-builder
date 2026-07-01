# TanStack Router Example

Same integration contract as the React Router example, using TanStack Router
navigation idioms after `evaluateNext`.

## Run

```bash
pnpm install
pnpm --filter @workflow-builder/core build
pnpm --filter example-tanstack-router dev
```

## Notes

- Workflow JSON remains framework-agnostic.
- TanStack-specific code is limited to route definitions and `useNavigate`.
