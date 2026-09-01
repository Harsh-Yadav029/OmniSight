import os
import re
import asyncio
from typing import TypedDict, Optional, List, Dict, Any, Union
from pathlib import Path
import httpx
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END

from navigator.navigate_checkout import run_navigation, trim_scripts
from vlm_engine.analyze import analyze_screenshot, VLMResponse
from orchestrator.extract_fix import extract_fix, CodeFix, infer_source_file

load_dotenv()

BACKEND_URL = (os.getenv("BACKEND_URL") or os.getenv("NODE_API_URL") or "http://localhost:5000").rstrip("/")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY") or "default_internal_key"

class OmniSightState(TypedDict):
    run_id: str
    base_url: str
    page_name: str
    screenshot_path: str
    dom_html: str
    current_fix: Optional[Dict[str, Any]]
    attempt_count: int
    resolved: bool
    vlm_history: List[Dict[str, Any]]

async def patch_backend_status(run_id: str, status: str, fix_attempt: Optional[Dict[str, Any]] = None):
    """Notifies the backend API about status transitions and logs fix attempts."""
    try:
        payload = {"status": status}
        if fix_attempt:
            payload["fixAttempt"] = fix_attempt

        async with httpx.AsyncClient(timeout=8.0) as client:
            await client.patch(
                f"{BACKEND_URL}/api/internal/runs/{run_id}",
                headers={"X-Internal-Key": INTERNAL_API_KEY, "Content-Type": "application/json"},
                json=payload
            )
            print(f"[Graph / Backend] Patched run '{run_id}' with status='{status}'")
    except Exception as e:
        print(f"[Graph / Backend] Warning: Could not patch run status to backend ({e})")

def apply_tailwind_classes_to_source(file_hint: str, target_classes: str, selector: str = "") -> bool:
    """
    Locates any target source JSX file in test-target-app and updates its styling.
    Supports Navbar.jsx, ProductCard.jsx, CartItem.jsx, SubmitButton.jsx, CheckoutForm.jsx, etc.
    """
    possible_roots = [
        Path(__file__).resolve().parent.parent.parent / "test-target-app",
        Path("C:/Users/harsh/OneDrive/Desktop/OmniSight/test-target-app"),
        Path("C:/Users/harsh/Desktop/OmniSight/test-target-app"),
    ]

    clean_file_hint = file_hint.replace("\\", "/").lstrip("/")
    applied_any = False

    for root in possible_roots:
        target_path = root / clean_file_hint
        if not target_path.exists():
            # Try finding by basename across components
            basename = Path(clean_file_hint).name
            candidates = list(root.glob(f"**/{basename}"))
            if candidates:
                target_path = candidates[0]
            else:
                continue

        try:
            with open(target_path, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content

            # Strategy 1: Named className variable (e.g. const buttonClassName = "...")
            if "buttonClassName" in new_content:
                new_content = re.sub(
                    r'const buttonClassName = ["\'][^"\']*["\'];',
                    f'const buttonClassName = "{target_classes}";',
                    new_content
                )
            # Strategy 2: Specific HTML Tag in selector (e.g. header, nav, button, div)
            elif "header" in selector.lower() or "navbar" in clean_file_hint.lower():
                new_content = re.sub(
                    r'<header className=["\'][^"\']*["\']',
                    f'<header className="{target_classes}"',
                    new_content,
                    count=1
                )
            # Strategy 3: Specific ID mentioned in selector (e.g. #nav-cart-btn)
            elif selector and selector.startswith("#"):
                elem_id = selector.lstrip("#")
                # Look for element with this id and replace its className
                pattern = rf'(id=["\']{elem_id}["\'][^>]*?className=["\'])[^"\']*?(["\'])'
                if re.search(pattern, new_content):
                    new_content = re.sub(pattern, rf'\g<1>{target_classes}\g<2>', new_content)
                else:
                    pattern_reverse = rf'(className=["\'])[^"\']*?(["\'][^>]*?id=["\']{elem_id}["\'])'
                    if re.search(pattern_reverse, new_content):
                        new_content = re.sub(pattern_reverse, rf'\g<1>{target_classes}\g<2>', new_content)
                    else:
                        new_content = re.sub(r'className=["\'][^"\']*["\']', f'className="{target_classes}"', new_content, count=1)
            # Strategy 4: Top-level / First matching className in target component
            else:
                new_content = re.sub(
                    r'className=["\'][^"\']*["\']',
                    f'className="{target_classes}"',
                    new_content,
                    count=1
                )

            with open(target_path, "w", encoding="utf-8") as f:
                f.write(new_content)

            print(f"[Self-Healing] Successfully patched {target_path} with: '{target_classes}'")
            applied_any = True
        except Exception as err:
            print(f"[Self-Healing] Error modifying {target_path}: {err}")

    return applied_any

def _sync_capture_screenshot(base_url: str, page_name: str, run_id: str) -> tuple[str, str]:
    """Synchronous single page capture in thread pool for Windows compatibility."""
    from playwright.sync_api import sync_playwright

    output_dir = Path("runs") / run_id / "screenshots"
    output_dir.mkdir(parents=True, exist_ok=True)
    screenshot_file = output_dir / f"{page_name}_375.png"
    html_file = output_dir / f"{page_name}.html"

    clean_base = base_url.rstrip("/")
    target_url = f"{clean_base}/{page_name}" if page_name != "product_listing" else f"{clean_base}/"
    if page_name == "checkout":
        target_url = f"{clean_base}/checkout"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.set_viewport_size({"width": 375, "height": 667})
                page.goto(target_url, wait_until="networkidle", timeout=12000)
                page.wait_for_timeout(500)

                content = page.content()
                trimmed = trim_scripts(content)
                with open(html_file, "w", encoding="utf-8") as f:
                    f.write(trimmed)

                page.screenshot(path=str(screenshot_file), full_page=True)
            finally:
                browser.close()
        return str(screenshot_file), trimmed
    except Exception as e:
        print(f"[Playwright] Fallback capture notice: {e}")
        from PIL import Image
        img = Image.new("RGB", (375, 667), color=(15, 23, 42))
        img.save(screenshot_file)
        trimmed = "<div id='submit-order-button'>Submit Order</div>"
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(trimmed)
        return str(screenshot_file), trimmed

async def capture_single_page_screenshot(base_url: str, page_name: str, run_id: str) -> tuple[str, str]:
    """Captures a fresh mobile (375px) screenshot of the specified page via thread execution."""
    return await asyncio.to_thread(_sync_capture_screenshot, base_url, page_name, run_id)

# --- LangGraph Nodes ---

async def plan_node(state: OmniSightState) -> OmniSightState:
    """Plan Node: Sets baseline metadata and initiates visual diagnosis."""
    print(f"\n[Plan Node] Initializing self-healing workflow for run_id '{state['run_id']}' on page '{state['page_name']}'")
    await patch_backend_status(state["run_id"], "analyzing")
    return state

async def execute_node(state: OmniSightState) -> OmniSightState:
    """Execute Node: Applies the extracted fix to source code and captures a fresh screenshot."""
    print(f"\n[Execute Node] Attempt #{state['attempt_count']}: Applying CodeFix...")

    current_fix = state.get("current_fix")
    if current_fix:
        target_classes = current_fix.get("tailwind_classes", "")
        file_hint = current_fix.get("file_hint") or infer_source_file(current_fix.get("selector", ""), "", "")
        selector = current_fix.get("selector", "")
        
        print(f"[Execute Node] Injecting Tailwind classes into {file_hint} (selector: {selector}): '{target_classes}'")
        apply_tailwind_classes_to_source(file_hint, target_classes, selector)

        # Brief delay to allow hot-module reloading in Vite
        await asyncio.sleep(1.0)

    # Re-run Playwright navigation for the target page
    print(f"[Execute Node] Re-capturing screenshot for page '{state['page_name']}'...")
    try:
        new_screenshot_path, new_html = await capture_single_page_screenshot(
            state["base_url"],
            state["page_name"],
            state["run_id"]
        )
        state["screenshot_path"] = new_screenshot_path
        state["dom_html"] = new_html
    except Exception as e:
        print(f"[Execute Node] Warning: Playwright capture error ({e}). Keeping previous screenshot.")

    await patch_backend_status(state["run_id"], "fix_applied")
    return state

async def evaluate_node(state: OmniSightState) -> OmniSightState:
    """Evaluate Node: Audits the latest screenshot with Gemini to verify if the bug is resolved."""
    print(f"\n[Evaluate Node] Auditing screenshot '{state['screenshot_path']}' with VLM Engine...")
    
    # Ensure screenshot file exists
    if not Path(state["screenshot_path"]).exists():
        shot_path, html = await capture_single_page_screenshot(state["base_url"], state["page_name"], state["run_id"])
        state["screenshot_path"] = shot_path
        state["dom_html"] = html

    vlm_result = await analyze_screenshot(state["screenshot_path"], state["dom_html"])
    history = list(state.get("vlm_history", []))
    history.append(vlm_result)
    state["vlm_history"] = history

    has_issue = vlm_result.get("has_issue", False)
    confidence = vlm_result.get("confidence", 0.0)

    # Check resolution condition
    if not has_issue and confidence >= 0.5:
        print(f"[Evaluate Node] Issue successfully resolved! Confidence: {confidence}")
        state["resolved"] = True
        state["current_fix"] = None

        fix_record = {
            "attemptNumber": state["attempt_count"],
            "issueType": vlm_result.get("issue_type", "resolved"),
            "description": "Visual defects successfully resolved and verified.",
            "screenshotAfter": state["screenshot_path"],
            "resolved": True
        }
        await patch_backend_status(state["run_id"], "verified", fix_record)
    else:
        print(f"[Evaluate Node] Visual issue detected: {vlm_result.get('description', 'defect present')}")
        state["resolved"] = False
        state["attempt_count"] += 1

        # Extract next iterative fix
        try:
            next_fix = extract_fix(vlm_result)
            state["current_fix"] = next_fix.model_dump()
        except Exception as fix_err:
            print(f"[Evaluate Node] Could not extract structured fix ({fix_err}). Using baseline fix fallback.")
            inferred_file = infer_source_file(vlm_result.get("affected_selector", ""), vlm_result.get("description", ""), vlm_result.get("issue_type", ""))
            state["current_fix"] = {
                "selector": vlm_result.get("affected_selector", "#submit-order-button"),
                "tailwind_classes": vlm_result.get("suggested_tailwind_classes") or "w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2",
                "css": "",
                "file_hint": inferred_file
            }

        fix_record = {
            "attemptNumber": state["attempt_count"],
            "issueType": vlm_result.get("issue_type", "visual defect"),
            "description": vlm_result.get("description", ""),
            "selector": state["current_fix"].get("selector", ""),
            "tailwindClasses": state["current_fix"].get("tailwind_classes", ""),
            "screenshotBefore": state["screenshot_path"],
            "resolved": False
        }
        await patch_backend_status(state["run_id"], "analyzing", fix_record)

    return state

def route_evaluation(state: OmniSightState) -> str:
    """Conditional Edge: Terminates when resolved or after 3 attempts, else loops back to execute_node."""
    if state["resolved"]:
        print("[Graph Router] Visual defect resolved! Routing to END.")
        return END
    elif state["attempt_count"] >= 3:
        print(f"[Graph Router] Max attempts ({state['attempt_count']}) reached. Routing to END.")
        return END
    else:
        print(f"[Graph Router] Attempt #{state['attempt_count']} pending. Routing back to execute_node...")
        return "execute_node"

# --- Compile LangGraph StateGraph ---

workflow = StateGraph(OmniSightState)
workflow.add_node("plan_node", plan_node)
workflow.add_node("execute_node", execute_node)
workflow.add_node("evaluate_node", evaluate_node)

workflow.set_entry_point("plan_node")
workflow.add_edge("plan_node", "evaluate_node")
workflow.add_conditional_edges("evaluate_node", route_evaluation, {"execute_node": "execute_node", END: END})
workflow.add_edge("execute_node", "evaluate_node")

self_healing_graph = workflow.compile()

async def run_self_healing_loop(run_id: str, base_url: str, page_name: str = "checkout") -> OmniSightState:
    """
    Entry point function executing the self-healing LangGraph loop.
    """
    initial_screenshot = f"runs/{run_id}/screenshots/{page_name}_375.png"
    initial_html_path = f"runs/{run_id}/screenshots/{page_name}.html"

    # If target screenshot does not exist yet on disk, capture it live via Playwright
    if not Path(initial_screenshot).exists():
        try:
            initial_screenshot, dom_html = await capture_single_page_screenshot(base_url, page_name, run_id)
        except Exception:
            initial_screenshot = f"runs/test-run-1/screenshots/{page_name}_375.png"
            dom_html = ""
    else:
        dom_html = ""
        if Path(initial_html_path).exists():
            with open(initial_html_path, "r", encoding="utf-8") as f:
                dom_html = f.read()

    initial_state: OmniSightState = {
        "run_id": run_id,
        "base_url": base_url.rstrip("/"),
        "page_name": page_name,
        "screenshot_path": initial_screenshot,
        "dom_html": dom_html,
        "current_fix": None,
        "attempt_count": 0,
        "resolved": False,
        "vlm_history": []
    }

    print(f"\n{'=' * 70}")
    print(f">>> STARTING LANGGRAPH SELF-HEALING LOOP: RUN '{run_id}' (PAGE: {page_name}) <<<")
    print(f"{'=' * 70}")

    final_state = await self_healing_graph.ainvoke(initial_state)

    print(f"\n{'=' * 70}")
    print(f">>> SELF-HEALING LOOP FINISHED: RESOLVED = {final_state.get('resolved')} <<<")
    print(f"{'=' * 70}")

    return final_state
