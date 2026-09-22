import React from 'react';
import { ShieldAlert, Activity, Play, Radio, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenWalkthrough: () => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenWalkthrough,
  isConnected,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard' },
    { id: 'customer360', label: 'Customer 360' },
    { id: 'risk', label: 'Risk Matrix' },
    { id: 'interventions', label: 'Intervention Decisions' },
    { id: 'governance', label: 'Stream Governance' },
    { id: 'observability', label: 'Observability & Metrics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">PulseGuard<span className="text-cyan-400">.AI</span></span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Confluent Native
                </span>
              </div>
              <p className="text-xs text-gray-400">Real-Time Customer Retention & Personalization Agent</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentTab === tab.id
                    ? 'bg-gray-800/90 text-cyan-400 border-b-2 border-cyan-400 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Centerpiece Churn Scenario Trigger & SSE Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-400">
              <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
              <span>{isConnected ? 'LIVE SSE' : 'DISCONNECTED'}</span>
            </div>

            <button
              onClick={onOpenWalkthrough}
              className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold tracking-wide text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              RUN CHURN SCENARIO
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
