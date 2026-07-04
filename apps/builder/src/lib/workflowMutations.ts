import type {
  ConditionGroup,
  JsonObject,
  JsonValue,
  Operator,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from "@journeys/core";
import { NO_VALUE_OPERATORS } from "./operators";

export function slugify(label: string): string {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "node";
}

export function uniqueNodeId(workflow: WorkflowDefinition, label: string): string {
  const base = slugify(label);
  if (!workflow.nodes[base]) {
    return base;
  }

  let suffix = 2;
  while (workflow.nodes[`${base}-${suffix}`]) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

export function uniqueEdgeId(
  workflow: WorkflowDefinition,
  from: string,
  to: string
): string {
  const base = `edge-${from}-${to}`;
  const existing = new Set(collectEdgeIds(workflow));
  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

export function collectEdgeIds(workflow: WorkflowDefinition): string[] {
  const ids: string[] = [];
  for (const edgeList of Object.values(workflow.edges)) {
    for (const edge of edgeList) {
      ids.push(edge.id);
    }
  }
  return ids;
}

export function getNodePosition(
  node: WorkflowNode,
  index: number
): { x: number; y: number } {
  const builderMeta = node.metadata?.builder;
  if (
    builderMeta &&
    typeof builderMeta === "object" &&
    "position" in builderMeta &&
    builderMeta.position &&
    typeof builderMeta.position === "object" &&
    "x" in builderMeta.position &&
    "y" in builderMeta.position &&
    typeof builderMeta.position.x === "number" &&
    typeof builderMeta.position.y === "number"
  ) {
    return { x: builderMeta.position.x, y: builderMeta.position.y };
  }

  return { x: 120 + index * 180, y: 120 + (index % 2) * 120 };
}

export function setNodePosition(
  workflow: WorkflowDefinition,
  nodeId: string,
  position: { x: number; y: number }
): WorkflowDefinition {
  const node = workflow.nodes[nodeId];
  if (!node) {
    return workflow;
  }

  const metadata: JsonObject = {
    ...(node.metadata ?? {}),
    builder: {
      ...(typeof node.metadata?.builder === "object" ? node.metadata.builder : {}),
      position,
    },
  };

  return updateNode(workflow, nodeId, { metadata });
}

export function addNode(
  workflow: WorkflowDefinition,
  label: string,
  type = "screen"
): { workflow: WorkflowDefinition; nodeId: string } {
  const id = uniqueNodeId(workflow, label);
  const index = Object.keys(workflow.nodes).length;
  const position = { x: 120 + index * 160, y: 120 + (index % 2) * 100 };
  const node: WorkflowNode = {
    id,
    label,
    type,
    metadata: {
      builder: { position },
    },
  };

  return {
    workflow: {
      ...workflow,
      nodes: {
        ...workflow.nodes,
        [id]: node,
      },
    },
    nodeId: id,
  };
}

export function updateNode(
  workflow: WorkflowDefinition,
  nodeId: string,
  patch: Partial<WorkflowNode>
): WorkflowDefinition {
  const existing = workflow.nodes[nodeId];
  if (!existing) {
    return workflow;
  }

  return {
    ...workflow,
    nodes: {
      ...workflow.nodes,
      [nodeId]: {
        ...existing,
        ...patch,
        id: existing.id,
      },
    },
  };
}

export function deleteNode(
  workflow: WorkflowDefinition,
  nodeId: string
): WorkflowDefinition {
  if (nodeId === workflow.startNodeId) {
    return workflow;
  }

  if (Object.keys(workflow.nodes).length <= 1) {
    return workflow;
  }

  const { [nodeId]: _removed, ...remainingNodes } = workflow.nodes;
  const nextEdges: WorkflowDefinition["edges"] = {};

  for (const [sourceId, edgeList] of Object.entries(workflow.edges)) {
    if (sourceId === nodeId) {
      continue;
    }

    const filtered = edgeList.filter(
      (edge) => edge.from !== nodeId && edge.to !== nodeId
    );

    if (filtered.length > 0) {
      nextEdges[sourceId] = filtered;
    }
  }

  return {
    ...workflow,
    nodes: remainingNodes,
    edges: nextEdges,
  };
}

export function addEdge(
  workflow: WorkflowDefinition,
  from: string,
  to: string,
  when: ConditionGroup = { always: true }
): { workflow: WorkflowDefinition; edgeId: string } | null {
  if (!workflow.nodes[from] || !workflow.nodes[to]) {
    return null;
  }

  const id = uniqueEdgeId(workflow, from, to);
  const edge: WorkflowEdge = {
    id,
    from,
    to,
    priority: 0,
    when,
  };

  const existing = workflow.edges[from] ?? [];

  return {
    workflow: {
      ...workflow,
      edges: {
        ...workflow.edges,
        [from]: [...existing, edge],
      },
    },
    edgeId: id,
  };
}

export function findEdge(
  workflow: WorkflowDefinition,
  edgeId: string
): { from: string; edge: WorkflowEdge; index: number } | null {
  for (const [from, edgeList] of Object.entries(workflow.edges)) {
    const index = edgeList.findIndex((edge) => edge.id === edgeId);
    if (index >= 0) {
      const edge = edgeList[index];
      if (edge) {
        return { from, edge, index };
      }
    }
  }

  return null;
}

export function updateEdge(
  workflow: WorkflowDefinition,
  edgeId: string,
  patch: Partial<WorkflowEdge>
): WorkflowDefinition {
  const located = findEdge(workflow, edgeId);
  if (!located) {
    return workflow;
  }

  const edgeList = workflow.edges[located.from] ?? [];
  const updatedEdge = { ...located.edge, ...patch, id: located.edge.id };

  return {
    ...workflow,
    edges: {
      ...workflow.edges,
      [located.from]: edgeList.map((edge) =>
        edge.id === edgeId ? updatedEdge : edge
      ),
    },
  };
}

export function deleteEdge(
  workflow: WorkflowDefinition,
  edgeId: string
): WorkflowDefinition {
  const located = findEdge(workflow, edgeId);
  if (!located) {
    return workflow;
  }

  const edgeList = workflow.edges[located.from] ?? [];
  const nextList = edgeList.filter((edge) => edge.id !== edgeId);
  const nextEdges = { ...workflow.edges };

  if (nextList.length === 0) {
    delete nextEdges[located.from];
  } else {
    nextEdges[located.from] = nextList;
  }

  return {
    ...workflow,
    edges: nextEdges,
  };
}

export function renameWorkflow(
  workflow: WorkflowDefinition,
  name: string
): WorkflowDefinition {
  return { ...workflow, name };
}

export function operatorRequiresValue(operator: Operator): boolean {
  return !NO_VALUE_OPERATORS.has(operator);
}

export type ValueInputKind = "string" | "number" | "boolean" | "null" | "json";

export function inferValueKind(value: JsonValue | undefined): ValueInputKind {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return "string";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  return "json";
}

export function parseConditionValue(
  kind: ValueInputKind,
  raw: string
): { ok: true; value: JsonValue } | { ok: false; message: string } {
  switch (kind) {
    case "string":
      return { ok: true, value: raw };
    case "number": {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        return { ok: false, message: "Enter a finite number." };
      }
      return { ok: true, value: parsed };
    }
    case "boolean":
      if (raw === "true") {
        return { ok: true, value: true };
      }
      if (raw === "false") {
        return { ok: true, value: false };
      }
      return { ok: false, message: "Select true or false." };
    case "null":
      return { ok: true, value: null };
    case "json":
      try {
        return { ok: true, value: JSON.parse(raw) as JsonValue };
      } catch {
        return { ok: false, message: "Invalid JSON value." };
      }
    default:
      return { ok: false, message: "Unsupported value type." };
  }
}

export function formatConditionValue(value: JsonValue | undefined): string {
  if (value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null) {
    return "null";
  }
  return JSON.stringify(value, null, 2);
}
