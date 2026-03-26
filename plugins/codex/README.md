# VoltBots Hivemind — Codex Plugin

Integrates VoltBots Hivemind into the OpenAI Codex CLI.

## Setup

### 1. Install the MCP Server

```bash
npm install -g @voltbots/mcp-hivemind
```

### 2. Configure Codex

Add the Hivemind MCP server to your Codex configuration:

```json
{
  "mcpServers": {
    "voltbots-hivemind": {
      "command": "npx",
      "args": ["-y", "@voltbots/mcp-hivemind"],
      "env": {
        "HIVEMIND_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Available Tools

Once configured, the same MCP tools available in Claude Code work in Codex:

- `get_warnings` — Known issues before edits
- `request_review` — Cross-family code review (reviewed by a non-OpenAI model)
- `report_mistake` — Report AI mistakes
- `search_memory` / `write_memory` — Project memory
- `get_insights` — Performance metrics

### Programmatic Usage

```typescript
import { createCodexClient } from '@voltbots/codex-plugin';

const client = createCodexClient({
  apiKey: process.env.HIVEMIND_API_KEY!,
});

// Client is pre-configured with source: 'codex'
const warnings = await client.getWarnings({
  projectId: 'my-project',
  authorFamily: 'openai',
});
```

## License

Apache-2.0
