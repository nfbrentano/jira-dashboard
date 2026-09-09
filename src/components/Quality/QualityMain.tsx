import React from 'react';
import { BugAssigneeChart } from './BugAssigneeChart';
import { BugPriorityChart } from './BugPriorityChart';

export const QualityMain: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-text-main">Qualidade & Saúde de Bugs</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]"><BugAssigneeChart /></div>
        <div className="h-[300px]"><BugPriorityChart /></div>
      </div>
    </div>
  );
};
