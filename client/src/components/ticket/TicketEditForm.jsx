import { Save, X } from 'lucide-react';

function TicketEditForm({ form, saving, error, onChange, onSave, onCancel }) {
  return (
    <section className="ticket-edit-card">
      <div className="ticket-edit-heading">
        <div>
          <h2>Edit Ticket</h2>

          <p>
            Update the ticket information below. Changes will be recorded in the
            activity history.
          </p>
        </div>

        <button
          type="button"
          className="ticket-edit-cancel-icon"
          onClick={onCancel}
          disabled={saving}
          aria-label="Cancel editing"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="edit-title">Title</label>

            <input
              id="edit-title"
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-ticket-type">Ticket Type</label>

            <select
              id="edit-ticket-type"
              name="ticket_type"
              value={form.ticket_type}
              onChange={onChange}
            >
              <option value="Bug">Bug</option>

              <option value="Feature">Feature</option>

              <option value="Change">Change</option>

              <option value="Investigation">Investigation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-priority">Priority</label>

            <select
              id="edit-priority"
              name="priority"
              value={form.priority}
              onChange={onChange}
            >
              <option value="Low">Low</option>

              <option value="Medium">Medium</option>

              <option value="High">High</option>

              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="edit-description">Description</label>

          <textarea
            id="edit-description"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="8"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="ticket-edit-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button" disabled={saving}>
            <Save size={16} />

            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default TicketEditForm;
