import { useMemo } from "react";
import { validateWorkflow } from "@journeys/core";
import { useBuilder } from "../state/BuilderContext";

export function ValidationPanel() {
  const { state, dispatch } = useBuilder();
  const validation = useMemo(
    () => validateWorkflow(state.workflow),
    [state.workflow]
  );

  if (validation.issues.length === 0) {
    return (
      <section className="panel" aria-label="Validation issues">
        <h2>Validation</h2>
        <p className="helper-text">No validation issues.</p>
      </section>
    );
  }

  return (
    <section className="panel" aria-label="Validation issues">
      <h2>Validation</h2>
      <ul className="issue-list">
        {validation.issues.map((issue, index) => (
          <li key={`${issue.code}-${index}`}>
            <button
              type="button"
              className={`issue-item issue-item--${issue.severity}`}
              onClick={() => {
                if (issue.path[0] === "nodes" && typeof issue.path[1] === "string") {
                  dispatch({
                    type: "set_selected",
                    selected: { type: "node", id: issue.path[1] },
                  });
                }
              }}
            >
              <div className="issue-item__code">{issue.code}</div>
              <div className="issue-item__message">{issue.message}</div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
