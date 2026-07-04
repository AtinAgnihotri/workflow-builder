# Builder UI Spec

## Purpose

The builder UI lets non-technical users create and edit workflow JSON through a
visual graph interface. The UI should make invalid states visible, but it should
not hide the exported JSON from developers.

## Recommended Stack

Use:

- Vite
- React
- TypeScript
- React Flow or XYFlow for graph editing
- `@journeys/core` for schema types, validation, and evaluation
- lightweight local state, with Zustand only if state becomes hard to manage

The chosen stack is for the builder app only. The core package remains framework
agnostic.

## First Screen

Do not build a marketing landing page. The first screen should be the actual
builder:

```text
top toolbar:
  workflow name
  validation status
  import JSON
  export JSON
  copy JSON
  reset/demo

main area:
  left: graph canvas
  right: inspector panel

bottom or collapsible panel:
  validation issues and preview result
```

## Required V1 Workflows

### Create Node

User can:

- click add node
- enter label
- choose type from a small editable set
- save

System should:

- generate stable ID from label plus suffix if needed
- add node to `workflow.nodes`
- select the new node
- show validation status

### Edit Node

User can edit:

- label
- type
- description
- optional JSON data

`id` should be editable only behind an explicit advanced action because changing
IDs affects edges.

### Delete Node

User can delete a node. System must:

- remove node
- remove outgoing edges for that node
- remove incoming edges from other nodes
- prevent deleting the last remaining node
- require choosing a new start node if deleting the start node is ever allowed

For V1, simplest rule: do not allow deleting the start node.

### Create Edge

User can connect one node to another on the canvas or use an "add edge" button.
System creates:

```json
{
  "id": "edge-start-review",
  "from": "start",
  "to": "review",
  "priority": 0,
  "when": { "always": true }
}
```

Then the inspector should let the user edit conditions.

### Edit Edge Conditions

The condition editor should support:

- `always`
- `all`
- `any`
- `not`
- comparison rows with field, operator, and value
- nested groups at least two levels deep

For V1, avoid a clever natural-language rule builder. Use explicit controls that
map directly to JSON.

Condition row controls:

```text
field input | operator select | value type select | value input | remove
```

Value type select:

- string
- number
- boolean
- null
- JSON

For operators that do not take values, disable the value input.

### Preview Evaluation

User can enter sample context JSON:

```json
{
  "loanValueRatio": 74,
  "country": "GB"
}
```

User can choose current node. System calls:

```ts
evaluateNext(workflow, { currentNodeId, context })
```

Show:

- matched edge
- next node
- current node
- previous node when preview state has advanced
- possible next nodes from the current node
- no-match state
- per-condition matched or failed details
- type mismatch messages

The preview panel should use the runtime state helpers from core once available:

```ts
const snapshot = inspectWorkflowState(workflow, {
  state: previewState,
  context,
});

const advanced = advanceWorkflow(workflow, {
  state: previewState,
  context,
});
```

This lets the builder preview show where the workflow currently is, where it
came from, and which candidates could be selected next.

### Import JSON

User can paste workflow JSON. System should:

1. parse JSON
2. validate workflow
3. if valid, replace current draft
4. if invalid, show issues without destroying current draft

### Export JSON

User can:

- copy formatted JSON
- download `workflow-id.json`

Export should use the exact core schema.

## State Model

Keep the builder draft as a `WorkflowDefinition`.

```ts
type BuilderState = {
  workflow: WorkflowDefinition;
  previewState: WorkflowRuntimeState;
  selected:
    | { type: "node"; id: string }
    | { type: "edge"; id: string }
    | null;
  sampleContextJson: string;
  previewCurrentNodeId: string;
};
```

When graph view coordinates are needed, store them under metadata:

```json
{
  "metadata": {
    "builder": {
      "position": { "x": 120, "y": 80 }
    }
  }
}
```

Namespacing keeps host apps free to use their own metadata.

## UI Components

Recommended component breakdown:

```text
App
  BuilderToolbar
  WorkflowCanvas
    WorkflowNodeView
    WorkflowEdgeView
  InspectorPanel
    WorkflowInspector
    NodeInspector
    EdgeInspector
      ConditionGroupEditor
      ConditionRowEditor
  PreviewPanel
  ValidationPanel
  JsonImportDialog
  JsonExportDialog
```

## Validation UX

Show validation as:

- green/check state when valid
- warning count for graph quality issues like unreachable nodes
- error count for invalid schema issues
- click issue to select related node or edge when possible

Validation issue paths should come from core:

```ts
{
  code: "edge.to_missing",
  path: ["edges", "start", 0, "to"],
  message: "Edge points to missing node 'review'.",
  severity: "error"
}
```

## Accessibility Requirements

V1 graph editing can be mouse-first, but forms and dialogs should be accessible:

- labels for inputs
- keyboard focus states
- buttons with clear text or accessible labels
- no color-only error communication
- validation messages tied to fields where possible

## Visual Direction

The builder is an operational tool. Keep it quiet, dense, and predictable:

- restrained color palette
- compact toolbar
- clear inspector panel
- no oversized hero
- no decorative cards inside cards
- stable dimensions for graph controls and inspector inputs

## Demo Workflow

Include a demo workflow for local testing:

```ts
export const demoWorkflow = {
  schemaVersion: "1.0",
  id: "loan-demo",
  name: "Loan Demo",
  startNodeId: "start",
  nodes: {
    start: { id: "start", label: "Start", type: "start" },
    offer: { id: "offer", label: "Offer", type: "screen" },
    review: { id: "review", label: "Manual Review", type: "screen" },
  },
  edges: {
    start: [
      {
        id: "low-lvr",
        from: "start",
        to: "offer",
        priority: 10,
        when: {
          all: [{ field: "loanValueRatio", operator: "lt", value: 70 }],
        },
      },
      {
        id: "fallback",
        from: "start",
        to: "review",
        priority: 100,
        when: { always: true },
      },
    ],
  },
};
```

## V1 Acceptance Criteria

- user can create a three-node workflow
- user can connect nodes with conditional edges
- user can preview evaluation with sample context
- user can export valid JSON
- exported JSON validates with core
- invalid imports show errors and preserve the current draft
- UI has no dependency on duplicated schema definitions
