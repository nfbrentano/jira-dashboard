import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  useSectorMetricsStore,
  type SectorialData,
  createDefaultSectorialData,
} from '../../store/sectorMetricsStore';
import { useIssuesQuery, useProjects } from '../../hooks/useIssuesQuery';
import { useFilterStore } from '../../store/filterStore';
import { useFieldMappingStore } from '../../store/fieldMappingStore';
import { SectorMetricsTable } from './SectorMetricsTable';
import { StrategicExecutionChart } from './StrategicExecutionChart';
import { BusConcurrencyChart } from './BusConcurrencyChart';
import { WipPerDevChart } from './WipPerDevChart';
import { SectorMetricsModal } from './SectorMetricsModal';
import { toPng } from 'html-to-image';
import { Download, Sliders, Sparkles, Calendar, Plus } from 'lucide-react';

export const SectorMetricsMain: React.FC = () => {
  const {
    selectedMonthId,
    viewMode,
    monthsData,
    setSelectedMonth,
    setViewMode,
    updateMonthData,
  } = useSectorMetricsStore();

  const { projectKey } = useFilterStore();
  const { data: projects } = useProjects();
  const currentProject = projects?.find((p) => p.key === projectKey);
  const projectName = currentProject ? currentProject.name : projectKey || null;

  const { data: jiraData } = useIssuesQuery();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMonthData =
    monthsData[selectedMonthId] ||
    monthsData['2026-08'] ||
    createDefaultSectorialData(selectedMonthId || '2026-08');

  // Sorted list of available months for selection
  const sortedMonths = useMemo(() => {
    return Object.values(monthsData).sort((a, b) => b.id.localeCompare(a.id));
  }, [monthsData]);

  const { config: mappingConfig } = useFieldMappingStore();

  // Computes dynamic live calculation based on current Jira issues in filter
  const liveData: SectorialData = useMemo(() => {
    if (!jiraData?.issues || jiraData.issues.length === 0) {
      return currentMonthData;
    }

    const issues = jiraData.issues;

    // 1. PE (Strategic items: mapped in fieldMappingStore)
    const peIssues = issues.filter((i) =>
      mappingConfig.peIssueTypes.some(t => 
        i.fields?.issuetype?.name?.toLowerCase() === t.toLowerCase()
      )
    );
    const peTargetList = peIssues.length > 0 ? peIssues : issues;
    const pePrevisto = peTargetList.length;
    const peExecutado = peTargetList.filter((i) => 
      mappingConfig.statusMapping.done.some(s => 
        i.fields?.status?.name?.toLowerCase() === s.toLowerCase()
      ) || i.fields?.status?.statusCategory?.key === 'done'
    ).length;
    const peCancelado = peTargetList.filter(
      (i) =>
        i.fields?.status?.name?.toLowerCase().includes('cancel') ||
        i.fields?.status?.name?.toLowerCase().includes('descart')
    ).length;
    const peAgregado = pePrevisto > 0 ? Math.round((peExecutado / pePrevisto) * 100) : 0;

    // 2. Bus (Interdepartmental tickets: mapped in fieldMappingStore)
    const busIssues = issues.filter((i) =>
      mappingConfig.busIssueTypes.some(t => 
        i.fields?.issuetype?.name?.toLowerCase() === t.toLowerCase()
      )
    );
    const busList = busIssues.length > 0 ? busIssues : issues;
    const busAbertos = busList.length;
    const busEmExecucao = busList.filter((i) =>
      mappingConfig.statusMapping.inProgress.some(s => 
        i.fields?.status?.name?.toLowerCase() === s.toLowerCase()
      ) || i.fields?.status?.statusCategory?.key === 'indeterminate'
    ).length;

    // 3. WIP Dev
    const inProgressIssues = issues.filter((i) =>
      mappingConfig.statusMapping.inProgress.some(s => 
        i.fields?.status?.name?.toLowerCase() === s.toLowerCase()
      ) || i.fields?.status?.statusCategory?.key === 'indeterminate'
    );
    const assigneesWithTasks = new Set(
      inProgressIssues
        .map((i) => i.fields?.assignee?.displayName)
        .filter(Boolean)
    );
    const activeDevCount = Math.max(assigneesWithTasks.size, 1);
    const wipAvg = Number((inProgressIssues.length / activeDevCount).toFixed(2));

    return {
      ...currentMonthData,
      monthYear: 'Ao Vivo (Jira)',
      statusDescription: `Apuração em tempo real com base em ${issues.length} cards carregados.`,
      isSeeded: true,
      pe: {
        ...currentMonthData.pe,
        previsto: pePrevisto,
        executado: peExecutado,
        cancelado: peCancelado,
        agregado: peAgregado,
      },
      bus: {
        ...currentMonthData.bus,
        abertosNoMes: busAbertos,
        emExecucaoPico: busEmExecucao,
      },
      wip: {
        ...currentMonthData.wip,
        abertasNoMes: issues.length,
        emExecucaoMediaDev: wipAvg,
      },
    };
  }, [jiraData?.issues, currentMonthData, mappingConfig]);

  // Auto-seed empty months with live data
  useEffect(() => {
    if (jiraData?.issues && jiraData.issues.length > 0) {
      if (!currentMonthData.isSeeded && !currentMonthData.isClosed) {
        // Auto seed! (only take the numeric data from liveData, keep original monthYear & description)
        updateMonthData(selectedMonthId, {
          isSeeded: true,
          pe: liveData.pe,
          bus: liveData.bus,
          wip: liveData.wip,
        });
      }
    }
  }, [jiraData?.issues, currentMonthData, liveData, selectedMonthId, updateMonthData]);

  const activeDisplayData = viewMode === 'live' ? liveData : currentMonthData;

  const handleExportPng = async () => {
    if (containerRef.current) {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        const backgroundColor = isDark ? '#0f172a' : '#f8fafc';

        const dataUrl = await toPng(containerRef.current, {
          cacheBust: true,
          backgroundColor,
          style: {
            padding: '24px',
          },
        });
        const link = document.createElement('a');
        const projectSlug = projectName ? `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-` : '';
        link.download = `indicadores-setoriais-${projectSlug}${selectedMonthId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Erro ao exportar imagem PNG', err);
      }
    }
  };

  const handleAddNewPeriod = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" ref={containerRef}>
      {/* Top Bar Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span>Indicadores Setoriais</span>
            {projectName ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                {projectName}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                Gestão Setorial
              </span>
            )}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Acompanhamento de metas estratégicas, vazão de chamados e controle de WIP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month / Period Selector */}
          <div className="bg-surface border border-border px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-xs">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:inline">
              Mês:
            </span>
            <select
              value={selectedMonthId}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-main focus:outline-hidden cursor-pointer"
            >
              {sortedMonths.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.monthYear} {m.isClosed ? '(Consolidado)' : '(Em andamento)'}
                </option>
              ))}
            </select>

            {/* Quick Month / Year Picker */}
            <input
              type="month"
              className="text-xs bg-background border border-border/80 rounded px-1.5 py-0.5 text-text-main hover:border-blue-500 focus:outline-hidden cursor-pointer w-28"
              title="Escolha qualquer outro mês/ano no calendário"
              value={selectedMonthId.match(/^\d{4}-\d{2}$/) ? selectedMonthId : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value);
                }
              }}
            />

            <button
              type="button"
              onClick={handleAddNewPeriod}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 pl-1 border-l border-border/70"
              title="Adicionar ou configurar novo mês"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-surface border border-border p-1 rounded-lg flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('closed')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'closed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Exibir relatório com metas e apuração consolidada"
            >
              {currentMonthData.isClosed ? `Relatório Fechado (${currentMonthData.monthYear})` : `Consolidado (${currentMonthData.monthYear})`}
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'live'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Calcular indicadores em tempo real das issues do Jira"
            >
              <Sparkles size={13} />
              <span>Ao Vivo (Jira)</span>
            </button>
          </div>

          {/* Edit / Configure Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-background text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Configurar metas e valores do período"
          >
            <Sliders size={14} />
            <span>Configurar Metas</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPng}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-background text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Exportar como imagem PNG"
          >
            <Download size={14} />
            <span>Exportar PNG</span>
          </button>
        </div>
      </div>

      {/* Main Sector Metrics Table */}
      <SectorMetricsTable
        data={activeDisplayData}
        isLive={viewMode === 'live'}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Diagnostic & Visual Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-main">
            Diagnóstico Visual dos Indicadores
          </h3>
          <span className="text-xs text-text-muted">
            {viewMode === 'live'
              ? 'Exibindo apuração ao vivo dos cards do Jira'
              : `Exibindo valores consolidados do período: ${currentMonthData.monthYear}`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <StrategicExecutionChart data={activeDisplayData} />
          <BusConcurrencyChart data={activeDisplayData} />
          <WipPerDevChart data={activeDisplayData} isLive={viewMode === 'live'} />
        </div>
      </div>

      {/* Edit / Configure Modal */}
      <SectorMetricsModal
        data={currentMonthData}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          updateMonthData(updated.id, updated);
          setSelectedMonth(updated.id);
        }}
      />
    </div>
  );
};
