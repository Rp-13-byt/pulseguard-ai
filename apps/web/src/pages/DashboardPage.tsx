import React from 'react';
import { KPICards } from '../components/KPICards';
import { EventSimulatorBar } from '../components/EventSimulatorBar';
import { LiveEventFeed } from '../components/LiveEventFeed';
import { StreamEventItem } from '../hooks/useEventStream';
import { ShieldCheck, Play, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProposedIntervention } from '../types';

interface DashboardPageProps {
  kpis?: any;
  events: StreamEventItem[];
  interventions: ProposedIntervention[];
  onOpenWalkthrough: () => void;
  onSelectCustomer: (id: number) => void;
  onRefreshData: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  events,
  interventions,
  onOpenWalkthrough,
  onSelectCustomer,
  onRefreshData,
}) => {
  const pendingInterventions = interventions.filter((i) => i.status === 'PENDING').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Hackathon Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-800/80 bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                CONFLUENT AI HACKATHON
              </span>
              <span className="text-xs text-gray-400 font-mono">End-to-End Streaming Architecture</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              PulseGuard AI — Real-Time Customer Retention Agent
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl font-mono">
              Continuous event processing pipeline reacting to customer behavior in seconds:
              <span className="text-cyan-300"> PostgreSQL CDC V2 & Telemetry</span> → 
              <span className="text-cyan-300"> Kafka Topics</span> → 
              <span className="text-cyan-300"> Flink Rolling 360 Aggregations</span> → 
              <span className="text-cyan-300"> Deterministic Risk Engine</span> → 
              <span className="text-cyan-300"> Claude AI Reasoning</span> → 
              <span className="text-cyan-300"> Governed Action Gate</span>
            </p>
          </div>

          <button
            onClick={onOpenWalkthrough}
            className="shrink-0 inline-flex items-center px-5 py-3 text-sm font-bold tracking-wide text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500"
          >
            <Play className="h-4 w-4 mr-2 fill-current" />
            RUN CHURN SCENARIO
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <KPICards kpis={kpis} />

      {/* Interactive Telemetry Bar for Judges */}
      <EventSimulatorBar onEventFired={onRefreshData} selectedCustomerId={1017} />

      {/* Main Grid: Live Event Feed & Active Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Event Stream (7 Columns) */}
        <div className="lg:col-span-7">
          <LiveEventFeed events={events} onSelectCustomer={onSelectCustomer} />
        </div>

        {/* Governed Decision Queue & Hero Customer Spotlight (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hero Account Snapshot (Acme Global) */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-mono font-semibold text-cyan-400">HERO DEMO ACCOUNT</span>
              <button
                onClick={() => onSelectCustomer(1017)}
                className="text-xs text-gray-400 hover:text-cyan-300 font-mono flex items-center"
              >
                View 360 <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Acme Global (Customer 1017)</h4>
                <div className="text-xs text-gray-400 font-mono">Enterprise Plan • $3,450/mo MRR</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Renewal Window</span>
                <div className="text-sm font-bold text-cyan-400 font-mono">In 8 Days</div>
              </div>
            </div>
          </div>

          {/* Pending Interventions Awaiting Human Authorization */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  GOVERNED INTERVENTIONS AWAITING APPROVAL
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {pendingInterventions.length} Pending
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {pendingInterventions.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-gray-500">
                  No interventions awaiting human approval. Trigger a churn scenario or usage drop to see the governed policy engine in action.
                </div>
              ) : (
                pendingInterventions.map((intv) => (
                  <div
                    key={intv.intervention_id}
                    className="p-3 rounded-lg border border-cyan-900/50 bg-gray-950/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">
                        Customer {intv.customer_id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
                        Risk Score: {intv.risk_score} (CRITICAL)
                      </span>
                    </div>
                    <div className="text-gray-300 font-medium">{intv.recommended_action}</div>
                    <p className="text-gray-400 font-mono text-[11px] line-clamp-2">
                      {intv.reasoning}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-gray-800/80">
                      <span className="text-[10px] font-mono text-cyan-400">
                        Policy: {intv.policy_name}
                      </span>
                      <button
                        onClick={() => onSelectCustomer(intv.customer_id)}
                        className="text-xs text-cyan-400 hover:underline font-mono"
                      >
                        Review in Decisions →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
