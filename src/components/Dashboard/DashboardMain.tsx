import React from 'react';
import { KPICards } from './KPICards';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { useFilterStore } from '../../store/filterStore';
import { useConfigStore } from '../../store/configStore';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { StatusDistributionChart } from './StatusDistributionChart';
import { ThroughputChart } from './ThroughputChart';
import { WipLimitsView } from './WipLimitsView';
import { CycleTimeChart } from './CycleTimeChart';

export const DashboardMain: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();
  const { sprint, setFilter, projectKey } = useFilterStore();
  const jiraDomain = useConfigStore(state => state.jiraDomain);

  const issues = data?.issues || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main">Dashboard</h2>
        {issues.length > 0 && (
          <span className="text-sm text-text-muted bg-surface px-3 py-1 rounded-full border border-border">
            {issues.length} {issues.length === 1 ? 'item' : 'itens'}
          </span>
        )}
      </div>
      
      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]"><StatusDistributionChart /></div>
        <div className="h-[300px]"><ThroughputChart /></div>
        <div className="h-[300px]"><CycleTimeChart /></div>
        <div className="h-[300px]"><WipLimitsView /></div>
      </div>

      {/* Helper notice if no issues found with active sprint */}
      {!isLoading && issues.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <p className="font-semibold text-sm">
              Nenhum item encontrado para o projeto {projectKey || 'selecionado'} {sprint === 'active' ? 'no Sprint Ativo' : ''}.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {sprint === 'active' ? (
                <>
                  Se o projeto não possui uma sprint aberta no momento ou utiliza fluxo Kanban, tente visualizar todas as tarefas.{' '}
                  <button
                    onClick={() => setFilter('sprint', 'all')}
                    className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100 ml-1 cursor-pointer"
                  >
                    Alternar para "All Sprints"
                  </button>
                </>
              ) : (
                'Verifique se o usuário do token tem permissão de leitura nos cards deste projeto no Jira.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-text-main">Tarefas do Projeto</h3>
        </div>

        {issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-text-muted uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-4 py-3">Chave</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Resumo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => {
                  const jiraUrl = jiraDomain
                    ? `https://${jiraDomain}/browse/${issue.key}`
                    : '#';

                  return (
                    <tr key={issue.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        <a
                          href={jiraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {issue.key}
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          {issue.fields?.issuetype?.iconUrl && (
                            <img
                              src={issue.fields.issuetype.iconUrl}
                              alt=""
                              className="w-4 h-4 rounded"
                            />
                          )}
                          {issue.fields?.issuetype?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-main max-w-md truncate" title={issue.fields?.summary}>
                        {issue.fields?.summary || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {issue.fields?.status?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-text-muted">
                        {issue.fields?.priority?.name || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {issue.fields?.assignee ? (
                          <div className="flex items-center gap-2">
                            {issue.fields.assignee.avatarUrls?.['48x48'] && (
                              <img
                                src={issue.fields.assignee.avatarUrls['48x48']}
                                alt=""
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-xs text-text-main">
                              {issue.fields.assignee.displayName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted italic">Não atribuído</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-text-muted text-sm">
            Nenhuma tarefa encontrada com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
};
