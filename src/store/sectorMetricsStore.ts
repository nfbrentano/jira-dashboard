import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SectorialData {
  id: string; // e.g. "2026-08"
  monthYear: string; // e.g. "Agosto/2026"
  statusDescription: string; // e.g. "Mês fechado. Apuração em 10/09/2026."
  isClosed: boolean;
  isSeeded?: boolean;
  pe: {
    targetDescription: string;
    previsto: number;
    executado: number;
    cancelado: number;
    agregado: number; // percentage
  };
  bus: {
    targetDescription: string;
    maxLimit: number;
    abertosNoMes: number;
    emExecucaoPico: number;
  };
  wip: {
    targetDescription: string;
    maxLimitPerDev: number;
    abertasNoMes: number;
    emExecucaoMediaDev: number;
    baseCalculo: string;
  };
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const formatMonthId = (year: number, month1To12: number): string => {
  return `${year}-${String(month1To12).padStart(2, '0')}`;
};

export const formatMonthLabel = (year: number, month1To12: number): string => {
  const monthName = MONTH_NAMES_PT[month1To12 - 1] || `Mês ${month1To12}`;
  return `${monthName}/${year}`;
};

export const parseMonthId = (id: string): { year: number; month: number; label: string } => {
  const [yStr, mStr] = id.split('-');
  const year = parseInt(yStr, 10) || 2026;
  const month = parseInt(mStr, 10) || 8;
  return { year, month, label: formatMonthLabel(year, month) };
};

export const createDefaultSectorialData = (id: string, customLabel?: string): SectorialData => {
  const parsed = parseMonthId(id);
  const label = customLabel || parsed.label;
  return {
    id,
    monthYear: label,
    statusDescription: `Apuração do período ${label}.`,
    isClosed: false,
    isSeeded: false,
    pe: {
      targetDescription: '≥100% de execução do previsto para o Quarter',
      previsto: 0,
      executado: 0,
      cancelado: 0,
      agregado: 0,
    },
    bus: {
      targetDescription: 'MÁX 8 chamados simultâneos em execução',
      maxLimit: 8,
      abertosNoMes: 0,
      emExecucaoPico: 0,
    },
    wip: {
      targetDescription: '≤2 tasks simultâneas em execução por Dev',
      maxLimitPerDev: 2,
      abertasNoMes: 0,
      emExecucaoMediaDev: 0,
      baseCalculo: 'Campo DEV',
    },
  };
};

export interface SectorMetricsState {
  selectedMonthId: string;
  viewMode: 'closed' | 'live';
  monthsData: Record<string, SectorialData>;
  setSelectedMonth: (id: string) => void;
  setViewMode: (mode: 'closed' | 'live') => void;
  updateMonthData: (id: string, data: Partial<SectorialData>) => void;
  addNewMonth: (newData: SectorialData) => void;
  getOrCreateMonth: (id: string, customLabel?: string) => SectorialData;
  deleteMonth: (id: string) => void;
}


// Migrate legacy storage key if present
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    const legacyData = localStorage.getItem('elevencash-sector-metrics-storage');
    if (legacyData && !localStorage.getItem('sector-metrics-storage')) {
      localStorage.setItem('sector-metrics-storage', legacyData);
    }
  } catch (e) {
    // ignore in case of sandboxed env
  }
}

export const useSectorMetricsStore = create<SectorMetricsState>()(
  persist(
    (set, get) => {
      const currentMonthId = formatMonthId(new Date().getFullYear(), new Date().getMonth() + 1);
      return {
        selectedMonthId: currentMonthId,
        viewMode: 'closed',
        monthsData: {
          [currentMonthId]: createDefaultSectorialData(currentMonthId),
        },
      setSelectedMonth: (id) => {
        const state = get();
        if (!state.monthsData[id]) {
          const newMonth = createDefaultSectorialData(id);
          set((s) => ({
            monthsData: { ...s.monthsData, [id]: newMonth },
            selectedMonthId: id,
          }));
        } else {
          set({ selectedMonthId: id });
        }
      },
      setViewMode: (mode) => set({ viewMode: mode }),
      updateMonthData: (id, partial) =>
        set((state) => {
          const current = state.monthsData[id] || createDefaultSectorialData(id);
          return {
            monthsData: {
              ...state.monthsData,
              [id]: {
                ...current,
                ...partial,
                pe: { ...current.pe, ...(partial.pe || {}) },
                bus: { ...current.bus, ...(partial.bus || {}) },
                wip: { ...current.wip, ...(partial.wip || {}) },
              },
            },
          };
        }),
      addNewMonth: (newData) =>
        set((state) => ({
          monthsData: {
            ...state.monthsData,
            [newData.id]: newData,
          },
          selectedMonthId: newData.id,
        })),
      getOrCreateMonth: (id, customLabel) => {
        const state = get();
        if (state.monthsData[id]) {
          return state.monthsData[id];
        }
        const created = createDefaultSectorialData(id, customLabel);
        set((s) => ({
          monthsData: { ...s.monthsData, [id]: created },
        }));
        return created;
      },
      deleteMonth: (id) =>
        set((state) => {
          const remaining = { ...state.monthsData };
          delete remaining[id];
          const remainingIds = Object.keys(remaining);
          const nextSelected = remainingIds.includes(state.selectedMonthId)
            ? state.selectedMonthId
            : remainingIds[0] || '2026-08';
          return {
            monthsData: remaining,
            selectedMonthId: nextSelected,
          };
        }),
      };
    },
    {
      name: 'sector-metrics-storage',
    }
  )
);
