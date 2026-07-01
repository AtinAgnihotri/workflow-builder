import { serializeWorkflow, type WorkflowDefinition } from "@workflow-builder/core";

export function copyWorkflowJson(workflow: WorkflowDefinition): string {
  return JSON.stringify(JSON.parse(serializeWorkflow(workflow)), null, 2);
}
