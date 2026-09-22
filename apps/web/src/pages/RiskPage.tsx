import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Filter, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskPageProps {
  onSelectCustomer: (id: number) => void;
}

export const RiskPage: React.FC<RiskPageProps> = ({ onSelectCustomer }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const levelParam = filterLevel === 'ALL' || filterLevel === 'EXPOSED' ? undefined : filterLevel;
    api.fetchRiskTable(levelParam)
      .then((data) => {
        let list = data.customers || [];
        if (filterLevel === 'EXPOSED') {
          list = list.filter((c: any) => c.mrr_exposed > 0);
        }
        setCustomers(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [filterLevel]);

  const filteredList = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.customer_id).includes(searchQuery)
  );

  const getLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center">
            <ShieldAlert className="h-5 w-5 text-cyan-400 mr-2" />
            CHURN RISK MATRIX & CUSTOMER INTELLIGENCE
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Continuously updated by Confluent Flink streaming scoring engine
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search account by ID, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'EXPOSED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterLevel(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              filterLevel === tab
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            {tab === 'EXPOSED' ? 'MRR AT RISK' : tab}
          </button>
        ))}
      </div>

      {/* Risk Table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 bg-gray-950/60">
                <th className="py-3 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3 px-4 font-semibold">PLAN TIER</th>
                <th className="py-3 px-4 font-semibold">MRR</th>
                <th className="py-3 px-4 font-semibold">RISK SCORE</th>
                <th className="py-3 px-4 font-semibold">LEVEL</th>
                <th className="py-3 px-4 font-semibold">MRR EXPOSED</th>
                <th className="py-3 px-4 font-semibold">PRIMARY REASON</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Loading risk matrix...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No customers match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-gray-400">ID: {c.customer_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 text-[10px]">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-200">
                      ${c.monthly_value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-cyan-400">{c.risk_score}</span>
                      <span className="text-[10px] text-gray-500"> / 100</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(
                          c.risk_level
                        )}`}
                      >
                        {c.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-400">
                      {c.mrr_exposed > 0 ? `$${c.mrr_exposed.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-[11px] max-w-xs truncate">
                      {c.primary_reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectCustomer(c.customer_id)}
                        className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        View 360
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
