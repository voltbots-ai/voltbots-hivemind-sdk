# Hivemind API Schema

OpenAPI 3.1 specification for the VoltBots Hivemind API.

## File

- `openapi.yaml` — Full API specification

## Endpoints

All endpoints are under `/v1/hivemind/` with `X-API-Key` header authentication.

| Path | Method | Description |
|------|--------|-------------|
| `/v1/hivemind/warnings` | GET | Model-specific warnings |
| `/v1/hivemind/review` | POST | Cross-family code review |
| `/v1/hivemind/trace` | POST | Tool execution trace |
| `/v1/hivemind/mistake` | POST | Report AI mistake |
| `/v1/hivemind/memory` | GET/POST | Project memory |
| `/v1/hivemind/insights` | GET | Performance insights |
| `/v1/hivemind/keys` | POST/GET/DELETE | BYOK key management |
