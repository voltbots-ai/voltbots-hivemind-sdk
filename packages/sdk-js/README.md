# @voltbots/hivemind

TypeScript/JavaScript SDK for the VoltBots Hivemind API.

## Install

```bash
npm install @voltbots/hivemind
```

## Usage

```typescript
import { HiveMind, enhancePrompt } from '@voltbots/hivemind';

const hivemind = new HiveMind({
  apiKey: process.env.HIVEMIND_API_KEY!,
});

// Get warnings
const warnings = await hivemind.getWarnings({
  projectId: 'my-project',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});

// Enhance prompt with warnings
const enhanced = enhancePrompt(myPrompt, warnings);

// Cross-family code review
const review = await hivemind.submitReview({
  projectId: 'my-project',
  diff: myDiff,
  filePath: 'src/app.ts',
  language: 'typescript',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});

// Report a mistake
await hivemind.reportMistake({ ... });

// Project memory
await hivemind.writeMemory({ ... });
const memories = await hivemind.searchMemory({ ... });
```

## API

| Method | Description |
|--------|-------------|
| `getWarnings(params)` | Get model-specific warnings |
| `submitReview(body)` | Cross-family code review |
| `submitTrace(body)` | Record tool execution |
| `reportMistake(body)` | Report an AI mistake |
| `searchMemory(params)` | Search project memory |
| `writeMemory(body)` | Store project memory |
| `getInsights(params?)` | Performance insights |
| `enhancePrompt(prompt, warnings)` | Prepend warnings to prompt |

## License

Apache-2.0
