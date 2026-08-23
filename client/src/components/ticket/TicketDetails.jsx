import { ArrowLeft, Edit3, History, CalendarDays } from 'lucide-react';

import { getPriorityClass, getTicketTypeMeta } from '../../utils/ticketUI';

import TicketEditForm from './TicketEditForm';
import TicketComments from './TicketComments';
import TicketAuditHistory from './TicketAuditHistory';

function TicketDetails({
  ticket,
  canEditTicket,
  editMode,
  editForm,
  editSaving,
  editError,
  comments,
  commentsLoading,
  commentPosting,
  commentError,
  auditEntries,
  auditLoading,
  auditError,
  onBack,
  onEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onAddComment,
  onAssessmentHistory,
}) {
  if (!ticket) {
    return null;
  }

  const { Icon, label } = getTicketTypeMeta(ticket.ticket_type);

  return (
    <>
      <header className="ticket-details-header">
        <button className="ticket-back-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="ticket-details-title-row">
          <div>
            <span className="ticket-details-reference">
              {ticket.jira_reference}
            </span>

            <h1>{ticket.title}</h1>
          </div>

          {canEditTicket && !editMode && (
            <button className="ticket-edit-button" onClick={onEdit}>
              <Edit3 size={16} />
              Edit Ticket
            </button>
          )}
        </div>

        <div className="ticket-meta-row">
          <span className="ticket-type-badge">
            <Icon size={16} strokeWidth={2} />

            {label}
          </span>

          <span className={getPriorityClass(ticket.priority)}>
            {ticket.priority}
          </span>

          <span
            className={`status ${ticket.readiness_status
              .toLowerCase()
              .replaceAll(' ', '-')}`}
          >
            {ticket.readiness_status}
          </span>

          <span className="ticket-score-pill">
            Readiness {ticket.readiness_score}%
          </span>
        </div>
      </header>

      {editMode ? (
        <TicketEditForm
          form={editForm}
          saving={editSaving}
          error={editError}
          onChange={onEditChange}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      ) : (
        <div className="ticket-details-layout">
          <section className="ticket-details-main">
            <div className="ticket-details-card">
              <h2>Ticket Description</h2>

              <p className="ticket-description">
                {ticket.description || 'No description has been provided.'}
              </p>
            </div>

            <TicketComments
              comments={comments}
              loading={commentsLoading}
              posting={commentPosting}
              error={commentError}
              onAddComment={onAddComment}
            />

            <TicketAuditHistory
              auditEntries={auditEntries}
              loading={auditLoading}
              error={auditError}
            />
          </section>

          <aside className="ticket-details-side">
            <div className="ticket-details-card">
              <h2>Ticket Information</h2>

              <div className="ticket-info-list">
                <div className="ticket-info-row">
                  <span>Reference</span>

                  <strong>{ticket.jira_reference}</strong>
                </div>

                <div className="ticket-info-row">
                  <span>Type</span>

                  <strong>{ticket.ticket_type}</strong>
                </div>

                <div className="ticket-info-row">
                  <span>Priority</span>

                  <strong>{ticket.priority}</strong>
                </div>

                <div className="ticket-info-row">
                  <span>Readiness</span>

                  <strong>{ticket.readiness_status}</strong>
                </div>

                <div className="ticket-info-row">
                  <span>Score</span>

                  <strong>{ticket.readiness_score}%</strong>
                </div>

                <div className="ticket-info-row">
                  <span>Created</span>

                  <strong className="ticket-date-value">
                    <CalendarDays size={14} />

                    {new Date(ticket.created_at).toLocaleString()}
                  </strong>
                </div>

                {ticket.updated_at && (
                  <div className="ticket-info-row">
                    <span>Last Updated</span>

                    <strong className="ticket-date-value">
                      <CalendarDays size={14} />

                      {new Date(ticket.updated_at).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <button
              className="ticket-history-link"
              onClick={onAssessmentHistory}
            >
              <History size={16} />
              Assessment History
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

export default TicketDetails;
