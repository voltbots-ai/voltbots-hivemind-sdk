"""Tests for the enhance_prompt helper."""

from voltbots import enhance_prompt, WarningsResponse, Warning


def test_enhance_with_injection_text():
    warnings = WarningsResponse(
        warnings=[
            Warning(
                type="null_check",
                pattern="Misses null checks",
                severity="high",
                prevention="Use optional chaining",
                rootCause="Assumed non-null",
                source="project",
                bot="cleo",
            )
        ],
        injectionText="KNOWN ISSUES:\n- Misses null checks",
        meta={},
    )

    result = enhance_prompt("Write a login function", warnings)

    assert "KNOWN ISSUES" in result
    assert "Write a login function" in result
    assert result.index("KNOWN ISSUES") < result.index("Write a login")


def test_enhance_without_injection_text():
    warnings = WarningsResponse(
        warnings=[],
        injectionText=None,
        meta={},
    )

    result = enhance_prompt("Write a login function", warnings)

    assert result == "Write a login function"
