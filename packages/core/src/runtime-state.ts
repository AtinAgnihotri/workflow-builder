import { evaluateConditionGroup, evaluateNext } from "./evaluate.js";
import { toJsonObject } from "./json.js";
import type {
  AdvanceWorkflowInput,
  AdvanceWorkflowResult,
  InspectWorkflowStateInput,
  JsonObject,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowNextCandidate,
  WorkflowRuntimeState,
  WorkflowStateSnapshot,
} from "./types.js";
import { sortEdges } from "./utils.js";

export function createWorkflowState(
  workflow: WorkflowDefinition,
  initialNodeId: string = workflow.startNodeId
): WorkflowRuntimeState {
  return {
    currentNodeId: initialNodeId,
    history: [],
  };
}

export function inspectWorkflowState(
  workflow: WorkflowDefinition,
  input: InspectWorkflowStateInput
): WorkflowStateSnapshot {
  const currentNode = workflow.nodes[input.state.currentNodeId];
  const previousNode = input.state.previousNodeId
    ? workflow.nodes[input.state.previousNodeId]
    : undefined;

  const possibleNext = buildPossibleNextCandidates(
    workflow,
    input.state.currentNodeId,
    input.context
  );

  return {
    state: input.state,
    currentNode,
    previousNode,
    possibleNext,
  };
}

export function advanceWorkflow(
  workflow: WorkflowDefinition,
  input: AdvanceWorkflowInput
): AdvanceWorkflowResult {
  const evaluation = evaluateNext(workflow, {
    currentNodeId: input.state.currentNodeId,
    context: input.context,
  });

  if (evaluation.status !== "matched") {
    return {
      status: "not_advanced",
      state: input.state,
      evaluation,
    };
  }

  const transition: {
    fromNodeId: string;
    toNodeId: string;
    edgeId: string;
    contextSnapshot?: JsonObject;
    metadata?: JsonObject;
  } = {
    fromNodeId: evaluation.currentNode.id,
    toNodeId: evaluation.nextNode.id,
    edgeId: evaluation.edge.id,
    metadata: input.metadata,
  };

  if (input.recordContextSnapshot) {
    transition.contextSnapshot = toJsonObject(input.context);
  }

  return {
    status: "advanced",
    state: {
      currentNodeId: evaluation.nextNode.id,
      previousNodeId: evaluation.currentNode.id,
      history: [...input.state.history, transition],
    },
    evaluation,
  };
}

function buildPossibleNextCandidates(
  workflow: WorkflowDefinition,
  nodeId: string,
  context?: WorkflowContext
): WorkflowNextCandidate[] {
  const outgoingEdges = sortEdges(workflow.edges[nodeId] ?? []);

  return outgoingEdges.flatMap((edge) => {
    const node = workflow.nodes[edge.to];
    if (!node) {
      return [];
    }

    if (context === undefined) {
      return [
        {
          edge,
          node,
          priority: edge.priority ?? 0,
        },
      ];
    }

    const conditionResult = evaluateConditionGroup(edge.when, context);

    return [
      {
        edge,
        node,
        priority: edge.priority ?? 0,
        conditionResult,
        wouldMatch: conditionResult.matched,
      },
    ];
  });
}

export { buildPossibleNextCandidates };
