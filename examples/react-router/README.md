# React Router Example

Uses `evaluateNext` to choose the next node, then navigates with React Router.
Includes a host-defined fallback route when no edge matches.

## Run

```bash
pnpm install
pnpm --filter @journeys/core build
pnpm --filter example-react-router dev
```

Open the printed URL (default port `5175`).

## Integration contract

- Node routes live in `node.data.route` with a developer fallback map.
- `useWorkflowNavigation` maps app state → context → `evaluateNext` → `navigate`.
- Product users edit conditions in workflow JSON; developers own routing tables.
