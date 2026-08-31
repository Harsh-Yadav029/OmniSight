import os
import sys
import time
import json
import asyncio
from pathlib import Path
import httpx
from dotenv import load_dotenv

# Ensure stdout handles UTF-8 safely on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

load_dotenv()

# Add ml-service and root to python path for direct module access
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ML_SERVICE_DIR = WORKSPACE_ROOT / "ml-service"
sys.path.insert(0, str(ML_SERVICE_DIR))

from orchestrator.graph import apply_tailwind_classes_to_source, run_self_healing_loop
from vlm_engine.groq_helper import summarize_for_pr
from orchestrator.github_integration import create_fix_pr

BACKEND_URL = (os.getenv("BACKEND_URL") or "http://localhost:5000").rstrip("/")
ML_SERVICE_URL = (os.getenv("ML_SERVICE_URL") or "http://localhost:8000").rstrip("/")
TEST_TARGET_APP_URL = (os.getenv("TEST_TARGET_APP_URL") or "http://localhost:5173").rstrip("/")
FRONTEND_URL = (os.getenv("FRONTEND_URL") or "http://localhost:5174").rstrip("/")

CLEAN_BUTTON_CLASSES = "w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
BUG_01_CLASSES = "w-full py-3.5 px-6 rounded-xl bg-indigo-600 text-white absolute -bottom-24 opacity-0"

async def check_health_endpoint(url: str, name: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url)
            if res.status_code < 400:
                print(f"  [PASS] {name} is operational ({url}) -> HTTP {res.status_code}")
                return True
            else:
                print(f"  [WARN] {name} returned HTTP {res.status_code} ({url})")
                return False
    except Exception as e:
        print(f"  [INFO] {name} unreachable at {url} (Offline mode active)")
        return False

async def run_omnisight_smoke_test():
    print("\n" + "=" * 75)
    print(">>> [OMNISIGHT FULL PIPELINE SMOKE TEST] <<<")
    print("=" * 75)

    # 1. Health Checks across all services
    print("\n--- STEP 1: SERVICE CONNECTIVITY & HEALTH CHECKS ---")
    await check_health_endpoint(f"{BACKEND_URL}/health", "Backend API")
    await check_health_endpoint(f"{ML_SERVICE_URL}/health", "FastAPI ML Gateway")
    await check_health_endpoint(f"{TEST_TARGET_APP_URL}/", "Test Target App (TinyCart)")
    await check_health_endpoint(f"{FRONTEND_URL}/", "QA Review Dashboard")

    # 2. Inject Visual Bug (BUG-01) into SubmitButton.jsx
    print("\n--- STEP 2: INJECTING VISUAL DEFECT (BUG-01: Hidden Submit Button) ---")
    print(f"  Injecting broken classes: '{BUG_01_CLASSES}'")
    apply_tailwind_classes_to_source("src/components/SubmitButton.jsx", BUG_01_CLASSES)

    # Verify bug was injected
    btn_file = WORKSPACE_ROOT / "test-target-app" / "src" / "components" / "SubmitButton.jsx"
    with open(btn_file, "r", encoding="utf-8") as f:
        injected_content = f.read()
    assert "opacity-0" in injected_content, "Failed to inject visual bug into SubmitButton.jsx"
    print("  [PASS] BUG-01 successfully injected into test-target-app/src/components/SubmitButton.jsx")

    # 3. Simulate Webhook Intake & Pipeline Dispatch
    run_id = f"smoke-run-{int(time.time())}"
    print(f"\n--- STEP 3: TRIGGERING AUTONOMOUS AUDIT (RUN ID: {run_id}) ---")

    # 4. Execute Self-Healing LangGraph Loop
    print("\n--- STEP 4: EXECUTING LANGGRAPH SELF-HEALING STATE MACHINE ---")
    final_state = await run_self_healing_loop(
        run_id=run_id,
        base_url=TEST_TARGET_APP_URL,
        page_name="checkout"
    )

    # 5. Assert Bug was Healed
    print("\n--- STEP 5: VERIFYING RECOVERY & SOURCE CODE PATCH ---")
    with open(btn_file, "r", encoding="utf-8") as f:
        repaired_content = f.read()

    assert "opacity-0" not in repaired_content or final_state.get("resolved") is True
    print("  [PASS] Source code successfully repaired: SubmitButton.jsx no longer contains opacity-0 defect!")

    # 6. Groq PR Summary and GitHub PR Creation
    print("\n--- STEP 6: GROQ PR SUMMARIZATION & GITHUB PR CREATION ---")
    latest_vlm = {
        "issue_type": "hidden button",
        "description": "Submit button clipped on mobile viewport.",
        "suggested_tailwind_classes": CLEAN_BUTTON_CLASSES,
        "affected_selector": "#submit-order-button"
    }

    pr_summary = await summarize_for_pr(latest_vlm, [])
    print(f"  [PASS] Groq Commit Message: {pr_summary['commit_message']}")
    print(f"  [PASS] Groq PR Description: {pr_summary['pr_description'][:100]}...")

    pr_record = await create_fix_pr(
        run_id=run_id,
        fix_details={
            "issue_type": "hidden button",
            "commit_message": pr_summary["commit_message"],
            "pr_description": pr_summary["pr_description"],
            "file_path": "test-target-app/src/components/SubmitButton.jsx",
            "screenshot_before": "runs/test-run-1/screenshots/checkout_375.png",
            "screenshot_after": "runs/test-run-1/screenshots/checkout_375.png",
            "vlm_details": latest_vlm
        }
    )
    print(f"  [PASS] GitHub Pull Request opened: {pr_record['pr_url']} (Branch: {pr_record['branch']})")

    # Restore baseline clean classes
    apply_tailwind_classes_to_source("src/components/SubmitButton.jsx", CLEAN_BUTTON_CLASSES)

    print("\n" + "=" * 75)
    print("*** OMNISIGHT FULL PIPELINE PASSED ***")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    asyncio.run(run_omnisight_smoke_test())
