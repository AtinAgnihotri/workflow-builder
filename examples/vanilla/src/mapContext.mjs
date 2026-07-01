/** Developer-owned: map application state to stable workflow context fields. */
export function mapLoanAppToWorkflowContext(appState) {
  return {
    loanValueRatio: appState.loanApplications?.[0]?.lvr,
    applicantCountry: appState.applicant?.address?.country,
  };
}
