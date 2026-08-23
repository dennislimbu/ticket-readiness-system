function Sidebar({ user, signOut, view, onDashboard, onNewAssessment }) {
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

        <button className="logout-button" onClick={signOut}>
          Sign out
        </button>
      </div>

      <nav>
        <button
          className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
          onClick={onDashboard}
        >
          Dashboard
        </button>

        <button
          className={`nav-item ${view === 'assessment' ? 'active' : ''}`}
          onClick={onNewAssessment}
        >
          New Assessment
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
