import React from 'react';
import { Database, Waves, FileCode2, Sparkles, Network, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { SystemHealthSummary, ComponentHealthState } from '../types';

interface StatusHeaderProps {
  health?: SystemHealthSummary;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ health }) => {
  const getBadge = (status?: ComponentHealthState) => {
    switch (status) {
      case 'CONNECTED':
        return {
          bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          text: 'CONNECTED',
        };
      case 'CONFIGURED':
        return {
          bg: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/60',
          dot: 'bg-cyan-400',
          icon: CheckCircle2,
          text: 'CONFIGURED',
        };
      case 'DEGRADED':
        return {
          bg: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
          text: 'DEGRADED',
        };
      case 'ERROR':
      default:
        return {
          bg: 'bg-rose-950/40 text-rose-400 border-rose-800/60',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          text: 'ERROR',
        };
    }
  };

  const components = [
    {
      id: 'kafka',
      label: 'Confluent Kafka',
      icon: Waves,
      data: health?.components?.['kafka'],
    },
    {
      id: 'flink',
      label: 'Apache Flink',
      icon: Waves,
      data: health?.components?.['flink'],
    },
    {
      id: 'schema_registry',
      label: 'Schema Registry',
      icon: FileCode2,
      data: health?.components?.['schema_registry'],
    },
    {
      id: 'ai_engine',
      label: 'Claude AI Inference',
      icon: Sparkles,
      data: health?.components?.['ai_engine'],
    },
    {
      id: 'connectors',
      label: 'CDC & Zendesk Connectors',
      icon: Network,
      data: health?.components?.['connectors'],
    },
  ];

  return (
    <div className="bg-[#0B0F19] border-b border-gray-800/80 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="font-semibold text-gray-300">STREAMING ENGINE STATUS:</span>
          <span className="px-2 py-0.5 rounded bg-gray-800 font-mono text-cyan-300 border border-gray-700">
            {health?.mode === 'LIVE_CONFLUENT' ? 'Confluent Cloud Managed' : 'High-Fidelity Event Simulator'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {components.map((c) => {
            const badge = getBadge(c.data?.status || 'CONFIGURED');
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                title={c.data?.message || c.label}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${badge.bg} transition-all`}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                <span className="font-medium text-gray-300">{c.label}:</span>
                <span className="font-semibold tracking-wide">{badge.text}</span>
                {c.data?.latency_ms !== undefined && (
                  <span className="font-mono text-[10px] text-gray-400 opacity-70">
                    {c.data.latency_ms}ms
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
