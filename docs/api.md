# API Reference

Public exports from `@journeys/core`. All functions are framework
agnostic and safe to run in Node.js, browsers, and edge runtimes.

## Types

Key types (see [workflow JSON schema](02-workflow-json-schema.md) for full
definitions):

- `WorkflowDefinition`
- `WorkflowNode`, `WorkflowEdge`
- `Condition`, `ConditionGroup`, `Operator`
- `WorkflowContext`
- `ValidationResult`, `ValidationIssue`
- `EvaluateNextInput`, `EvaluateNextResult`
- `WorkflowRuntimeState`, `WorkflowStateSnapshot`, `WorkflowNextCandidate`

## Validation

### `validateWorkflow(input: unknown): ValidationResult`

Returns `{ valid, issues }` with stable issue codes. Does not throw.

### `assertValidWorkflow(workflow: unknown): asserts workflow is WorkflowDefinition`

Throws when validation fails.

### `parseWorkflowJson(json: string): ParseWorkflowResult`

Parses JSON, rejects unsafe keys, validates schema. Returns `{ ok: true, workflow }`
or `{ ok: false, issues }`.

### `serializeWorkflow(workflow: WorkflowDefinition): string`

Serializes after validation. Returns compact JSON string.

## Evaluation

### `evaluateCondition(condition, context): ConditionResult`

Evaluates a single comparison condition.

### `evaluateConditionGroup(group, context): ConditionGroupResult`

Evaluates nested `always`, `all`, `any`, or `not` groups without short-circuiting
detail collection in V1.

### `evaluateNext(workflow, input): EvaluateNextResult`

Deterministic outgoing-edge evaluation from `input.currentNodeId` and
`input.context`. Returns `matched`, `no_match`, or `invalid_current_node`.

## Runtime state

### `createWorkflowState(workflow, initialNodeId?)`

Creates `{ currentNodeId, history: [] }`.

### `inspectWorkflowState(workflow, input): WorkflowStateSnapshot`

Returns current node, previous node, and possible next candidates. Includes
condition results when `context` is provided.

### `advanceWorkflow(workflow, input): AdvanceWorkflowResult`

Calls `evaluateNext` from `input.state.currentNodeId`. Returns immutable updated
state on match; original state on no match.

## Graph helpers

- `getOutgoingEdges(workflow, nodeId)`
- `getIncomingEdges(workflow, nodeId)`
- `getPossibleNextNodes(workflow, stateOrNodeId, context?)`
- `getReachableNodeIds(workflow, startNodeId?)`
- `findUnreachableNodes(workflow)`
- `findDeadEnds(workflow)`

## Utilities

### `deepJsonEqual(a, b): boolean`

Deep JSON equality with object key order independence.

## Non-goals

The core package does not:

- own application state or routing
- parse expression strings or use `eval`
- include React, DOM, or network dependencies
