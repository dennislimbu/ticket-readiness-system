import { Search, RotateCcw } from 'lucide-react';

function TicketFilters({
  searchTerm,
  typeFilter,
  priorityFilter,
  readinessFilter,
  onSearchChange,
  onTypeChange,
  onPriorityChange,
  onReadinessChange,
  onClearFilters,
}) {
  return (
    <div className="ticket-filters">
      <div className="filter-search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search by ticket reference or title..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <select
        value={typeFilter}
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="All">All Types</option>
        <option value="Bug">Bug</option>
        <option value="Feature">Feature</option>
        <option value="Change">Change</option>
        <option value="Investigation">Investigation</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value)}
      >
        <option value="All">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

      <select
        value={readinessFilter}
        onChange={(event) => onReadinessChange(event.target.value)}
      >
        <option value="All">All Readiness</option>
        <option value="READY">Ready</option>
        <option value="NOT READY">Not Ready</option>
        <option value="NOT ASSESSED">Pending</option>
      </select>

      <button
        type="button"
        className="clear-filter-button"
        onClick={onClearFilters}
      >
        <RotateCcw size={15} />
        Clear
      </button>
    </div>
  );
}

export default TicketFilters;
