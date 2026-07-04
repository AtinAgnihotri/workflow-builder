import { useState } from "react";
import type { ValidationIssue } from "@journeys/core";
import { tryImportWorkflow } from "../lib/preview";
import { useBuilder } from "../state/BuilderContext";

type JsonImportDialogProps = {
  onClose: () => void;
};

export function JsonImportDialog({ onClose }: JsonImportDialogProps) {
  const { state, dispatch } = useBuilder();
  const [jsonText, setJsonText] = useState("");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  const onImport = () => {
    const parsed = tryImportWorkflow(jsonText);
    if (!parsed.ok) {
      setIssues(parsed.issues);
      return;
    }

    dispatch({ type: "replace_workflow", workflow: parsed.workflow });
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-json-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="import-json-title">Import workflow JSON</h2>
        <p className="helper-text">
          Current draft: {state.workflow.name}. Invalid imports keep this draft unchanged.
        </p>
        <div className="field">
          <label htmlFor="import-json-text">Workflow JSON</label>
          <textarea
            id="import-json-text"
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setIssues([]);
            }}
          />
        </div>
        {issues.length > 0 ? (
          <ul className="issue-list" aria-label="Import errors">
            {issues.map((issue, index) => (
              <li key={`${issue.code}-${index}`} className={`issue-item issue-item--${issue.severity}`}>
                <div className="issue-item__code">{issue.code}</div>
                <div className="issue-item__message">{issue.message}</div>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="dialog__actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button button--primary" onClick={onImport}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
