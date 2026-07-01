import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateNext, validateWorkflow } from "@workflow-builder/core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workflow = JSON.parse(
  readFileSync(join(__dirname, "../workflow.json"), "utf8")
);

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  throw new Error("Example workflow is invalid");
}

/** Edge-style fetch handler: evaluate workflow and return JSON. */
export async function handleEvaluateRequest(request) {
  const input = await request.json();

  const result = evaluateNext(workflow, {
    currentNodeId: input.currentNodeId,
    context: input.context ?? {},
  });

  return Response.json(result);
}
