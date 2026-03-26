# CLAUDE.md - VoltBots Hivemind SDK

## What This Repo Is

**Public, open source (Apache 2.0)** client-side code for VoltBots Hivemind:

- `packages/sdk-js/` — JavaScript/TypeScript SDK (`@voltbots/hivemind` on npm)
- `packages/sdk-python/` — Python SDK (`voltbots` on PyPI)
- `packages/mcp-server/` — MCP server for Claude Desktop, Claude Code, and compatible clients
- `plugins/claude-code/` — Claude Code plugin (hooks + MCP config)
- `plugins/codex/` — OpenAI Codex CLI plugin
- `integrations/` — Guides for Cursor, Aider, Continue.dev, LangChain, GitHub Actions
- `schema/` — OpenAPI 3.1 spec for the Hivemind API
- `examples/` — Usage examples and custom integration templates

## What This Repo Is NOT

- No server-side code — this is all client-side
- No proprietary logic — everything here is Apache 2.0 licensed
- No backend, API server, database, or orchestrator code
- No Hivemind dashboard or CLI (that's `voltbots-hivemind`, private)

## Key Principle

Everything in this repo calls the public Hivemind API at `api.voltbots.com/v1/hivemind/*`. The intelligence is server-side. These are thin clients and wrappers — users should be able to read every line of code and trust what's running in their environment.

## Architecture

- API endpoints: `/v1/hivemind/{resource}` (warnings, review, trace, mistake, memory, insights, keys)
- Auth: `X-API-Key` header
- Client identification: `X-Client-Source` (claude-code, codex, sdk) + `X-Client-Version`
- Source of truth for types: server Zod schemas in `voltbots/apps/api/src/hivemind/schemas.ts`

## Technical Standards

- TypeScript strict mode, ESM with `.js` extensions
- Python 3.10+ with Pydantic v2 + httpx
- Zero runtime dependencies for JS SDK (uses global `fetch`)
- Vitest for TypeScript tests, pytest for Python
- OpenAPI schema documents the actual implemented endpoints
- Keep dependencies minimal — these run in users' environments

## Development

```bash
# Root — install all workspaces
npm install

# Build all TypeScript packages
npm run build

# Test all TypeScript packages
npm run test

# JavaScript/TypeScript SDK
cd packages/sdk-js
npm run build
npm run test

# Python SDK
cd packages/sdk-python
pip install -e ".[dev]"
pytest

# MCP Server
cd packages/mcp-server
npm run build
```

## Monorepo Structure

npm workspaces: `packages/*` and `plugins/*`. Root `tsconfig.base.json` provides shared TypeScript config.
