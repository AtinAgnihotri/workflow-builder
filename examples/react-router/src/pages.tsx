import { evaluateNext } from "@workflow-builder/core";
import { useNavigate, useLocation } from "react-router-dom";
import {
  mapLoanAppToWorkflowContext,
  routeForNode,
  workflow,
  type LoanAppState,
} from "./workflow";

export function useWorkflowNavigation(
  currentNodeId: string,
  loanState: LoanAppState
) {
  const navigate = useNavigate();

  return () => {
    const context = mapLoanAppToWorkflowContext(loanState);
    const result = evaluateNext(workflow, { currentNodeId, context });

    if (result.status === "matched") {
      navigate(routeForNode(result.nextNode.id));
      return;
    }

    navigate("/fallback");
  };
}

export function nodeIdFromPath(pathname: string): string {
  if (pathname === "/offer") return "offer";
  if (pathname === "/review") return "review";
  return "start";
}

export function StartPage({
  loanState,
  setLoanState,
  onContinue,
}: {
  loanState: LoanAppState;
  setLoanState: (state: LoanAppState) => void;
  onContinue: () => void;
}) {
  return (
    <section style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Start</h1>
      <label>
        Loan value ratio:
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
      <button type="button" onClick={onContinue}>
        Continue
      </button>
    </section>
  );
}

export function OfferPage() {
  return (
    <section style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Offer</h1>
      <p>Automated offer path.</p>
    </section>
  );
}

export function ReviewPage() {
  return (
    <section style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Manual Review</h1>
      <p>Fallback review path.</p>
    </section>
  );
}

export function FallbackPage() {
  return (
    <section style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>No matching edge</h1>
      <p>Host-defined fallback when evaluation does not match.</p>
    </section>
  );
}

export function useCurrentNodeId() {
  const location = useLocation();
  return nodeIdFromPath(location.pathname);
}
