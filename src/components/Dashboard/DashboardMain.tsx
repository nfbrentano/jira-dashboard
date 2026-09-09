import React from 'react';
import { KPICards } from './KPICards';

export const DashboardMain: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main">Dashboard</h2>
      </div>
      
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-surface border border-border rounded-xl p-4 min-h-[300px]">
          <h3 className="font-semibold mb-4">Status Distribution</h3>
          <p className="text-sm text-text-muted">Chart coming soon...</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 min-h-[300px]">
          <h3 className="font-semibold mb-4">Assignee Distribution</h3>
          <p className="text-sm text-text-muted">Chart coming soon...</p>
        </div>
      </div>
    </div>
  );
};
