import React, { useState } from 'react';
import { TrendingDown, MessageSquareWarning, ShoppingBag, CreditCard, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface EventSimulatorBarProps {
  onEventFired?: () => void;
  selectedCustomerId?: number;
}

export const EventSimulatorBar: React.FC<EventSimulatorBarProps> = ({
  onEventFired,
  selectedCustomerId = 1017,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    try {
      await api.sendTelemetryAction(action, selectedCustomerId);
      if (onEventFired) onEventFired();
    } catch (err) {
      console.error('Failed to trigger action:', err);
    } finally {
      setTimeout(() => setLoadingAction(null), 600);
    }
  };

  const buttons = [
    {
      id: 'usage_drop',
      label: 'Decrease Usage (-60%)',
      path: 'FAST PATH (<1s)',
      icon: TrendingDown,
      color: 'hover:border-rose-500 hover:text-rose-300 text-rose-400 bg-rose-950/20',
    },
    {
      id: 'support_ticket',
      label: 'Urgent Support Ticket',
      path: 'SUPPORT PATH (15-30s)',
      icon: MessageSquareWarning,
      color: 'hover:border-amber-500 hover:text-amber-300 text-amber-400 bg-amber-950/20',
    },
    {
      id: 'order_inactivity',
      label: 'Simulate Order Inactivity',
      path: 'OPERATIONAL CDC (1-3s)',
      icon: ShoppingBag,
      color: 'hover:border-purple-500 hover:text-purple-300 text-purple-400 bg-purple-950/20',
    },
    {
      id: 'payment_failure',
      label: 'Simulate Payment Failure',
      path: 'OPERATIONAL CDC (1-3s)',
      icon: CreditCard,
      color: 'hover:border-red-500 hover:text-red-300 text-red-400 bg-red-950/20',
    },
    {
      id: 'renewal_alert',
      label: 'Trigger Renewal Alert (<7d)',
      path: 'OPERATIONAL CDC (1-3s)',
      icon: Clock,
      color: 'hover:border-cyan-500 hover:text-cyan-300 text-cyan-400 bg-cyan-950/20',
    },
    {
      id: 'customer_recovery',
      label: 'Rebound & Recovery',
      path: 'FAST PATH (<1s)',
      icon: RotateCcw,
      color: 'hover:border-emerald-500 hover:text-emerald-300 text-emerald-400 bg-emerald-950/20',
    },
  ];

  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            LIVE CUSTOMER EVENT SIMULATOR (JUDGES INTERACTIVE CONSOLE)
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            [Target: Customer {selectedCustomerId} — Acme Global]
          </span>
        </div>
        <span className="text-[11px] text-gray-400">
          Click any button to inject raw streaming records into Confluent / Flink pipeline
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          const isLoading = loadingAction === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => handleAction(btn.id)}
              disabled={Boolean(loadingAction)}
              className={`flex flex-col items-start p-2.5 rounded-lg border border-gray-800 text-left transition-all ${btn.color} disabled:opacity-50`}
            >
              <div className="flex items-center space-x-2 w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span className="text-xs font-semibold truncate">{btn.label}</span>
              </div>
              <span className="mt-1 text-[10px] font-mono text-gray-400 block truncate">
                {btn.path}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
