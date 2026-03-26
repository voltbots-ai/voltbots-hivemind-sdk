# VoltBots Hivemind — Claude Code Plugin

Integrates VoltBots Hivemind into Claude Code with automatic warning injection and trace capture.

## What It Does

- **PreToolUse hook**: Before Claude writes or edits a file, queries Hivemind for known issues and injects warnings into context
- **PostToolUse hook**: After any tool execution, captures the trace for the learning system
- **MCP tools**: Full Hivemind access via MCP — search warnings, request cross-family review, report mistakes, manage project memory

## Quick Setup

### 1. Install

```bash
npm install -g @voltbots/mcp-hivemind @voltbots/claude-code-plugin
```

### 2. Get an API Key

Sign up at [voltbots.com](https://voltbots.com) and create a Hivemind API key.

### 3. Configure Claude Code

Add to your `.claude/settings.json`:

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

### 4. (Optional) Enable Hooks

For automatic warning injection and trace capture, add hooks to your settings:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "write_to_file|edit_file|create_file",
        "command": "node ./node_modules/@voltbots/claude-code-plugin/dist/hooks/pre-tool-use.js"
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "command": "node ./node_modules/@voltbots/claude-code-plugin/dist/hooks/post-tool-use.js"
      }
    ]
  }
}
```

Set the required environment variables:

```bash
export HIVEMIND_API_KEY="your-api-key"
export HIVEMIND_PROJECT_ID="your-project-id"
```

## MCP Tools Available

Once configured, these tools are available in Claude Code:

| Tool | Description |
|------|-------------|
| `get_warnings` | Get known issues before making edits |
| `request_review` | Cross-family code review |
| `submit_trace` | Record tool execution for learning |
| `report_mistake` | Report an AI mistake |
| `search_memory` | Search project memory |
| `write_memory` | Store project context |
| `get_insights` | Performance insights |

## How It Works

1. You write code with Claude Code (Anthropic)
2. Before each edit, the PreToolUse hook checks Hivemind for relevant warnings
3. Warnings are injected into Claude's context ("watch out for X in this area")
4. After each tool runs, the PostToolUse hook captures the trace
5. Failed traces are auto-detected as mistakes and feed future warnings
6. You can request cross-family review: a different AI family catches what Claude might miss

## License

Apache-2.0
