# Examples

Runnable examples live under [`examples/`](../examples/). Each demonstrates the
same integration contract:

1. map app state → workflow context
2. evaluate with `@journeys/core`
3. interpret nodes in host code (screens, routes, handlers)

## Index

| Example | Path | Shows |
| --- | --- | --- |
| Vanilla | [examples/vanilla](../examples/vanilla/) | validate + evaluate from Node |
| React local state | [examples/react-local-state](../examples/react-local-state/) | `advanceWorkflow` without router |
| React Router | [examples/react-router](../examples/react-router/) | `evaluateNext` + `useNavigate` |
| TanStack Router | [examples/tanstack-router](../examples/tanstack-router/) | same as React Router with TanStack APIs |
| Next.js | [examples/next](../examples/next/) | client-side App Router navigation |
| Edge runtime | [examples/edge-runtime](../examples/edge-runtime/) | fetch handler returning JSON |

Shared sample workflow JSON: [examples/shared/loan-workflow.json](../examples/shared/loan-workflow.json).

## Run from repository root

```bash
pnpm install
pnpm --filter @journeys/core build

# Node examples
pnpm --filter example-vanilla start
pnpm --filter example-edge-runtime start

# UI examples
pnpm --filter example-react-local-state dev
pnpm --filter example-react-router dev
pnpm --filter example-tanstack-router dev
pnpm --filter example-next dev
```

## Who edits what

| Layer | Owner |
| --- | --- |
| Workflow JSON, conditions, priorities | Product / ops (via builder) |
| Context field names exposed to product | Developer (stable mapping) |
| Routes, screens, API calls | Developer |
| Validation and evaluation | `@journeys/core` |

## Adapters

Framework adapter packages are intentionally deferred. See
[ADR 001: Examples before adapters](adr/001-examples-before-adapters.md).

For integration patterns, see [integration and adapters](05-integration-and-adapters.md).
