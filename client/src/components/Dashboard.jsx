import { useState } from 'react';

import { getPriorityClass, getTicketTypeMeta } from '../utils/ticketUI';

import TicketFilters from './TicketFilters';

function Dashboard({
  tickets,
  loading,
  error,
  canAssessTickets,
  onRefresh,
  onImpact,
  onHistory,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const [typeFilter, setTypeFilter] = useState('All');

  const [priorityFilter, setPriorityFilter] = useState('All');

  const [readinessFilter, setReadinessFilter] = useState('All');

  const totalTickets = tickets.length;

  const readyTickets = tickets.filter(
    (ticket) => ticket.readiness_status === 'READY'
  ).length;

  const notReadyTickets = tickets.filter(
    (ticket) => ticket.readiness_status === 'NOT READY'
  ).length;

  const pendingTickets = tickets.filter(
    (ticket) => ticket.readiness_status === 'NOT ASSESSED'
  ).length;

  /*
    Search and filter tickets.
  */
  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      ticket.jira_reference?.toLowerCase().includes(search) ||
      ticket.title?.toLowerCase().includes(search);

    const matchesType =
      typeFilter === 'All' || ticket.ticket_type === typeFilter;

    const matchesPriority =
      priorityFilter === 'All' || ticket.priority === priorityFilter;

    const matchesReadiness =
      readinessFilter === 'All' || ticket.readiness_status === readinessFilter;

    return matchesSearch && matchesType && matchesPriority && matchesReadiness;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setPriorityFilter('All');
    setReadinessFilter('All');
  };

  return (
    <>
      <header className="page-header">
        <h1>Ticket Readiness & Change Impact</h1>

        <p>Assess development ticket readiness and software change impact.</p>
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
          <div>
            <h2>Recent Tickets</h2>

            <span className="ticket-count">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </span>
          </div>

          <button onClick={onRefresh}>Refresh</button>
        </div>

        <TicketFilters
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          priorityFilter={priorityFilter}
          readinessFilter={readinessFilter}
          onSearchChange={setSearchTerm}
          onTypeChange={setTypeFilter}
          onPriorityChange={setPriorityFilter}
          onReadinessChange={setReadinessFilter}
          onClearFilters={clearFilters}
        />

        {loading && <p>Loading tickets...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket Ref</th>

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
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8">No tickets match the current filters.</td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const { Icon, label } = getTicketTypeMeta(
                      ticket.ticket_type
                    );

                    const ticketReady = ticket.readiness_status === 'READY';

                    return (
                      <tr key={ticket.id}>
                        <td className="jira-ref">{ticket.jira_reference}</td>

                        <td>{ticket.title}</td>

                        <td>
                          <span className="ticket-type-badge">
                            <Icon size={16} strokeWidth={2} />

                            {label}
                          </span>
                        </td>

                        <td>
                          <span className={getPriorityClass(ticket.priority)}>
                            {ticket.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${ticket.readiness_status
                              .toLowerCase()
                              .replaceAll(' ', '-')}`}
                          >
                            {ticket.readiness_status}
                          </span>
                        </td>

                        <td>{ticket.readiness_score}%</td>

                        <td>
                          {ticketReady && canAssessTickets ? (
                            <button
                              className="table-action-button"
                              onClick={() => onImpact(ticket)}
                            >
                              Assess Impact
                            </button>
                          ) : (
                            <span className="disabled-action">
                              {ticketReady ? 'No Permission' : 'Not Ready'}
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            className="history-button"
                            onClick={() => onHistory(ticket)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default Dashboard;
