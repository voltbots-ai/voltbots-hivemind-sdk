"""
VoltBots Hivemind SDK — Python Usage Examples

pip install voltbots
"""

import asyncio
import os

from voltbots import (
    HiveMind,
    HiveMindSync,
    MistakeRequest,
    MemoryWriteRequest,
    ReviewRequest,
    TraceRequest,
    enhance_prompt,
)


async def async_example():
    """Async usage (recommended for production)."""

    async with HiveMind(api_key=os.environ["HIVEMIND_API_KEY"]) as hivemind:

        # 1. Get warnings
        warnings = await hivemind.get_warnings(
            project_id="my-project",
            file_path="src/auth.py",
            author_model="claude-sonnet-4",
            author_family="anthropic",
        )
        print(f"Found {len(warnings.warnings)} warnings")

        # Enhance a prompt
        enhanced = enhance_prompt("Implement JWT authentication", warnings)
        print(enhanced)

        # 2. Cross-family code review
        review = await hivemind.submit_review(ReviewRequest(
            project_id="my-project",
            diff="+ def login(email, password):\n+     user = db.find_user(email)\n+     if user.password == password:\n+         return create_session(user)",
            file_path="src/auth.py",
            language="python",
            author_model="claude-sonnet-4",
            author_family="anthropic",
        ))
        print(f"Review by {review.reviewer_model} ({review.reviewer_family}):")
        for finding in review.findings:
            print(f"  [{finding.severity}] {finding.description}")

        # 3. Report a mistake
        result = await hivemind.report_mistake(MistakeRequest(
            project_id="my-project",
            error_type="security",
            description="Compared passwords in plaintext",
            root_cause="Forgot to hash password before comparison",
            prevention="Always use bcrypt.checkpw() for password verification",
            severity="critical",
            model="claude-sonnet-4",
            family="anthropic",
            tier="balanced",
            domain="auth",
        ))
        print(f"Mistake recorded: {result.mistake_id}")

        # 4. Project memory
        await hivemind.write_memory(MemoryWriteRequest(
            project_id="my-project",
            content="Uses bcrypt for password hashing",
            type="decision",
            importance="important",
            tags=["auth", "security"],
        ))

        memories = await hivemind.search_memory(
            project_id="my-project",
            query="password",
        )
        for mem in memories.memories:
            print(f"[{mem.type}] {mem.content}")


def sync_example():
    """Sync usage (simpler, good for scripts)."""

    hivemind = HiveMindSync(api_key=os.environ["HIVEMIND_API_KEY"])

    warnings = hivemind.get_warnings(
        project_id="my-project",
        author_model="gpt-4o",
        author_family="openai",
    )
    print(f"Found {len(warnings.warnings)} warnings")

    hivemind.close()


if __name__ == "__main__":
    asyncio.run(async_example())
