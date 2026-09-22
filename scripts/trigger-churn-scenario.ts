/**
 * CLI Churn Scenario Runner
 * Triggers any of the 5 multi-step customer lifecycle scenarios via the PulseGuard API.
 */

const scenarioArg = process.argv[2] || '1';

async function triggerScenario() {
  const scenarioNames: Record<string, string> = {
    '1': 'Scenario 1: Acme Global Churn & Retention Intervention (Customer 1017)',
    '2': 'Scenario 2: High-Value Support Crisis & Human Escalation (Customer 1008)',
    '3': 'Scenario 3: Low-Value Free Tier Education Recovery (Customer 1019)',
    '4': 'Scenario 4: Early-Warning Watchlist & Engagement Nurture (Customer 1018)',
    '5': 'Scenario 5: False-Alarm Rebound & State Recovery (Customer 1017)',
  };

  console.log(`\n[Scenario Runner] Triggering: ${scenarioNames[scenarioArg] || `Scenario ${scenarioArg}`}...`);

  try {
    const res = await fetch(`http://localhost:4000/api/demo/scenarios/${scenarioArg}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    console.log('[Scenario Runner] Response:', data);
    console.log('\n✅ Scenario dispatched. Watch the real-time event stream in the PulseGuard AI Dashboard!');
  } catch (err) {
    console.error('[Scenario Runner] Could not connect to API on http://localhost:4000. Start API with npm run dev:api');
  }
}

triggerScenario().catch(console.error);
