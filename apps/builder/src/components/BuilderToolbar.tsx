import { useMemo } from "react";
import { validateWorkflow } from "@journeys/core";
import { useBuilder } from "../state/BuilderContext";

type BuilderToolbarProps = {
  onImport: () => void;
  onExport: () => void;
  onCopy: () => void;
};

export function BuilderToolbar({ onImport, onExport, onCopy }: BuilderToolbarProps) {
  const { state, dispatch } = useBuilder();
  const validation = useMemo(
    () => validateWorkflow(state.workflow),
    [state.workflow]
  );

  const errors = validation.issues.filter((issue) => issue.severity === "error");
  const warnings = validation.issues.filter((issue) => issue.severity === "warning");

  return (
    <header className="builder-toolbar">
      <h1>Workflow Builder</h1>
      <div className="field builder-toolbar__name">
        <label htmlFor="workflow-name">Workflow name</label>
        <input
          id="workflow-name"
          value={state.workflow.name}
          onChange={(event) =>
            dispatch({
              type: "rename_workflow",
              name: event.target.value,
            })
          }
        />
      </div>
      <div className="builder-toolbar__status" aria-live="polite">
        {validation.valid ? (
          <span className="status-badge status-badge--valid">Valid</span>
        ) : (
          <span className="status-badge status-badge--invalid">
            {errors.length} error{errors.length === 1 ? "" : "s"}
          </span>
        )}
        {warnings.length > 0 ? (
          <span className="status-badge status-badge--warning">
            {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="builder-toolbar__actions">
        <button type="button" className="button" onClick={onImport}>
          Import JSON
        </button>
        <button type="button" className="button" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="button" onClick={onCopy}>
          Copy JSON
        </button>
        <button
          type="button"
          className="button"
          onClick={() => dispatch({ type: "reset_demo" })}
        >
          Reset demo
        </button>
      </div>
    </header>
  );
}
