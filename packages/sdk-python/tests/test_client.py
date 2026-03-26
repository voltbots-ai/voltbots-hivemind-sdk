"""Tests for the Hivemind Python SDK client."""

import pytest
import httpx
import respx

from voltbots import HiveMind, AuthError, RateLimitError, ValidationError


BASE_URL = "https://test.voltbots.com"


@pytest.fixture
def client():
    return HiveMind(
        api_key="test-key",
        base_url=BASE_URL,
        max_retries=0,
    )


@pytest.mark.asyncio
async def test_get_warnings(client: HiveMind):
    with respx.mock:
        respx.get(f"{BASE_URL}/v1/hivemind/warnings").mock(
            return_value=httpx.Response(200, json={
                "warnings": [
                    {
                        "type": "null_check",
                        "pattern": "Misses null checks",
                        "severity": "high",
                        "prevention": "Use optional chaining",
                        "rootCause": "Assumed non-null",
                        "source": "project",
                        "bot": "cleo",
                    }
                ],
                "injectionText": "KNOWN ISSUES:\n- Misses null checks",
                "meta": {"projectId": "p1"},
            })
        )

        result = await client.get_warnings(project_id="p1")

        assert len(result.warnings) == 1
        assert result.warnings[0].type == "null_check"
        assert result.injection_text is not None
        assert "null checks" in result.injection_text


@pytest.mark.asyncio
async def test_get_warnings_sends_correct_params(client: HiveMind):
    with respx.mock:
        route = respx.get(f"{BASE_URL}/v1/hivemind/warnings").mock(
            return_value=httpx.Response(200, json={
                "warnings": [],
                "injectionText": None,
                "meta": {},
            })
        )

        await client.get_warnings(
            project_id="p1",
            file_path="src/app.ts",
            author_model="claude-sonnet-4",
            author_family="anthropic",
        )

        assert route.called
        request = route.calls[0].request
        assert "projectId=p1" in str(request.url)
        assert "authorModel=claude-sonnet-4" in str(request.url)
        assert request.headers["X-API-Key"] == "test-key"
        assert request.headers["X-Client-Source"] == "sdk"


@pytest.mark.asyncio
async def test_auth_error(client: HiveMind):
    with respx.mock:
        respx.get(f"{BASE_URL}/v1/hivemind/warnings").mock(
            return_value=httpx.Response(401, json={"error": "unauthorized"})
        )

        with pytest.raises(AuthError):
            await client.get_warnings(project_id="p1")


@pytest.mark.asyncio
async def test_rate_limit_error(client: HiveMind):
    with respx.mock:
        respx.get(f"{BASE_URL}/v1/hivemind/warnings").mock(
            return_value=httpx.Response(429, json={
                "error": "rate_limited",
                "retryAfterMs": 30000,
            })
        )

        with pytest.raises(RateLimitError) as exc_info:
            await client.get_warnings(project_id="p1")

        assert exc_info.value.retry_after_ms == 30000


@pytest.mark.asyncio
async def test_validation_error(client: HiveMind):
    with respx.mock:
        respx.post(f"{BASE_URL}/v1/hivemind/review").mock(
            return_value=httpx.Response(400, json={
                "error": "validation_error",
                "details": [],
            })
        )

        from voltbots import ReviewRequest

        with pytest.raises(ValidationError):
            await client.submit_review(ReviewRequest(
                project_id="p1",
                diff="test",
                file_path="f.ts",
                language="typescript",
                author_model="claude-sonnet-4",
                author_family="anthropic",
            ))


@pytest.mark.asyncio
async def test_report_mistake(client: HiveMind):
    with respx.mock:
        respx.post(f"{BASE_URL}/v1/hivemind/mistake").mock(
            return_value=httpx.Response(201, json={"mistakeId": "mk_123"})
        )

        from voltbots import MistakeRequest

        result = await client.report_mistake(MistakeRequest(
            project_id="p1",
            error_type="null_check",
            description="Missed null check",
            root_cause="Assumed non-null",
            prevention="Use optional chaining",
            severity="medium",
            model="claude-sonnet-4",
            family="anthropic",
            tier="balanced",
        ))

        assert result.mistake_id == "mk_123"


@pytest.mark.asyncio
async def test_search_memory(client: HiveMind):
    with respx.mock:
        respx.get(f"{BASE_URL}/v1/hivemind/memory").mock(
            return_value=httpx.Response(200, json={
                "memories": [
                    {
                        "id": "mem_1",
                        "type": "decision",
                        "content": "Uses JWT for auth",
                        "importance": "important",
                        "tags": ["auth"],
                        "relatedFiles": ["src/auth.ts"],
                        "createdAt": "2026-03-26T00:00:00Z",
                    }
                ]
            })
        )

        result = await client.search_memory(project_id="p1", query="auth")

        assert len(result.memories) == 1
        assert result.memories[0].content == "Uses JWT for auth"
        assert result.memories[0].tags == ["auth"]
