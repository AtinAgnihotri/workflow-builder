import type { WorkflowDefinition, WorkflowRuntimeState } from "@workflow-builder/core";
import { createWorkflowState } from "@workflow-builder/core";
import { demoWorkflow, defaultSampleContextJson } from "../demoWorkflow";
import { findEdge } from "../lib/workflowMutations";

export type BuilderSelection =
  | { type: "node"; id: string }
  | { type: "edge"; id: string }
  | null;

export type BuilderState = {
  workflow: WorkflowDefinition;
  previewState: WorkflowRuntimeState;
  selected: BuilderSelection;
  sampleContextJson: string;
};

export type BuilderAction =
  | { type: "replace_workflow"; workflow: WorkflowDefinition }
  | { type: "update_workflow"; workflow: WorkflowDefinition }
  | { type: "rename_workflow"; name: string }
  | { type: "set_selected"; selected: BuilderSelection }
  | { type: "set_sample_context"; sampleContextJson: string }
  | { type: "set_preview_state"; previewState: WorkflowRuntimeState }
  | { type: "reset_preview"; workflow: WorkflowDefinition }
  | { type: "reset_demo" };

export function createInitialBuilderState(
  workflow: WorkflowDefinition = demoWorkflow
): BuilderState {
  return {
    workflow,
    previewState: createWorkflowState(workflow),
    selected: null,
    sampleContextJson: defaultSampleContextJson,
  };
}

export function builderReducer(
  state: BuilderState,
  action: BuilderAction
): BuilderState {
  switch (action.type) {
    case "replace_workflow":
      return {
        ...state,
        workflow: action.workflow,
        previewState: createWorkflowState(action.workflow),
        selected: null,
      };
    case "update_workflow":
      return {
        ...state,
        workflow: action.workflow,
        previewState: action.workflow.nodes[state.previewState.currentNodeId]
          ? state.previewState
          : createWorkflowState(action.workflow),
        selected:
          state.selected?.type === "node" &&
          !action.workflow.nodes[state.selected.id]
            ? null
            : state.selected?.type === "edge" &&
                !findEdge(action.workflow, state.selected.id)
              ? null
              : state.selected,
      };
    case "rename_workflow":
      return {
        ...state,
        workflow: {
          ...state.workflow,
          name: action.name,
        },
      };
    case "set_selected":
      return { ...state, selected: action.selected };
    case "set_sample_context":
      return { ...state, sampleContextJson: action.sampleContextJson };
    case "set_preview_state":
      return { ...state, previewState: action.previewState };
    case "reset_preview":
      return {
        ...state,
        previewState: createWorkflowState(action.workflow),
      };
    case "reset_demo":
      return createInitialBuilderState(demoWorkflow);
    default:
      return state;
  }
}
