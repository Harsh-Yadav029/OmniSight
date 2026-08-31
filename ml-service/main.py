import os
import asyncio
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
import httpx
from dotenv import load_dotenv

from navigator.navigate_checkout import run_navigation
from orchestrator.graph import run_self_healing_loop
from vlm_engine.groq_helper import summarize_for_pr
from orchestrator.github_integration import create_fix_pr

load_dotenv()

app = FastAPI(
    title="OmniSight ML Service",
    version="1.0.0",
    description="Autonomous Visual Regression & Self-Healing Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment variables
BACKEND_URL = (os.getenv("BACKEND_URL") or os.getenv("NODE_API_URL") or "http://localhost:5000").rstrip("/")
TEST_TARGET_APP_URL = (os.getenv("TEST_TARGET_APP_URL") or os.getenv("MOCK_APP_URL") or "http://localhost:5173").rstrip("/")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY") or "default_internal_key"

class BuildEventPayload(BaseModel):
    repo: str
    branch: str
    commit_sha: str = Field(..., alias="commitSha")

    model_config = ConfigDict(populate_by_name=True)

class BuildEventResponse(BaseModel):
    status: str
    run_id: str
    message: str

async def execute_navigation_task(run_id: str, base_url: str, backend_url: str, internal_key: str):
    """
    Background orchestrator executing the full autonomous testing & self-healing pipeline:
    1. Multi-viewport Playwright navigation (Mobile, Tablet, Desktop)
    2. LangGraph iterative self-healing loop
    3. Groq PR summarization
    4. GitHub Pull Request creation and backend persistence
    """
    print(f"\n[Webhook Gateway] Starting autonomous audit for run_id '{run_id}' against {base_url}...")
    try:
        # Step 1: Multi-viewport snapshot capture
        manifest = await run_navigation(base_url=base_url, run_id=run_id)
        print(f"[Webhook Gateway] Initial snapshots captured for run '{run_id}'.")

        # Notify backend of screenshot capture
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.patch(
                f"{backend_url}/api/internal/runs/{run_id}",
                headers={"X-Internal-Key": internal_key, "Content-Type": "application/json"},
                json={"status": "screenshots_captured"}
            )

        # Step 2: Run LangGraph Self-Healing Loop on checkout flow
        final_state = await run_self_healing_loop(run_id=run_id, base_url=base_url, page_name="checkout")

        # Step 3: If resolved, create GitHub PR and save record
        if final_state.get("resolved"):
            print(f"[Webhook Gateway] Visual bug resolved! Generating Groq summary & GitHub PR...")
            vlm_history = final_state.get("vlm_history", [])
            latest_vlm = vlm_history[-1] if vlm_history else {
                "issue_type": "hidden button",
                "description": "Submit button clipped on mobile viewport.",
                "suggested_tailwind_classes": "w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2",
                "affected_selector": "#submit-order-button"
            }

            # Generate PR description and commit message via Groq
            pr_summary = await summarize_for_pr(latest_vlm, vlm_history)

            # Create GitHub Pull Request via PyGithub
            pr_result = await create_fix_pr(
                run_id=run_id,
                fix_details={
                    "issue_type": latest_vlm.get("issue_type", "visual defect"),
                    "commit_message": pr_summary.get("commit_message", "fix(ui): resolve visual regression"),
                    "pr_description": pr_summary.get("pr_description", "Automated visual fix applied."),
                    "file_path": "test-target-app/src/components/SubmitButton.jsx",
                    "screenshot_before": f"runs/{run_id}/screenshots/checkout_375.png",
                    "screenshot_after": final_state.get("screenshot_path", f"runs/{run_id}/screenshots/checkout_375.png"),
                    "vlm_details": latest_vlm
                }
            )

            # Step 4: Persist PR record to backend
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{backend_url}/api/internal/runs/{run_id}/pr-record",
                    headers={"X-Internal-Key": internal_key, "Content-Type": "application/json"},
                    json={
                        "prUrl": pr_result.get("pr_url"),
                        "branch": pr_result.get("branch"),
                        "title": f"[OmniSight] Fix: {latest_vlm.get('issue_type', 'visual defect').title()}",
                        "body": pr_summary.get("pr_description")
                    }
                )
            print(f"[Webhook Gateway] Full autonomous pipeline completed successfully for run '{run_id}'!")

    except Exception as e:
        print(f"[Webhook Gateway] Error during background task for run '{run_id}': {e}")
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                await client.patch(
                    f"{backend_url}/api/internal/runs/{run_id}",
                    headers={"X-Internal-Key": internal_key, "Content-Type": "application/json"},
                    json={"status": "failed"}
                )
        except Exception as patch_err:
            print(f"[Webhook Gateway] Could not mark run as failed: {patch_err}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post(
    "/webhook/build-event",
    response_model=BuildEventResponse,
    status_code=status.HTTP_200_OK
)
async def handle_build_event(payload: BuildEventPayload, background_tasks: BackgroundTasks):
    """
    Intake webhook endpoint for CI/CD build events.
    1. Registers a new BuildRun in Backend.
    2. Dispatches autonomous visual audit and self-healing in background.
    3. Returns accepted status and run_id immediately.
    """
    backend_url = BACKEND_URL
    internal_key = INTERNAL_API_KEY
    target_app_url = TEST_TARGET_APP_URL

    print(f"[Webhook Gateway] Received build event for {payload.repo} @ {payload.branch} ({payload.commit_sha})")

    # 1. Register BuildRun in Backend
    run_id = None
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                f"{backend_url}/api/internal/runs",
                headers={
                    "X-Internal-Key": internal_key,
                    "Content-Type": "application/json"
                },
                json={
                    "repo": payload.repo,
                    "branch": payload.branch,
                    "commitSha": payload.commit_sha
                }
            )

            if res.status_code >= 400:
                print(f"[Webhook Gateway] Backend responded with error: {res.status_code} - {res.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Backend rejected run creation: {res.text}"
                )

            data = res.json().get("data", {})
            run_id = data.get("runId") or (data.get("run", {}).get("_id"))
    except httpx.RequestError as exc:
        print(f"[Webhook Gateway] Notice: Backend connection ({exc}). Using offline run_id fallback.")
        run_id = f"local-run-{payload.commit_sha[:7]}"

    if not run_id:
        run_id = f"run-{payload.commit_sha[:7]}"

    # 2. Queue autonomous testing task
    background_tasks.add_task(
        execute_navigation_task,
        run_id=str(run_id),
        base_url=target_app_url,
        backend_url=backend_url,
        internal_key=internal_key
    )

    return BuildEventResponse(
        status="accepted",
        run_id=str(run_id),
        message="Build run created and autonomous self-healing pipeline triggered in background"
    )
