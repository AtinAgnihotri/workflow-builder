import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assertValidWorkflow,
  parseWorkflowJson,
  serializeWorkflow,
  validateWorkflow,
} from "../dist/index.js";
import { basicWorkflow, linearWorkflow } from "./fixtures.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleWorkflowPath = join(
  __dirname,
  "../../../skills/journeys/examples/basic-workflow.json"
);

test("validateWorkflow accepts docs example workflow", () => {
  const json = readFileSync(exampleWorkflowPath, "utf8");
  const parsed = parseWorkflowJson(json);
  assert.equal(parsed.ok, true);
});

test("validateWorkflow rejects non-object input", () => {
  const result = validateWorkflow(null);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === "workflow.not_object"));
});

test("validateWorkflow rejects unsupported schema version", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    schemaVersion: "2.0",
  });
  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.code === "workflow.unsupported_schema_version")
  );
});

test("validateWorkflow rejects node key mismatch", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    nodes: {
      wrong: { id: "start", label: "Start" },
    },
  });
  assert.ok(result.issues.some((issue) => issue.code === "node.key_mismatch"));
});

test("validateWorkflow rejects edge stored under wrong source", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    edges: {
      start: [
        {
          id: "bad-edge",
          from: "other",
          to: "offer",
          when: { always: true },
        },
      ],
    },
  });
  assert.ok(result.issues.some((issue) => issue.code === "edge.key_mismatch"));
});

test("validateWorkflow rejects expression DSL groups", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    edges: {
      start: [
        {
          id: "bad-edge",
          from: "start",
          to: "offer",
          when: { expression: "age >= 29" },
        },
      ],
    },
  });
  assert.ok(result.issues.some((issue) => issue.code === "condition.invalid_group"));
});

test("validateWorkflow rejects duplicate edge ids", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    edges: {
      start: [
        {
          id: "dup",
          from: "start",
          to: "offer",
          when: { always: true },
        },
        {
          id: "dup",
          from: "start",
          to: "review",
          when: { always: true },
        },
      ],
    },
  });
  assert.ok(result.issues.some((issue) => issue.code === "edge.duplicate_id"));
});

test("validateWorkflow rejects invalid priority", () => {
  const result = validateWorkflow({
    ...basicWorkflow,
    edges: {
      start: [
        {
          id: "bad-priority",
          from: "start",
          to: "offer",
          priority: Number.NaN,
          when: { always: true },
        },
      ],
    },
  });
  assert.ok(result.issues.some((issue) => issue.code === "edge.priority_invalid"));
});

test("validateWorkflow warns about unreachable nodes", () => {
  const result = validateWorkflow(linearWorkflow);
  assert.equal(result.valid, true);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "graph.unreachable_node" && issue.severity === "warning"
    )
  );
});

test("parseWorkflowJson rejects invalid JSON", () => {
  const result = parseWorkflowJson("{");
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "workflow.invalid_json"));
});

test("serializeWorkflow round-trips valid workflow", () => {
  assertValidWorkflow(basicWorkflow);
  const json = serializeWorkflow(basicWorkflow);
  const parsed = parseWorkflowJson(json);
  assert.equal(parsed.ok, true);
});

test("assertValidWorkflow throws for invalid workflow", () => {
  assert.throws(() => assertValidWorkflow({}), /Invalid workflow/);
});
