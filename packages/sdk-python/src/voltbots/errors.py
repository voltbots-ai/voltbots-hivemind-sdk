"""Error types for the VoltBots Hivemind SDK."""

from __future__ import annotations

from typing import Any


class HiveMindError(Exception):
    """Base error for all Hivemind API errors."""

    def __init__(
        self,
        message: str,
        status_code: int,
        error_code: str,
        body: Any = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.body = body


class AuthError(HiveMindError):
    """401 — Invalid or missing API key."""

    def __init__(self, body: Any = None) -> None:
        super().__init__("Unauthorized — invalid or missing API key", 401, "unauthorized", body)


class ValidationError(HiveMindError):
    """400 — Request validation failed."""

    def __init__(self, body: Any = None) -> None:
        super().__init__("Validation failed", 400, "validation_error", body)


class RateLimitError(HiveMindError):
    """429 — Rate limit exceeded."""

    def __init__(self, body: Any = None) -> None:
        super().__init__("Rate limit exceeded", 429, "rate_limited", body)
        self.retry_after_ms: int = (
            body.get("retryAfterMs", 60_000) if isinstance(body, dict) else 60_000
        )


class PayloadTooLargeError(HiveMindError):
    """413 — Request body exceeds 1 MB."""

    def __init__(self, body: Any = None) -> None:
        super().__init__("Payload too large (max 1 MB)", 413, "payload_too_large", body)


class NotImplementedError_(HiveMindError):
    """501 — Endpoint not yet implemented."""

    def __init__(self, body: Any = None) -> None:
        super().__init__("Endpoint not yet implemented", 501, "not_implemented", body)
