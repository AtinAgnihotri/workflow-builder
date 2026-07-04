# PRP 003: Builder UI MVP

## Goal

Build a local, browser-based visual builder that can create, validate, preview,
import, and export Journeys JSON.

## Context To Read First

- `docs/04-builder-ui-spec.md`
- `docs/02-workflow-json-schema.md`
- `docs/03-evaluation-engine.md`

## Dependencies

Recommended:

- Vite
- React
- TypeScript
- React Flow or XYFlow
- `@journeys/core`

Do not duplicate schema or evaluator logic in the app.

Before adding builder dependencies, check whether each one is necessary. The
builder may need UI packages, but the implementation should still minimize npm
exposure:

- do not add multiple libraries for the same job
- avoid large dependencies for small controls
- prefer browser APIs and local components where practical
- respect the 1-day package age gate in package-manager config
- document why each non-trivial dependency is needed

## Files And Folders

Suggested:

```text
apps/builder/package.json
apps/builder/src/App.tsx
apps/builder/src/demoWorkflow.ts
apps/builder/src/state/builderState.ts
apps/builder/src/components/BuilderToolbar.tsx
apps/builder/src/components/WorkflowCanvas.tsx
apps/builder/src/components/InspectorPanel.tsx
apps/builder/src/components/NodeInspector.tsx
apps/builder/src/components/EdgeInspector.tsx
apps/builder/src/components/ConditionGroupEditor.tsx
apps/builder/src/components/PreviewPanel.tsx
apps/builder/src/components/ValidationPanel.tsx
apps/builder/src/components/JsonImportDialog.tsx
apps/builder/src/components/JsonExportDialog.tsx
```

## Subagent Guidance

The lead agent should create the app shell, shared builder state, and core import
path first. Then parallelize:

- Canvas subagent: graph rendering, node/edge selection, connect behavior.
- Inspector subagent: node inspector, edge inspector, condition editor.
- Import/export subagent: JSON dialogs, copy/download behavior.
- Preview/validation subagent: sample context parsing, runtime state pointer,
  possible next nodes, evaluator preview, validation panel.
- UX pass subagent: styling, accessibility labels, layout polish.

All subagents must use `@journeys/core` for schema, validation, and
evaluation. The lead agent owns final state-shape decisions.

## Required Behavior

The user must be able to:

- add node
- edit node label, type, description, and JSON data
- delete non-start node
- add edge
- edit edge priority and conditions
- delete edge
- import JSON
- export JSON
- copy JSON
- enter sample context JSON
- see current workflow preview node
- see previous preview node after advancing
- see possible next nodes from the current preview node
- advance/reset preview state
- preview next-node evaluation
- see validation issues

## Condition Editor Scope

Support:

- `always`
- `all`
- `any`
- `not`
- comparison rows

Value input behavior:

- string: raw text
- number: parse finite number
- boolean: select true or false
- null: fixed null
- JSON: parse text as JSON

Operators with no value should disable or hide the value field.

## Import Flow

Pseudocode:

```ts
function importWorkflow(jsonText) {
  const parsed = parseWorkflowJson(jsonText);

  if (!parsed.ok) {
    setImportErrors(parsed.issues);
    return;
  }

  setWorkflow(parsed.workflow);
  closeImportDialog();
}
```

The current draft must remain unchanged when import fails.

## Preview Flow

Pseudocode:

```ts
function computePreview() {
  let context;
  try {
    context = JSON.parse(sampleContextJson);
  } catch {
    return { status: "invalid_context_json" };
  }

  return evaluateNext(workflow, {
    currentNodeId: previewCurrentNodeId,
    context,
  });
}
```

## Layout

Implement:

- top toolbar
- graph canvas
- right inspector
- bottom validation or preview panel

The app should open directly to the builder experience.

## Styling

Keep styling practical:

- stable toolbar height
- inspector width around 320-420px
- readable form controls
- visible selected node/edge state
- validation errors that do not rely only on color

## Tests

At minimum:

- component or integration test for import preserving draft on invalid JSON
- test for export producing core-valid JSON
- test for preview calling evaluator with sample context

If browser test setup is too expensive in V1, document the gap and add manual
QA steps in the builder README.

## Acceptance Criteria

- `pnpm --filter builder dev` runs the app.
- User can build a valid three-node workflow.
- Exported JSON validates with `validateWorkflow`.
- Preview correctly identifies matched next node.
- Invalid import reports errors and keeps existing draft.
- No schema logic is duplicated from core.
- changes are committed in logical chunks, such as app shell, canvas, inspector,
  preview/import/export, and styling/accessibility pass.
