# 👁️ OmniSight — Autonomous Visual QA & Self-Healing Engine

> **Never let a broken responsive layout or invisible submit button slip into production again.**  
> OmniSight continuously crawls web apps across mobile, tablet, and desktop viewports, spots visual discrepancies using **Gemini 2.5 Flash**, writes clean Tailwind CSS fixes via a self-healing **LangGraph** loop, summarizes changes with **Groq (LLaMA 3.1)**, and automatically submits ready-to-merge **GitHub Pull Requests**.

---

## 🌟 What makes OmniSight special?

Traditional end-to-end tests only check whether an element exists in the DOM tree. If a CSS bug causes a critical "Place Order" button to be pushed 200px below the mobile screen or hidden behind an opaque overlay, traditional test runners like Jest or Cypress still report `PASS`.

**OmniSight solves this with true multimodal vision:**
1. 📸 **Crawls like a human**: Navigates multi-step user journeys across **Mobile (375px)**, **Tablet (768px)**, and **Desktop (1440px)**.
2. 🧠 **Audits with Gemini Vision**: Analyzes pixel screenshots together with trimmed DOM HTML to identify visual defects (cut-off text, overlapping components, broken responsive grids).
3. 🔄 **Self-Heals with LangGraph**: Autonomously inspects your source code, generates surgical Tailwind CSS patches, re-tests the live app, and iterates until the UI is verified pixel-perfect.
4. 🚀 **Opens GitHub PRs**: Uses Groq LLaMA 3.1 to generate clean, professional PR descriptions with visual side-by-side evidence and opens a Pull Request.
5. 📊 **Interactive QA Dashboard**: Gives your QA team a dark-mode review portal with viewport switchers, side-by-side diff viewers, and 1-click **Approve & Merge** buttons.

---

## 🏗️ Architecture & Services

```
OmniSight/
├── backend/            # Express + Mongoose API (Port 5000)
│                       # Manages JWT auth, build run statuses, and QA approval decisions.
│
├── ml-service/         # FastAPI + Playwright + LangGraph Engine (Port 8000)
│                       # Multi-viewport navigation, Gemini Vision audit, self-healing loop & PR engine.
│
├── frontend/           # QA Review Dashboard in React + Tailwind + Radix (Port 5174)
│                       # Live polling dashboard with side-by-side screenshot diffs.
│
├── test-target-app/    # "TinyCart" Mock E-Commerce Store (Port 5173)
│                       # Sample application under test with catalog, cart, and checkout.
│
├── scripts/            # End-to-end automated smoke testing suite.
│
├── runs/               # Stored data for test runs, logs, and visual evidence.
│
├── docker-compose.yml  # One-click local orchestration for all services.
├── render.yaml         # Blueprint for deploying Backend and ML Service to Render.
├── SETUP.md            # Detailed environment configuration guide.
└── DEPLOYMENT.md       # Comprehensive Render + Vercel deployment guide.
```

---

## 🔄 CI/CD Integration & GitHub Actions

You can trigger OmniSight automatically on every commit or pull request using GitHub Actions.

A ready-to-use workflow is included at [`test-target-app/.github/workflows/omnisight-trigger.yml`](test-target-app/.github/workflows/omnisight-trigger.yml):

```yaml
name: OmniSight Visual QA Trigger

on:
  push:
    branches:
      - '**'

jobs:
  trigger-visual-qa:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger OmniSight Webhook
        env:
          WEBHOOK_URL: ${{ secrets.OMNISIGHT_WEBHOOK_URL }}
        run: |
          curl -X POST "$WEBHOOK_URL/webhook/build-event" \
            -H "Content-Type: application/json" \
            -d '{
              "repo": "${{ github.repository }}",
              "branch": "${{ github.ref_name }}",
              "commit_sha": "${{ github.sha }}"
            }'
```

### How to configure the webhook secret:
1. Navigate to your repository on GitHub: **Settings ➔ Secrets and variables ➔ Actions**.
2. Click **New repository secret**.
3. Set the name to: `OMNISIGHT_WEBHOOK_URL`.
4. Set the value:
   - **For Local Development**: Use an [ngrok](https://ngrok.com/) tunnel URL pointing to `ml-service` port 8000:
     ```bash
     ngrok http 8000
     # Set secret value to: https://abc1234.ngrok-free.app
     ```
   - **For Production / Deployed Setup**: Use your deployed `ml-service` base URL (e.g. `https://ml.omnisight.yourdomain.com`).

---

## 🔑 What to put in your `.env` files

You can copy `.env.example` in the root (or in each subfolder) to `.env`. For an exhaustive guide, please see [`SETUP.md`](SETUP.md). Here is what each key does:

| Environment Variable | Where to get it | What it's used for |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) | Powers multimodal vision inspection (`gemini-2.5-flash`) |
| `GROQ_API_KEY` | [Groq Cloud Console](https://console.groq.com/keys) | Powers ultra-fast PR summarization (`llama-3.1-8b-instant`) |
| `GITHUB_TOKEN` | [GitHub Settings ➔ Personal Access Tokens](https://github.com/settings/tokens) | Creates fix branches and opens automated Pull Requests |
| `GITHUB_REPO` | Your repository (e.g. `your-username/OmniSight`) | Target repository where Pull Requests will be opened |
| `JWT_SECRET` | Any random 32+ character string | Signs secure login tokens for QA managers and viewers |
| `INTERNAL_API_KEY` | Any random 32+ character string | Authenticates internal communication between FastAPI & Express |
| `MONGO_URI` | `mongodb://localhost:27017/omnisight` (or Atlas URI) | Database storing build runs, fix cycles, and user accounts |
| `REDIS_URL` | `redis://localhost:6379/0` | Cache and message broker for background job queues |

> 💡 **Offline Mode Supported:** If you run tests without API keys configured, OmniSight automatically enables deterministic offline fallbacks so you can test all flows without getting blocked.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Harsh-Yadav029/OmniSight.git
cd OmniSight

# 2. Configure environment
cp .env.example .env

# 3. Launch all services
docker-compose up --build
```

- **QA Review Dashboard**: [http://localhost:5174](http://localhost:5174)
- **TinyCart Store Under Test**: [http://localhost:5173](http://localhost:5173)
- **Express Backend API**: [http://localhost:5000](http://localhost:5000)
- **FastAPI ML Gateway**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Running Locally (Manual Terminals)

#### 1. Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

#### 2. ML & Vision Service (Terminal 2)
```bash
cd ml-service
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

#### 3. Test Target App — TinyCart (Terminal 3)
```bash
cd test-target-app
npm install
npm run dev
```

#### 4. QA Dashboard (Terminal 4)
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment to Production (Render & Vercel)

A full cloud deployment strategy uses **Render** for backend/ML and **Vercel** for the frontend and test-target app.
- See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the step-by-step cloud deployment guide.
- Check out `render.yaml` for Render Infrastructure-as-Code (IaC) setup.

---

## 🧪 Testing & Validation

### Run Full End-to-End Smoke Test
To test the entire autonomous pipeline (defect injection ➔ VLM detection ➔ LangGraph healing ➔ PR generation):

```bash
python scripts/smoke_test.py
```

### Run Service Unit & Integration Tests
```bash
# Test Node backend (Auth + Runs Models + Internal API)
cd backend && npm test

# Test Python ML service (20 unit & integration test suites)
cd ml-service && pytest tests/ -v
```

---

## 👤 Default QA Login Credentials

When opening the QA Review Dashboard at [http://localhost:5174](http://localhost:5174), you can sign in with:

- **QA Manager** (Full approval & merge access):
  - Email: `qa_manager@omnisight.dev`
  - Password: `password123`
- **Viewer** (Read-only access):
  - Email: `viewer@omnisight.dev`
  - Password: `password123`

---

## 📄 License
MIT License. Created with ❤️ for developers and QA engineers who care about pixel-perfect frontend experiences.
