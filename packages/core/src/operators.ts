import type { Operator } from "./types.js";

export const VALUE_OPERATORS = new Set<Operator>([
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
]);

export const NO_VALUE_OPERATORS = new Set<Operator>([
  "exists",
  "not_exists",
  "is_null",
  "is_not_null",
]);

export const ALL_OPERATORS = new Set<Operator>([
  ...VALUE_OPERATORS,
  ...NO_VALUE_OPERATORS,
]);

export const MAX_CONDITION_NESTING_DEPTH = 32;
