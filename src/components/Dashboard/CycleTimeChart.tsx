import React, { useMemo } from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { differenceInDays, parseISO, format } from 'date-fns';

export const CycleTimeChart: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();

  const chartData = useMemo(() => {
    if (!data?.issues) return { points: [], average: 0 };
    
    // Pega apenas os itens que estão concluídos e têm changelog
    const doneIssues = data.issues.filter(
      issue => issue.fields?.status?.statusCategory?.key === 'done' && issue.changelog
    );

    let totalDays = 0;
    const points: Array<{ id: string, key: string, completionDate: string, displayDate: string, cycleTimeDays: number }> = [];

    doneIssues.forEach(issue => {
      const histories = issue.changelog?.histories || [];
      
      let startWorkDate: Date | null = null;
      let endWorkDate: Date | null = null;

      // Ordena do mais antigo para o mais novo
      const sortedHistories = [...histories].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

      sortedHistories.forEach(history => {
        const hasStatusChange = history.items.find(item => item.field === 'status');
        if (hasStatusChange) {
          const date = new Date(history.created);
          // Primeira transição de status é considerada como o início do trabalho (simplificado)
          if (!startWorkDate) {
            startWorkDate = date;
          }
          // A última transição de status para concluído será capturada se atualizarmos sempre
          endWorkDate = date;
        }
      });

      // Se não tem startWorkDate pelo changelog, podemos usar a data de criação da issue (embora seja Lead Time, não Cycle Time).
      // Para Kanban, melhor ignorar ou aproximar.
      if (!startWorkDate) {
         startWorkDate = new Date(issue.fields.created);
      }
      if (!endWorkDate) {
         endWorkDate = new Date(issue.fields.updated);
      }

      const days = Math.max(differenceInDays(endWorkDate, startWorkDate), 1); // no mínimo 1 dia
      totalDays += days;
      
      points.push({
        id: issue.id,
        key: issue.key,
        completionDate: endWorkDate.toISOString(),
        displayDate: format(endWorkDate, 'dd/MM'),
        cycleTimeDays: days
      });
    });

    // Ordenar pontos por data
    points.sort((a, b) => new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime());

    return {
      points,
      average: points.length > 0 ? Math.round(totalDays / points.length) : 0
    };
  }, [data?.issues]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">Loading cycle time...</div>;
  }

  if (chartData.points.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted">No cycle time data available</div>;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-md text-sm">
          <p className="font-bold text-text-main mb-1">{data.key}</p>
          <p className="text-text-muted">Concluído em: {data.displayDate}</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">Cycle Time: {data.cycleTimeDays} dias</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text-main">Cycle Time</h3>
        <span className="text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
          Média: {chartData.average} dias
        </span>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="displayDate" type="category" allowDuplicatedCategory={false} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis dataKey="cycleTimeDays" type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} name="Dias" />
            <ZAxis range={[100, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Issues" data={chartData.points} fill="#3b82f6" opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
