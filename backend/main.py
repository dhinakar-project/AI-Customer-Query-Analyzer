from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes.chat import router as chat_router
from routes.analytics import router as analytics_router
from services.sentiment import _get_pipeline  # intentional: warm model on startup

app = FastAPI(title="AI Customer Query Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(analytics_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)

    # Warm up the HF model download/load once.
    print("Loading HuggingFace sentiment model (first run may take a while)...")
    _get_pipeline()
    print("Sentiment model loaded.")

    if not os.getenv("GOOGLE_API_KEY"):
        print("GOOGLE_API_KEY not set. Gemini calls will use a safe fallback responder/classifier.")
