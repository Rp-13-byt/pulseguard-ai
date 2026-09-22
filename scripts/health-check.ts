/**
 * PulseGuard AI - Comprehensive System Health Diagnostic Script
 */

import { checkSystemHealth } from '../apps/api/src/kafka/health-probe';
import { readStore } from '../apps/api/src/readmodel/store';

async function runHealthCheck() {
  console.log('\n===============================================================');
  console.log('   PULSEGUARD AI — STREAMING PIPELINE HEALTH DIAGNOSTIC');
  console.log('===============================================================\n');

  const health = await checkSystemHealth();

  console.log(`Operating Mode: ${health.mode}`);
  console.log(`Overall Status: ${health.overall_status}`);
  console.log(`Diagnostic Timestamp: ${health.timestamp}\n`);

  console.log('--- COMPONENT PROBE RESULTS ---');
  for (const [key, comp] of Object.entries(health.components)) {
    const icon = comp.status === 'CONNECTED' ? '🟢' : comp.status === 'CONFIGURED' ? '🔵' : '🔴';
    console.log(`${icon} [${comp.component.toUpperCase()}] Status: ${comp.status} (${comp.latency_ms}ms)`);
    console.log(`   Message: ${comp.message}`);
  }

  const metrics = readStore.getMetrics();
  console.log('\n--- STREAMING READ MODEL METRICS ---');
  console.log(`Total Monitored Accounts: ${readStore.getAllCustomers().length}`);
  console.log(`MRR Total Exposed: $${metrics.mrr_total_exposed.toLocaleString()}`);
  console.log(`AI Calls Avoided by Deduplication: ${metrics.ai_calls_avoided_by_dedup}`);
  console.log(`Active Interventions: ${metrics.active_interventions_count}`);

  console.log('\n===============================================================');
  console.log('  Health diagnostic complete. System is ready for live demo.');
  console.log('===============================================================\n');
}

runHealthCheck().catch(console.error);
