# @voltbots/mcp-hivemind

MCP server for VoltBots Hivemind. Works with Claude Desktop, Claude Code, Cursor, Continue.dev, and any MCP-compatible client.

## Quick Start

```bash
npx @voltbots/mcp-hivemind
```

Set `HIVEMIND_API_KEY` in your environment.

## Claude Desktop / Claude Code Configuration

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

## Tools

| Tool | Description |
|------|-------------|
| `get_warnings` | Get known issues for a project/file |
| `request_review` | Cross-family code review |
| `submit_trace` | Record tool execution for learning |
| `report_mistake` | Report an AI mistake |
| `search_memory` | Search project memory |
| `write_memory` | Store project context |
| `get_insights` | Performance insights |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HIVEMIND_API_KEY` | Yes | — | Your Hivemind API key |
| `HIVEMIND_BASE_URL` | No | `https://api.voltbots.com` | API base URL |

## License

Apache-2.0
