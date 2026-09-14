import React, { useState, useRef, useMemo } from 'react';
import { useSectorMetricsStore, type SectorialData } from '../../store/sectorMetricsStore';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { SectorMetricsTable } from './SectorMetricsTable';
import { StrategicExecutionChart } from './StrategicExecutionChart';
import { BusConcurrencyChart } from './BusConcurrencyChart';
import { WipPerDevChart } from './WipPerDevChart';
import { SectorMetricsModal } from './SectorMetricsModal';
import { toPng } from 'html-to-image';
import { Download, Sliders, Sparkles } from 'lucide-react';

export const SectorMetricsMain: React.FC = () => {
  const {
    selectedMonthId,
    viewMode,
    monthsData,
    setViewMode,
    updateMonthData,
  } = useSectorMetricsStore();

  const { data: jiraData } = useIssuesQuery();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMonthData = monthsData[selectedMonthId] || monthsData['2026-08'];

  // Computes dynamic live calculation based on current Jira issues in filter
  const liveData: SectorialData = useMemo(() => {
    if (!jiraData?.issues || jiraData.issues.length === 0) {
      return currentMonthData;
    }

    const issues = jiraData.issues;

    // 1. PE (Strategic items: Epics or items with label/components or all resolved vs total)
    const peIssues = issues.filter(
      (i) =>
        i.fields?.issuetype?.name?.toLowerCase().includes('epic') ||
        i.fields?.issuetype?.name?.toLowerCase().includes('iniciativa') ||
        i.fields?.summary?.toLowerCase().includes('[pe]')
    );
    const peTargetList = peIssues.length > 0 ? peIssues : issues;
    const pePrevisto = peTargetList.length;
    const peExecutado = peTargetList.filter(
      (i) => i.fields?.status?.statusCategory?.key === 'done'
    ).length;
    const peCancelado = peTargetList.filter(
      (i) =>
        i.fields?.status?.name?.toLowerCase().includes('cancel') ||
        i.fields?.status?.name?.toLowerCase().includes('descart')
    ).length;
    const peAgregado = pePrevisto > 0 ? Math.round((peExecutado / pePrevisto) * 100) : 0;

    // 2. Bus (Interdepartmental tickets)
    const busIssues = issues.filter(
      (i) =>
        i.fields?.issuetype?.name?.toLowerCase().includes('chamado') ||
        i.fields?.issuetype?.name?.toLowerCase().includes('suporte') ||
        i.fields?.summary?.toLowerCase().includes('bus')
    );
    const busList = busIssues.length > 0 ? busIssues : issues;
    const busAbertos = busList.length;
    const busEmExecucao = busList.filter(
      (i) => i.fields?.status?.statusCategory?.key === 'indeterminate'
    ).length;

    // 3. WIP Dev
    const inProgressIssues = issues.filter(
      (i) => i.fields?.status?.statusCategory?.key === 'indeterminate'
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
  }, [jiraData?.issues, currentMonthData]);

  const activeDisplayData = viewMode === 'live' ? liveData : currentMonthData;

  const handleExportPng = async () => {
    if (containerRef.current) {
      try {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const backgroundColor = isDarkMode ? '#09090b' : '#f8fafc';

        const dataUrl = await toPng(containerRef.current, {
          cacheBust: true,
          backgroundColor,
          style: {
            padding: '24px',
          },
        });
        const link = document.createElement('a');
        link.download = `indicadores-setoriais-${selectedMonthId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Erro ao exportar imagem PNG', err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" ref={containerRef}>
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span>Indicadores Setoriais</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              ElevenCash
            </span>
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Acompanhamento de metas estratégicas, vazão de chamados e controle de WIP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-surface border border-border p-1 rounded-lg flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('closed')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'closed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Relatório Fechado (Ago/2026)
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'live'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Sparkles size={13} />
              <span>Ao Vivo (Jira)</span>
            </button>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-background text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Editar valores e metas da apuração"
          >
            <Sliders size={14} />
            <span>Editar Metas</span>
          </button>

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

      {/* Main Sector Metrics Table matching the image */}
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
            Clique em "Ao Vivo (Jira)" para apurar os dados atuais do projeto selecionado
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <StrategicExecutionChart data={activeDisplayData} />
          <BusConcurrencyChart data={activeDisplayData} />
          <WipPerDevChart data={activeDisplayData} isLive={viewMode === 'live'} />
        </div>
      </div>

      {/* Edit Modal */}
      <SectorMetricsModal
        isOpen={isEditModalOpen}
        data={currentMonthData}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => updateMonthData(selectedMonthId, updated)}
      />
    </div>
  );
};
