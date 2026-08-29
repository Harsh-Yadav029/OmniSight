# OmniSight — Setup & Environment Configuration Guide

This file provides environment setup details for each service in OmniSight.

## Prerequisites
- Node.js 20+
- Python 3.11+
- Docker Desktop & Docker Compose
- MongoDB (Atlas cluster or local docker container)
- Redis (cloud or local docker container)
- API Keys:
  - Google Gemini API Key
  - Groq API Key
  - GitHub Fine-grained Personal Access Token (PAT)
  - Generated JWT Secret and Internal API Key

## Service Configuration (.env files)

### 1. `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/omnisight
JWT_SECRET=your_jwt_secret_64_bytes
INTERNAL_API_KEY=your_internal_api_key_32_bytes
```

### 2. `ml-service/.env`
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
GITHUB_REPO=your_github_username/tinycart
INTERNAL_API_KEY=your_internal_api_key_32_bytes
REDIS_URL=redis://localhost:6379/0
BACKEND_URL=http://localhost:5000
TEST_TARGET_APP_URL=http://localhost:5173
```

### 3. `frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 4. `test-target-app/.env`
```env
VITE_PORT=5173
```
