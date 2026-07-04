# Edge Runtime Example

Shows a fetch-style handler that validates workflow JSON once, then evaluates
requests at the edge and returns JSON. The local server simulates an edge worker.

## Run

```bash
pnpm install
pnpm --filter @journeys/core build
pnpm --filter example-edge-runtime start
```

Send requests:

```bash
curl -s -X POST http://localhost:8787/evaluate \
  -H 'content-type: application/json' \
  -d '{"currentNodeId":"start","context":{"loanValueRatio":60}}'
```

## Integration contract

- **Product** owns workflow JSON loaded at deploy time or from storage.
- **Developer** owns the handler, request parsing, auth, and response mapping.
- **Core** owns validation and `evaluateNext`.

See `src/handler.mjs` for the portable handler shape.
