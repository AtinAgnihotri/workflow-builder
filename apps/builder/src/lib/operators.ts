import type { Operator } from "@workflow-builder/core";

export const NO_VALUE_OPERATORS = new Set<Operator>([
  "exists",
  "not_exists",
  "is_null",
  "is_not_null",
]);

export const ALL_OPERATORS: Operator[] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "in",
  "not_in",
  "exists",
  "not_exists",
  "is_null",
  "is_not_null",
];

export const NODE_TYPES = [
  "start",
  "screen",
  "decision",
  "terminal",
  "action",
  "content",
] as const;
