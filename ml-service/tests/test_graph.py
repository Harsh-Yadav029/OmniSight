import pytest
from pathlib import Path
from orchestrator.graph import (
    OmniSightState,
    apply_tailwind_classes_to_source,
    route_evaluation,
    run_self_healing_loop
)
from langgraph.graph import END

def test_source_file_class_replacement():
    test_classes = "w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
    success = apply_tailwind_classes_to_source("src/components/SubmitButton.jsx", test_classes)
    assert success is True

    # Read SubmitButton.jsx to verify replacement occurred
    btn_file = Path(__file__).resolve().parent.parent.parent / "test-target-app" / "src" / "components" / "SubmitButton.jsx"
    with open(btn_file, "r", encoding="utf-8") as f:
        content = f.read()
    assert test_classes in content
    print("\n[PASS] Test 1: apply_tailwind_classes_to_source correctly patched SubmitButton.jsx")

def test_graph_router_conditions():
    # Condition 1: Resolved -> END
    resolved_state: OmniSightState = {
        "run_id": "test-1",
        "base_url": "http://localhost:5173",
        "page_name": "checkout",
        "screenshot_path": "path.png",
        "dom_html": "<html></html>",
        "current_fix": None,
        "attempt_count": 1,
        "resolved": True,
        "vlm_history": []
    }
    assert route_evaluation(resolved_state) == END

    # Condition 2: Attempt >= 3 -> END
    max_attempts_state: OmniSightState = {
        "run_id": "test-2",
        "base_url": "http://localhost:5173",
        "page_name": "checkout",
        "screenshot_path": "path.png",
        "dom_html": "<html></html>",
        "current_fix": None,
        "attempt_count": 3,
        "resolved": False,
        "vlm_history": []
    }
    assert route_evaluation(max_attempts_state) == END

    # Condition 3: Unresolved attempt 1 -> execute_node
    retry_state: OmniSightState = {
        "run_id": "test-3",
        "base_url": "http://localhost:5173",
        "page_name": "checkout",
        "screenshot_path": "path.png",
        "dom_html": "<html></html>",
        "current_fix": None,
        "attempt_count": 1,
        "resolved": False,
        "vlm_history": []
    }
    assert route_evaluation(retry_state) == "execute_node"
    print("[PASS] Test 2: Graph router transition logic verified across all conditions.")

@pytest.mark.asyncio
async def test_self_healing_loop_execution():
    result = await run_self_healing_loop("test-run-2", "http://localhost:5173", "checkout")
    assert isinstance(result, dict)
    assert "resolved" in result
    assert "vlm_history" in result
    assert "attempt_count" in result
    print(f"[PASS] Test 3: LangGraph self-healing loop executed successfully. Final resolved state: {result['resolved']}")
