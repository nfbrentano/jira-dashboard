import React from 'react';
import type { SectorialData } from '../../store/sectorMetricsStore';
import { useFilterStore } from '../../store/filterStore';
import { useProjects } from '../../hooks/useIssuesQuery';
import { Check, X, Info } from 'lucide-react';

interface SectorMetricsTableProps {
  data: SectorialData;
  isLive?: boolean;
  onEditClick?: () => void;
}

export const SectorMetricsTable: React.FC<SectorMetricsTableProps> = ({
  data,
  isLive = false,
  onEditClick,
}) => {
  const { projectKey } = useFilterStore();
  const { data: projects } = useProjects();
  const currentProject = projects?.find((p) => p.key === projectKey);
  const projectName = currentProject ? currentProject.name : projectKey || null;

  // Checks for goal achievement
  const isPeAchieved = data.pe.agregado >= 100;
  const isBusAchieved = data.bus.emExecucaoPico <= data.bus.maxLimit;
  const isWipAchieved = data.wip.emExecucaoMediaDev <= data.wip.maxLimitPerDev;

  const monthColLabel = data.monthYear.includes('/')
    ? `${data.monthYear.split('/')[0].trim().slice(0, 3)}/${data.monthYear.split('/')[1]?.trim().slice(-2) || ''}`
    : data.monthYear;

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Header section identical to the image */}
      <div className="p-6 border-b border-border/60 bg-gradient-to-r from-surface to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Indicadores Setoriais{projectName ? ` — ${projectName}` : ''} — {data.monthYear}
            </h2>
            {isLive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                Ao Vivo (Jira)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Consolidado
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1 font-medium">
            {data.statusDescription}
          </p>
        </div>

        {onEditClick && (
          <button
            onClick={onEditClick}
            className="self-start md:self-auto px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-surface text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Editar Valores / Metas</span>
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-900/40 text-text-main font-semibold text-sm">
              <th className="py-3 px-4 sm:px-6 w-[35%]">Nome do indicador</th>
              <th className="py-3 px-4 sm:px-6 w-[35%]">Meta</th>
              <th className="py-3 px-4 sm:px-6 w-[20%] text-left">Detalhamento</th>
              <th className="py-3 px-4 sm:px-6 w-[10%] text-right">{monthColLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-text-main">
            {/* INDICADOR 1: Taxa de Cumprimento do Planejamento Estratégico (PE) */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td rowSpan={4} className="py-4 px-4 sm:px-6 align-top font-bold text-text-main border-r border-border/40">
                <div className="flex flex-col gap-1">
                  <span>Taxa de Cumprimento do Planejamento Estratégico (PE)</span>
                  <span className="text-xs font-normal text-text-muted">Metas de entrega do Quarter</span>
                </div>
              </td>
              <td rowSpan={4} className="py-4 px-4 sm:px-6 align-top text-text-muted border-r border-border/40">
                <div className="text-sm text-text-main font-medium">
                  {data.pe.targetDescription}
                </div>
              </td>
              <td className="py-2.5 px-4 sm:px-6 text-text-muted">Previsto</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-medium">{data.pe.previsto}</td>
            </tr>
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td className="py-2.5 px-4 sm:px-6 text-text-muted">Executado</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-medium">{data.pe.executado}</td>
            </tr>
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td className="py-2.5 px-4 sm:px-6 text-text-muted">Cancelado</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-medium">{data.pe.cancelado}</td>
            </tr>
            <tr className="bg-slate-50/60 dark:bg-slate-900/30 font-bold border-b-2 border-border/80">
              <td className="py-3 px-4 sm:px-6 text-text-main">Agregado</td>
              <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <span>{data.pe.agregado}%</span>
                  {isPeAchieved ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </td>
            </tr>

            {/* INDICADOR 2: Limite de Concorrência de Chamados Interdepartamentais (Bus) */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td rowSpan={2} className="py-4 px-4 sm:px-6 align-top font-bold text-text-main border-r border-border/40">
                <div className="flex flex-col gap-1">
                  <span>Limite de Concorrência de Chamados Interdepartamentais (Bus)</span>
                  <span className="text-xs font-normal text-text-muted">Teto simultâneo de demandas internas</span>
                </div>
              </td>
              <td rowSpan={2} className="py-4 px-4 sm:px-6 align-top text-text-muted border-r border-border/40">
                <div className="text-sm text-text-main font-medium">
                  {data.bus.targetDescription}
                </div>
              </td>
              <td className="py-2.5 px-4 sm:px-6 text-text-muted">Abertos no mês</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-medium">{data.bus.abertosNoMes}</td>
            </tr>
            <tr className="bg-slate-50/60 dark:bg-slate-900/30 font-bold border-b-2 border-border/80">
              <td className="py-3 px-4 sm:px-6 text-text-main">Em execução (pico)</td>
              <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <span>{data.bus.emExecucaoPico}</span>
                  {isBusAchieved ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </td>
            </tr>

            {/* INDICADOR 3: Limite de Trabalho em Andamento (WIP) por Desenvolvedor */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td rowSpan={3} className="py-4 px-4 sm:px-6 align-top font-bold text-text-main border-r border-border/40">
                <div className="flex flex-col gap-1">
                  <span>Limite de Trabalho em Andamento (WIP) por Desenvolvedor</span>
                  <span className="text-xs font-normal text-text-muted">Carga individual de foco e vazão</span>
                </div>
              </td>
              <td rowSpan={3} className="py-4 px-4 sm:px-6 align-top text-text-muted border-r border-border/40">
                <div className="text-sm text-text-main font-medium">
                  {data.wip.targetDescription}
                </div>
              </td>
              <td className="py-2.5 px-4 sm:px-6 text-text-muted">Abertas no mês</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-medium">{data.wip.abertasNoMes}</td>
            </tr>
            <tr className="bg-slate-50/60 dark:bg-slate-900/30 font-bold">
              <td className="py-3 px-4 sm:px-6 text-text-main">Em execução (média/dev)</td>
              <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <span>{data.wip.emExecucaoMediaDev.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {isWipAchieved ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
              <td className="py-2.5 px-4 sm:px-6 text-text-muted italic">Base do cálculo</td>
              <td className="py-2.5 px-4 sm:px-6 text-right text-text-muted italic">{data.wip.baseCalculo}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="p-4 bg-background/50 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Info size={14} className="text-blue-500" />
          <span>Legenda: ✓ Meta atingida no período &nbsp;|&nbsp; ✕ Meta não atingida / Atenção necessária</span>
        </div>
        <span>{projectName ? `${projectName} — Gestão Setorial` : 'Gestão Setorial & Entregas'}</span>
      </div>
    </div>
  );
};
