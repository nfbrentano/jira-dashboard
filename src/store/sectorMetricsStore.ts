import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SectorialData {
  id: string;
  monthYear: string; // e.g. "Agosto/2026"
  statusDescription: string; // e.g. "Mês fechado. Apuração em 10/09/2026."
  isClosed: boolean;
  pe: {
    targetDescription: string;
    previsto: number;
    executado: number;
    cancelado: number;
    agregado: number; // calculated or fixed percentage
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

interface SectorMetricsState {
  selectedMonthId: string;
  viewMode: 'closed' | 'live'; // 'closed' uses official closed data, 'live' calculates from Jira query
  monthsData: Record<string, SectorialData>;
  setSelectedMonth: (id: string) => void;
  setViewMode: (mode: 'closed' | 'live') => void;
  updateMonthData: (id: string, data: Partial<SectorialData>) => void;
  addNewMonth: (newData: SectorialData) => void;
}

const DEFAULT_AGOSTO_2026: SectorialData = {
  id: '2026-08',
  monthYear: 'Agosto/2026',
  statusDescription: 'Mês fechado. Apuração em 10/09/2026.',
  isClosed: true,
  pe: {
    targetDescription: '≥100% de execução do previsto para o Quarter',
    previsto: 17,
    executado: 15,
    cancelado: 0,
    agregado: 88, // 15 / 17 = 88.2%
  },
  bus: {
    targetDescription: 'MÁX 8 chamados simultâneos em execução',
    maxLimit: 8,
    abertosNoMes: 37,
    emExecucaoPico: 31,
  },
  wip: {
    targetDescription: '≤2 tasks simultâneas em execução por Dev',
    maxLimitPerDev: 2,
    abertasNoMes: 239,
    emExecucaoMediaDev: 2.33,
    baseCalculo: 'Campo DEV',
  },
};

export const useSectorMetricsStore = create<SectorMetricsState>()(
  persist(
    (set) => ({
      selectedMonthId: '2026-08',
      viewMode: 'closed',
      monthsData: {
        '2026-08': DEFAULT_AGOSTO_2026,
      },
      setSelectedMonth: (id) => set({ selectedMonthId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      updateMonthData: (id, partial) =>
        set((state) => {
          const current = state.monthsData[id] || DEFAULT_AGOSTO_2026;
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
    }),
    {
      name: 'elevencash-sector-metrics-storage',
    }
  )
);
