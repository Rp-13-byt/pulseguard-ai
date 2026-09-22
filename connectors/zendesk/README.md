# Zendesk Source Connector

This directory contains the configuration and operational notes for the **Confluent Managed Zendesk Source Connector** (`ZendeskSource`).

## Latency Profile: Support Path (Near-Real-Time)
> [!IMPORTANT]
> The Zendesk Source connector is a polling-based connector with a default `request.interval.ms` of 15,000ms (15 seconds). 
> In PulseGuard AI, Zendesk events are classified under the **Support Path** (latency: 15–30 seconds), distinct from the <1s **Fast Path** (direct telemetry) and 1–3s **Operational Path** (PostgreSQL CDC).

## Configuration Steps

1. In Zendesk Admin Center:
   - Navigate to **Apps and integrations** -> **Zendesk API**.
   - Enable **Token access**.
   - Click **Add API token**, label it `confluent-pulseguard`, and securely save the token.
2. In Confluent Cloud:
   - Go to **Connectors** -> **Add Connector** -> **Zendesk Source**.
   - Set **Zendesk URL**: `https://<YOUR-SUBDOMAIN>.zendesk.com`
   - Set **Authentication**: Basic Authentication.
   - Set **Username**: `<YOUR-EMAIL>/token` (note the `/token` suffix for token auth).
   - Set **Password**: Your Zendesk API Token.
   - Set **Tables**: `tickets,ticket_audits,users,organizations`
   - Set **Topic pattern**: `pulseguard.zendesk.${entityName}`
   - Set **Output record value format**: `JSON_SR`
3. Output Topics generated:
   - `pulseguard.zendesk.tickets`
   - `pulseguard.zendesk.ticket_audits`
   - `pulseguard.zendesk.users`
   - `pulseguard.zendesk.organizations`
