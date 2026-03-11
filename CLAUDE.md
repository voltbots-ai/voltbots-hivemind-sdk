# CLAUDE.md - VoltBots Hivemind SDK

## What This Repo Is

**Public, open source (MIT)** client-side code for VoltBots Hivemind:

- `packages/sdk-js/` — JavaScript/TypeScript SDK (`@voltbots/hivemind` on npm)
- `packages/sdk-python/` — Python SDK (`voltbots` on PyPI)
- `packages/mcp-server/` — MCP server for Claude Desktop and compatible clients
- `integrations/` — Plugins for Cursor, Aider, Continue.dev, LangChain, GitHub Actions
- `schema/` — OpenAPI spec for the Hivemind API
- `examples/` — Usage examples and custom integration templates

## What This Repo Is NOT

- No server-side code — this is all client-side
- No proprietary logic — everything here is MIT licensed
- No backend, API server, database, or orchestrator code
- No Hivemind dashboard or CLI (that's `voltbots-hivemind`, private)

## Key Principle

Everything in this repo calls the public Hivemind API. The intelligence is server-side. These are thin clients and wrappers — users should be able to read every line of code and trust what's running in their environment.

## Technical Standards

- TypeScript strict mode for JS packages
- Python 3.10+ for Python SDK
- Full test coverage for SDKs
- OpenAPI schema is the source of truth for all endpoints
- Keep dependencies minimal — these run in users' environments

## Development

```bash
# JavaScript/TypeScript
cd packages/sdk-js
npm install
npm run build
npm run test

# Python
cd packages/sdk-python
pip install -e ".[dev]"
pytest

# MCP Server
cd packages/mcp-server
npm install
npm run dev
```
