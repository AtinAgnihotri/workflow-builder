import { useMemo, useState } from "react";
import {
  advanceWorkflow,
  createWorkflowState,
  inspectWorkflowState,
} from "@workflow-builder/core";
import {
  mapLoanAppToWorkflowContext,
  workflow,
  type LoanAppState,
} from "./workflow";

function ScreenForNode({
  nodeId,
  previousNodeId,
  possibleNext,
  onNext,
}: {
  nodeId: string;
  previousNodeId?: string;
  possibleNext: Array<{ node: { label: string }; wouldMatch?: boolean }>;
  onNext: () => void;
}) {
  const node = workflow.nodes[nodeId];

  return (
    <section style={{ fontFamily: "system-ui", padding: 24, maxWidth: 520 }}>
      <h1>{node?.label ?? nodeId}</h1>
      <p>Previous node: {previousNodeId ?? "none"}</p>
      <p>Possible next:</p>
      <ul>
        {possibleNext.map((candidate) => (
          <li key={candidate.node.label}>
            {candidate.node.label}
            {candidate.wouldMatch !== undefined
              ? ` (wouldMatch=${String(candidate.wouldMatch)})`
              : ""}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </section>
  );
}

export function App() {
  const [loanState, setLoanState] = useState<LoanAppState>({
    loanApplications: [{ lvr: 65 }],
  });
  const [workflowState, setWorkflowState] = useState(() =>
    createWorkflowState(workflow)
  );

  const context = useMemo(
    () => mapLoanAppToWorkflowContext(loanState),
    [loanState]
  );

  const snapshot = inspectWorkflowState(workflow, {
    state: workflowState,
    context,
  });

  function next() {
    const result = advanceWorkflow(workflow, {
      state: workflowState,
      context,
    });

    if (result.status === "advanced") {
      setWorkflowState(result.state);
    }
  }

  return (
    <div>
      <label style={{ display: "block", padding: 16 }}>
        Loan value ratio (product field maps here):
        <input
          type="number"
          value={loanState.loanApplications[0]?.lvr ?? 0}
          onChange={(event) =>
            setLoanState({
              loanApplications: [{ lvr: Number(event.target.value) }],
            })
          }
        />
      </label>
      <ScreenForNode
        nodeId={workflowState.currentNodeId}
        previousNodeId={workflowState.previousNodeId}
        possibleNext={snapshot.possibleNext}
        onNext={next}
      />
    </div>
  );
}
