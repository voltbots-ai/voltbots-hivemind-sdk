# VoltBots Hivemind — Continue.dev Integration

Use VoltBots Hivemind with [Continue.dev](https://continue.dev) for AI mistake prevention.

## Setup

Continue.dev supports MCP servers. Add to your Continue configuration (`~/.continue/config.json`):

```json
{
  "mcpServers": [
    {
      "name": "voltbots-hivemind",
      "command": "npx",
      "args": ["-y", "@voltbots/mcp-hivemind"],
      "env": {
        "HIVEMIND_API_KEY": "your-api-key-here"
      }
    }
  ]
}
```

## Available Tools

Once configured, these MCP tools are available in Continue:

| Tool | Description |
|------|-------------|
| `get_warnings` | Check for known issues before making changes |
| `request_review` | Get cross-family code review |
| `report_mistake` | Report AI mistakes for collective learning |
| `search_memory` / `write_memory` | Project memory |
| `get_insights` | Performance metrics |

## License

Apache-2.0
