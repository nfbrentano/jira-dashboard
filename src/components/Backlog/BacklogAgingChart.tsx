import React, { useMemo } from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays } from 'date-fns';

export const BacklogAgingChart: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();

  const chartData = useMemo(() => {
    if (!data?.issues) return [];
    
    // Considera apenas itens "new" (To Do)
    const backlogIssues = data.issues.filter(
      issue => issue.fields?.status?.statusCategory?.key === 'new'
    );

    const now = new Date();
    const buckets = {
      '0-7 dias': 0,
      '8-30 dias': 0,
      '31-90 dias': 0,
      '90+ dias': 0
    };

    backlogIssues.forEach(issue => {
      const created = new Date(issue.fields?.created || now);
      const days = differenceInDays(now, created);
      
      if (days <= 7) buckets['0-7 dias']++;
      else if (days <= 30) buckets['8-30 dias']++;
      else if (days <= 90) buckets['31-90 dias']++;
      else buckets['90+ dias']++;
    });

    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [data?.issues]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">Loading aging...</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-text-main mb-4">Idade do Backlog (Aging)</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-main)' }}
              itemStyle={{ color: 'var(--color-text-main)' }}
              cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
            />
            <Bar dataKey="count" name="Tarefas Paradas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
