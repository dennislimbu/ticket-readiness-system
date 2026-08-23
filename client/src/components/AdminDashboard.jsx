import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  TicketCheck,
  CircleAlert,
  Clock3,
  Server,
} from 'lucide-react';

import { API_BASE_URL } from '../apiConfig';
import { authenticatedFetch } from '../services/authenticatedFetch';

function AdminDashboard({ tickets, onRefresh }) {
  const [adminData, setAdminData] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [adminError, setAdminError] = useState('');

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

  const criticalTickets = tickets.filter(
    (ticket) => ticket.priority === 'Critical'
  ).length;

  const fetchAdminSummary = async () => {
    try {
      setLoadingAdmin(true);
      setAdminError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/admin/summary`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve admin summary');
      }

      setAdminData(data);
    } catch (error) {
      console.error('Admin dashboard error:', error);

      setAdminError('Unable to retrieve the admin API summary.');
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Administration Dashboard</h1>

        <p>Monitor ticket activity, application access and system health.</p>
      </header>

      <section className="admin-summary-grid">
        <div className="admin-summary-card">
          <div className="admin-card-icon">
            <TicketCheck size={20} />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{totalTickets}</strong>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Ready</span>
            <strong>{readyTickets}</strong>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon">
            <CircleAlert size={20} />
          </div>

          <div>
            <span>Not Ready</span>
            <strong>{notReadyTickets}</strong>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingTickets}</strong>
          </div>
        </div>
      </section>

      <div className="admin-content-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>System Overview</h2>

              <p>Current operational status of the TRCI application.</p>
            </div>

            <button
              className="admin-refresh-button"
              onClick={() => {
                onRefresh();
                fetchAdminSummary();
              }}
            >
              Refresh
            </button>
          </div>

          <div className="admin-system-list">
            <div className="admin-system-row">
              <div>
                <Server size={18} />

                <span>Admin API</span>
              </div>

              <span
                className={`admin-status ${
                  adminError ? 'admin-status-error' : 'admin-status-ok'
                }`}
              >
                {loadingAdmin
                  ? 'Checking...'
                  : adminError
                    ? 'Unavailable'
                    : 'Operational'}
              </span>
            </div>

            <div className="admin-system-row">
              <div>
                <TicketCheck size={18} />

                <span>Ticket Service</span>
              </div>

              <span className="admin-status admin-status-ok">Operational</span>
            </div>

            <div className="admin-system-row">
              <div>
                <CircleAlert size={18} />

                <span>Critical Tickets</span>
              </div>

              <strong>{criticalTickets}</strong>
            </div>
          </div>

          {adminError && <p className="error">{adminError}</p>}

          {adminData && (
            <div className="admin-api-result">
              <strong>Admin API response</strong>

              <p>{adminData.message || 'Admin access confirmed.'}</p>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Role Access Model</h2>

              <p>Application permissions assigned through Cognito groups.</p>
            </div>

            <Users size={21} />
          </div>

          <div className="role-overview-list">
            <div className="role-overview-item">
              <div className="role-title-row">
                <span className="role-dot"></span>

                <strong>Developer</strong>
              </div>

              <p>
                Create tickets, perform readiness assessments and assess change
                impact.
              </p>
            </div>

            <div className="role-overview-item">
              <div className="role-title-row">
                <span className="role-dot"></span>

                <strong>Reviewer</strong>
              </div>

              <p>
                Review existing tickets, inspect history and perform assessment
                activities.
              </p>
            </div>

            <div className="role-overview-item">
              <div className="role-title-row">
                <span className="role-dot"></span>

                <strong>Admin</strong>
              </div>

              <p>
                Full application access plus administrative monitoring and
                system oversight.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
