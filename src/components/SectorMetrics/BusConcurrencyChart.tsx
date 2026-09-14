import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import type { SectorialData } from '../../store/sectorMetricsStore';
import { HelpCircle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface Props {
  data: SectorialData;
}

export const BusConcurrencyChart: React.FC<Props> = ({ data }) => {
  const isOk = data.bus.emExecucaoPico <= data.bus.maxLimit;

  const chartData = [
    { name: 'Meta Máx', value: data.bus.maxLimit, color: '#10b981' }, // green limit
    { name: 'Pico em Execução', value: data.bus.emExecucaoPico, color: isOk ? '#10b981' : '#f43f5e' }, // rose or green
    { name: 'Abertos no Mês', value: data.bus.abertosNoMes, color: '#6366f1' }, // indigo
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[440px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <HelpCircle size={16} />
            </span>
            <h3 className="font-semibold text-text-main text-base">Chamados Interdepartamentais (Bus)</h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Meta: {data.bus.targetDescription}
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
          isOk
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
        }`}>
          {isOk ? <CheckCircle2 size={16} /> : <AlertOctagon size={16} />}
          <span className="font-bold text-sm">Pico: {data.bus.emExecucaoPico} (Teto: {data.bus.maxLimit})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 bg-background rounded-lg border border-border">
          <span className="text-xs text-text-muted block">Abertos no Mês</span>
          <span className="text-xl font-bold text-text-main">{data.bus.abertosNoMes} chamados</span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-border">
          <span className="text-xs text-text-muted block">Excesso Concorrente</span>
          <span className={`text-xl font-bold ${data.bus.emExecucaoPico > data.bus.maxLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
            {data.bus.emExecucaoPico > data.bus.maxLimit ? `+${data.bus.emExecucaoPico - data.bus.maxLimit} acima` : 'Em conformidade'}
          </span>
        </div>
      </div>

      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} interval={0} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
              }}
              formatter={(val) => [`${val} chamados`, 'Valor']}
            />
            <ReferenceLine y={data.bus.maxLimit} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Teto: ${data.bus.maxLimit}`, fill: '#10b981', fontSize: 11, position: 'top' }} />
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
