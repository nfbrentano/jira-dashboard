import React, { useMemo } from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const WipLimitsView: React.FC = () => {
  const { data, isLoading } = useIssuesQuery();

  const wipData = useMemo(() => {
    if (!data?.issues) return [];
    
    // Filtra apenas itens em andamento
    const inProgressIssues = data.issues.filter(
      issue => issue.fields?.status?.statusCategory?.key === 'indeterminate'
    );

    const wipByAssignee: Record<string, { count: number, name: string, avatar?: string }> = {};
    
    inProgressIssues.forEach(issue => {
      const assigneeName = issue.fields?.assignee?.displayName || 'Unassigned';
      const assigneeAvatar = issue.fields?.assignee?.avatarUrls?.['48x48'];
      
      if (!wipByAssignee[assigneeName]) {
        wipByAssignee[assigneeName] = { count: 0, name: assigneeName, avatar: assigneeAvatar };
      }
      wipByAssignee[assigneeName].count += 1;
    });

    return Object.values(wipByAssignee).sort((a, b) => b.count - a.count);
  }, [data?.issues]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">Loading limits...</div>;
  }

  // Define limite = 1 tarefa In Progress por pessoa (regra estabelecida no plano)
  const WIP_LIMIT = 1;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text-main">WIP Limits (Limite: {WIP_LIMIT})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {wipData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-text-muted italic">
            Ninguém está trabalhando em tarefas agora.
          </div>
        ) : (
          wipData.map((person) => {
            const isOverLimit = person.count > WIP_LIMIT;
            
            return (
              <div 
                key={person.name} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isOverLimit 
                    ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' 
                    : 'bg-background border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {person.avatar ? (
                    <img src={person.avatar} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <span className={`font-medium text-sm ${isOverLimit ? 'text-rose-700 dark:text-rose-300' : 'text-text-main'}`}>
                    {person.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-text-main'}`}>
                    {person.count}
                  </span>
                  {isOverLimit ? (
                    <AlertCircle size={20} className="text-rose-500" />
                  ) : (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
