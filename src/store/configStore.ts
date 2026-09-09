import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  jiraDomain: string;
  email: string;
  apiToken: string;
  corsProxy: string;
  setConfig: (config: Partial<ConfigState>) => void;
  clearConfig: () => void;
  isConfigured: () => boolean;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      jiraDomain: '',
      email: '',
      apiToken: '',
      corsProxy: '/jira-proxy/', // Use Vite's built-in dev proxy (no external service needed)
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      clearConfig: () => set({ jiraDomain: '', email: '', apiToken: '', corsProxy: '' }),
      isConfigured: () => {
        const { jiraDomain, email, apiToken } = get();
        return !!(jiraDomain && email && apiToken);
      },
    }),
    {
      name: 'jira-dashboard-config',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as ConfigState;
        if (version === 0 && state.corsProxy?.includes('cors-anywhere')) {
          // Migrate away from cors-anywhere to Vite's built-in proxy
          return { ...state, corsProxy: '/jira-proxy/' };
        }
        return state;
      },
    }
  )
);
