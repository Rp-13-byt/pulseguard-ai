import React from 'react';
import { Radio, ArrowUpRight } from 'lucide-react';
import { StreamEventItem } from '../hooks/useEventStream';

interface LiveEventFeedProps {
  events: StreamEventItem[];
  onSelectCustomer?: (customerId: number) => void;
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events, onSelectCustomer }) => {
  const getSourceBadge = (source: string) => {
    if (source.includes('FAST_PATH')) {
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    }
    if (source.includes('OPERATIONAL_PATH')) {
      return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
    }
    if (source.includes('SUPPORT_PATH')) {
      return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    }
    return 'bg-gray-800 text-gray-300 border-gray-700';
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 backdrop-blur p-4 h-full flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-wide">LIVE EVENT FEED</h3>
        </div>
        <span className="text-xs font-mono text-gray-400">Streaming from Confluent Kafka</span>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs font-mono">
            Waiting for real-time Kafka & CDC events...
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg border border-gray-800/80 bg-gray-950/60 hover:border-gray-700 transition-all text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getSourceBadge(
                    evt.source
                  )}`}
                >
                  {evt.source}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-gray-200">{evt.event_type}</span>
                  {evt.customer_id && (
                    <button
                      onClick={() => onSelectCustomer && onSelectCustomer(evt.customer_id!)}
                      className="ml-2 text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center"
                    >
                      Customer {evt.customer_id}
                      <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </button>
                  )}
                  {evt.subject && (
                    <div className="mt-0.5 text-gray-300 font-medium">{evt.subject}</div>
                  )}
                  <p className="mt-1 text-gray-400 font-mono text-[11px] leading-relaxed">
                    {evt.detail}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
