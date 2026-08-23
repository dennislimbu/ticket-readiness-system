function ImpactAssessment({
  selectedTicket,
  impact,
  impactResult,
  error,
  onImpactChange,
  onRunImpact,
  onReturnDashboard,
}) {
  if (!selectedTicket) {
    return null;
  }

  return (
    <>
      <header className="page-header">
        <h1>Software Change Impact Assessment</h1>

        <p>
          Evaluate the areas of the software potentially affected by the
          proposed change.
        </p>
      </header>

      {!impactResult && (
        <section className="form-card">
          <div className="assessment-ticket">
            <span>{selectedTicket.jira_reference}</span>

            <strong>{selectedTicket.title}</strong>
          </div>

          <div className="checklist">
            {[
              ['ui_impact', 'User Interface'],
              ['api_impact', 'Backend / API'],
              ['database_impact', 'Database'],
              ['authentication_impact', 'Authentication'],
              ['security_impact', 'Security'],
              ['integration_impact', 'External Integration'],
              ['infrastructure_impact', 'Infrastructure'],
              ['deployment_impact', 'Deployment'],
            ].map(([name, label]) => (
              <label key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={impact[name]}
                  onChange={onImpactChange}
                />

                {label}
              </label>
            ))}
          </div>

          <div className="form-group full-width">
            <label>Rollback Complexity</label>

            <select
              name="rollback_complexity"
              value={impact.rollback_complexity}
              onChange={onImpactChange}
            >
              <option value="LOW">Low</option>

              <option value="MEDIUM">Medium</option>

              <option value="HIGH">High</option>
            </select>
          </div>

          <button className="primary-button" onClick={onRunImpact}>
            Calculate Change Impact
          </button>
        </section>
      )}

      {impactResult && (
        <section className="result-card">
          <h2>Change Impact Result</h2>

          <div className="score">{impactResult.score}</div>

          <span
            className={`large-status impact-${impactResult.impactLevel.toLowerCase()}`}
          >
            {impactResult.impactLevel} IMPACT
          </span>

          <div className="missing-list">
            <h3>Affected Areas</h3>

            {impactResult.affectedAreas.length === 0 ? (
              <p>No affected areas selected.</p>
            ) : (
              <ul>
                {impactResult.affectedAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            )}
          </div>

          <button className="secondary-button" onClick={onReturnDashboard}>
            Return to Dashboard
          </button>
        </section>
      )}

      {error && <p className="error">{error}</p>}
    </>
  );
}

export default ImpactAssessment;
