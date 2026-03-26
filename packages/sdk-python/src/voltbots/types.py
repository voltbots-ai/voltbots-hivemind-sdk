"""Type definitions matching the VoltBots Hivemind API schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

ProviderFamily = Literal["openai", "anthropic", "google", "xai", "volt"]
Severity = Literal["low", "medium", "high", "critical"]
MemoryType = Literal["decision", "error", "preference", "context", "environment", "user_style"]
Importance = Literal["critical", "important", "notable"]
ClientSource = Literal["claude-code", "codex", "sdk", "unknown"]


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class ReviewRequest(BaseModel):
    project_id: str = Field(serialization_alias="projectId")
    diff: str
    file_path: str = Field(serialization_alias="filePath")
    language: str
    author_model: str = Field(serialization_alias="authorModel")
    author_family: ProviderFamily = Field(serialization_alias="authorFamily")
    context: str | None = None


class TraceRequest(BaseModel):
    project_id: str = Field(serialization_alias="projectId")
    tool: str
    model: str
    family: ProviderFamily
    tier: str
    input: object
    output: object
    success: bool
    duration: float
    error: str | None = None


class MistakeRequest(BaseModel):
    project_id: str = Field(serialization_alias="projectId")
    error_type: str = Field(serialization_alias="errorType")
    description: str
    root_cause: str = Field(serialization_alias="rootCause")
    prevention: str
    severity: Severity
    model: str
    family: ProviderFamily
    tier: str
    domain: str | None = None


class MemoryWriteRequest(BaseModel):
    project_id: str = Field(serialization_alias="projectId")
    content: str
    type: MemoryType
    importance: Importance | None = None
    tags: list[str] | None = None
    related_files: list[str] | None = Field(default=None, serialization_alias="relatedFiles")


class KeySetRequest(BaseModel):
    provider: Literal["openai", "anthropic", "google", "xai"]
    api_key: str = Field(serialization_alias="apiKey")


# ---------------------------------------------------------------------------
# Response Models
# ---------------------------------------------------------------------------


class Warning(BaseModel):
    type: str
    pattern: str
    severity: Severity
    prevention: str
    root_cause: str = Field(alias="rootCause")


class WarningsResponse(BaseModel):
    warnings: list[Warning]
    injection_text: str | None = Field(alias="injectionText")
    meta: dict[str, object]


class ReviewFinding(BaseModel):
    severity: str
    description: str
    line: int | None = None
    suggestion: str | None = None


class ReviewResponse(BaseModel):
    findings: list[ReviewFinding]
    reviewer_bot: str = Field(alias="reviewerBot")
    reviewer_model: str = Field(alias="reviewerModel")
    reviewer_tier: str = Field(alias="reviewerTier")
    reviewer_family: ProviderFamily = Field(alias="reviewerFamily")
    meta: dict[str, object]


class DetectedMistake(BaseModel):
    error_type: str = Field(alias="errorType")
    description: str


class TraceResponse(BaseModel):
    recorded: bool
    mistakes_detected: list[DetectedMistake] = Field(alias="mistakesDetected")
    warning: str | None = None
    meta: dict[str, object]


class MistakeResponse(BaseModel):
    mistake_id: str = Field(alias="mistakeId")


class Memory(BaseModel):
    id: str
    type: MemoryType
    content: str
    importance: Importance
    tags: list[str]
    related_files: list[str] = Field(alias="relatedFiles")
    created_at: str = Field(alias="createdAt")


class MemorySearchResponse(BaseModel):
    memories: list[Memory]


class MemoryWriteResponse(BaseModel):
    memory_id: str = Field(alias="memoryId")


class InsightsResponse(BaseModel):
    insights: dict[str, object]
    meta: dict[str, object]
