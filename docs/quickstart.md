# Quickstart

Journeys evaluates product-editable journeys stored as plain JSON
adjacency lists. The core package validates workflows and picks the next node
from a runtime context object.

## Install (monorepo local development)

```bash
git clone <repo-url>
cd journeys  # or your clone directory
pnpm install
pnpm --filter @journeys/core build
```

## Install from npm

```bash
pnpm add @journeys/core
```

## Minimal usage

```ts
import { evaluateNext, validateWorkflow } from "@journeys/core";
import workflow from "./workflow.json";

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  console.error(validation.issues);
  throw new Error("Invalid workflow");
}

const result = evaluateNext(workflow, {
  currentNodeId: workflow.startNodeId,
  context: { loanValueRatio: 74 },
});

if (result.status === "matched") {
  console.log("Next node:", result.nextNode.id);
}
```

## Integration contract

Your app owns:

1. **Context mapping** — stable field names product users edit in conditions
2. **Node interpretation** — routes, screens, services, or actions per node id
3. **Side effects** — navigation, rendering, persistence

The core package owns validation, condition evaluation, and deterministic edge
selection.

## Runtime state helpers

When you want the library to track current node, previous node, and history:

```ts
import {
  advanceWorkflow,
  createWorkflowState,
  inspectWorkflowState,
} from "@journeys/core";

const state = createWorkflowState(workflow);
const snapshot = inspectWorkflowState(workflow, {
  state,
  context: { loanValueRatio: 60 },
});

const advanced = advanceWorkflow(workflow, { state, context });
if (advanced.status === "advanced") {
  // use advanced.state
}
```

## Visual builder

```bash
pnpm --filter @journeys/core build
pnpm --filter builder dev
```

## Next steps

- [Workflow JSON schema](02-workflow-json-schema.md)
- [Evaluation engine](03-evaluation-engine.md)
- [Examples index](examples.md)
- [API reference](api.md)
