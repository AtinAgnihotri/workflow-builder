# Evaluation Engine

## Core Responsibility

The evaluator answers this question:

> Given a workflow, current node, and runtime context, which outgoing edge should
> be taken next?

It should not navigate, render, persist, fetch data, or mutate application state.

The core package should provide both stateless evaluation and a small runtime
state helper layer. Stateless evaluation answers "what would happen from this
node?" Runtime state helpers answer "where is this workflow session now, where
did it come from, and what could happen next?"

## Evaluation Algorithm

Pseudocode:

```ts
function evaluateNext(workflow, input) {
  const currentNode = workflow.nodes[input.currentNodeId];

  if (!currentNode) {
    return {
      status: "invalid_current_node",
      currentNodeId: input.currentNodeId,
    };
  }

  const outgoingEdges = workflow.edges[input.currentNodeId] ?? [];

  const edgesWithIndex = outgoingEdges.map((edge, index) => ({ edge, index }));

  edgesWithIndex.sort((left, right) => {
    const priorityDiff = (left.edge.priority ?? 0) - (right.edge.priority ?? 0);
    if (priorityDiff !== 0) return priorityDiff;
    return left.index - right.index;
  });

  const evaluatedEdges = [];

  for (const item of edgesWithIndex) {
    const conditionResult = evaluateConditionGroup(item.edge.when, input.context);
    evaluatedEdges.push({ edge: item.edge, conditionResult });

    if (conditionResult.matched) {
      return {
        status: "matched",
        currentNode,
        nextNode: workflow.nodes[item.edge.to],
        edge: item.edge,
        conditionResult,
      };
    }
  }

  return {
    status: "no_match",
    currentNode,
    evaluatedEdges,
  };
}
```

## Determinism Rules

- Smaller priority number wins.
- Missing priority is `0`.
- Equal priority uses the order in the edge array.
- Only outgoing edges from the current node are evaluated.
- `always: true` should be treated like a normal condition group. It should
  usually be placed last with a higher priority number if it is a fallback.

## Condition Group Evaluation

Pseudocode:

```ts
function evaluateConditionGroup(group, context) {
  if ("always" in group) {
    return { matched: group.always === true, details: [] };
  }

  if ("all" in group) {
    const details = group.all.map((item) => evaluateConditionNode(item, context));
    return { matched: details.every((item) => item.matched), details };
  }

  if ("any" in group) {
    const details = group.any.map((item) => evaluateConditionNode(item, context));
    return { matched: details.some((item) => item.matched), details };
  }

  if ("not" in group) {
    const detail = evaluateConditionNode(group.not, context);
    return { matched: !detail.matched, details: [detail] };
  }

  return {
    matched: false,
    details: [],
    issue: {
      code: "condition.invalid_group",
      message: "Condition group must contain always, all, any, or not.",
    },
  };
}
```

Do not short-circuit in V1. Full details are more useful for the preview UI. If
performance later matters, add an option:

```ts
evaluateConditionGroup(group, context, { collectDetails: false })
```

## Condition Evaluation

Pseudocode:

```ts
function evaluateCondition(condition, context) {
  const hasField = Object.prototype.hasOwnProperty.call(context, condition.field);
  const actual = hasField ? context[condition.field] : undefined;

  switch (condition.operator) {
    case "exists":
      return result(condition, actual, hasField && actual !== undefined);

    case "not_exists":
      return result(condition, actual, !hasField || actual === undefined);

    case "is_null":
      return result(condition, actual, hasField && actual === null);

    case "is_not_null":
      return result(condition, actual, hasField && actual !== null && actual !== undefined);

    case "eq":
      return result(condition, actual, deepJsonEqual(actual, condition.value));

    case "neq":
      return result(condition, actual, !deepJsonEqual(actual, condition.value));

    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return compareOrdered(condition, actual);

    case "contains":
    case "not_contains":
      return compareContains(condition, actual);

    case "starts_with":
    case "ends_with":
      return compareString(condition, actual);

    case "in":
    case "not_in":
      return compareMembership(condition, actual);

    default:
      return result(condition, actual, false, {
        code: "condition.operator_invalid",
        message: `Unsupported operator: ${condition.operator}`,
      });
  }
}
```

## Type Mismatch Behavior

Type mismatches should not throw. They should return `matched: false` with an
issue attached.

Example:

```json
{ "field": "age", "operator": "gte", "value": "29" }
```

With context:

```json
{ "age": 30 }
```

Result:

```ts
{
  matched: false,
  actual: 30,
  issue: {
    code: "condition.type_mismatch",
    message: "Operator gte requires actual and expected values to both be numbers or both be strings."
  }
}
```

## Workflow Validation Before Evaluation

Callers should validate workflows when loading them. `evaluateNext` may assume a
valid `WorkflowDefinition` type, but it still needs to handle `currentNodeId`
not existing because that is runtime input.

Recommended flow:

```ts
const parsed = parseWorkflowJson(json);
if (!parsed.ok) {
  showErrors(parsed.issues);
  return;
}

const result = evaluateNext(parsed.workflow, {
  currentNodeId,
  context,
});
```

## Runtime State Helpers

### Initialize State

```ts
function createWorkflowState(workflow, initialNodeId = workflow.startNodeId) {
  return {
    currentNodeId: initialNodeId,
    history: [],
  };
}
```

If `initialNodeId` does not exist, the helper can still return state, but
`inspectWorkflowState` and `advanceWorkflow` should surface the invalid current
node through their result shapes. Do not throw by default.

### Inspect Current, Previous, And Possible Next Nodes

```ts
function inspectWorkflowState(workflow, input) {
  const currentNode = workflow.nodes[input.state.currentNodeId];
  const previousNode = input.state.previousNodeId
    ? workflow.nodes[input.state.previousNodeId]
    : undefined;

  const outgoingEdges = sortEdges(workflow.edges[input.state.currentNodeId] ?? []);

  const possibleNext = outgoingEdges
    .map((edge) => {
      const node = workflow.nodes[edge.to];
      if (!node) return undefined;

      if (!input.context) {
        return {
          edge,
          node,
          priority: edge.priority ?? 0,
        };
      }

      const conditionResult = evaluateConditionGroup(edge.when, input.context);

      return {
        edge,
        node,
        priority: edge.priority ?? 0,
        conditionResult,
        wouldMatch: conditionResult.matched,
      };
    })
    .filter(Boolean);

  return {
    state: input.state,
    currentNode,
    previousNode,
    possibleNext,
  };
}
```

This helper should not advance the workflow. It is for UI previews, debugging,
breadcrumbs, and "what can happen next?" displays.

### Advance State

```ts
function advanceWorkflow(workflow, input) {
  const evaluation = evaluateNext(workflow, {
    currentNodeId: input.state.currentNodeId,
    context: input.context,
  });

  if (evaluation.status !== "matched") {
    return {
      status: "not_advanced",
      state: input.state,
      evaluation,
    };
  }

  const transition = {
    fromNodeId: evaluation.currentNode.id,
    toNodeId: evaluation.nextNode.id,
    edgeId: evaluation.edge.id,
    metadata: input.metadata,
  };

  if (input.recordContextSnapshot) {
    transition.contextSnapshot = cloneJsonObject(input.context);
  }

  return {
    status: "advanced",
    state: {
      currentNodeId: evaluation.nextNode.id,
      previousNodeId: evaluation.currentNode.id,
      history: [...input.state.history, transition],
    },
    evaluation,
  };
}
```

Runtime state updates must be immutable. The returned state can be stored in
React state, Zustand, a server session, local storage, or any host-owned
persistence mechanism.

## Graph Inspection Helpers

Implement these helpers in core after validation and evaluation are stable:

```ts
function getOutgoingEdges(workflow, nodeId): WorkflowEdge[];
function getIncomingEdges(workflow, nodeId): WorkflowEdge[];
function getPossibleNextNodes(workflow, stateOrNodeId, context?): WorkflowNextCandidate[];
function getReachableNodeIds(workflow, startNodeId = workflow.startNodeId): Set<string>;
function findUnreachableNodes(workflow): WorkflowNode[];
function findDeadEnds(workflow): WorkflowNode[];
```

Definitions:

- unreachable node: no path from `startNodeId`
- dead end: no outgoing edges and node type is not `terminal`

These helpers should power UI warnings, not block valid workflows by default.

## Test Matrix

Core evaluator tests must cover:

- missing current node
- no outgoing edges
- no matching edges
- create runtime state from start node
- inspect current node with no previous node
- inspect previous node after an advance
- inspect possible next nodes without context
- inspect possible next nodes with condition results when context is provided
- advance updates current node, previous node, and history immutably
- advance does not update state when no edge matches
- matching first edge
- priority ordering
- stable order for equal priority
- `always: true` fallback
- nested `all`, `any`, and `not`
- every V1 operator
- type mismatch per operator family
- missing context field
- `null` vs `undefined`
- deep equality for arrays and objects
- adjacency-list key mismatch in validation
- unreachable node warnings

## Example Runtime Integration

```ts
import { evaluateNext } from "@journeys/core";

function goToNextStep(workflow, currentNodeId, appState, navigate) {
  const context = {
    firstLoanLvr: appState.loanApplications[0]?.lvr,
    applicantCountry: appState.applicant.address.country,
  };

  const result = evaluateNext(workflow, { currentNodeId, context });

  if (result.status === "matched") {
    navigate(result.nextNode.data?.route ?? result.nextNode.id);
    return;
  }

  if (result.status === "no_match") {
    navigate("/manual-review");
    return;
  }

  throw new Error(`Unknown workflow node: ${result.currentNodeId}`);
}
```
