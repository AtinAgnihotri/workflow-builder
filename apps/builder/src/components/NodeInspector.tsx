import { useState } from "react";
import type { JsonObject, WorkflowNode } from "@journeys/core";
import { NODE_TYPES } from "../lib/operators";
import { addNode, deleteNode, updateNode } from "../lib/workflowMutations";
import { useBuilder } from "../state/BuilderContext";

type NodeInspectorProps = {
  node: WorkflowNode;
};

export function NodeInspector({ node }: NodeInspectorProps) {
  const { state, dispatch } = useBuilder();
  const [dataJson, setDataJson] = useState(
    node.data ? JSON.stringify(node.data, null, 2) : ""
  );
  const [dataError, setDataError] = useState<string | null>(null);

  const applyNodePatch = (patch: Partial<WorkflowNode>) => {
    dispatch({
      type: "update_workflow",
      workflow: updateNode(state.workflow, node.id, patch),
    });
  };

  const onSaveData = () => {
    if (!dataJson.trim()) {
      applyNodePatch({ data: undefined });
      setDataError(null);
      return;
    }

    try {
      const parsed = JSON.parse(dataJson) as JsonObject;
      applyNodePatch({ data: parsed });
      setDataError(null);
    } catch {
      setDataError("Node data must be valid JSON.");
    }
  };

  const canDelete = node.id !== state.workflow.startNodeId;

  return (
    <div>
      <h2>Node inspector</h2>
      <div className="field">
        <label htmlFor={`node-label-${node.id}`}>Label</label>
        <input
          id={`node-label-${node.id}`}
          value={node.label}
          onChange={(event) => applyNodePatch({ label: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor={`node-type-${node.id}`}>Type</label>
        <select
          id={`node-type-${node.id}`}
          value={node.type ?? "screen"}
          onChange={(event) => applyNodePatch({ type: event.target.value })}
        >
          {NODE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`node-description-${node.id}`}>Description</label>
        <textarea
          id={`node-description-${node.id}`}
          value={node.description ?? ""}
          onChange={(event) =>
            applyNodePatch({ description: event.target.value || undefined })
          }
        />
      </div>
      <div className="field">
        <label htmlFor={`node-data-${node.id}`}>Data JSON</label>
        <textarea
          id={`node-data-${node.id}`}
          value={dataJson}
          onChange={(event) => setDataJson(event.target.value)}
          onBlur={onSaveData}
        />
        {dataError ? <p className="helper-text">{dataError}</p> : null}
      </div>
      <p className="helper-text">Node id: {node.id}</p>
      {canDelete ? (
        <button
          type="button"
          className="button button--danger"
          onClick={() => {
            dispatch({
              type: "update_workflow",
              workflow: deleteNode(state.workflow, node.id),
            });
            dispatch({ type: "set_selected", selected: null });
          }}
        >
          Delete node
        </button>
      ) : (
        <p className="helper-text">Start node cannot be deleted in V1.</p>
      )}
    </div>
  );
}

export function useAddNodeAction() {
  const { state, dispatch } = useBuilder();

  return () => {
    const label = `Node ${Object.keys(state.workflow.nodes).length + 1}`;
    const result = addNode(state.workflow, label);
    dispatch({ type: "update_workflow", workflow: result.workflow });
    dispatch({ type: "set_selected", selected: { type: "node", id: result.nodeId } });
  };
}
