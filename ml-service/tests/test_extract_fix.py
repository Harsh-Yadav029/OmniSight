import pytest
from vlm_engine.analyze import VLMResponse
from orchestrator.extract_fix import extract_fix, CodeFix

def test_extract_fix_valid_vlm_response():
    vlm = VLMResponse(
        has_issue=True,
        issue_type="hidden button",
        description="submit button clipped off mobile viewport",
        affected_selector="#submit-order-button",
        suggested_tailwind_classes="w-full py-3.5 px-6 relative opacity-100",
        suggested_css="position: relative; opacity: 1;",
        confidence=0.95
    )
    fix = extract_fix(vlm)
    assert isinstance(fix, CodeFix)
    assert fix.selector == "#submit-order-button"
    assert fix.tailwind_classes == "w-full py-3.5 px-6 relative opacity-100"
    assert fix.file_hint == "src/components/SubmitButton.jsx"
    print("\n[PASS] Test 1: extract_fix correctly creates CodeFix with inferred file_hint and normalized classes.")

def test_extract_fix_priority_and_normalization():
    raw_dict = {
        "has_issue": True,
        "issue_type": "overlapping elements",
        "description": "product card button overlaps description text",
        "affected_selector": ".product-card",
        "suggested_tailwind_classes": "  'flex flex-col gap-4'  ",
        "suggested_css": "display: flex;",
        "confidence": 0.9
    }
    fix = extract_fix(raw_dict)
    assert fix.tailwind_classes == "flex flex-col gap-4"
    assert fix.file_hint == "src/components/ProductCard.jsx"
    print("[PASS] Test 2: extract_fix strips quotes and extra whitespace from class strings.")

def test_extract_fix_empty_issue_raises_value_error():
    malformed_vlm = VLMResponse(
        has_issue=True,
        issue_type="",
        description="Visual defect observed",
        affected_selector="",
        suggested_tailwind_classes="",
        suggested_css="",
        confidence=0.5
    )
    # Must raise ValueError because no target selector and no classes exist
    with pytest.raises(ValueError) as excinfo:
        extract_fix(malformed_vlm)
    assert "Cannot apply a blind fix" in str(excinfo.value) or "selector" in str(excinfo.value)
    print("[PASS] Test 3: extract_fix raises ValueError on malformed/blind fix responses without targets.")
