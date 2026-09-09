import React, { useMemo } from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6', '#f43f5e'];

export const BacklogTypeChart: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();

  const chartData = useMemo(() => {
    if (!data?.issues) return [];
    
    const backlogIssues = data.issues.filter(
      issue => issue.fields?.status?.statusCategory?.key === 'new'
    );
    
    const counts: Record<string, number> = {};
    backlogIssues.forEach(issue => {
      const type = issue.fields?.issuetype?.name || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data?.issues]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">Loading types...</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-text-main mb-4">Composição por Tipo (To Do)</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-main)' }}
              itemStyle={{ color: 'var(--color-text-main)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
