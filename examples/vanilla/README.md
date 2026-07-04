# Vanilla TypeScript Example

Shows the smallest Journeys integration: validate workflow JSON, map app
state to context, evaluate the next node, and interpret the result in host code.

## Who owns what

| Owner | Responsibility |
| --- | --- |
| Product / ops (via builder) | Workflow JSON, edge conditions, priorities |
| Developer | Context mapping, node interpretation, side effects |

## Run

From the repository root:

```bash
pnpm install
pnpm --filter @journeys/core build
pnpm --filter example-vanilla start
```

Expected output includes the matched edge and next node (`offer` for LVR 65).

## Files

- `workflow.json` — product-editable workflow definition
- `src/mapContext.mjs` — maps app state to workflow context
- `src/interpretNode.mjs` — maps nodes to host actions
- `src/index.mjs` — validates and evaluates from the start node
