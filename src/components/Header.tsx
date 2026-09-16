import React from 'react';
import { useConfigStore, isForgeEnvironment } from '../store/configStore';
import { LayoutDashboard, Moon, Sun, LogOut, ShieldCheck, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { clearConfig, setShowSettings } = useConfigStore();
  
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <header className="h-16 border-b border-border bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <LayoutDashboard size={20} />
        </div>
        <h1 className="text-lg font-semibold text-text-main">Jira Ops Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDark}
          className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors"
          title="Configurações"
        >
          <Settings size={20} />
        </button>
        
        <div className="h-6 w-px bg-border"></div>
        
        {isForgeEnvironment() ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">
            <ShieldCheck size={14} />
            <span>Forge Atlassian Cloud</span>
          </div>
        ) : (
          <button 
            onClick={clearConfig}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        )}
      </div>
    </header>
  );
};
