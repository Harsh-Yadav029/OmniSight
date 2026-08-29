import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OmniSight ML Service", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
