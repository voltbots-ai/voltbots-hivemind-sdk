"""Hivemind API client — async-first with sync wrapper."""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

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
    MemorySearchResponse,
    MemoryWriteRequest,
    MemoryWriteResponse,
    MistakeRequest,
    MistakeResponse,
    ReviewRequest,
    ReviewResponse,
    TraceRequest,
    TraceResponse,
    WarningsResponse,
)

SDK_VERSION = "0.1.0"
DEFAULT_BASE_URL = "https://api.voltbots.com"
DEFAULT_TIMEOUT = 30.0
DEFAULT_MAX_RETRIES = 3
DEFAULT_RETRY_BASE_S = 1.0


class HiveMind:
    """Async Hivemind API client."""

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        source: str = "sdk",
        version: str = SDK_VERSION,
        max_retries: int = DEFAULT_MAX_RETRIES,
        retry_base_s: float = DEFAULT_RETRY_BASE_S,
        timeout: float = DEFAULT_TIMEOUT,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        if not api_key:
            raise ValueError("api_key is required")

        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._source = source
        self._version = version
        self._max_retries = max(0, max_retries)
        self._retry_base_s = retry_base_s
        self._timeout = timeout if timeout > 0 else DEFAULT_TIMEOUT
        self._owns_client = http_client is None
        self._client = http_client or httpx.AsyncClient(timeout=timeout)

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def __aenter__(self) -> HiveMind:
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.close()

    # -----------------------------------------------------------------------
    # Core request method
    # -----------------------------------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str | None] | None = None,
        json: dict[str, Any] | None = None,
    ) -> Any:
        url = f"{self._base_url}{path}"
        headers = {
            "X-API-Key": self._api_key,
            "X-Client-Source": self._source,
            "X-Client-Version": self._version,
        }

        # Filter None params
        clean_params = {k: v for k, v in (params or {}).items() if v is not None}

        last_error: Exception | None = None

        for attempt in range(self._max_retries + 1):
            try:
                resp = await self._client.request(
                    method,
                    url,
                    headers=headers,
                    params=clean_params or None,
                    json=json,
                )

                if resp.is_success:
                    if resp.status_code == 204:
                        return None
                    return resp.json()

                body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {"error": resp.text}

                if resp.status_code == 429:
                    err = RateLimitError(body)
                    last_error = err
                    if attempt < self._max_retries:
                        exponential_backoff = self._retry_base_s * (2 ** attempt)
                        backoff = max(
                            err.retry_after_ms / 1000,
                            exponential_backoff,
                        )
                        await asyncio.sleep(backoff)
                        continue
                    raise err

                if resp.status_code == 400:
                    raise ValidationError(body)
                if resp.status_code == 401:
                    raise AuthError(body)
                if resp.status_code == 413:
                    raise PayloadTooLargeError(body)
                if resp.status_code == 501:
                    raise NotImplementedError_(body)

                raise HiveMindError(
                    f"HTTP {resp.status_code}",
                    resp.status_code,
                    body.get("error", "unknown") if isinstance(body, dict) else "unknown",
                    body,
                )

            except HiveMindError:
                raise
            except httpx.TimeoutException:
                last_error = HiveMindError("Request timed out", 0, "timeout")
                if attempt >= self._max_retries:
                    raise last_error
                await asyncio.sleep(self._retry_base_s * (2 ** attempt))
            except Exception as exc:
                last_error = HiveMindError(str(exc), 0, "network_error")
                if attempt >= self._max_retries:
                    raise last_error
                await asyncio.sleep(self._retry_base_s * (2 ** attempt))

        raise last_error  # type: ignore[misc]

    # -----------------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------------

    async def get_warnings(
        self,
        *,
        project_id: str,
        file_path: str | None = None,
        domain: str | None = None,
        author_model: str | None = None,
        author_family: str | None = None,
    ) -> WarningsResponse:
        data = await self._request("GET", "/v1/hivemind/warnings", params={
            "projectId": project_id,
            "filePath": file_path,
            "domain": domain,
            "authorModel": author_model,
            "authorFamily": author_family,
        })
        return WarningsResponse.model_validate(data)

    async def submit_review(self, request: ReviewRequest) -> ReviewResponse:
        data = await self._request(
            "POST", "/v1/hivemind/review",
            json=request.model_dump(by_alias=True, exclude_none=True),
        )
        return ReviewResponse.model_validate(data)

    async def submit_trace(self, request: TraceRequest) -> TraceResponse:
        data = await self._request(
            "POST", "/v1/hivemind/trace",
            json=request.model_dump(by_alias=True, exclude_none=True),
        )
        return TraceResponse.model_validate(data)

    async def report_mistake(self, request: MistakeRequest) -> MistakeResponse:
        data = await self._request(
            "POST", "/v1/hivemind/mistake",
            json=request.model_dump(by_alias=True, exclude_none=True),
        )
        return MistakeResponse.model_validate(data)

    async def search_memory(
        self,
        *,
        project_id: str,
        query: str,
    ) -> MemorySearchResponse:
        data = await self._request("GET", "/v1/hivemind/memory", params={
            "projectId": project_id,
            "query": query,
        })
        return MemorySearchResponse.model_validate(data)

    async def write_memory(self, request: MemoryWriteRequest) -> MemoryWriteResponse:
        data = await self._request(
            "POST", "/v1/hivemind/memory",
            json=request.model_dump(by_alias=True, exclude_none=True),
        )
        return MemoryWriteResponse.model_validate(data)

    async def get_insights(
        self,
        *,
        project_id: str | None = None,
        bot_name: str | None = None,
        metric: str | None = None,
    ) -> InsightsResponse:
        data = await self._request("GET", "/v1/hivemind/insights", params={
            "projectId": project_id,
            "botName": bot_name,
            "metric": metric,
        })
        return InsightsResponse.model_validate(data)

    async def set_key(self, request: KeySetRequest) -> None:
        await self._request(
            "POST", "/v1/hivemind/keys",
            json=request.model_dump(by_alias=True),
        )

    async def list_keys(self) -> Any:
        return await self._request("GET", "/v1/hivemind/keys")

    async def revoke_key(self, provider: str) -> None:
        await self._request("DELETE", "/v1/hivemind/keys", params={"provider": provider})


class HiveMindSync:
    """Synchronous wrapper around the async HiveMind client."""

    def __init__(self, **kwargs: Any) -> None:
        self._async = HiveMind(**kwargs)

    def _run(self, coro: Any) -> Any:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(asyncio.run, coro).result()
        return asyncio.run(coro)

    def get_warnings(self, **kwargs: Any) -> WarningsResponse:
        return self._run(self._async.get_warnings(**kwargs))

    def submit_review(self, request: ReviewRequest) -> ReviewResponse:
        return self._run(self._async.submit_review(request))

    def submit_trace(self, request: TraceRequest) -> TraceResponse:
        return self._run(self._async.submit_trace(request))

    def report_mistake(self, request: MistakeRequest) -> MistakeResponse:
        return self._run(self._async.report_mistake(request))

    def search_memory(self, **kwargs: Any) -> MemorySearchResponse:
        return self._run(self._async.search_memory(**kwargs))

    def write_memory(self, request: MemoryWriteRequest) -> MemoryWriteResponse:
        return self._run(self._async.write_memory(request))

    def get_insights(self, **kwargs: Any) -> InsightsResponse:
        return self._run(self._async.get_insights(**kwargs))

    def close(self) -> None:
        self._run(self._async.close())
