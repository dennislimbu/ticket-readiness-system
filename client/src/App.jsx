import { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { API_BASE_URL } from "./apiConfig";
import "./App.css";

function TicketApp({ signOut, user }) {
  const [tickets, setTickets] = useState([]);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    jira_reference: "",
    title: "",
    ticket_type: "Bug",
    priority: "Medium",
    description: ""
  });

  const [createdTicket, setCreatedTicket] = useState(null);

  const [readiness, setReadiness] = useState({
    has_description: false,
    has_steps_to_reproduce: false,
    has_expected_behaviour: false,
    has_actual_behaviour: false,
    has_environment: false,
    has_acceptance_criteria: false,
    has_priority: false
  });

  const [readinessResult, setReadinessResult] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [impact, setImpact] = useState({
    ui_impact: false,
    api_impact: false,
    database_impact: false,
    authentication_impact: false,
    security_impact: false,
    integration_impact: false,
    infrastructure_impact: false,
    deployment_impact: false,
    rollback_complexity: "LOW"
  });

  const [impactResult, setImpactResult] = useState(null);

  const [historyTicket, setHistoryTicket] = useState(null);
  const [readinessHistory, setReadinessHistory] = useState([]);
  const [impactHistory, setImpactHistory] = useState([]);

  const authenticatedFetch = async (url, options = {}) => {
    const session = await fetchAuthSession();

    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
      throw new Error("No authentication token available");
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
      }
    });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      setCreatedTicket(data);

      setReadiness({
        has_description: Boolean(form.description),
        has_steps_to_reproduce: false,
        has_expected_behaviour: false,
        has_actual_behaviour: false,
        has_environment: false,
        has_acceptance_criteria: false,
        has_priority: Boolean(form.priority)
      });

      await fetchTickets();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleReadinessChange = (event) => {
    const { name, checked } = event.target;

    setReadiness((previous) => ({
      ...previous,
      [name]: checked
    }));
  };

  const runReadinessAssessment = async () => {
    if (!createdTicket) return;

    try {
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/readiness/${createdTicket.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(readiness)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Assessment failed");
      }

      setReadinessResult(data.result);
      await fetchTickets();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleImpactChange = (event) => {
    const { name, type, checked, value } = event.target;

    setImpact((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const runImpactAssessment = async () => {
    if (!selectedTicket) return;

    try {
      setError("");

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/impact/${selectedTicket.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(impact)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impact assessment failed");
      }

      setImpactResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const openNewAssessment = () => {
    setView("assessment");

    setForm({
      jira_reference: "",
      title: "",
      ticket_type: "Bug",
      priority: "Medium",
      description: ""
    });

    setCreatedTicket(null);
    setReadinessResult(null);
    setError("");

    setReadiness({
      has_description: false,
      has_steps_to_reproduce: false,
      has_expected_behaviour: false,
      has_actual_behaviour: false,
      has_environment: false,
      has_acceptance_criteria: false,
      has_priority: false
    });
  };

  const openImpactAssessment = (ticket) => {
    setSelectedTicket(ticket);
    setImpactResult(null);
    setError("");

    setImpact({
      ui_impact: false,
      api_impact: false,
      database_impact: false,
      authentication_impact: false,
      security_impact: false,
      integration_impact: false,
      infrastructure_impact: false,
      deployment_impact: false,
      rollback_complexity: "LOW"
    });

    setView("impact");
  };

  const openHistory = async (ticket) => {
    try {
      setError("");
      setHistoryTicket(ticket);

      const [readinessResponse, impactResponse] = await Promise.all([
        authenticatedFetch(
          `${API_BASE_URL}/api/readiness/${ticket.id}`
        ),
        authenticatedFetch(
        `${API_BASE_URL}/api/impact/${ticket.id}`
        )
      ]);

      if (!readinessResponse.ok || !impactResponse.ok) {
        throw new Error("Unable to retrieve assessment history");
      }

      const readinessData = await readinessResponse.json();
      const impactData = await impactResponse.json();

      setReadinessHistory(readinessData);
      setImpactHistory(impactData);
      setView("history");
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve assessment history.");
    }
  };

  const totalTickets = tickets.length;

  const readyTickets = tickets.filter(
    (ticket) => ticket.readiness_status === "READY"
  ).length;

  const notReadyTickets = tickets.filter(
    (ticket) => ticket.readiness_status === "NOT READY"
  ).length;

  const pendingTickets = tickets.filter(
    (ticket) => ticket.readiness_status === "NOT ASSESSED"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h2>TRCI</h2>
          <p>Engineering Tool</p>
        </div>

        <div className="user-panel">
          <span>Signed in as</span>
          <strong>
            {user?.signInDetails?.loginId ||
              user?.username ||
              "Authenticated user"}
          </strong>

          <button className="logout-button" onClick={signOut}>
            Sign out
          </button>
        </div>

        <nav>
          <button
            className={`nav-item ${view === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setView("dashboard");
              fetchTickets();
            }}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${view === "assessment" ? "active" : ""}`}
            onClick={openNewAssessment}
          >
            New Assessment
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {view === "dashboard" && (
          <>
            <header className="page-header">
              <h1>Ticket Readiness & Change Impact</h1>
              <p>
                Assess development ticket readiness and software change impact.
              </p>
            </header>

            <section className="summary-grid">
              <div className="summary-card">
                <span>Total Tickets</span>
                <strong>{totalTickets}</strong>
              </div>

              <div className="summary-card">
                <span>Ready</span>
                <strong>{readyTickets}</strong>
              </div>

              <div className="summary-card">
                <span>Not Ready</span>
                <strong>{notReadyTickets}</strong>
              </div>

              <div className="summary-card">
                <span>Pending</span>
                <strong>{pendingTickets}</strong>
              </div>
            </section>

            <section className="ticket-section">
              <div className="section-heading">
                <h2>Recent Tickets</h2>
                <button onClick={fetchTickets}>Refresh</button>
              </div>

              {loading && <p>Loading tickets...</p>}
              {error && <p className="error">{error}</p>}

              {!loading && !error && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Jira Ref</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Readiness</th>
                        <th>Score</th>
                        <th>Impact</th>
                        <th>History</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan="8">No tickets found.</td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="jira-ref">
                              {ticket.jira_reference}
                            </td>

                            <td>{ticket.title}</td>
                            <td>{ticket.ticket_type}</td>
                            <td>{ticket.priority}</td>

                            <td>
                              <span
                                className={`status ${ticket.readiness_status
                                  .toLowerCase()
                                  .replaceAll(" ", "-")}`}
                              >
                                {ticket.readiness_status}
                              </span>
                            </td>

                            <td>{ticket.readiness_score}%</td>

                            <td>
                              {ticket.readiness_status === "READY" ? (
                                <button
                                  className="table-action-button"
                                  onClick={() =>
                                    openImpactAssessment(ticket)
                                  }
                                >
                                  Assess Impact
                                </button>
                              ) : (
                                <span className="disabled-action">
                                  Not Ready
                                </span>
                              )}
                            </td>

                            <td>
                              <button
                                className="history-button"
                                onClick={() => openHistory(ticket)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

{view === "assessment" && (
  <>
    <header className="page-header">
      <h1>New Ticket Assessment</h1>
      <p>
        Create a ticket and evaluate whether it is ready for development.
      </p>
    </header>

    {!createdTicket && (
      <section className="form-card">
        <h2>Ticket Information</h2>

        <form onSubmit={handleCreateTicket}>
          <div className="form-grid">
            <div className="form-group">
              <label>Jira Reference</label>

              <input
                name="jira_reference"
                value={form.jira_reference}
                onChange={handleFormChange}
                placeholder="e.g. DEV-2045"
                required
              />

              <small className="field-help">
                Enter the Jira ticket or work-item reference.
              </small>
            </div>

            <div className="form-group">
              <label>Ticket Type</label>

              <select
                name="ticket_type"
                value={form.ticket_type}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
              onChange={handleFormChange}
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
            ["has_description", "Description provided"],
            ["has_steps_to_reproduce", "Steps to reproduce provided"],
            ["has_expected_behaviour", "Expected behaviour provided"],
            ["has_actual_behaviour", "Actual behaviour provided"],
            ["has_environment", "Environment identified"],
            ["has_acceptance_criteria", "Acceptance criteria provided"],
            ["has_priority", "Priority defined"]
          ].map(([name, label]) => (
            <label key={name}>
              <input
                type="checkbox"
                name={name}
                checked={readiness[name]}
                onChange={handleReadinessChange}
              />
              {label}
            </label>
          ))}
        </div>

        <button
          className="primary-button"
          onClick={runReadinessAssessment}
        >
          Calculate Readiness
        </button>
      </section>
    )}

    {readinessResult && (
      <section className="result-card">
        <h2>Readiness Result</h2>

        <div className="score">
          {readinessResult.score}%
        </div>

        <span
          className={`large-status ${
            readinessResult.status === "READY"
              ? "ready-result"
              : "not-ready-result"
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

        {readinessResult.status === "READY" && (
          <button
            className="primary-button"
            onClick={() => {
              setSelectedTicket({
                ...createdTicket,
                readiness_status: "READY",
                readiness_score: readinessResult.score
              });

              setImpactResult(null);

              setImpact({
                ui_impact: false,
                api_impact: false,
                database_impact: false,
                authentication_impact: false,
                security_impact: false,
                integration_impact: false,
                infrastructure_impact: false,
                deployment_impact: false,
                rollback_complexity: "LOW"
              });

              setView("impact");
            }}
          >
            Continue to Change Impact
          </button>
        )}

        <button
          className="secondary-button"
          onClick={() => {
            setView("dashboard");
            fetchTickets();
          }}
        >
          Return to Dashboard
        </button>
      </section>
    )}

    {error && <p className="error">{error}</p>}
  </>
)}
        {view === "impact" && selectedTicket && (
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
                    ["ui_impact", "User Interface"],
                    ["api_impact", "Backend / API"],
                    ["database_impact", "Database"],
                    ["authentication_impact", "Authentication"],
                    ["security_impact", "Security"],
                    ["integration_impact", "External Integration"],
                    ["infrastructure_impact", "Infrastructure"],
                    ["deployment_impact", "Deployment"]
                  ].map(([name, label]) => (
                    <label key={name}>
                      <input
                        type="checkbox"
                        name={name}
                        checked={impact[name]}
                        onChange={handleImpactChange}
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
                    onChange={handleImpactChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <button
                  className="primary-button"
                  onClick={runImpactAssessment}
                >
                  Calculate Change Impact
                </button>
              </section>
            )}

            {impactResult && (
              <section className="result-card">
                <h2>Change Impact Result</h2>

                <div className="score">
                  {impactResult.score}
                </div>

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

                <button
                  className="secondary-button"
                  onClick={() => {
                    setView("dashboard");
                    fetchTickets();
                  }}
                >
                  Return to Dashboard
                </button>
              </section>
            )}

            {error && <p className="error">{error}</p>}
          </>
        )}

        {view === "history" && historyTicket && (
          <>
            <header className="page-header">
              <h1>Assessment History</h1>
              <p>
                Review previous ticket-readiness and change-impact assessments.
              </p>
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
                    <div
                      className="history-card"
                      key={assessment.id}
                    >
                      <div className="history-card-top">
                        <strong>{assessment.score}%</strong>

                        <span
                          className={`status ${assessment.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {assessment.status}
                        </span>
                      </div>

                      <p>
                        Missing:{" "}
                        {assessment.missing_requirements || "None"}
                      </p>

                      <small>
                        {new Date(
                          assessment.created_at
                        ).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="history-heading">
                Change Impact Assessments
              </h2>

              {impactHistory.length === 0 ? (
                <p>No impact assessments found.</p>
              ) : (
                <div className="history-list">
                  {impactHistory.map((assessment) => (
                    <div
                      className="history-card"
                      key={assessment.id}
                    >
                      <div className="history-card-top">
                        <strong>
                          Score {assessment.impact_score}
                        </strong>

                        <span
                          className={`large-status impact-${assessment.impact_level.toLowerCase()}`}
                        >
                          {assessment.impact_level}
                        </span>
                      </div>

                      <p>
                        Rollback complexity:{" "}
                        {assessment.rollback_complexity}
                      </p>

                      <small>
                        {new Date(
                          assessment.created_at
                        ).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="secondary-button"
                onClick={() => setView("dashboard")}
              >
                Return to Dashboard
              </button>
            </section>

            {error && <p className="error">{error}</p>}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <TicketApp signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}

export default App;