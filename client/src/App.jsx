import { useEffect, useState } from 'react';

import { Authenticator } from '@aws-amplify/ui-react';

import { API_BASE_URL } from './apiConfig';

import { authenticatedFetch } from './services/authenticatedFetch';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewAssessment from './components/NewAssessment';
import ImpactAssessment from './components/ImpactAssessment';
import HistoryView from './components/HistoryView';
import AdminDashboard from './components/AdminDashboard';
import TicketDetails from './components/ticket/TicketDetails';

import './App.css';

function TicketApp({ signOut, user }) {
  const [tickets, setTickets] = useState([]);

  const [view, setView] = useState('dashboard');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /*
    Current authenticated user's Cognito groups.
  */
  const [currentUser, setCurrentUser] = useState({
    username: '',
    groups: [],
  });

  /*
    Ticket Details state
  */
  const [detailsTicket, setDetailsTicket] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [editSaving, setEditSaving] = useState(false);

  const [editError, setEditError] = useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    ticket_type: 'Bug',
    priority: 'Medium',
    description: '',
  });

  /*
    Comments state
  */
  const [comments, setComments] = useState([]);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentPosting, setCommentPosting] = useState(false);

  const [commentError, setCommentError] = useState('');

  /*
    Audit history state
  */
  const [auditEntries, setAuditEntries] = useState([]);

  const [auditLoading, setAuditLoading] = useState(false);

  const [auditError, setAuditError] = useState('');

  /*
    New ticket form
  */
  const [form, setForm] = useState({
    title: '',
    ticket_type: 'Bug',
    priority: 'Medium',
    description: '',
  });

  const [createdTicket, setCreatedTicket] = useState(null);

  /*
    Readiness assessment
  */
  const [readiness, setReadiness] = useState({
    has_description: false,
    has_steps_to_reproduce: false,
    has_expected_behaviour: false,
    has_actual_behaviour: false,
    has_environment: false,
    has_acceptance_criteria: false,
    has_priority: false,
  });

  const [readinessResult, setReadinessResult] = useState(null);

  /*
    Impact assessment
  */
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
    rollback_complexity: 'LOW',
  });

  const [impactResult, setImpactResult] = useState(null);

  /*
    Assessment history
  */
  const [historyTicket, setHistoryTicket] = useState(null);

  const [readinessHistory, setReadinessHistory] = useState([]);

  const [impactHistory, setImpactHistory] = useState([]);

  /*
    Retrieve tickets.
  */
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await authenticatedFetch(`${API_BASE_URL}/api/tickets`);

      if (!response.ok) {
        throw new Error('Failed to retrieve tickets');
      }

      const data = await response.json();

      setTickets(data);
    } catch (err) {
      console.error(err);

      setError('Unable to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  /*
    Retrieve authenticated user role/group.
  */
  const fetchCurrentUser = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/me`);

      if (!response.ok) {
        throw new Error('Unable to retrieve user role');
      }

      const data = await response.json();

      setCurrentUser({
        username: data.username || '',
        groups: data.groups || [],
      });
    } catch (err) {
      console.error('User role error:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCurrentUser();
  }, []);

  /*
    Role helpers
  */
  const isDeveloper = currentUser.groups.includes('Developer');

  const isReviewer = currentUser.groups.includes('Reviewer');

  const isAdmin = currentUser.groups.includes('Admin');

  const canCreateTickets = isDeveloper || isAdmin;

  const canEditTickets = isDeveloper || isAdmin;

  const canAssessTickets = isDeveloper || isReviewer || isAdmin;

  /*
    Administration navigation
  */
  const openAdminDashboard = () => {
    if (!isAdmin) {
      setError('Administrator access is required.');
      return;
    }

    setView('admin');
    setError('');
  };

  /*
    New ticket form input
  */
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
    Create ticket
  */
  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (!canCreateTickets) {
      setError('You do not have permission to create tickets.');
      return;
    }

    try {
      setError('');

      const response = await authenticatedFetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      setCreatedTicket(data);

      setReadiness({
        has_description: Boolean(form.description),
        has_steps_to_reproduce: false,
        has_expected_behaviour: false,
        has_actual_behaviour: false,
        has_environment: false,
        has_acceptance_criteria: false,
        has_priority: Boolean(form.priority),
      });

      await fetchTickets();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /*
    Readiness checkbox handler
  */
  const handleReadinessChange = (event) => {
    const { name, checked } = event.target;

    setReadiness((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  /*
    Run readiness assessment
  */
  const runReadinessAssessment = async () => {
    if (!createdTicket || !canAssessTickets) {
      return;
    }

    try {
      setError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/readiness/${createdTicket.id}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(readiness),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Assessment failed');
      }

      setReadinessResult(data.result);

      await fetchTickets();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /*
    Impact form input
  */
  const handleImpactChange = (event) => {
    const { name, type, checked, value } = event.target;

    setImpact((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /*
    Run impact assessment
  */
  const runImpactAssessment = async () => {
    if (!selectedTicket || !canAssessTickets) {
      return;
    }

    try {
      setError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/impact/${selectedTicket.id}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(impact),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impact assessment failed');
      }

      setImpactResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /*
    Dashboard navigation
  */
  const openDashboard = () => {
    setView('dashboard');
    setError('');

    fetchTickets();
  };

  /*
    Retrieve ticket comments
  */
  const fetchTicketComments = async (ticketId) => {
    try {
      setCommentsLoading(true);
      setCommentError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets/${ticketId}/comments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve comments');
      }

      setComments(data);
    } catch (err) {
      console.error('Comments error:', err);

      setCommentError('Unable to retrieve comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  /*
    Retrieve ticket audit history
  */
  const fetchTicketAudit = async (ticketId) => {
    try {
      setAuditLoading(true);
      setAuditError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets/${ticketId}/audit`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve ticket activity');
      }

      setAuditEntries(data);
    } catch (err) {
      console.error('Audit history error:', err);

      setAuditError('Unable to retrieve ticket activity.');
    } finally {
      setAuditLoading(false);
    }
  };

  /*
    Open Ticket Details screen
  */
  const openTicketDetails = async (ticket) => {
    try {
      setDetailsLoading(true);
      setError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets/${ticket.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve ticket details');
      }

      setDetailsTicket(data);

      await Promise.all([
        fetchTicketComments(data.id),
        fetchTicketAudit(data.id),
      ]);

      setEditMode(false);
      setEditError('');

      setView('ticket-details');
    } catch (err) {
      console.error('Ticket details error:', err);

      setError('Unable to retrieve ticket details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
    Add ticket comment
  */
  const addTicketComment = async (comment) => {
    if (!detailsTicket) {
      return false;
    }

    try {
      setCommentPosting(true);
      setCommentError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets/${detailsTicket.id}/comments`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to add comment');
      }

      await Promise.all([
        fetchTicketComments(detailsTicket.id),

        fetchTicketAudit(detailsTicket.id),
      ]);

      return true;
    } catch (err) {
      console.error('Comment posting error:', err);

      setCommentError(err.message || 'Unable to add comment.');

      return false;
    } finally {
      setCommentPosting(false);
    }
  };

  /*
    Open ticket edit mode
  */
  const openTicketEdit = () => {
    if (!detailsTicket || !canEditTickets) {
      return;
    }

    setEditForm({
      title: detailsTicket.title || '',

      ticket_type: detailsTicket.ticket_type || 'Bug',

      priority: detailsTicket.priority || 'Medium',

      description: detailsTicket.description || '',
    });

    setEditError('');
    setEditMode(true);
  };

  /*
    Edit form input
  */
  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
    Cancel ticket edit
  */
  const cancelTicketEdit = () => {
    setEditMode(false);
    setEditError('');
  };

  /*
    Save ticket edit
  */
  const saveTicketEdit = async (event) => {
    event.preventDefault();

    if (!detailsTicket || !canEditTickets) {
      return;
    }

    try {
      setEditSaving(true);
      setEditError('');

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/tickets/${detailsTicket.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update ticket');
      }

      setDetailsTicket(data.ticket);

      await fetchTicketAudit(data.ticket.id);

      setEditMode(false);

      await fetchTickets();
    } catch (err) {
      console.error('Ticket update error:', err);

      setEditError(err.message || 'Unable to update ticket.');
    } finally {
      setEditSaving(false);
    }
  };

  /*
    New assessment navigation
  */
  const openNewAssessment = () => {
    if (!canCreateTickets) {
      setError('You do not have permission to create tickets.');

      return;
    }

    setView('assessment');

    setForm({
      title: '',
      ticket_type: 'Bug',
      priority: 'Medium',
      description: '',
    });

    setCreatedTicket(null);
    setReadinessResult(null);
    setError('');

    setReadiness({
      has_description: false,
      has_steps_to_reproduce: false,
      has_expected_behaviour: false,
      has_actual_behaviour: false,
      has_environment: false,
      has_acceptance_criteria: false,
      has_priority: false,
    });
  };

  /*
    Reset impact form
  */
  const resetImpact = () => {
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
      rollback_complexity: 'LOW',
    });
  };

  /*
    Open impact assessment
  */
  const openImpactAssessment = (ticket) => {
    if (!canAssessTickets) {
      setError('You do not have permission to assess tickets.');

      return;
    }

    setSelectedTicket(ticket);

    resetImpact();

    setError('');

    setView('impact');
  };

  /*
    Continue from readiness into impact
  */
  const continueToImpact = () => {
    if (!createdTicket || !readinessResult || !canAssessTickets) {
      return;
    }

    setSelectedTicket({
      ...createdTicket,

      readiness_status: 'READY',

      readiness_score: readinessResult.score,
    });

    resetImpact();

    setView('impact');
  };

  /*
    Open assessment history
  */
  const openHistory = async (ticket) => {
    try {
      setError('');

      setHistoryTicket(ticket);

      const [readinessResponse, impactResponse] = await Promise.all([
        authenticatedFetch(`${API_BASE_URL}/api/readiness/${ticket.id}`),

        authenticatedFetch(`${API_BASE_URL}/api/impact/${ticket.id}`),
      ]);

      if (!readinessResponse.ok || !impactResponse.ok) {
        throw new Error('Unable to retrieve assessment history');
      }

      const readinessData = await readinessResponse.json();

      const impactData = await impactResponse.json();

      setReadinessHistory(readinessData);

      setImpactHistory(impactData);

      setView('history');
    } catch (err) {
      console.error(err);

      setError('Unable to retrieve assessment history.');
    }
  };

  /*
    Open Assessment History from Ticket Details
  */
  const openDetailsAssessmentHistory = () => {
    if (!detailsTicket) {
      return;
    }

    openHistory(detailsTicket);
  };

  return (
    <div className="app">
      <Sidebar
        user={user}
        signOut={signOut}
        view={view}
        groups={currentUser.groups}
        canCreateTickets={canCreateTickets}
        isAdmin={isAdmin}
        onDashboard={openDashboard}
        onNewAssessment={openNewAssessment}
        onAdminDashboard={openAdminDashboard}
      />

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard
            tickets={tickets}
            loading={loading}
            error={error}
            canAssessTickets={canAssessTickets}
            onRefresh={fetchTickets}
            onImpact={openImpactAssessment}
            onHistory={openHistory}
            onOpenTicket={openTicketDetails}
          />
        )}

        {view === 'ticket-details' && detailsTicket && (
          <TicketDetails
            ticket={detailsTicket}
            canEditTicket={canEditTickets}
            editMode={editMode}
            editForm={editForm}
            editSaving={editSaving}
            editError={editError}
            comments={comments}
            commentsLoading={commentsLoading}
            commentPosting={commentPosting}
            commentError={commentError}
            auditEntries={auditEntries}
            auditLoading={auditLoading}
            auditError={auditError}
            onBack={openDashboard}
            onEdit={openTicketEdit}
            onEditChange={handleEditChange}
            onSaveEdit={saveTicketEdit}
            onCancelEdit={cancelTicketEdit}
            onAddComment={addTicketComment}
            onAssessmentHistory={openDetailsAssessmentHistory}
          />
        )}

        {view === 'ticket-details' && detailsLoading && (
          <p>Loading ticket details...</p>
        )}

        {view === 'admin' && isAdmin && (
          <AdminDashboard tickets={tickets} onRefresh={fetchTickets} />
        )}

        {view === 'assessment' && canCreateTickets && (
          <NewAssessment
            form={form}
            createdTicket={createdTicket}
            readiness={readiness}
            readinessResult={readinessResult}
            error={error}
            onFormChange={handleFormChange}
            onCreateTicket={handleCreateTicket}
            onReadinessChange={handleReadinessChange}
            onRunReadiness={runReadinessAssessment}
            onContinueToImpact={continueToImpact}
            onReturnDashboard={openDashboard}
          />
        )}

        {view === 'impact' && canAssessTickets && (
          <ImpactAssessment
            selectedTicket={selectedTicket}
            impact={impact}
            impactResult={impactResult}
            error={error}
            onImpactChange={handleImpactChange}
            onRunImpact={runImpactAssessment}
            onReturnDashboard={openDashboard}
          />
        )}

        {view === 'history' && (
          <HistoryView
            historyTicket={historyTicket}
            readinessHistory={readinessHistory}
            impactHistory={impactHistory}
            error={error}
            onReturnDashboard={openDashboard}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => <TicketApp signOut={signOut} user={user} />}
    </Authenticator>
  );
}

export default App;
