from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import QueryLog
from schemas import ChatRequest, ChatResponse, SentimentOut
from services.classifier import classify_query
from services.sentiment import analyze_sentiment
from services.responder import generate_response


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        category = await classify_query(req.message)
        sent = analyze_sentiment(req.message)
        response_payload = await generate_response(
            session_id=req.session_id,
            category=category,
            sentiment_label=sent["label"],
            message=req.message,
        )

        ts = datetime.now(timezone.utc).replace(tzinfo=None)

        row = QueryLog(
            session_id=req.session_id,
            user_message=req.message,
            category=category,
            sentiment_label=sent["label"],
            sentiment_score=float(sent["score"]),
            bot_response=str(response_payload["response"]),
            created_at=ts,
        )
        db.add(row)
        db.commit()

        return ChatResponse(
            response=str(response_payload["response"]),
            category=category,
            sentiment=SentimentOut(label=sent["label"], score=float(sent["score"])),
            session_id=req.session_id,
            timestamp=ts,
            generation_mode=str(response_payload["generation_mode"]),
            warning=response_payload["warning"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {e}") from e
