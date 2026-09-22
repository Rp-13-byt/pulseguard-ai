import React, { useState } from 'react';
import { ProposedIntervention } from '../types';
import { api } from '../services/api';
import { ShieldCheck, Check, X, Sparkles, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface InterventionsPageProps {
  interventions: ProposedIntervention[];
  onSelectCustomer: (id: number) => void;
  onRefreshData: () => void;
}

export const InterventionsPage: React.FC<InterventionsPageProps> = ({
  interventions,
  onSelectCustomer,
  onRefreshData,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED' | 'REJECTED'>('PENDING');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await api.approveIntervention(id, 'Operations Director (Demo Reviewer)');
      onRefreshData();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    try {
      await api.rejectIntervention(id, 'Rejected during operational policy triage');
      onRefreshData();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = interventions.filter((i) => {
    if (filter === 'ALL') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center">
            <ShieldCheck className="h-5 w-5 text-cyan-400 mr-2" />
            GOVERNED RETENTION INTERVENTIONS DECISION QUEUE
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Formulated by Claude AI inference • Governed by deterministic policy boundaries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['PENDING', 'EXECUTED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                filter === tab
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-xs font-mono text-gray-500 rounded-xl border border-gray-800 bg-gray-900/40">
            No interventions currently matching the {filter} filter. Trigger a churn scenario to generate fresh proposals.
          </div>
        ) : (
          filtered.map((intv) => {
            const isLoading = loadingId === intv.intervention_id;
            return (
              <div
                key={intv.intervention_id}
                className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all shadow-sm"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm font-mono">
                        Customer {intv.customer_id}
                      </span>
                      <button
                        onClick={() => onSelectCustomer(intv.customer_id)}
                        className="text-[11px] text-cyan-400 hover:underline font-mono"
                      >
                        [Inspect 360]
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          intv.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : intv.status === 'EXECUTED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {intv.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Score: {intv.risk_score}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Body */}
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-bold text-white flex items-center">
                      <Sparkles className="h-4 w-4 text-cyan-400 mr-2 shrink-0" />
                      {intv.recommended_action}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-gray-400">
                      <span>Channel: <strong className="text-gray-200">{intv.channel}</strong></span>
                      <span>•</span>
                      <span>Offer: <strong className="text-gray-200">{intv.offer_type}</strong></span>
                      <span>•</span>
                      <span>Discount: <strong className="text-cyan-400">{intv.discount_percent}%</strong></span>
                    </div>

                    {/* AI Proposed Message */}
                    <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800/80 text-xs font-mono text-gray-300">
                      <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1">
                        Synthesized Outreach Message:
                      </div>
                      "{intv.message}"
                    </div>

                    {/* Rationale & Policy Check */}
                    <div className="text-[11px] font-mono text-gray-400 leading-relaxed">
                      <strong className="text-gray-300">AI Contextual Rationale:</strong> {intv.reasoning}
                    </div>

                    <div className="p-2 rounded bg-gray-950/40 border border-gray-800/60 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Governed Policy: <strong className="text-cyan-300">{intv.policy_name}</strong></span>
                      <span>Human Approval: <strong className={intv.requires_human_approval ? 'text-amber-400' : 'text-emerald-400'}>{intv.requires_human_approval ? 'REQUIRED' : 'AUTOMATED'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">
                    Model: {intv.ai_model} • Prompt: {intv.prompt_version}
                  </span>

                  {intv.status === 'PENDING' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(intv.intervention_id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(intv.intervention_id)}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20"
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                        Approve & Execute
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {intv.status === 'EXECUTED' ? `Executed (${intv.approved_by || 'Auto'})` : 'Rejected'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
