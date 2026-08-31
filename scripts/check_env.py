import os
import sys
from pathlib import Path
from dotenv import dotenv_values

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def audit_service_env(service_name: str, env_path: Path, required_keys: list[str], recommended_keys: list[str] = None):
    print(f"\n==================================================")
    print(f"  Auditing: {service_name}")
    print(f"  Path: {env_path}")
    print(f"==================================================")

    if not env_path.exists():
        print(f"  [MISSING FILE] {env_path.name} does not exist!")
        print(f"     -> Please create this file by copying from .env.example")
        return False

    values = dotenv_values(str(env_path))
    all_ok = True

    # Check Required Keys
    for key in required_keys:
        val = values.get(key)
        if val is None:
            print(f"  [MISSING KEY] '{key}' is missing from .env")
            all_ok = False
        elif str(val).strip() == "":
            print(f"  [EMPTY VALUE] '{key}' is present but empty")
        else:
            display_val = val if len(str(val)) <= 25 and ("http" in str(val) or "redis" in str(val) or "5000" in str(val) or "5173" in str(val) or "5174" in str(val)) else f"{str(val)[:6]}...{str(val)[-4:]}"
            print(f"  [OK] '{key}' is configured ({display_val})")

    # Check Recommended Keys
    if recommended_keys:
        for key in recommended_keys:
            val = values.get(key)
            if val is None or str(val).strip() == "":
                print(f"  [OPTIONAL] '{key}' not set (offline simulation fallback will be used)")
            else:
                display_val = val if "http" in str(val) else f"{str(val)[:4]}...{str(val)[-3:]}"
                print(f"  [OK] '{key}' is configured ({display_val})")

    return all_ok

def main():
    root = Path("C:/Users/harsh/Desktop/OmniSight")
    if not root.exists():
        root = Path("C:/Users/harsh/OneDrive/Desktop/OmniSight")

    print("\n>>> OMNISIGHT ENVIRONMENT AUDIT <<<")

    # 1. Backend .env
    audit_service_env(
        "Backend API (backend/.env)",
        root / "backend" / ".env",
        required_keys=["PORT", "MONGO_URI", "JWT_SECRET", "INTERNAL_API_KEY"]
    )

    # 2. ML Service .env
    audit_service_env(
        "ML Service (ml-service/.env)",
        root / "ml-service" / ".env",
        required_keys=["INTERNAL_API_KEY", "BACKEND_URL", "TEST_TARGET_APP_URL", "REDIS_URL"],
        recommended_keys=["GEMINI_API_KEY", "GROQ_API_KEY", "GITHUB_TOKEN", "GITHUB_REPO"]
    )

    # 3. Frontend .env
    audit_service_env(
        "Frontend Dashboard (frontend/.env)",
        root / "frontend" / ".env",
        required_keys=["VITE_BACKEND_URL"]
    )

    # 4. Test Target App .env
    audit_service_env(
        "Test Target App (test-target-app/.env)",
        root / "test-target-app" / ".env",
        required_keys=["VITE_PORT"]
    )

    print("\n==================================================")
    print("  Environment check complete!")
    print("==================================================\n")

if __name__ == "__main__":
    main()
