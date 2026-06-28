import {
  advanceWorkflow,
  createWorkflowState,
  evaluateNext,
  inspectWorkflowState,
  parseWorkflowJson,
  validateWorkflow,
} from "@workflow-builder/core";

const workflowJson = `{
  "schemaVersion": "1.0",
  "id": "loan-demo",
  "name": "Loan Demo",
  "startNodeId": "start",
  "nodes": {
    "start": { "id": "start", "label": "Start", "type": "start" },
    "offer": { "id": "offer", "label": "Offer", "type": "screen" },
    "review": { "id": "review", "label": "Manual Review", "type": "screen" }
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
}`;

const parsed = parseWorkflowJson(workflowJson);
if (!parsed.ok) {
  console.error(parsed.issues);
  throw new Error("Workflow JSON is invalid.");
}

const validation = validateWorkflow(parsed.workflow);
if (!validation.valid) {
  console.error(validation.issues);
  throw new Error("Workflow failed validation.");
}

const result = evaluateNext(parsed.workflow, {
  currentNodeId: parsed.workflow.startNodeId,
  context: { loanValueRatio: 74 },
});

switch (result.status) {
  case "matched":
    console.log(`Go to ${result.nextNode.id}`);
    break;
  case "no_match":
    console.log("No matching transition. Use an application fallback.");
    break;
  case "invalid_current_node":
    console.log(`Unknown current node: ${result.currentNodeId}`);
    break;
}

const state = createWorkflowState(parsed.workflow);
const snapshot = inspectWorkflowState(parsed.workflow, {
  state,
  context: { loanValueRatio: 74 },
});

console.log("Current node:", snapshot.currentNode?.id);
console.log("Previous node:", snapshot.previousNode?.id);
console.log(
  "Possible next nodes:",
  snapshot.possibleNext.map((candidate) => candidate.node.id)
);

const advanced = advanceWorkflow(parsed.workflow, {
  state,
  context: { loanValueRatio: 74 },
});

if (advanced.status === "advanced") {
  console.log("Advanced to:", advanced.state.currentNodeId);
}
