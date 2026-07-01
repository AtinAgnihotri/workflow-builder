import type { WorkflowEdge } from "./types.js";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function sortEdges(edges: WorkflowEdge[]): WorkflowEdge[] {
  const edgesWithIndex = edges.map((edge, index) => ({ edge, index }));

  edgesWithIndex.sort((left, right) => {
    const priorityDiff = (left.edge.priority ?? 0) - (right.edge.priority ?? 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return left.index - right.index;
  });

  return edgesWithIndex.map((item) => item.edge);
}

export function cloneJsonObject(
  value: Record<string, unknown>
): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

export const DANGEROUS_JSON_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function hasDangerousKey(key: string): boolean {
  return DANGEROUS_JSON_KEYS.has(key);
}
