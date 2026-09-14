import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { SectorialData } from '../../store/sectorMetricsStore';
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  data: SectorialData;
}

export const StrategicExecutionChart: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'Previsto', value: data.pe.previsto, color: '#3b82f6' }, // blue
    { name: 'Executado', value: data.pe.executado, color: '#10b981' }, // emerald
    { name: 'Cancelado', value: data.pe.cancelado, color: '#94a3b8' }, // gray
  ];

  const percent = data.pe.agregado;
  const isOk = percent >= 100;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[440px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Target size={16} />
            </span>
            <h3 className="font-semibold text-text-main text-base">Planejamento Estratégico (PE)</h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Meta: {data.pe.targetDescription}
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
          isOk
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
        }`}>
          {isOk ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span className="font-bold text-sm">{percent}% de Execução</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Progresso do Previsto ({data.pe.executado} de {data.pe.previsto})</span>
          <span className="font-semibold text-text-main">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOk ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Bar Chart breakdown */}
      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
              }}
              formatter={(val) => [`${val} itens`, 'Quantidade']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
