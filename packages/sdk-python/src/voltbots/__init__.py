"""VoltBots Hivemind Python SDK."""

from .client import HiveMind, HiveMindSync
from .enhance import enhance_prompt
from .errors import (
    AuthError,
    HiveMindError,
    NotImplementedError_,
    PayloadTooLargeError,
    RateLimitError,
    ValidationError,
)
from .types import (
    InsightsResponse,
    KeySetRequest,
    Memory,
    MemorySearchResponse,
    MemoryType,
    MemoryWriteRequest,
    MemoryWriteResponse,
    MistakeRequest,
    MistakeResponse,
    ReviewFinding,
    ReviewRequest,
    ReviewResponse,
    TraceRequest,
    TraceResponse,
    Warning,
    WarningsResponse,
)

__all__ = [
    "HiveMind",
    "HiveMindSync",
    "enhance_prompt",
    # Errors
    "HiveMindError",
    "AuthError",
    "ValidationError",
    "RateLimitError",
    "PayloadTooLargeError",
    "NotImplementedError_",
    # Types
    "ReviewRequest",
    "TraceRequest",
    "MistakeRequest",
    "MemoryWriteRequest",
    "KeySetRequest",
    "Warning",
    "WarningsResponse",
    "ReviewFinding",
    "ReviewResponse",
    "TraceResponse",
    "MistakeResponse",
    "Memory",
    "MemorySearchResponse",
    "MemoryWriteResponse",
    "InsightsResponse",
    "MemoryType",
]

__version__ = "0.1.0"
