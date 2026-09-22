import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatusHeader } from './components/StatusHeader';
import { ChurnScenarioModal } from './components/ChurnScenarioModal';
import { DashboardPage } from './pages/DashboardPage';
import { Customer360Page } from './pages/Customer360Page';
import { RiskPage } from './pages/RiskPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { GovernancePage } from './pages/GovernancePage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { useEventStream } from './hooks/useEventStream';
import { api } from './services/api';
import { SystemHealthSummary, ProposedIntervention } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1017);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealthSummary | undefined>(undefined);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [interventions, setInterventions] = useState<ProposedIntervention[]>([]);

  const { isConnected, events, latestStep, lastRiskUpdate, lastIntervention } = useEventStream();

  const loadData = () => {
    api.fetchHealth().then(setHealth).catch(console.error);
    api.fetchDashboard().then((data) => {
      setDashboardData(data);
      if (data.system_health) setHealth(data.system_health);
    }).catch(console.error);
    api.fetchInterventions().then((data) => {
      setInterventions(data.interventions || []);
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // When a risk update or intervention arrives via SSE, refresh dashboard
  useEffect(() => {
    if (lastRiskUpdate || lastIntervention) {
      loadData();
    }
  }, [lastRiskUpdate, lastIntervention]);

  const handleSelectCustomer = (id: number) => {
    setSelectedCustomerId(id);
    setCurrentTab('customer360');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        isConnected={isConnected}
      />

      {/* Truthful Streaming Component Health Header */}
      <StatusHeader health={health} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardPage
            kpis={dashboardData?.kpis}
            events={events}
            interventions={interventions}
            onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
            onSelectCustomer={handleSelectCustomer}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'customer360' && (
          <Customer360Page
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
          />
        )}

        {currentTab === 'risk' && (
          <RiskPage onSelectCustomer={handleSelectCustomer} />
        )}

        {currentTab === 'interventions' && (
          <InterventionsPage
            interventions={interventions}
            onSelectCustomer={handleSelectCustomer}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'governance' && <GovernancePage />}

        {currentTab === 'observability' && <ObservabilityPage />}
      </main>

      {/* Centerpiece Churn Scenario Walkthrough Modal */}
      <ChurnScenarioModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        latestStep={latestStep}
      />

      {/* Minimal Enterprise Footer */}
      <footer className="border-t border-gray-800/80 py-4 text-center text-xs font-mono text-gray-500">
        PulseGuard AI • Confluent Cloud Kafka & Apache Flink Streaming Pipeline • Built for Confluent AI Hackathon
      </footer>
    </div>
  );
};

export default App;
