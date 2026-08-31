import os
import pytest
from orchestrator.github_integration import create_fix_pr, build_pr_body, perform_pr_action

def test_build_pr_body_structure():
    pr_body = build_pr_body(
        pr_description="Fixed clipped submit button on mobile viewport.",
        issue_type="hidden button",
        screenshot_before="runs/test-run-1/screenshots/checkout_375.png",
        screenshot_after="runs/test-run-1/screenshots/checkout_375_fixed.png",
        vlm_details={"issue_type": "hidden button", "confidence": 0.98}
    )
    assert "## 👁️ OmniSight Automated Visual Regression Fix" in pr_body
    assert "Fixed clipped submit button" in pr_body
    assert "checkout_375.png" in pr_body
    assert "checkout_375_fixed.png" in pr_body
    assert "hidden button" in pr_body
    print("\n[PASS] Test 1: build_pr_body constructs rich Markdown table and VLM details.")

@pytest.mark.asyncio
async def test_create_fix_pr_execution():
    test_details = {
        "issue_type": "hidden button",
        "commit_message": "fix(ui): restore submit button visibility",
        "pr_description": "Fixed clipped submit button on mobile viewport.",
        "file_path": "test-target-app/src/components/SubmitButton.jsx",
        "file_content": "// Clean verified SubmitButton component\n",
        "screenshot_before": "runs/test-run-1/screenshots/checkout_375.png",
        "screenshot_after": "runs/test-run-1/screenshots/checkout_375.png"
    }

    result = await create_fix_pr("test-run-1", test_details)
    assert isinstance(result, dict)
    assert "pr_url" in result
    assert "pr_number" in result
    assert "branch" in result
    assert "omnisight/fix-test-run-1" in result["branch"]
    print(f"[PASS] Test 2: create_fix_pr returned valid PR record. URL: {result['pr_url']}, Branch: {result['branch']}")

@pytest.mark.asyncio
async def test_perform_pr_action():
    # Test comment action
    comment_res = await perform_pr_action(
        pr_url="https://github.com/Harsh-Yadav029/OmniSight/pull/101",
        action="comment",
        message="Approved by QA manager: Harsh"
    )
    assert isinstance(comment_res, dict)
    assert comment_res["action"] == "comment"

    # Test close action
    close_res = await perform_pr_action(
        pr_url="https://github.com/Harsh-Yadav029/OmniSight/pull/101",
        action="close",
        message="Rejected by QA manager: Harsh - Reason: Layout shift"
    )
    assert isinstance(close_res, dict)
    assert close_res["action"] == "close"
    print("[PASS] Test 3: perform_pr_action executed comment and close operations successfully")
