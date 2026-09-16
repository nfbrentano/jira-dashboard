import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import type { SectorialData } from '../../store/sectorMetricsStore';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  data: SectorialData;
  isLive?: boolean;
}

export const WipPerDevChart: React.FC<Props> = ({ data, isLive = false }) => {
  const { data: jiraData } = useIssuesQuery();

  // Compute live WIP if live mode is requested and issues exist
  const devDistribution = useMemo(() => {
    if (isLive && jiraData?.issues && jiraData.issues.length > 0) {
      const inProgress = jiraData.issues.filter(
        (i) => i.fields?.status?.statusCategory?.key === 'indeterminate'
      );
      const counts: Record<string, number> = {};
      inProgress.forEach((issue) => {
        const name = issue.fields?.assignee?.displayName || 'Sem atribuição';
        counts[name] = (counts[name] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({
        name,
        tasks: count,
        overLimit: count > data.wip.maxLimitPerDev,
      }));
    }

    return [];
  }, [isLive, jiraData?.issues, data.wip.maxLimitPerDev]);

  const isOk = data.wip.emExecucaoMediaDev <= data.wip.maxLimitPerDev;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[440px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Users size={16} />
            </span>
            <h3 className="font-semibold text-text-main text-base">WIP por Desenvolvedor</h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Meta: {data.wip.targetDescription} ({data.wip.baseCalculo})
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
          isOk
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
        }`}>
          {isOk ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="font-bold text-sm">
            Média: {data.wip.emExecucaoMediaDev.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tasks/dev
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 bg-background rounded-lg border border-border">
          <span className="text-xs text-text-muted block">Tasks Abertas no Mês</span>
          <span className="text-xl font-bold text-text-main">{data.wip.abertasNoMes}</span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-border">
          <span className="text-xs text-text-muted block">Teto Individual Permitido</span>
          <span className="text-xl font-bold text-emerald-600">≤ {data.wip.maxLimitPerDev} simultâneas</span>
        </div>
      </div>

      <div className="h-52 w-full mt-2">
        {devDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={devDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                }}
                formatter={(val) => [`${val} tasks em execução`, 'WIP']}
              />
              <ReferenceLine
                y={data.wip.maxLimitPerDev}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: `Meta: ${data.wip.maxLimitPerDev}`, fill: '#10b981', fontSize: 11, position: 'top' }}
              />
              <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                {devDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.overLimit ? '#f43f5e' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm text-center px-4 bg-background rounded-lg border border-border border-dashed">
            A distribuição por desenvolvedor está disponível apenas no modo "Ao Vivo".
          </div>
        )}
      </div>
    </div>
  );
};
