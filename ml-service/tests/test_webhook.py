import os
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_webhook_intake_and_payload_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Health check
        res_health = await client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json() == {"status": "ok"}
        print("\n[PASS] Test 1: ML-Service /health endpoint is operational")

        # Test 2: Invalid webhook payload (missing commit_sha)
        res_invalid = await client.post("/webhook/build-event", json={"repo": "test/repo"})
        assert res_invalid.status_code == 422
        print("[PASS] Test 2: Webhook rejects malformed payloads with 422 Unprocessable Entity")

        # Test 3: Valid webhook payload accepts build event and returns accepted status + run_id
        res_valid = await client.post(
            "/webhook/build-event",
            json={
                "repo": "Harsh-Yadav029/tinycart",
                "branch": "main",
                "commit_sha": "e2e987654"
            }
        )
        assert res_valid.status_code == 200
        data = res_valid.json()
        assert data["status"] == "accepted"
        assert "run_id" in data
        assert len(data["run_id"]) > 0
        print(f"[PASS] Test 3: Webhook accepted build event and generated run_id: {data['run_id']}")

@pytest.mark.asyncio
async def test_pr_action_endpoint():
    transport = ASGITransport(app=app)
    internal_key = os.getenv("INTERNAL_API_KEY", "default_internal_key")
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 4: Missing internal key returns 401
        res_no_key = await client.post(
            "/internal/pr-action",
            json={"pr_url": "https://github.com/test/repo/pull/1", "action": "comment", "message": "test"}
        )
        assert res_no_key.status_code == 401
        print("[PASS] Test 4: /internal/pr-action rejects unauthenticated request without X-Internal-Key")

        # Test 5: Valid internal key executes action
        res_action = await client.post(
            "/internal/pr-action",
            headers={"X-Internal-Key": internal_key},
            json={
                "pr_url": "https://github.com/Harsh-Yadav029/OmniSight/pull/101",
                "action": "comment",
                "message": "Approved by QA manager: Test User"
            }
        )
        assert res_action.status_code == 200
        data = res_action.json()
        assert data["success"] is True
        print("[PASS] Test 5: /internal/pr-action successfully executed comment action")
