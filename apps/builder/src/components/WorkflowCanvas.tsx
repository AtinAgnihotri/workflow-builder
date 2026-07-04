import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo } from "react";
import type { WorkflowDefinition } from "@journeys/core";
import {
  addEdge as addWorkflowEdge,
  getNodePosition,
  setNodePosition,
} from "../lib/workflowMutations";
import { useBuilder } from "../state/BuilderContext";

type WorkflowNodeData = {
  label: string;
  nodeType?: string;
  selected: boolean;
};

function WorkflowNodeCard({ data }: NodeProps<Node<WorkflowNodeData>>) {
  return (
    <div className={`workflow-node-card${data.selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="workflow-node-card__label">{data.label}</div>
      <div className="workflow-node-card__type">{data.nodeType ?? "node"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  workflowNode: WorkflowNodeCard,
};

function toFlowNodes(
  workflow: WorkflowDefinition,
  selectedNodeId: string | null
): Node<WorkflowNodeData>[] {
  return Object.values(workflow.nodes).map((node, index) => ({
    id: node.id,
    type: "workflowNode",
    position: getNodePosition(node, index),
    data: {
      label: node.label,
      nodeType: node.type,
      selected: selectedNodeId === node.id,
    },
  }));
}

function toFlowEdges(workflow: WorkflowDefinition, selectedEdgeId: string | null): Edge[] {
  const edges: Edge[] = [];

  for (const edgeList of Object.values(workflow.edges)) {
    for (const edge of edgeList) {
      edges.push({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        label: edge.label ?? `#${edge.priority ?? 0}`,
        selected: selectedEdgeId === edge.id,
      });
    }
  }

  return edges;
}

export function WorkflowCanvas() {
  const { state, dispatch } = useBuilder();
  const selectedNodeId = state.selected?.type === "node" ? state.selected.id : null;
  const selectedEdgeId = state.selected?.type === "edge" ? state.selected.id : null;

  const nodes = useMemo(
    () => toFlowNodes(state.workflow, selectedNodeId),
    [state.workflow, selectedNodeId]
  );
  const edges = useMemo(
    () => toFlowEdges(state.workflow, selectedEdgeId),
    [state.workflow, selectedEdgeId]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      const result = addWorkflowEdge(state.workflow, connection.source, connection.target);
      if (!result) {
        return;
      }

      dispatch({ type: "update_workflow", workflow: result.workflow });
      dispatch({ type: "set_selected", selected: { type: "edge", id: result.edgeId } });
    },
    [dispatch, state.workflow]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch({ type: "set_selected", selected: { type: "node", id: node.id } });
    },
    [dispatch]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      dispatch({ type: "set_selected", selected: { type: "edge", id: edge.id } });
    },
    [dispatch]
  );

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      dispatch({
        type: "update_workflow",
        workflow: setNodePosition(state.workflow, node.id, node.position),
      });
    },
    [dispatch, state.workflow]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onNodeDragStop={onNodeDragStop}
    >
      <Background gap={16} />
      <MiniMap pannable zoomable />
      <Controls />
    </ReactFlow>
  );
}
