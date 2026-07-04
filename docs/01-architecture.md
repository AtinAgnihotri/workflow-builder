# Architecture

## Recommended Repository Shape

```text
workflow-builder/
  packages/
    core/
      src/
      tests/
      package.json
      tsconfig.json
  apps/
    builder/
      src/
      package.json
      vite.config.ts
  examples/
    vanilla/
    react-router/
    tanstack-router/
    next/
  docs/
  PRPs/
  package.json
  tsconfig.base.json
  pnpm-workspace.yaml
```

Use a monorepo from the start because the package, UI, examples, and docs need
to move together. Keep package boundaries simple.

## Package Boundaries

### `packages/core`

The core package is the product's foundation. It must have no dependency on a UI
framework.

Responsibilities:

- exported TypeScript types
- workflow schema constants
- validation
- evaluator
- import/export helpers
- migration helpers once schema versions change
- small utility functions for graph inspection

Avoid:

- React, Vue, Solid, Svelte, DOM APIs
- Node-only APIs such as `fs`
- network calls
- persistence
- global state

### `apps/builder`

The builder is a visual editor for creating workflow JSON. It imports
`@journeys/core` instead of duplicating schema logic.

Responsibilities:

- create, edit, delete nodes
- create, edit, delete edges
- edit edge condition groups
- validate workflow continuously
- preview evaluation against sample context
- import and export JSON
- provide copy-to-clipboard and download flows

Persistence in V1 should be local only:

- browser memory for active edits
- optional `localStorage` autosave
- JSON import/export for durable storage

### `examples`

Examples should be treated as integration contracts. They are the evidence used
to decide whether adapters are worth building.

Initial examples:

- vanilla TypeScript evaluation
- React component state example
- React Router navigation example
- TanStack Router navigation example
- Next.js client-side journey example
- Cloudflare Worker or edge function decision example

### `docs`

Docs should be usable as GitHub Pages content. Start with Markdown. A static
site generator can be added later if needed.

## Runtime Flow

The runtime flow is intentionally small:

```text
host app state
  -> developer-owned mapping function
  -> workflow context object
  -> core evaluator
  -> matched edge and next node
  -> developer-owned action
```

The library should not own the application's state, routing, rendering, or side
effects.

## Data Flow In The Builder

```text
user edits graph
  -> builder updates draft workflow object
  -> builder calls validateWorkflow(draft)
  -> builder renders validation messages
  -> user optionally enters sample context
  -> builder calls evaluateNext(draft, preview input)
  -> user exports JSON
```

Builder state should store the same JSON shape that the core package consumes.
Avoid separate internal graph formats unless the graph-rendering library requires
a view model. If it does, use explicit conversion functions:

```ts
function workflowToGraphView(workflow: WorkflowDefinition): GraphViewModel;
function graphViewToWorkflow(view: GraphViewModel): WorkflowDefinition;
```

## Core Public API

Recommended V1 exports:

```ts
export type WorkflowDefinition = ...
export type WorkflowNode = ...
export type WorkflowEdge = ...
export type Condition = ...
export type ConditionGroup = ...
export type WorkflowContext = ...

export function validateWorkflow(workflow: unknown): ValidationResult;
export function assertValidWorkflow(workflow: unknown): asserts workflow is WorkflowDefinition;
export function evaluateCondition(condition: Condition, context: WorkflowContext): ConditionResult;
export function evaluateConditionGroup(group: ConditionGroup, context: WorkflowContext): ConditionGroupResult;
export function evaluateNext(workflow: WorkflowDefinition, input: EvaluateNextInput): EvaluateNextResult;
export function createWorkflowState(workflow: WorkflowDefinition, initialNodeId?: string): WorkflowRuntimeState;
export function inspectWorkflowState(workflow: WorkflowDefinition, input: InspectWorkflowStateInput): WorkflowStateSnapshot;
export function advanceWorkflow(workflow: WorkflowDefinition, input: AdvanceWorkflowInput): AdvanceWorkflowResult;
export function getReachableNodeIds(workflow: WorkflowDefinition, startNodeId?: string): Set<string>;
export function findDeadEnds(workflow: WorkflowDefinition): WorkflowNode[];
export function serializeWorkflow(workflow: WorkflowDefinition): string;
export function parseWorkflowJson(json: string): ParseWorkflowResult;
```

`evaluateNext` is a pure stateless helper. `createWorkflowState`,
`inspectWorkflowState`, and `advanceWorkflow` provide a runtime pointer layer for
apps that want the library to track current node, previous node, transition
history, and possible next nodes.

## Dependency Strategy

Core package:

- TypeScript
- no runtime dependencies by default
- use TypeScript compiler output directly before adding a bundler
- use Node's built-in test runner before adding a test framework
- a schema validator such as Zod is acceptable only if hand-written validation
  becomes materially riskier than the dependency
- no UI dependencies

Supply-chain rules:

- keep npm package exposure as low as possible
- require a written justification in the PR or PRP notes for every new
  dependency
- prefer standard library and small local helpers for core behavior
- enforce a minimum package release age of 1 day in package-manager config where
  supported
- do not bypass the age gate except for an explicitly reviewed security fix
- pin the package manager version that supports the age gate
- keep the core package free of runtime dependencies unless the maintainer
  explicitly approves an exception

Builder app:

- Vite
- React is acceptable for the first UI because ecosystem support is strong
- React Flow or XYFlow is acceptable for graph editing
- Zustand is acceptable for local builder state if plain React state gets noisy
- Monaco is optional; a simple text area is enough for JSON context preview

Docs:

- Markdown first
- optionally VitePress later

Package manager:

- Prefer pnpm workspaces for predictable monorepo management.

## Stability Rules

### Schema Versioning

Every workflow must include `schemaVersion`. Start with:

```json
{ "schemaVersion": "1.0" }
```

Patch-level package releases can add helper APIs, but must not change the JSON
meaning of schema `1.0`.

### Deterministic Evaluation

Edge evaluation must be deterministic:

1. Read edges from `workflow.edges[currentNodeId]`.
2. Sort by numeric `priority` ascending.
3. Preserve original array order for equal priority.
4. Return the first edge whose condition group matches.
5. If no edge matches, return a `no_match` result.

This avoids non-determinism from object key order and makes product behavior
auditable.

### No Arbitrary Code Execution

Operators must be implemented as library functions. Do not evaluate strings as
JavaScript.

Unsafe:

```json
{ "expression": "user.age > 29 && user.country === 'GB'" }
```

Safe:

```json
{
  "all": [
    { "field": "age", "operator": "gt", "value": 29 },
    { "field": "country", "operator": "eq", "value": "GB" }
  ]
}
```

## Error Philosophy

Expose errors as structured data. Avoid throwing during normal evaluation unless
the caller chooses an asserting API.

Example:

```ts
type ValidationIssue = {
  code: string;
  path: Array<string | number>;
  message: string;
  severity: "error" | "warning";
};
```

The UI can render these directly, and tests can assert on `code`.

## Security Considerations

- Do not allow executable expressions.
- Treat imported JSON as untrusted.
- Reject prototype-polluting keys where the implementation writes into plain
  objects, especially `__proto__`, `constructor`, and `prototype`.
- Prefer `Map` internally when processing user-controlled keys.
- Validate maximum workflow size in the builder to avoid freezing the UI.
- Validate maximum condition nesting depth.
- Avoid regex denial-of-service by either omitting regex in V1 or documenting
  limits if `matches` is included.

## Performance Expectations

V1 can evaluate edges linearly from the current node. That is acceptable because
most product workflows are small.

Target:

- 100 nodes
- 500 edges
- 10 conditions per edge
- sub-millisecond to low-millisecond evaluation in modern runtimes

Do not build indexing or graph optimization until real examples require it.
