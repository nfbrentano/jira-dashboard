import React from 'react';
import { useFieldMappingStore } from '../../store/fieldMappingStore';
import { TagInput } from './TagInput';

export const FieldMappingPanel: React.FC = () => {
  const { config, updateConfig, resetConfig } = useFieldMappingStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-main">Mapeamento de Campos e Status</h3>
        <button
          type="button"
          onClick={resetConfig}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Restaurar Padrões
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Campo de Story Points</label>
          <input
            type="text"
            value={config.storyPointsField}
            onChange={(e) => updateConfig({ storyPointsField: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-main focus:outline-hidden focus:border-blue-500"
            placeholder="Ex: customfield_10016"
          />
          <p className="text-xs text-text-muted mt-1">ID do campo customizado que representa os Story Points no seu Jira.</p>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-text-main mb-3">Mapeamento de Issue Types</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Tipos PE (Planejamento Estratégico)</label>
              <TagInput
                tags={config.peIssueTypes}
                onChange={(tags) => updateConfig({ peIssueTypes: tags })}
                placeholder="Ex: Epic, Épico..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Tipos BUS (Sustentação/Business)</label>
              <TagInput
                tags={config.busIssueTypes}
                onChange={(tags) => updateConfig({ busIssueTypes: tags })}
                placeholder="Ex: Story, Bug..."
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-text-main mb-3">Mapeamento de Status</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Status: Em Progresso (In Progress / Doing)</label>
              <TagInput
                tags={config.statusMapping.inProgress}
                onChange={(tags) => updateConfig({ statusMapping: { ...config.statusMapping, inProgress: tags } })}
                placeholder="Ex: In Progress, Em andamento..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Status: Concluído (Done)</label>
              <TagInput
                tags={config.statusMapping.done}
                onChange={(tags) => updateConfig({ statusMapping: { ...config.statusMapping, done: tags } })}
                placeholder="Ex: Done, Concluído..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Status: Testes/QA</label>
              <TagInput
                tags={config.statusMapping.qa}
                onChange={(tags) => updateConfig({ statusMapping: { ...config.statusMapping, qa: tags } })}
                placeholder="Ex: QA, In QA..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Status: Bloqueado (Blocked)</label>
              <TagInput
                tags={config.statusMapping.blocked}
                onChange={(tags) => updateConfig({ statusMapping: { ...config.statusMapping, blocked: tags } })}
                placeholder="Ex: Blocked, Impedido..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
