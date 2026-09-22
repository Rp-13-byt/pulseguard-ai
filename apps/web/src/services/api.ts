const API_BASE = '/api';

export const api = {
  async fetchDashboard() {
    const res = await fetch(`${API_BASE}/metrics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async fetchHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health status');
    return res.json();
  },

  async fetchCustomers() {
    const res = await fetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async fetchCustomerDetail(id: number) {
    const res = await fetch(`${API_BASE}/customers/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch customer ${id}`);
    return res.json();
  },

  async fetchRiskTable(level?: string) {
    const url = level ? `${API_BASE}/risk?level=${level}` : `${API_BASE}/risk`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch risk table');
    return res.json();
  },

  async fetchInterventions() {
    const res = await fetch(`${API_BASE}/interventions`);
    if (!res.ok) throw new Error('Failed to fetch interventions');
    return res.json();
  },

  async approveIntervention(id: string, approver = 'VP Customer Success') {
    const res = await fetch(`${API_BASE}/interventions/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approver }),
    });
    if (!res.ok) throw new Error('Failed to approve intervention');
    return res.json();
  },

  async rejectIntervention(id: string, reason: string) {
    const res = await fetch(`${API_BASE}/interventions/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to reject intervention');
    return res.json();
  },

  async sendTelemetryAction(action: string, customerId = 1017) {
    const res = await fetch(`${API_BASE}/telemetry/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, customer_id: customerId }),
    });
    if (!res.ok) throw new Error('Failed to trigger telemetry action');
    return res.json();
  },

  async triggerWalkthrough() {
    const res = await fetch(`${API_BASE}/demo/walkthrough`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start walkthrough');
    return res.json();
  },

  async triggerScenario(id: string) {
    const res = await fetch(`${API_BASE}/demo/scenarios/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to trigger scenario ${id}`);
    return res.json();
  },

  async fetchGovernanceSchemas() {
    const res = await fetch(`${API_BASE}/governance/schemas`);
    if (!res.ok) throw new Error('Failed to fetch schemas');
    return res.json();
  },

  async fetchGovernanceTags() {
    const res = await fetch(`${API_BASE}/governance/tags`);
    if (!res.ok) throw new Error('Failed to fetch governance tags');
    return res.json();
  },

  async fetchLineage() {
    const res = await fetch(`${API_BASE}/governance/lineage`);
    if (!res.ok) throw new Error('Failed to fetch lineage');
    return res.json();
  },
};
