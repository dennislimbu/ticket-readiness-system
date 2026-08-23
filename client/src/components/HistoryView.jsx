function HistoryView({
  historyTicket,
  readinessHistory,
  impactHistory,
  error,
  onReturnDashboard,
}) {
  if (!historyTicket) {
    return null;
  }

  return (
    <>
      <header className="page-header">
        <h1>Assessment History</h1>

        <p>Review previous ticket-readiness and change-impact assessments.</p>
      </header>

      <section className="form-card">
        <div className="assessment-ticket">
          <span>{historyTicket.jira_reference}</span>

          <strong>{historyTicket.title}</strong>
        </div>

        <h2>Readiness Assessments</h2>

        {readinessHistory.length === 0 ? (
          <p>No readiness assessments found.</p>
        ) : (
          <div className="history-list">
            {readinessHistory.map((assessment) => (
              <div className="history-card" key={assessment.id}>
                <div className="history-card-top">
                  <strong>{assessment.score}%</strong>

                  <span
                    className={`status ${assessment.status
                      .toLowerCase()
                      .replaceAll(' ', '-')}`}
                  >
                    {assessment.status}
                  </span>
                </div>

                <p>Missing: {assessment.missing_requirements || 'None'}</p>

                <small>
                  {new Date(assessment.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

        <h2 className="history-heading">Change Impact Assessments</h2>

        {impactHistory.length === 0 ? (
          <p>No impact assessments found.</p>
        ) : (
          <div className="history-list">
            {impactHistory.map((assessment) => (
              <div className="history-card" key={assessment.id}>
                <div className="history-card-top">
                  <strong>Score {assessment.impact_score}</strong>

                  <span
                    className={`large-status impact-${assessment.impact_level.toLowerCase()}`}
                  >
                    {assessment.impact_level}
                  </span>
                </div>

                <p>Rollback complexity: {assessment.rollback_complexity}</p>

                <small>
                  {new Date(assessment.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

        <button className="secondary-button" onClick={onReturnDashboard}>
          Return to Dashboard
        </button>
      </section>

      {error && <p className="error">{error}</p>}
    </>
  );
}

export default HistoryView;
