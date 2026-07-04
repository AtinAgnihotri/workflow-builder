import assert from "node:assert/strict";
import test from "node:test";
import { validateWorkflow } from "../dist/index.js";

test("@journeys/core exports implemented public APIs", () => {
  const result = validateWorkflow({
    schemaVersion: "1.0",
    id: "demo",
    name: "Demo",
    startNodeId: "start",
    nodes: {
      start: { id: "start", label: "Start" },
    },
    edges: {},
  });
  assert.equal(result.valid, true);
});
