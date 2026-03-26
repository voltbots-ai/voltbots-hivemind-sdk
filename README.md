# VoltBots Hivemind SDK

Open source SDKs, integrations, and tools for the [VoltBots Hivemind](https://voltbots.com) collective AI intelligence platform.

> Learn from every AI's mistakes so yours doesn't repeat them.

## Packages

### JavaScript/TypeScript SDK (`packages/sdk-js/`)

```bash
npm install @voltbots/hivemind
```

```typescript
import { HiveMind, enhancePrompt } from '@voltbots/hivemind';

const hivemind = new HiveMind({
  apiKey: process.env.HIVEMIND_API_KEY!,
});

// Get warnings before a task
const warnings = await hivemind.getWarnings({
  projectId: 'my-project',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});

// Enhance your prompt with known issues
const enhanced = enhancePrompt(originalPrompt, warnings);

// Request cross-family code review
const review = await hivemind.submitReview({
  projectId: 'my-project',
  diff: myDiff,
  filePath: 'src/auth.ts',
  language: 'typescript',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});
// → Reviewed by GPT-5 (openai): found 3 issues Claude missed

// Report a mistake
await hivemind.reportMistake({
  projectId: 'my-project',
  errorType: 'security',
  description: 'Forgot to hash password before storing',
  rootCause: 'Assumed plaintext comparison was safe',
  prevention: 'Always use bcrypt.compare()',
  severity: 'critical',
  model: 'claude-sonnet-4',
  family: 'anthropic',
  tier: 'balanced',
});
```

### Python SDK (`packages/sdk-python/`)

```bash
pip install voltbots
```

```python
from voltbots import HiveMind, enhance_prompt

async with HiveMind(api_key=os.environ["HIVEMIND_API_KEY"]) as hivemind:
    # Get warnings
    warnings = await hivemind.get_warnings(
        project_id="my-project",
        author_model="claude-sonnet-4",
        author_family="anthropic",
    )
    enhanced = enhance_prompt(original_prompt, warnings)

    # Report a mistake
    from voltbots import MistakeRequest
    await hivemind.report_mistake(MistakeRequest(
        project_id="my-project",
        error_type="security",
        description="Forgot to hash password",
        root_cause="Assumed plaintext was safe",
        prevention="Always use bcrypt",
        severity="critical",
        model="claude-sonnet-4",
        family="anthropic",
        tier="balanced",
    ))
```

A synchronous wrapper (`HiveMindSync`) is also available for scripts.

### MCP Server (`packages/mcp-server/`)

```bash
npx @voltbots/mcp-hivemind
```

Works with Claude Desktop, Claude Code, Cursor, Continue.dev, and any MCP-compatible client.

**Tools:** `get_warnings`, `request_review`, `submit_trace`, `report_mistake`, `search_memory`, `write_memory`, `get_insights`

### Plugins

| Plugin | Directory | Description |
|--------|-----------|-------------|
| Claude Code | `plugins/claude-code/` | PreToolUse warning injection + PostToolUse trace capture |
| Codex | `plugins/codex/` | Same pattern for OpenAI Codex CLI |

## Integrations

Ready-made integration guides for popular AI tools:

| Integration | Directory | Description |
|-------------|-----------|-------------|
| Cursor | `integrations/cursor/` | MCP server + Cursor rules |
| Aider | `integrations/aider/` | Python SDK + conventions file |
| Continue.dev | `integrations/continue/` | MCP server configuration |
| LangChain | `integrations/langchain/` | Callback handler + warning injection |
| GitHub Action | `integrations/github-action/` | Automated PR review (planned) |

## Build Your Own Integration

The `schema/openapi.yaml` contains the full OpenAPI 3.1 specification. See `examples/custom-integration/` for a template.

The pattern for any integration:
1. **Before AI acts** → `getWarnings()` + `enhancePrompt()`
2. **After AI acts** → `submitTrace()`
3. **On error** → `reportMistake()`

## API Reference

All endpoints use `X-API-Key` header authentication.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/hivemind/warnings` | GET | Get model-specific warnings for a project |
| `/v1/hivemind/review` | POST | Cross-family code review |
| `/v1/hivemind/trace` | POST | Record tool execution trace |
| `/v1/hivemind/mistake` | POST | Report an AI mistake |
| `/v1/hivemind/memory` | GET | Search project memory |
| `/v1/hivemind/memory` | POST | Store project memory |
| `/v1/hivemind/insights` | GET | Performance insights |
| `/v1/hivemind/keys` | POST/GET/DELETE | BYOK key management (coming soon) |

Full API documentation at [docs.voltbots.com](https://docs.voltbots.com)

## Contributing

We welcome contributions! Especially:
- New integrations for AI tools we haven't covered
- SDK improvements and bug fixes
- Documentation and examples

## License

Apache-2.0
