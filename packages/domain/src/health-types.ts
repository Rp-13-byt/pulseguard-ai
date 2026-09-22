export type ComponentHealthState = 'CONNECTED' | 'CONFIGURED' | 'DEGRADED' | 'ERROR';

export interface ComponentHealth {
  component: 'kafka' | 'flink' | 'schema_registry' | 'ai_engine' | 'connectors' | 'api';
  status: ComponentHealthState;
  latency_ms: number;
  message: string;
  last_probe_time: string;
  details?: Record<string, unknown>;
}

export interface SystemHealthSummary {
  overall_status: ComponentHealthState;
  components: Record<string, ComponentHealth>;
  mode: 'LIVE_CONFLUENT' | 'HIGH_FIDELITY_SIMULATOR';
  timestamp: string;
}
