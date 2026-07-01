import type {
  Condition,
  ConditionGroup,
  ConditionNode,
  ValidationIssue,
  ValidationResult,
  WorkflowDefinition,
} from "./types.js";
import {
  ALL_OPERATORS,
  MAX_CONDITION_NESTING_DEPTH,
  NO_VALUE_OPERATORS,
  VALUE_OPERATORS,
} from "./operators.js";
import { hasDangerousKey, isNonEmptyString, isPlainObject } from "./utils.js";

function issue(
  code: string,
  path: Array<string | number>,
  message: string,
  severity: ValidationIssue["severity"] = "error"
): ValidationIssue {
  return { code, path, message, severity };
}

function getContextField(
  context: Record<string, unknown>,
  field: string
): { hasField: boolean; actual: unknown } {
  const hasField = Object.prototype.hasOwnProperty.call(context, field);
  return {
    hasField,
    actual: hasField ? context[field] : undefined,
  };
}

function isCondition(value: unknown): value is Condition {
  return isPlainObject(value) && "field" in value && "operator" in value;
}

function isConditionGroup(value: unknown): value is ConditionGroup {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    "always" in value ||
    "all" in value ||
    "any" in value ||
    "not" in value
  );
}

function validateConditionNode(
  node: unknown,
  path: Array<string | number>,
  issues: ValidationIssue[],
  depth: number
): void {
  if (depth > MAX_CONDITION_NESTING_DEPTH) {
    issues.push(
      issue(
        "condition.nesting_too_deep",
        path,
        `Condition nesting exceeds ${MAX_CONDITION_NESTING_DEPTH} levels.`
      )
    );
    return;
  }

  if (isCondition(node)) {
    validateCondition(node, path, issues);
    return;
  }

  if (isConditionGroup(node)) {
    validateConditionGroup(node, path, issues, depth);
    return;
  }

  issues.push(
    issue(
      "condition.invalid_group",
      path,
      "Condition node must be a comparison condition or a valid condition group."
    )
  );
}

function validateConditionGroup(
  group: ConditionGroup,
  path: Array<string | number>,
  issues: ValidationIssue[],
  depth: number
): void {
  const keys = Object.keys(group);

  if ("always" in group) {
    if (keys.length !== 1 || group.always !== true) {
      issues.push(
        issue(
          "condition.invalid_group",
          path,
          'An always group must be exactly { "always": true }.'
        )
      );
    }
    return;
  }

  if ("all" in group) {
    if (!Array.isArray(group.all)) {
      issues.push(
        issue(
          "condition.invalid_group",
          [...path, "all"],
          "An all group must contain an array of condition nodes."
        )
      );
      return;
    }

    group.all.forEach((child, index) => {
      validateConditionNode(child, [...path, "all", index], issues, depth + 1);
    });
    return;
  }

  if ("any" in group) {
    if (!Array.isArray(group.any)) {
      issues.push(
        issue(
          "condition.invalid_group",
          [...path, "any"],
          "An any group must contain an array of condition nodes."
        )
      );
      return;
    }

    group.any.forEach((child, index) => {
      validateConditionNode(child, [...path, "any", index], issues, depth + 1);
    });
    return;
  }

  if ("not" in group) {
    validateConditionNode(group.not, [...path, "not"], issues, depth + 1);
    return;
  }

  issues.push(
    issue(
      "condition.invalid_group",
      path,
      "Condition group must contain always, all, any, or not."
    )
  );
}

function validateCondition(
  condition: Condition,
  path: Array<string | number>,
  issues: ValidationIssue[]
): void {
  if (!isNonEmptyString(condition.field)) {
    issues.push(
      issue(
        "condition.field_required",
        [...path, "field"],
        "Condition field must be a non-empty string."
      )
    );
  }

  if (!ALL_OPERATORS.has(condition.operator)) {
    issues.push(
      issue(
        "condition.operator_invalid",
        [...path, "operator"],
        `Unsupported operator: ${String(condition.operator)}`
      )
    );
    return;
  }

  const hasValue = Object.prototype.hasOwnProperty.call(condition, "value");

  if (VALUE_OPERATORS.has(condition.operator)) {
    if (!hasValue) {
      issues.push(
        issue(
          "condition.value_required",
          [...path, "value"],
          `Operator ${condition.operator} requires a value.`
        )
      );
    }

    if (
      (condition.operator === "in" || condition.operator === "not_in") &&
      hasValue &&
      !Array.isArray(condition.value)
    ) {
      issues.push(
        issue(
          "condition.value_required",
          [...path, "value"],
          `Operator ${condition.operator} requires an array value.`
        )
      );
    }
  }

  if (NO_VALUE_OPERATORS.has(condition.operator) && hasValue) {
    issues.push(
      issue(
        "condition.value_unexpected",
        [...path, "value"],
        `Operator ${condition.operator} must not include a value.`
      )
    );
  }
}

function validateNodes(
  nodes: unknown,
  issues: ValidationIssue[]
): Record<string, unknown> | undefined {
  if (!isPlainObject(nodes)) {
    issues.push(
      issue("workflow.nodes_invalid", ["nodes"], "Nodes must be an object.")
    );
    return undefined;
  }

  const seenIds = new Set<string>();

  for (const [key, rawNode] of Object.entries(nodes)) {
    if (hasDangerousKey(key)) {
      issues.push(
        issue(
          "workflow.unsafe_key",
          ["nodes", key],
          `Unsafe object key: ${key}.`
        )
      );
      continue;
    }

    const nodePath: Array<string | number> = ["nodes", key];

    if (!isPlainObject(rawNode)) {
      issues.push(
        issue("node.invalid", nodePath, "Each node must be an object.")
      );
      continue;
    }

    if (!isNonEmptyString(rawNode.id)) {
      issues.push(
        issue(
          "node.id_required",
          [...nodePath, "id"],
          "Node id must be a non-empty string."
        )
      );
    } else if (rawNode.id !== key) {
      issues.push(
        issue(
          "node.key_mismatch",
          nodePath,
          `Node key "${key}" must equal node id "${String(rawNode.id)}".`
        )
      );
    } else if (seenIds.has(rawNode.id)) {
      issues.push(
        issue(
          "node.duplicate_id",
          [...nodePath, "id"],
          `Duplicate node id "${rawNode.id}".`
        )
      );
    } else {
      seenIds.add(rawNode.id);
    }

    if (!isNonEmptyString(rawNode.label)) {
      issues.push(
        issue(
          "node.label_required",
          [...nodePath, "label"],
          "Node label must be a non-empty string."
        )
      );
    }
  }

  return nodes;
}

function validateEdges(
  edges: unknown,
  nodes: Record<string, unknown> | undefined,
  issues: ValidationIssue[]
): void {
  if (edges === undefined) {
    return;
  }

  if (!isPlainObject(edges)) {
    issues.push(
      issue("workflow.edges_invalid", ["edges"], "Edges must be an object.")
    );
    return;
  }

  const seenEdgeIds = new Set<string>();

  for (const [sourceKey, rawEdgeList] of Object.entries(edges)) {
    if (hasDangerousKey(sourceKey)) {
      issues.push(
        issue(
          "workflow.unsafe_key",
          ["edges", sourceKey],
          `Unsafe object key: ${sourceKey}.`
        )
      );
      continue;
    }

    if (!Array.isArray(rawEdgeList)) {
      issues.push(
        issue(
          "edge.list_invalid",
          ["edges", sourceKey],
          "Each edge list must be an array."
        )
      );
      continue;
    }

    rawEdgeList.forEach((rawEdge, index) => {
      const edgePath: Array<string | number> = ["edges", sourceKey, index];

      if (!isPlainObject(rawEdge)) {
        issues.push(
          issue("edge.invalid", edgePath, "Each edge must be an object.")
        );
        return;
      }

      if (!isNonEmptyString(rawEdge.id)) {
        issues.push(
          issue(
            "edge.id_required",
            [...edgePath, "id"],
            "Edge id must be a non-empty string."
          )
        );
      } else if (seenEdgeIds.has(rawEdge.id)) {
        issues.push(
          issue(
            "edge.duplicate_id",
            [...edgePath, "id"],
            `Duplicate edge id "${rawEdge.id}".`
          )
        );
      } else {
        seenEdgeIds.add(rawEdge.id);
      }

      if (!isNonEmptyString(rawEdge.from)) {
        issues.push(
          issue(
            "edge.from_required",
            [...edgePath, "from"],
            "Edge from must be a non-empty string."
          )
        );
      } else if (rawEdge.from !== sourceKey) {
        issues.push(
          issue(
            "edge.key_mismatch",
            edgePath,
            `Edge is stored under "${sourceKey}" but from is "${String(rawEdge.from)}".`
          )
        );
      } else if (nodes && !Object.prototype.hasOwnProperty.call(nodes, rawEdge.from)) {
        issues.push(
          issue(
            "edge.from_missing",
            [...edgePath, "from"],
            `Edge from node "${rawEdge.from}" does not exist.`
          )
        );
      }

      if (!isNonEmptyString(rawEdge.to)) {
        issues.push(
          issue(
            "edge.to_required",
            [...edgePath, "to"],
            "Edge to must be a non-empty string."
          )
        );
      } else if (nodes && !Object.prototype.hasOwnProperty.call(nodes, rawEdge.to)) {
        issues.push(
          issue(
            "edge.to_missing",
            [...edgePath, "to"],
            `Edge to node "${rawEdge.to}" does not exist.`
          )
        );
      }

      if (Object.prototype.hasOwnProperty.call(rawEdge, "priority")) {
        const priority = rawEdge.priority;
        if (typeof priority !== "number" || !Number.isFinite(priority)) {
          issues.push(
            issue(
              "edge.priority_invalid",
              [...edgePath, "priority"],
              "Edge priority must be a finite number."
            )
          );
        }
      }

      if (!Object.prototype.hasOwnProperty.call(rawEdge, "when")) {
        issues.push(
          issue(
            "edge.when_required",
            [...edgePath, "when"],
            "Edge when condition group is required."
          )
        );
      } else {
        validateConditionNode(rawEdge.when, [...edgePath, "when"], issues, 1);
      }
    });
  }
}

function validateGraphWarnings(
  workflow: Record<string, unknown>,
  issues: ValidationIssue[]
): void {
  if (!isPlainObject(workflow.nodes) || !isNonEmptyString(workflow.startNodeId)) {
    return;
  }

  const nodes = workflow.nodes;
  const edges = isPlainObject(workflow.edges) ? workflow.edges : {};
  const reachable = getReachableNodeIdsFromRecord(
    nodes,
    edges,
    workflow.startNodeId
  );

  for (const nodeId of Object.keys(nodes)) {
    if (!reachable.has(nodeId)) {
      issues.push(
        issue(
          "graph.unreachable_node",
          ["nodes", nodeId],
          `Node "${nodeId}" is not reachable from start node "${workflow.startNodeId}".`,
          "warning"
        )
      );
    }

    const outgoing = Array.isArray(edges[nodeId]) ? edges[nodeId] : [];
    const node = nodes[nodeId];
    const nodeType =
      isPlainObject(node) && typeof node.type === "string" ? node.type : undefined;

    if (outgoing.length === 0 && nodeType !== "terminal") {
      issues.push(
        issue(
          "graph.dead_end",
          ["nodes", nodeId],
          `Node "${nodeId}" has no outgoing edges and is not terminal.`,
          "warning"
        )
      );
    }
  }
}

function getReachableNodeIdsFromRecord(
  nodes: Record<string, unknown>,
  edges: Record<string, unknown>,
  startNodeId: string
): Set<string> {
  const reachable = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (nodeId === undefined || reachable.has(nodeId)) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(nodes, nodeId)) {
      continue;
    }

    reachable.add(nodeId);

    const outgoing = edges[nodeId];
    if (!Array.isArray(outgoing)) {
      continue;
    }

    for (const rawEdge of outgoing) {
      if (isPlainObject(rawEdge) && isNonEmptyString(rawEdge.to)) {
        queue.push(rawEdge.to);
      }
    }
  }

  return reachable;
}

function validateTopLevel(
  workflow: Record<string, unknown>,
  issues: ValidationIssue[]
): void {
  if (workflow.schemaVersion !== "1.0") {
    issues.push(
      issue(
        "workflow.unsupported_schema_version",
        ["schemaVersion"],
        'schemaVersion must be "1.0".'
      )
    );
  }

  if (!isNonEmptyString(workflow.id)) {
    issues.push(
      issue(
        "workflow.id_required",
        ["id"],
        "Workflow id must be a non-empty string."
      )
    );
  }

  if (!isNonEmptyString(workflow.name)) {
    issues.push(
      issue(
        "workflow.name_required",
        ["name"],
        "Workflow name must be a non-empty string."
      )
    );
  }

  if (!isNonEmptyString(workflow.startNodeId)) {
    issues.push(
      issue(
        "workflow.start_node_missing",
        ["startNodeId"],
        "startNodeId must be a non-empty string."
      )
    );
  }
}

export function validateWorkflow(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isPlainObject(input)) {
    issues.push(
      issue("workflow.not_object", [], "Workflow must be a plain object.")
    );
    return { valid: false, issues };
  }

  validateTopLevel(input, issues);
  const nodes = validateNodes(input.nodes, issues);
  validateEdges(input.edges, nodes, issues);

  if (
    nodes &&
    isNonEmptyString(input.startNodeId) &&
    !Object.prototype.hasOwnProperty.call(nodes, input.startNodeId)
  ) {
    issues.push(
      issue(
        "workflow.start_node_missing",
        ["startNodeId"],
        `Start node "${input.startNodeId}" does not exist in nodes.`
      )
    );
  }

  validateGraphWarnings(input, issues);

  return {
    valid: !issues.some((entry) => entry.severity === "error"),
    issues,
  };
}

export function assertValidWorkflow(
  workflow: unknown
): asserts workflow is WorkflowDefinition {
  const result = validateWorkflow(workflow);
  if (!result.valid) {
    const summary = result.issues
      .filter((entry) => entry.severity === "error")
      .map((entry) => `${entry.code} @ ${entry.path.join(".")}: ${entry.message}`)
      .join("; ");
    throw new Error(`Invalid workflow: ${summary}`);
  }
}

export { getContextField, isCondition, isConditionGroup };
