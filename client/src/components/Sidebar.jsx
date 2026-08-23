import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Settings,
} from 'lucide-react';

function Sidebar({
  user,
  signOut,
  view,
  groups,
  canCreateTickets,
  isAdmin,
  onDashboard,
  onNewAssessment,
  onAdminDashboard,
}) {
  const role = groups?.length > 0 ? groups[0] : 'Authenticated User';

  return (
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
            'Authenticated user'}
        </strong>

        <div className="role-badge">
          <ShieldCheck size={13} />

          {role}
        </div>

        <button className="logout-button" onClick={signOut}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      <nav>
        <button
          className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
          onClick={onDashboard}
        >
          <LayoutDashboard size={17} />
          Dashboard
        </button>

        {canCreateTickets && (
          <button
            className={`nav-item ${view === 'assessment' ? 'active' : ''}`}
            onClick={onNewAssessment}
          >
            <PlusCircle size={17} />
            New Assessment
          </button>
        )}

        {isAdmin && (
          <button
            className={`nav-item ${view === 'admin' ? 'active' : ''}`}
            onClick={onAdminDashboard}
          >
            <Settings size={17} />
            Administration
          </button>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
