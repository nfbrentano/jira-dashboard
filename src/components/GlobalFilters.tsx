import React from 'react';
import { useFilterStore } from '../store/filterStore';
import { useProjects } from '../hooks/useIssuesQuery';

export const GlobalFilters: React.FC = () => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { projectKey, sprint, dateRange, setFilter } = useFilterStore();
  const clearFilters = useFilterStore(state => state.clearFilters);

  return (
    <div className="bg-surface border-b border-border p-4 sticky top-16 z-30 flex flex-wrap gap-4 items-center">
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Project</label>
        <select 
          className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          value={projectKey}
          onChange={(e) => setFilter('projectKey', e.target.value)}
          disabled={projectsLoading}
        >
          <option value="">Select a project</option>
          {projects?.map(p => (
            <option key={p.id} value={p.key}>{p.name} ({p.key})</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Sprint</label>
        <select 
          className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sprint}
          onChange={(e) => setFilter('sprint', e.target.value)}
        >
          <option value="all">All Sprints</option>
          <option value="active">Active Sprint</option>
          <option value="future">Future Sprints</option>
        </select>
      </div>

      {/* TODO: Add multi-selects for Types, Epics, Assignees, Priorities */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Date Range</label>
        <select 
          className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateRange}
          onChange={(e) => setFilter('dateRange', e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="ml-auto mt-5">
        <button 
          onClick={clearFilters}
          className="text-sm text-text-muted hover:text-text-main transition-colors"
        >
          🔄 Clear Filters
        </button>
      </div>
    </div>
  );
};
