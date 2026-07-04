# Journeys (`@journeys/core`)

Framework-agnostic workflow definition, validation, and evaluation for JSON
adjacency-list workflows (schema **1.0**).

## Install

```bash
pnpm add @journeys/core
# or
npm install @journeys/core
```

## Quick example

```ts
import { evaluateNext, validateWorkflow } from "@journeys/core";

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  console.error(validation.issues);
}

const result = evaluateNext(workflow, {
  currentNodeId: workflow.startNodeId,
  context: { loanValueRatio: 74 },
});
```

## Documentation

- [Quickstart](../../docs/quickstart.md)
- [API reference](../../docs/api.md)
- [Workflow JSON schema](../../docs/02-workflow-json-schema.md)
- [Evaluation engine](../../docs/03-evaluation-engine.md)

## License

Apache License 2.0. See [LICENSE](./LICENSE).
