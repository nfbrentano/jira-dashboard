import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useConfigStore } from './store/configStore';
import { ConfigForm } from './components/Setup/ConfigForm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalFilters } from './components/GlobalFilters';

import { DashboardMain } from './components/Dashboard/DashboardMain';
import { SectorMetricsMain } from './components/SectorMetrics/SectorMetricsMain';
import { BacklogMain } from './components/Backlog/BacklogMain';
import { QualityMain } from './components/Quality/QualityMain';

function App() {
  const isConfigured = useConfigStore(state => state.isConfigured());
  const showSettings = useConfigStore(state => state.showSettings);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-text-main flex flex-col">
        {(!isConfigured || showSettings) && <ConfigForm />}
        
        {isConfigured && (
          <>
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <GlobalFilters />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<DashboardMain />} />
                    <Route path="/indicadores" element={<SectorMetricsMain />} />
                    <Route path="/backlog" element={<BacklogMain />} />
                    <Route path="/quality" element={<QualityMain />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </>
        )}
      </div>
    </HashRouter>
  );
}

export default App;
