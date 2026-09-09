import { create } from 'zustand';

interface FilterState {
  projectKey: string;
  sprint: string;
  types: string[];
  epics: string[];
  assignees: string[];
  priorities: string[];
  dateRange: string; // e.g. '30d'
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'clearFilters'>, value: any) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  projectKey: '',
  sprint: 'all',
  types: [],
  epics: [],
  assignees: [],
  priorities: [],
  dateRange: '30d',
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  clearFilters: () => set({
    sprint: 'all',
    types: [],
    epics: [],
    assignees: [],
    priorities: [],
    dateRange: '30d'
  }),
}));
