import React from 'react';
import { Database, Waves, Cpu, Sparkles, Shield, Send, ArrowRight } from 'lucide-react';

export const StreamLineageView: React.FC = () => {
  const steps = [
    {
      group: 'SOURCE SYSTEMS',
      nodes: [
        { label: 'PostgreSQL RDS', sub: 'Operational Tables', icon: Database, color: 'border-purple-800 bg-purple-950/20 text-purple-300' },
        { label: 'Product Telemetry', sub: 'Fast Path Telemetry', icon: Send, color: 'border-cyan-800 bg-cyan-950/20 text-cyan-300' },
        { label: 'Zendesk Support', sub: 'Tickets & Sentiment', icon: Database, color: 'border-amber-800 bg-amber-950/20 text-amber-300' },
      ],
    },
    {
      group: 'CONFLUENT CONNECTORS',
      nodes: [
        { label: 'Postgres CDC V2', sub: 'Debezium Logical Rep', icon: Cpu, color: 'border-blue-800 bg-blue-950/20 text-blue-300' },
        { label: 'Direct Producer', sub: 'Kafka Producer API', icon: Send, color: 'border-cyan-800 bg-cyan-950/20 text-cyan-300' },
        { label: 'Zendesk Source', sub: 'Polling (15s interval)', icon: Cpu, color: 'border-amber-800 bg-amber-950/20 text-amber-300' },
      ],
    },
    {
      group: 'CONFLUENT KAFKA',
      nodes: [
        { label: 'pulseguard.cdc.*', sub: 'JSON_SR Schemas', icon: Waves, color: 'border-indigo-800 bg-indigo-950/20 text-indigo-300' },
        { label: 'pulseguard.product.events', sub: 'Unpartitioned Telemetry', icon: Waves, color: 'border-indigo-800 bg-indigo-950/20 text-indigo-300' },
        { label: 'pulseguard.zendesk.tickets', sub: 'JSON_SR Schemas', icon: Waves, color: 'border-indigo-800 bg-indigo-950/20 text-indigo-300' },
      ],
    },
    {
      group: 'CONFLUENT APACHE FLINK',
      nodes: [
        { label: 'Decomposed Aggs', sub: 'Order/Usage/Support', icon: Cpu, color: 'border-cyan-800 bg-cyan-950/20 text-cyan-300' },
        { label: 'Customer 360', sub: 'Dimension Temporal Join', icon: Cpu, color: 'border-cyan-800 bg-cyan-950/20 text-cyan-300' },
        { label: 'Deterministic Scoring', sub: '0-100 Churn Engine', icon: Cpu, color: 'border-cyan-800 bg-cyan-950/20 text-cyan-300' },
      ],
    },
    {
      group: 'AI & ACTION GATE',
      nodes: [
        { label: 'Claude AI Inference', sub: 'Retention Reasoning', icon: Sparkles, color: 'border-amber-800 bg-amber-950/20 text-amber-300' },
        { label: 'Node Action Gate', sub: 'Policy & Human Review', icon: Shield, color: 'border-emerald-800 bg-emerald-950/20 text-emerald-300' },
        { label: 'Outbound Sinks', sub: 'CRM / Slack Webhooks', icon: Send, color: 'border-emerald-800 bg-emerald-950/20 text-emerald-300' },
      ],
    },
  ];

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center">
            LIVE STREAM LINEAGE (CONFLUENT STREAM GOVERNANCE)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Streaming pipeline topology verified through Confluent Stream Catalog Essentials
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 font-mono text-[11px]">
          Live 10-Minute Lineage Window
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((col, idx) => (
          <div key={idx} className="flex flex-col space-y-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center border-b border-gray-800/60 pb-1">
              {col.group}
            </div>
            <div className="space-y-2.5">
              {col.nodes.map((node, nIdx) => {
                const Icon = node.icon;
                return (
                  <div
                    key={nIdx}
                    className={`p-3 rounded-xl border ${node.color} shadow-sm transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">{node.label}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-gray-400 truncate">
                      {node.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
