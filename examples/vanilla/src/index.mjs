import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateNext,
  validateWorkflow,
} from "@workflow-builder/core";
import { describeNode } from "./interpretNode.mjs";
import { mapLoanAppToWorkflowContext } from "./mapContext.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workflow = JSON.parse(
  readFileSync(join(__dirname, "../workflow.json"), "utf8")
);

const appState = {
  loanApplications: [{ lvr: 65 }],
  applicant: { address: { country: "GB" } },
};

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  console.error("Invalid workflow:", validation.issues);
  process.exit(1);
}

const context = mapLoanAppToWorkflowContext(appState);
const result = evaluateNext(workflow, {
  currentNodeId: workflow.startNodeId,
  context,
});

if (result.status === "matched") {
  console.log("Matched edge:", result.edge.id);
  console.log("Next node:", result.nextNode.id, "-", result.nextNode.label);
  console.log("Host action:", describeNode(result.nextNode));
} else {
  console.log("Evaluation status:", result.status);
  process.exit(1);
}
