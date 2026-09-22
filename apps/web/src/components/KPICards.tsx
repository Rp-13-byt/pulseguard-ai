import React from 'react';
import { DollarSign, AlertOctagon, AlertTriangle, ShieldCheck, Zap, Users } from 'lucide-react';

interface KPICardsProps {
  kpis?: {
    total_customers: number;
    active_customers: number;
    watch_customers: number;
    at_risk_customers: number;
    critical_customers: number;
    avg_risk_score: number;
    mrr_exposed: number;
    pending_interventions: number;
    total_interventions_today: number;
  };
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'MRR Exposed',
      value: `$${(kpis?.mrr_exposed ?? 0).toLocaleString()}`,
      sub: 'Sum of HIGH + CRITICAL accounts',
      icon: DollarSign,
      color: 'text-rose-400',
      border: 'border-rose-900/40 hover:border-rose-700/60',
      bg: 'bg-rose-950/10',
    },
    {
      title: 'Critical Churn Risk',
      value: kpis?.critical_customers ?? 0,
      sub: 'Score >= 75 (Immediate action)',
      icon: AlertOctagon,
      color: 'text-rose-400',
      border: 'border-rose-900/40 hover:border-rose-700/60',
      bg: 'bg-rose-950/10',
    },
    {
      title: 'High Risk (Watchlist)',
      value: kpis?.at_risk_customers ?? 0,
      sub: 'Score 50–74 (Nurture trigger)',
      icon: AlertTriangle,
      color: 'text-amber-400',
      border: 'border-amber-900/40 hover:border-amber-700/60',
      bg: 'bg-amber-950/10',
    },
    {
      title: 'Interventions Today',
      value: kpis?.total_interventions_today ?? 0,
      sub: `${kpis?.pending_interventions ?? 0} awaiting approval`,
      icon: ShieldCheck,
      color: 'text-cyan-400',
      border: 'border-cyan-900/40 hover:border-cyan-700/60',
      bg: 'bg-cyan-950/10',
    },
    {
      title: 'Average Churn Score',
      value: `${kpis?.avg_risk_score ?? 0} / 100`,
      sub: 'Deterministic Flink metric',
      icon: Zap,
      color: 'text-blue-400',
      border: 'border-blue-900/40 hover:border-blue-700/60',
      bg: 'bg-blue-950/10',
    },
    {
      title: 'Active Customers Monitored',
      value: kpis?.total_customers ?? 0,
      sub: 'Real-time CDC + Telemetry',
      icon: Users,
      color: 'text-emerald-400',
      border: 'border-emerald-900/40 hover:border-emerald-700/60',
      bg: 'bg-emerald-950/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border bg-gray-900/80 backdrop-blur ${card.border} transition-all duration-200 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{card.title}</span>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-white">{card.value}</div>
            <div className="mt-1 text-[11px] text-gray-400 truncate">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
