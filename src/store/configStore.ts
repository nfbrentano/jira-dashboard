import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const isForgeEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.self !== window.top;
};

export interface ConfigState {
  jiraDomain: string;
  email: string;
  apiToken: string;
  corsProxy: string;
  setConfig: (config: Partial<ConfigState>) => void;
  clearConfig: () => void;
  isConfigured: () => boolean;
  isForge: () => boolean;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      jiraDomain: '',
      email: '',
      apiToken: '',
      corsProxy: '/jira-proxy/',
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      clearConfig: () => set({ jiraDomain: '', email: '', apiToken: '', corsProxy: '/jira-proxy/' }),
      isForge: () => isForgeEnvironment(),
      isConfigured: () => {
        if (isForgeEnvironment()) {
          return true;
        }
        const { jiraDomain, email, apiToken } = get();
        return !!(jiraDomain && email && apiToken);
      },
    }),
    {
      name: 'jira-dashboard-config',
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as ConfigState;
        return {
          ...state,
          corsProxy: state.corsProxy && !state.corsProxy.includes('cors-anywhere')
            ? state.corsProxy
            : '/jira-proxy/',
        };
      },
    }
  )
);
