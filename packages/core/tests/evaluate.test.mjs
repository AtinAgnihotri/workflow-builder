import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceWorkflow,
  createWorkflowState,
  deepJsonEqual,
  evaluateCondition,
  evaluateConditionGroup,
  evaluateNext,
  inspectWorkflowState,
} from "../dist/index.js";
import { basicWorkflow, priorityWorkflow } from "./fixtures.mjs";

const operatorCases = [
  ["eq", { value: 2 }, { n: 2 }, true],
  ["neq", { value: 2 }, { n: 3 }, true],
  ["gt", { value: 10 }, { n: 11 }, true],
  ["gte", { value: 10 }, { n: 10 }, true],
  ["lt", { value: 10 }, { n: 9 }, true],
  ["lte", { value: 10 }, { n: 10 }, true],
  ["contains", { value: "lo" }, { text: "hello" }, true],
  ["not_contains", { value: "zz" }, { text: "hello" }, true],
  ["starts_with", { value: "he" }, { text: "hello" }, true],
  ["ends_with", { value: "lo" }, { text: "hello" }, true],
  ["in", { value: [1, 2, 3] }, { n: 2 }, true],
  ["not_in", { value: [1, 2, 3] }, { n: 4 }, true],
  ["exists", {}, { present: 0 }, true],
  ["not_exists", {}, {}, true],
  ["is_null", {}, { value: null }, true],
  ["is_not_null", {}, { value: 0 }, true],
];

for (const [operator, conditionExtra, context, expected] of operatorCases) {
  test(`evaluateCondition supports ${operator}`, () => {
    const field = Object.keys(context)[0] ?? "missing";
    const condition = {
      field: field === "missing" ? "missing" : field,
      operator,
      ...conditionExtra,
    };
    const result = evaluateCondition(condition, context);
    assert.equal(result.matched, expected);
  });
}

test("evaluateCondition treats undefined context field as missing", () => {
  const result = evaluateCondition(
    { field: "age", operator: "exists" },
    { age: undefined }
  );
  assert.equal(result.matched, false);
});

test("evaluateCondition treats null as present for exists", () => {
  const result = evaluateCondition(
    { field: "age", operator: "exists" },
    { age: null }
  );
  assert.equal(result.matched, true);
});

test("evaluateCondition reports type mismatch for ordered operators", () => {
  const result = evaluateCondition(
    { field: "age", operator: "gte", value: "29" },
    { age: 30 }
  );
  assert.equal(result.matched, false);
  assert.equal(result.issue?.code, "condition.type_mismatch");
});

test("evaluateConditionGroup supports nested all/any/not", () => {
  const allResult = evaluateConditionGroup(
    {
      all: [
        { field: "a", operator: "eq", value: 1 },
        {
          any: [
            { field: "b", operator: "eq", value: 2 },
            { field: "c", operator: "eq", value: 3 },
          ],
        },
      ],
    },
    { a: 1, b: 9, c: 3 }
  );
  assert.equal(allResult.matched, true);

  const notResult = evaluateConditionGroup(
    { not: { field: "blocked", operator: "eq", value: true } },
    { blocked: false }
  );
  assert.equal(notResult.matched, true);
});

test("deepJsonEqual ignores object key order", () => {
  assert.equal(deepJsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
});

test("evaluateNext returns invalid_current_node for unknown node", () => {
  const result = evaluateNext(basicWorkflow, {
    currentNodeId: "missing",
    context: {},
  });
  assert.equal(result.status, "invalid_current_node");
});

test("evaluateNext uses always fallback when specific conditions fail", () => {
  const result = evaluateNext(basicWorkflow, {
    currentNodeId: "start",
    context: { loanValueRatio: 80 },
  });
  assert.equal(result.status, "matched");
  assert.equal(result.nextNode.id, "review");
});

test("evaluateNext matches first edge by priority and order", () => {
  const lowLvr = evaluateNext(basicWorkflow, {
    currentNodeId: "start",
    context: { loanValueRatio: 60 },
  });
  assert.equal(lowLvr.status, "matched");
  assert.equal(lowLvr.edge.id, "low-lvr");

  const priorityMatch = evaluateNext(priorityWorkflow, {
    currentNodeId: "start",
    context: { pick: "a" },
  });
  assert.equal(priorityMatch.status, "matched");
  assert.equal(priorityMatch.nextNode.id, "a");

  const equalPriority = evaluateNext(priorityWorkflow, {
    currentNodeId: "start",
    context: { pick: "b" },
  });
  assert.equal(equalPriority.status, "matched");
  assert.equal(equalPriority.nextNode.id, "b");
});

test("evaluateNext returns no_match when node has no outgoing edges", () => {
  const result = evaluateNext(basicWorkflow, {
    currentNodeId: "offer",
    context: {},
  });
  assert.equal(result.status, "no_match");
});

test("runtime state helpers create, inspect, and advance immutably", () => {
  const state = createWorkflowState(basicWorkflow);
  assert.equal(state.currentNodeId, "start");
  assert.deepEqual(state.history, []);

  const withoutContext = inspectWorkflowState(basicWorkflow, { state });
  assert.equal(withoutContext.currentNode?.id, "start");
  assert.equal(withoutContext.previousNode, undefined);
  assert.equal(withoutContext.possibleNext.length, 2);
  assert.equal(withoutContext.possibleNext[0].conditionResult, undefined);

  const withContext = inspectWorkflowState(basicWorkflow, {
    state,
    context: { loanValueRatio: 60 },
  });
  assert.equal(withContext.possibleNext[0].wouldMatch, true);

  const advanced = advanceWorkflow(basicWorkflow, {
    state,
    context: { loanValueRatio: 60 },
  });
  assert.equal(advanced.status, "advanced");
  assert.equal(advanced.state.currentNodeId, "offer");
  assert.equal(advanced.state.previousNodeId, "start");
  assert.equal(advanced.state.history.length, 1);
  assert.equal(state.currentNodeId, "start");
  assert.equal(state.history.length, 0);

  const inspectedAfterAdvance = inspectWorkflowState(basicWorkflow, {
    state: advanced.state,
  });
  assert.equal(inspectedAfterAdvance.previousNode?.id, "start");
});

test("advanceWorkflow preserves state on no match", () => {
  const state = createWorkflowState(basicWorkflow, "offer");
  const result = advanceWorkflow(basicWorkflow, {
    state,
    context: {},
  });
  assert.equal(result.status, "not_advanced");
  assert.equal(result.state, state);
  assert.equal(result.evaluation.status, "no_match");
});

test("advanceWorkflow preserves state on invalid current node", () => {
  const state = createWorkflowState(basicWorkflow, "missing");
  const result = advanceWorkflow(basicWorkflow, {
    state,
    context: {},
  });
  assert.equal(result.status, "not_advanced");
  assert.equal(result.state, state);
  assert.equal(result.evaluation.status, "invalid_current_node");
});
