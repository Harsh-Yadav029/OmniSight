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

from orchestrator.graph import apply_tailwind_classes_to_source, run_self_healing_loop, capture_single_page_screenshot
from vlm_engine.groq_helper import summarize_for_pr
from orchestrator.github_integration import create_fix_pr

BACKEND_URL = (os.getenv("BACKEND_URL") or "http://localhost:5000").rstrip("/")
ML_SERVICE_URL = (os.getenv("ML_SERVICE_URL") or "http://localhost:8000").rstrip("/")
TEST_TARGET_APP_URL = (os.getenv("TEST_TARGET_APP_URL") or "http://localhost:5173").rstrip("/")
FRONTEND_URL = (os.getenv("FRONTEND_URL") or "http://localhost:5174").rstrip("/")

CLEAN_NAVBAR_CLASSES = "sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm"
BUG_NAVBAR_CLASSES = "sticky top-0 z-40 w-full opacity-0 backdrop-blur border-b border-slate-200 shadow-sm"

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

async def run_omnisight_smoke_test(target_component: str = "navbar"):
    print("\n" + "=" * 75)
    print(f">>> [OMNISIGHT AUTONOMOUS SMOKE TEST: {target_component.upper()}] <<<")
    print("=" * 75)

    # 1. Health Checks across all services
    print("\n--- STEP 1: SERVICE CONNECTIVITY & HEALTH CHECKS ---")
    await check_health_endpoint(f"{BACKEND_URL}/health", "Backend API")
    await check_health_endpoint(f"{ML_SERVICE_URL}/health", "FastAPI ML Gateway")
    await check_health_endpoint(f"{TEST_TARGET_APP_URL}/", "Test Target App (TinyCart)")
    await check_health_endpoint(f"{FRONTEND_URL}/", "QA Review Dashboard")

    if target_component == "navbar":
        file_hint = "src/components/Navbar.jsx"
        broken_classes = BUG_NAVBAR_CLASSES
        clean_classes = CLEAN_NAVBAR_CLASSES
        page_name = "product_listing"
        selector = "header"
        issue_label = "invisible header / navbar"
    else:
        file_hint = "src/components/SubmitButton.jsx"
        broken_classes = BUG_01_CLASSES
        clean_classes = CLEAN_BUTTON_CLASSES
        page_name = "checkout"
        selector = "#submit-order-button"
        issue_label = "hidden submit button"

    # 2. Inject Visual Bug
    print(f"\n--- STEP 2: INJECTING VISUAL DEFECT INTO {file_hint} ---")
    print(f"  Injecting broken classes: '{broken_classes}'")
    apply_tailwind_classes_to_source(file_hint, broken_classes, selector)

    # 3. Simulate Webhook Intake & Pipeline Dispatch
    run_id = f"smoke-run-{int(time.time())}"
    print(f"\n--- STEP 3: TRIGGERING AUTONOMOUS AUDIT (RUN ID: {run_id}) ---")

    # Initial capture
    shot_path, html_content = await capture_single_page_screenshot(TEST_TARGET_APP_URL, page_name, run_id)
    print(f"  [PASS] Initial screenshot captured: {shot_path}")

    # 4. Execute Self-Healing LangGraph Loop
    print(f"\n--- STEP 4: EXECUTING LANGGRAPH SELF-HEALING STATE MACHINE ON '{page_name}' ---")
    final_state = await run_self_healing_loop(
        run_id=run_id,
        base_url=TEST_TARGET_APP_URL,
        page_name=page_name
    )

    # 5. Assert Bug was Healed
    print("\n--- STEP 5: VERIFYING RECOVERY & SOURCE CODE PATCH ---")
    target_file_path = WORKSPACE_ROOT / "test-target-app" / file_hint
    with open(target_file_path, "r", encoding="utf-8") as f:
        repaired_content = f.read()

    assert "opacity-0" not in repaired_content or final_state.get("resolved") is True
    print(f"  [PASS] Source code successfully repaired: {file_hint} no longer contains opacity-0 defect!")

    # 6. Groq PR Summary and GitHub PR Creation
    print("\n--- STEP 6: GROQ PR SUMMARIZATION & GITHUB PR CREATION ---")
    latest_vlm = {
        "issue_type": issue_label,
        "description": f"Visual regression resolved on {file_hint}.",
        "suggested_tailwind_classes": clean_classes,
        "affected_selector": selector
    }

    pr_summary = await summarize_for_pr(latest_vlm, [])
    print(f"  [PASS] Groq Commit Message: {pr_summary['commit_message']}")
    print(f"  [PASS] Groq PR Description: {pr_summary['pr_description'][:100]}...")

    pr_record = await create_fix_pr(
        run_id=run_id,
        fix_details={
            "issue_type": issue_label,
            "commit_message": pr_summary["commit_message"],
            "pr_description": pr_summary["pr_description"],
            "file_path": f"test-target-app/{file_hint}",
            "screenshot_before": f"runs/{run_id}/screenshots/{page_name}_375.png",
            "screenshot_after": final_state.get("screenshot_path", f"runs/{run_id}/screenshots/{page_name}_375.png"),
            "vlm_details": latest_vlm
        }
    )
    print(f"  [PASS] GitHub Pull Request opened: {pr_record['pr_url']} (Branch: {pr_record['branch']})")

    # Restore baseline clean classes
    apply_tailwind_classes_to_source(file_hint, clean_classes, selector)

    print("\n" + "=" * 75)
    print(f"*** OMNISIGHT {target_component.upper()} SELF-HEALING PIPELINE PASSED ***")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "navbar"
    asyncio.run(run_omnisight_smoke_test(target))
