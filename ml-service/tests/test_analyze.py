import pytest
from pathlib import Path
from vlm_engine.analyze import VLMResponse, extract_json_from_text, analyze_screenshot

def test_vlm_response_schema():
    valid_data = {
        "has_issue": True,
        "issue_type": "hidden button",
        "description": "Submit button clipped off mobile viewport",
        "affected_selector": "#submit-order-button",
        "suggested_tailwind_classes": "w-full py-3.5 relative opacity-100",
        "suggested_css": "position: relative; opacity: 1;",
        "confidence": 0.95
    }
    response = VLMResponse(**valid_data)
    assert response.has_issue is True
    assert response.affected_selector == "#submit-order-button"
    assert response.confidence == 0.95

def test_extract_json_from_markdown():
    text_with_fences = """```json
    {
        "has_issue": false,
        "issue_type": "",
        "description": "No defects found",
        "affected_selector": "",
        "suggested_tailwind_classes": "",
        "suggested_css": "",
        "confidence": 1.0
    }
    ```"""
    parsed = extract_json_from_text(text_with_fences)
    assert parsed["has_issue"] is False
    assert parsed["confidence"] == 1.0

@pytest.mark.asyncio
async def test_analyze_screenshot_execution():
    test_screenshot = "runs/test-run-1/screenshots/checkout_375.png"
    if Path(test_screenshot).exists():
        result = await analyze_screenshot(test_screenshot, "<html><body><button>Test</button></body></html>")
        assert isinstance(result, dict)
        assert "has_issue" in result
        assert "confidence" in result
