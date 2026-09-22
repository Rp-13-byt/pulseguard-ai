import { useEffect, useState, useRef } from 'react';

export interface StreamEventItem {
  id: string;
  source: string;
  event_type: string;
  customer_id?: number;
  subject?: string;
  sentiment?: string;
  detail: string;
  timestamp: string;
}

export interface ScenarioStep {
  step: number;
  title: string;
  detail: string;
}

export function useEventStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<StreamEventItem[]>([]);
  const [latestStep, setLatestStep] = useState<ScenarioStep | null>(null);
  const [lastRiskUpdate, setLastRiskUpdate] = useState<unknown>(null);
  const [lastIntervention, setLastIntervention] = useState<unknown>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const sse = new EventSource('/api/events/stream');
    eventSourceRef.current = sse;

    sse.onopen = () => {
      setIsConnected(true);
    };

    sse.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);

        if (parsed.type === 'EVENT') {
          const item: StreamEventItem = {
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            source: parsed.data.source || 'STREAM',
            event_type: parsed.data.event_type || 'TELEMETRY',
            customer_id: parsed.data.customer_id,
            subject: parsed.data.subject,
            sentiment: parsed.data.sentiment,
            detail: parsed.data.detail || JSON.stringify(parsed.data),
            timestamp: parsed.timestamp || new Date().toISOString(),
          };
          setEvents((prev) => [item, ...prev.slice(0, 49)]);
        } else if (parsed.type === 'SCENARIO_STEP') {
          setLatestStep(parsed.data as ScenarioStep);
        } else if (parsed.type === 'RISK_UPDATE') {
          setLastRiskUpdate(parsed.data);
        } else if (parsed.type === 'INTERVENTION') {
          setLastIntervention(parsed.data);
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    sse.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      sse.close();
    };
  }, []);

  return {
    isConnected,
    events,
    latestStep,
    lastRiskUpdate,
    lastIntervention,
  };
}
