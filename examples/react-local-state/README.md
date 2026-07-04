# React Local State Example

React app that stores workflow position in component state and advances with
`advanceWorkflow`. No router — screen changes by rendering the current node id.

## Run

```bash
pnpm install
pnpm --filter @journeys/core build
pnpm --filter example-react-local-state dev
```

Open the printed URL (default port `5174`).

## Who owns what

- **Product** edits workflow JSON (conditions, priorities, node labels).
- **Developer** maps loan app state to context and renders screens by node id.
- **Core** validates, evaluates, and tracks runtime state immutably.

Try changing LVR above 70 and clicking Next to reach Manual Review.
