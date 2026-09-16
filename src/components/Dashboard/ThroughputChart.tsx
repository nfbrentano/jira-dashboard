import React, { useMemo } from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, format, parseISO } from 'date-fns';

export const ThroughputChart: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();

  const chartData = useMemo(() => {
    if (!data?.issues) return [];
    
    // Filtra apenas itens Done
    const doneIssues = data.issues.filter(
      issue => issue.fields?.status?.statusCategory?.key === 'done'
    );

    const countsByWeek: Record<string, { label: string, count: number }> = {};
    
    doneIssues.forEach(issue => {
      // Priorizamos a data real de resolução (resolutiondate), com fallback para updated
      const dateStr = issue.fields?.resolutiondate || issue.fields?.updated;
      if (dateStr) {
        const date = parseISO(dateStr);
        // Agrupa pelo início da semana
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Começa na segunda-feira
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        const weekLabel = format(weekStart, 'dd/MM');
        
        if (!countsByWeek[weekKey]) {
          countsByWeek[weekKey] = { label: weekLabel, count: 0 };
        }
        countsByWeek[weekKey].count += 1;
      }
    });

    // Ordena as chaves de data cronologicamente
    const sortedWeekKeys = Object.keys(countsByWeek).sort();

    return sortedWeekKeys.map(key => ({
      week: countsByWeek[key].label,
      completed: countsByWeek[key].count
    }));
  }, [data?.issues]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">Loading chart...</div>;
  }

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted">No throughput data available</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-text-main mb-4">Throughput (por semana)</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="week" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-main)' }}
              itemStyle={{ color: 'var(--color-text-main)' }}
              cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
            />
            <Bar dataKey="completed" name="Tarefas Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
