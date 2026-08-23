function NewAssessment({
  form,
  createdTicket,
  readiness,
  readinessResult,
  error,
  onFormChange,
  onCreateTicket,
  onReadinessChange,
  onRunReadiness,
  onContinueToImpact,
  onReturnDashboard,
}) {
  return (
    <>
      <header className="page-header">
        <h1>New Ticket Assessment</h1>

        <p>Create a ticket and evaluate whether it is ready for development.</p>
      </header>

      {!createdTicket && (
        <section className="form-card">
          <h2>Ticket Information</h2>

          <form onSubmit={onCreateTicket}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ticket Reference</label>

                <div className="generated-reference-box">
                  Automatically generated when the ticket is created
                </div>

                <small className="field-help">
                  The system will assign a unique reference such as TRCI-0001.
                </small>
              </div>

              <div className="form-group">
                <label>Ticket Type</label>

                <select
                  name="ticket_type"
                  value={form.ticket_type}
                  onChange={onFormChange}
                >
                  <option>Bug</option>
                  <option>Feature</option>
                  <option>Change</option>
                  <option>Investigation</option>
                </select>

                <small className="field-help">
                  Choose the category that best describes the work.
                </small>
              </div>

              <div className="form-group">
                <label>Title</label>

                <input
                  name="title"
                  value={form.title}
                  onChange={onFormChange}
                  placeholder="e.g. Fix validation on customer search form"
                  required
                />

                <small className="field-help">
                  Use a short, clear summary of the requested change.
                </small>
              </div>

              <div className="form-group">
                <label>Priority</label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={onFormChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>

                <small className="field-help">
                  Select the urgency or business priority of the ticket.
                </small>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={onFormChange}
                rows="6"
                placeholder="Describe the issue or requested software change. Include what is happening, who is affected, and any important technical or business context."
              />

              <small className="field-help">
                Include enough context for another engineer to understand the
                request without needing to ask for basic information.
              </small>
            </div>

            <div className="form-guidance">
              <strong>Tip</strong>

              <p>
                A well-prepared ticket should clearly explain the problem,
                expected behaviour, affected environment and acceptance criteria
                before development begins.
              </p>
            </div>

            <button className="primary-button" type="submit">
              Create Ticket
            </button>
          </form>
        </section>
      )}

      {createdTicket && !readinessResult && (
        <section className="form-card">
          <div className="assessment-ticket">
            <span>{createdTicket.jira_reference}</span>

            <strong>{createdTicket.title}</strong>
          </div>

          <h2>Ticket Readiness Checklist</h2>

          <p className="help-text">
            Confirm that the information required by an engineer is present in
            the ticket.
          </p>

          <div className="checklist">
            {[
              ['has_description', 'Description provided'],
              ['has_steps_to_reproduce', 'Steps to reproduce provided'],
              ['has_expected_behaviour', 'Expected behaviour provided'],
              ['has_actual_behaviour', 'Actual behaviour provided'],
              ['has_environment', 'Environment identified'],
              ['has_acceptance_criteria', 'Acceptance criteria provided'],
              ['has_priority', 'Priority defined'],
            ].map(([name, label]) => (
              <label key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={readiness[name]}
                  onChange={onReadinessChange}
                />

                {label}
              </label>
            ))}
          </div>

          <button className="primary-button" onClick={onRunReadiness}>
            Calculate Readiness
          </button>
        </section>
      )}

      {readinessResult && (
        <section className="result-card">
          <h2>Readiness Result</h2>

          <div className="score">{readinessResult.score}%</div>

          <span
            className={`large-status ${
              readinessResult.status === 'READY'
                ? 'ready-result'
                : 'not-ready-result'
            }`}
          >
            {readinessResult.status}
          </span>

          {readinessResult.missingRequirements.length > 0 && (
            <div className="missing-list">
              <h3>Missing Requirements</h3>

              <ul>
                {readinessResult.missingRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {readinessResult.status === 'READY' && (
            <button className="primary-button" onClick={onContinueToImpact}>
              Continue to Change Impact
            </button>
          )}

          <button className="secondary-button" onClick={onReturnDashboard}>
            Return to Dashboard
          </button>
        </section>
      )}

      {error && <p className="error">{error}</p>}
    </>
  );
}

export default NewAssessment;
