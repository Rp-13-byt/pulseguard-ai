# Datagen Fallback Connector

This connector provides synthetic development activity stream fallback via Confluent Cloud's managed Datagen connector (`DatagenSource`).

## Purpose in PulseGuard AI
If Zendesk or external telemetry pipelines are restricted or unavailable during a live demo or development environment, Datagen provides an active stream of simulated user activity into:
`pulseguard.demo.activity`

Confluent explicitly documents that Datagen is intended for mock/development scenarios and supports JSON, Avro, JSON Schema, and Protobuf formats.
