import pytest
from vlm_engine.groq_helper import summarize_for_pr, extract_json_from_text

def test_extract_json_from_markdown():
    raw_markdown = """```json
    {
      "pr_description": "Fixes visual clipping on submit button.",
      "commit_message": "fix(ui): adjust submit button position"
    }
    ```"""
    parsed = extract_json_from_text(raw_markdown)
    assert parsed["pr_description"] == "Fixes visual clipping on submit button."
    assert parsed["commit_message"] == "fix(ui): adjust submit button position"

@pytest.mark.asyncio
async def test_summarize_for_pr_structure():
    mock_finding = {
        "issue_type": "hidden button",
        "description": "submit button clipped off mobile viewport",
        "suggested_tailwind_classes": "relative opacity-100",
        "affected_selector": "#submit-order-button"
    }
    res = await summarize_for_pr(mock_finding, [])
    assert isinstance(res, dict)
    assert "pr_description" in res
    assert "commit_message" in res
    assert len(res["pr_description"]) > 10
    assert len(res["commit_message"]) > 5
