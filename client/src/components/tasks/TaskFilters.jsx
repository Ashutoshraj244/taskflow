const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['backlog', 'in-progress', 'review', 'completed'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

const TaskFilters = ({ filters, setFilter, resetFilters, activeCount, members = [] }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {/* search */}
    <div className="relative">
      <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className="input pl-7 w-44 h-8 text-xs"
        placeholder="Search tasks..."
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
      />
    </div>

    <select
      className="input h-8 text-xs w-auto pr-7"
      value={filters.status}
      onChange={(e) => setFilter('status', e.target.value)}
    >
      <option value="">All status</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>

    <select
      className="input h-8 text-xs w-auto pr-7"
      value={filters.priority}
      onChange={(e) => setFilter('priority', e.target.value)}
    >
      <option value="">All priority</option>
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </option>
      ))}
    </select>

    <select
      className="input h-8 text-xs w-auto pr-7"
      value={filters.assignedTo}
      onChange={(e) => setFilter('assignedTo', e.target.value)}
    >
      <option value="">All members</option>
      {members.map((m) => (
        <option key={m.user._id} value={m.user._id}>
          {m.user.name}
        </option>
      ))}
    </select>

    <select
      className="input h-8 text-xs w-auto pr-7"
      value={filters.sort}
      onChange={(e) => setFilter('sort', e.target.value)}
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>
          Sort: {s.label}
        </option>
      ))}
    </select>

    {activeCount > 0 && (
      <button
        onClick={resetFilters}
        className="text-xs text-muted hover:text-zinc-300 transition-colors flex items-center gap-1"
      >
        Clear ({activeCount})
      </button>
    )}
  </div>
);

export default TaskFilters;
