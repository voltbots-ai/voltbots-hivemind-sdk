# Examples

## basic-usage/

Complete examples showing all SDK features:

- **typescript.ts** — TypeScript/JavaScript SDK usage
- **python.py** — Python SDK usage (async + sync)

## custom-integration/

- **template.ts** — Template for building your own integration

The pattern for any integration:
1. Before AI acts: `getWarnings()` + `enhancePrompt()`
2. After AI acts: `submitTrace()`
3. On error: `reportMistake()`
