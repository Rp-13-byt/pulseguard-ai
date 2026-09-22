import React, { useState } from 'react';
import { X, Play, CheckCircle2, ArrowRight, Sparkles, Shield, Cpu, Waves, Database, Loader2 } from 'lucide-react';
import { ScenarioStep } from '../hooks/useEventStream';
import { api } from '../services/api';

interface ChurnScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestStep: ScenarioStep | null;
}

export const ChurnScenarioModal: React.FC<ChurnScenarioModalProps> = ({
  isOpen,
  onClose,
  latestStep,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleStart = async () => {
    setIsRunning(true);
    try {
      await api.triggerWalkthrough();
    } catch (err) {
      console.error('Failed to start walkthrough:', err);
    }
  };

  const pipelineStages = [
    { num: 1, label: 'SOURCE EVENT', icon: Database, desc: 'Telemetry & CDC' },
    { num: 2, label: 'KAFKA', icon: Waves, desc: 'Topic Ingestion' },
    { num: 3, label: 'FLINK', icon: Cpu, desc: 'Rolling 360 Aggs' },
    { num: 4, label: 'RISK', icon: Sparkles, desc: 'Deterministic 0-100' },
    { num: 5, label: 'AI REASON', icon: Sparkles, desc: 'Claude Inference' },
    { num: 6, label: 'POLICY', icon: Shield, desc: 'Governed Gate' },
    { num: 7, label: 'ACTION', icon: CheckCircle2, desc: 'Human-in-the-Loop' },
  ];

  const currentStepNum = latestStep?.step ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0D121F] border border-cyan-800/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                MASTER HACKATHON DEMO: REAL-TIME CHURN SCENARIO
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Watch Customer 1017 (Acme Global, $3,450 MRR) journey from Healthy (Score: 14) to Critical (Score: 87)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual Pipeline Progression Timeline */}
        <div className="my-6">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              const isPast = currentStepNum >= stage.num;
              const isCurrent = currentStepNum === stage.num;

              return (
                <div
                  key={stage.num}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : isPast
                      ? 'bg-gray-900/90 border-emerald-800/80 text-emerald-400'
                      : 'bg-gray-950/60 border-gray-800/80 text-gray-400'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <Icon className={`h-4 w-4 ${isCurrent ? 'animate-bounce text-cyan-400' : ''}`} />
                  </div>
                  <div className="text-[10px] font-bold tracking-wider">{stage.label}</div>
                  <div className="text-[9px] text-gray-400 truncate">{stage.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Step Status Card */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/80 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-cyan-400">
              {latestStep ? `STAGE ${latestStep.step} OF 6` : 'READY TO COMMENCE'}
            </span>
            {isRunning && (
              <span className="flex items-center text-xs text-emerald-400 font-mono">
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                PIPELINE EXECUTING
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-white">
            {latestStep?.title || 'Click "Initiate Real-Time Churn Walkthrough"'}
          </div>
          <p className="mt-1 text-xs text-gray-300 font-mono leading-relaxed">
            {latestStep?.detail ||
              'Demonstrates: Telemetry Event -> Kafka Topic -> Flink Rolling Aggregation -> Deterministic Risk (14 -> 87) -> Claude AI Reasoning -> Governed Policy Gate -> Human Approval.'}
          </p>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-[11px] text-gray-400 font-mono">
            Deterministic logic runs in Flink • AI reasoning runs in Claude • Side-effects authorized in Node.js
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all"
            >
              Close
            </button>
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              {isRunning ? 'Walkthrough Running...' : 'Initiate Churn Walkthrough'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
