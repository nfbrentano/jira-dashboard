import React from 'react';
import { BacklogAgingChart } from './BacklogAgingChart';
import { BacklogTypeChart } from './BacklogTypeChart';

export const BacklogMain: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-text-main">Backlog & Refinamento</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]"><BacklogAgingChart /></div>
        <div className="h-[300px]"><BacklogTypeChart /></div>
      </div>
    </div>
  );
};
