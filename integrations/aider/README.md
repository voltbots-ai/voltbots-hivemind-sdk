# VoltBots Hivemind — Aider Integration

Use VoltBots Hivemind with [Aider](https://aider.chat) for AI mistake prevention.

## Setup

```bash
pip install voltbots
```

## Usage

### Get Warnings Before a Task

```python
from voltbots import HiveMindSync

hivemind = HiveMindSync(api_key="your-api-key")

warnings = hivemind.get_warnings(
    project_id="my-project",
    author_model="claude-sonnet-4",
    author_family="anthropic",
)

if warnings.injection_text:
    print(warnings.injection_text)
```

### Report Mistakes

```python
from voltbots import HiveMindSync, MistakeRequest

hivemind = HiveMindSync(api_key="your-api-key")

hivemind.report_mistake(MistakeRequest(
    project_id="my-project",
    error_type="logic_error",
    description="Incorrect loop boundary",
    root_cause="Off-by-one in iteration",
    prevention="Use range(len(items)) instead of range(len(items)-1)",
    severity="medium",
    model="claude-sonnet-4",
    family="anthropic",
    tier="balanced",
))
```

### Aider Conventions File

Add to your `.aider.conventions.md`:

```markdown
## Known AI Mistakes

Before implementing changes, check VoltBots Hivemind for model-specific
warnings using the voltbots Python SDK.
```

## License

Apache-2.0
