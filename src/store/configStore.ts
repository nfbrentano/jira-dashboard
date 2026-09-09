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
      corsProxy: 'https://cors-anywhere.herokuapp.com/?url=', // Default fallback for dev
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      clearConfig: () => set({ jiraDomain: '', email: '', apiToken: '', corsProxy: '' }),
      isConfigured: () => {
        const { jiraDomain, email, apiToken } = get();
        return !!(jiraDomain && email && apiToken);
      },
    }),
    {
      name: 'jira-dashboard-config',
    }
  )
);
