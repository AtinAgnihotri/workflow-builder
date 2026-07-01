import {
  advanceWorkflow,
  createWorkflowState,
  evaluateNext,
  inspectWorkflowState,
  parseWorkflowJson,
  type AdvanceWorkflowResult,
  type EvaluateNextResult,
  type ValidationIssue,
  type ValidationResult,
  type WorkflowDefinition,
  type WorkflowRuntimeState,
  type WorkflowStateSnapshot,
  validateWorkflow,
} from "@workflow-builder/core";

export type PreviewComputation =
  | {
      status: "ok";
      validation: ValidationResult;
      context: Record<string, unknown>;
      evaluation: EvaluateNextResult;
      snapshot: WorkflowStateSnapshot;
    }
  | {
      status: "invalid_context_json";
      message: string;
      validation: ValidationResult;
    };

export function computeValidation(workflow: WorkflowDefinition): ValidationResult {
  return validateWorkflow(workflow);
}

export function tryImportWorkflow(jsonText: string) {
  return parseWorkflowJson(jsonText);
}

export function computePreview(
  workflow: WorkflowDefinition,
  previewState: WorkflowRuntimeState,
  sampleContextJson: string
): PreviewComputation {
  const validation = validateWorkflow(workflow);

  let context: Record<string, unknown>;
  try {
    const parsed = JSON.parse(sampleContextJson) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {
        status: "invalid_context_json",
        message: "Sample context must be a JSON object.",
        validation,
      };
    }
    context = parsed as Record<string, unknown>;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid sample context JSON.";
    return {
      status: "invalid_context_json",
      message,
      validation,
    };
  }

  const evaluation = evaluateNext(workflow, {
    currentNodeId: previewState.currentNodeId,
    context,
  });

  const snapshot = inspectWorkflowState(workflow, {
    state: previewState,
    context,
  });

  return {
    status: "ok",
    validation,
    context,
    evaluation,
    snapshot,
  };
}

export function advancePreviewState(
  workflow: WorkflowDefinition,
  previewState: WorkflowRuntimeState,
  sampleContextJson: string
): {
  ok: true;
  previewState: WorkflowRuntimeState;
  result: AdvanceWorkflowResult;
} | {
  ok: false;
  reason: "invalid_context_json" | "not_advanced";
  message?: string;
  result?: AdvanceWorkflowResult;
} {
  let context: Record<string, unknown>;
  try {
    const parsed = JSON.parse(sampleContextJson) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, reason: "invalid_context_json", message: "Sample context must be a JSON object." };
    }
    context = parsed as Record<string, unknown>;
  } catch (error) {
    return {
      ok: false,
      reason: "invalid_context_json",
      message: error instanceof Error ? error.message : "Invalid sample context JSON.",
    };
  }

  const result = advanceWorkflow(workflow, {
    state: previewState,
    context,
  });

  if (result.status !== "advanced") {
    return { ok: false, reason: "not_advanced", result };
  }

  return { ok: true, previewState: result.state, result };
}

export function resetPreviewState(workflow: WorkflowDefinition): WorkflowRuntimeState {
  return createWorkflowState(workflow);
}

export function issueTarget(
  issue: ValidationIssue
): { type: "node"; id: string } | { type: "edge"; id: string } | null {
  const path = issue.path;
  if (path[0] === "nodes" && typeof path[1] === "string") {
    return { type: "node", id: path[1] };
  }

  if (path[0] === "edges" && typeof path[1] === "string" && typeof path[2] === "number") {
    return null;
  }

  if (path.includes("id") && typeof path[path.length - 2] === "number") {
    const edgeIndex = path[path.length - 2];
    const sourceId = path[1];
    if (typeof sourceId === "string" && typeof edgeIndex === "number") {
      return { type: "edge", id: `${sourceId}:${edgeIndex}` };
    }
  }

  return null;
}
