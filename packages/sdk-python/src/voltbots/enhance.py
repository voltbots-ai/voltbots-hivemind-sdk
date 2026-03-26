"""Client-side prompt enhancement with Hivemind warnings."""

from __future__ import annotations

from .types import WarningsResponse


def enhance_prompt(prompt: str, warnings: WarningsResponse) -> str:
    """Prepend Hivemind warnings to a prompt.

    Uses the server-generated injection_text when available.
    No API call is made — this is a client-side helper.
    """
    if not warnings.injection_text:
        return prompt

    return f"{warnings.injection_text}\n\n---\n\n{prompt}"
