# 🚀 OmniSight Deployment Guide (Render + Vercel)

This guide walks you through deploying the complete OmniSight platform:
- **Backend & ML Vision Engine** ➔ [Render](https://render.com)
- **Frontend QA Dashboard & TinyCart Store** ➔ [Vercel](https://vercel.com)
- **Database** ➔ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)

---

## 📋 Architecture Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL DEPLOYMENTS                     │
├───────────────────────────────┬─────────────────────────────┤
│  Frontend QA Dashboard        │  TinyCart (Target App)      │
│  Directory: frontend          │  Directory: test-target-app │
│  URL: https://...vercel.app   │  URL: https://...vercel.app │
└──────────────┬────────────────┴──────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      RENDER DEPLOYMENTS                     │
├───────────────────────────────┬─────────────────────────────┤
│  Node/Express API             │  FastAPI + Playwright (ML)  │
│  Directory: backend           │  Directory: ml-service      │
│  Environment: Node.js         │  Environment: Docker        │
│  URL: https://...onrender.com │  URL: https://...onrender.com
└───────────────────────────────┴─────────────────────────────┘
```

---

## Step 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New ➔ Web Service**.
2. Connect your GitHub repository (`Harsh-Yadav029/OmniSight`).
3. Configure the service:
   - **Name:** `omnisight-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** under the Environment tab:
   - `PORT`: `5000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_random_secret_string`
   - `INTERNAL_API_KEY`: `your_internal_shared_key`
   - `ML_SERVICE_URL`: *(Leave empty for now, fill in after Step 2)*
5. Click **Create Web Service**. Note your backend URL (e.g. `https://omnisight-backend.onrender.com`).

---

## Step 2: Deploy ML Service to Render (Docker)

1. In Render, click **New ➔ Web Service**.
2. Connect your GitHub repository (`Harsh-Yadav029/OmniSight`).
3. Configure the service:
   - **Name:** `omnisight-ml-service`
   - **Root Directory:** `ml-service`
   - **Environment:** `Docker` *(Uses `ml-service/Dockerfile` with Playwright pre-installed)*
4. Add **Environment Variables**:
   - `PORT`: `8000`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GROQ_API_KEY`: `your_groq_api_key`
   - `GITHUB_TOKEN`: `your_github_token`
   - `GITHUB_REPO`: `Harsh-Yadav029/OmniSight`
   - `INTERNAL_API_KEY`: *(Same key used in Backend)*
   - `BACKEND_URL`: `https://omnisight-backend.onrender.com` *(From Step 1)*
   - `TEST_TARGET_APP_URL`: *(Will fill after Step 3)*
   - `REDIS_URL`: `redis://...` *(or Upstash Redis URL)*
5. Click **Create Web Service**. Note your ML service URL (e.g. `https://omnisight-ml-service.onrender.com`).
6. Go back to `omnisight-backend` on Render and set `ML_SERVICE_URL=https://omnisight-ml-service.onrender.com`.

---

## Step 3: Deploy TinyCart (Test Target App) to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your repo.
2. Under **Project Name**, enter: `omnisight-tinycart`.
3. Under **Root Directory**, click Edit and select: `test-target-app`.
4. Framework Preset: `Vite`.
5. Click **Deploy**. Note your live URL (e.g. `https://omnisight-tinycart.vercel.app`).
6. Update `TEST_TARGET_APP_URL` on Render `omnisight-ml-service` to: `https://omnisight-tinycart.vercel.app`.

---

## Step 4: Deploy QA Review Dashboard to Vercel

1. In Vercel, click **Add New ➔ Project** and select your repo again.
2. Under **Project Name**, enter: `omnisight-dashboard`.
3. Under **Root Directory**, click Edit and select: `frontend`.
4. Framework Preset: `Vite`.
5. Under **Environment Variables**, add:
   - `VITE_BACKEND_URL`: `https://omnisight-backend.onrender.com`
6. Click **Deploy**. Note your live URL (e.g. `https://omnisight-dashboard.vercel.app`).

---

## Step 5: (Optional) Connect GitHub Actions Trigger

Now that your ML service is deployed on Render:
1. In your GitHub repo: **Settings ➔ Secrets and variables ➔ Actions**.
2. Set `OMNISIGHT_WEBHOOK_URL` to: `https://omnisight-ml-service.onrender.com`.

Every commit to any branch will now automatically trigger full visual QA in the cloud!
