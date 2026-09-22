import React, { useState, useEffect } from 'react';
import { Customer360, ChurnRiskEvent, CustomerAuditEvent } from '../types';
import { api } from '../services/api';
import { User, DollarSign, Calendar, TrendingUp, Sparkles, Shield, Clock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ExplainabilityDrawer } from '../components/ExplainabilityDrawer';

interface Customer360PageProps {
  selectedCustomerId: number;
  onSelectCustomer: (id: number) => void;
}

export const Customer360Page: React.FC<Customer360PageProps> = ({
  selectedCustomerId,
  onSelectCustomer,
}) => {
  const [customer, setCustomer] = useState<Customer360 | null>(null);
  const [risk, setRisk] = useState<ChurnRiskEvent | null>(null);
  const [riskHistory, setRiskHistory] = useState<Array<{ timestamp: string; score: number }>>([]);
  const [audits, setAudits] = useState<CustomerAuditEvent[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer360[]>([]);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.fetchCustomers().then((data) => setAllCustomers(data.customers || [])).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api.fetchCustomerDetail(selectedCustomerId)
      .then((data) => {
        setCustomer(data.customer);
        setRisk(data.risk);
        setRiskHistory(data.riskHistory || []);
        setAudits(data.audits || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedCustomerId]);

  if (isLoading && !customer) {
    return (
      <div className="py-20 text-center text-xs font-mono text-gray-400">
        Loading Customer 360 streaming profile...
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* Customer Selector & Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/80">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                {customer.first_name} {customer.last_name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700">
                ID: {customer.customer_id}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {customer.plan}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">{customer.email} • {customer.country}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-400 font-mono">Select Account:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => onSelectCustomer(parseInt(e.target.value, 10))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
          >
            {allCustomers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.customer_id} - {c.first_name} {c.last_name} ({c.plan} - Score: {c.current_risk_score})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 360 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Churn Risk & Explainability */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Card */}
          <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-mono font-semibold text-gray-400">FLINK DETERMINISTIC RISK</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  customer.current_risk_level === 'CRITICAL'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : customer.current_risk_level === 'HIGH'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {customer.current_risk_level}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-extrabold text-white font-mono">
                  {customer.current_risk_score}
                </span>
                <span className="text-sm text-gray-400 font-mono"> / 100</span>
              </div>
              <button
                onClick={() => setIsExplainOpen(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono underline"
              >
                View Point Breakdown →
              </button>
            </div>

            {/* Sparkline / History */}
            <div className="mt-4 h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskHistory.length ? riskHistory : [{ timestamp: '0', score: customer.current_risk_score }]}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-gray-500 font-mono text-center mt-1">
              Time-Series Risk Trend (Continuous Rolling Aggregations)
            </div>
          </div>

          {/* Account Metrics */}
          <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-gray-800 font-mono">
              <span className="text-gray-400">Monthly Contract (MRR)</span>
              <span className="text-white font-bold">${customer.monthly_value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-800 font-mono">
              <span className="text-gray-400">Renewal Window</span>
              <span className="text-cyan-400 font-bold">{customer.aggregates.days_until_renewal} Days Left</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-800 font-mono">
              <span className="text-gray-400">Order Inactivity</span>
              <span className="text-white font-bold">{customer.aggregates.days_since_last_order} Days Ago</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-gray-400">Support Sentiment</span>
              <span className={`font-bold ${customer.aggregates.latest_sentiment === 'URGENT_NEGATIVE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {customer.aggregates.latest_sentiment}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Rolling Aggregates, Reasons, and Audit Trail */}
        <div className="lg:col-span-8 space-y-6">
          {/* Decomposed Rolling Aggregates Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="text-[11px] text-gray-400 font-medium">7D Telemetry Variance</span>
              <div className={`text-base font-bold font-mono mt-1 ${customer.aggregates.usage_change_percent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {customer.aggregates.usage_change_percent}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="text-[11px] text-gray-400 font-medium">Orders (Last 30D)</span>
              <div className="text-base font-bold text-white font-mono mt-1">
                {customer.aggregates.orders_last_30d} orders
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="text-[11px] text-gray-400 font-medium">Unresolved Tickets</span>
              <div className="text-base font-bold text-amber-400 font-mono mt-1">
                {customer.aggregates.unresolved_tickets} tickets
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="text-[11px] text-gray-400 font-medium">MRR Exposed</span>
              <div className="text-base font-bold text-rose-400 font-mono mt-1">
                ${(risk?.mrr_exposed ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Primary Explainable Reasons */}
          <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              Flink Deterministic Scoring Rationale (Why Was This Customer Flagged?)
            </h3>
            <div className="space-y-2">
              {risk?.reasons.map((r, i) => (
                <div key={i} className="flex items-start text-xs font-mono text-gray-200">
                  <span className="text-cyan-400 mr-2 shrink-0">✔</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">
              Immutable Governance & Action Timeline
            </h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {audits.length === 0 ? (
                <div className="text-xs text-gray-500 font-mono py-6 text-center">
                  No audit trail records yet for this account.
                </div>
              ) : (
                audits.map((a) => (
                  <div
                    key={a.audit_id}
                    className="p-3 rounded-lg border border-gray-800 bg-gray-950/60 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-semibold">
                        [{a.actor_type}] {a.action}
                      </span>
                      <span className="text-gray-500">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-300 text-[11px]">{a.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        customer={customer}
        risk={risk || undefined}
      />
    </div>
  );
};
