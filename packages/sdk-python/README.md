# voltbots

Python SDK for the VoltBots Hivemind API.

## Install

```bash
pip install voltbots
```

## Usage

### Async (recommended)

```python
from voltbots import HiveMind, enhance_prompt

async with HiveMind(api_key="your-key") as hivemind:
    warnings = await hivemind.get_warnings(
        project_id="my-project",
        author_model="claude-sonnet-4",
        author_family="anthropic",
    )
    enhanced = enhance_prompt(my_prompt, warnings)
```

### Sync

```python
from voltbots import HiveMindSync

hivemind = HiveMindSync(api_key="your-key")
warnings = hivemind.get_warnings(project_id="my-project")
```

## API

| Method | Description |
|--------|-------------|
| `get_warnings(**kwargs)` | Get model-specific warnings |
| `submit_review(request)` | Cross-family code review |
| `submit_trace(request)` | Record tool execution |
| `report_mistake(request)` | Report an AI mistake |
| `search_memory(**kwargs)` | Search project memory |
| `write_memory(request)` | Store project memory |
| `get_insights(**kwargs)` | Performance insights |
| `enhance_prompt(prompt, warnings)` | Prepend warnings to prompt |

## License

Apache-2.0
