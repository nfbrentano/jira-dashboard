import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useConfigStore } from './store/configStore';
import { ConfigForm } from './components/Setup/ConfigForm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalFilters } from './components/GlobalFilters';

import { DashboardMain } from './components/Dashboard/DashboardMain';
import { BacklogMain } from './components/Backlog/BacklogMain';
import { QualityMain } from './components/Quality/QualityMain';

function App() {
  const isConfigured = useConfigStore(state => state.isConfigured());

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text-main flex flex-col">
        {!isConfigured ? (
          <ConfigForm />
        ) : (
          <>
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <GlobalFilters />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<DashboardMain />} />
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
    </BrowserRouter>
  );
}

export default App;
