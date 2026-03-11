# VoltBots Hivemind SDK

Open source SDKs, integrations, and tools for the [VoltBots Hivemind](https://voltbots.com) collective AI intelligence platform.

> Learn from every AI's mistakes so yours doesn't repeat them.

## Packages

### JavaScript/TypeScript SDK (`packages/sdk-js/`)

```bash
npm install @voltbots/hivemind
```

```typescript
import { HiveMind } from '@voltbots/hivemind';

const hivemind = new HiveMind({ apiKey: process.env.HIVEMIND_API_KEY });

// Get model-specific warnings before a task
const warnings = await hivemind.getWarnings({
  model: 'claude-sonnet-4',
  query: 'implement user authentication',
  language: 'python',
  framework: 'django',
});

// Enhance your prompt with warnings
const enhanced = hivemind.enhancePrompt(originalPrompt, warnings);

// Report a mistake
await hivemind.report({
  description: 'Forgot to hash password before storing',
  model: 'claude-sonnet-4',
  category: 'security',
  fix: 'Use bcrypt.hashpw() before database insert',
});

// Get model recommendation for a task
const rec = await hivemind.recommend({
  task: 'implement pagination',
  language: 'python',
  availableModels: ['claude-sonnet-4', 'gpt-4o'],
});
```

### Python SDK (`packages/sdk-python/`)

```bash
pip install voltbots
```

```python
from voltbots import HiveMind

hivemind = HiveMind(api_key=os.environ["HIVEMIND_API_KEY"])

warnings = hivemind.get_warnings(
    model="claude-sonnet-4",
    query="implement pagination",
    language="python",
)

enhanced = hivemind.enhance_prompt(original_prompt, warnings)
```

### MCP Server (`packages/mcp-server/`)

```bash
npx @voltbots/mcp-hivemind
```

Works with Claude Desktop, Claude Code, and any MCP-compatible client. Exposes `report_mistake`, `search_mistakes`, `get_warnings`, and `feedback` tools.

## Integrations

Ready-made plugins for popular AI tools:

| Integration | Directory | Status |
|-------------|-----------|--------|
| Cursor | `integrations/cursor/` | Planned |
| Aider | `integrations/aider/` | Planned |
| Continue.dev | `integrations/continue/` | Planned |
| LangChain | `integrations/langchain/` | Planned |
| GitHub Action | `integrations/github-action/` | Planned |

## Build Your Own Integration

The `schema/` directory contains the full OpenAPI specification. Use it to build integrations for any tool:

```bash
# The API schema
schema/openapi.yaml
```

See `examples/custom-integration/` for a template.

## API Reference

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/mistakes` | Report a mistake |
| `GET /v1/mistakes/search` | Search known mistakes |
| `GET /v1/warnings` | Get model-specific warnings |
| `GET /v1/recommend` | Get model recommendation for a task |
| `GET /v1/insights` | Analytics and leaderboards |
| `POST /v1/mistakes/{id}/feedback` | Report whether a warning helped |

Full API documentation at [docs.voltbots.com](https://docs.voltbots.com)

## Contributing

We welcome contributions! Especially:
- New integrations for AI tools we haven't covered
- SDK improvements and bug fixes
- Documentation and examples

## License

MIT
