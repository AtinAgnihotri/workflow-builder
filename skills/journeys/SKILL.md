# Journeys Skill

## Purpose

Use this skill when a coding agent needs to create, edit, validate, or integrate
Journeys workflows.

Journeys represents product-editable workflows as plain JSON adjacency
lists. The core package validates workflow definitions and deterministically
evaluates the next node from a runtime context object.

Supported Journeys schema: `1.0`

## When To Use

Use this skill when the task mentions:

- Journeys
- workflow JSON
- adjacency-list workflows
- product-editable journeys
- conditional routing or branching
- Journeys builder output
- `@journeys/core`

## Mental Model

Developer-owned:

- map application state into workflow context
- decide what node IDs mean
- perform navigation, rendering, service calls, or other side effects
- store or load workflow JSON

Journeys-owned:

- JSON workflow schema
- validation
- condition evaluation
- deterministic next-node selection
- optional runtime state helpers for current node, previous node, history, and
  possible next nodes
- builder UI import/export shape

The library does not own routing, rendering, persistence, authentication, or app
state.

## Workflow JSON Summary

A workflow is a versioned graph:

```json
{
  "schemaVersion": "1.0",
  "id": "loan-demo",
  "name": "Loan Demo",
  "startNodeId": "start",
  "nodes": {
    "start": { "id": "start", "label": "Start", "type": "start" },
    "offer": { "id": "offer", "label": "Offer", "type": "screen" },
    "review": { "id": "review", "label": "Review", "type": "screen" }
  },
  "edges": {
    "start": [
      {
        "id": "low-lvr",
        "from": "start",
        "to": "offer",
        "priority": 10,
        "when": {
          "all": [
            { "field": "loanValueRatio", "operator": "lt", "value": 70 }
          ]
        }
      },
      {
        "id": "fallback-review",
        "from": "start",
        "to": "review",
        "priority": 100,
        "when": { "always": true }
      }
    ]
  }
}
```

Rules:

- `nodes` is keyed by node ID.
- each node key must equal `node.id`.
- `edges` is an adjacency list keyed by source node ID.
- each edge must appear under `edges[edge.from]`.
- `startNodeId` must exist in `nodes`.
- edge priority is sorted ascending; lower number wins.
- equal priority preserves edge array order.

## Conditions

Use structured JSON condition groups, not expression strings.

Supported group shapes:

```json
{ "always": true }
```

```json
{ "all": [{ "field": "age", "operator": "gte", "value": 29 }] }
```

```json
{ "any": [{ "field": "country", "operator": "eq", "value": "GB" }] }
```

```json
{ "not": { "field": "blocked", "operator": "eq", "value": true } }
```

For schema `1.0`, `field` is a direct key in the runtime context object. Do not
interpret dots as nested paths.

## Operators

Value-taking operators:

- `eq`
- `neq`
- `gt`
- `gte`
- `lt`
- `lte`
- `contains`
- `not_contains`
- `starts_with`
- `ends_with`
- `in`
- `not_in`

No-value operators:

- `exists`
- `not_exists`
- `is_null`
- `is_not_null`

Do not coerce strings to numbers. If a product user wants numeric comparison,
the expected value and actual context value should both be numbers.

## Safe Evaluation Pattern

Prefer the installed package when available:

```ts
import {
  advanceWorkflow,
  createWorkflowState,
  evaluateNext,
  inspectWorkflowState,
  parseWorkflowJson,
  validateWorkflow,
} from "@journeys/core";

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  console.error(validation.issues);
}

const result = evaluateNext(workflow, {
  currentNodeId: workflow.startNodeId,
  context: { loanValueRatio: 74 },
});

if (result.status === "matched") {
  console.log(result.nextNode.id);
}
```

If the app wants the library to track workflow position:

```ts
const state = createWorkflowState(workflow);
const snapshot = inspectWorkflowState(workflow, {
  state,
  context: { loanValueRatio: 74 },
});

console.log(snapshot.currentNode?.id);
console.log(snapshot.previousNode?.id);
console.log(snapshot.possibleNext.map((candidate) => candidate.node.id));

const advanced = advanceWorkflow(workflow, {
  state,
  context: { loanValueRatio: 74 },
});
```

Handle all result statuses:

- `matched`
- `no_match`
- `invalid_current_node`

## Context Mapping Pattern

Map app-specific state into stable workflow fields:

```ts
function mapLoanStateToWorkflowContext(state: LoanState) {
  return {
    loanValueRatio: state.loanApplications[0]?.lvr,
    applicantAge: state.applicant.age,
    applicantCountry: state.applicant.address.country,
  };
}
```

Product users should see stable field names like `loanValueRatio`, not internal
paths like `loanApplications[0].lvr`.

## Integration Pattern

Use Journeys to choose the next node. Let the host app decide what that
node means.

```ts
const result = evaluateNext(workflow, {
  currentNodeId,
  context: mapLoanStateToWorkflowContext(appState),
});

if (result.status === "matched") {
  navigate(routeByNodeId[result.nextNode.id]);
}
```

## Validation Checklist

After editing workflow JSON:

- parse JSON successfully
- validate with `validateWorkflow` when available
- preserve `schemaVersion: "1.0"`
- confirm `startNodeId` exists
- confirm node keys match node IDs
- confirm edge `from` and `to` nodes exist
- confirm edges are stored under `edges[from]`
- confirm operators are supported
- confirm value requirements match the operator
- confirm fallback edges use intentional priority

## Anti-Patterns

Do not:

- use `eval`
- use `new Function`
- create expression strings like `"age >= 29"`
- invent a custom textual DSL
- add React, Vue, Svelte, Solid, router, or DOM dependencies to the core package
- add npm packages casually; preserve the repo's dependency-minimal posture and
  1-day package age gate
- make Journeys own app routing or state
- convert exported JSON into a graph-library-only shape
- treat `field: "a.b.c"` as a nested lookup in schema `1.0`
- silently coerce `"70"` to `70`
- hide validation issues from the user

## If The Package Is Not Installed

If `@journeys/core` is not installed:

1. do not guess hidden APIs
2. use the documented JSON shape
3. suggest installing the core package
4. if implementing the package itself, read repository docs and PRPs first

## Harness Notes

Harness-specific notes live in:

- `harnesses/cursor.md`
- `harnesses/claude-code.md`
- `harnesses/codex.md`
- `harnesses/opencode.md`

The canonical instructions are in this file.
