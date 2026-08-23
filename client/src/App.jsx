import { useEffect, useState } from 'react';

import { Authenticator } from '@aws-amplify/ui-react';

import { API_BASE_URL } from './apiConfig';

import { authenticatedFetch } from './services/authenticatedFetch';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewAssessment from './components/NewAssessment';
import ImpactAssessment from './components/ImpactAssessment';
import HistoryView from './components/HistoryView';

import './App.css';

function TicketApp({ signOut, user }) {
  const [tickets, setTickets] = useState([]);

  const [view, setView] = useState('dashboard');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    ticket_type: 'Bug',
    priority: 'Medium',
    description: '',
  });

  const [createdTicket, setCreatedTicket] = useState(null);

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

  const [historyTicket, setHistoryTicket] = useState(null);

  const [readinessHistory, setReadinessHistory] = useState([]);

  const [impactHistory, setImpactHistory] = useState([]);

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

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

  const handleReadinessChange = (event) => {
    const { name, checked } = event.target;

    setReadiness((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  const runReadinessAssessment = async () => {
    if (!createdTicket) {
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

  const handleImpactChange = (event) => {
    const { name, type, checked, value } = event.target;

    setImpact((previous) => ({
      ...previous,

      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const runImpactAssessment = async () => {
    if (!selectedTicket) {
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

  const openDashboard = () => {
    setView('dashboard');
    setError('');
    fetchTickets();
  };

  const openNewAssessment = () => {
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

  const openImpactAssessment = (ticket) => {
    setSelectedTicket(ticket);

    resetImpact();

    setError('');
    setView('impact');
  };

  const continueToImpact = () => {
    if (!createdTicket || !readinessResult) {
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

  return (
    <div className="app">
      <Sidebar
        user={user}
        signOut={signOut}
        view={view}
        onDashboard={openDashboard}
        onNewAssessment={openNewAssessment}
      />

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard
            tickets={tickets}
            loading={loading}
            error={error}
            onRefresh={fetchTickets}
            onImpact={openImpactAssessment}
            onHistory={openHistory}
          />
        )}

        {view === 'assessment' && (
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

        {view === 'impact' && (
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
