/**
 * Direct Telemetry Event Producer
 * Produces a sample fast-path product telemetry event into Kafka or API.
 */

import { ProductEvent } from '@pulseguard/domain';

async function produceDemoEvent() {
  const event: ProductEvent = {
    event_id: `evt-${Date.now()}`,
    customer_id: 1017,
    event_time: new Date().toISOString(),
    event_type: 'FEATURE_USE',
    feature: 'REPORT_BUILDER',
    session_minutes: 25.5,
    success: true,
  };

  console.log('[Producer] Injecting demo event:', event);

  try {
    const res = await fetch('http://localhost:4000/api/telemetry/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'usage_drop', customer_id: 1017 }),
    });
    const data = await res.json();
    console.log('[Producer] Result:', data);
  } catch (err) {
    console.warn('[Producer] API not running yet on port 4000. Start API with npm run dev:api');
  }
}

if (require.main === module) {
  produceDemoEvent().catch(console.error);
}
