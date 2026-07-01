import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  FallbackPage,
  OfferPage,
  ReviewPage,
  StartPage,
  useCurrentNodeId,
  useWorkflowNavigation,
} from "./pages";
import type { LoanAppState } from "./workflow";

function RouterApp() {
  const [loanState, setLoanState] = useState<LoanAppState>({
    loanApplications: [{ lvr: 65 }],
  });
  const currentNodeId = useCurrentNodeId();
  const goNext = useWorkflowNavigation(currentNodeId, loanState);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <StartPage
            loanState={loanState}
            setLoanState={setLoanState}
            onContinue={goNext}
          />
        }
      />
      <Route path="/offer" element={<OfferPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/fallback" element={<FallbackPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <RouterApp />
    </BrowserRouter>
  );
}
