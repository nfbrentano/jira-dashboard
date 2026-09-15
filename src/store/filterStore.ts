import { create } from 'zustand';

import { getLast12Months } from '../utils/dateRange';

const initialMonthId = getLast12Months()[0]?.id || '2026-09';

interface FilterState {
  projectKey: string;
  sprint: string;
  types: string[];
  epics: string[];
  assignees: string[];
  priorities: string[];
  dateRange: string; // e.g. '2026-09' (current month by default) or 'all'
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
  dateRange: initialMonthId,
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  clearFilters: () => set({
    sprint: 'all',
    types: [],
    epics: [],
    assignees: [],
    priorities: [],
    dateRange: initialMonthId,
  }),
}));
