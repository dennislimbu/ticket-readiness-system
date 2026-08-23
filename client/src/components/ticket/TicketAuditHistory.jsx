import { Activity, MessageSquare, Pencil, PlusCircle } from 'lucide-react';

const formatFieldName = (fieldName) => {
  if (!fieldName) {
    return '';
  }

  return fieldName
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getActivityIcon = (action) => {
  if (action === 'CREATED') {
    return PlusCircle;
  }

  if (action === 'COMMENT_ADDED') {
    return MessageSquare;
  }

  if (action === 'UPDATED') {
    return Pencil;
  }

  return Activity;
};

function TicketAuditHistory({ auditEntries, loading, error }) {
  return (
    <div className="ticket-details-card">
      <div className="ticket-card-heading">
        <div>
          <h2>Activity</h2>

          <p>Track who changed what and when.</p>
        </div>

        <Activity size={20} />
      </div>

      {loading && <p className="ticket-loading-text">Loading activity...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && auditEntries.length === 0 && (
        <div className="ticket-empty-state">
          No activity has been recorded yet.
        </div>
      )}

      {!loading && !error && auditEntries.length > 0 && (
        <div className="activity-timeline">
          {auditEntries.map((entry) => {
            const Icon = getActivityIcon(entry.action);

            return (
              <article className="activity-entry" key={entry.id}>
                <div className="activity-icon">
                  <Icon size={15} />
                </div>

                <div className="activity-content">
                  <div className="activity-top-row">
                    <div>
                      <strong>{entry.username}</strong>

                      {entry.user_role && (
                        <span className="activity-role">{entry.user_role}</span>
                      )}
                    </div>

                    <time>{new Date(entry.created_at).toLocaleString()}</time>
                  </div>

                  {entry.action === 'CREATED' && (
                    <p>
                      Created ticket <strong>{entry.new_value}</strong>
                    </p>
                  )}

                  {entry.action === 'COMMENT_ADDED' && <p>Added a comment.</p>}

                  {entry.action === 'UPDATED' && (
                    <div>
                      <p>
                        Updated{' '}
                        <strong>{formatFieldName(entry.field_name)}</strong>
                      </p>

                      <div className="activity-change">
                        <div>
                          <span>Previous</span>

                          <p>{entry.old_value || 'Empty'}</p>
                        </div>

                        <div>
                          <span>New</span>

                          <p>{entry.new_value || 'Empty'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TicketAuditHistory;
