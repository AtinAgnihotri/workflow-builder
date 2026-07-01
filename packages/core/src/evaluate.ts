import { deepJsonEqual } from "./equality.js";
import type {
  Condition,
  ConditionGroup,
  ConditionGroupResult,
  ConditionIssue,
  ConditionNode,
  ConditionResult,
  EvaluateNextInput,
  EvaluateNextResult,
  JsonArray,
  JsonValue,
  Operator,
  WorkflowContext,
  WorkflowDefinition,
} from "./types.js";
import { getContextField, isCondition, isConditionGroup } from "./validation.js";
import { sortEdges } from "./utils.js";

function conditionResult(
  condition: Condition,
  actual: unknown,
  matched: boolean,
  issue?: ConditionIssue
): ConditionResult {
  return {
    matched,
    condition,
    actual,
    issue,
  };
}

function typeMismatchIssue(operator: Operator): ConditionIssue {
  return {
    code: "condition.type_mismatch",
    message: `Operator ${operator} received incompatible actual and expected value types.`,
  };
}

function compareOrdered(condition: Condition, actual: unknown): ConditionResult {
  const expected = condition.value;

  if (typeof actual === "number" && typeof expected === "number") {
    const matched = compareNumbers(actual, expected, condition.operator);
    return conditionResult(condition, actual, matched);
  }

  if (typeof actual === "string" && typeof expected === "string") {
    const matched = compareStrings(actual, expected, condition.operator);
    return conditionResult(condition, actual, matched);
  }

  return conditionResult(
    condition,
    actual,
    false,
    {
      code: "condition.type_mismatch",
      message: `Operator ${condition.operator} requires actual and expected values to both be numbers or both be strings.`,
    }
  );
}

function compareNumbers(
  actual: number,
  expected: number,
  operator: Operator
): boolean {
  switch (operator) {
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
    default:
      return false;
  }
}

function compareStrings(
  actual: string,
  expected: string,
  operator: Operator
): boolean {
  switch (operator) {
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
    default:
      return false;
  }
}

function compareContains(condition: Condition, actual: unknown): ConditionResult {
  const expected = condition.value;

  if (typeof actual === "string") {
    if (typeof expected !== "string") {
      return conditionResult(
        condition,
        actual,
        false,
        typeMismatchIssue(condition.operator)
      );
    }

    const matched =
      condition.operator === "contains"
        ? actual.includes(expected)
        : !actual.includes(expected);
    return conditionResult(condition, actual, matched);
  }

  if (Array.isArray(actual)) {
    if (expected === undefined) {
      return conditionResult(condition, actual, false, typeMismatchIssue(condition.operator));
    }

    const contains = actual.some((item) => deepJsonEqual(item, expected));
    const matched =
      condition.operator === "contains" ? contains : !contains;
    return conditionResult(condition, actual, matched);
  }

  return conditionResult(
    condition,
    actual,
    false,
    typeMismatchIssue(condition.operator)
  );
}

function compareStringPrefixSuffix(
  condition: Condition,
  actual: unknown
): ConditionResult {
  const expected = condition.value;

  if (typeof actual !== "string" || typeof expected !== "string") {
    return conditionResult(
      condition,
      actual,
      false,
      typeMismatchIssue(condition.operator)
    );
  }

  const matched =
    condition.operator === "starts_with"
      ? actual.startsWith(expected)
      : actual.endsWith(expected);

  return conditionResult(condition, actual, matched);
}

function compareMembership(condition: Condition, actual: unknown): ConditionResult {
  const expected = condition.value;

  if (!Array.isArray(expected)) {
    return conditionResult(
      condition,
      actual,
      false,
      {
        code: "condition.type_mismatch",
        message: `Operator ${condition.operator} requires an array value.`,
      }
    );
  }

  const values = expected as JsonArray;
  const isMember = values.some((item) => deepJsonEqual(actual, item));
  const matched =
    condition.operator === "in" ? isMember : !isMember;

  return conditionResult(condition, actual, matched);
}

export function evaluateCondition(
  condition: Condition,
  context: WorkflowContext
): ConditionResult {
  const { hasField, actual } = getContextField(context, condition.field);

  switch (condition.operator) {
    case "exists":
      return conditionResult(condition, actual, hasField && actual !== undefined);

    case "not_exists":
      return conditionResult(
        condition,
        actual,
        !hasField || actual === undefined
      );

    case "is_null":
      return conditionResult(condition, actual, hasField && actual === null);

    case "is_not_null":
      return conditionResult(
        condition,
        actual,
        hasField && actual !== null && actual !== undefined
      );

    case "eq":
      return conditionResult(
        condition,
        actual,
        deepJsonEqual(actual, condition.value as JsonValue | undefined)
      );

    case "neq":
      return conditionResult(
        condition,
        actual,
        !deepJsonEqual(actual, condition.value as JsonValue | undefined)
      );

    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return compareOrdered(condition, actual);

    case "contains":
    case "not_contains":
      return compareContains(condition, actual);

    case "starts_with":
    case "ends_with":
      return compareStringPrefixSuffix(condition, actual);

    case "in":
    case "not_in":
      return compareMembership(condition, actual);

    default:
      return conditionResult(condition, actual, false, {
        code: "condition.operator_invalid",
        message: `Unsupported operator: ${String(condition.operator)}`,
      });
  }
}

function evaluateConditionNode(
  node: ConditionNode,
  context: WorkflowContext
): ConditionResult | ConditionGroupResult {
  if (isCondition(node)) {
    return evaluateCondition(node, context);
  }

  return evaluateConditionGroup(node, context);
}

export function evaluateConditionGroup(
  group: ConditionGroup,
  context: WorkflowContext
): ConditionGroupResult {
  if ("always" in group) {
    return {
      matched: group.always === true,
      details: [],
    };
  }

  if ("all" in group) {
    const details = group.all.map((item) => evaluateConditionNode(item, context));
    return {
      matched: details.every((item) => item.matched),
      details,
    };
  }

  if ("any" in group) {
    const details = group.any.map((item) => evaluateConditionNode(item, context));
    return {
      matched: details.some((item) => item.matched),
      details,
    };
  }

  if ("not" in group) {
    const detail = evaluateConditionNode(group.not, context);
    return {
      matched: !detail.matched,
      details: [detail],
    };
  }

  return {
    matched: false,
    details: [],
    issue: {
      code: "condition.invalid_group",
      message: "Condition group must contain always, all, any, or not.",
    },
  };
}

export function evaluateNext(
  workflow: WorkflowDefinition,
  input: EvaluateNextInput
): EvaluateNextResult {
  const currentNode = workflow.nodes[input.currentNodeId];

  if (!currentNode) {
    return {
      status: "invalid_current_node",
      currentNodeId: input.currentNodeId,
    };
  }

  const outgoingEdges = sortEdges(workflow.edges[input.currentNodeId] ?? []);
  const evaluatedEdges: Array<{
    edge: (typeof outgoingEdges)[number];
    conditionResult: ConditionGroupResult;
  }> = [];

  for (const edge of outgoingEdges) {
    const conditionResult = evaluateConditionGroup(edge.when, input.context);
    evaluatedEdges.push({ edge, conditionResult });

    if (conditionResult.matched) {
      const nextNode = workflow.nodes[edge.to];
      if (!nextNode) {
        continue;
      }

      return {
        status: "matched",
        currentNode,
        nextNode,
        edge,
        conditionResult,
      };
    }
  }

  return {
    status: "no_match",
    currentNode,
    evaluatedEdges,
  };
}
