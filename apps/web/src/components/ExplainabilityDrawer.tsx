import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { ChurnRiskEvent, Customer360 } from '../types';

interface ExplainabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer360;
  risk?: ChurnRiskEvent;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  isOpen,
  onClose,
  customer,
  risk,
}) => {
  if (!isOpen || !customer || !risk) return null;

  const breakdown = risk.breakdown;

  const pointRows = [
    {
      category: 'Product Telemetry Usage Decline',
      pts: breakdown.usage_decline_pts,
      max: 25,
      detail: `${Math.abs(customer.aggregates.usage_change_percent)}% decline over last 7 days`,
    },
    {
      category: 'Order Inactivity & Purchase Lull',
      pts: breakdown.order_inactivity_pts,
      max: 20,
      detail: `${customer.aggregates.days_since_last_order} days since last completed order`,
    },
    {
      category: 'Support Ticket Negative Sentiment',
      pts: breakdown.negative_sentiment_pts,
      max: 20,
      detail: `Latest sentiment detected as ${customer.aggregates.latest_sentiment}`,
    },
    {
      category: 'Unresolved Support Tickets',
      pts: breakdown.unresolved_tickets_pts,
      max: 15,
      detail: `${customer.aggregates.unresolved_tickets} open / pending support cases`,
    },
    {
      category: 'Renewal Contract Proximity',
      pts: breakdown.renewal_proximity_pts,
      max: 10,
      detail: `Contract renewal is in ${customer.aggregates.days_until_renewal} days`,
    },
    {
      category: 'Customer Account Tier Weight',
      pts: breakdown.customer_value_pts,
      max: 10,
      detail: `${customer.plan} tier ($${customer.monthly_value}/mo MRR)`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D121F] border-l border-gray-800 w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-semibold">EXPLAINABLE RISK ENGINE</div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Customer {customer.customer_id}: {customer.first_name} {customer.last_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Total Score Header */}
        <div className="my-5 p-4 rounded-xl border border-gray-800 bg-gray-950/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Deterministic Churn Score</span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                risk.risk_level === 'CRITICAL'
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                  : risk.risk_level === 'HIGH'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/80'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
              }`}
            >
              {risk.risk_level}
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">
            {risk.risk_score} <span className="text-sm font-normal text-gray-400">/ 100</span>
          </div>
          <div className="mt-1 text-xs text-gray-400 font-mono">
            Model Version: {risk.processing_version} (Apache Flink Streaming Query)
          </div>
        </div>

        {/* Itemized Points Breakdown Table */}
        <div className="space-y-3 flex-1">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Point-by-Point Score Breakdown
          </h3>
          {pointRows.map((row, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-gray-800/80 bg-gray-900/60 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-200">{row.category}</span>
                <span className="font-mono font-bold text-cyan-400">
                  +{row.pts} <span className="text-gray-400 font-normal">/ {row.max}</span>
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-1">{row.detail}</div>
            </div>
          ))}

          {/* Explainable Reasons Summary */}
          <div className="mt-4 pt-3 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Itemized Reason Statements</h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {risk.reasons.map((r, i) => (
                <li key={i} className="flex items-start font-mono text-[11px]">
                  <span className="text-cyan-400 mr-2 shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-400 font-mono">
          Flink = "What is happening?" • Claude = "Why does it matter?" • Policy = "Are we allowed to do it?"
        </div>
      </div>
    </div>
  );
};
