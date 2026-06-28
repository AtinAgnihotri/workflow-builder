import { useMemo, useState } from "react";
import {
  advanceWorkflow,
  createWorkflowState,
  inspectWorkflowState,
  type WorkflowDefinition,
} from "@workflow-builder/core";

type LoanState = {
  loanApplications: Array<{ lvr: number }>;
  applicant: {
    age: number;
    address: { country: string };
  };
};

function mapLoanStateToWorkflowContext(state: LoanState) {
  return {
    loanValueRatio: state.loanApplications[0]?.lvr,
    applicantAge: state.applicant.age,
    applicantCountry: state.applicant.address.country,
  };
}

function ScreenForNode(props: { nodeId: string; onNext: () => void }) {
  return (
    <section>
      <h1>{props.nodeId}</h1>
      <button type="button" onClick={props.onNext}>
        Continue
      </button>
    </section>
  );
}

export function LoanJourney(props: {
  workflow: WorkflowDefinition;
  loanState: LoanState;
}) {
  const [workflowState, setWorkflowState] = useState(() =>
    createWorkflowState(props.workflow)
  );

  const context = useMemo(
    () => mapLoanStateToWorkflowContext(props.loanState),
    [props.loanState]
  );

  const snapshot = inspectWorkflowState(props.workflow, {
    state: workflowState,
    context,
  });

  function goNext() {
    const result = advanceWorkflow(props.workflow, {
      state: workflowState,
      context,
    });

    if (result.status === "advanced") {
      setWorkflowState(result.state);
    }
  }

  console.log("Previous node:", workflowState.previousNodeId);
  console.log(
    "Possible next nodes:",
    snapshot.possibleNext.map((candidate) => candidate.node.id)
  );

  return <ScreenForNode nodeId={workflowState.currentNodeId} onNext={goNext} />;
}
