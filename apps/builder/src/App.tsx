import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import "./App.css";
import { BuilderProvider, useBuilder } from "./state/BuilderContext";
import { copyWorkflowJson } from "./lib/export";
import { BuilderToolbar } from "./components/BuilderToolbar";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { InspectorPanel } from "./components/InspectorPanel";
import { ValidationPanel } from "./components/ValidationPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { JsonImportDialog } from "./components/JsonImportDialog";
import { JsonExportDialog } from "./components/JsonExportDialog";

function BuilderShell() {
  const { state } = useBuilder();
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyWorkflowJson(state.workflow));
      setCopyStatus("Workflow JSON copied to clipboard.");
    } catch {
      setCopyStatus("Clipboard copy failed. Use Export JSON instead.");
    }
  };

  return (
    <div className="app-shell">
      <BuilderToolbar
        onImport={() => setImportOpen(true)}
        onExport={() => setExportOpen(true)}
        onCopy={onCopy}
      />
      {copyStatus ? (
        <p className="helper-text" style={{ padding: "0 16px" }}>
          {copyStatus}
        </p>
      ) : null}
      <div className="app-main">
        <section className="canvas-panel" aria-label="Workflow canvas">
          <ReactFlowProvider>
            <WorkflowCanvas />
          </ReactFlowProvider>
        </section>
        <InspectorPanel />
      </div>
      <div className="bottom-panel">
        <ValidationPanel />
        <PreviewPanel />
      </div>
      {importOpen ? <JsonImportDialog onClose={() => setImportOpen(false)} /> : null}
      {exportOpen ? <JsonExportDialog onClose={() => setExportOpen(false)} /> : null}
    </div>
  );
}

export default function App() {
  return (
    <BuilderProvider>
      <BuilderShell />
    </BuilderProvider>
  );
}
