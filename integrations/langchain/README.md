# VoltBots Hivemind — LangChain Integration

Use VoltBots Hivemind as a LangChain callback for automatic mistake tracking.

## Setup

```bash
pip install voltbots langchain
```

## Callback Handler

```python
from langchain.callbacks.base import BaseCallbackHandler
from voltbots import HiveMindSync, MistakeRequest


class HiveMindCallback(BaseCallbackHandler):
    """Reports LLM errors to VoltBots Hivemind."""

    def __init__(self, api_key: str, project_id: str):
        self.hivemind = HiveMindSync(api_key=api_key)
        self.project_id = project_id

    def on_llm_error(self, error: BaseException, **kwargs) -> None:
        model = kwargs.get("invocation_params", {}).get("model_name", "unknown")
        self.hivemind.report_mistake(MistakeRequest(
            project_id=self.project_id,
            error_type="llm_error",
            description=str(error),
            root_cause="LLM invocation failed",
            prevention="Check model availability and input format",
            severity="medium",
            model=model,
            family="unknown",
            tier="unknown",
        ))


# Usage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o",
    callbacks=[HiveMindCallback(api_key="your-key", project_id="my-project")],
)
```

## Warning Injection

```python
from voltbots import HiveMindSync, enhance_prompt

hivemind = HiveMindSync(api_key="your-key")

warnings = hivemind.get_warnings(
    project_id="my-project",
    author_model="gpt-4o",
    author_family="openai",
)

enhanced = enhance_prompt(original_prompt, warnings)
```

## License

Apache-2.0
