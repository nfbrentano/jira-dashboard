import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FieldMappingConfig {
  storyPointsField: string;
  peIssueTypes: string[];
  busIssueTypes: string[];
  statusMapping: {
    inProgress: string[];
    done: string[];
    qa: string[];
    blocked: string[];
  };
}

export const DEFAULT_FIELD_MAPPING: FieldMappingConfig = {
  storyPointsField: 'customfield_10016',
  peIssueTypes: ['Epic', 'Épico', 'PE'],
  busIssueTypes: ['Story', 'História', 'Bug', 'Task', 'Tarefa', 'BUS'],
  statusMapping: {
    inProgress: ['In Progress', 'Em andamento', 'Doing'],
    done: ['Done', 'Concluído', 'Resolvido'],
    qa: ['QA', 'In QA', 'Test', 'Testing'],
    blocked: ['Blocked', 'Impedido']
  }
};

interface FieldMappingStore {
  config: FieldMappingConfig;
  updateConfig: (newConfig: Partial<FieldMappingConfig>) => void;
  resetConfig: () => void;
}

export const useFieldMappingStore = create<FieldMappingStore>()(
  persist(
    (set) => ({
      config: DEFAULT_FIELD_MAPPING,
      updateConfig: (newConfig) => set((state) => ({ 
        config: { ...state.config, ...newConfig } 
      })),
      resetConfig: () => set({ config: DEFAULT_FIELD_MAPPING }),
    }),
    {
      name: 'jira-field-mapping-storage',
    }
  )
);
