# OmniSight Automation & Testing Scripts

This directory contains automation utilities and test scripts for OmniSight:

- **`check_env.py`**: Verifies all `.env` files across the monorepo to ensure no keys are missing or malformed.
  ```bash
  python scripts/check_env.py
  ```
- **`smoke_test.py`**: Full end-to-end pipeline test (defect injection ➔ VLM detection ➔ LangGraph self-healing ➔ Groq summarizer ➔ GitHub PR creation).
  ```bash
  python scripts/smoke_test.py
  ```
- **`smoke_test.sh`**: Bash runner wrapper for Linux/CI runners.
