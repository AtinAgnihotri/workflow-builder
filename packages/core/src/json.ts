import type { JsonObject, ParseWorkflowResult, WorkflowDefinition } from "./types.js";
import { assertValidWorkflow, validateWorkflow } from "./validation.js";
import { hasDangerousKey, isPlainObject } from "./utils.js";

function jsonReviver(_key: string, value: unknown): unknown {
  return value;
}

function collectDangerousKeys(value: unknown, path: string[] = []): string[] {
  if (!isPlainObject(value)) {
    return [];
  }

  const found: string[] = [];

  for (const key of Object.keys(value)) {
    const nextPath = [...path, key];
    if (hasDangerousKey(key)) {
      found.push(nextPath.join("."));
    }
    found.push(...collectDangerousKeys(value[key], nextPath));
  }

  return found;
}

export function parseWorkflowJson(json: string): ParseWorkflowResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json, jsonReviver);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON input.";
    return {
      ok: false,
      issues: [
        {
          code: "workflow.invalid_json",
          path: [],
          message,
          severity: "error",
        },
      ],
    };
  }

  const dangerousKeys = collectDangerousKeys(parsed);
  if (dangerousKeys.length > 0) {
    return {
      ok: false,
      issues: dangerousKeys.map((path) => ({
        code: "workflow.unsafe_key",
        path: path.split("."),
        message: `Unsafe object key at ${path}.`,
        severity: "error" as const,
      })),
    };
  }

  const validation = validateWorkflow(parsed);
  if (!validation.valid) {
    return {
      ok: false,
      issues: validation.issues.filter((issue) => issue.severity === "error"),
    };
  }

  return {
    ok: true,
    workflow: parsed as WorkflowDefinition,
  };
}

export function serializeWorkflow(workflow: WorkflowDefinition): string {
  assertValidWorkflow(workflow);
  return JSON.stringify(workflow);
}

export function toJsonObject(value: Record<string, unknown>): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}
