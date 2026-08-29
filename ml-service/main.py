import os
import asyncio
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
import httpx
from dotenv import load_dotenv

from navigator.navigate_checkout import run_navigation

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
    """Background task that runs Playwright navigation and updates the run status in backend."""
    print(f"[Webhook Gateway] Starting background navigation for run_id '{run_id}' against {base_url}...")
    try:
        manifest = await run_navigation(base_url=base_url, run_id=run_id)
        print(f"[Webhook Gateway] Navigation completed for run_id '{run_id}'. Updating status in backend...")

        # Update run status to 'screenshots_captured' via Backend Internal API
        async with httpx.AsyncClient(timeout=15.0) as client:
            patch_res = await client.patch(
                f"{backend_url}/api/internal/runs/{run_id}",
                headers={"X-Internal-Key": internal_key, "Content-Type": "application/json"},
                json={"status": "screenshots_captured"}
            )
            if patch_res.status_code < 400:
                print(f"[Webhook Gateway] Run '{run_id}' status successfully updated to 'screenshots_captured'.")
            else:
                print(f"[Webhook Gateway] Warning: Failed to patch run status. Code: {patch_res.status_code}, Body: {patch_res.text}")

    except Exception as e:
        print(f"[Webhook Gateway] Error during background navigation for run '{run_id}': {e}")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
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
    1. Calls backend internal API to register a new BuildRun.
    2. Spawns Playwright navigation in background.
    3. Returns run_id and accepted status.
    """
    backend_url = BACKEND_URL
    internal_key = INTERNAL_API_KEY
    target_app_url = TEST_TARGET_APP_URL

    print(f"[Webhook Gateway] Received build event for {payload.repo} @ {payload.branch} ({payload.commit_sha})")

    # 1. Register BuildRun in Backend
    run_id = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
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
        print(f"[Webhook Gateway] Could not connect to backend at {backend_url}: {exc}")
        # Fallback run_id for offline testing if backend is unreachable
        run_id = f"local-run-{payload.commit_sha[:7]}"

    if not run_id:
        run_id = f"run-{payload.commit_sha[:7]}"

    # 2. Queue navigation background task
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
        message="Build run created and visual navigation triggered in background"
    )
