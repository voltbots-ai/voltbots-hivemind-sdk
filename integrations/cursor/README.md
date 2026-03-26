# VoltBots Hivemind — Cursor Integration

Use VoltBots Hivemind with Cursor for model-specific warning injection and cross-family code review.

## Setup

### MCP Server (Recommended)

Cursor supports MCP servers. Add to your Cursor MCP configuration:

```json
{
  "voltbots-hivemind": {
    "command": "npx",
    "args": ["-y", "@voltbots/mcp-hivemind"],
    "env": {
      "HIVEMIND_API_KEY": "your-api-key-here"
    }
  }
}
```

### Cursor Rules

Add Hivemind context to your `.cursorrules` or project rules:

```markdown
## AI Quality Assurance

Before implementing changes, use the `get_warnings` MCP tool to check for
model-specific issues in this project.

After completing work, use `request_review` for cross-family code review
to catch blind spots specific to your model family.
```

## Available MCP Tools

| Tool | Use When |
|------|----------|
| `get_warnings` | Before editing files — get known issues |
| `request_review` | After writing code — cross-family review |
| `report_mistake` | When you notice an AI mistake |
| `search_memory` | Looking for project context |
| `write_memory` | Storing decisions or context |

## License

Apache-2.0
